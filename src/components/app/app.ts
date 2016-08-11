// <reference path="../../../typings/index.d.ts">

import { Component } from '@angular/core';

import { NavbarComponent } from '../navbar/navbar';
import { User, authService } from '../services/authService';

@Component({
	selector: 'ng2-app',
	host: {},
	styleUrls: ['components/app/app.css'],
	templateUrl: 'components/app/app.html'
})
export class AppComponent {

	User: User;

	constructor(private as: authService) {
		this.User = this.as.emptyUser();
		this.User = this.as.getUser();
	}

}

