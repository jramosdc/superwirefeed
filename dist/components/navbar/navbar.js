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
                function NavbarComponent(as, router) {
                    this.as = as;
                    this.router = router;
                    this.loginLoading = false;
                    this.registerLoading = false;
                    this.User = this.as.getUser();
                    this.activePage = this.as.getActivePageTitle();
                }
                NavbarComponent.prototype.ngOnInit = function () {
                    $(".button-collapse").sideNav();
                    $('.modal-trigger').leanModal();
                    // $('select').material_select();
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
                NavbarComponent.prototype.register = function (userid, email, password) {
                    var _this = this;
                    if (userid.value == '' || email.value == '' || password.value == '')
                        return;
                    this.registerLoading = true;
                    this.as.register(email.value.toLowerCase(), password.value).then(function (res) {
                        _this.as.login(email.value.toLowerCase(), password.value).then(function (res) {
                            _this.as.createUserProfile(res.uid, userid.value.toLowerCase(), email.value.toLowerCase()).then(function () {
                                console.log('Profile is Created!');
                                console.log('User is Registered & Logged In!');
                                _this.router.root.navigate(['/Profile', { userid: userid.value.toLowerCase() }]);
                                userid.value = '';
                                email.value = '';
                                password.value = '';
                                $('#errorRegister').html('');
                                $('#registerModal').closeModal();
                                _this.registerLoading = false;
                            }).catch(function (err) {
                                console.log('Profile Creation Failed!', err);
                            });
                        }).catch(function (err) {
                            console.log("Login Failed after Registration!", err);
                            $('#errorRegister').html(err);
                            _this.registerLoading = false;
                        });
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
                NavbarComponent = __decorate([
                    core_1.Component({
                        selector: 'navbar',
                        host: {},
                        styleUrls: ['components/navbar/navbar.css'],
                        templateUrl: 'components/navbar/navbar.html',
                        directives: [router_deprecated_1.RouterLink]
                    }), 
                    __metadata('design:paramtypes', [authService_1.authService, router_deprecated_1.Router])
                ], NavbarComponent);
                return NavbarComponent;
            }());
            exports_1("NavbarComponent", NavbarComponent);
        }
    }
});
