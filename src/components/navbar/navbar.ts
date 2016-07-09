// <reference path="../../../typings/index.d.ts">

import { Component, OnInit } from '@angular/core';
import { ROUTER_DIRECTIVES, Router } from '@angular/router';
import { User, authService } from '../services/authService';

@Component({
	selector: 'navbar',
	host: {},
    styleUrls: ['components/navbar/navbar.css'],
	templateUrl: 'components/navbar/navbar.html',
	directives: [ROUTER_DIRECTIVES]
})
export class NavbarComponent implements OnInit {

	User: User
	activePage: Object
	activeFeed: Object
	loginLoading: boolean = false
    registerLoading: boolean = false
    
	constructor(public as: authService, private router: Router) {
		this.User = this.as.emptyUser();
		this.User = this.as.getUser();
        this.activePage = this.as.getActivePageTitle();
        this.activeFeed = this.as.getActiveFeed();
	}

	ngOnInit() {
        $(".button-collapse").sideNav();
    }
    
    navigate() {
        if (this.activeFeed['id']) {
            this.router.navigate(['\posts', this.activeFeed['id']]);
            this.as.setActiveFeedID('');
        } else {
            this.router.navigate(['feeds']);
        }
    }

	loginModal() {
        $(".button-collapse").sideNav('hide');
		$('#loginModal').openModal();
	}

	login(email: HTMLInputElement, password: HTMLInputElement) {
		if (email.value == '' || password.value == '') return
		this.loginLoading = true;
        this.as.login(email.value, password.value).then((res) => {
            this.User = this.as.getUser();
            email.value = '';
            password.value = '';
            console.log('User is Logged In!');
            $('#errorLogin').html('');
            $('#loginModal').closeModal();
            this.loginLoading = false;
        }).catch((err) => {
            console.log("Login Failed!", err);
            $('#errorLogin').html(err['message']);
            this.loginLoading = false;
		});
	}

	registerModal() {
        $(".button-collapse").sideNav('hide');
		$('#registerModal').openModal();
	}

	register(userid: HTMLInputElement, email: HTMLInputElement, password: HTMLInputElement) {
		if (userid.value == '' || email.value == '' || password.value == '') return
        this.registerLoading = true;
        this.as.register(email.value.toLowerCase(), password.value).then((res) => {
            this.as.login(email.value.toLowerCase(), password.value).then((res) => {
                this.as.createUserProfile(res.uid, userid.value.toLowerCase(), email.value.toLowerCase()).then(() => {
                    console.log('Profile is Created!')
                    console.log('User is Registered & Logged In!');
                    this.router.navigate(['/profile', userid.value.toLowerCase()]);
                    userid.value = '';
                    email.value = '';
                    password.value = '';
                    $('#errorRegister').html('');
                    $('#registerModal').closeModal();
                    this.registerLoading = false;
                }).catch((err) => {
                    console.log('Profile Creation Failed!', err)
                });
            }).catch((err) => { 
                console.log("Login Failed after Registration!", err);
                $('#errorRegister').html(err['message']);
                this.registerLoading = false;
            });
        }).catch((err) => {
            console.log("Register Failed!", err);
            $('#errorRegister').html(err['message']);
            this.registerLoading = false;
		});
	}

	logout() {
        this.as.logout();
        console.log('User is Logged Out!');
        $(".button-collapse").sideNav('hide');
	}

}
