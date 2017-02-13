import { Injectable } from '@angular/core';
import { AngularFire, FirebaseListObservable, FirebaseAuthState } from 'angularfire2';
import { Observable, Subject } from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/take';
import { httpService } from './httpService';
import {BehaviorSubject} from "rxjs/BehaviorSubject";

export {
	FirebaseListObservable
}

export interface User { 
	uid: string, 
	emailVerified: boolean, 
	password: { 
		email: string, 
		profileImageURL: string 
	}, 
	feed: { 
		id: string, 
		name: string, 
		userid: string 
	}, 
	backgroundImageURL: string 
}


@Injectable()
export class authService {

	// ref: Firebase = new firebase("https://superwireapp.firebaseio.com");
	domain: string = 'https://feed.superwire.io';
	// api: string = 'https://feed-superwire.herokuapp.com';
	api: string = 'https://arcane-spire-82869.herokuapp.com';
	// api: string = ' http://localhost:3000';
	User: User;
	user$: BehaviorSubject<any>;
	activePage: Object = { title: '' };
	activeFeed: Object = {
		id: null
	};
	Feeds: FirebaseListObservable<any[]>;
	Posts: FirebaseListObservable<any[]>;
	Categories: Array<string> = ['Marketing', 'News', 'Visuals', 'Data', 'Misc', 'All'];
	postCategories: Array<string> = [];
	storageRef = firebase.storage().ref('/');
	private mainRef = firebase.database().ref('/');

	constructor(private af: AngularFire, private http: httpService) {
		this.user$ = new BehaviorSubject<any>(this.emptyUser());
		this.User = this.emptyUser();
		this.authSubscribe();
		this.loadFeeds();
	}

