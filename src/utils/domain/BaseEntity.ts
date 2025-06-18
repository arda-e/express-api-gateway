import { FSM } from "@utils/domain/FSM";
import { TransitionMap } from "@utils/domain/domain.types";
import { DomainEvent } from "@utils/domain";

export abstract class BaseEntity<State extends string, Event extends string> {
  protected _state: State;
  protected readonly fsm: FSM<State, Event>;
  private readonly _domainEvents: DomainEvent[] = [];

  protected constructor(initialState: State, transitions: TransitionMap<State, Event>) {
    this._state = initialState;
    this.fsm = new FSM<State, Event>(initialState, transitions);
  }

  protected transition(event: Event): void {
    this.fsm.transition(event);
    this._state = this.fsm.getState();
  }

  protected raiseEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }

  public pullEvents(): DomainEvent[] {
    const events = [...this._domainEvents];
    this._domainEvents.length = 0;
    return events;
  }

  get state(): State {
    return this._state;
  }
}
