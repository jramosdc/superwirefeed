// <reference path="../../../typings/tsd.d.ts">

import { Component } from 'angular2/core';
import { RouterOutlet , RouteConfig } from "angular2/router";
import { NavbarComponent } from '../navbar/navbar';
import { CategoriesComponent } from '../categories/categories';
import { FeedsComponent } from '../feeds/feeds';
import { PostsComponent } from '../posts/posts';
import { NewPostComponent } from '../newpost/newpost';
import { EditPostComponent } from '../editpost/editpost';
import { ViewPostComponent } from '../viewpost/viewpost';
import { User, authService } from '../services/authService';

@Component({
	selector: 'ng2-app',
	host: {},
        styleUrls: ['components/app/app.css'],
	templateUrl: 'components/app/app.html',
	directives: [RouterOutlet, NavbarComponent, CategoriesComponent]
        
})
@RouteConfig([
	{ path: "/feeds", name: "Feeds", component: FeedsComponent, useAsDefault: true },
	{ path: "/posts/:userid", name: "Posts", component: PostsComponent },
	{ path: "/post/:postid", name: "EditPost", component: EditPostComponent },
	{ path: "/post", name: "ViewPost", component: ViewPostComponent },
    { path: "/newpost", name: "NewPost", component: NewPostComponent }
])	
export class AppComponent  {

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

	constructor(public as: authService) {
		this.User = this.as.getUser();
	}

}

