function ScoreCircle({ score, size = 'md', label }) {
  const sizes = {
    sm: { width: 60, stroke: 4, fontSize: 'text-lg' },
    md: { width: 100, stroke: 6, fontSize: 'text-2xl' },
    lg: { width: 140, stroke: 8, fontSize: 'text-4xl' },
  };

  const { width, stroke, fontSize } = sizes[size];
  const radius = (width - stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (score) => {
    if (score >= 80) return '#22c55e'; // green
    if (score >= 60) return '#eab308'; // yellow
    if (score >= 40) return '#f97316'; // orange
    return '#ef4444'; // red
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width, height: width }}>
        <svg className="transform -rotate-90" width={width} height={width}>
          <circle
            cx={width / 2}
            cy={width / 2}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth={stroke}
            fill="none"
          />
          <circle
            cx={width / 2}
            cy={width / 2}
            r={radius}
            stroke={getColor(score)}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`font-bold ${fontSize}`} style={{ color: getColor(score) }}>
            {score}
          </span>
        </div>
      </div>
      {label && <p className="mt-2 text-sm text-gray-600 font-medium">{label}</p>}
    </div>
  );
}

export default ScoreCircle;
