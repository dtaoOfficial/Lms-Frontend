import React from 'react';
import { motion } from 'framer-motion';

/**
 * A reusable wrapper component that animates its children
 * as they scroll into the viewport.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children - The content to animate.
 * @param {number} [props.amount=0.3] - How much of the item must be visible to trigger the animation (0 to 1).
 */
const ScrollAnimation = ({ children, amount = 0.3 }) => {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: amount }} // `once: true` means it only animates once
      transition={{ duration: 0.5, ease: 'easeOut' }}
      variants={{
        hidden: { opacity: 0, y: 20 }, // Start invisible and 20px down
        visible: { opacity: 1, y: 0 },   // Animate to fully visible and at y=0
      }}
    >
      {children}
    </motion.div>
  );
};

export default ScrollAnimation;