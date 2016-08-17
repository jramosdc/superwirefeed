// <reference path="../../../typings/index.d.ts">
System.register(['@angular/core'], function(exports_1, context_1) {
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
    var core_1;
    var embedlyService;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            }],
        execute: function() {
            embedlyService = (function () {
                function embedlyService() {
                    $.embedly.defaults.key = 'f81e196dc01b4cb49d68d48e9b1ea5f2';
                }
                embedlyService.prototype.extractAPI = function (url) {
                    var _this = this;
                    return new Promise(function (resolve, reject) {
                        if (url.length > 0) {
                            $.embedly.extract(url).progress(function (data) {
                                resolve(_this.extractProperties(data));
                            });
                        }
                        else {
                            resolve(null);
                        }
                    });
                };
                embedlyService.prototype.isPropertyValid = function (str) {
                    return str ? str : " ";
                };
                embedlyService.prototype.extractProperties = function (obj) {
                    var embedlyObj;
                    if (obj) {
                        embedlyObj = {
                            url: this.isPropertyValid(obj.url),
                            title: this.isPropertyValid(obj.title),
                            favicon_url: this.isPropertyValid(obj.favicon_url),
                            images: this.getImagesUrl(obj.images),
                            keywords: this.isPropertyValid(obj.keywords),
                        };
                    }
                    else {
                        embedlyObj = " ";
                    }
                    return embedlyObj;
                };
                embedlyService.prototype.getImagesUrl = function (imageObj) {
                    var images = [];
                    if (imageObj && imageObj instanceof Array && imageObj.length > 0) {
                        imageObj.forEach(function (val, index) {
                            if (val) {
                                var url = void 0;
                                if (val.thumbnail_url) {
                                    url = val.thumbnail_url;
                                }
                                else if (val.url) {
                                    url = val.url;
                                }
                                else {
                                    url = " ";
                                }
                                images.push({ url: url });
                            }
                        });
                        return images;
                    }
                    else {
                        return images;
                    }
                };
                embedlyService = __decorate([
                    core_1.Injectable(), 
                    __metadata('design:paramtypes', [])
                ], embedlyService);
                return embedlyService;
            }());
            exports_1("embedlyService", embedlyService);
        }
    }
});
