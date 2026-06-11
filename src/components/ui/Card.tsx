import { forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

type CardVariant = 'default' | 'hero' | 'modal';

interface CardProps extends HTMLMotionProps<'div'> {
  variant?: CardVariant;
  hover?: boolean;
}

const variantClass: Record<CardVariant, string> = {
  default: 'card',
  hero:    'card-hero',
  modal:   'card-modal',
};

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', hover = false, className = '', children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        whileHover={hover ? { y: -2 } : undefined}
        transition={{ duration: 0.18, ease: [0.25, 0, 0.15, 1] }}
        className={`${variantClass[variant]} ${className}`}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = 'Card';
export default Card;
