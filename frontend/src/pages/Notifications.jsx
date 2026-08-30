import React, { useState } from 'react';
import { 
  CheckCheck, 
  Bell, 
  BrainCircuit, 
  ClipboardList, 
  Flame, 
  Grid,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

const Notifications = () => {
  const { dashboardData: data } = useAuth();
  const [activeTab, setActiveTab] = useState('Semua');

  const notificationsList = data?.notifications || [];
  
  // Filter notifications based on activeTab
  const filteredNotifications = notificationsList.filter(n => {
    if (activeTab === 'Semua') return true;
    if (activeTab === 'Pencapaian' && n.type === 'achievement') return true;
    if (activeTab === 'Rekomendasi AI' && n.type === 'ai') return true;
    if (activeTab === 'Sistem' && n.type === 'system') return true;
    return false;
  });

  const getIcon = (name) => {
    switch (name) {
      case 'Award': return Flame; // using Flame as fallback
      case 'BrainCircuit': return BrainCircuit;
      case 'ClipboardList': return ClipboardList;
      case 'Flame': return Flame;
      case 'Grid': return Grid;
      case 'CheckCheck': return CheckCheck;
      default: return Bell;
    }
  };

  const tabs = [
    { name: 'Semua', count: notificationsList.filter(n => n.unread).length },
    { name: 'Rekomendasi AI', count: notificationsList.filter(n => n.type === 'ai' && n.unread).length },
    { name: 'Pencapaian', count: notificationsList.filter(n => n.type === 'achievement' && n.unread).length },
    { name: 'Sistem', count: notificationsList.filter(n => n.type === 'system' && n.unread).length },
  ];

  const renderDescription = (text) => {
    // Simple bold text parser for **text**
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return (
      <span className="text-gray-600 text-sm leading-relaxed">
        {parts.map((part, index) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={index} className="text-gray-900 font-bold">{part.slice(2, -2)}</strong>;
          }
          return part;
        })}
      </span>
    );
  };

  const handleMarkAllAsRead = () => {
    const newData = JSON.parse(JSON.stringify(data));
    if (newData.notifications) {
      newData.notifications.forEach(n => n.unread = false);
      setDashboardData(newData);
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden w-full text-left">
      <Sidebar user={data.user} />
      
      <main className="flex-1 overflow-y-auto pt-20 md:pt-8 pb-24 md:pb-10 px-4 sm:px-6 md:px-8 lg:p-10">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Notifikasi</h1>
            <p className="text-gray-500 font-medium text-sm">Pantau aktivitas, rekomendasi belajar, dan pencapaian terbarumu.</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
            >
              <CheckCheck size={16} />
              Tandai semua dibaca
            </button>
            <button className="bg-indigo-50 p-2.5 rounded-xl shadow-sm text-[#4232c2] hover:bg-indigo-100 transition-colors relative">
              <Bell size={20} />
              {tabs[0].count > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-indigo-50"></span>
              )}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === tab.name 
                  ? 'bg-gray-900 text-white shadow-sm' 
                  : 'bg-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {tab.name}
              {tab.count > 0 && (
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  activeTab === tab.name ? 'bg-red-500 text-white' : 'bg-red-100 text-red-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Notification List */}
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100">
          {filteredNotifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm font-medium">Belum ada notifikasi di kategori ini.</div>
          ) : (
            filteredNotifications.map((notification, index) => {
              const Icon = getIcon(notification.iconName);
              return (
                <div 
                  key={notification.id}
                  className={`flex gap-4 p-6 transition-colors ${
                    notification.unread ? 'bg-[#f8f9fc] border-l-4 border-l-[#4232c2]' : 'bg-white border-l-4 border-l-transparent'
                  } ${index !== filteredNotifications.length - 1 ? 'border-b border-gray-100' : ''}`}
                >
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center ${notification.iconBg || 'bg-gray-100'} ${notification.iconColor || 'text-gray-500'}`}>
                    <Icon size={24} />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className={`font-bold ${notification.unread ? 'text-gray-900' : 'text-gray-800'}`}>
                        {notification.title}
                      </h3>
                      <span className="text-xs text-gray-400 font-medium whitespace-nowrap ml-4">
                        {notification.time}
                      </span>
                    </div>
                    
                    <p className="mb-4 pr-12">
                      {renderDescription(notification.description)}
                    </p>

                    {notification.actionText && (
                      <button className="px-5 py-2 bg-white border border-[#4232c2] text-[#4232c2] text-sm font-bold rounded-xl hover:bg-indigo-50 transition-colors">
                        {notification.actionText}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

      </main>
    </div>
  );
};

export default Notifications;
