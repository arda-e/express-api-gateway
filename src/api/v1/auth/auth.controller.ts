import { Request, Response } from 'express';
import { container } from 'tsyringe';
import AuthService from './auth.service';

const authService = container.resolve(AuthService);

export const register = async (req: Request, res: Response): Promise<void> => {
    const { username, email, password } = req.body;
    try {
        const user = await authService.register(username, email, password);
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;
    try {
        const user = await authService.login(email, password);
        res.status(200).json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getUser = (req: Request, res: Response): void => {
    res.send('User!');
};