// <reference path="../../../typings/index.d.ts">

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'searchCategory'
})
export class SearchCategory implements PipeTransform {
  transform(values, args?) {
    let filter: string = args;
    return filter === 'All' ? values :
      filter ? values.filter(value => value.category.toLocaleLowerCase().indexOf(filter.toLocaleLowerCase()) !== -1) : values;
  }
}