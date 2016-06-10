// <reference path="../../../typings/tsd.d.ts">
System.register(['@angular/core', '@angular/router-deprecated', '../services/authService', './clip', "@angular/common", "./orderby"], function(exports_1, context_1) {
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
    var core_1, router_deprecated_1, authService_1, clip_1, common_1, orderby_1;
    var SearchPostTitlePipe, PostsComponent;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (router_deprecated_1_1) {
                router_deprecated_1 = router_deprecated_1_1;
            },
            function (authService_1_1) {
                authService_1 = authService_1_1;
            },
            function (clip_1_1) {
                clip_1 = clip_1_1;
            },
            function (common_1_1) {
                common_1 = common_1_1;
            },
            function (orderby_1_1) {
                orderby_1 = orderby_1_1;
            }],
        execute: function() {
            SearchPostTitlePipe = (function () {
                function SearchPostTitlePipe() {
                }
                SearchPostTitlePipe.prototype.transform = function (values, args) {
                    var filter = args;
                    return filter ? values.filter(function (value) { return value.title.toLocaleLowerCase().indexOf(filter) != -1; }) : values;
                };
                SearchPostTitlePipe = __decorate([
                    core_1.Pipe({
                        name: 'searchPostTitle'
                    }), 
                    __metadata('design:paramtypes', [])
                ], SearchPostTitlePipe);
                return SearchPostTitlePipe;
            }());
            PostsComponent = (function () {
                function PostsComponent(as, params, router) {
                    this.as = as;
                    this.params = params;
                    this.router = router;
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
                    this.categories = ['ALL'];
                    this.emailLoading = false;
                    this.Domain = this.as.getDomain();
                    this.User = this.as.getUser();
                    this.FeedID = this.params.get('feedid');
                    this.as.setRoute('Posts', this.FeedID);
                }
                PostsComponent.prototype.ngOnInit = function () {
                    var _this = this;
                    this.as.getFeedNameByFeedID(this.FeedID).subscribe(function (feed) {
                        _this.as.setActivePageTitle(feed.feedName);
                        if (feed['postCategories']) {
                            feed['postCategories'].forEach(function (val) {
                                _this.categories.push(val.toUpperCase());
                            });
                        }
                        if (feed.private === 'true' && feed.owner.uid !== _this.User.uid) {
                            if (sessionStorage['email']) {
                                _this.checkEmail(sessionStorage['email']);
                            }
                            else {
                                $('#emailModel').openModal({ dismissible: false });
                            }
                        }
                        else {
                            _this.posts = _this.as.loadPosts(_this.FeedID);
                        }
                    });
                };
                PostsComponent.prototype.checkEmail = function (email) {
                    var _this = this;
                    this.emailLoading = true;
                    this.as.checkEmail(this.FeedID, email.value).subscribe(function (res) {
                        if (res.length > 0) {
                            _this.posts = _this.as.loadPosts(_this.FeedID);
                            sessionStorage['email'] = email;
                            $('#emailModel').closeModal();
                            $('#errorEmail').html('');
                            _this.emailLoading = false;
                        }
                        else {
                            $('#errorEmail').html('Not a vaild Email!');
                            _this.emailLoading = false;
                        }
                    });
                };
                PostsComponent.prototype.deleteModel = function (postid) {
                    this.deletePostID = postid;
                    $('#deleteModel').openModal();
                };
                PostsComponent.prototype.deletePost = function () {
                    this.as.deletePost(this.deletePostID);
                };
                PostsComponent.prototype.voteUp = function () {
                    this.as.voteUp(this.FeedID);
                };
                PostsComponent.prototype.voteDown = function () {
                    this.as.voteDown(this.FeedID);
                };
                PostsComponent.prototype.returnMoment = function (timestamp) {
                    if (timestamp) {
                        return moment().to(timestamp);
                    }
                    else {
                        return '';
                    }
                };
                PostsComponent = __decorate([
                    core_1.Component({
                        selector: 'posts',
                        host: {
                            class: 'col s12'
                        },
                        styleUrls: ['components/posts/posts.css'],
                        templateUrl: 'components/posts/posts.html',
                        directives: [router_deprecated_1.RouterLink, clip_1.ClipboardDirective],
                        pipes: [SearchPostTitlePipe, common_1.DatePipe, orderby_1.OrderBy]
                    }), 
                    __metadata('design:paramtypes', [authService_1.authService, router_deprecated_1.RouteParams, router_deprecated_1.Router])
                ], PostsComponent);
                return PostsComponent;
            }());
            exports_1("PostsComponent", PostsComponent);
        }
    }
});
