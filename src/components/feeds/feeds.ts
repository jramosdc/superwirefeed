import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from "@angular/router";
import { FirebaseListObservable } from 'angularfire2';
import { User, authService } from '../services/authService';
import SearchBar from '../services/searchBar';

@Component({
	selector: 'feeds',
	template: require('./feeds.html')
})

export class FeedsComponent implements OnDestroy {
	User: User;
	feeds: FirebaseListObservable<any[]>;
	activeCategory: string;
	categories: Array<string>

	constructor(public as: authService, private router: Router, private sb: SearchBar) {
		this.User = this.as.emptyUser();
		this.User = this.as.getUser();
		this.feeds = this.as.getFeeds();
		this.categories = this.as.getCategories();
		this.as.setActivePageTitle('Latest feeds');
		this.sb.search$.subscribe(term => {
			this.feeds = <any>this.as.getFeeds()
				.map(feeds => {
					return feeds.filter(y => {
						if (y && y.feedName) {
							return y.feedName.toLowerCase().indexOf(term.toLowerCase()) != -1;
						} else { return false; }
					});
				});
		});
	}

	ngOnInit() {
		// $('ul.tabs')['tabs']();
	}

	ngOnDestroy() {
		// this.sb.search$.unsubscribe()

	}

	searchFeed(str?: string) {
		// if(!str)
		// 	return this.feeds = this.as.getFeeds();
		// else
		this.feeds.filter(feed => {
			console.log(feed);
			return true;
		});

	}

	returnMoment(timestamp) {
		if (timestamp) moment().to(timestamp)
		else return ''
	}

}
