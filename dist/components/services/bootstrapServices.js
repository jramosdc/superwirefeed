// <reference path="../../../typings/index.d.ts">
System.register(['./httpService', './authService'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var httpService_1, authService_1;
    var ApplicationServices;
    return {
        setters:[
            function (httpService_1_1) {
                httpService_1 = httpService_1_1;
            },
            function (authService_1_1) {
                authService_1 = authService_1_1;
            }],
        execute: function() {
            exports_1("ApplicationServices", ApplicationServices = [
                httpService_1.httpService,
                authService_1.authService
            ]);
        }
    }
});
