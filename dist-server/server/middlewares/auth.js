/**
 * Authentication Middleware
 *
 * Middleware functions for protecting routes based on authentication status.
 */
import logger from '../utils/logger';
/**
 * Check if user is authenticated
 *
 * @param req Express request
 * @param res Express response
 * @param next Next function
 */
export function isAuthenticated(req, res, next) {
    if (req.user) {
        return next();
    }
    logger.warn('[Auth] Unauthorized access attempt', {
        path: req.path,
        ip: req.ip,
    });
    res.status(401).json({
        success: false,
        message: 'Authentication required',
    });
}
/**
 * Check if user is an admin
 *
 * @param req Express request
 * @param res Express response
 * @param next Next function
 */
export function isAdmin(req, res, next) {
    if (req.user?.isAdmin) {
        return next();
    }
    logger.warn('[Auth] Unauthorized admin access attempt', {
        path: req.path,
        ip: req.ip,
        user: req.user?.id,
    });
    // If user is not authenticated at all
    if (!req.user) {
        res.status(401).json({
            success: false,
            message: 'Authentication required',
        });
        return;
    }
    // If user is authenticated but not an admin
    res.status(403).json({
        success: false,
        message: 'Admin privileges required',
    });
    return;
}
/**
 * Require authentication middleware
 */
export const requireAuth = isAuthenticated;
/**
 * Require admin privileges middleware
 */
export const requireAdmin = isAdmin;
