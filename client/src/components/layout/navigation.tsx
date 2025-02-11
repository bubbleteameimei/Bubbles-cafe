import { useLocation } from "wouter";

export default function Navigation() {
  const [location, setLocation] = useLocation();

  return (
    <header>
      <div>
        <nav role="menu" aria-label="Main navigation">
          <div>
            <button onClick={() => setLocation('/')}>Home</button>
            <button onClick={() => setLocation('/stories')}>Stories</button>
            <button onClick={() => setLocation('/reader')}>Reader</button>
            <button onClick={() => setLocation('/secret')}>Secret Stories</button>
            <button onClick={() => setLocation('/index')}>Index</button>
            <button onClick={() => setLocation('/about')}>About</button>
            <button onClick={() => setLocation('/contact')}>Contact</button>
            <button onClick={() => setLocation('/admin')}>Admin</button>
          </div>
        </nav>
      </div>
    </header>
  );
}