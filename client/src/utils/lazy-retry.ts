import React from 'react';

export function lazyWithRetry<T>(
	importer: () => Promise<{ default: T }>,
	retries: number = 2,
	delayMs: number = 300
) {
	return React.lazy(async () => {
		let lastError: unknown = null;
		for (let attempt = 0; attempt <= retries; attempt++) {
			try {
				return await importer();
			} catch (error) {
				lastError = error;
				if (attempt === retries) break;
				await new Promise((resolve) => setTimeout(resolve, delayMs * (attempt + 1)));
			}
		}
		throw (lastError instanceof Error ? lastError : new Error('Load failed'));
	});
}