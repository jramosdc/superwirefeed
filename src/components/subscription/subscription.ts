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
    User: User;
    subsObservable;

    constructor(/*private route: ActivatedRoute,*/ private router: Router, private as: authService, ) {
        // this.route.params.subscribe(params => {
        //     this.userid = params['userid'];
        // });
        this.User = this.as.emptyUser();
        this.User = this.as.getUser();

        if (this.User.feed.userid) {
            this.subsObservable = this.as.getFollowingFeedsPosts(this.User.feed.userid);
        }
    }

    navigate(type: string, id: string) {
        if (type === 'view') {
            this.router.navigate(['post', id]);
            // this.as.setActiveFeedID(this.FeedID);
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