import { Session } from 'express-session';

declare global {
  namespace Express {
    interface Request {
      session: Session & {
        userId?: string;
      };
      user?: {
        id: string;
        email?: string;
        [key: string]: any;
      };
    }
  }
}

declare module 'express-session' {
  interface Session {
    userId?: string;
  }
}
