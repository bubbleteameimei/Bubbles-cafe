import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import ThemeToggle from './ThemeToggle'; // Added import for ThemeToggle

function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-background p-4 shadow-md">
      <nav className="container mx-auto flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-foreground">
          My App
        </Link>
        <div className="flex items-center gap-4">
          <ThemeToggle /> {/* Added ThemeToggle component */}
          <Link to="/search" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Search
          </Link>
          {user ? (
            <>
              <span className="text-sm font-medium text-muted-foreground">
                {user.email}
              </span>
              <button
                onClick={logout}
                className="text-sm font-medium text-red-500 hover:underline"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="text-sm font-medium text-foreground hover:underline"
            >
              Login
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Header;

// Assume this is the ThemeToggle component (needs to be implemented separately)
const ThemeToggle = () => {
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    // Add logic here to actually switch the theme (e.g., using CSS variables or a theme provider)
    document.body.classList.toggle('dark');
  };

  return (
    <button onClick={toggleTheme}>
      {isDarkMode ? 'Light Mode' : 'Dark Mode'}
    </button>
  );
};