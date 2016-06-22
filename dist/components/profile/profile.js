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
    var ProfileComponent;
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
            ProfileComponent = (function () {
                function ProfileComponent(as, params, router) {
                    var _this = this;
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
                    this.editMode = false;
                    this.profileLoading = false;
                    this.authList = [];
                    this.authNew = [];
                    this.postCategoryList = [];
                    this.postCategoryNew = [];
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
                    $(window).scroll(function () {
                        var space = $(window).innerHeight() - $('.fab').offsetTop + $('.fab').offsetHeight;
                        if (space < 200) {
                            $('.fab').css('margin-bottom', '150px');
                        }
                    });
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
                        if (_this.profile['authEmail']) {
                            _this.profile['authEmail'].forEach(function (val) {
                                _this.authList.push(val);
                            });
                        }
                        if (_this.profile['postCategories']) {
                            _this.profile['postCategories'].forEach(function (val) {
                                _this.postCategoryList.push(val);
                            });
                        }
                    });
                };
                ProfileComponent.prototype.update = function (bio, feedId, feedName, description, pyes, pno, category) {
                    var _this = this;
                    if (bio.value === '' || feedId.value === '' || feedName.value === '' || description.value === '' || category.value === '')
                        return;
                    this.profileLoading = true;
                    $.merge(this.authList, this.authNew);
                    this.authNew.splice(0);
                    $.merge(this.postCategoryList, this.postCategoryNew);
                    this.postCategoryNew.splice(0);
                    var profile = {
                        'bio': bio.value,
                        'feedId': feedId.value.toLowerCase(),
                        'feedName': feedName.value,
                        'description': description.value,
                        'private': $(pyes).prop('checked') ? 'true' : 'false',
                        'category': category.value,
                        'authEmail': this.authList,
                        'postCategories': this.postCategoryList
                    };
                    this.as.updateUserProfile(this.userid, profile).then(function (res) {
                        var feed = {
                            'feedName': feedName.value,
                            'description': description.value,
                            'private': $(pyes).prop('checked') ? 'true' : 'false',
                            'category': category.value,
                            'authEmail': _this.authList,
                            'postCategories': _this.postCategoryList,
                            'timestamp': Firebase.ServerValue.TIMESTAMP,
                            'owner': {
                                'uid': _this.User.uid,
                                'userid': _this.userid
                            }
                        };
                        _this.as.updateFeed(feedId.value.toLowerCase(), feed).then(function (res) {
                            _this.editMode = false;
                            _this.profileLoading = false;
                            $('#errorProfile').html('');
                            _this.authList.splice(0);
                            _this.postCategoryList.splice(0);
                            console.log('Profile and Feed Updated.');
                        }).catch(function (err) {
                            console.log('Feed Update Failed!', err);
                            $('#errorProfile').html(err);
                        });
                    }).catch(function (err) {
                        console.log('Profile Update Failed!', err);
                        $('#errorProfile').html(err);
                    });
                };
                ProfileComponent.prototype.confirmDelete = function () {
                    $('#confirmDeleteModel').openModal();
                };
                ProfileComponent.prototype.delete = function (answer) {
                    var _this = this;
                    this.deleteLoading = true;
                    if (answer === 'yes') {
                        this.as.deleteAll(this.profile['feedId'], this.userid, this.User.uid).subscribe(function (res) {
                            console.log('User, Profile and Feed Deleted!');
                            $('#errorDelete').html('');
                            $('#confirmDeleteModel').closeModal();
                            _this.deleteLoading = false;
                            _this.router.navigate(['/Feeds']);
                        });
                    }
                    else {
                        $('#errorDelete').html('');
                        $('#confirmDeleteModel').closeModal();
                        this.deleteLoading = false;
                    }
                };
                ProfileComponent.prototype.addAuthEmail = function (email) {
                    this.authNew.push(email.value);
                    email.value = '';
                };
                ProfileComponent.prototype.addPostCategory = function (postCategory) {
                    if (postCategory.value === '')
                        return;
                    if ((this.postCategoryList.length + this.postCategoryNew.length) < 4) {
                        this.postCategoryNew.push(postCategory.value);
                        postCategory.value = '';
                    }
                    else {
                        $('#errorPostCategory').html('Not Allow more then four!');
                    }
                };
                ProfileComponent.prototype.removePostCategory = function (type, category) {
                    if (type === 'new') {
                        this.postCategoryNew = $.grep(this.postCategoryNew, function (val) {
                            return val != category;
                        });
                    }
                    else if (type === 'list') {
                        this.postCategoryList = $.grep(this.postCategoryList, function (val) {
                            return val != category;
                        });
                    }
                };
                ProfileComponent = __decorate([
                    core_1.Component({
                        selector: 'profile',
                        host: {
                            class: 'col s12'
                        },
                        styleUrls: ['components/profile/profile.css'],
                        templateUrl: 'components/profile/profile.html',
                        directives: []
                    }), 
                    __metadata('design:paramtypes', [authService_1.authService, router_deprecated_1.RouteParams, router_deprecated_1.Router])
                ], ProfileComponent);
                return ProfileComponent;
            }());
            exports_1("ProfileComponent", ProfileComponent);
        }
    }
});
