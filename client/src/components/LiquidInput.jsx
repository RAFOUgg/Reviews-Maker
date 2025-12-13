import React from 'react';

/**
 * REVIEWS-MAKER V2 - Liquid Glass Input
 * Input avec effet glassmorphism Apple-like
 */

const LiquidInput = React.forwardRef(({
  label,
  error,
  hint,
  icon: Icon,
  iconPosition = 'left',
  fullWidth = true,
  className = '',
  ...props
}, ref) => {
  const inputClasses = `
    liquid-glass w-full px-4 py-3 rounded-xl
    text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]
    border border-[var(--border-primary)]
    focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-[var(--accent-primary)]/20
    transition-smooth outline-none
    ${Icon && iconPosition === 'left' ? 'pl-12' : ''}
    ${Icon && iconPosition === 'right' ? 'pr-12' : ''}
    ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
    ${className}
  `;

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label className="block text-sm font-medium mb-2 text-[var(--text-primary)]">
          {label}
        </label>
      )}

      <div className="relative">
        {Icon && iconPosition === 'left' && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]">
            <Icon size={20} />
          </div>
        )}

        <input
          ref={ref}
          className={inputClasses}
          {...props}
        />

        {Icon && iconPosition === 'right' && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]">
            <Icon size={20} />
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}

      {hint && !error && (
        <p className="mt-1 text-sm text-[var(--text-tertiary)]">{hint}</p>
      )}
    </div>
  );
});

LiquidInput.displayName = 'LiquidInput';

export default LiquidInput;
