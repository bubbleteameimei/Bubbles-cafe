import { Express } from "express";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { storage } from "./storage";
import bcryptjs from "bcryptjs";
import { createSecureLogger } from "./utils/secure-logger";

const authLogger = createSecureLogger('Auth');

// Extend Express.User with our User type but avoid password_hash
declare global {
	namespace Express {
		interface User {
			id: number;
			email: string;
			username: string;
			isAdmin: boolean;
			createdAt: Date;
		}
	}
}

export function setupAuth(app: Express) {
	app.use(passport.initialize());
	app.use(passport.session());

	passport.serializeUser((user: Express.User, done) => {
		authLogger.debug('Serializing user', { userId: user.id });
		done(null, user.id);
	});

	passport.deserializeUser(async (id: number, done) => {
		try {
			authLogger.debug('Deserializing user', { userId: id });
			const user = await storage.getUser(id);
			if (!user) {
				authLogger.warn('User not found during deserialization', { userId: id });
				return done(new Error('User not found'));
			}
			const { password_hash, ...safeUser } = user;
			done(null, safeUser);
		} catch (error) {
			authLogger.error('Error during deserialization', { userId: id, error: error instanceof Error ? error.message : 'Unknown error' });
			done(error);
		}
	});

	passport.use(new LocalStrategy({
		usernameField: 'email',
		passwordField: 'password'
	}, async (email: string, password: string, done) => {
		try {
			authLogger.debug('Login attempt', { email: email.trim().toLowerCase() });
			const normalizedEmail = email.trim().toLowerCase();
			const user = await storage.getUserByEmail(normalizedEmail);
			if (!user || !user.password_hash) {
				return done(null, false, { message: 'Invalid email or password' });
			}
			let isValid = false;
			try {
				isValid = await bcryptjs.compare(password, user.password_hash);
			} catch (compareError) {
				isValid = false;
			}
			if (!isValid) {
				return done(null, false, { message: 'Invalid email or password' });
			}
			const { password_hash: _ignore, ...safeUser } = user;
			return done(null, safeUser);
		} catch (error) {
			authLogger.error('Login error', { error: error instanceof Error ? error.message : 'Unknown error' });
			done(error);
		}
	}));
}