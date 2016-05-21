// <reference path="../../../typings/tsd.d.ts">
System.register(['@angular/core', "@angular/router-deprecated", '../navbar/navbar', '../categories/categories', '../feeds/feeds', '../posts/posts', '../newpost/newpost', '../editpost/editpost', '../viewpost/viewpost', '../services/authService'], function(exports_1, context_1) {
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
    var core_1, router_deprecated_1, navbar_1, categories_1, feeds_1, posts_1, newpost_1, editpost_1, viewpost_1, authService_1;
    var AppComponent;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (router_deprecated_1_1) {
                router_deprecated_1 = router_deprecated_1_1;
            },
            function (navbar_1_1) {
                navbar_1 = navbar_1_1;
            },
            function (categories_1_1) {
                categories_1 = categories_1_1;
            },
            function (feeds_1_1) {
                feeds_1 = feeds_1_1;
            },
            function (posts_1_1) {
                posts_1 = posts_1_1;
            },
            function (newpost_1_1) {
                newpost_1 = newpost_1_1;
            },
            function (editpost_1_1) {
                editpost_1 = editpost_1_1;
            },
            function (viewpost_1_1) {
                viewpost_1 = viewpost_1_1;
            },
            function (authService_1_1) {
                authService_1 = authService_1_1;
            }],
        execute: function() {
            AppComponent = (function () {
                function AppComponent(as) {
                    this.as = as;
                    this.User = {
                        password: {
                            email: '',
                            profileImageURL: ''
                        },
                        uid: '',
                        feed: {
                            id: '',
                            name: '',
                            userid: ''
                        }
                    };
                    this.User = this.as.getUser();
                }
                AppComponent = __decorate([
                    core_1.Component({
                        selector: 'ng2-app',
                        host: {},
                        styleUrls: ['components/app/app.css'],
                        templateUrl: 'components/app/app.html',
                        directives: [router_deprecated_1.RouterOutlet, navbar_1.NavbarComponent, categories_1.CategoriesComponent]
                    }),
                    router_deprecated_1.RouteConfig([
                        { path: "/feeds", name: "Feeds", component: feeds_1.FeedsComponent, useAsDefault: true },
                        { path: "/posts/:userid", name: "Posts", component: posts_1.PostsComponent },
                        { path: "/post/:postid", name: "EditPost", component: editpost_1.EditPostComponent },
                        { path: "/post", name: "ViewPost", component: viewpost_1.ViewPostComponent },
                        { path: "/newpost", name: "NewPost", component: newpost_1.NewPostComponent }
                    ]), 
                    __metadata('design:paramtypes', [authService_1.authService])
                ], AppComponent);
                return AppComponent;
            }());
            exports_1("AppComponent", AppComponent);
        }
    }
});
