'use strict'

import { Component } from '@angular/core';
declare var $:JQueryStatic;

@Component({
  host: {},
  template: require('./regflow.html')
})

export class RegFlow {
  Step: number;
  StepLimit: number;
  UserInfo: Object;

  constructor () {
    this.Step = 0;
    this.StepLimit = 0;
    this.UserInfo = {
      interests: {},
      feedName: ''
    };
  }

  ngOnInit() {
    $('form select')['material_select']()
  }

  onSubmit(d) {
    if (d.valid) this.Step += 1
    if (this.Step > this.StepLimit) this.StepLimit = this.Step

    var t = window.setTimeout(() => {
      $('form select')['material_select']()
      window.clearTimeout(t)
    }, 0)
  }

  onDot(step) {
    if (step <= this.StepLimit) this.Step = step;

    var t = window.setTimeout(() => {
      $('form select')['material_select']()
      window.clearTimeout(t)
    }, 0)
  }
}
