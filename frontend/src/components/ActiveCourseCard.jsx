import { PlayCircle, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
const ActiveCourseCard = ({ course }) => {
  if (!course) return null;

  return (
    <div className="bg-gradient-to-br from-primary-light to-primary-dark rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
      {/* Decorative gradient blob */}
      <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
      
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium mb-4">
            <Target size={14} />
            <span>{course.tag}</span>
          </div>
          <h2 className="text-2xl font-bold mb-2">{course.title}</h2>
          <p className="text-primary-light text-sm bg-white/10 px-0 py-0 rounded-lg max-w-lg leading-relaxed text-indigo-100">
            {course.description}
          </p>
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between text-sm font-semibold mb-2">
            <span>Progress</span>
            <span>{course.progress}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-1.5 mb-6">
            <div className="bg-white h-1.5 rounded-full" style={{ width: `${course.progress}%` }}></div>
          </div>
          
          <Link to={`/materi/detail?id=${course.id || 1}`} className="bg-white text-primary-dark font-semibold py-2.5 px-6 rounded-full flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors duration-300 shadow-sm text-sm inline-flex">
            <PlayCircle size={18} />
            Lanjutkan Materi
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ActiveCourseCard;
