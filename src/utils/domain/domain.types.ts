export type TransitionMap<State extends string, Event extends string> = {
  [S in State]?: Partial<Record<Event, State>>;
};

export interface DomainEvent {
  type: string;
  payload: any;
}
