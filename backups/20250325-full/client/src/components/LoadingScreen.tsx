/**
 * This is a wrapper file to maintain backwards compatibility with existing imports.
 * All applications should standardize on importing the loading screen from ui/loading-screen.tsx.
 */

import { LoadingScreen as StandardLoadingScreen } from './ui/loading-screen';

export const LoadingScreen = StandardLoadingScreen;
export default StandardLoadingScreen;