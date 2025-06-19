import { IsDate, IsString, IsUUID } from "class-validator";
import BaseModel from "@utils/Model";

export enum TokenType {
  EmailVerification = "email_verification",
  PasswordReset = "password_reset",
}

export class VerificationTokenModel extends BaseModel {
  @IsUUID()
  userId: string;

  @IsString()
  token: string;

  @IsString()
  type: TokenType;

  @IsDate()
  expiresAt: Date;

  constructor(userId: string, token: string, type: TokenType, expiresAt: Date, id?: string) {
    super(id);
    this.userId = userId;
    this.token = token;
    this.type = type;
    this.expiresAt = expiresAt;
  }

  toRecord(): Record<string, any> {
    return {
      id: this.id,
      user_id: this.userId,
      token: this.token,
      type: this.type,
      expires_at: this.expiresAt,
      created_at: this.created_at,
      updated_at: this.updated_at,
    };
  }

  static fromRecord(row: any): VerificationTokenModel {
    return new VerificationTokenModel(row.user_id, row.token, row.type, row.expires_at, row.id);
  }
}

export default VerificationTokenModel;
