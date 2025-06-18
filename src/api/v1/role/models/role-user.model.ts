import { IsUUID, IsNotEmpty } from "class-validator";
import Model from "@utils/Model";

class RoleUser extends Model {
  @IsUUID()
  @IsNotEmpty()
  user_id: string;

  @IsUUID()
  @IsNotEmpty()
  role_id: string;

  constructor(id: string | undefined, user_id: string, role_id: string) {
    super(id);
    this.user_id = user_id;
    this.role_id = role_id;
  }

  toRecord(): Record<string, any> {
    return {
      id: this.id,
      user_id: this.user_id,
      role_id: this.role_id,
      created_at: this.created_at,
      updated_at: this.updated_at,
    };
  }
}

export default RoleUser;
