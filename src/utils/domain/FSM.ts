import { TransitionMap } from "@utils/domain/domain.types";

export class FSM<State extends string, Event extends string> {
  private state: State;
  private readonly transitions: TransitionMap<State, Event>;

  constructor(initialState: State, transitions: TransitionMap<State, Event>) {
    this.state = initialState;
    this.transitions = transitions;
  }

  public getState(): State {
    return this.state;
  }

  public canTransition(event: Event): boolean {
    return Boolean(this.transitions[this.state]?.[event]);
  }

  public transition(event: Event): void {
    const nextState = this.transitions[this.state]?.[event];
    if (!nextState) {
      throw new Error(`Invalid transition from ${this.state} on ${event}`);
    }
    this.state = nextState;
  }
}
