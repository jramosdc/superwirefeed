import { Component, ViewEncapsulation, OnDestroy } from '@angular/core';
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
export class SubscriptionComponent implements OnDestroy {
    FeedId: string;
    subscription: any[];
    observableSubcription: any[];

    constructor(private route: ActivatedRoute, private router: Router, private as: authService, ) {
        this.observableSubcription = [];
        this.subscription = [];

        this.observableSubcription[0] = this.route.params.subscribe(params => {
            this.FeedId = params['postid'];
            // this.subsObservable = 
            this.observableSubcription[1] = this.as.getFollowingFeedsPosts(this.FeedId)
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

    ngOnDestroy() {
        this.observableSubcription
            .map(obsr => {
                obsr['unsubscribe']();
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