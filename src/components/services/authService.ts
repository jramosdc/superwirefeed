// <reference path="../../../typings/index.d.ts">

import { Injectable } from '@angular/core';
import { AngularFire, FirebaseListObservable, FirebaseAuthState } from 'angularfire2';
import { Subject } from 'rxjs/Subject';

export interface User { uid: string, emailVerified: boolean, password: { email: string, profileImageURL: string }, feed: { id: string, name: string, userid: string }, backgroundImageURL: string }


@Injectable()
export class authService {

	// ref: Firebase = new firebase("https://superwireapp.firebaseio.com");
	domain: string = 'https://feed.superwire.io'
	User: User;
	activePage: Object = { title: '' };
	activeFeed: Object = {
		id: null
	};
	Feeds: FirebaseListObservable<any[]>;
	Posts: FirebaseListObservable<any[]>;
	Categories: Array<string> = ['Marketing', 'News', 'Visuals', 'Data', 'Misc', 'All'];
	postCategories: Array<string> = [];
	storageRef = firebase.storage().ref('/');

	constructor(private af: AngularFire) {
		this.User = this.emptyUser();
		this.af.auth.subscribe((res: FirebaseAuthState) => {
			if (res) {
				this.User.uid = res.uid;
				this.User.emailVerified = res.auth.emailVerified;
				// this.User.password.profileImageURL = res.auth['photoURL']
				this.User.password.email = res.auth['email'];
				this.getUserFeedDetail(this.User.uid).subscribe(feed => {
					this.User.password.profileImageURL = feed[0] ? feed[0]['profileImageURL'] : res.auth['photoURL'];
					this.User.feed.id = feed[0] ? feed[0]['feedId'] : '';
					this.User.feed.name = feed[0] ? feed[0]['feedName'] : '';
					this.User.feed.userid = feed[0] ? feed[0]['$key'] : '';
					this.User.backgroundImageURL = feed[0] ? feed[0]['backgroundImageURL'] : '';
					if (feed[0] && feed[0]['postCategories']) {
						this.postCategories.splice(0);
						feed[0]['postCategories'].forEach(val => {
							this.postCategories.push(val);
						});
					}
				});
			} else {
				this.User.uid = '';
				this.User.emailVerified = false;
				this.User.password.profileImageURL = '';
				this.User.password.email = '';
				this.User.feed.id = '';
				this.User.feed.name = '';
				this.User.feed.userid = '';
				this.User.backgroundImageURL = '';
			}
		})
		this.loadFeeds();
	}

	emptyUser() {
		return {
			uid: '',
			emailVerified: false,
			password: {
				email: '',
				profileImageURL: ''
			},
			feed: {
				id: '',
				name: '',
				userid: ''
			},
			backgroundImageURL: ''
		}
	}

	getUserFeedDetail(uid: string) {
		return this.af.database.list('/users', {
			query: {
				orderByChild: 'uid',
				equalTo: uid
			}
		})
	}

	getFeedNameByFeedID(feedid: string) {
		return this.af.database.object('/feeds/' + feedid)
	}

	getDomain() {
		return this.domain;
	}

	getUser() {
		return this.User;
	}

	getFeeds() {
		return this.Feeds;
	}

	getCategories() {
		return this.Categories;
	}

	getPostCategories() {
		return this.postCategories;
	}

	getActivePageTitle() {
		return this.activePage;
	}

	setActivePageTitle(title) {
		this.activePage['title'] = title;
	}

	setActiveFeedID(feedid: string) {
		this.activeFeed['id'] = feedid;
	}

	getActiveFeed() {
		return this.activeFeed;
	}

	loadFeeds() {
		this.Feeds = <FirebaseListObservable<any[]>>this.af.database.list('/feeds')
			.map(feeds => {
				// this.feeds2.next(feeds);
				return feeds.map(feed => {
					feed['posts'] = this.af.database.list('/posts', {
						query: {
							orderByChild: 'owner/feedid',
							equalTo: feed['$key']
						}
					});
					return feed;
				});
			});
	}

	checkEmail(feedid: string, email: string) {
		return this.af.database.object('/feeds/' + feedid + '/authEmail').map(emails => {
			return emails.filter(eMail => {
				return eMail === email;
			})
		})
	}

