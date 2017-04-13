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

    constructor(private route: ActivatedRoute, private router: Router, private as: authService) {
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

  parseImgUrl(htmlDesc: string) {
    let regex = /(https?:\/\/[^">]+)(jpg|png|gif)/gi;
    let imgs = htmlDesc.match(regex);
    return imgs && imgs[0]
  }
  parseShortDescription(htmlDesc: string) {
    let htmlRegex = /(<([^>]+)>)/gi;    //Regex to remove html tags
    let descriptions = htmlDesc.replace(htmlRegex, "");
    let truncateLength = 500;
    if(truncateLength > descriptions.length){
      return descriptions;
    } else {
      descriptions = descriptions.substring(0, truncateLength);
      return descriptions + "..." ;
    }

    /*let regex = /[^-=\>/"%_<:;&]{55,}/gi;
    let descriptions = htmlDesc.match(regex);
    return descriptions && descriptions[0];*/
  }
}

}