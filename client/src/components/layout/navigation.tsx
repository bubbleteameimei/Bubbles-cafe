import { useLocation } from "wouter";

export default function Navigation() {
  const [location, setLocation] = useLocation();

  return (
    <header className="sticky top-0 bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4">
        <nav role="menu" aria-label="Main navigation" className="py-4">
          <div className="flex items-center gap-4 justify-center">
            <button 
              onClick={() => setLocation('/')} 
              className={`px-3 py-2 ${location === '/' ? 'text-primary' : ''}`}
            >
              Home
            </button>
            <button 
              onClick={() => setLocation('/stories')} 
              className={`px-3 py-2 ${location === '/stories' ? 'text-primary' : ''}`}
            >
              Stories
            </button>
            <button 
              onClick={() => setLocation('/reader')} 
              className={`px-3 py-2 ${location === '/reader' ? 'text-primary' : ''}`}
            >
              Reader
            </button>
            <button 
              onClick={() => setLocation('/secret')} 
              className={`px-3 py-2 ${location === '/secret' ? 'text-primary' : ''}`}
            >
              Secret Stories
            </button>
            <button 
              onClick={() => setLocation('/index')} 
              className={`px-3 py-2 ${location === '/index' ? 'text-primary' : ''}`}
            >
              Index
            </button>
            <button 
              onClick={() => setLocation('/about')} 
              className={`px-3 py-2 ${location === '/about' ? 'text-primary' : ''}`}
            >
              About
            </button>
            <button 
              onClick={() => setLocation('/contact')} 
              className={`px-3 py-2 ${location === '/contact' ? 'text-primary' : ''}`}
            >
              Contact
            </button>
            <button 
              onClick={() => setLocation('/admin')} 
              className={`px-3 py-2 ${location === '/admin' ? 'text-primary' : ''}`}
            >
              Admin
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}