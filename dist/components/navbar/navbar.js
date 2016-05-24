// <reference path="../../../typings/tsd.d.ts">
System.register(['@angular/core', '@angular/router-deprecated', '../services/authService'], function(exports_1, context_1) {
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
    var NavbarComponent;
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
            NavbarComponent = (function () {
                function NavbarComponent(as) {
                    this.as = as;
                    this.activePage = {
                        title: 'LATEST FEEDS'
                    };
                    this.userInfo = true;
                    this.feedInfo = false;
                    this.loginLoading = false;
                    this.registerLoading = false;
                    this.createFeedLoading = false;
                    this.User = this.as.getUser();
                    this.activePage = this.as.getActivePageTitle();
                }
                NavbarComponent.prototype.ngOnInit = function () {
                    $(".button-collapse").sideNav();
                    $('.modal-trigger').leanModal();
                };
                NavbarComponent.prototype.loginModal = function () {
                    $(".button-collapse").sideNav('hide');
                    $('#loginModal').openModal();
                };
                NavbarComponent.prototype.login = function (email, password) {
                    var _this = this;
                    if (email.value == '' || password.value == '')
                        return;
                    this.loginLoading = true;
                    this.as.login(email.value, password.value).then(function (res) {
                        _this.User = _this.as.getUser();
                        email.value = '';
                        password.value = '';
                        console.log('User is Logged In!');
                        $('#errorLogin').html('');
                        $('#loginModal').closeModal();
                        _this.loginLoading = false;
                    }).catch(function (err) {
                        console.log("Login Failed!", err);
                        $('#errorLogin').html(err);
                        _this.loginLoading = false;
                    });
                };
                NavbarComponent.prototype.registerModal = function () {
                    $(".button-collapse").sideNav('hide');
                    $('#registerModal').openModal();
                };
                NavbarComponent.prototype.register = function (email, password) {
                    var _this = this;
                    if (email.value == '' || password.value == '')
                        return;
                    this.registerLoading = true;
                    this.as.register(email.value, password.value).then(function (res) {
                        email.value = '';
                        password.value = '';
                        console.log('User is Registered!');
                        $('#errorRegister').html('');
                        _this.registerLoading = false;
                        _this.registerUserUid = res.uid;
                        _this.toggleInfo('feed');
                        setTimeout(function () {
                            $('select').material_select();
                        });
                        $('#step1').removeClass('active-step');
                        $('#step1').addClass('step-done');
                        $('#step2').addClass('active-step');
                    }).catch(function (err) {
                        console.log("Register Failed!", err);
                        $('#errorRegister').html(err);
                        _this.registerLoading = false;
                    });
                };
                NavbarComponent.prototype.logout = function () {
                    this.as.logout();
                    console.log('User is Logged Out!');
                    $(".button-collapse").sideNav('hide');
                };
                NavbarComponent.prototype.toggleInfo = function (panel) {
                    if (panel == 'user') {
                        this.userInfo = true;
                        this.feedInfo = false;
                    }
                    else if (panel == 'feed') {
                        this.userInfo = false;
                        this.feedInfo = true;
                    }
                };
                NavbarComponent.prototype.createFeed = function (userid, name, description, category) {
                    var _this = this;
                    if (userid.value == '' || name.value == '' || description.value == '')
                        return;
                    this.createFeedLoading = true;
                    this.as.createFeed(userid.value, name.value, description.value, category.value, this.registerUserUid).then(function () {
                        userid.value = '';
                        name.value = '';
                        description.value = '';
                        category.value = '';
                        _this.toggleInfo('user');
                        $('#step1').addClass('active-step');
                        $('#step1').removeClass('step-done');
                        $('#step2').removeClass('active-step');
                        console.log('Feed is Registered!');
                        $('#errorFeed').html('');
                        $('#registerModal').closeModal();
                        $('#loginModal').openModal();
                        _this.createFeedLoading = false;
                    }).catch(function (err) {
                        console.log("Create Feed Failed!", err);
                        $('#errorFeed').html(err);
                        _this.createFeedLoading = false;
                    });
                };
                NavbarComponent = __decorate([
                    core_1.Component({
                        selector: 'navbar',
                        host: {},
                        styleUrls: ['components/navbar/navbar.css'],
                        templateUrl: 'components/navbar/navbar.html',
                        directives: [router_deprecated_1.RouterLink]
                    }), 
                    __metadata('design:paramtypes', [authService_1.authService])
                ], NavbarComponent);
                return NavbarComponent;
            }());
            exports_1("NavbarComponent", NavbarComponent);
        }
    }
});
