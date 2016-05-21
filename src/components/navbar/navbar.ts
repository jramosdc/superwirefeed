// <reference path="../../../typings/tsd.d.ts">

import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router-deprecated';
import { User, authService } from '../services/authService';

@Component({
	selector: 'navbar',
	host: {},
    styleUrls: ['components/navbar/navbar.css'],
	templateUrl: 'components/navbar/navbar.html',
	directives: [RouterLink]
})
export class NavbarComponent implements OnInit {

	User: User
	registerUserUid: string

	activePage = {
		title: 'LATEST FEEDS'
	}

	userInfo: boolean = true
	feedInfo: boolean = false
	loginLoading: boolean = false
	registerLoading: boolean = false
	createFeedLoading: boolean = false

	constructor(public as: authService) {
		this.User = this.as.getUser();
		this.activePage = this.as.getActivePageTitle();
	}

	ngOnInit() {
        $(".button-collapse").sideNav();
		$('.modal-trigger').leanModal();
	}

	loginModal() {
        $(".button-collapse").sideNav('hide');
		$('#loginModal').openModal();
	}

	login(email: HTMLInputElement, password: HTMLInputElement) {
		if (email.value == '' || password.value == '') return
		this.loginLoading = true;
		this.as.login(email.value, password.value, (err) => {
			if (err) {
				console.log("Login Failed!", err);
				$('#errorLogin').html(err);
				this.loginLoading = false;
			} else {
				this.User = this.as.getUser();
				email.value = '';
				password.value = '';
				console.log('User is Logged In!');
				$('#errorLogin').html('');
                $('#loginModal').closeModal();
				this.loginLoading = false;
			}
		});
	}

	registerModal() {
        $(".button-collapse").sideNav('hide');
		$('#registerModal').openModal();
	}

	register(email: HTMLInputElement, password: HTMLInputElement) {
		if (email.value == '' || password.value == '') return
		this.registerLoading = true;
		this.as.register(email.value, password.value, (err, authDataUid) => {
			if (err) {
				console.log("Register Failed!", err);
				$('#errorRegister').html(err);
				this.registerLoading = false;
			} else {
                email.value = '';
				password.value = '';
				console.log('User is Registered!');
				$('#errorRegister').html('');
				this.registerLoading = false;
				this.registerUserUid = authDataUid;
                this.toggleInfo('feed');
				setTimeout(function () {
					$('select').material_select();
				});
				$('#step1').removeClass('active-step');
				$('#step1').addClass('step-done');
				$('#step2').addClass('active-step');
			}
		});
	}

	logout() {
		this.as.logout((err) => {
			if (err) {
				console.log("Logout Failed!", err);
			} else {
				this.User = { password: { email: null, profileImageURL: null }, uid: null, feed: { id: '', name: '', userid: '' } };
				console.log('User is Logged Out!');
                $(".button-collapse").sideNav('hide');
			}
		});
	}

	toggleInfo(panel: string) {
		if (panel == 'user') {
			this.userInfo = true;
			this.feedInfo = false;
		} else if (panel == 'feed') {
			this.userInfo = false;
			this.feedInfo = true;
		}
	}

	createFeed(userid: HTMLInputElement, name: HTMLInputElement, description: HTMLInputElement, category: HTMLSelectElement) {
		if (userid.value == '' || name.value == '' || description.value == '') return
		this.createFeedLoading = true;
		this.as.createFeed(userid.value, name.value, description.value, category.value, this.registerUserUid, (err) => {
			if (err) {
				console.log("Create Feed Failed!", err);
				$('#errorFeed').html(err);
				this.createFeedLoading = false;
			} else {
				userid.value = '';
				name.value = '';
				description.value = '';
				category.value = '';
				this.toggleInfo('user');
				$('#step1').addClass('active-step');
				$('#step1').removeClass('step-done');
				$('#step2').removeClass('active-step');
				console.log('Feed is Registered!');
				$('#errorFeed').html('');
				$('#registerModal').closeModal();
				$('#loginModal').openModal();
				this.createFeedLoading = false;
			}
		});
	}

}
