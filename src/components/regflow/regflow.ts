'use strict'

import { Component } from '@angular/core';
declare var $:JQueryStatic;

@Component({
  host: {},
  template: require('./regflow.html')
})

export class RegFlow {
  constructor () {
  }

  ngOnInit() {
    $('select')['material_select']()
  }
}
