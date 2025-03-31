import React, { useEffect, useState } from 'react';
import '../styles/buns.css';

// Y2K nostalgic styling for the Buns page that emulates cherubiims.neocities.org
const BunsPage = () => {
  const [counter, setCounter] = useState(12345);
  
  useEffect(() => {
    // Add body class for custom cursor
    document.body.classList.add('buns-active');
    
    // Create a cursor trail effect (sparkles following cursor)
    const createSparkle = (e: MouseEvent) => {
      const sparkle = document.createElement('div');
      sparkle.className = 'sparkle';
      sparkle.style.left = `${e.pageX}px`;
      sparkle.style.top = `${e.pageY}px`;
      document.body.appendChild(sparkle);
      
      setTimeout(() => {
        sparkle.remove();
      }, 600);
    };
    
    // Randomly increment visitor counter for that authentic Y2K feel
    const incrementCounter = setInterval(() => {
      setCounter(prev => prev + Math.floor(Math.random() * 3) + 1);
    }, 30000);
    
    window.addEventListener('mousemove', createSparkle);
    
    return () => {
      // Clean up
      document.body.classList.remove('buns-active');
      window.removeEventListener('mousemove', createSparkle);
      clearInterval(incrementCounter);
    };
  }, []);
  
  // Ethereal marquee component for creepy cute aesthetic
  const Y2KMarquee = ({ text }: { text: string }) => (
    <div style={{ 
      overflow: 'hidden', 
      whiteSpace: 'nowrap', 
      background: 'linear-gradient(to right, rgba(182, 157, 198, 0.3), rgba(217, 193, 224, 0.3), rgba(182, 157, 198, 0.3))',
      padding: '7px 0',
      border: '1px solid rgba(182, 157, 198, 0.4)',
      borderRadius: '15px',
      margin: '1.2rem 0',
      position: 'relative',
      backdropFilter: 'blur(1px)'
    }}>
      <div style={{ 
        display: 'inline-block',
        animation: 'marquee 25s linear infinite',
        paddingLeft: '100%'
      }}>
        <span style={{
          fontFamily: "'Quicksand', sans-serif",
          fontSize: '1rem',
          fontWeight: 300,
          color: '#9370db',
          letterSpacing: '0.5px'
        }}>{text}</span>
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
  
  return (
    <div className="buns-page">
      {/* Y2K-style background with tiled pattern */}
      <div className="y2k-background"></div>
      
      <div className="buns-container">
        {/* Header with glitter text */}
        <header className="buns-header">
          <div className="glitter-text">♡ Welcome to Buns' Corner ♡</div>
          <div className="pixel-divider"></div>
        </header>
        
        {/* Classic marquee - very Y2K */}
        <Y2KMarquee text="✧･ﾟ: * Welcome to my Y2K wonderland! * Under construction! * Thanks for visiting! * Please sign my guestbook! * ･ﾟ✧*:･ﾟ✧" />
        
        <div className="buns-content">
          {/* Sidebar with links */}
          <aside className="buns-sidebar">
            <div className="sidebar-box">
              <h3 className="sidebar-title">
                <span className="rotate-star">★</span> Navigation <span className="rotate-star">★</span>
              </h3>
              <div className="sidebar-links">
                <a href="#" className="y2k-link">♡ Home ♡</a>
                <a href="#" className="y2k-link">♡ About Me ♡</a>
                <a href="#" className="y2k-link">♡ Pixel Pets ♡</a>
                <a href="#" className="y2k-link">♡ Dollz ♡</a>
                <a href="#" className="y2k-link">♡ Guestbook ♡</a>
              </div>
            </div>
            
            <div className="sidebar-box">
              <h3 className="sidebar-title">
                <span className="blink-text">☆ Mood ☆</span>
              </h3>
              <div className="mood-box">
                <div className="mood-item">
                  <span className="mood-label">Current Mood:</span>
                  <span className="mood-value">✧ Dreamy ✧</span>
                </div>
                <div className="mood-item">
                  <span className="mood-label">Listening to:</span>
                  <span className="mood-value">✧ Dream Pop ♫ ✧</span>
                </div>
                <div className="pixel-cat">
                  <img src="/buns/pixel-cat.svg" alt="Pixel Cat" className="pixel-gif" />
                </div>
              </div>
            </div>
            
            <div className="sidebar-box visitor-counter">
              <h3 className="sidebar-title">
                <span className="blink-text">★ Visitors ★</span>
              </h3>
              <div className="counter">
                <span className="counter-text">You are visitor #</span>
                <span className="counter-number">{counter}</span>
                <div style={{ marginTop: '8px', fontSize: '0.8rem', color: '#9370db', letterSpacing: '0.5px', fontFamily: "'Quicksand', sans-serif" }}>
                  <span className="blink-text">⚡ Counter updates in real-time! ⚡</span>
                </div>
              </div>
            </div>
          </aside>
          
          {/* Main content area */}
          <main className="buns-main">
            <section className="intro-section">
              <h2 className="section-title">✧･ﾟ: *✧･ﾟ Hello! ･ﾟ✧*:･ﾟ✧</h2>
              <div className="intro-content">
                <div className="intro-image">
                  <img src="/buns/angel-bunny.svg" alt="Angel Bunny" className="pixel-gif" />
                </div>
                <p className="intro-text">
                  <span style={{ fontSize: '1.1rem', color: '#9370db', fontWeight: '500', letterSpacing: '0.5px' }}>
                    Welcome to my little corner of the web!
                  </span>
                  <br /><br />
                  I'm Buns, and this is my dreamy 
                  sanctuary. Feel free to explore and stay as long as you like! This page is a tribute 
                  to the ethereal personal websites from the early 2000s, when the internet felt 
                  more personal and a little mysterious.
                  <br /><br />
                  <span className="blink-text">☆ Enjoy your stay! ☆</span>
                </p>
              </div>
            </section>
            
            <div className="pixel-divider rainbow"></div>
            
            <section className="favorites-section">
              <h2 className="section-title">*✧･ﾟ My Favorite Things ･ﾟ✧*</h2>
              <div className="favorites-grid">
                <div className="favorite-item">
                  <img src="/buns/heart.svg" alt="Heart" className="pixel-gif" />
                  <span>Cute Plushies</span>
                </div>
                <div className="favorite-item">
                  <img src="/buns/star.svg" alt="Star" className="pixel-gif" />
                  <span>Sparkly Things</span>
                </div>
                <div className="favorite-item">
                  <img src="/buns/music.svg" alt="Music" className="pixel-gif" />
                  <span>Dream Pop</span>
                </div>
                <div className="favorite-item">
                  <img src="/buns/candy.svg" alt="Candy" className="pixel-gif" />
                  <span>Sweet Treats</span>
                </div>
                <div className="favorite-item">
                  <img src="/buns/book.svg" alt="Book" className="pixel-gif" />
                  <span>Fantasy Books</span>
                </div>
                <div className="favorite-item">
                  <img src="/buns/moon.svg" alt="Moon" className="pixel-gif" />
                  <span>Stargazing</span>
                </div>
              </div>
            </section>
            
            <div className="pixel-divider rainbow"></div>
            
            <section className="dollz-section">
              <h2 className="section-title">✧･ﾟ Pixel Dollz Collection ･ﾟ✧</h2>
              <div className="dollz-gallery">
                <div className="doll-item">
                  <img src="/buns/doll1.svg" alt="Pixel Doll 1" className="pixel-doll" />
                </div>
                <div className="doll-item">
                  <img src="/buns/doll2.svg" alt="Pixel Doll 2" className="pixel-doll" />
                </div>
                <div className="doll-item">
                  <img src="/buns/doll3.svg" alt="Pixel Doll 3" className="pixel-doll" />
                </div>
              </div>
              <div className="doll-text">
                <p>Collect and customize your own pixel dollz! These are my favorite outfits ♡</p>
              </div>
            </section>
            
            <div className="pixel-divider"></div>
            
            <section className="guestbook-section">
              <h2 className="section-title">✧･ﾟ My Guestbook ･ﾟ✧</h2>
              <div className="guestbook-preview">
                <div className="guestbook-entry">
                  <div className="entry-header">
                    <span className="entry-name">✧ Stardust ✧</span>
                    <span className="entry-date">03/25/25</span>
                  </div>
                  <div className="entry-message">
                    Love your page! The design is so nostalgic and cute. Keep it up! xoxo
                  </div>
                </div>
                <div className="guestbook-entry">
                  <div className="entry-header">
                    <span className="entry-name">✧ CutieKitten ✧</span>
                    <span className="entry-date">03/20/25</span>
                  </div>
                  <div className="entry-message">
                    This takes me back to the early 2000s! I miss websites like this so much!
                  </div>
                </div>
              </div>
              <div className="guestbook-link">
                <a href="#" className="glitter-button">
                  <span className="rotate-star">✧</span> Sign my Guestbook <span className="rotate-star">✧</span>
                </a>
              </div>
            </section>
          </main>
        </div>
        
        <footer className="buns-footer">
          <div className="pixel-divider rainbow"></div>
          <div className="footer-content">
            <div className="footer-text">
              ✧ Made with love by Buns ✧
              <br />
              ✧ Last updated: March 31, 2025 ✧
              <br />
              <span className="blink-text">☆ Thank you for visiting! ☆</span>
            </div>
            <div className="footer-buttons">
              <img src="/buns/valid-html.svg" alt="Valid HTML" className="footer-button" />
              <img src="/buns/best-viewed.svg" alt="Best Viewed" className="footer-button" />
              <img src="/buns/y2k-approved.svg" alt="Y2K Approved" className="footer-button" />
            </div>
            <div className="footer-links">
              <a href="#" className="footer-link">☆ Home</a>
              <span className="footer-separator">｜</span>
              <a href="#" className="footer-link">☆ Top</a>
              <span className="footer-separator">｜</span>
              <a href="#" className="footer-link">☆ Email Me</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default BunsPage;