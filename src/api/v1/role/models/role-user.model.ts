import Model from '@utils/Model';
import { IsUUID, IsNotEmpty } from 'class-validator';

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
}

export default RoleUser;
