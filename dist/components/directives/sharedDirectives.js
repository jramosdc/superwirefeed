System.register(['../navbar/navbar', './clip', 'ng2-img-cropper'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var navbar_1, clip_1, ng2_img_cropper_1;
    var ApplicationDirectives;
    return {
        setters:[
            function (navbar_1_1) {
                navbar_1 = navbar_1_1;
            },
            function (clip_1_1) {
                clip_1 = clip_1_1;
            },
            function (ng2_img_cropper_1_1) {
                ng2_img_cropper_1 = ng2_img_cropper_1_1;
            }],
        execute: function() {
            exports_1("ApplicationDirectives", ApplicationDirectives = [
                navbar_1.NavbarComponent,
                clip_1.ClipboardDirective,
                ng2_img_cropper_1.ImageCropperComponent
            ]);
        }
    }
});
