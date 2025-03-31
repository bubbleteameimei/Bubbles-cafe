import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SigilPage = () => {
  const [showContent, setShowContent] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const sigilRef = useRef<HTMLDivElement>(null);
  
  // Use this for continuous animation loop instead of a timer
  const [loopKey, setLoopKey] = useState(0);
  
  useEffect(() => {
    // Force animation to restart every 15 seconds
    const interval = setInterval(() => {
      setLoopKey(prevKey => prevKey + 1);
    }, 15000);
    
    // Audio effect
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const playCreepySound = () => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(90 + Math.random() * 120, audioContext.currentTime);
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.04, audioContext.currentTime + 0.5);
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 3);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 3);
    };
    
    // Play random creepy sounds
    const soundInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        playCreepySound();
      }
    }, 5000);
    
    return () => {
      clearInterval(interval);
      clearInterval(soundInterval);
    };
  }, []);
  
  // Toggle between loading screen and content
  const toggleContent = () => {
    setShowContent(!showContent);
  };
  
  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (sigilRef.current?.requestFullscreen) {
        sigilRef.current.requestFullscreen();
        setIsFullscreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };
  
  // Disturbing text phrases - kept minimal and subtle
  const getDisturbingText = () => {
    // Less is more - use sparse, evocative phrases that suggest horror without stating it directly
    const texts = [
      "it waits",
      "they watch",
      "never sleep",
      "below",
      "behind you"
    ];
    return texts[Math.floor(Math.random() * texts.length)];
  };

  return (
    <div 
      ref={sigilRef}
      className="flex flex-col items-center justify-center min-h-screen bg-black text-white overflow-hidden"
      style={{ backgroundColor: '#050505' }}
    >
      <AnimatePresence>
        {!showContent && (
          <motion.div 
            key={`sigil-${loopKey}`}
            className="fixed inset-0 flex flex-col items-center justify-center z-10 bg-black"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 1.5 } }}
          >
            {/* Background vignette effect */}
            <div className="fixed inset-0 bg-gradient-radial from-transparent via-black to-black opacity-70"></div>
            
            {/* Subtle background texture */}
            <div 
              className="fixed inset-0 opacity-10" 
              style={{ 
                backgroundImage: 'url("data:image/svg+xml,%3Csvg width="6" height="6" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M5 0h1L0 6V5zM6 5v1H5z" fill="%23300" fill-opacity=".4"/%3E%3C/svg%3E")',
                backgroundRepeat: 'repeat'
              }}
            ></div>
            
            {/* Blood drips from CSS */}
            <div className="absolute top-0 inset-x-0 overflow-hidden h-20 pointer-events-none">
              <div className="blood-drip" style={{ left: '10%' }}></div>
              <div className="blood-drip" style={{ left: '30%' }}></div>
              <div className="blood-drip" style={{ left: '50%' }}></div>
              <div className="blood-drip" style={{ left: '70%' }}></div>
              <div className="blood-drip" style={{ left: '90%' }}></div>
            </div>
            
            {/* Video noise effect */}
            <div className="video-noise"></div>
            
            {/* Main sigil animation */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: [0.3, 1, 0.3], 
                scale: [0.8, 1.1, 0.9],
                rotate: [0, 180, 360]
              }}
              transition={{ 
                duration: 10, 
                repeat: Infinity, 
                repeatType: "reverse",
                ease: "easeInOut" 
              }}
              className="relative"
              style={{ filter: 'drop-shadow(0 0 8px rgba(120, 0, 0, 0.6))' }}
            >
              {/* Main sigil SVG */}
              <svg
                width="320"
                height="320"
                viewBox="0 0 300 300"
                className="opacity-90"
              >
                {/* Dark background circle with glowing effect */}
                <defs>
                  <radialGradient id="sigilGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                    <stop offset="0%" stopColor="#100000" />
                    <stop offset="60%" stopColor="#050505" />
                    <stop offset="100%" stopColor="#000000" />
                  </radialGradient>
                  
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="2.5" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                  
                  <filter id="bloodDrip">
                    <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" result="noise" />
                    <feDisplacementMap in="SourceGraphic" in2="noise" scale="5" xChannelSelector="R" yChannelSelector="G" />
                  </filter>
                </defs>
                
                {/* A much darker background that fades to pure black */}
                <circle cx="150" cy="150" r="145" fill="url(#sigilGradient)" stroke="#1a0505" strokeWidth="1" />
                
                {/* Pentagram with glowing effect */}
                <motion.path
                  d="M150,10 L175,120 L290,120 L195,190 L230,290 L150,230 L70,290 L105,190 L10,120 L125,120 Z"
                  fill="none"
                  stroke="#5c0000"
                  strokeWidth="2"
                  filter="url(#glow)"
                  animate={{ 
                    strokeWidth: [2, 3, 2],
                    stroke: ['#5c0000', '#8c0000', '#5c0000']
                  }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    repeatType: "reverse" 
                  }}
                />
                
                {/* Bloody circle */}
                <motion.circle 
                  cx="150" 
                  cy="150" 
                  r="60" 
                  fill="none" 
                  stroke="#610000" 
                  strokeWidth="2"
                  filter="url(#bloodDrip)"
                  animate={{ 
                    strokeWidth: [1, 3, 1],
                    stroke: ['#400000', '#800000', '#400000']  
                  }}
                  transition={{ 
                    duration: 6,
                    repeat: Infinity,
                    repeatType: "mirror" 
                  }}
                />
                
                {/* Inner circle that pulses */}
                <motion.circle 
                  cx="150" 
                  cy="150" 
                  r="30" 
                  fill="none" 
                  stroke="#880000" 
                  strokeWidth="1"
                  animate={{ 
                    r: [30, 40, 30],
                    opacity: [0.3, 0.7, 0.3]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    repeatType: "reverse" 
                  }}
                />
                
                {/* Secondary circle that pulses in opposite rhythm */}
                <motion.circle 
                  cx="150" 
                  cy="150" 
                  r="45" 
                  fill="none" 
                  stroke="#660000" 
                  strokeWidth="0.5"
                  animate={{ 
                    r: [45, 35, 45],
                    opacity: [0.5, 0.2, 0.5]
                  }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    repeatType: "reverse" 
                  }}
                />
                
                {/* Runes and sigils around the circle */}
                <g>
                  {[...Array(12)].map((_, i) => {
                    const angle = (i * 30) * Math.PI / 180;
                    const x = 150 + 100 * Math.cos(angle);
                    const y = 150 + 100 * Math.sin(angle);
                    return (
                      <motion.text
                        key={i}
                        x={x}
                        y={y}
                        fill="#610000"
                        fontSize="16"
                        fontFamily="serif"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        transform={`rotate(${i * 30}, ${x}, ${y})`}
                        animate={{ 
                          opacity: [0.4, 1, 0.4],
                          fill: ['#400000', '#800000', '#400000']
                        }}
                        transition={{ 
                          duration: 4,
                          repeat: Infinity,
                          repeatType: "reverse",
                          delay: i * 0.3
                        }}
                      >
                        {String.fromCharCode(8746 + i)}
                      </motion.text>
                    );
                  })}
                </g>
                
                {/* Center occult symbol */}
                <motion.text
                  x="150"
                  y="155"
                  fill="#800000"
                  fontSize="24"
                  fontFamily="serif"
                  textAnchor="middle"
                  filter="url(#glow)"
                  animate={{ 
                    opacity: [0.7, 1, 0.7],
                    fill: ['#600000', '#cc0000', '#600000'],
                    fontSize: [22, 26, 22],
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                >
                  ⛧
                </motion.text>
                
                {/* More demonic symbols surrounding the center */}
                {[0, 1, 2, 3].map((i) => {
                  const angle = (i * 90) * Math.PI / 180;
                  const x = 150 + 40 * Math.cos(angle);
                  const y = 150 + 40 * Math.sin(angle);
                  return (
                    <motion.text
                      key={`symbol-${i}`}
                      x={x}
                      y={y}
                      fill="#700000"
                      fontSize="14"
                      fontFamily="serif"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      animate={{ 
                        opacity: [0.3, 0.7, 0.3],
                        fontSize: [13, 15, 13]
                      }}
                      transition={{ 
                        duration: 5,
                        repeat: Infinity,
                        repeatType: "reverse",
                        delay: i * 0.8
                      }}
                    >
                      {["†", "⍟", "⎈", "☠︎"][i]}
                    </motion.text>
                  );
                })}
                
                {/* Intersecting lines */}
                {[...Array(8)].map((_, i) => {
                  const angle = (i * 45) * Math.PI / 180;
                  return (
                    <motion.line
                      key={i}
                      x1="150"
                      y1="150"
                      x2={150 + 145 * Math.cos(angle)}
                      y2={150 + 145 * Math.sin(angle)}
                      stroke="#4d0000"
                      strokeWidth="1"
                      animate={{ 
                        opacity: [0.4, 0.7, 0.4],
                        strokeWidth: [0.5, 1.5, 0.5]
                      }}
                      transition={{ 
                        duration: 8,
                        repeat: Infinity,
                        repeatType: "reverse",
                        delay: i * 0.5
                      }}
                    />
                  );
                })}
                
                {/* Unsettling Eye effect - more subtle, realistic, very wrong looking */}
                <motion.ellipse 
                  cx="150" 
                  cy="150" 
                  rx="22" 
                  ry="13" 
                  fill="#110000" 
                  stroke="#300"
                  strokeWidth="0.5"
                  animate={{ 
                    rx: [22, 20, 22],
                    ry: [13, 8, 13]
                  }}
                  transition={{ 
                    duration: 5,
                    repeat: Infinity,
                    repeatType: "mirror",
                    repeatDelay: 3
                  }}
                />
                
                {/* Iris - slow pulsing */}
                <motion.circle 
                  cx="150" 
                  cy="150" 
                  r="9" 
                  fill="#000" 
                  stroke="#200"
                  strokeWidth="0.5"
                  animate={{ 
                    r: [9, 6, 9],
                    opacity: [0.9, 1, 0.9]
                  }}
                  transition={{ 
                    duration: 7,
                    repeat: Infinity,
                    repeatType: "mirror",
                    repeatDelay: 2
                  }}
                />
                
                {/* Pupil - occasional sudden contraction */}
                <motion.circle 
                  cx="150" 
                  cy="150" 
                  r="4" 
                  fill="#000" 
                  animate={{ 
                    r: [4, 4, 1, 4],
                    opacity: [1, 1, 1, 1]
                  }}
                  transition={{ 
                    duration: 0.5,
                    times: [0, 0.8, 0.9, 1],
                    repeat: Infinity,
                    repeatDelay: 12 + Math.random() * 8
                  }}
                />
                
                {/* Creepy red reflection - always watching */}
                <motion.circle 
                  cx="146" 
                  cy="146" 
                  r="2" 
                  fill="#600" 
                  animate={{ 
                    opacity: [0.3, 0.7, 0.3],
                    r: [2, 3, 2]
                  }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    repeatType: "mirror"
                  }}
                />
                
                {/* Blood drips */}
                {[...Array(5)].map((_, i) => {
                  const angle = ((i * 72) + 18) * Math.PI / 180;
                  const x = 150 + 120 * Math.cos(angle);
                  const y = 150 + 120 * Math.sin(angle);
                  return (
                    <motion.path
                      key={`drip-${i}`}
                      d={`M ${x} ${y} C ${x} ${y+10}, ${x+5} ${y+20}, ${x} ${y+30}`}
                      stroke="#800000"
                      strokeWidth="2"
                      fill="none"
                      filter="url(#bloodDrip)"
                      animate={{ 
                        opacity: [0, 0.8, 0],
                      }}
                      transition={{ 
                        duration: 8,
                        repeat: Infinity,
                        repeatType: "mirror",
                        delay: i * 2
                      }}
                    />
                  );
                })}
              </svg>
            </motion.div>
            
            {/* Minimal, haunting text */}
            <motion.p
              className="mt-8 text-sm font-serif text-red-900 tracking-widest opacity-70 uppercase"
              animate={{ 
                opacity: [0.4, 0.7, 0.4],
                textShadow: [
                  '0 0 3px rgba(80,0,0,0.3)', 
                  '0 0 5px rgba(120,0,0,0.4)', 
                  '0 0 3px rgba(80,0,0,0.3)'
                ]
              }}
              transition={{ 
                duration: 6, 
                repeat: Infinity, 
                repeatType: "mirror" 
              }}
            >
              {getDisturbingText()}
            </motion.p>
            
            {/* Subtle, barely visible whispers */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {/* Use fewer, more strategic whispers */}
              {[...Array(8)].map((_, i) => {
                // Position whispers at strategic points - corners, edges
                const positions = [
                  {x: 5, y: 5},        // top left
                  {x: 95, y: 5},       // top right
                  {x: 50, y: 5},       // top center
                  {x: 5, y: 95},       // bottom left
                  {x: 95, y: 95},      // bottom right
                  {x: 5, y: 50},       // left center
                  {x: 95, y: 50},      // right center
                  {x: 50, y: 95}       // bottom center
                ];
                
                // Genuinely disturbing fragments of text - less is more
                const disturbingPhrases = [
                  "don't look away", 
                  "it sees you", 
                  "behind you", 
                  "never alone", 
                  "in your home",
                  "in the mirror", 
                  "watching you sleep", 
                  "always there"
                ];
                
                return (
                  <motion.p
                    key={i}
                    className="text-[8px] sm:text-[10px] font-serif absolute"
                    style={{ 
                      left: `${positions[i].x}%`,
                      top: `${positions[i].y}%`,
                      color: 'rgba(60, 0, 0, 0.35)',
                      textShadow: '0 0 1px rgba(40,0,0,0.2)'
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ 
                      opacity: [0, 0.35, 0],
                    }}
                    transition={{ 
                      duration: 8 + Math.random() * 4,
                      repeat: Infinity,
                      repeatType: "mirror",
                      delay: i * 5
                    }}
                  >
                    {disturbingPhrases[i]}
                  </motion.p>
                );
              })}
            </div>
            
            {/* Subliminal flashes - subtle and rare for maximum psychological effect */}
            <motion.div 
              className="fixed inset-0 z-20 pointer-events-none"
              style={{ backgroundColor: '#300' }}
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: [0, 0, 0, 0.03, 0]
              }}
              transition={{ 
                duration: 0.1, 
                times: [0, 0.4, 0.8, 0.9, 1],
                repeat: Infinity, 
                repeatDelay: 20 + Math.random() * 20
              }}
            />
            
            {/* Extremely subtle face flash - almost imperceptible */}
            <motion.div 
              className="fixed inset-0 z-20 pointer-events-none flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: [0, 0, 0.015, 0]
              }}
              transition={{ 
                duration: 0.2,
                times: [0, 0.85, 0.9, 1],
                repeat: Infinity, 
                repeatDelay: 45 + Math.random() * 30
              }}
            >
              <div className="w-full h-full absolute opacity-10" style={{ 
                backgroundImage: `radial-gradient(circle at 50% 45%, rgba(0,0,0,0.7) 10%, transparent 60%)`,
              }}></div>
              <div className="text-[100px] text-red-900 opacity-20 transform scale-y-150">⍥</div>
            </motion.div>
            
            {/* Controls */}
            <div className="fixed bottom-4 flex space-x-4 z-30">
              <button 
                onClick={toggleContent} 
                className="bg-black bg-opacity-50 text-red-800 px-4 py-1 border border-red-900 hover:bg-red-900 hover:bg-opacity-20 transition-colors"
              >
                Continue
              </button>
              <button 
                onClick={toggleFullscreen} 
                className="bg-black bg-opacity-50 text-red-800 px-4 py-1 border border-red-900 hover:bg-red-900 hover:bg-opacity-20 transition-colors"
              >
                {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Content that appears after loading */}
      <AnimatePresence>
        {showContent && (
          <motion.div 
            className="w-full max-w-4xl mx-auto px-4 py-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-4xl font-bold font-serif text-red-800">The Sigil</h1>
              <button 
                onClick={toggleContent} 
                className="bg-black text-red-800 px-4 py-1 border border-red-900 hover:bg-red-900 hover:bg-opacity-20 transition-colors"
              >
                Return to Sigil
              </button>
            </div>
            
            <p className="text-xl text-gray-400 mb-8 font-serif">
              You have witnessed the ancient sigil. Its meaning is known only to the deeply initiated.
            </p>
            
            <div className="bg-gray-900 bg-opacity-70 p-8 rounded-lg shadow-lg border border-red-900">
              <p className="text-lg text-gray-300 mb-4 font-serif">
                Throughout history, sigils have been used as symbols of power, protection, and summoning. 
                The one you've seen is particularly rare in texts dating back to the 14th century.
              </p>
              <p className="text-lg text-gray-300 mb-4 font-serif">
                Some claim it represents a gateway between realms, others believe it is a warning - a mark 
                of something that should remain undisturbed.
              </p>
              <p className="text-lg text-gray-300 italic font-serif">
                "Those who gaze upon the sigil are forever changed, their dreams haunted by visions 
                of what lies beyond the veil."
              </p>
              
              {/* Hidden creepy message */}
              <div className="mt-8 opacity-10 text-xs text-right">
                <p className="font-mono">it sees you when you sleep</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SigilPage;