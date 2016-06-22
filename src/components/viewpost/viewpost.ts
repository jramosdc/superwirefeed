// <reference path="../../../typings/tsd.d.ts">

import { Component, OnInit } from '@angular/core';
import { RouterLink, Router, RouteParams } from "@angular/router-deprecated";
import { FirebaseObjectObservable } from 'angularfire2';
import { User, authService } from '../services/authService';

@Component({
    selector: 'viewpost',
    host: {
        class: 'col s12'
    },
    styleUrls: ['components/viewpost/viewpost.css'],
    templateUrl: 'components/viewpost/viewpost.html',
    directives: [RouterLink]
})
export class ViewPostComponent implements OnInit {

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

    postid: string
    post: FirebaseObjectObservable<{}>

    constructor(private as: authService, private router: Router, private params: RouteParams) {
        this.User = this.as.getUser();
        this.as.setRoute('View Post', null);
        this.as.setActivePageTitle('View Post');
        this.postid = this.params.get('postid');
        if (this.postid) {
            this.as.loadPost(this.postid).subscribe((post) => { 
                this.post = post;
            });
        }
    }

    ngOnInit() {
        
    }
    
    returnMoment(timestamp) {
		if (timestamp) {
			return moment().to(timestamp);
		} else {
			return ''
		}
    }

}