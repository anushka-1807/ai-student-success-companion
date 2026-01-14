function Card({ children, className = '', hover = false, onClick, variant = 'default' }) {
  const variants = {
    default:
      'bg-surface-50/90 dark:bg-gray-900/80 backdrop-blur-xl border border-white/40 dark:border-gray-800/60 shadow-sm dark:shadow-none',
    glass:
      'bg-white/10 dark:bg-gray-900/30 backdrop-blur-2xl border border-white/40 dark:border-gray-700/60',
    gradient:
      'bg-gradient-to-br from-surface-50 via-primary-50/70 to-secondary-50/70 dark:from-gray-900/90 dark:via-primary-900/20 dark:to-secondary-900/20 '
      + 'backdrop-blur-xl border border-white/40 dark:border-gray-700/60',
    floating:
      'bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl border border-white/60 dark:border-gray-700/70 '
      + 'shadow-[0_18px_45px_rgba(15,23,42,0.12)] dark:shadow-[0_24px_60px_rgba(0,0,0,0.65)]',
  };

  return (
    <div 
      className={`
        ${variants[variant]} rounded-2xl p-6 transition-all duration-500 ease-out will-change-transform
        ${hover ? 'cursor-pointer hover:scale-[1.02] hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(15,23,42,0.18)] dark:hover:shadow-[0_24px_60px_rgba(0,0,0,0.8)]' : ''}
        ${className}
      `}
      onClick={onClick}
      style={{
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      {children}
    </div>
  );
}

export default Card;
