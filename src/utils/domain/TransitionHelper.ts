import { TransitionMap } from "./domain.types";

/**
 * Defines a single allowed state transition.
 * @template S - A valid UserState
 * @template E - A valid UserAction
 * @param from - The current state
 * @param action - The action to trigger
 * @param to - The resulting state
 * @returns A tuple representing the state transition
 */
export function allow<S extends string, E extends string>(from: S, action: E, to: S): [S, E, S] {
  return [from, action, to];
}

/**
 * Builds a TransitionMap from a list of allow() tuples.
 * @template S - UserState enum
 * @template E - UserAction enum
 * @param rules - Array of transitions using [from, action, to] format
 * @returns A complete TransitionMap usable by the FSM
 */
export function buildTransitionMap<S extends string, E extends string>(
  rules: readonly [S, E, S][],
): TransitionMap<S, E> {
  return rules.reduce(
    (map, [from, event, to]) => {
      if (!map[from]) map[from] = {};
      map[from]![event] = to;
      return map;
    },
    {} as TransitionMap<S, E>,
  );
}

/**
 * Fluent helper that executes a transition and returns the entity
 * for chaining, e.g. `entity.transition(Action).toModel()`
 */
export const chainableTransition = <T extends { transition(action: any): void }>(
  entity: T,
  action: any,
): T => {
  entity.transition(action);
  return entity;
};
