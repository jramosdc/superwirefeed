// <reference path="../../../typings/index.d.ts">

import { SafeResourceUrl, DomSanitizationService } from '@angular/platform-browser';
import { Component } from '@angular/core';
import { Router, ActivatedRoute } from "@angular/router";
import { FirebaseObjectObservable } from 'angularfire2';
import { User, authService } from '../services/authService';

@Component({
    selector: 'viewpost',
    host: {
        class: 'col s12'
    },
    styleUrls: ['components/viewpost/viewpost.css'],
    templateUrl: 'components/viewpost/viewpost.html'
})
export class ViewPostComponent {

    User: User;
    postid: string
    post: FirebaseObjectObservable<{}>

    constructor(private as: authService, private router: Router, private route: ActivatedRoute, sanitizer: DomSanitizationService) {
        this.User = this.as.emptyUser();
        this.User = this.as.getUser();
        this.as.setActivePageTitle('View Post');
        this.route.params.subscribe(params => {
            this.postid = params['postid'];
            if (this.postid) {
                this.as.loadPost(this.postid).subscribe((post) => {
                    this.post = post;
                    this.post['purl'] = sanitizer.bypassSecurityTrustResourceUrl(post.pdfLink);
                    this.post['gurl'] = sanitizer.bypassSecurityTrustResourceUrl(post.gsheetLink);
                    setTimeout(function () {
                        $('.linkify').linkify();
                        $('.collapsible').collapsible({accordion : false});
                        $("img").addClass("responsive-img");
                    });
                });
            }
        });
    }

    returnMoment(timestamp) {
        if (timestamp) {
            return moment().to(timestamp);
        } else {
            return ''
        }
    }

}