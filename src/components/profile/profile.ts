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
    profileForm: any
    
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
        this.profileForm = this._formBuilder.group({
            'bio': [this.profile['bio'], Validators.required],
            'feedId': [this.profile['feedId'], Validators.required],
            'feedName': [this.profile['feedName'], Validators.required],
            'description': [this.profile['description'], Validators.required],
            // 'private': [this.profile['private'], Validators.required],
            'category': [this.profile['category'], Validators.required]
        });
        setTimeout(function () {
            $('select').material_select();
        });
    }

    update() {
        console.log(this.profileForm.error)
        console.log(this.profile)
        this.as.updateUserProfile(this.userid, this.profileForm.value)/*.then((res) => {
            console.log(res);
            this.editMode = false;
        }).catch((err) => {
            console.log(err);
        })*/
    }

}