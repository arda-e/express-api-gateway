import { Session } from 'express-session';

declare module 'express-serve-static-core' {
  interface Request {
    session: Session & {
      userId?: string;
    };
  }
}

declare module 'express-session' {
  interface Session {
    userId?: string;
  }
}
