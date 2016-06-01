// <reference path="../../../typings/tsd.d.ts">
System.register(['@angular/core', "@angular/router-deprecated", '@angular/common', '../services/authService', '../services/controlMessagesServices'], function(exports_1, context_1) {
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
    var core_1, router_deprecated_1, common_1, authService_1, controlMessagesServices_1;
    var ProfileComponent;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (router_deprecated_1_1) {
                router_deprecated_1 = router_deprecated_1_1;
            },
            function (common_1_1) {
                common_1 = common_1_1;
            },
            function (authService_1_1) {
                authService_1 = authService_1_1;
            },
            function (controlMessagesServices_1_1) {
                controlMessagesServices_1 = controlMessagesServices_1_1;
            }],
        execute: function() {
            ProfileComponent = (function () {
                function ProfileComponent(as, router, params, _formBuilder) {
                    var _this = this;
                    this.as = as;
                    this.router = router;
                    this.params = params;
                    this._formBuilder = _formBuilder;
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
                    this.editMode = false;
                    this.User = this.as.getUser();
                    this.as.setRoute('Profile', null);
                    this.as.setActivePageTitle('Profile');
                    this.domain = this.as.getDomain();
                    this.userid = this.params.get('userid');
                    if (this.userid) {
                        this.as.getUserProfile(this.userid).subscribe(function (profile) {
                            _this.profile = profile;
                        });
                    }
                }
                ProfileComponent.prototype.ngOnInit = function () {
                };
                ProfileComponent.prototype.edit = function () {
                    this.editMode = true;
                    this.profileForm = this._formBuilder.group({
                        'bio': [this.profile['bio'], common_1.Validators.required],
                        'feedId': [this.profile['feedId'], common_1.Validators.required],
                        'feedName': [this.profile['feedName'], common_1.Validators.required],
                        'description': [this.profile['description'], common_1.Validators.required],
                        // 'private': [this.profile['private'], Validators.required],
                        'category': [this.profile['category'], common_1.Validators.required]
                    });
                    setTimeout(function () {
                        $('select').material_select();
                    });
                };
                ProfileComponent.prototype.update = function () {
                    console.log(this.profileForm.error);
                    console.log(this.profile);
                    this.as.updateUserProfile(this.userid, this.profileForm.value); /*.then((res) => {
                        console.log(res);
                        this.editMode = false;
                    }).catch((err) => {
                        console.log(err);
                    })*/
                };
                ProfileComponent = __decorate([
                    core_1.Component({
                        selector: 'profile',
                        host: {
                            class: 'col s10'
                        },
                        styleUrls: ['components/profile/profile.css'],
                        templateUrl: 'components/profile/profile.html',
                        directives: [router_deprecated_1.RouterLink, controlMessagesServices_1.ControlMessages]
                    }), 
                    __metadata('design:paramtypes', [authService_1.authService, router_deprecated_1.Router, router_deprecated_1.RouteParams, common_1.FormBuilder])
                ], ProfileComponent);
                return ProfileComponent;
            }());
            exports_1("ProfileComponent", ProfileComponent);
        }
    }
});
