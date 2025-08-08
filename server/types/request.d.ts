import 'express-serve-static-core';

declare module 'express-serve-static-core' {
  interface Request {
    login?: (user: any, done?: (err?: any) => void) => void;
    logIn?: (user: any, done?: (err?: any) => void) => void;
    logout?: (done?: (err?: any) => void) => void;
    isAuthenticated?: () => boolean;
  }
}