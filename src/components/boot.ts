import 'reflect-metadata';
import 'core-js';
import 'zone.js/dist/zone';
import 'jquery/dist/jquery';
import 'jquery-embedly/jquery.embedly';
import 'bootstrap';
import 'firebase';
import 'materialize-css/dist/js/materialize';
import 'materialize-tags';
import 'linkifyjs/dist/linkify';
import 'linkifyjs/dist/linkify-jquery';
import '../lib/papaparse';
// import 'tinymce/tinymce';
// import 'tinymce/themes/modern/theme';


import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { enableProdMode } from "@angular/core";

import { AppModule } from './module';

enableProdMode();

platformBrowserDynamic().bootstrapModule(AppModule);