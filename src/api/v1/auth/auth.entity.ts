import { UserModel } from "@api/v1/auth/auth.model";
import { BaseEntity, DomainEvent } from "@utils/domain";
import { UserAction, UserState, userTransitions } from "@api/v1/auth/auth.states";
import { Knex } from "knex";
import { EventType } from "@utils/queue/EventTypes";

import { AuthRepository } from "./auth.repository";

export class UserEntity extends BaseEntity<UserState, UserAction> {
  private readonly _model: UserModel;

  private constructor(model: UserModel) {
    super(model.state, userTransitions);
    this._model = model;
  }

  static create(model: UserModel): UserEntity {
    return new UserEntity(model);
  }

  transition(action: UserAction): this {
    super.transition(action);
    return this;
  }

  raise(eventType: EventType): this {
    const payload = this.buildEventPayload(eventType);
    this.raiseEvent({ type: eventType, payload });
    return this;
  }

  async persist(repo: AuthRepository, trx: Knex.Transaction): Promise<UserEntity> {
    await repo.update(this.id, this.toModel(), trx);
    return this;
  }

  private buildEventPayload(eventType: EventType): any {
    switch (eventType) {
      case EventType.UserRegistered:
        // case EventType.UserDeleted:
        // case EventType.UserPasswordReset:
        return { userId: this._model.id, email: this._model.email };
      default:
        throw new Error(`Unrecognized event type: ${eventType}`);
    }
  }

  toModel(): UserModel {
    this._model.state = this.state;
    return this._model;
  }

  get model(): UserModel {
    return this._model;
  }

  get id(): string {
    return this._model.id;
  }

  getDomainEvents(): DomainEvent[] {
    return this.pullEvents();
  }

  clearDomainEvents(): void {
    this.pullEvents();
  }
}

export default UserEntity;
