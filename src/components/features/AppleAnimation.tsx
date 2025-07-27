'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface AppleAnimationProps {
  isFalling?: boolean;
  onFallComplete?: () => void;
}

export default function AppleAnimation({ 
  isFalling = false, 
  onFallComplete 
}: AppleAnimationProps) {
  const [show, setShow] = useState(true);

  const handleFallComplete = () => {
    setShow(false);
    onFallComplete?.();
  };

  if (!show) return null;

  return (
    <motion.div
      className="w-8 h-8 bg-red-500 rounded-full shadow-lg"
      animate={isFalling ? {
        y: 200,
        opacity: 0,
        rotate: 360,
        scale: 0.8
      } : {
        y: 0,
        opacity: 1,
        rotate: 0,
        scale: 1
      }}
      transition={{
        duration: 1.5,
        ease: "easeIn"
      }}
      onAnimationComplete={isFalling ? handleFallComplete : undefined}
    />
  );
}