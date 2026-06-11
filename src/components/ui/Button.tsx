import { forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size    = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  children: React.ReactNode;
}

const variantClass: Record<Variant, string> = {
  primary:   'btn-primary',
  secondary: 'btn-secondary',
  ghost:     'btn-ghost',
};

const sizeClass: Record<Size, string> = {
  sm: 'text-[0.6875rem] px-5 py-2.5 min-h-[36px]',
  md: '',   // btn-* classes already define this
  lg: 'text-sm px-10 py-4 min-h-[52px]',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading = false, children, disabled, className = '', ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
        transition={{ duration: 0.12, ease: [0.25, 0, 0.15, 1] }}
        disabled={disabled || loading}
        className={`${variantClass[variant]} ${sizeClass[size]} ${className}`}
        aria-busy={loading}
        {...props}
      >
        {loading ? (
          <span
            aria-hidden="true"
            className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent opacity-70"
          />
        ) : children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
