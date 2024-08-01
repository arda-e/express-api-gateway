import bcrypt from 'bcryptjs';
import Model from '@utils/Model';

class User extends Model {
    username: string;
    email: string;
    password: string;

    constructor(id: number, username: string, email: string, password: string, created_at: Date, updated_at: Date) {
        super(id, created_at, updated_at);
        this.username = username;
        this.email = email;
        this.password = password;
    }

    async hashPassword(): Promise<void> {
        this.password = await bcrypt.hash(this.password, 10);
    }

    async validatePassword(password: string): Promise<boolean> {
        return await bcrypt.compare(password, this.password);
    }
}

export default User;