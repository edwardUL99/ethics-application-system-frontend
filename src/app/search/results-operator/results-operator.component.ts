import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { GroupBy, Grouper, GroupOption, OrderBy, OrderOption } from '../grouping';

/**
 * Map of registered groupers
 */
type RegisteredGroupers = {
  [key: string]: Grouper<any>;
};

/**
 * Map of registered order bys
 */
type RegisteredOrderers = {
  [key: string]: OrderBy<any>;
}

/**
 * A component that performs operations on a list of existing results or results from a search. Leaves the actual rendering 
 * of the operations to the component consuming the results, this control simply just emits events indicating that the operation is requested
 * and that the hosting component should act on it
 */
@Component({
  selector: 'app-results-operator',
  templateUrl: './results-operator.component.html',
  styleUrls: ['./results-operator.component.css']
})
export class ResultsOperatorComponent implements OnInit {
  /**
   * If the search is to enable grouping, the groupOptions array can be passed in
   */
  @Input() groupOptions: GroupOption[];
  /**
  * If the search is to enable ordering, the options can be passed in here
  */
  @Input() orderOptions: OrderOption[];
  /**
   * The selected group option
   */
  selectedGroup: GroupOption;
  /**
  * The selected order by option
  */
  selectedOrder: OrderOption;
  /**
  * Map of registered groupers
  */
  private groupers: RegisteredGroupers = {};
  /**
  * Map of registered order bys
  */
  private orderers: RegisteredOrderers = {};
  /**
  * A default order if specified
  */
  private defaultOrder: OrderOption;
  /**
   * Emits that a grouping of results is requested
   */
  @Output() groupRequested: EventEmitter<GroupBy<any>> = new EventEmitter<GroupBy<any>>();
  /**
  * Emitted when an order by is requested
  */
  @Output() orderRequested: EventEmitter<OrderBy<any>> = new EventEmitter<OrderBy<any>>();

  constructor() { }

  ngOnInit(): void {
    if (this.groupOptions) {
      this.groupOptions.forEach(option => {
        this.groupers[option.value] = option.grouper;
      })
    }

    if (this.orderOptions) {
      this.orderOptions.forEach(option => {
        this.orderers[option.value] = option.orderBy;

        if (option.default) {
          this.defaultOrder = option;
        }
      });
    }
  }

  applyDefault() {
    this.orderByChosen(this.defaultOrder);
  }

  reset() {
    this.selectedGroup = undefined;
    this.orderByChosen(this.defaultOrder);
  }

  groupByChosen(option: GroupOption) {
    if (option == undefined) {
      this.groupRequested.emit(undefined);
      this.selectedGroup = undefined;
    } else {
      const groupBy = new GroupBy(this.groupers[option.value]);
      this.groupRequested.emit(groupBy);
      this.selectedGroup = option;
    }

    if (this.selectedOrder) {
      this.orderByChosen(this.selectedOrder);
    }
  }

  orderByChosen(option: OrderOption) {
    if (option == undefined) {
      this.orderRequested.emit(undefined);
      this.selectedOrder = undefined;
    } else {
      const orderBy = this.orderers[option.value];
      this.orderRequested.emit(orderBy);
      this.selectedOrder = option;
    }
  }
}
