import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Rx';

@Injectable()
export default class SearchBarService {
    search$: Subject<string>;

    constructor() {
        this.search$ = new Subject<string>();
    }

}