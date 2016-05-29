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
	activePage: Object
	loginLoading: boolean = false
    registerLoading: boolean = false
    
	constructor(public as: authService) {
		this.User = this.as.getUser();
		this.activePage = this.as.getActivePageTitle();
	}

	ngOnInit() {
        $(".button-collapse").sideNav();
        $('.modal-trigger').leanModal();
        // $('select').material_select();
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
            $('#errorLogin').html(err);
            this.loginLoading = false;
		});
	}

	registerModal() {
        $(".button-collapse").sideNav('hide');
		$('#registerModal').openModal();
	}

	register(userid: HTMLInputElement, email: HTMLInputElement, password: HTMLInputElement) {
		if (email.value == '' || password.value == '') return
		this.registerLoading = true;
        this.as.register(email.value, password.value).then((res) => {
            this.as.login(email.value, password.value).then((res) => {
                this.as.createUserProfile(res.uid, userid.value, email.value).then(() => {
                    console.log('Profile is Created!')
                }).catch((err) => {
                    console.log('Profile Creation Failed!', err)
                });
                userid.value = '';
                email.value = '';
                password.value = '';
                console.log('User is Registered & Logged In!');
                $('#errorRegister').html('');
                $('#registerModal').closeModal();
                this.registerLoading = false;
            }).catch((err) => { 
                console.log("Login Failed after Registration!", err);
                $('#errorRegister').html(err);
                this.registerLoading = false;
            });
        }).catch((err) => {
            console.log("Register Failed!", err);
            $('#errorRegister').html(err);
            this.registerLoading = false;
		});
	}

	logout() {
        this.as.logout();
        console.log('User is Logged Out!');
        $(".button-collapse").sideNav('hide');
	}

	// createFeed(userid: HTMLInputElement, name: HTMLInputElement, description: HTMLInputElement, category: HTMLSelectElement) {
	// 	if (userid.value == '' || name.value == '' || description.value == '') return
	// 	this.createFeedLoading = true;
    //     this.as.createFeed(userid.value, name.value, description.value, category.value, this.registerUserUid).then(() => {
    //         userid.value = '';
    //         name.value = '';
    //         description.value = '';
    //         category.value = '';
    //         this.toggleInfo('user');
    //         $('#step1').addClass('active-step');
    //         $('#step1').removeClass('step-done');
    //         $('#step2').removeClass('active-step');
    //         console.log('Feed is Registered!');
    //         $('#errorFeed').html('');
    //         $('#registerModal').closeModal();
    //         $('#loginModal').openModal();
    //         this.createFeedLoading = false;
    //     }).catch((err) => {
    //         console.log("Create Feed Failed!", err);
    //         $('#errorFeed').html(err);
    //         this.createFeedLoading = false;
	// 	});
	// }

}
