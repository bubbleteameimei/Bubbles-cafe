export const isAdmin = (req, res, next) => {
    if (!req.isAuthenticated()) {
        res.status(401).json({ message: "Not authenticated" });
        return;
    }
    if (!req.user?.isAdmin) {
        res.status(403).json({ message: "Access denied: Admin privileges required" });
        return;
    }
    next();
};
