import { Eye, Headphones, MousePointer2, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

const RecommendationCard = ({ id, title, level, duration, bgClass, type = 'Visual' }) => {
  const getStyleIcon = (styleType) => {
    switch (styleType?.toLowerCase()) {
      case 'auditori':
      case 'audio':
        return <Headphones size={12} />;
      case 'kinestetik':
      case 'interaktif':
        return <MousePointer2 size={12} />;
      case 'artikel':
      case 'baca-tulis':
        return <BookOpen size={12} />;
      default:
        return <Eye size={12} />;
    }
  };

  return (
    <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 flex flex-col">
      <div className={`${bgClass || 'bg-indigo-100'} h-32 rounded-2xl relative mb-4`}>
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1.5 text-xs font-bold text-primary">
          {getStyleIcon(type)}
          <span>{type || 'Visual'}</span>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h4 className="font-bold text-gray-800 text-sm leading-snug mb-3">{title}</h4>
          <div className="flex justify-between items-center text-xs text-gray-500 font-medium mb-4">
            <span>Tingkat: {level || 'Dasar'}</span>
            <span>{duration}</span>
          </div>
        </div>
        
        <Link 
          to={`/materi/detail?id=${id || 1}`} 
          className="w-full py-2.5 rounded-xl border border-primary text-primary font-semibold text-sm hover:bg-primary-light/5 transition-colors text-center inline-block"
        >
          Mulai Belajar
        </Link>
      </div>
    </div>
  );
};

export default RecommendationCard;

