// <reference path="../../../typings/tsd.d.ts">

import { Component, OnInit } from '@angular/core';
import { RouterLink, Router, RouteParams } from "@angular/router-deprecated";
import { FirebaseListObservable } from 'angularfire2';
import { User, authService } from '../services/authService';

@Component({
    selector: 'profile',
    host: {
        class: 'col s10'
    },
    styleUrls: ['components/profile/profile.css'],
    templateUrl: 'components/profile/profile.html',
    directives: [RouterLink]
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

    userid: string
    profile: Object

    constructor(private as: authService, private router: Router, private params: RouteParams) {
        this.User = this.as.getUser();
        this.as.setRoute('Profile', null);
        this.as.setActivePageTitle('Profile');
        this.userid = this.params.get('userid');
        if (this.userid) {
            this.as.getUserProfile(this.userid).subscribe((profile) => {
                console.log(profile)
                this.profile = profile;
            });
        }
    }

    ngOnInit() {
        
    }

}