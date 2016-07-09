System.register(['@angular/router', './feeds/feeds', './posts/posts', './newpost/newpost', './editpost/editpost', './viewpost/viewpost', './profile/profile'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var router_1, feeds_1, posts_1, newpost_1, editpost_1, viewpost_1, profile_1;
    var routes, APP_ROUTER_PROVIDERS;
    return {
        setters:[
            function (router_1_1) {
                router_1 = router_1_1;
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
            function (profile_1_1) {
                profile_1 = profile_1_1;
            }],
        execute: function() {
            routes = [
                { path: "feeds", component: feeds_1.FeedsComponent },
                { path: "newpost", component: newpost_1.NewPostComponent },
                { path: "posts/:feedid", component: posts_1.PostsComponent },
                { path: "editpost/:postid", component: editpost_1.EditPostComponent },
                { path: "post/:postid", component: viewpost_1.ViewPostComponent },
                { path: "profile/:userid", component: profile_1.ProfileComponent },
                { path: "", redirectTo: "feeds", terminal: true }
            ];
            exports_1("APP_ROUTER_PROVIDERS", APP_ROUTER_PROVIDERS = [
                router_1.provideRouter(routes)
            ]);
        }
    }
});
