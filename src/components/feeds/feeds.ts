// <reference path="../../../typings/tsd.d.ts">

import { Component } from '@angular/core';
import { RouterLink } from "@angular/router-deprecated";
import { FirebaseListObservable } from 'angularfire2';
import { User, authService } from '../services/authService';

@Component({
	selector: 'feeds',
	host: {
		class: 'col s10'
	},
    styleUrls: ['components/feeds/feeds.css'],
	templateUrl: 'components/feeds/feeds.html',
	directives: [RouterLink]
})
export class FeedsComponent {

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
        
	feeds: FirebaseListObservable<any[]>;

	constructor(public as: authService) {
		this.User = this.as.getUser();
		this.feeds = this.as.getFeeds();
		this.as.setRoute('Feeds', null);
		this.as.setActivePageTitle('LATEST FEEDS');
	}

	

	returnMoment(timestamp) {
		if (timestamp) {
			return moment().to(timestamp);
		} else {
			return '';
		}
	}

}
