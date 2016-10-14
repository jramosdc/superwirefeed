// <reference path="../../../typings/index.d.ts">
System.register(['@angular/core', "@angular/router", '../services/authService', 'ng2-img-cropper', '../tag-input/tag-input.component'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var __extends = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = (this && this.__metadata) || function (k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var core_1, router_1, authService_1, ng2_img_cropper_1, tag_input_component_1;
    var ProfileComponent;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (router_1_1) {
                router_1 = router_1_1;
            },
            function (authService_1_1) {
                authService_1 = authService_1_1;
            },
            function (ng2_img_cropper_1_1) {
                ng2_img_cropper_1 = ng2_img_cropper_1_1;
            },
            function (tag_input_component_1_1) {
                tag_input_component_1 = tag_input_component_1_1;
            }],
        execute: function() {
            ProfileComponent = (function (_super) {
                __extends(ProfileComponent, _super);
                function ProfileComponent(as, route, router) {
                    var _this = this;
                    _super.call(this);
                    this.as = as;
                    this.route = route;
                    this.router = router;
                    this.editMode = false;
                    this.profileLoading = false;
                    this.authList = [];
                    this.authNew = [];
                    this.postCategoryList = [];
                    this.postCategoryNew = [];
                    this.following = [];
                    this.followers = [];
                    // Cropper variables 
                    this.profileImgData = {};
                    this.backgroundImgData = {};
                    this.imageSelected = true;
                    this.imageUploading = false;
                    this.validEmailPattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                    this.User = this.as.emptyUser();
                    this.User = this.as.getUser();
                    this.as.setActivePageTitle('Profile');
                    this.domain = this.as.getDomain();
                    this.route.params.subscribe(function (params) {
                        _this.userid = params['userid'];
                        if (_this.userid) {
                            _this.as.getFollowers(_this.userid).subscribe(function (followers) { return _this.followers = followers; });
                            _this.as.getFollowing(_this.userid).subscribe(function (following) { return _this.following = following; });
                            _this.as.getUserProfile(_this.userid).subscribe(function (profile) {
                                _this.profile = profile;
                                if (profile['backgroundImageURL']) {
                                    setTimeout(function () {
                                        $('#bgImage').attr("style", 'width: 100%; height: 200px; background: url("' + profile['backgroundImageURL'] + '") center center no-repeat; background-size: cover;');
                                    }, 100);
                                }
                            });
                        }
                    });
                    // for angular2 Corpper (round)
                    this.cropperSettings_round = new ng2_img_cropper_1.CropperSettings();
                    this.cropperSettings_round.width = 200;
                    this.cropperSettings_round.height = 200;
                    this.cropperSettings_round.keepAspect = false;
                    this.cropperSettings_round.croppedWidth = 200;
                    this.cropperSettings_round.croppedHeight = 200;
                    this.cropperSettings_round.canvasWidth = 400;
                    this.cropperSettings_round.canvasHeight = 200;
                    this.cropperSettings_round.minWidth = 100;
                    this.cropperSettings_round.minHeight = 100;
                    this.cropperSettings_round.rounded = true;
                    this.cropperSettings_round.minWithRelativeToResolution = false;
                    this.cropperSettings_round.cropperDrawSettings.strokeColor = 'rgba(255,255,255,1)';
                    this.cropperSettings_round.cropperDrawSettings.strokeWidth = 1;
                    this.cropperSettings_round.noFileInput = true;
                    // for angular2 Corpper (rectangle)
                    this.cropperSettings_rectangle = new ng2_img_cropper_1.CropperSettings();
                    this.cropperSettings_rectangle.width = 400;
                    this.cropperSettings_rectangle.height = 200;
                    this.cropperSettings_rectangle.keepAspect = false;
                    this.cropperSettings_rectangle.croppedWidth = 400;
                    this.cropperSettings_rectangle.croppedHeight = 200;
                    this.cropperSettings_rectangle.canvasWidth = 400;
                    this.cropperSettings_rectangle.canvasHeight = 200;
                    this.cropperSettings_rectangle.minWidth = 200;
                    this.cropperSettings_rectangle.minHeight = 100;
                    this.cropperSettings_rectangle.rounded = false;
                    this.cropperSettings_rectangle.minWithRelativeToResolution = false;
                    this.cropperSettings_rectangle.cropperDrawSettings.strokeColor = 'rgba(255,255,255,1)';
                    this.cropperSettings_rectangle.cropperDrawSettings.strokeWidth = 1;
                    this.cropperSettings_rectangle.noFileInput = true;
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
                        $('#useBG').prop('checked', _this.profile['useBackgroundImage']);
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
                ProfileComponent.prototype.update = function (bio, feedId, feedName, description, pyes, pno, category, useBG) {
                    var _this = this;
                    if (bio.value === '' || feedId.value === '' || feedName.value === '' || description.value === '' || category.value === '')
                        return;
                    this.profileLoading = true;
                    // $.merge(this.authList, this.authNew)
                    this.authNew.splice(0);
                    // $.merge(this.postCategoryList, this.postCategoryNew)
                    this.postCategoryNew.splice(0);
                    var profile = {
                        'bio': bio.value,
                        'feedId': feedId.value.toLowerCase(),
                        'feedName': feedName.value,
                        'description': description.value,
                        'private': $(pyes).prop('checked') ? 'true' : 'false',
                        'category': category.value,
                        'authEmail': this.authList,
                        'postCategories': this.postCategoryList,
                        'profileImageURL': this.User.password.profileImageURL,
                        'backgroundImageURL': this.User.backgroundImageURL,
                        'useBackgroundImage': useBG.checked
                    };
                    this.as.updateUserProfile(this.userid, profile).then(function (res) {
                        var feed = {
                            'feedName': feedName.value,
                            'description': description.value,
                            'private': $(pyes).prop('checked') ? 'true' : 'false',
                            'category': category.value,
                            'authEmail': _this.authList,
                            'postCategories': _this.postCategoryList,
                            'timestamp': firebase.database['ServerValue'].TIMESTAMP,
                            'useBackgroundImage': useBG.checked,
                            'owner': {
                                'uid': _this.User.uid,
                                'userid': _this.userid,
                                'profileImageURL': _this.User.password.profileImageURL,
                                'backgroundImageURL': _this.User.backgroundImageURL
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
                            $('#errorProfile').html(err.toString());
                        });
                    }).catch(function (err) {
                        console.log('Profile Update Failed!', err);
                        $('#errorProfile').html(err.toString());
                    });
                };
                ProfileComponent.prototype.confirmDelete = function () {
                    $('#confirmDeleteModel').openModal();
                };
                ProfileComponent.prototype.delete = function (answer) {
                    var _this = this;
                    this.deleteLoading = true;
                    if (answer === 'yes') {
                        this.as.deleteAll(this.profile['feedId'], this.userid, this.User.uid).then(function (res) {
                            console.log('User, Profile and Feed Deleted!');
                            $('#errorDelete').html('');
                            $('#confirmDeleteModel').closeModal();
                            _this.deleteLoading = false;
                            _this.router.navigate(['/feeds']);
                        }).catch(function (err) {
                            console.log('Delete All Failed: ', err);
                            $('#errorDelete').html(err);
                            _this.deleteLoading = false;
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
                ProfileComponent.prototype.profileModelOpen = function () {
                    $('#profileModal').openModal();
                };
                ProfileComponent.prototype.profileModelClose = function () {
                    $('#profileModal').closeModal();
                    this.imageSelected = true;
                    this.profileImgData = {};
                };
                ProfileComponent.prototype.uploadProfileImage = function () {
                    var _this = this;
                    this.imageUploading = true;
                    this.as.uploadUserImg(this.User.feed.userid, this.profileImgData.image).then(function (url) {
                        _this.as.updateUserProfile(_this.User.feed.userid, { profileImageURL: url }).then(function (data) {
                            _this.as.updateFeed(_this.User.feed.id + '/owner', { profileImageURL: url }).then(function (d) {
                                _this.imageUploading = false;
                                _this.profileModelClose();
                            });
                        });
                    });
                };
                ProfileComponent.prototype.cropped = function (bounds) {
                    console.log(bounds);
                };
                /**
                 * Used to send image to second cropper @param $event
                */
                ProfileComponent.prototype.profileChangeListener = function ($event) {
                    var _this = this;
                    var image = new Image();
                    var file = $event.target.files[0];
                    var myReader = new FileReader();
                    myReader.onloadend = function (loadEvent) {
                        image.src = loadEvent.target.result;
                        _this.profileCropper.setImage(image);
                        //data2 image on select image
                        _this.profileImgData.image = loadEvent.target.result;
                    };
                    myReader.readAsDataURL(file);
                };
                ProfileComponent.prototype.backgroundChangeListener = function ($event) {
                    var _this = this;
                    console.log($event);
                    var image = new Image();
                    var file = $event.target.files[0];
                    var myReader = new FileReader();
                    myReader.onloadend = function (loadEvent) {
                        image.src = loadEvent.target.result;
                        _this.bgCropper.setImage(image);
                        //data2 image on select image
                        _this.backgroundImgData.image = loadEvent.target.result;
                    };
                    myReader.readAsDataURL(file);
                };
                ProfileComponent.prototype.tagInputEventCatch = function ($event) {
                    this.postCategoryList = $event;
                };
                ProfileComponent.prototype.emailInputEventCatch = function ($event) {
                    this.authList = $event;
                };
                ProfileComponent.prototype.backgroundImagePopup = function () {
                    $('#backgroundModal').openModal();
                    //  $('#bgInputFile').click();
                };
                ProfileComponent.prototype.backgroundModelClose = function () {
                    $('#backgroundModal').closeModal();
                    this.imageSelected = true;
                    this.backgroundImgData = {};
                };
                ProfileComponent.prototype.uploadBackgroundImage = function () {
                    var _this = this;
                    this.imageUploading = true;
                    this.as.uploadUserImg('bg-' + this.User.feed.userid, this.backgroundImgData.image).then(function (url) {
                        _this.as.updateUserProfile(_this.User.feed.userid, { backgroundImageURL: url }).then(function (data) {
                            _this.as.updateFeed(_this.User.feed.id + '/owner', { backgroundImageURL: url }).then(function (d) {
                                _this.imageUploading = false;
                                _this.backgroundModelClose();
                            });
                        });
                    });
                };
                ProfileComponent.prototype.followingSys = function () {
                    var me = this.User.feed.userid;
                    var userFollowingObj = {};
                    userFollowingObj[this.userid] = this.userid;
                    // userFollowing[this.User.feed.userid] = { }
                    // userFollowing[this.User.feed.userid][this.userid] = this.userid;
                    var followerId = this.userid;
                    var userFollowerObj = {};
                    userFollowerObj[this.User.feed.userid] = this.User.feed.userid;
                    // userFollower[this.userid] = { }
                    // userFollower[this.userid][this.User.feed.userid] = this.User.feed.userid
                    this.as.toggleFollowSystem(me, userFollowingObj, followerId, userFollowerObj);
                };
                __decorate([
                    core_1.ViewChild('profileCropper', undefined), 
                    __metadata('design:type', ng2_img_cropper_1.ImageCropperComponent)
                ], ProfileComponent.prototype, "profileCropper", void 0);
                __decorate([
                    core_1.ViewChild('bgCropper', undefined), 
                    __metadata('design:type', ng2_img_cropper_1.ImageCropperComponent)
                ], ProfileComponent.prototype, "bgCropper", void 0);
                ProfileComponent = __decorate([
                    core_1.Component({
                        selector: 'profile',
                        host: {
                            class: 'col s12'
                        },
                        styleUrls: ['components/profile/profile.css'],
                        templateUrl: 'components/profile/profile.html',
                        directives: [tag_input_component_1.TagInputComponent] // Add to directives
                    }), 
                    __metadata('design:paramtypes', [authService_1.authService, router_1.ActivatedRoute, router_1.Router])
                ], ProfileComponent);
                return ProfileComponent;
            }(core_1.Type));
            exports_1("ProfileComponent", ProfileComponent);
        }
    }
});
