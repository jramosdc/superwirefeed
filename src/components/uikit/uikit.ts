'use strict'

import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@NgModule({
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})

@Component({
  host: {},
  template: require('./uikit.html')
})

export class UiKit {
  href: string;
  constructor () {
    this.href = window.location.href
  }
}