	authSubscribe() {
		let once = true;
		this.af.auth.subscribe(authState => {
			if (authState) {
				if (once) {
					this.User.uid = authState.uid;
					this.User.emailVerified = authState.auth.emailVerified;
					// this.User.password.profileImageURL = res.auth['photoURL']
					this.User.password.email = authState.auth['email'];
					this.getUserFeedDetail(this.User.uid).subscribe(feed => {
						this.User.password.profileImageURL = feed[0] ? feed[0]['profileImageURL'] : authState.auth['photoURL'];
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
					}); // getUserFeedDetail
					this.user$.next(this.User);
				} // once
			} else { // if authState true
				this.User.uid = '';
				this.User.emailVerified = false;
				this.User.password.profileImageURL = '';
				this.User.password.email = '';
				this.User.feed.id = '';
				this.User.feed.name = '';
				this.User.feed.userid = '';
				this.User.backgroundImageURL = '';
				this.user$.next(this.emptyUser());
			}
		}); // auth subscribe
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
		this.authSubscribe();
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

	recover(email: string) {
		return firebase.auth().sendPasswordResetEmail(email);
	}

	logout() {
		this.af.auth.logout();
		setTimeout(() => {
			this.authSubscribe();
		}, 200)
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
			profileImageURL: this.User.password.profileImageURL,
			useBackgroundImage: true
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

	uploadPostImg(base64: string, str = null) {
		return new Promise((resolve, reject) => {
			let postImgTask;
			if (str) {
				postImgTask = this.storageRef.child('img').child('posts').child(str).put(this.base64ToBlob(base64));
			} else {
				postImgTask = this.storageRef.child('img').child('posts').child(this.randomStringGenerator(6)).put(this.base64ToBlob(base64));
			}
			postImgTask.on('state_changed', null, function (err) {
				reject(err);
			}, function () {
				resolve(postImgTask.snapshot.downloadURL);
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
	getFileId(image: Object){
		return this.af.database.list('/images').push(image);
	}
	submitPost(post: Object) {
		return this.af.database.list('/posts').push(post);
	}
	setPost(postid: string, post: Object){
		return this.af.database.object('/posts/' + postid).set(post);
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
	deleteFile(path: string) {
		return new Promise((resolve, reject) => {
			this.storageRef.child(path).delete()
				.then(()=> {
					resolve('File Deleted Successfully');
				})
				.catch((error) => {
					reject(error);
				})
		});
	}
	deletePost(postid: string) {
		return this.af.database.object('/posts/' + postid).remove();
	}
	deletePostData(postid: string, key: string, keyid: string){
		return this.af.database.object('/posts/' + postid + '/' + key + '/' + keyid).remove();
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
				});
			}).subscribe(res => {
				this.af.database.object('/feeds/' + feedid).remove().then(res => {
					this.af.database.object('/users/' + userid).remove().then(res => {
						// this.af.auth.subscribe(authState => {
						firebase.auth().currentUser.delete().then(function () {
							resolve();
						}).catch(error => {
							console.log("error in deleting user", error);
							reject(error);
						});
						// authState.auth.delete().then(() => {
						// console.log('deleted!')
						// this.af.auth.logout();
						// }).catch(e => console.error(e));
						// });
						// return this.af.auth.remove(this.af.auth);
					}).catch(reject);
				}).catch(reject);
			})
		})
	}

	buyPost(userid: string, postid: string){
		return this.af.database.object('/user-assets/' + userid + '/' + postid).set(true);
	}
	getUserAsset(userid: string, postid: string){
		return this.af.database.object('/user-assets/' + userid + '/' + postid);
	}
	
	toggleFollowSystem(myid, followingObj, followerId, followersObj) {
		let multipath = {};

		let setFollowingSys = () => {
			multipath['/user-following/' + myid + '/' + followerId] = followersObj[myid];
			multipath['/user-followers/' + followerId + '/' + myid] = followingObj[followerId];
			console.log('multipath: ', multipath);
			this.mainRef.update(multipath).then(() => {
				console.log('update multipath');
			}).catch(err => {
				err ? console.log('err', err) : '';
			});
		}; // setFollowingSys

		let removeFollowingSys = () => {
			multipath['/user-following/' + myid + '/' + followerId] = null;
			multipath['/user-followers/' + followerId + '/' + myid] = null;
			this.mainRef.update(multipath).then(() => {
				console.log('remove multipath');
			}).catch(err => {
				err ? console.log('err', err) : '';
			});
		}; // removeFollowingSys

		this.mainRef.child('/user-following/' + myid + '/' + followerId).once('value', (following) => {
			console.log('mainRef: ', following.val());
			if (following.val()) {
				removeFollowingSys();
			} else {
				setFollowingSys();
			}
		});
	} // toggleFollowSystem

	getFollowers(id) {
		return this.af.database.list('/user-followers/' + id)
			.map((followers) => {
				return followers.map((follower) => {
					follower = this.af.database.object('/users/' + follower['$key']);
					return follower;
				});
			});
	}

	getFollowing(id) {
		return this.af.database.list('/user-following/' + id)
			.map((following) => {
				return following.map((follow) => {
					follow = this.af.database.object('/users/' + follow['$key']);
					return follow;
				});
			});
	}

	getFollowingFeedsPosts(postId) {
		return this.af.database.object('/feeds/' + postId)
			.switchMap(feed => {
				return this.af.database.list('/user-following/' + feed['owner']['userid'])
					.map((following) => {
						return following.map((follow) => {
							return this.af.database.list('/posts', {
								query: {
									orderByChild: 'owner/userid',
									equalTo: follow['$key']
								}
							})
						})
					});
			})
			.mergeMap(arrayOfObservable => {
				return arrayOfObservable.map(obj => {
					return obj;
				});
			}).mergeMap((aRRayObsr: any) => {
				return aRRayObsr.map(aRray => {
					return aRray;
				});
			}).switchMap((aRRay: any) => {
				return aRRay.map(obj => {
					return obj;
				})
			}); // .do(x => ('end: ', x));

		// return this.af.database.list('/user-following/' + userId)
		// 	.map((following) => {
		// 		return following.map((follow) => {
		// 			return this.af.database.list('/posts', {
		// 				query: {
		// 					orderByChild: 'owner/userid',
		// 					equalTo: follow['$key']
		// 				}
		// 			})
		// 		})
		// 	});
	}

	randomStringGenerator(len: number) {
		let text = "";
		let possible = "ABCDEF-GHIJ-KLMNOPQR_STUV-WXYZ#abcdefghijklmnopqrstuv$wxyz012345-6789_";

		for (var i = 0; i < len; i++)
			text += possible.charAt(Math.floor(Math.random() * possible.length));

		return text;
	}

	//charge
	ccCharge(amount, token) {
		return new Promise((resolve, reject) => {
			let obj = { amount, token };
			this.http.addJSON(`${this.api}/api/cc/charge`, obj, (res) => {
				if (res.success) {
					resolve(res.data);
				} else {
					reject(res.error);
				}
			});
		}); // promise
	}
	download(post){
		console.log('post', post);
		return new Promise((resolve, reject) => {
			this.http.addJSON(`${this.api}/api/download`, post, (res) => {
				console.log('res', res);
			})
		})
	}

}
