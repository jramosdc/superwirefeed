// <reference path="../../../typings/index.d.ts">

import {httpService} from './httpService'
import {authService} from './authService'
import {embedlyService} from './embedlyService';

export const ApplicationServices: Array<any> = [
    httpService,
    authService,
    embedlyService
];