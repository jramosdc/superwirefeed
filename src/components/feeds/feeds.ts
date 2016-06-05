// <reference path="../../../typings/tsd.d.ts">

import { Component, OnInit } from '@angular/core';
import { RouterLink, Router } from "@angular/router-deprecated";
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
	
	emailLoading: Boolean = false;

	constructor(public as: authService, private router: Router) {
		this.User = this.as.getUser();
		this.feeds = this.as.getFeeds();
		this.as.setRoute('Feeds', null);
		this.as.setActivePageTitle('LATEST FEEDS');
	}
	
	ngOnInit() {
        $('.modal-trigger').leanModal();
	}

	loadPosts(feed: Object) {
		if (feed['private'] === 'true') {
			$('#emailModel').openModal();
		} else {
			this.router.navigate(['/Posts', { feedid: feed['$key'] }]);
		}
	}
	
	checkEmail(email: HTMLInputElement) {
		this.emailLoading = true;
		$('#errorEmail').html('');
		$('#emailModel').closeModal();
		this.emailLoading = false;
	}

	returnMoment(timestamp) {
		if (timestamp) {
			return moment().to(timestamp);
		} else {
			return '';
		}
	}

}
