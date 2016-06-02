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
                    var _this = this;
                    this.editMode = true;
                    setTimeout(function () {
                        $('#bio').val(_this.profile['bio']);
                        $('#feedId').val(_this.profile['feedId']);
                        $('#feedName').val(_this.profile['feedName']);
                        $('#description').val(_this.profile['description']);
                        if (_this.profile['private'] === 'true') {
                            $('#pyes').prop('checked', true);
                        }
                        else {
                            $('#pno').prop('checked', true);
                        }
                        $('#category').val(_this.profile['category']);
                        $('select').material_select();
                    });
                };
                ProfileComponent.prototype.update = function (bio, feedId, feedName, description, pyes, pno, category) {
                    var _this = this;
                    var profile = {
                        'bio': bio.value,
                        'feedId': feedId.value,
                        'feedName': feedName.value,
                        'description': description.value,
                        'private': $(pyes).prop('checked') ? 'true' : 'false',
                        'category': category.value
                    };
                    this.as.updateUserProfile(this.userid, profile).then(function (res) {
                        var feed = {
                            'feedName': feedName.value,
                            'description': description.value,
                            'private': $(pyes).prop('checked') ? 'true' : 'false',
                            'category': category.value,
                            'timestamp': Firebase.ServerValue.TIMESTAMP,
                            'owner': {
                                'uid': _this.User.uid,
                                'userid': _this.userid
                            }
                        };
                        _this.as.updateFeed(feedId.value, feed).then(function (res) {
                            _this.editMode = false;
                            console.log('Profile and Feed Updated.');
                        }).catch(function (err) {
                            console.log(err);
                        });
                    }).catch(function (err) {
                        console.log(err);
                    });
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
