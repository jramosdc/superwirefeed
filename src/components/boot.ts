/// <reference path="../../node_modules/angular2/typings/browser.d.ts"/>

import { provide } from "angular2/core";
import { bootstrap } from "angular2/platform/browser" ;
import { HTTP_PROVIDERS } from "angular2/http";
import { ROUTER_PROVIDERS, LocationStrategy, HashLocationStrategy} from "angular2/router";
import { SERVICE_PROVIDER } from "./services/bootstrapServices"

import {AppComponent} from './app/app'

bootstrap(AppComponent, [
    HTTP_PROVIDERS,
    ROUTER_PROVIDERS,
    provide(LocationStrategy, { useClass: HashLocationStrategy }),
    SERVICE_PROVIDER
]);