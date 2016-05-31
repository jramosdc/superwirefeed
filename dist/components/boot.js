System.register(["@angular/platform-browser-dynamic", "@angular/http", "@angular/common", "@angular/router-deprecated", "angularfire2", "./services/bootstrapServices", './app/app'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var platform_browser_dynamic_1, http_1, common_1, router_deprecated_1, angularfire2_1, bootstrapServices_1, app_1;
    return {
        setters:[
            function (platform_browser_dynamic_1_1) {
                platform_browser_dynamic_1 = platform_browser_dynamic_1_1;
            },
            function (http_1_1) {
                http_1 = http_1_1;
            },
            function (common_1_1) {
                common_1 = common_1_1;
            },
            function (router_deprecated_1_1) {
                router_deprecated_1 = router_deprecated_1_1;
            },
            function (angularfire2_1_1) {
                angularfire2_1 = angularfire2_1_1;
            },
            function (bootstrapServices_1_1) {
                bootstrapServices_1 = bootstrapServices_1_1;
            },
            function (app_1_1) {
                app_1 = app_1_1;
            }],
        execute: function() {
            platform_browser_dynamic_1.bootstrap(app_1.AppComponent, [
                http_1.HTTP_PROVIDERS,
                common_1.FORM_PROVIDERS,
                router_deprecated_1.ROUTER_PROVIDERS,
                angularfire2_1.FIREBASE_PROVIDERS,
                angularfire2_1.defaultFirebase('https://superwireapp.firebaseio.com'),
                angularfire2_1.firebaseAuthConfig({ provider: angularfire2_1.AuthProviders.Password, method: angularfire2_1.AuthMethods.Password }),
                bootstrapServices_1.SERVICE_PROVIDER
            ]);
        }
    }
});
