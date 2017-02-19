'use strict'

import { Component } from '@angular/core';
declare var $:JQueryStatic;

@Component({
  host: {},
  template: require('./regflow.html')
})

export class RegFlow {
  Step: number;
  Steps: string[];

  constructor () {
    this.Step = 0;
    this.Steps = ['welcome', '']
  }

  ngOnInit() {
    $('form select')['material_select']()
  }

  onSubmit(d) {
    console.log(d)
    if (d.valid) this.Step += 1;
    $('form select')['material_select']()

    console.log(this.Step)
  }

  onDot(step) {
    this.Step = step;
  }
}
