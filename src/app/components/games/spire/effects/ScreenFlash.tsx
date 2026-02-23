'use client';

import { motion, AnimatePresence } from 'motion/react';

interface Props {
  visible: boolean;
}

export default function ScreenFlash({ visible }: Props) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="absolute inset-0 pointer-events-none z-30"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.35, 0] }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          style={{
            background: 'radial-gradient(ellipse at center, transparent 40%, rgba(220,38,38,0.7) 100%)',
          }}
        />
      )}
    </AnimatePresence>
  );
}
