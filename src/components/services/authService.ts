// <reference path="../../../typings/tsd.d.ts">

import {Injectable} from '@angular/core';

export interface User { password: { email: string, profileImageURL: string }, uid: string, feed: { id: string, name: string, userid: string } }

@Injectable()
export class authService {

	User: User = {
		password: {
			email: '',
			profileImageURL: ''
		},
		uid: '',
		feed: {
			id: '',
			name: '',
			userid: ''
		}
	}

	activePage = {
		title: ''
	};
	
	activeRoute: string
	activeUserID: string

	Posts = []
	Feeds = []
	Categories = ['Marketing','News','Visuals','Data','Misc','All']

	ref: Firebase = new Firebase("https://superwireapp.firebaseio.com");
	domain : string = 'https://feed.superwire.io'

	constructor() {
		if (this.ref.getAuth()) {
			this.User.uid = this.ref.getAuth().uid;
			this.User.password.profileImageURL = this.ref.getAuth().password.profileImageURL;
			this.User.password.email = this.ref.getAuth().password.email;
			this.getUserFeedDetail(this.User.uid, (feed) => {
				this.User.feed.id = feed.id;
				this.User.feed.name = feed.name;
				this.User.feed.userid = feed.userid;
			});
		}
		this.loadFeeds();
		
	}
	
	getUserFeedDetail(uid: string, cb: Function) {
		this.ref.child('feeds').orderByChild('owner/uid').equalTo(uid).once('child_added', (snaphot) => {
			cb({
				id: snaphot.key(),
				name: snaphot.val().name,
				userid: snaphot.val().owner.userid
			});
		})
	}

	getFeedName(userid: string, cb: Function) {
		this.ref.child('feeds').orderByChild('owner/userid').equalTo(userid).once('child_added', (snaphot) => {
			cb(snaphot.val().name);
		})
	}

	loadFeeds() {
		this.ref.child('feeds').on('child_added', (snaphot) => {
			let feed = snaphot.val();
			feed._id = snaphot.key();
			this.Feeds.push(feed);
		});
	}

	filterFeeds(category) {
		this.ref.child('feeds').orderByChild('category').equalTo(category).on('child_added', (snaphot) => {
			let feed = snaphot.val();
			feed._id = snaphot.key();
			this.Feeds.push(feed);
		});
	}

	loadPosts(userid: string) {
		this.Posts.splice(0);
		this.ref.child('posts').orderByChild('owner/userid').equalTo(userid).on('child_added', (snaphot) => {
			let post = snaphot.val();
			post._id = snaphot.key();
			this.Posts.push(post);
		});
		this.getFeedName(userid, (feedName) => {
			this.setActivePageTitle(feedName);
		})
	}

	filterPosts(category) {
		this.ref.child('posts').orderByChild('owner/userid').equalTo(this.activeUserID).on('child_added', (snaphot) => {
			let post = snaphot.val();
			post._id = snaphot.key();
			if (post.category === category) {
				this.Posts.push(post);
			}			
		});
	}

	setRoute(route: string, userid) {
		this.activeRoute = route;
		this.activeUserID = userid;
	}

	selectCategory(category: string) {
		if (this.activeRoute === 'Feeds') {
			this.Feeds.splice(0);
			if (category == 'All') {
				this.loadFeeds();
			} else {
				this.filterFeeds(category);
			}
		} else if (this.activeRoute === 'Posts') {
			this.Posts.splice(0);
			if (category == 'All') {
				this.loadPosts(this.activeUserID);
			} else {
				this.filterPosts(category);
			}
		}
	}

	setActivePageTitle(title) {
		this.activePage.title = title;
	}	

	getActivePageTitle() {
		return this.activePage;
	}	

	getDomain() {
		return this.domain;
	} 

	getCategories() {
		return this.Categories;
	}

	getFeeds() {
		return this.Feeds;
	}

	getPost(postid: string, cb: Function) {
		this.ref.child('posts').orderByKey().equalTo(postid).once('value', (snaphot) => {
			let post = snaphot.val()[postid];
			post._id = postid;
			cb(post);
		});
	}

