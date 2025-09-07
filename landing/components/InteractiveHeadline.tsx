import React, { useState } from 'react';
// FIX: Import the `Variants` type from framer-motion to correctly type the animation object.
import { motion, AnimatePresence, Variants } from 'framer-motion';

const InteractiveHeadline: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);

  // Animation variants for the revealed text parts
  // FIX: Explicitly type `revealAnimation` with `Variants` to fix TypeScript errors
  // related to incompatible `ease` property types.
  const revealAnimation: Variants = {
    hidden: { 
      opacity: 0, 
      width: 0, 
      display: 'inline-block',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
    },
    visible: { 
      opacity: 1, 
      width: 'auto',
      transition: { duration: 0.5, ease: [0.25, 1, 0.5, 1] } 
    },
    exit: { 
      opacity: 0, 
      width: 0,
      transition: { duration: 0.3, ease: 'easeInOut' } 
    },
  };

  return (
    <div className="relative flex flex-col items-center" style={{ minHeight: '12rem' }}>
      <h1 
        className="text-5xl md:text-7xl font-black tracking-tighter flex items-center justify-center cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label="VESA INVESTMENT, hover to reveal Verified Safe"
      >
        <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">VE</span>
        
        <AnimatePresence>
          {isHovered && (
            // FIX: Use the idiomatic `variants` prop with variant names instead of passing animation objects directly to `initial`, `animate`, and `exit`.
            <motion.span
              variants={revealAnimation}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="text-white/60"
            >
              RIFIED
            </motion.span>
          )}
        </AnimatePresence>

        <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">SA</span>
        
        <AnimatePresence>
          {isHovered && (
            // FIX: Use the idiomatic `variants` prop with variant names instead of passing animation objects directly to `initial`, `animate`, and `exit`.
            <motion.span
              variants={revealAnimation}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="text-white/60"
            >
              FE
            </motion.span>
          )}
        </AnimatePresence>
      </h1>
      <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white/40" aria-hidden="true">
        INVESTMENT
      </h1>
    </div>
  );
};

export default InteractiveHeadline;
