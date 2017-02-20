'use strict'

import { Component, trigger, transition, style, animate } from '@angular/core';
declare var $:JQueryStatic;

@Component({
  host: {},
  template: require('./regflow.html'),
  animations: [
    trigger(
      'modalSlider', [
        transition(':enter', [
          style({transform: 'translateX(100%)', opacity: 0}),
          animate('200ms', style({transform: 'translateX(0)', opacity: 1}))
        ]),
        transition(':leave', [
          style({transform: 'translateX(0)', opacity: 1}),
          animate('200ms', style({transform: 'translateX(-100%)', opacity: 0}))
        ])
      ]
    ),
    trigger(
      'modalFader', [
        transition(':enter', [
          style({opacity: 0}),
          animate('200ms', style({opacity: 1}))
        ]),
        transition(':leave', [
          style({opacity: 1}),
          animate('200ms', style({opacity: 0}))
        ])
      ]
    )
  ],
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
