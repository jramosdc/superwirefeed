import { Component, ViewEncapsulation } from '@angular/core';

import { NavbarComponent } from '../navbar/navbar';
import { User, authService } from '../services/authService';

@Component({
	selector: 'ng2-app',
	host: {},
	styles: [
		require('./app.scss')
	],
	template: require('./app.html'),
	encapsulation: ViewEncapsulation.None
})
export class AppComponent {

	User: User;

	constructor(private as: authService) {
		this.User = this.as.emptyUser();
		this.User = this.as.getUser();
	}

}

