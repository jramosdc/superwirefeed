System.register(['./searchCategory', "@angular/common", "./orderby", './searchPostTitle'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var searchCategory_1, common_1, orderby_1, searchPostTitle_1;
    var ApplicationPipes;
    return {
        setters:[
            function (searchCategory_1_1) {
                searchCategory_1 = searchCategory_1_1;
            },
            function (common_1_1) {
                common_1 = common_1_1;
            },
            function (orderby_1_1) {
                orderby_1 = orderby_1_1;
            },
            function (searchPostTitle_1_1) {
                searchPostTitle_1 = searchPostTitle_1_1;
            }],
        execute: function() {
            exports_1("ApplicationPipes", ApplicationPipes = [
                searchCategory_1.SearchCategory,
                orderby_1.OrderBy,
                common_1.DatePipe,
                searchPostTitle_1.SearchPostTitlePipe
            ]);
        }
    }
});
