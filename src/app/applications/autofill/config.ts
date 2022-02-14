import { InjectorLocator } from "../../injectorlocator"
import { UserContext } from '../../users/usercontext';
import { AutofillConfig } from "./types";

/**
 * The configuration for the AutofillResolver
 */
export const Config: AutofillConfig = {
  /* TODO when such context is generated, do this 'application': {
    'value': () => ApplicationContext.getCurrentApplication(),
    'proxies': {
      'id': 'applicationId'
    }
  }*/
  user: {
    value: () => InjectorLocator.injector.get(UserContext).getUser()
  }
}