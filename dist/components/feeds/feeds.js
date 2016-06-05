// <reference path="../../../typings/tsd.d.ts">
System.register(['@angular/core', "@angular/router-deprecated", '../services/authService'], function(exports_1, context_1) {
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
    var core_1, router_deprecated_1, authService_1;
    var FeedsComponent;
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
            }],
        execute: function() {
            FeedsComponent = (function () {
                function FeedsComponent(as, router) {
                    this.as = as;
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
                    this.emailLoading = false;
                    this.User = this.as.getUser();
                    this.feeds = this.as.getFeeds();
                    this.as.setRoute('Feeds', null);
                    this.as.setActivePageTitle('LATEST FEEDS');
                }
                FeedsComponent.prototype.ngOnInit = function () {
                    $('.modal-trigger').leanModal();
                };
                FeedsComponent.prototype.loadPosts = function (feed) {
                    if (feed['private'] === 'true') {
                        $('#emailModel').openModal();
                    }
                    else {
                        this.router.navigate(['/Posts', { feedid: feed['$key'] }]);
                    }
                };
                FeedsComponent.prototype.checkEmail = function (email) {
                    this.emailLoading = true;
                    $('#errorEmail').html('');
                    $('#emailModel').closeModal();
                    this.emailLoading = false;
                };
                FeedsComponent.prototype.returnMoment = function (timestamp) {
                    if (timestamp) {
                        return moment().to(timestamp);
                    }
                    else {
                        return '';
                    }
                };
                FeedsComponent = __decorate([
                    core_1.Component({
                        selector: 'feeds',
                        host: {
                            class: 'col s10'
                        },
                        styleUrls: ['components/feeds/feeds.css'],
                        templateUrl: 'components/feeds/feeds.html',
                        directives: [router_deprecated_1.RouterLink]
                    }), 
                    __metadata('design:paramtypes', [authService_1.authService, router_deprecated_1.Router])
                ], FeedsComponent);
                return FeedsComponent;
            }());
            exports_1("FeedsComponent", FeedsComponent);
        }
    }
});
