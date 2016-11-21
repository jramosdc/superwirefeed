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
    subscription: any[];
    subsObservable;

    constructor(private route: ActivatedRoute, private router: Router, private as: authService, ) {
        // this.User = this.as.emptyUser();
        // this.User = this.as.getUser();
        this.route.params.subscribe(params => {
            this.FeedId = params['postid'];
            this.subscription = [];
            // this.subsObservable = 
            this.as.getFollowingFeedsPosts(this.FeedId)
                .subscribe(obj => {
                    // // console.log(obj['$key'])
                    // let flag, index;
                    // this.subscription.map((x, i) => {
                    //     if (x['$key'] == obj['$key']) {
                    //         flag = true;
                    //         index = i;
                    //     }
                    // })
                    // // if (flag) {
                    // //     // console.log('inflasg ', this.subscription[index]['$key'] == obj['$key'])
                    // //     // console.log(this.subscription.indexOf(obj))
                    // //     console.log(this.subscription.length)
                    // //     this.subscription.filter(x => {
                    // //         return x['$key'] == obj['$key'];
                    // //     })
                    // //     console.log(this.subscription.length)
                    // //     // this.subscription.splice(0, index);
                    // // }
                    this.subscription.push(obj);

                    // let a = this.subscription.filter(y => {
                    //     console.log(y['$key'] == obj['$key'])
                    //     return y['$key'] != obj['$key']
                    // })
                    // // console.log(a)
                })
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