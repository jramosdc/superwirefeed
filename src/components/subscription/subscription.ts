import { Component, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { User, authService } from '../services/authService';

@Component({
    selector: 'subscription',
    template: require('./subscription.html'),
    host: {},
    styles: [
        require('./subscription.scss')
    ],
})
export class SubscriptionComponent {
    // userid
    // User: User;
    FeedId: string;
    subsObservable;

    constructor(private route: ActivatedRoute, private router: Router, private as: authService, ) {
        // this.User = this.as.emptyUser();
        // this.User = this.as.getUser();
        this.route.params.subscribe(params => {
            this.FeedId = params['postid'];
            this.subsObservable = this.as.getFollowingFeedsPosts(this.FeedId);
        });
    }

    navigate(id: string) {
        if (id) {
            this.router.navigate(['post', id]);
        }
    }

    returnMoment(timestamp) {
        if (timestamp) {
            return moment().to(timestamp);
        } else {
            return ''
        }
    }

}