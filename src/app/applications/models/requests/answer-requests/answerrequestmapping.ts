import { AnswerRequest } from '../../applications/answer-requests/answerrequest';
import { AnswerRequestResponse } from './responses';

import { getResponseMapper } from '../mapping/applicationmapper';
import { userResponseMapper } from '../../../../users/responses/userresponse';
import { ApplicationComponent } from '../../components/applicationcomponent';
import { ComponentObject, Converters } from '../../parsing/converters';
import { map, Observable } from 'rxjs';

/**
 * Map the components into concrete components
 * @param components the components to map
 */
function mapComponents(components: ComponentObject[]): ApplicationComponent[] {
  return components.map(component => Converters.get(component.type).convert(component));
}

/**
 * Map the given request response into a request object
 * @param request the request to map
 */
export function mapAnswerRequest(request: AnswerRequestResponse): Observable<AnswerRequest> {
  return getResponseMapper(request.application.status).map(request.application)
    .pipe(
      map(response => new AnswerRequest(
        request.id,
        response,
        userResponseMapper(request.user),
        mapComponents(request.components),
        new Date(request.requestedAt)
      ))
    );
}