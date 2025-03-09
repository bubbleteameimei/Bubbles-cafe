import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './auth.css';
import { useAuth } from '@/lib/auth';

export default function AuthPage() {
  const [isSignIn, setIsSignIn] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isSignIn) {
        await login(email, password);
        navigate('/');
      } else {
        if (!username) {
          throw new Error('Username is required');
        }
        await register(email, password, username);
        navigate('/');
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err?.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="login-wrap">
        <div className="login-html">
          <h2 className="form-title">{isSignIn ? 'Sign In' : 'Create Account'}</h2>

          <div className="tab-selector">
            <button 
              type="button"
              className={`tab-btn ${isSignIn ? 'active' : ''}`}
              onClick={() => setIsSignIn(true)}
            >
              Sign In
            </button>
            <button 
              type="button"
              className={`tab-btn ${!isSignIn ? 'active' : ''}`}
              onClick={() => setIsSignIn(false)}
            >
              Sign Up
            </button>
          </div>

          <div className="login-form">
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="group">
                  <div className="error-message" style={{color: "hsl(var(--destructive))", fontSize: "14px", textAlign: "center", marginBottom: "15px"}}>
                    {error}
                  </div>
                </div>
              )}

              <div style={{ display: isSignIn ? 'block' : 'none' }}>
                <div className="group">
                  <label htmlFor="email" className="label">Email</label>
                  <input 
                    id="email" 
                    type="email" 
                    className="input" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div className="group">
                  <label htmlFor="pass" className="label">Password</label>
                  <input 
                    id="pass" 
                    type="password" 
                    className="input" 
                    data-type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                </div>

                <div className="group">
                  <button 
                    type="submit" 
                    className="button"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : "Sign In"}
                  </button>
                </div>

                <div className="hr"></div>

                <div className="foot-lnk">
                  <span onClick={() => setIsSignIn(false)}>Don't have an account? Sign up</span>
                </div>
              </div>

              <div style={{ display: isSignIn ? 'none' : 'block' }}>
                <div className="group">
                  <label htmlFor="user" className="label">Username</label>
                  <input 
                    id="user" 
                    type="text" 
                    className="input"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Choose a username"
                    required
                  />
                </div>

                <div className="group">
                  <label htmlFor="email-signup" className="label">Email Address</label>
                  <input 
                    id="email-signup" 
                    type="email" 
                    className="input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div className="group">
                  <label htmlFor="pass-signup" className="label">Password</label>
                  <input 
                    id="pass-signup" 
                    type="password" 
                    className="input" 
                    data-type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                    required
                  />
                </div>

                <div className="group">
                  <button 
                    type="submit" 
                    className="button"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating Account..." : "Sign Up"}
                  </button>
                </div>

                <div className="hr"></div>

                <div className="foot-lnk">
                  <span onClick={() => setIsSignIn(true)}>Already have an account? Sign in</span>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}