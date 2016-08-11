// <reference path="../../../typings/index.d.ts">
System.register(['@angular/core', "@angular/router", '../services/authService', 'ng2-img-cropper'], function(exports_1, context_1) {
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
    var core_1, router_1, authService_1, ng2_img_cropper_1;
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
                    // Cropper variables 
                    this.data = {};
                    this.imageSelected = true;
                    this.imageUploading = false;
                    this.User = this.as.emptyUser();
                    this.User = this.as.getUser();
                    this.as.setActivePageTitle('Profile');
                    this.domain = this.as.getDomain();
                    this.route.params.subscribe(function (params) {
                        _this.userid = params['userid'];
                        if (_this.userid) {
                            _this.as.getUserProfile(_this.userid).subscribe(function (profile) {
                                _this.profile = profile;
                            });
                        }
                    });
                    // for angular2 Corpper 
                    this.cropperSettings = new ng2_img_cropper_1.CropperSettings();
                    this.cropperSettings.width = 200;
                    this.cropperSettings.height = 200;
                    this.cropperSettings.keepAspect = false;
                    this.cropperSettings.croppedWidth = 200;
                    this.cropperSettings.croppedHeight = 200;
                    this.cropperSettings.canvasWidth = 400;
                    this.cropperSettings.canvasHeight = 200;
                    this.cropperSettings.minWidth = 100;
                    this.cropperSettings.minHeight = 100;
                    this.cropperSettings.rounded = true;
                    this.cropperSettings.minWithRelativeToResolution = false;
                    this.cropperSettings.cropperDrawSettings.strokeColor = 'rgba(255,255,255,1)';
                    this.cropperSettings.cropperDrawSettings.strokeWidth = 1;
                    this.cropperSettings.noFileInput = true;
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
                            'timestamp': firebase.database.ServerValue.TIMESTAMP,
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
                ProfileComponent.prototype.pictureModelOpen = function () {
                    $('#pictureModal').openModal();
                };
                ProfileComponent.prototype.pictureModelClose = function () {
                    $('#pictureModal').closeModal();
                    this.imageSelected = true;
                    this.data = {};
                };
                ProfileComponent.prototype.uploadProfileImage = function () {
                    var _this = this;
                    this.imageUploading = true;
                    this.as.uploadUserImg(this.User.feed.userid, this.data.image).then(function (url) {
                        _this.as.updateUserProfile(_this.User.feed.userid, { profileImageURL: url }).then(function (data) {
                            _this.imageUploading = false;
                            _this.pictureModelClose();
                        });
                    });
                };
                ProfileComponent.prototype.cropped = function (bounds) {
                    // console.log(bounds);
                };
                /**
                 * Used to send image to second cropper @param $event
                */
                ProfileComponent.prototype.fileChangeListener = function ($event) {
                    var _this = this;
                    var image = new Image();
                    var file = $event.target.files[0];
                    var myReader = new FileReader();
                    myReader.onloadend = function (loadEvent) {
                        image.src = loadEvent.target.result;
                        _this.cropper.setImage(image);
                        //data2 image on select image
                        _this.data.image = loadEvent.target.result;
                    };
                    myReader.readAsDataURL(file);
                };
                __decorate([
                    core_1.ViewChild('cropper', undefined), 
                    __metadata('design:type', ng2_img_cropper_1.ImageCropperComponent)
                ], ProfileComponent.prototype, "cropper", void 0);
                ProfileComponent = __decorate([
                    core_1.Component({
                        selector: 'profile',
                        host: {
                            class: 'col s12'
                        },
                        styleUrls: ['components/profile/profile.css'],
                        templateUrl: 'components/profile/profile.html'
                    }), 
                    __metadata('design:paramtypes', [authService_1.authService, router_1.ActivatedRoute, router_1.Router])
                ], ProfileComponent);
                return ProfileComponent;
            }(core_1.Type));
            exports_1("ProfileComponent", ProfileComponent);
        }
    }
});
