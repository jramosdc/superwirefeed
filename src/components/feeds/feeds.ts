// <reference path="../../../typings/tsd.d.ts">

import { Component, OnInit } from '@angular/core';
import { RouterLink, Router } from "@angular/router-deprecated";
import { FirebaseListObservable } from 'angularfire2';
import { User, authService } from '../services/authService';

@Component({
	selector: 'feeds',
	host: {
		class: 'col s12'
	},
    styleUrls: ['components/feeds/feeds.css'],
	templateUrl: 'components/feeds/feeds.html',
	directives: [RouterLink]
})
export class FeedsComponent implements OnInit {

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
    activeCategory: string;
    categories = ['Marketing', 'News', 'Visuals', 'Data', 'Misc', 'All'];

	constructor(public as: authService, private router: Router) {
		this.User = this.as.getUser();
		this.feeds = this.as.getFeeds();
		this.as.setRoute('Feeds', null);
		this.as.setActivePageTitle('LATEST FEEDS');
	}
	
	ngOnInit() {
        
	}
	
	returnMoment(timestamp) {
		if (timestamp) {
			return moment().to(timestamp);
		} else {
			return '';
		}
	}

}
