import { OrderBy, Grouped, GroupedValues } from '../../search/grouping';
import { ApplicationResponse } from '../models/requests/applicationresponse';

/**
 * An abstract base for all order bys to extend
 */
export abstract class BaseOrder implements OrderBy<ApplicationResponse> {
  order(value: ApplicationResponse[] | Grouped<ApplicationResponse>): ApplicationResponse[] | Grouped<ApplicationResponse> {
    if (value instanceof Grouped) {
      const grouped: GroupedValues<ApplicationResponse> = {};
      Object.keys(value.grouped).forEach(key => {
        if (value.grouped[key]) {
          grouped[key] = this.doOrder(this.copyList(value.grouped[key]));
        }
      });

      return new Grouped<ApplicationResponse>(grouped, value.groupSort);
    } else {
      return this.doOrder(this.copyList(value));
    }
  }

  /**
   * Performs a shallow copy of the list
   * @param list the list to copy
   */
  private copyList(list: ApplicationResponse[]): ApplicationResponse[] {
    const copied = [];
    list.forEach(a => copied.push(a));

    return copied;
  }

  /**
   * Order the list. This will be called by the order method either on the value provided or each list of the grouped object
   * @param list the list to order
   */
  protected abstract doOrder(list: ApplicationResponse[]): ApplicationResponse[];
}


/** 
 * Sorts applications by ID ascending or descending
 */
export class ApplicationIDOrder extends BaseOrder {
  constructor(private ascending: boolean) {
    super();
  }

  protected doOrder(list: ApplicationResponse[]): ApplicationResponse[] {
    return list.sort((a: ApplicationResponse, b: ApplicationResponse) => {
      // ids are in format REC-1...REC-2, sort based on the sequence number, the number after - 
      const id1 = parseInt(a.id.split('-')[1]);
      const id2 = parseInt(b.id.split('-')[1]);

      return (this.ascending) ? id1 - id2 : id2 - id1;
    });
  }
}

/**
 * Sorts applications by the timestamp of when it was last updated, ascending or descending
 */
export class LastUpdatedOrder extends BaseOrder {
  constructor(private ascending: boolean) {
    super();
  }

  protected doOrder(list: ApplicationResponse[]): ApplicationResponse[] {
    return list.sort((a: ApplicationResponse, b: ApplicationResponse) =>
      (this.ascending) ? new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime() : 
        new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
  }
}