// <reference path="../../../typings/index.d.ts">

import { Component, OnInit, ViewChild, Type } from '@angular/core';
import { ROUTER_DIRECTIVES, ActivatedRoute, Router } from "@angular/router";
import { User, authService } from '../services/authService';
import {ImageCropperComponent, Bounds, CropperSettings} from 'ng2-img-cropper';

@Component({
    selector: 'profile',
    host: {
        class: 'col s12'
    },
    styleUrls: ['components/profile/profile.css'],
    templateUrl: 'components/profile/profile.html'
})
export class ProfileComponent extends Type implements OnInit {

    User: User;
    domain: string;
    userid: string;
    editMode: boolean = false;
    profileLoading: boolean = false;
    profile: Object;
    deleteLoading: boolean;
    authList: Array<string> = [];
    authNew: Array<string> = [];
    postCategoryList: Array<string> = [];
    postCategoryNew: Array<string> = [];

    // Cropper variables 
    data: any = {};
    cropperSettings: CropperSettings;
    imageSelected: boolean = true;
    imageUploading: boolean = false;
    @ViewChild('cropper', undefined) cropper: ImageCropperComponent;

    constructor(private as: authService, private route: ActivatedRoute, private router: Router) {

        super();

        this.User = this.as.emptyUser();
        this.User = this.as.getUser();
        this.as.setActivePageTitle('Profile');
        this.domain = this.as.getDomain();
        this.route.params.subscribe(params => {
            this.userid = params['userid'];
            if (this.userid) {
                this.as.getUserProfile(this.userid).subscribe((profile) => {
                    this.profile = profile;
                });
            }
        });

        // for angular2 Corpper 
        this.cropperSettings = new CropperSettings();
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

    ngOnInit() {
        $(window).scroll(function () {
            let space = $(window).innerHeight() - $('.fab').offsetTop + $('.fab').offsetHeight;
            if (space < 200) {
                $('.fab').css('margin-bottom', '150px');
            }
        });
    }

    edit() {
        this.editMode = true;
        setTimeout(() => {
            $('#bio').val(this.profile['bio']);
            $('#feedId').val(this.profile['feedId']);
            $('#feedName').val(this.profile['feedName']);
            $('#description').val(this.profile['description']);
            if (this.profile['private'] === 'true') {
                $('#pyes').prop('checked', true);
            } else {
                $('#pno').prop('checked', true);
            }
            $('#category').val(this.profile['category']);
            $('select').material_select();
            if (this.profile['authEmail']) {
                this.profile['authEmail'].forEach(val => {
                    this.authList.push(val);
                });
            }
            if (this.profile['postCategories']) {
                this.profile['postCategories'].forEach(val => {
                    this.postCategoryList.push(val);
                });
            }
        });
    }

    update(bio: HTMLSelectElement, feedId: HTMLSelectElement, feedName: HTMLSelectElement, description: HTMLSelectElement, pyes: HTMLInputElement, pno: HTMLInputElement, category: HTMLSelectElement) {
        if (bio.value === '' || feedId.value === '' || feedName.value === '' || description.value === '' || category.value === '') return
        this.profileLoading = true;
        $.merge(this.authList, this.authNew)
        this.authNew.splice(0);
        $.merge(this.postCategoryList, this.postCategoryNew)
        this.postCategoryNew.splice(0);
        let profile = {
            'bio': bio.value,
            'feedId': feedId.value.toLowerCase(),
            'feedName': feedName.value,
            'description': description.value,
            'private': $(pyes).prop('checked') ? 'true' : 'false',
            'category': category.value,
            'authEmail': this.authList,
            'postCategories': this.postCategoryList
        };
        this.as.updateUserProfile(this.userid, profile).then((res) => {
            let feed = {
                'feedName': feedName.value,
                'description': description.value,
                'private': $(pyes).prop('checked') ? 'true' : 'false',
                'category': category.value,
                'authEmail': this.authList,
                'postCategories': this.postCategoryList,
                'timestamp': firebase.database.ServerValue.TIMESTAMP,
                'owner': {
                    'uid': this.User.uid,
                    'userid': this.userid
                }
            }
            this.as.updateFeed(feedId.value.toLowerCase(), feed).then((res) => {
                this.editMode = false;
                this.profileLoading = false;
                $('#errorProfile').html('');
                this.authList.splice(0);
                this.postCategoryList.splice(0);
                console.log('Profile and Feed Updated.');
            }).catch((err) => {
                console.log('Feed Update Failed!', err);
                $('#errorProfile').html(err);
            })
        }).catch((err) => {
            console.log('Profile Update Failed!', err);
            $('#errorProfile').html(err);
        });
    }

    confirmDelete() {
        $('#confirmDeleteModel').openModal();
    }

    delete(answer: string) {
        this.deleteLoading = true;
        if (answer === 'yes') {
            this.as.deleteAll(this.profile['feedId'], this.userid, this.User.uid).then(res => {
                console.log('User, Profile and Feed Deleted!')
                $('#errorDelete').html('');
                $('#confirmDeleteModel').closeModal();
                this.deleteLoading = false;
                this.router.navigate(['/feeds']);
            }).catch(err => {
                console.log('Delete All Failed: ', err);
                $('#errorDelete').html(err);
                this.deleteLoading = false;
            })
        } else {
            $('#errorDelete').html('');
            $('#confirmDeleteModel').closeModal();
            this.deleteLoading = false;
        }
    }

    addAuthEmail(email: HTMLInputElement) {
        this.authNew.push(email.value);
        email.value = '';
    }

    addPostCategory(postCategory: HTMLInputElement) {
        if (postCategory.value === '') return
        if ((this.postCategoryList.length + this.postCategoryNew.length) < 4) {
            this.postCategoryNew.push(postCategory.value);
            postCategory.value = '';
        } else {
            $('#errorPostCategory').html('Not Allow more then four!');
        }
    }

    removePostCategory(type: string, category: string) {
        if (type === 'new') {
            this.postCategoryNew = $.grep(this.postCategoryNew, val => {
                return val != category;
            })
        } else if (type === 'list') {
            this.postCategoryList = $.grep(this.postCategoryList, val => {
                return val != category;
            })
        }
    }

    pictureModelOpen() {
        $('#pictureModal').openModal();
    }

    pictureModelClose() {
        $('#pictureModal').closeModal();
        this.imageSelected = true;
        this.data = {};
    }

    uploadProfileImage() {
        this.imageUploading = true;
        this.as.uploadUserImg(this.User.feed.userid, this.data.image).then((url) => {
            this.as.updateUserProfile(this.User.feed.userid, { profileImageURL: url }).then((data) => {
                this.imageUploading = false;
                this.pictureModelClose();
            });
        });
    }

    cropped(bounds: Bounds) {
        // console.log(bounds);
    }

    /**
     * Used to send image to second cropper @param $event
    */
    fileChangeListener($event) {
        var image: any = new Image();
        var file: File = $event.target.files[0];
        var myReader: FileReader = new FileReader();

        myReader.onloadend = (loadEvent: any) => {
            image.src = loadEvent.target.result;
            this.cropper.setImage(image);
            //data2 image on select image
            this.data.image = loadEvent.target.result
        };
        myReader.readAsDataURL(file);
    }

}