	loadPosts(feedid: string) {
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

	login(email: string, password: string) {
		return this.af.auth.login({
			email: email,
			password: password
		});
	}

	logout() {
		this.af.auth.logout();
	}

	register(email: string, password: string) {
		return this.af.auth.createUser({
			email: email,
			password: password
		});
	}

	private sendEmailOnce: boolean = true;
	sendEmailVerfication() {
		if (this.sendEmailOnce) {
			this.af.auth.subscribe(data => {
				if (data) {
					data.auth.sendEmailVerification();
					this.sendEmailOnce = false;
				}
			});
		}
	}

	createUserProfile(uid: string, userid: string, email: string) {
		return this.af.database.object('/users/' + userid).set({
			uid: uid,
			email: email,
			profileImageURL: this.User.password.profileImageURL
		})
	}

	getUserProfile(userid: string) {
		return this.af.database.object('/users/' + userid)
	}

	updateUserProfile(userid: string, profile: Object) {
		return this.af.database.object('/users/' + userid).update(profile);
	}

	uploadUserImg(userid: string, base64: string) {
		return new Promise((resolve, reject) => {
			var userProfileTask = this.storageRef.child('img').child('profile').child(userid).put(this.base64ToBlob(base64));
			userProfileTask.on('state_changed', null, function (err) {
				reject(err);
			}, function () {
				resolve(userProfileTask.snapshot.downloadURL);
			});
		});
	}

	base64ToBlob(base64: string): Blob {
		var blobBin = atob(base64.split(',')[1]);
		var array = [];
		for (var i = 0; i < blobBin.length; i++) {
			array.push(blobBin.charCodeAt(i));
		}
		return new Blob([new Uint8Array(array)], {
			type: 'image/png'
		});

	}

	updateFeed(userid: string, feed: Object) {
		return this.af.database.object('/feeds/' + userid).update(feed);
	}

	submitPost(post: Object) {
		return this.af.database.list('/posts').push(post);
	}

	updatePost(postid: string, post: Object) {
		return this.af.database.object('/posts/' + postid).update(post);
	}

	voteUp(feedid: string) {
		this.af.database.object('/feeds/' + feedid + '/likes').take(1).subscribe(snapshot => {
			let vote = snapshot.$value ? snapshot.$value : '';
			if (vote) {
				this.af.database.object('/feeds/' + feedid).update({ 'likes': vote + 1 }).catch(err => {
					err ? console.log('err', err) : '';
				});
			} else {
				this.af.database.object('/feeds/' + feedid).update({ 'likes': 1 }).catch(err => {
					err ? console.log('err', err) : '';
				});
			}
		});
	}

	voteDown(feedid: string) {
		this.af.database.object('/feeds/' + feedid + '/likes').take(1).subscribe(snapshot => {
			let vote = snapshot.$value ? snapshot.$value : '';
			if (vote) {
				this.af.database.object('/feeds/' + feedid).update({ 'likes': vote - 1 }).catch(err => {
					err ? console.log('err', err) : '';
				});
			} else {
				this.af.database.object('/feeds/' + feedid).update({ 'likes': 0 }).catch(err => {
					err ? console.log('err', err) : '';
				});
			}
		});
	}

	deletePost(postid: string) {
		return this.af.database.object('/posts/' + postid).remove();
	}

	deleteAll(feedid: string, userid: string, uid: string) {
		return new Promise((resolve, reject) => {
			this.af.database.list('/posts', {
				query: {
					orderByChild: 'owner/userid',
					equalTo: userid
				}
			}).map(posts => {
				return posts.map(post => {
					this.deletePost(post.$key).catch(reject);
				})
			}).subscribe(res => {
				this.af.database.object('/feeds/' + feedid).remove().then(res => {
					this.af.database.object('/users/' + userid).remove().then(res => {

						this.af.auth.subscribe(authState => {
							authState.auth.delete().then(() => {
								console.log('deleted!')
								// this.af.auth.logout();
								resolve();
							}).catch(e => console.error(e));
						});

						// return this.af.auth.remove(this.af.auth);
					}).catch(reject);
				}).catch(reject);
			})
		})
	}

}
