import { Book, GraduationCap, Flame, Trophy } from 'lucide-react';

const iconMap = {
  Book,
  GraduationCap,
  Flame,
  Trophy
};

const StatCard = ({ icon, value, label, iconColorClass, iconBgClass }) => {
  const Icon = typeof icon === 'string' ? iconMap[icon] : icon;

  if (!Icon) return null;

  return (
    <div className="bg-white rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center gap-4 shadow-sm">
      <div className={`p-3 rounded-xl ${iconBgClass}`}>
        <Icon size={24} className={iconColorClass} />
      </div>
      <div>
        <h3 className="text-xl font-bold text-gray-800">{value}</h3>
        <p className="text-xs text-gray-400 font-medium">{label}</p>
      </div>
    </div>
  );
};

export default StatCard;
