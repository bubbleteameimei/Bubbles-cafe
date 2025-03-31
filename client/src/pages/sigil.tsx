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
              whileHover={{ scale: 1.01 }}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ 
                opacity: [0.5, 0.7, 0.5], 
                scale: [0.98, 1, 0.98]
              }}
              transition={{ 
                duration: 20, 
                repeat: Infinity, 
                repeatType: "mirror",
                ease: "easeInOut" 
              }}
              className="relative"
              style={{ filter: 'drop-shadow(0 0 2px rgba(40, 0, 0, 0.2))' }}
            >
              {/* Completely redesigned, abstract sigil SVG - more like an ancient disturbing symbol */}
              <svg
                width="320"
                height="320"
                viewBox="0 0 300 300"
                className="opacity-80"
              >
                <defs>
                  {/* Subtle, dark gradient */}
                  <radialGradient id="sigilGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                    <stop offset="0%" stopColor="#070707" />
                    <stop offset="60%" stopColor="#030303" />
                    <stop offset="100%" stopColor="#000000" />
                  </radialGradient>
                  
                  {/* Very subtle glow */}
                  <filter id="subtleGlow">
                    <feGaussianBlur stdDeviation="1.5" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                  
                  {/* Texture effect for aged appearance */}
                  <filter id="noiseTexture">
                    <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="5" seed="3" stitchTiles="stitch" result="noise" />
                    <feColorMatrix type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 0.05 0" in="noise" result="colorNoise" />
                    <feComposite operator="in" in="colorNoise" in2="SourceGraphic" result="noisyImage" />
                    <feBlend mode="multiply" in="noisyImage" in2="SourceGraphic" />
                  </filter>
                  
                  {/* Distortion for the sigil itself */}
                  <filter id="slightDistortion">
                    <feTurbulence type="turbulence" baseFrequency="0.01" numOctaves="2" seed="2" result="turbulence" />
                    <feDisplacementMap in="SourceGraphic" in2="turbulence" scale="2" xChannelSelector="R" yChannelSelector="G" />
                  </filter>
                </defs>
                
                {/* Background */}
                <rect x="0" y="0" width="300" height="300" fill="#000" />
                
                {/* Dark background circle */}
                <circle cx="150" cy="150" r="140" fill="url(#sigilGradient)" filter="url(#noiseTexture)" opacity="0.95" />
                
                {/* Disturbing abstract sigil - inspired by Necronomicon and ancient cave drawings */}
                <g filter="url(#slightDistortion)">
                  {/* Main sigil structure - asymmetrical, dissonant shape */}
                  <motion.path
                    d="M150,70 C180,90 200,80 210,110 C220,140 240,170 220,190 C200,210 170,220 150,200 C130,220 100,210 80,190 C60,170 80,140 90,110 C100,80 120,90 150,70 Z"
                    fill="none"
                    stroke="#1a0000"
                    strokeWidth="1"
                    opacity="0.8"
                    animate={{ 
                      strokeWidth: [1, 1.2, 1],
                      opacity: [0.8, 0.9, 0.8],
                    }}
                    transition={{ 
                      duration: 10,
                      repeat: Infinity,
                      repeatType: "mirror"
                    }}
                  />
                  
                  {/* Inner structure - looks almost like a non-human face or uncomfortable pattern */}
                  <motion.path
                    d="M150,110 C165,120 175,110 180,130 C185,150 190,160 180,170 C170,180 160,175 150,165 C140,175 130,180 120,170 C110,160 115,150 120,130 C125,110 135,120 150,110 Z"
                    fill="none"
                    stroke="#250000"
                    strokeWidth="0.8"
                    opacity="0.7"
                    animate={{ 
                      strokeWidth: [0.8, 1, 0.8],
                      opacity: [0.7, 0.8, 0.7],
                    }}
                    transition={{ 
                      duration: 8,
                      repeat: Infinity,
                      repeatType: "mirror",
                      delay: 2
                    }}
                  />
                  
                  {/* A series of irregular, asymmetrical marks that create organic discomfort */}
                  {[...Array(6)].map((_, i) => {
                    const angle = (i * 60) * Math.PI / 180;
                    const dist = 90 + Math.sin(i * 2) * 20;
                    const x = 150 + dist * Math.cos(angle);
                    const y = 150 + dist * Math.sin(angle);
                    
                    return (
                      <motion.path
                        key={`mark-${i}`}
                        d={`M ${x} ${y} C ${x + 5} ${y - 10}, ${x + 15} ${y - 15}, ${x + 20} ${y - 5}`}
                        stroke="#200"
                        strokeWidth="0.7"
                        fill="none"
                        opacity="0.6"
                        animate={{ 
                          opacity: [0.6, 0.7, 0.6],
                          strokeWidth: [0.7, 0.9, 0.7]
                        }}
                        transition={{ 
                          duration: 5 + i,
                          repeat: Infinity,
                          repeatType: "mirror",
                          delay: i * 1.5
                        }}
                      />
                    );
                  })}
                </g>
                
                {/* Ancient script-like marks around the edges */}
                <g opacity="0.6">
                  {[...Array(12)].map((_, i) => {
                    const angle = (i * 30) * Math.PI / 180;
                    const x = 150 + 120 * Math.cos(angle);
                    const y = 150 + 120 * Math.sin(angle);
                    
                    // Creates marks that look like ancient script
                    const markPath = () => {
                      const type = i % 4;
                      switch(type) {
                        case 0: return `M ${x-5} ${y} L ${x+5} ${y} M ${x} ${y-3} L ${x} ${y+3}`; // plus-like
                        case 1: return `M ${x-6} ${y-2} L ${x+6} ${y+2} M ${x-6} ${y+2} L ${x+6} ${y-2}`; // x-like
                        case 2: return `M ${x-5} ${y} A 5 5 0 1 0 ${x+5} ${y}`; // arc
                        case 3: return `M ${x-4} ${y-4} L ${x+4} ${y-4} L ${x} ${y+4} Z`; // triangle
                      }
                      return '';
                    };
                    
                    return (
                      <motion.path
                        key={`script-${i}`}
                        d={markPath()}
                        stroke="#150000"
                        strokeWidth="0.6"
                        fill="none"
                        animate={{ 
                          opacity: [0.4, 0.6, 0.4],
                          strokeWidth: [0.6, 0.8, 0.6]
                        }}
                        transition={{ 
                          duration: 7,
                          repeat: Infinity,
                          repeatType: "mirror",
                          delay: i * 0.7
                        }}
                      />
                    );
                  })}
                </g>
                
                {/* Negative space "eyes" - unsettlingly human-like elements */}
                <g>
                  {/* Left "eye" - subtly wrong placement and movement */}
                  <g transform="translate(125, 140)">
                    <motion.ellipse 
                      rx="12" 
                      ry="7" 
                      fill="#030000" 
                      opacity="0.8"
                      animate={{ 
                        rx: [12, 11, 12],
                        ry: [7, 6, 7],
                        opacity: [0.8, 0.9, 0.8]
                      }}
                      transition={{ 
                        duration: 6,
                        repeat: Infinity,
                        repeatType: "mirror",
                        repeatDelay: 2
                      }}
                    />
                    
                    <motion.circle 
                      r="4" 
                      fill="#010000" 
                      opacity="0.9"
                      animate={{ 
                        r: [4, 3, 4],
                        opacity: [0.9, 1, 0.9]
                      }}
                      transition={{ 
                        duration: 8,
                        repeat: Infinity,
                        repeatType: "mirror"
                      }}
                    />
                    
                    {/* Almost imperceptible red dot */}
                    <motion.circle 
                      cx="-2" 
                      cy="-2" 
                      r="1"
                      fill="#200000" 
                      opacity="0.7"
                      animate={{ 
                        opacity: [0.7, 0.8, 0.7]
                      }}
                      transition={{ 
                        duration: 4,
                        repeat: Infinity,
                        repeatType: "mirror"
                      }}
                    />
                  </g>
                  
                  {/* Right "eye" - slightly different to create dissonance */}
                  <g transform="translate(175, 140)">
                    <motion.ellipse 
                      rx="11" 
                      ry="7" 
                      fill="#030000" 
                      opacity="0.8"
                      animate={{ 
                        rx: [11, 10, 11],
                        ry: [7, 6, 7],
                        opacity: [0.8, 0.9, 0.8]
                      }}
                      transition={{ 
                        duration: 7, // Slightly different timing creates uncanny effect
                        repeat: Infinity,
                        repeatType: "mirror",
                        repeatDelay: 1.5
                      }}
                    />
                    
                    <motion.circle 
                      r="4" 
                      fill="#010000" 
                      opacity="0.9"
                      animate={{ 
                        r: [4, 3, 4],
                        opacity: [0.9, 1, 0.9]
                      }}
                      transition={{ 
                        duration: 7.5, // Slightly different timing from other eye
                        repeat: Infinity,
                        repeatType: "mirror"
                      }}
                    />
                    
                    {/* Almost imperceptible red dot */}
                    <motion.circle 
                      cx="-2" 
                      cy="-2" 
                      r="1"
                      fill="#200000" 
                      opacity="0.7"
                      animate={{ 
                        opacity: [0.7, 0.8, 0.7]
                      }}
                      transition={{ 
                        duration: 4.5, // Slightly out of sync with other eye
                        repeat: Infinity,
                        repeatType: "mirror"
                      }}
                    />
                  </g>
                </g>
                
                {/* "Mouth" element - looks wrong and uncomfortable */}
                <motion.path
                  d="M130,170 C140,177 160,177 170,170 C165,183 135,183 130,170 Z"
                  fill="#090000"
                  opacity="0.7"
                  animate={{ 
                    opacity: [0.7, 0.8, 0.7],
                    d: [
                      "M130,170 C140,177 160,177 170,170 C165,183 135,183 130,170 Z", // closed
                      "M130,170 C140,180 160,180 170,170 C165,185 135,185 130,170 Z", // slightly open
                      "M130,170 C140,177 160,177 170,170 C165,183 135,183 130,170 Z"  // closed
                    ]
                  }}
                  transition={{ 
                    duration: 20,
                    times: [0, 0.5, 1],
                    repeat: Infinity,
                    repeatType: "mirror",
                    repeatDelay: 15 + Math.random() * 20
                  }}
                />
                
                {/* Uncomfortable asymmetrical details */}
                <motion.path
                  d="M110,160 C120,150 130,155 125,165 C120,175 100,170 110,160 Z"
                  fill="none"
                  stroke="#100000"
                  strokeWidth="0.5"
                  opacity="0.5"
                  animate={{ 
                    opacity: [0.5, 0.6, 0.5],
                    strokeWidth: [0.5, 0.7, 0.5]
                  }}
                  transition={{ 
                    duration: 10,
                    repeat: Infinity,
                    repeatType: "mirror",
                    delay: 2
                  }}
                />
                
                <motion.path
                  d="M190,160 C180,150 170,155 175,165 C180,175 200,170 190,160 Z"
                  fill="none"
                  stroke="#100000"
                  strokeWidth="0.5"
                  opacity="0.5"
                  animate={{ 
                    opacity: [0.5, 0.6, 0.5],
                    strokeWidth: [0.5, 0.7, 0.5]
                  }}
                  transition={{ 
                    duration: 12, // Different timing creates dissonance
                    repeat: Infinity,
                    repeatType: "mirror",
                    delay: 3
                  }}
                />
                
                {/* Almost imperceptible "breathing" effect */}
                <motion.circle
                  cx="150"
                  cy="150"
                  r="100"
                  fill="none"
                  stroke="#0a0000"
                  strokeWidth="0.2"
                  opacity="0.3"
                  animate={{ 
                    r: [100, 102, 100],
                    opacity: [0.3, 0.4, 0.3]
                  }}
                  transition={{ 
                    duration: 6,
                    repeat: Infinity,
                    repeatType: "mirror"
                  }}
                />
              </svg>
            </motion.div>
            
            {/* Almost imperceptible text message */}
            <motion.p
              className="mt-8 text-xs font-serif tracking-widest uppercase"
              style={{ 
                color: 'rgba(30, 0, 0, 0.3)',
                letterSpacing: '0.3em'
              }}
              animate={{ 
                opacity: [0.3, 0.4, 0.3],
                textShadow: [
                  '0 0 1px rgba(30,0,0,0.1)', 
                  '0 0 2px rgba(40,0,0,0.15)', 
                  '0 0 1px rgba(30,0,0,0.1)'
                ]
              }}
              transition={{ 
                duration: 12, 
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
                      color: 'rgba(30, 0, 0, 0.2)',
                      textShadow: '0 0 1px rgba(20,0,0,0.1)'
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ 
                      opacity: [0, 0.2, 0],
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