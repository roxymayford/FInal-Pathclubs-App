const DailyTargetCard = ({ target }) => {
  if (!target) return null;

  // SVG Circle calculations for progress
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const progressRatio = target.currentMinutes / (target.targetMinutes || 1);
  const strokeDashoffset = circumference - (progressRatio * circumference);

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm flex flex-col h-full">
      <h3 className="text-lg font-bold text-gray-800 mb-6">Target Harian</h3>
      
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="relative w-40 h-40">
          {/* Background circle */}
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              className="text-gray-100"
            />
            {/* Progress circle */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="text-primary-dark transition-all duration-1000 ease-out"
            />
          </svg>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-black text-gray-800 tracking-tight">{target.currentMinutes}</span>
            <span className="text-xs font-medium text-gray-400 mt-1">dari {target.targetMinutes} Menit</span>
          </div>
        </div>
        
        <p className="text-xs text-gray-400 font-medium text-center mt-6">
          {target.message}
        </p>
      </div>
    </div>
  );
};

export default DailyTargetCard;
