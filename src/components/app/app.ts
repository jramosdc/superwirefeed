// <reference path="../../../typings/tsd.d.ts">

import { Component } from '@angular/core';
import { RouterOutlet , RouteConfig } from "@angular/router-deprecated";
import { NavbarComponent } from '../navbar/navbar';
import { FeedsComponent } from '../feeds/feeds';
import { PostsComponent } from '../posts/posts';
import { NewPostComponent } from '../newpost/newpost';
import { EditPostComponent } from '../editpost/editpost';
import { ViewPostComponent } from '../viewpost/viewpost';
import { ProfileComponent } from '../profile/profile'
import { User, authService } from '../services/authService';

@Component({
	selector: 'ng2-app',
	host: {},
    styleUrls: ['components/app/app.css'],
	templateUrl: 'components/app/app.html',
	directives: [RouterOutlet, NavbarComponent]
})
@RouteConfig([
	{ path: "/feeds", name: "Feeds", component: FeedsComponent, useAsDefault: true },
	{ path: "/posts/:feedid", name: "Posts", component: PostsComponent },
    { path: "/newpost", name: "NewPost", component: NewPostComponent },
	{ path: "/editpost/:postid", name: "EditPost", component: EditPostComponent },
    { path: "/post/:postid", name: "ViewPost", component: ViewPostComponent },
    { path: "/profile/:userid", name: "Profile", component: ProfileComponent }
])	
export class AppComponent  {

	User: User;

	constructor(private as: authService) {
		this.User = this.as.emptyUser();
		this.User = this.as.getUser();
	}

}

