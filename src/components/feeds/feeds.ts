import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { FirebaseListObservable } from 'angularfire2';
import { User, authService } from '../services/authService';

@Component({
	selector: 'feeds',
	// host: {
	// 	class: 'col s12'
	// },
	styles: [require('./feeds.scss')],
	template: require('./feeds.html')
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
		// $('ul.tabs')['tabs']();
	}

	returnMoment(timestamp) {
		if (timestamp) {
			return moment().to(timestamp);
		} else {
			return '';
		}
	}

}
