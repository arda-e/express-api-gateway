import { injectable, inject } from 'tsyringe';
import AuthRepository from "./Auth.repository";
import User from "./Auth.model";

@injectable()
class AuthService {
    constructor(
        @inject(AuthRepository) private authRepository: AuthRepository
    ) {}

    async register(
        username: string,
        email: string,
        password: string
    ): Promise<User> {
        console.log("AuthService register called with:", { username, email });
        const existingUser = await this.authRepository.findByEmail(email);
        if (existingUser) {
            console.log("User already exists:", email);
            throw new Error("User already exists");
        }

        const user = await this.authRepository.createUser(
            username,
            email,
            password
        );
        console.log("User created:", user);
        return user;
    }

    async login(email: string, password: string): Promise<User> {
        console.log("AuthService login called with:", { email });
        const user = await this.authRepository.findByEmail(email);
        if (!user || !(await user.validatePassword(password))) {
            console.log("Invalid credentials for:", email);
            throw new Error("Invalid credentials");
        }

        console.log("User authenticated:", user);
        return user;
    }
    async deleteUser(id: number): Promise<boolean> {
        try {
            const user = await this.authRepository.findById(id);
            if (!user) {
                // noinspection ExceptionCaughtLocallyJS
                throw new Error("User not found");
            }
            return await this.authRepository.deleteById(id);
        } catch(error) {
            console.log("Error in deleteUser:", error);
            return false;
        }
    }
}

export default AuthService;
