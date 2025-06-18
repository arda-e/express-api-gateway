import { v4 as uuid } from "uuid";

/**
 * An abstract base class that provides common properties and functionality for models.
 *
 * Subclasses of `BaseModel` should represent a specific type of data model in the application.
 *
 * @property {number} id - The unique identifier for the model instance.
 * @property {Date} created_at - The date and time the model instance was created.
 * @property {Date} updated_at - The date and time the model instance was last updated.
 */
abstract class BaseModel {
  id: string;
  created_at: Date;
  updated_at: Date;

  protected constructor(id?: string, created_at?: Date, updated_at?: Date) {
    const now = new Date();

    this.id = id || uuid();
    this.created_at = created_at || now;
    this.updated_at = updated_at || now;
  }

  abstract toRecord(): any;
}

export default BaseModel;
