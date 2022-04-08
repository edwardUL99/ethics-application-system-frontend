import { InjectorService } from "../../injector.service"
import { UserContext } from '../../users/usercontext';
import { AutofillConfig } from "./types";
import { ApplicationContext } from '../applicationcontext';

/**
 * The configuration for the AutofillResolver
 */
export const Config: AutofillConfig = {
  application: {
    value: () => InjectorService.getInstance().inject(ApplicationContext).getApplication(),
    proxies: {
      id: 'applicationId'
    }
  },
  user: {
    value: () => InjectorService.getInstance().inject(UserContext).getUser()
  }
}