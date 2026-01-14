function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false, 
  loading = false,
  className = '',
  ...props 
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-2xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 transform will-change-transform';
  
  const variants = {
    primary:
      'bg-gradient-to-r from-primary-500 via-primary-400 to-secondary-400 text-white shadow-[0_12px_30px_rgba(124,58,237,0.35)] '
      + 'hover:from-primary-400 hover:via-primary-300 hover:to-secondary-300 hover:scale-105 hover:shadow-[0_18px_40px_rgba(124,58,237,0.45)] '
      + 'focus:ring-primary-400 focus:ring-offset-surface-50 dark:focus:ring-primary-500 dark:focus:ring-offset-surface-900 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm',
    secondary:
      'bg-surface-50/90 dark:bg-gray-800/80 border border-secondary-100/80 dark:border-gray-700/70 text-gray-800 dark:text-gray-100 '
      + 'hover:bg-surface-100 hover:border-secondary-200 dark:hover:bg-gray-700/90 hover:scale-[1.03] hover:shadow-md '
      + 'focus:ring-secondary-300 focus:ring-offset-surface-50 dark:focus:ring-secondary-400 dark:focus:ring-offset-surface-900 disabled:opacity-60',
    outline:
      'border border-primary-300/70 dark:border-primary-400/70 bg-transparent text-primary-600 dark:text-primary-300 '
      + 'hover:bg-primary-50/70 dark:hover:bg-primary-900/20 hover:border-primary-400 dark:hover:border-primary-300 '
      + 'hover:scale-[1.03] hover:shadow-[0_10px_25px_rgba(124,58,237,0.25)] '
      + 'focus:ring-primary-400 focus:ring-offset-surface-50 dark:focus:ring-primary-500 dark:focus:ring-offset-surface-900 disabled:opacity-60',
    danger:
      'bg-gradient-to-r from-danger-500 to-danger-400 text-white shadow-[0_10px_28px_rgba(239,68,68,0.35)] '
      + 'hover:from-danger-400 hover:to-danger-300 hover:scale-105 hover:shadow-[0_16px_36px_rgba(239,68,68,0.45)] '
      + 'focus:ring-danger-400 focus:ring-offset-surface-50 dark:focus:ring-danger-400 dark:focus:ring-offset-surface-900 disabled:opacity-60',
    glass:
      'bg-white/10 dark:bg-gray-900/20 backdrop-blur-2xl border border-white/40 dark:border-gray-700/60 text-gray-800 dark:text-gray-100 '
      + 'hover:bg-white/20 dark:hover:bg-gray-900/40 hover:scale-[1.04] hover:shadow-[0_16px_40px_rgba(15,23,42,0.55)] '
      + 'focus:ring-primary-300 focus:ring-offset-surface-50 dark:focus:ring-primary-500 dark:focus:ring-offset-surface-900 disabled:opacity-60',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}

export default Button;
