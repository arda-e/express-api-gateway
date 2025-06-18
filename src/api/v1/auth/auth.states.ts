import { TransitionMap, allow, buildTransitionMap } from "@utils/domain";

export enum UserState {
  NEW = "new",
  REGISTERED = "registered",
  AWAITING_CONFIRMATION = "awaiting_confirmation",
  ONBOARDED = "onboarded",
  PASSWORD_RESET = "password_reset",
  DELETED = "deleted",
}

export enum UserAction {
  REGISTER = "REGISTER",
  CONFIRM_EMAIL = "CONFIRM_EMAIL",
  COMPLETE_ONBOARDING = "COMPLETE_ONBOARDING",
  RESET_PASSWORD = "RESET_PASSWORD",
  DELETE = "DELETE",
}

export const USER_EMAIL_CONFIRMED = "USER_EMAIL_CONFIRMED";
export const USER_ONBOARDED = "USER_ONBOARDED";
export const USER_PASSWORD_RESET = "USER_PASSWORD_RESET";
export const USER_DELETED = "USER_DELETED";

/**
 * List of all valid user lifecycle transitions.
 * CURRENT_STATE => ACTION => NEW_STATE
 */
const userTransitionsList = [
  allow(UserState.NEW, UserAction.REGISTER, UserState.REGISTERED),
  allow(UserState.REGISTERED, UserAction.CONFIRM_EMAIL, UserState.AWAITING_CONFIRMATION),
  allow(UserState.REGISTERED, UserAction.DELETE, UserState.DELETED),
  allow(UserState.AWAITING_CONFIRMATION, UserAction.COMPLETE_ONBOARDING, UserState.ONBOARDED),
  allow(UserState.AWAITING_CONFIRMATION, UserAction.RESET_PASSWORD, UserState.PASSWORD_RESET),
  allow(UserState.AWAITING_CONFIRMATION, UserAction.DELETE, UserState.DELETED),
  allow(UserState.PASSWORD_RESET, UserAction.CONFIRM_EMAIL, UserState.AWAITING_CONFIRMATION),
  allow(UserState.PASSWORD_RESET, UserAction.DELETE, UserState.DELETED),
  allow(UserState.ONBOARDED, UserAction.RESET_PASSWORD, UserState.PASSWORD_RESET),
  allow(UserState.ONBOARDED, UserAction.DELETE, UserState.DELETED),
];

/**
 * A TransitionMap<UserState, UserAction> that powers the FSM engine.
 */
export const userTransitions: TransitionMap<UserState, UserAction> =
  buildTransitionMap(userTransitionsList);
