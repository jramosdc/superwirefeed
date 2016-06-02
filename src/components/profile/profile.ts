// <reference path="../../../typings/tsd.d.ts">

import { Component, OnInit } from '@angular/core';
import { RouterLink, Router, RouteParams } from "@angular/router-deprecated";
import { FormBuilder, Validators } from '@angular/common';
import { FirebaseListObservable } from 'angularfire2';
import { User, authService } from '../services/authService';
import { ControlMessages } from '../services/controlMessagesServices';
import { ValidationService } from '../services/validationService';

@Component({
    selector: 'profile',
    host: {
        class: 'col s10'
    },
    styleUrls: ['components/profile/profile.css'],
    templateUrl: 'components/profile/profile.html',
    directives: [RouterLink, ControlMessages]
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
    profile: Object

    constructor(private as: authService, private router: Router, private params: RouteParams, private _formBuilder: FormBuilder) {
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
        });
    }

    update(bio: HTMLSelectElement, feedId: HTMLSelectElement, feedName: HTMLSelectElement, description: HTMLSelectElement, pyes: HTMLInputElement, pno: HTMLInputElement, category: HTMLSelectElement) {
        let profile = {
            'bio': bio.value,
            'feedId': feedId.value,
            'feedName': feedName.value,
            'description': description.value,
            'private': $(pyes).prop('checked') ? 'true' : 'false',
            'category': category.value
        };
        this.as.updateUserProfile(this.userid, profile).then((res) => {
            let feed = {
                'feedName': feedName.value,
                'description': description.value,
                'private': $(pyes).prop('checked') ? 'true' : 'false',
                'category': category.value,
                'timestamp': Firebase.ServerValue.TIMESTAMP,
                'owner': {
                    'uid': this.User.uid,
                    'userid': this.userid
                }
            }
            this.as.updateFeed(feedId.value, feed).then((res) => {
                this.editMode = false;
                console.log('Profile and Feed Updated.');
            }).catch((err) => {
                console.log(err);
            })
        }).catch((err) => {
            console.log(err);
        });
    }

}