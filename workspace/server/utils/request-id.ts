import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export const REQUEST_ID_HEADER = 'X-Request-Id';

export function generateRequestId(): string {
	return crypto.randomBytes(12).toString('hex');
}

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction) {
	const incoming = (req.headers[REQUEST_ID_HEADER.toLowerCase()] as string) || '';
	const id = incoming && typeof incoming === 'string' ? incoming : generateRequestId();
	(req as any).requestId = id;
	if (!res.headersSent) {
		res.setHeader(REQUEST_ID_HEADER, id);
	}
	next();
}