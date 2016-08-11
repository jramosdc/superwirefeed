System.register(['@angular/core', '@angular/platform-browser', '@angular/router', '@angular/forms', '@angular/http', "angularfire2", './app/app', './routes', "./services/bootstrapServices", './directives/sharedDirectives'], function(exports_1, context_1) {
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
    var core_1, platform_browser_1, router_1, forms_1, http_1, angularfire2_1, app_1, routes_1, bootstrapServices_1, sharedDirectives_1;
    var AppModule;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (platform_browser_1_1) {
                platform_browser_1 = platform_browser_1_1;
            },
            function (router_1_1) {
                router_1 = router_1_1;
            },
            function (forms_1_1) {
                forms_1 = forms_1_1;
            },
            function (http_1_1) {
                http_1 = http_1_1;
            },
            function (angularfire2_1_1) {
                angularfire2_1 = angularfire2_1_1;
            },
            function (app_1_1) {
                app_1 = app_1_1;
            },
            function (routes_1_1) {
                routes_1 = routes_1_1;
            },
            function (bootstrapServices_1_1) {
                bootstrapServices_1 = bootstrapServices_1_1;
            },
            function (sharedDirectives_1_1) {
                sharedDirectives_1 = sharedDirectives_1_1;
            }],
        execute: function() {
            // import { ApplicationPipes } from './pipes/sharedPipes';
            AppModule = (function () {
                function AppModule() {
                }
                AppModule = __decorate([
                    core_1.NgModule({
                        imports: [
                            platform_browser_1.BrowserModule,
                            router_1.RouterModule.forRoot(routes_1.AppRoutes),
                            forms_1.FormsModule,
                            http_1.HttpModule
                        ],
                        providers: angularfire2_1.FIREBASE_PROVIDERS.concat([
                            angularfire2_1.defaultFirebase({
                                apiKey: "AIzaSyCAmbNu5u6Pqguv3jRLx9ElyhhnIyIZnEo",
                                authDomain: "superwireapp.firebaseapp.com",
                                databaseURL: "https://superwireapp.firebaseio.com",
                                storageBucket: "superwireapp.appspot.com",
                            }),
                            angularfire2_1.firebaseAuthConfig({ provider: angularfire2_1.AuthProviders.Password, method: angularfire2_1.AuthMethods.Password })
                        ], bootstrapServices_1.ApplicationServices),
                        // pipes: [],
                        declarations: [app_1.AppComponent].concat(routes_1.ApplicationComponents, sharedDirectives_1.ApplicationDirectives),
                        bootstrap: [app_1.AppComponent]
                    }), 
                    __metadata('design:paramtypes', [])
                ], AppModule);
                return AppModule;
            }());
            exports_1("AppModule", AppModule);
        }
    }
});
