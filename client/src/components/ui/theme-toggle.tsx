
import { useTheme } from "@/lib/theme-provider";
import "./theme-toggle.css";

interface ThemeToggleProps {
  variant?: 'icon' | 'animated';
}

export function ThemeToggle({ variant = 'icon' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  if (variant === 'animated') {
    return (
      <div className="wrapper">
        <input
          type="checkbox"
          className="switch"
          checked={theme === 'dark'}
          onChange={toggleTheme}
          aria-label="Toggle theme"
        />
      </div>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle-icon"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path 
            d="M10 15C12.7614 15 15 12.7614 15 10C15 7.23858 12.7614 5 10 5C7.23858 5 5 7.23858 5 10C5 12.7614 7.23858 15 10 15Z"
            fill="#C09B6F"
            stroke="#C09B6F"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path 
            d="M10 1.25V2.5" 
            stroke="#C09B6F"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path 
            d="M10 17.5V18.75" 
            stroke="#C09B6F"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path 
            d="M3.75 3.75L4.68 4.68" 
            stroke="#C09B6F"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path 
            d="M15.31 15.31L16.25 16.25" 
            stroke="#C09B6F"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path 
            d="M1.25 10H2.5" 
            stroke="#C09B6F"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path 
            d="M17.5 10H18.75" 
            stroke="#C09B6F"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path 
            d="M3.75 16.25L4.68 15.31" 
            stroke="#C09B6F"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path 
            d="M15.31 4.68L16.25 3.75" 
            stroke="#C09B6F"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path 
            d="M17.5 10.8168C17.4559 12.5434 16.8197 14.2018 15.6976 15.5259C14.5754 16.85 13.0348 17.7612 11.3386 18.1122C9.64234 18.4632 7.88488 18.2309 6.33681 17.4506C4.78874 16.6703 3.5357 15.387 2.79684 13.8184C2.05798 12.2498 1.84988 10.4869 2.22372 8.79949C2.59756 7.11208 3.53015 5.58625 4.87075 4.48701C6.21135 3.38776 7.88089 2.77914 9.60842 2.76291C11.336 2.74668 13.0158 3.32388 14.375 4.3981C15.4654 5.2528 16.3017 6.37145 16.7894 7.63977C17.2771 8.90809 17.4008 10.2787 17.1482 11.6086"
            stroke="#5A4534"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path 
            d="M14.3667 9.16675C14.2 9.00008 13.4 8.38341 12.4667 8.80008C11.5333 9.21675 11.7333 10.0334 11.8 10.3501"
            stroke="#5A4534"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}
