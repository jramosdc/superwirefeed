// <reference path="../../../typings/tsd.d.ts">
System.register(['@angular/core'], function(exports_1, context_1) {
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
    var core_1;
    var authService;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            }],
        execute: function() {
            authService = (function () {
                function authService() {
                    var _this = this;
                    this.User = {
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
                    this.activePage = {
                        title: ''
                    };
                    this.Posts = [];
                    this.Feeds = [];
                    this.Categories = ['Marketing', 'News', 'Visuals', 'Data', 'Misc', 'All'];
                    this.ref = new Firebase("https://superwireapp.firebaseio.com");
                    this.domain = 'https://feed.superwire.io';
                    if (this.ref.getAuth()) {
                        this.User.uid = this.ref.getAuth().uid;
                        this.User.password.profileImageURL = this.ref.getAuth().password.profileImageURL;
                        this.User.password.email = this.ref.getAuth().password.email;
                        this.getUserFeedDetail(this.User.uid, function (feed) {
                            _this.User.feed.id = feed.id;
                            _this.User.feed.name = feed.name;
                            _this.User.feed.userid = feed.userid;
                        });
                    }
                    this.loadFeeds();
                }
                authService.prototype.getUserFeedDetail = function (uid, cb) {
                    this.ref.child('feeds').orderByChild('owner/uid').equalTo(uid).once('child_added', function (snaphot) {
                        cb({
                            id: snaphot.key(),
                            name: snaphot.val().name,
                            userid: snaphot.val().owner.userid
                        });
                    });
                };
                authService.prototype.getFeedName = function (userid, cb) {
                    this.ref.child('feeds').orderByChild('owner/userid').equalTo(userid).once('child_added', function (snaphot) {
                        cb(snaphot.val().name);
                    });
                };
                authService.prototype.loadFeeds = function () {
                    var _this = this;
                    this.ref.child('feeds').on('child_added', function (snaphot) {
                        var feed = snaphot.val();
                        feed._id = snaphot.key();
                        _this.Feeds.push(feed);
                    });
                };
                authService.prototype.filterFeeds = function (category) {
                    var _this = this;
                    this.ref.child('feeds').orderByChild('category').equalTo(category).on('child_added', function (snaphot) {
                        var feed = snaphot.val();
                        feed._id = snaphot.key();
                        _this.Feeds.push(feed);
                    });
                };
                authService.prototype.loadPosts = function (userid) {
                    var _this = this;
                    this.Posts.splice(0);
                    this.ref.child('posts').orderByChild('owner/userid').equalTo(userid).on('child_added', function (snaphot) {
                        var post = snaphot.val();
                        post._id = snaphot.key();
                        _this.Posts.push(post);
                    });
                    this.getFeedName(userid, function (feedName) {
                        _this.setActivePageTitle(feedName);
                    });
                };
                authService.prototype.filterPosts = function (category) {
                    var _this = this;
                    this.ref.child('posts').orderByChild('owner/userid').equalTo(this.activeUserID).on('child_added', function (snaphot) {
                        var post = snaphot.val();
                        post._id = snaphot.key();
                        if (post.category === category) {
                            _this.Posts.push(post);
                        }
                    });
                };
                authService.prototype.setRoute = function (route, userid) {
                    this.activeRoute = route;
                    this.activeUserID = userid;
                };
                authService.prototype.selectCategory = function (category) {
                    if (this.activeRoute === 'Feeds') {
                        this.Feeds.splice(0);
                        if (category == 'All') {
                            this.loadFeeds();
                        }
                        else {
                            this.filterFeeds(category);
                        }
                    }
                    else if (this.activeRoute === 'Posts') {
                        this.Posts.splice(0);
                        if (category == 'All') {
                            this.loadPosts(this.activeUserID);
                        }
                        else {
                            this.filterPosts(category);
                        }
                    }
                };
                authService.prototype.setActivePageTitle = function (title) {
                    this.activePage.title = title;
                };
                authService.prototype.getActivePageTitle = function () {
                    return this.activePage;
                };
                authService.prototype.getDomain = function () {
                    return this.domain;
                };
                authService.prototype.getCategories = function () {
                    return this.Categories;
                };
                authService.prototype.getFeeds = function () {
                    return this.Feeds;
                };
                authService.prototype.getPost = function (postid, cb) {
                    this.ref.child('posts').orderByKey().equalTo(postid).once('value', function (snaphot) {
                        var post = snaphot.val()[postid];
                        post._id = postid;
                        cb(post);
                    });
                };
                authService.prototype.getPosts = function () {
                    return this.Posts;
                };
                authService.prototype.getUser = function () {
                    return this.User;
                };
                authService.prototype.login = function (email, password, cb) {
                    var _this = this;
                    this.ref.authWithPassword({
                        email: email,
                        password: password
                    }, function (error, authData) {
                        if (error) {
                            cb(error);
                        }
                        else {
                            _this.User.uid = authData.uid;
                            _this.User.password.profileImageURL = authData.password.profileImageURL;
                            _this.User.password.email = authData.password.email;
                            _this.getUserFeedDetail(_this.User.uid, function (feed) {
                                _this.User.feed.id = feed.id;
                                _this.User.feed.name = feed.name;
                                _this.User.feed.userid = feed.userid;
                            });
                            cb();
                        }
                    });
                };
                authService.prototype.register = function (email, password, cb) {
                    this.ref.createUser({
                        email: email,
                        password: password
                    }, function (error, authData) {
                        if (error) {
                            cb(error);
                        }
                        else {
                            cb(null, authData.uid);
                        }
                    });
                };
                authService.prototype.createFeed = function (userid, name, description, category, registerUser, cb) {
                    this.ref.child('feeds').push({
                        name: name,
                        description: description,
                        category: category,
                        owner: {
                            uid: registerUser,
                            userid: userid
                        },
                        timestamp: Firebase.ServerValue.TIMESTAMP
                    }, function (error) {
                        if (error) {
                            cb(error);
                        }
                        else {
                            cb();
                        }
                    });
                };
                authService.prototype.submitPost = function (title, detail, priority, types, category, cb) {
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
                    }, function (error) {
                        if (error) {
                            cb(error);
                        }
                        else {
                            cb();
                        }
                    });
                };
                authService.prototype.updatePost = function (postid, title, detail, priority, types, category, cb) {
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
                    }, function (error) {
                        if (error) {
                            cb(error);
                        }
                        else {
                            cb();
                        }
                    });
                };
                authService.prototype.voteUp = function (userid) {
                    var _this = this;
                    this.ref.child('feeds').orderByChild('owner/userid').equalTo(userid).once('child_added', function (snaphot) {
                        var vote = snaphot.val() ? snaphot.val().likes ? snaphot.val().likes : '' : '';
                        if (vote) {
                            _this.ref.child('feeds').child(snaphot.key()).update({ 'likes': vote + 1 }, function (err) {
                                err ? console.log('err', err) : '';
                            });
                        }
                        else {
                            _this.ref.child('feeds').child(snaphot.key()).update({ 'likes': 1 }, function (err) {
                                err ? console.log('err', err) : '';
                            });
                        }
                    });
                };
                authService.prototype.voteDown = function (userid) {
                    var _this = this;
                    this.ref.child('feeds').orderByChild('owner/userid').equalTo(userid).once('child_added', function (snaphot) {
                        var vote = snaphot.val() ? snaphot.val().likes ? snaphot.val().likes : '' : '';
                        console.log(vote);
                        if (vote) {
                            _this.ref.child('feeds').child(snaphot.key()).update({ 'likes': vote - 1 }, function (err) {
                                err ? console.log('err', err) : '';
                            });
                        }
                        else {
                            _this.ref.child('feeds').child(snaphot.key()).update({ 'likes': 0 }, function (err) {
                                err ? console.log('err', err) : '';
                            });
                        }
                    });
                };
                authService.prototype.deletePost = function (postid) {
                    var _this = this;
                    this.ref.child('posts').child(postid).remove(function () {
                        _this.Posts.forEach(function (val, indx) {
                            if (val._id === postid) {
                                _this.Posts.splice(indx, 1);
                            }
                        });
                    });
                };
                authService.prototype.logout = function (cb) {
                    var _this = this;
                    this.ref.unauth(function (error) {
                        if (error) {
                            cb(error);
                        }
                        else {
                            cb();
                            _this.User.uid = '';
                            _this.User.password.profileImageURL = '';
                            _this.User.password.email = '';
                        }
                    });
                };
                authService = __decorate([
                    core_1.Injectable(), 
                    __metadata('design:paramtypes', [])
                ], authService);
                return authService;
            }());
            exports_1("authService", authService);
        }
    }
});
