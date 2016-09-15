// <reference path="../../../typings/index.d.ts">
System.register(['@angular/platform-browser', '@angular/core', "@angular/router", '../services/authService'], function(exports_1, context_1) {
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
    var platform_browser_1, core_1, router_1, authService_1;
    var ViewPostComponent;
    return {
        setters:[
            function (platform_browser_1_1) {
                platform_browser_1 = platform_browser_1_1;
            },
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (router_1_1) {
                router_1 = router_1_1;
            },
            function (authService_1_1) {
                authService_1 = authService_1_1;
            }],
        execute: function() {
            ViewPostComponent = (function () {
                function ViewPostComponent(as, router, route, sanitizer) {
                    var _this = this;
                    this.as = as;
                    this.router = router;
                    this.route = route;
                    this.User = this.as.emptyUser();
                    this.User = this.as.getUser();
                    this.as.setActivePageTitle('View Post');
                    this.route.params.subscribe(function (params) {
                        _this.postid = params['postid'];
                        if (_this.postid) {
                            _this.as.loadPost(_this.postid).subscribe(function (post) {
                                _this.post = post;
                                _this.post['purl'] = sanitizer.bypassSecurityTrustResourceUrl(post.pdfLink);
                                _this.post['gurl'] = sanitizer.bypassSecurityTrustResourceUrl(post.gsheetLink);
                                setTimeout(function () {
                                    $('.linkify').linkify();
                                    $('.collapsible').collapsible({ accordion: false });
                                    $("img").addClass("responsive-img");
                                    if (_this.post['detail']) {
                                        $('#postDetails').html(_this.post['detail']);
                                    }
                                });
                            });
                        }
                    });
                }
                ViewPostComponent.prototype.returnMoment = function (timestamp) {
                    if (timestamp) {
                        return moment().to(timestamp);
                    }
                    else {
                        return '';
                    }
                };
                ViewPostComponent = __decorate([
                    core_1.Component({
                        selector: 'viewpost',
                        host: {
                            class: 'col s12'
                        },
                        styleUrls: ['components/viewpost/viewpost.css'],
                        templateUrl: 'components/viewpost/viewpost.html'
                    }), 
                    __metadata('design:paramtypes', [authService_1.authService, router_1.Router, router_1.ActivatedRoute, platform_browser_1.DomSanitizationService])
                ], ViewPostComponent);
                return ViewPostComponent;
            }());
            exports_1("ViewPostComponent", ViewPostComponent);
        }
    }
});
