import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'searchCategory'
})
export class SearchCategory implements PipeTransform {
  transform(values, args?) {
    let filter: string = args;
    return filter === 'All' ? values :
      filter ? values.filter(value => {
        if (value && value.category) {
          return value.category.toLocaleLowerCase().indexOf(filter.toLocaleLowerCase()) !== -1;
        } else {
          return false;
        }
      }) : values;
  } // transform
}