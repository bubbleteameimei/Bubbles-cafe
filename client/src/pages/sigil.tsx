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
              {/* Completely redesigned, truly disturbing sigil - no face-like features */}
              <svg
                width="320"
                height="320"
                viewBox="0 0 300 300"
                className="opacity-90"
              >
                <defs>
                  {/* Extremely subtle, dark gradient */}
                  <radialGradient id="darkVoid" cx="50%" cy="50%" r="70%" fx="50%" fy="50%">
                    <stop offset="0%" stopColor="#050505" />
                    <stop offset="70%" stopColor="#030303" />
                    <stop offset="100%" stopColor="#000000" />
                  </radialGradient>
                  
                  {/* Film grain texture */}
                  <filter id="filmGrain">
                    <feTurbulence baseFrequency="0.65" numOctaves="3" seed="1" type="fractalNoise" result="noise" />
                    <feColorMatrix type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 0.03 0" in="noise" result="grainAlpha" />
                    <feBlend mode="multiply" in="SourceGraphic" in2="grainAlpha" />
                  </filter>
                  
                  {/* Subtle distortion */}
                  <filter id="microDistortion">
                    <feTurbulence type="turbulence" baseFrequency="0.005" numOctaves="3" seed="2" result="turbulence" />
                    <feDisplacementMap in="SourceGraphic" in2="turbulence" scale="2" xChannelSelector="R" yChannelSelector="G" />
                  </filter>
                  
                  {/* Subtle bleeding effect */}
                  <filter id="bleed" x="-10%" y="-10%" width="120%" height="120%">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur" />
                    <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0.05 0 1 0 0 0 0 0 1 0 0 0 0 0 18 -7" result="bleed" />
                    <feBlend in="SourceGraphic" in2="bleed" mode="normal" />
                  </filter>
                </defs>
                
                {/* Base layer - pure darkness */}
                <rect x="0" y="0" width="300" height="300" fill="#000" />
                
                {/* Dark background with subtle texture */}
                <circle cx="150" cy="150" r="148" fill="url(#darkVoid)" filter="url(#filmGrain)" opacity="0.98" />
                
                {/* Central void/abyss with radial lines */}
                <g>
                  {/* Concentric rings of increasing darkness */}
                  {[60, 45, 30, 15].map((radius, i) => (
                    <motion.circle
                      key={`void-${i}`}
                      cx="150"
                      cy="150"
                      r={radius}
                      fill="none"
                      stroke={`rgba(${10-i*2}, 0, 0, 0.${4+i})`}
                      strokeWidth="0.3"
                      animate={{
                        opacity: [0.4, 0.5, 0.4],
                        r: [radius, radius+1, radius]
                      }}
                      transition={{
                        duration: 12 + i,
                        repeat: Infinity,
                        repeatType: "mirror",
                        delay: i * 3
                      }}
                    />
                  ))}
                  
                  {/* Darkness at the center */}
                  <motion.circle
                    cx="150"
                    cy="150"
                    r="8"
                    fill="#000000"
                    animate={{
                      r: [8, 9, 8],
                      opacity: [0.95, 1, 0.95]
                    }}
                    transition={{
                      duration: 20,
                      repeat: Infinity,
                      repeatType: "mirror"
                    }}
                  />
                </g>
                
                {/* Main sigil pattern - asymmetrical and non-representational */}
                <g filter="url(#microDistortion)">
                  {/* Unsettling, eldritch geometry */}
                  <motion.path
                    d="M150,65 L170,100 L200,90 L190,120 L220,140 L190,150 L200,180 L170,170 L150,200 L130,170 L100,180 L110,150 L80,140 L110,120 L100,90 L130,100 Z"
                    fill="none"
                    stroke="#0f0000"
                    strokeWidth="0.4"
                    opacity="0.7"
                    animate={{
                      opacity: [0.7, 0.8, 0.7],
                      strokeWidth: [0.4, 0.5, 0.4]
                    }}
                    transition={{
                      duration: 15,
                      repeat: Infinity,
                      repeatType: "mirror"
                    }}
                  />
                  
                  {/* Broken, disturbing symmetry */}
                  <motion.path
                    d="M150,85 L162,110 L185,102 L177,125 L197,135 L177,143 L185,165 L162,155 L150,175 L138,155 L115,165 L123,143 L103,135 L123,125 L115,102 L138,110 Z"
                    fill="none"
                    stroke="#120000"
                    strokeWidth="0.3"
                    opacity="0.6"
                    animate={{
                      opacity: [0.6, 0.7, 0.6],
                      strokeWidth: [0.3, 0.4, 0.3]
                    }}
                    transition={{
                      duration: 18,
                      repeat: Infinity,
                      repeatType: "mirror",
                      delay: 3
                    }}
                  />
                </g>
                
                {/* Irregular, asymmetrical radial lines */}
                <g opacity="0.5">
                  {[...Array(13)].map((_, i) => {
                    // Irregular spacing for psychological discomfort
                    const angle = ((i * 28) + (i % 2 === 0 ? 5 : -3)) * Math.PI / 180;
                    const length = 100 + (i % 3) * 20;
                    const x1 = 150;
                    const y1 = 150;
                    const x2 = 150 + length * Math.cos(angle);
                    const y2 = 150 + length * Math.sin(angle);
                    
                    return (
                      <motion.line
                        key={`line-${i}`}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="#080000"
                        strokeWidth="0.2"
                        opacity="0.5"
                        animate={{
                          opacity: [0.5, 0.6, 0.5],
                          strokeWidth: [0.2, 0.3, 0.2]
                        }}
                        transition={{
                          duration: 10 + (i % 5),
                          repeat: Infinity,
                          repeatType: "mirror",
                          delay: i * 0.7
                        }}
                      />
                    );
                  })}
                </g>
                
                {/* Disconnected eldritch symbols and marks */}
                <g>
                  {[...Array(9)].map((_, i) => {
                    // Position symbols asymmetrically around the circle
                    const angle = ((i * 40) + 5) * Math.PI / 180;
                    const distance = 90 + (i % 4) * 15;
                    const x = 150 + distance * Math.cos(angle);
                    const y = 150 + distance * Math.sin(angle);
                    
                    // Generate different eldritch symbols
                    const getSymbolPath = () => {
                      const size = 4 + (i % 3);
                      switch(i % 6) {
                        case 0: return `M${x-size},${y-size} L${x+size},${y+size} M${x-size},${y+size} L${x+size},${y-size}`; // X
                        case 1: return `M${x},${y-size} L${x+size},${y} L${x},${y+size} L${x-size},${y} Z`; // Diamond
                        case 2: return `M${x-size},${y} L${x},${y-size} L${x+size},${y} L${x},${y+size} Z`; // Rhombus
                        case 3: return `M${x},${y-size} L${x+size},${y+size} L${x-size},${y+size} Z`; // Triangle
                        case 4: return `M${x-size},${y-size} L${x+size},${y-size} L${x},${y+size} Z`; // Triangle (inverted)
                        case 5: return `M${x-size/2},${y-size} A${size},${size} 0 1,0 ${x+size/2},${y-size} M${x-size/2},${y+size} A${size},${size} 0 1,1 ${x+size/2},${y+size}`; // Broken arcs
                      }
                    };
                    
                    return (
                      <motion.path
                        key={`symbol-${i}`}
                        d={getSymbolPath()}
                        stroke="#0a0000"
                        strokeWidth="0.3"
                        fill="none"
                        animate={{
                          opacity: [0.6, 0.7, 0.6],
                          strokeWidth: [0.3, 0.4, 0.3]
                        }}
                        transition={{
                          duration: 15,
                          repeat: Infinity,
                          repeatType: "mirror",
                          delay: i * 0.8
                        }}
                      />
                    );
                  })}
                </g>
                
                {/* Subtle disturbing details - no face-like patterns */}
                <g>
                  {/* Ancient symbols */}
                  {[...Array(4)].map((_, i) => {
                    const angle = (i * 90) * Math.PI / 180;
                    const x = 150 + 70 * Math.cos(angle);
                    const y = 150 + 70 * Math.sin(angle);
                    const rotation = i * 45;
                    
                    return (
                      <motion.g
                        key={`ancient-${i}`}
                        transform={`translate(${x}, ${y}) rotate(${rotation})`}
                        animate={{
                          opacity: [0.5, 0.6, 0.5]
                        }}
                        transition={{
                          duration: 13 + i,
                          repeat: Infinity,
                          repeatType: "mirror",
                          delay: i * 2
                        }}
                      >
                        <path
                          d="M-8,-8 L8,8 M-8,8 L8,-8 M0,-12 L0,12"
                          stroke="#0c0000"
                          strokeWidth="0.3"
                          fill="none"
                        />
                      </motion.g>
                    );
                  })}
                </g>
                
                {/* Asymmetrical patterns of dots */}
                <g>
                  {[...Array(24)].map((_, i) => {
                    // Create spiral arrangement
                    const angle = (i * 15) * Math.PI / 180;
                    const distance = 40 + i * 4;
                    const x = 150 + distance * Math.cos(angle);
                    const y = 150 + distance * Math.sin(angle);
                    const size = 0.5 + (i % 4) * 0.2;
                    
                    return (
                      <motion.circle
                        key={`dot-${i}`}
                        cx={x}
                        cy={y}
                        r={size}
                        fill="#0a0000"
                        animate={{
                          opacity: [0.4, 0.5, 0.4],
                          r: [size, size * 1.2, size]
                        }}
                        transition={{
                          duration: 8 + (i % 7),
                          repeat: Infinity,
                          repeatType: "mirror",
                          delay: i * 0.3
                        }}
                      />
                    );
                  })}
                </g>
                
                {/* Subtle pulsing void at center */}
                <motion.circle
                  cx="150"
                  cy="150"
                  r="3"
                  fill="#000000"
                  filter="url(#bleed)"
                  animate={{
                    r: [3, 4, 3],
                    opacity: [0.9, 1, 0.9]
                  }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    repeatType: "mirror",
                    ease: "easeInOut"
                  }}
                />
                
                {/* Almost imperceptible bloodlike droplets */}
                <g opacity="0.3">
                  {[...Array(5)].map((_, i) => {
                    const angle = (i * 72) * Math.PI / 180;
                    const x = 150 + 100 * Math.cos(angle);
                    const y = 150 + 20 * Math.sin(angle);
                    
                    return (
                      <motion.path
                        key={`drop-${i}`}
                        d={`M ${x} ${y} Q ${x-1} ${y+15} ${x+2} ${y+30}`}
                        stroke="#090000"
                        strokeWidth="0.3"
                        fill="none"
                        filter="url(#bleed)"
                        animate={{
                          opacity: [0, 0.3, 0]
                        }}
                        transition={{
                          duration: 20,
                          repeatDelay: 15 + i * 5,
                          repeat: Infinity
                        }}
                      />
                    );
                  })}
                </g>
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