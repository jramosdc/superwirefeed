import { Component, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { NavbarComponent } from '../navbar/navbar';
import { User, authService } from '../services/authService';

@Component({
  selector: 'ng2-app',
  host: {},
  styles: [ require('./app.scss') ],
  template: require('./app.html'),
  encapsulation: ViewEncapsulation.None
})

export class AppComponent {
  User: User;
  hiddenNavbar: boolean;

  constructor(private as: authService, public route: ActivatedRoute, private router: Router) {
    this.User = this.as.emptyUser();
    this.User = this.as.getUser();
    this.as.hiddenNavbar$.subscribe(result => this.hiddenNavbar = result);
  }

}

