// <reference path="../../../typings/tsd.d.ts">

import { Component, OnInit } from '@angular/core';
import { RouteParams, Router } from "@angular/router-deprecated";
import { User, authService } from '../services/authService';

@Component({
    selector: 'profile',
    host: {
        class: 'col s12'
    },
    styleUrls: ['components/profile/profile.css'],
    templateUrl: 'components/profile/profile.html',
    directives: []
})
export class ProfileComponent implements OnInit {

    User: User = {
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
    }

    domain: string
    userid: string
    editMode: boolean = false
    profileLoading: boolean = false
    profile: Object
    deleteLoading: boolean
    authList: Array<string> = []
    authNew: Array<string> = []
    postCategoryList: Array<string> = []
    postCategoryNew: Array<string> = []

    constructor(private as: authService, private params: RouteParams, private router: Router) {
        this.User = this.as.getUser();
        this.as.setRoute('Profile', null);
        this.as.setActivePageTitle('Profile');
        this.domain = this.as.getDomain();
        this.userid = this.params.get('userid');
        if (this.userid) {
            this.as.getUserProfile(this.userid).subscribe((profile) => {
                this.profile = profile;
            });
        }
    }

    ngOnInit() {
        $(window).scroll(function() {
			let space = $(window).innerHeight() - $('.fab').offsetTop + $('.fab').offsetHeight;
			if(space < 200){
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
        if (bio.value === '' || feedId .value === '' || feedName.value === '' || description.value === '' || category.value === '' ) return
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
                'timestamp': Firebase.ServerValue.TIMESTAMP,
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
            this.as.deleteAll(this.profile['feedId'], this.userid, this.User.uid).subscribe(res => {
                console.log('User, Profile and Feed Deleted!')
                $('#errorDelete').html('');
                $('#confirmDeleteModel').closeModal();
                this.deleteLoading = false;
                this.router.navigate(['/Feeds']);
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

}