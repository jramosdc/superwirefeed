// <reference path="../../../typings/tsd.d.ts">

import { Injectable } from '@angular/core';
import { AngularFire, FirebaseListObservable, FirebaseAuthState } from 'angularfire2';
import { Subject } from 'rxjs/Subject';

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
		title: 'LATEST FEEDS'
	};
	
	activeRoute: string
	activeUserID: string

    Feeds: FirebaseListObservable<any[]>

    categorySubject = new Subject();
    
	Categories = ['Marketing','News','Visuals','Data','Misc','All']

	ref: Firebase = new Firebase("https://superwireapp.firebaseio.com");
	domain : string = 'https://feed.superwire.io'

    constructor(private af: AngularFire) {
        this.af.auth.subscribe((res: FirebaseAuthState) => {
            if (res) {
                this.User.uid = res.uid;
                this.User.password.profileImageURL = res.password['profileImageURL']
                this.User.password.email = res.password['email'];
                this.getUserFeedDetail(this.User.uid).subscribe((feed) => {
                    this.User.feed.id = feed[0] ? feed[0]['$key'] : '';
                    this.User.feed.name = feed[0] ? feed[0]['name'] : '';
                    this.User.feed.userid = feed[0] ? feed[0]['owner']['userid'] : '';
                });
            } else {
                this.User.uid = '';
				this.User.password.profileImageURL = '';
                this.User.password.email = '';
                this.User.feed.id = '';
                this.User.feed.name = '';
                this.User.feed.userid = '';
            }
        })
		this.loadFeeds();
	}
	
    getUserFeedDetail(uid: string) {
        return this.af.database.list('/feeds', {
            query: {
                orderByChild: 'owner/uid',
                equalTo: uid
            }
        })
	}

    getFeedName(userid: string) {
        return this.af.database.list('/feeds', {
            query: {
                orderByChild: 'owner/userid',
                equalTo: userid
            }
        })
	}

	getFeedNameByFeedID(feedid: string) {
        return this.af.database.object('/feeds/' + feedid)
	}

    loadFeeds() {
        this.Feeds = this.af.database.list('/feeds');
	}

    filterFeeds(category) {
        this.Feeds = this.af.database.list('/feeds', {
            query: {
                orderByChild: 'category',
                equalTo: category
            }
        })
	}

	checkEmail(feedid: string, email: string) {
		return this.af.database.object('/feeds/' + feedid + '/authEmail').map(emails => {
			return emails.filter(eMail => {
				return eMail === email;
			})
		})
	}

    loadPosts(feedid: string) {
        this.getFeedNameByFeedID(feedid).subscribe((feed) => {
            this.setActivePageTitle(feed['feedName']);
        });
        return this.af.database.list('/posts', {
            query: {
                orderByChild: 'owner/feedid',
                equalTo: feedid
            }
        })
    }
    
    loadPost(postid: string) {
        return this.af.database.object('/posts/' + postid);
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
            // this.Feeds.splice(0);
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

    getPost(postid: string) {
        return this.af.database.list('/posts', {
            query: {
                orderByKey: true,
                equalTo: postid
            }
        });
	}

	getUser() {
		return this.User;
	}

    login(email: string, password: string) {
        return this.af.auth.login({
            email: email,
            password: password
        });
	}

    register(email: string, password: string) {
        return this.af.auth.createUser({
			email: email,
			password: password
		});
    }

    createUserProfile(uid: string, userid: string, email: string) {
        return this.af.database.object('/users/' + userid).set({
            uid: uid,
            email: email,
			profileImageURL: this.User.password.profileImageURL
        })
    }

	updateUserProfile(userid: string, profile: Object) {
        return this.af.database.object('/users/' + userid).update(profile);
	}

    getUserProfile(userid: string) {
        return this.af.database.object('/users/' + userid)
    }

    updateFeed(userid: string, feed: Object) {
        return this.af.database.object('/feeds/' + userid).update(feed);
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
				userid: this.User.feed.userid,
				feedid: this.User.feed.id
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
				userid: this.User.feed.userid,
				feedid: this.User.feed.id
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

	voteUp(feedid: string) {
		this.ref.child('feeds').child(feedid).once('value', (snaphot) => {
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

	voteDown(feedid: string) {
		this.ref.child('feeds').child(feedid).once('value', (snaphot) => {
            let vote = snaphot.val() ? snaphot.val().likes ? snaphot.val().likes : '' : '';
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
			// this.Posts.forEach((val, indx) => {
			// 	if (val._id === postid) {
			// 		this.Posts.splice(indx, 1);
			// 	}
			// });
		});
	}

	deleteAll(feedid: string, userid: string, uid: string) {
		return this.af.database.list('/posts', {
			query: {
				orderByChild: 'owner/userid',
				equalTo: userid
			}
		}).map(res => {
			return this.af.object('/feeds/' + feedid).remove().then(res => {
				return this.af.object('/users/' + userid).remove().then(res => {
					// return this.af.auth.remove(this.af.auth); 
				 })
			});
		})
	}

    logout() {
        this.af.auth.logout();
	}
}
