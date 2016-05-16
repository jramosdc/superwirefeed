// <reference path="../../../typings/tsd.d.ts">

import { Component } from 'angular2/core';
import { authService } from '../services/authService';

@Component({
	selector: 'categories',
	host: {
		class: 'col s2'
	},
    styleUrls: ['components/categories/categories.css'],
	templateUrl: 'components/categories/categories.html'
})
export class CategoriesComponent {
	
	activeCategory: string;
    categories: Array<string>

	constructor(public as: authService) {
		this.categories = this.as.getCategories();
	}

	selectCategory(category: string) {
		this.activeCategory = category;
		this.as.selectCategory(category)
	}

}