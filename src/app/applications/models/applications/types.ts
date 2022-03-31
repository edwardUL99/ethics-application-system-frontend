import { Answer } from './answer';
import { ApplicationComments } from './comment';

/**
 * Mapping of component ID to answer
 */
export type AnswersMapping = {
  [key: string]: Answer;
}

/**
 * This type represents a mapping of component ID to a comment
 */
export type CommentsMapping = {
  [key: string]: ApplicationComments;
}