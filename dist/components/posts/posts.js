// <reference path="../../../typings/index.d.ts">
System.register(['@angular/core', "@angular/common", '@angular/router', '../services/authService', '../directives/clip', "../pipes/orderby", '../pipes/searchPostTitle', '../pipes/searchCategory'], function(exports_1, context_1) {
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
    var core_1, common_1, router_1, authService_1, clip_1, orderby_1, searchPostTitle_1, searchCategory_1;
    var PostsComponent;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (common_1_1) {
                common_1 = common_1_1;
            },
            function (router_1_1) {
                router_1 = router_1_1;
            },
            function (authService_1_1) {
                authService_1 = authService_1_1;
            },
            function (clip_1_1) {
                clip_1 = clip_1_1;
            },
            function (orderby_1_1) {
                orderby_1 = orderby_1_1;
            },
            function (searchPostTitle_1_1) {
                searchPostTitle_1 = searchPostTitle_1_1;
            },
            function (searchCategory_1_1) {
                searchCategory_1 = searchCategory_1_1;
            }],
        execute: function() {
            PostsComponent = (function () {
                function PostsComponent(as, route, router) {
                    var _this = this;
                    this.as = as;
                    this.route = route;
                    this.router = router;
                    this.categories = [];
                    this.emailLoading = false;
                    this.Domain = this.as.getDomain();
                    this.User = this.as.emptyUser();
                    this.User = this.as.getUser();
                    this.route.params.subscribe(function (params) {
                        _this.FeedID = params['feedid'];
                    });
                }
                PostsComponent.prototype.ngOnInit = function () {
                    var _this = this;
                    this.as.getFeedNameByFeedID(this.FeedID).subscribe(function (feed) {
                        _this.as.setActivePageTitle(feed.feedName);
                        _this.categories.splice(0);
                        _this.categories.push('All');
                        if (feed['postCategories']) {
                            feed['postCategories'].forEach(function (val) {
                                _this.categories.push(val);
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
                    $('ul.tabs').tabs();
                };
                PostsComponent.prototype.navigate = function (type, id) {
                    if (type === 'new') {
                        this.router.navigate(['\newpost']);
                        this.as.setActiveFeedID(this.FeedID);
                    }
                    else if (type === 'edit') {
                        this.router.navigate(['\editpost', id]);
                        this.as.setActiveFeedID(this.FeedID);
                    }
                    else if (type === 'view') {
                        this.router.navigate(['\post', id]);
                        this.as.setActiveFeedID(this.FeedID);
                    }
                };
                PostsComponent.prototype.checkEmail = function (email) {
                    var _this = this;
                    this.emailLoading = true;
                    this.as.checkEmail(this.FeedID, email).subscribe(function (res) {
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
                PostsComponent.prototype.closeEmail = function () {
                    $('#errorEmail').html('');
                    $('#emailModel').closeModal();
                    this.router.navigate(['/feeds']);
                };
                PostsComponent.prototype.deleteModel = function (postid) {
                    this.deletePostID = postid;
                    $('#deleteModel').openModal();
                };
                PostsComponent.prototype.deletePost = function () {
                    this.as.deletePost(this.deletePostID).then(function (res) {
                        console.log('Post Deleted!');
                    });
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
                        directives: [router_1.ROUTER_DIRECTIVES, clip_1.ClipboardDirective],
                        pipes: [searchPostTitle_1.SearchPostTitlePipe, common_1.DatePipe, orderby_1.OrderBy, searchCategory_1.SearchCategory]
                    }), 
                    __metadata('design:paramtypes', [authService_1.authService, router_1.ActivatedRoute, router_1.Router])
                ], PostsComponent);
                return PostsComponent;
            }());
            exports_1("PostsComponent", PostsComponent);
        }
    }
});
