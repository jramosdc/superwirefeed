// <reference path="../../../typings/index.d.ts">
System.register(['@angular/core', "@angular/router", '../navbar/navbar', '../services/authService'], function(exports_1, context_1) {
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
    var core_1, router_1, navbar_1, authService_1;
    var AppComponent;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (router_1_1) {
                router_1 = router_1_1;
            },
            function (navbar_1_1) {
                navbar_1 = navbar_1_1;
            },
            function (authService_1_1) {
                authService_1 = authService_1_1;
            }],
        execute: function() {
            AppComponent = (function () {
                function AppComponent(as) {
                    this.as = as;
                    this.User = this.as.emptyUser();
                    this.User = this.as.getUser();
                }
                AppComponent = __decorate([
                    core_1.Component({
                        selector: 'ng2-app',
                        host: {},
                        styleUrls: ['components/app/app.css'],
                        templateUrl: 'components/app/app.html',
                        directives: [router_1.ROUTER_DIRECTIVES, navbar_1.NavbarComponent]
                    }), 
                    __metadata('design:paramtypes', [authService_1.authService])
                ], AppComponent);
                return AppComponent;
            }());
            exports_1("AppComponent", AppComponent);
        }
    }
});
