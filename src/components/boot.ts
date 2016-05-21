

import { provide } from "@angular/core";
import { bootstrap } from "@angular/platform-browser-dynamic" ;
import { HTTP_PROVIDERS } from "@angular/http";
import { ROUTER_PROVIDERS } from "@angular/router-deprecated";
import { SERVICE_PROVIDER } from "./services/bootstrapServices"

import {AppComponent} from './app/app'

bootstrap(AppComponent, [
    HTTP_PROVIDERS,
    ROUTER_PROVIDERS,
    SERVICE_PROVIDER
]);