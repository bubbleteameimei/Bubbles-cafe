import React, { useEffect, useState } from 'react';
import Navigation from './navigation';
import { useLocation } from 'wouter';

interface AutoHideNavbarProps {
	// threshold?: number;
	hideOnPaths?: string[];
}

/**
 * AutoHideNavbar component - optimized for tablet, desktop, and laptop layouts
 * 
 * This component handles:
 * 1. Path-based conditional rendering of navigation
 * 2. Device-specific layout adjustments
 * 3. Navigation visibility based on page context
 * 
 * Note: To prevent layout reflow on first paint, navbar height related CSS variables
 * are now defined in CSS (see design-tokens.css). We avoid JS-driven updates that
 * would change layout after initial render.
 */
const AutoHideNavbar: React.FC<AutoHideNavbarProps> = ({
	// Do not hide on any path by default
	hideOnPaths = [] 
}) => {
	const [currentPath, setCurrentPath] = useState('');
	const [hidden] = useState(false);

	// Track scroll state only for potential styling (no auto-hide)
	useEffect(() => {
		const handleScroll = () => {
			// no-op for now; keep hook minimal to avoid reflows
		};
		window.addEventListener('scroll', handleScroll, { passive: true } as any);
		return () => window.removeEventListener('scroll', handleScroll as any);
	}, []);

	const [location] = useLocation();

	useEffect(() => {
		// Update current path whenever the router location changes
		setCurrentPath(location);
	}, [location]);

	// Check if current path is in the hideOnPaths array
	const shouldHideOnCurrentPath = hideOnPaths.some(path => 
		currentPath === path || 
		(path.endsWith('*') && currentPath.startsWith(path.slice(0, -1)))
	);

	// Don't render anything if we should completely hide on this path
	if (shouldHideOnCurrentPath) {
		return null;
	}

	// Return navigation fixed at the top with no translate transforms
	return (
		<div
			className="navbar-root fixed top-0 left-0 right-0 z-[100] w-full"
			style={{ width: "100%", margin: 0, padding: 0 }}
		>
			<div className="bg-transparent">
				<Navigation />
			</div>
		</div>
	);
};

export default AutoHideNavbar;