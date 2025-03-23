import React, { useState } from 'react';
import { Bell, X, ChevronRight, AlertCircle, Calendar, FileText, MessageSquare, Info } from 'lucide-react';
import { doctorNotifications, DoctorNotification } from '@/data/doctorData';

interface NotificationCenterProps {
  onClose: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ onClose }) => {
  const [notifications, setNotifications] = useState(doctorNotifications);
  
  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };
  
  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    ));
  };
  
  const getIcon = (type: DoctorNotification['type']) => {
    switch (type) {
      case 'lab':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'appointment':
        return <Calendar className="h-4 w-4 text-purple-500" />;
      case 'message':
        return <MessageSquare className="h-4 w-4 text-green-500" />;
      case 'alert':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'system':
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };
  
  const unreadCount = notifications.filter(n => !n.isRead).length;
  
  return (
    <div className="bg-white rounded-xl shadow-xl overflow-hidden w-80 max-h-[600px] flex flex-col">
      <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
        <div className="flex items-center">
          <Bell className="h-5 w-5 mr-2" />
          <h2 className="font-semibold">Notifications</h2>
          {unreadCount > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={markAllAsRead}
            className="text-xs bg-blue-700 hover:bg-blue-800 px-2 py-1 rounded"
          >
            Mark all read
          </button>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-blue-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <Bell className="h-10 w-10 text-gray-300 mx-auto mb-2" />
            <p>No notifications</p>
          </div>
        ) : (
          notifications.map(notification => (
            <div 
              key={notification.id}
              className={`p-4 border-b last:border-b-0 hover:bg-gray-50 ${
                !notification.isRead ? 'bg-blue-50' : ''
              }`}
              onClick={() => markAsRead(notification.id)}
            >
              <div className="flex">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center mr-3 ${
                  notification.priority === 'high' ? 'bg-red-100' :
                  notification.priority === 'medium' ? 'bg-amber-100' :
                  'bg-green-100'
                }`}>
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-gray-900 text-sm">{notification.title}</h3>
                    <span className="text-xs text-gray-500">{notification.time}</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                </div>
              </div>
              
              {notification.actionRequired && (
                <div className="mt-2 pt-2 border-t border-gray-100 flex justify-end">
                  <button className="text-xs text-blue-600 hover:text-blue-800 flex items-center">
                    Take action <ChevronRight className="h-3 w-3 ml-1" />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationCenter; 