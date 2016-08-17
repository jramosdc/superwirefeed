// <reference path="../../../typings/index.d.ts">

import { Injectable } from '@angular/core';

@Injectable()
export class embedlyService {

    constructor() {
        $.embedly.defaults.key = 'f81e196dc01b4cb49d68d48e9b1ea5f2';
    }

    extractAPI(url: string) {
        return new Promise((resolve, reject) => {
            if (url.length > 0) {
                $.embedly.extract(url).progress((data) => {
                    resolve(this.extractProperties(data));
                });
            } else {
                resolve(null);
            }
        });
    }

    isPropertyValid(str: any): any {
        return str ? str : " ";
    }

    private extractProperties(obj) {
        let embedlyObj: IEmbedly | string;
        if (obj) {
            embedlyObj = {
                url: this.isPropertyValid(obj.url),
                title: this.isPropertyValid(obj.title),
                favicon_url: this.isPropertyValid(obj.favicon_url),
                images: this.getImagesUrl(obj.images),
                keywords: this.isPropertyValid(obj.keywords),
            }
        } else {
            embedlyObj = " ";
        }


        return embedlyObj;
    }

    public getImagesUrl(imageObj: any[]): any[] {
        let images: Array<{ url: string }> = [];
        if (imageObj && imageObj instanceof Array && imageObj.length > 0) {
            imageObj.forEach((val, index) => {
                if (val) {
                    let url: string;
                    if (val.thumbnail_url) {
                        url = val.thumbnail_url;
                    } else if (val.url) {
                        url = val.url;
                    } else {
                        url = " ";
                    }
                    images.push({ url: url });
                }
            });
            return images;
        } else {
            return images;
        }
    }
}



export interface IEmbedly {
    url: string;
    title: string;
    favicon_url: string;
    images: any;
    keywords: any
}