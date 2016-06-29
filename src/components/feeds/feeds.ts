// <reference path="../../../typings/tsd.d.ts">

import { Component, OnInit } from '@angular/core';
import { RouterLink, Router } from "@angular/router-deprecated";
import { FirebaseListObservable } from 'angularfire2';
import { User, authService } from '../services/authService';
import { SearchCategory } from '../pipes/searchCategory';
import { OrderBy } from "../pipes/orderby";

@Component({
	selector: 'feeds',
	host: {
		class: 'col s12'
	},
    styleUrls: ['components/feeds/feeds.css'],
	templateUrl: 'components/feeds/feeds.html',
	directives: [ RouterLink ],
	pipes: [ SearchCategory, OrderBy ]
})
export class FeedsComponent implements OnInit {

	User: User;
    feeds: FirebaseListObservable<any[]>;
    activeCategory: string;
    categories: Array<string>

	constructor(public as: authService, private router: Router) {
		this.User = this.as.emptyUser();
		this.User = this.as.getUser();
		this.feeds = this.as.getFeeds();
		this.categories = this.as.getCategories();
		this.as.setActivePageTitle('LATEST FEEDS');
	}
	
	ngOnInit() {
        $('ul.tabs').tabs();
	}
	
	returnMoment(timestamp) {
		if (timestamp) {
			return moment().to(timestamp);
		} else {
			return '';
		}
	}

}