	getPosts() {
		return this.Posts;
	}

	getUser() {
		return this.User;
	}

	login(email, password, cb) {
		this.ref.authWithPassword({
			email: email,
			password: password
		}, (error, authData) => {
			if (error) {
				cb(error);
			} else {
				this.User.uid = authData.uid;
				this.User.password.profileImageURL = authData.password.profileImageURL;
				this.User.password.email = authData.password.email;
                this.getUserFeedDetail(this.User.uid, (feed) => {
                    this.User.feed.id = feed.id;
                    this.User.feed.name = feed.name;
                    this.User.feed.userid = feed.userid;
                });
				cb();
			}
		});
	}

	register(email, password, cb) {
		this.ref.createUser({
			email: email,
			password: password
		}, (error, authData) => {
			if (error) {
				cb(error);
			} else {
				cb(null, authData.uid);
			}
		});
	}

	createFeed(userid: string, name: string, description: string, category: string, registerUser: string, cb: Function) {
		this.ref.child('feeds').push({
			name: name,
			description: description,
			category: category,
			owner: {
				uid: registerUser,
				userid: userid
			},
			timestamp: Firebase.ServerValue.TIMESTAMP
		}, (error) => {
			if (error) {
				cb(error);
			} else {
				cb();
			}
		});
	}

	submitPost(title: string, detail: string, priority: string, types: Array<string>, category: string, cb: Function) {
		this.ref.child('posts').push({
			title: title,
			detail: detail,
			priority: priority,
			types: types,
			category: category,
			owner: {
				uid: this.User.uid,
				userid: this.User.feed.userid
			},
			timestamp: Firebase.ServerValue.TIMESTAMP
		}, (error) => {
			if (error) {
				cb(error);
			} else {
				cb();
			}
		});
	}

	updatePost(postid:string, title: string, detail: string, priority: string, types: Array<string>, category: string, cb: Function) {
		this.ref.child('posts').child(postid).update({
			title: title,
			detail: detail,
			priority: priority,
			types: types,
			category: category,
			owner: {
				uid: this.User.uid,
				userid: this.User.feed.userid
			},
			timestamp: Firebase.ServerValue.TIMESTAMP
		}, (error) => {
			if (error) {
				cb(error);
			} else {
				cb();
			}
		});
	}

	voteUp(userid: string) {
		this.ref.child('feeds').orderByChild('owner/userid').equalTo(userid).once('child_added', (snaphot) => {
            let vote = snaphot.val() ? snaphot.val().likes ? snaphot.val().likes : '' : '';
			if (vote) {
				this.ref.child('feeds').child(snaphot.key()).update({ 'likes': vote + 1 }, (err) => {
					err ? console.log('err', err) : '';
				}) 
			} else {
				this.ref.child('feeds').child(snaphot.key()).update({ 'likes': 1 }, (err) => {
					err ? console.log('err', err) : '';
				})
			}
		})
	}

	voteDown(userid: string) {
		this.ref.child('feeds').orderByChild('owner/userid').equalTo(userid).once('child_added', (snaphot) => {
            let vote = snaphot.val() ? snaphot.val().likes ? snaphot.val().likes : '' : '';
                        console.log(vote);
			if (vote) {
				this.ref.child('feeds').child(snaphot.key()).update({ 'likes': vote - 1 }, (err) => {
					err ? console.log('err', err) : '';
				}) 
			} else {
				this.ref.child('feeds').child(snaphot.key()).update({ 'likes': 0 }, (err) => {
					err ? console.log('err', err) : '';
				})
			}
		})
	}

	deletePost(postid: string) {
		this.ref.child('posts').child(postid).remove(() => {
			this.Posts.forEach((val, indx) => {
				if (val._id === postid) {
					this.Posts.splice(indx, 1);
				}
			});
		});
	}

	logout(cb) {
		this.ref.unauth((error) => {
			if (error) {
				cb(error);
			} else {
				cb();
				this.User.uid = '';
				this.User.password.profileImageURL = '';
				this.User.password.email = '';
			}
		});
	}
}
