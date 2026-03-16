import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  'aria-label': string; // Enforce accessibility
  iconSize?: number;
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon: Icon, 'aria-label': ariaLabel, title, className, iconSize = 20, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        aria-label={ariaLabel}
        title={title || ariaLabel}
        className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${className || ''}`}
        {...props}
      >
        <Icon size={iconSize} />
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';
export default IconButton;
