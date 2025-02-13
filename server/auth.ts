import { Express } from "express";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { storage } from "./storage";
import * as bcrypt from "bcrypt";

export function setupAuth(app: Express) {
  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((user: Express.User, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUserById(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  passport.use(new LocalStrategy({
    usernameField: "email",
    passwordField: "password"
  }, async (email: string, password: string, done) => {
    try {
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return done(null, false);
      }
      const isValid = await bcrypt.compare(password, user.password_hash);
      if (!isValid) {
        return done(null, false);
      }
      return done(null, user);
    } catch (error) {
      done(error);
    }
  }));
}