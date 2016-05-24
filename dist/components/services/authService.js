// <reference path="../../../typings/tsd.d.ts">
System.register(['@angular/core', 'angularfire2', 'rxjs/Subject'], function(exports_1, context_1) {
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
    var core_1, angularfire2_1, Subject_1;
    var authService;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (angularfire2_1_1) {
                angularfire2_1 = angularfire2_1_1;
            },
            function (Subject_1_1) {
                Subject_1 = Subject_1_1;
            }],
        execute: function() {
            authService = (function () {
                function authService(af) {
                    var _this = this;
                    this.af = af;
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
                    this.categorySubject = new Subject_1.Subject();
                    this.Categories = ['Marketing', 'News', 'Visuals', 'Data', 'Misc', 'All'];
                    this.ref = new Firebase("https://superwireapp.firebaseio.com");
                    this.domain = 'https://feed.superwire.io';
                    this.af.auth.subscribe(function (res) {
                        if (res) {
                            _this.User.uid = res.uid;
                            _this.User.password.profileImageURL = res.password['profileImageURL'];
                            _this.User.password.email = res.password['email'];
                            _this.getUserFeedDetail(_this.User.uid).subscribe(function (feed) {
                                _this.User.feed.id = feed[0]['$key'];
                                _this.User.feed.name = feed[0]['name'];
                                _this.User.feed.userid = feed[0]['owner']['userid'];
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
                authService.prototype.getUserFeedDetail = function (uid) {
                    return this.af.database.list('/feeds', {
                        query: {
                            orderByChild: 'owner/uid',
                            equalTo: uid
                        }
                    });
                };
                authService.prototype.getFeedName = function (userid) {
                    return this.af.database.list('/feeds', {
                        query: {
                            orderByChild: 'owner/userid',
                            equalTo: userid
                        }
                    });
                };
                authService.prototype.loadFeeds = function () {
                    this.Feeds = this.af.database.list('/feeds');
                };
                authService.prototype.filterFeeds = function (category) {
                    this.Feeds = this.af.database.list('/feeds', {
                        query: {
                            orderByChild: 'category',
                            equalTo: category
                        }
                    });
                };
                authService.prototype.loadPosts = function (userid) {
                    var _this = this;
                    this.getFeedName(userid).subscribe(function (feed) {
                        _this.setActivePageTitle(feed[0].name);
                    });
                    return this.af.database.list('/posts', {
                        query: {
                            orderByChild: 'owner/userid',
                            equalTo: userid
                        }
                    });
                };
                authService.prototype.loadPost = function (postid) {
                    return this.af.database.list('/posts', {
                        query: {
                            orderByKey: true,
                            equalTo: postid
                        }
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
                        // this.Feeds.splice(0);
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
                authService.prototype.getPost = function (postid) {
                    return this.af.database.list('/posts', {
                        query: {
                            orderByKey: true,
                            equalTo: postid
                        }
                    });
                };
                authService.prototype.getUser = function () {
                    return this.User;
                };
                authService.prototype.login = function (email, password) {
                    return this.af.auth.login({
                        email: email,
                        password: password
                    });
                };
                authService.prototype.register = function (email, password) {
                    return this.af.auth.createUser({
                        email: email,
                        password: password
                    });
                };
                authService.prototype.createFeed = function (userid, name, description, category, registerUser) {
                    return this.af.database.list('/feeds').push({
                        name: name,
                        description: description,
                        category: category,
                        owner: {
                            uid: registerUser,
                            userid: userid
                        },
                        timestamp: Firebase.ServerValue.TIMESTAMP
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
                authService.prototype.logout = function () {
                    this.af.auth.logout();
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
