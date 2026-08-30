import { Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
const RecommendationCard = ({ title, level, duration, bgClass }) => {
  return (
    <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 flex flex-col">
      <div className={`${bgClass} h-32 rounded-2xl relative mb-4`}>
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1.5 text-xs font-bold text-primary">
          <Eye size={12} />
          <span>Visual</span>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h4 className="font-bold text-gray-800 text-sm leading-snug mb-3">{title}</h4>
          <div className="flex justify-between items-center text-xs text-gray-500 font-medium mb-4">
            <span>Tingkat: {level}</span>
            <span>{duration} Menit</span>
          </div>
        </div>
        
        <Link to="/materi/detail" className="w-full py-2.5 rounded-xl border border-primary text-primary font-semibold text-sm hover:bg-primary-light/5 transition-colors text-center inline-block">
          Mulai Belajar
        </Link>
      </div>
    </div>
  );
};

export default RecommendationCard;
