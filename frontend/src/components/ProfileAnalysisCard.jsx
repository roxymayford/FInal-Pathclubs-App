import { Sparkles } from 'lucide-react';

const ProfileAnalysisCard = ({ profile }) => {
  if (!profile) return null;

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Analisis Profil Siswa</h3>
      
      <div className="bg-primary-light/10 rounded-xl p-4 flex items-start gap-4 mb-6 border border-primary-light/20">
        <div className="bg-primary p-2 rounded-lg text-white">
          <Sparkles size={20} />
        </div>
        <div>
          <h4 className="text-sm font-bold text-primary-dark">Gaya Belajar: {profile.learningStyle.type}</h4>
          <p className="text-xs text-gray-500 mt-1 font-medium">{profile.learningStyle.description}</p>
        </div>
      </div>

      <div className="space-y-4">
        {profile.skills.map((skill) => (
          <div key={skill.name}>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-gray-700">{skill.name}</span>
              <span className="text-gray-900">{skill.score}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
              <div 
                className={`h-full rounded-full ${skill.colorClass}`} 
                style={{ width: `${skill.score}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileAnalysisCard;
