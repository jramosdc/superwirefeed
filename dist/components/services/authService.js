// <reference path="../../../typings/tsd.d.ts">
System.register(['@angular/core', 'angularfire2'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = (this && this.__metadata) || function (k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var core_1, angularfire2_1;
    var authService;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (angularfire2_1_1) {
                angularfire2_1 = angularfire2_1_1;
            }],
        execute: function() {
            authService = (function () {
                function authService(af) {
                    var _this = this;
                    this.af = af;
                    // ref: Firebase = new firebase("https://superwireapp.firebaseio.com");
                    this.domain = 'https://feed.superwire.io';
                    this.activePage = { title: '' };
                    this.activeFeed = {
                        id: null
                    };
                    this.Categories = ['Marketing', 'News', 'Visuals', 'Data', 'Misc', 'All'];
                    this.postCategories = [];
                    this.User = this.emptyUser();
                    this.af.auth.subscribe(function (res) {
                        if (res) {
                            _this.User.uid = res.uid;
                            _this.User.password.profileImageURL = res.auth['photoURL'];
                            _this.User.password.email = res.auth['email'];
                            _this.getUserFeedDetail(_this.User.uid).subscribe(function (feed) {
                                _this.User.feed.id = feed[0] ? feed[0]['feedId'] : '';
                                _this.User.feed.name = feed[0] ? feed[0]['feedName'] : '';
                                _this.User.feed.userid = feed[0] ? feed[0]['$key'] : '';
                                if (feed[0] && feed[0]['postCategories']) {
                                    _this.postCategories.splice(0);
                                    feed[0]['postCategories'].forEach(function (val) {
                                        _this.postCategories.push(val);
                                    });
                                }
                            });
                        }
                        else {
                            _this.User.uid = '';
                            _this.User.password.profileImageURL = '';
                            _this.User.password.email = '';
                            _this.User.feed.id = '';
                            _this.User.feed.name = '';
                            _this.User.feed.userid = '';
                        }
                    });
                    this.loadFeeds();
                }
                authService.prototype.emptyUser = function () {
                    return {
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
                    };
                };
                authService.prototype.getUserFeedDetail = function (uid) {
                    return this.af.database.list('/users', {
                        query: {
                            orderByChild: 'uid',
                            equalTo: uid
                        }
                    });
                };
                authService.prototype.getFeedNameByFeedID = function (feedid) {
                    return this.af.database.object('/feeds/' + feedid);
                };
                authService.prototype.getDomain = function () {
                    return this.domain;
                };
                authService.prototype.getUser = function () {
                    return this.User;
                };
                authService.prototype.getFeeds = function () {
                    return this.Feeds;
                };
                authService.prototype.getCategories = function () {
                    return this.Categories;
                };
                authService.prototype.getPostCategories = function () {
                    return this.postCategories;
                };
                authService.prototype.getActivePageTitle = function () {
                    return this.activePage;
                };
                authService.prototype.setActivePageTitle = function (title) {
                    this.activePage['title'] = title;
                };
                authService.prototype.setActiveFeedID = function (feedid) {
                    this.activeFeed['id'] = feedid;
                };
                authService.prototype.getActiveFeed = function () {
                    return this.activeFeed;
                };
                authService.prototype.loadFeeds = function () {
                    this.Feeds = this.af.database.list('/feeds');
                };
                authService.prototype.checkEmail = function (feedid, email) {
                    return this.af.database.object('/feeds/' + feedid + '/authEmail').map(function (emails) {
                        return emails.filter(function (eMail) {
                            return eMail === email;
                        });
                    });
                };
                authService.prototype.loadPosts = function (feedid) {
                    return this.af.database.list('/posts', {
                        query: {
                            orderByChild: 'owner/feedid',
                            equalTo: feedid
                        }
                    });
                };
                authService.prototype.loadPost = function (postid) {
                    return this.af.database.object('/posts/' + postid);
                };
                authService.prototype.login = function (email, password) {
                    return this.af.auth.login({
                        email: email,
                        password: password
                    });
                };
                authService.prototype.logout = function () {
                    this.af.auth.logout();
                };
                authService.prototype.register = function (email, password) {
                    return this.af.auth.createUser({
                        email: email,
                        password: password
                    });
                };
                authService.prototype.createUserProfile = function (uid, userid, email) {
                    return this.af.database.object('/users/' + userid).set({
                        uid: uid,
                        email: email,
                        profileImageURL: this.User.password.profileImageURL
                    });
                };
                authService.prototype.getUserProfile = function (userid) {
                    return this.af.database.object('/users/' + userid);
                };
                authService.prototype.updateUserProfile = function (userid, profile) {
                    return this.af.database.object('/users/' + userid).update(profile);
                };
                authService.prototype.updateFeed = function (userid, feed) {
                    return this.af.database.object('/feeds/' + userid).update(feed);
                };
                authService.prototype.submitPost = function (post) {
                    return this.af.database.list('/posts').push(post);
                };
                authService.prototype.updatePost = function (postid, post) {
                    return this.af.database.object('/posts/' + postid).update(post);
                };
                authService.prototype.voteUp = function (feedid) {
                    var _this = this;
                    this.af.database.object('/feeds/' + feedid + '/likes').take(1).subscribe(function (snapshot) {
                        var vote = snapshot.$value ? snapshot.$value : '';
                        if (vote) {
                            _this.af.database.object('/feeds/' + feedid).update({ 'likes': vote + 1 }).catch(function (err) {
                                err ? console.log('err', err) : '';
                            });
                        }
                        else {
                            _this.af.database.object('/feeds/' + feedid).update({ 'likes': 1 }).catch(function (err) {
                                err ? console.log('err', err) : '';
                            });
                        }
                    });
                };
                authService.prototype.voteDown = function (feedid) {
                    var _this = this;
                    this.af.database.object('/feeds/' + feedid + '/likes').take(1).subscribe(function (snapshot) {
                        var vote = snapshot.$value ? snapshot.$value : '';
                        if (vote) {
                            _this.af.database.object('/feeds/' + feedid).update({ 'likes': vote - 1 }).catch(function (err) {
                                err ? console.log('err', err) : '';
                            });
                        }
                        else {
                            _this.af.database.object('/feeds/' + feedid).update({ 'likes': 0 }).catch(function (err) {
                                err ? console.log('err', err) : '';
                            });
                        }
                    });
                };
                authService.prototype.deletePost = function (postid) {
                    return this.af.database.object('/posts/' + postid).remove();
                };
                authService.prototype.deleteAll = function (feedid, userid, uid) {
                    var _this = this;
                    return this.af.database.list('/posts', {
                        query: {
                            orderByChild: 'owner/userid',
                            equalTo: userid
                        }
                    }).map(function (res) {
                        return _this.af.object('/feeds/' + feedid).remove().then(function (res) {
                            return _this.af.object('/users/' + userid).remove().then(function (res) {
                                // return this.af.auth.remove(this.af.auth); 
                            });
                        });
                    });
                };
                authService = __decorate([
                    core_1.Injectable(), 
                    __metadata('design:paramtypes', [angularfire2_1.AngularFire])
                ], authService);
                return authService;
            }());
            exports_1("authService", authService);
        }
    }
});
