// <reference path="../../../typings/tsd.d.ts">

import { Component, Pipe, PipeTransform, OnInit, Injector } from '@angular/core';
import { DatePipe } from "@angular/common";
import { RouterLink, RouteParams, CanActivate, ComponentInstruction, Router } from '@angular/router-deprecated';
import { FirebaseListObservable } from 'angularfire2';
import { User, authService } from '../services/authService';
import { ClipboardDirective } from '../directives/clip';
import { OrderBy } from "../pipes/orderby";
import { SearchPostTitlePipe } from '../pipes/searchPostTitle';
import { SearchCategory } from '../pipes/searchCategory';

@Component({
	selector: 'posts',
	host: {
		class: 'col s12'
	},
    styleUrls: ['components/posts/posts.css'],
	templateUrl: 'components/posts/posts.html',
	directives: [RouterLink, ClipboardDirective],
	pipes: [SearchPostTitlePipe, DatePipe, OrderBy, SearchCategory]
})
// @CanActivate((next: ComponentInstruction, prev: ComponentInstruction) => {
// 	let injector = Injector//.resolveAndCreate([authService]);
// 	let as : authService = injector.get(authService);
// 	return new Promise((resolve, reject) => {
// 		let userid: string = next.params.userid;
// 		as.getFeedName(userid, (feedName) => {
// 			as.setActivePageTitle(feedName);
// 			resolve(true);
// 		});
// 	});
// })
export class PostsComponent implements OnInit {

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

	Domain: string
    FeedID: string
    userEmail: HTMLInputElement
    search: string
    activeCategory: string;
    categories: Array<string> = ['All']
    deletePostID: string
	posts: FirebaseListObservable<any[]>
	emailLoading: Boolean = false
    
	constructor(public as: authService, public params: RouteParams, private router: Router) {
		this.Domain = this.as.getDomain();
		this.User = this.as.getUser();
		this.FeedID = this.params.get('feedid')
		this.as.setRoute('Posts', this.FeedID);
	}

	ngOnInit() {
		this.as.getFeedNameByFeedID(this.FeedID).subscribe(feed => {
            this.as.setActivePageTitle(feed.feedName);
			this.categories.splice(0);
            if (feed['postCategories']) {
                feed['postCategories'].forEach( (val: string) => {
                    this.categories.push(val);
                });
            }
            if (feed.private === 'true' && feed.owner.uid !== this.User.uid) {
                if (sessionStorage['email']) {
                    this.checkEmail(sessionStorage['email']);
                } else {
                    $('#emailModel').openModal({ dismissible: false });
                }
			} else {
				this.posts = this.as.loadPosts(this.FeedID);
			}
		});
	}

	checkEmail(email: HTMLInputElement) {
		this.emailLoading = true;
		this.as.checkEmail(this.FeedID, email.value).subscribe(res => {
			if (res.length > 0) {
                this.posts = this.as.loadPosts(this.FeedID);
                sessionStorage['email'] = email;
				$('#emailModel').closeModal();
				$('#errorEmail').html('');
				this.emailLoading = false;
			} else {
				$('#errorEmail').html('Not a vaild Email!');
				this.emailLoading = false;
			}
		})
		
	}
	
	deleteModel(postid) {
		this.deletePostID = postid;
		$('#deleteModel').openModal();
	}

	deletePost() {
		this.as.deletePost(this.deletePostID);
	}

	voteUp() {
		this.as.voteUp(this.FeedID);
	}

	voteDown() {
		this.as.voteDown(this.FeedID);
	}

	returnMoment(timestamp) {
		if (timestamp) {
			return moment().to(timestamp);
		} else {
			return ''
		}
    }

}
