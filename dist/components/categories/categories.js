// <reference path="../../../typings/tsd.d.ts">
System.register(['@angular/core', '../services/authService'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = (this && this.__metadata) || function (k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var core_1, authService_1;
    var CategoriesComponent;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (authService_1_1) {
                authService_1 = authService_1_1;
            }],
        execute: function() {
            CategoriesComponent = (function () {
                function CategoriesComponent(as) {
                    this.as = as;
                    this.categories = this.as.getCategories();
                }
                CategoriesComponent.prototype.selectCategory = function (category) {
                    this.activeCategory = category;
                    this.as.selectCategory(category);
                };
                CategoriesComponent = __decorate([
                    core_1.Component({
                        selector: 'categories',
                        host: {
                            class: 'col s2'
                        },
                        styleUrls: ['components/categories/categories.css'],
                        templateUrl: 'components/categories/categories.html'
                    }), 
                    __metadata('design:paramtypes', [authService_1.authService])
                ], CategoriesComponent);
                return CategoriesComponent;
            }());
            exports_1("CategoriesComponent", CategoriesComponent);
        }
    }
});
