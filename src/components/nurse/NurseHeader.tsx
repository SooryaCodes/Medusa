import React, { useState } from 'react';
import { 
  Bell, Search, User, Settings, HelpCircle, 
  LogOut, MessageCircle, AlertCircle, Bot, 
  FileText, Clock, ChevronDown 
} from 'lucide-react';

interface Nurse {
  id: number;
  name: string;
  avatar?: string;
  shift: 'Morning' | 'Afternoon' | 'Night';
  ward: string;
  role: string;
}

interface NurseHeaderProps {
  nurse: Nurse;
  onOpenAI: () => void;
}

interface Notification {
  id: number;
  type: 'alert' | 'message' | 'task' | 'info';
  title: string;
  message: string;
  time: string;
  isRead: boolean;
}

// Mock notifications
const mockNotifications: Notification[] = [
  {
    id: 1,
    type: 'alert',
    title: 'Critical Patient Admitted',
    message: 'New critical patient (James Wilson, 62) admitted with severe chest pain.',
    time: '2 mins ago',
    isRead: false
  },
  {
    id: 2,
    type: 'message',
    title: 'Message from Dr. Sharma',
    message: 'Please prepare Room 3 for an incoming emergency case.',
    time: '15 mins ago',
    isRead: false
  },
  {
    id: 3,
    type: 'task',
    title: 'Medication Due',
    message: 'Reminder: Emily Davis (Room 205) needs antibiotics administration.',
    time: '30 mins ago',
    isRead: true
  },
  {
    id: 4,
    type: 'info',
    title: 'Shift Change Update',
    message: 'Tonight\'s shift schedule has been updated. Please check the roster.',
    time: '1 hour ago',
    isRead: true
  }
];

const NurseHeader: React.FC<NurseHeaderProps> = ({ nurse, onOpenAI }) => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const unreadNotifications = mockNotifications.filter(notification => !notification.isRead).length;
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'alert':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'message':
        return <MessageCircle className="h-5 w-5 text-blue-600" />;
      case 'task':
        return <Clock className="h-5 w-5 text-amber-600" />;
      case 'info':
        return <FileText className="h-5 w-5 text-gray-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };
  
  const getNotificationBg = (type: string) => {
    switch (type) {
      case 'alert':
        return 'bg-red-50';
      case 'message':
        return 'bg-blue-50';
      case 'task':
        return 'bg-amber-50';
      case 'info':
        return 'bg-gray-50';
      default:
        return 'bg-white';
    }
  };
  
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="text-xl font-bold text-blue-600 mr-10">MedusaCare</div>
            
            <div className="relative hidden md:block">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search patients, doctors, rooms..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 w-64"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button 
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-blue-600 relative"
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            >
              <Bell className="h-5 w-5" />
              {unreadNotifications > 0 && (
                <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">
                  {unreadNotifications}
                </span>
              )}
            </button>
            
            <button 
              className="p-2 rounded-lg text-gray-600 hover:bg-indigo-100 hover:text-indigo-600"
              onClick={onOpenAI}
            >
              <Bot className="h-5 w-5" />
            </button>
            
            <button className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-blue-600">
              <HelpCircle className="h-5 w-5" />
            </button>
            
            <div className="relative">
              <button 
                className="flex items-center space-x-3 focus:outline-none"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  {nurse.avatar ? (
                    <img 
                      src={nurse.avatar} 
                      alt={nurse.name} 
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-4 w-4 text-blue-600" />
                  )}
                </div>
                
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-800">{nurse.name}</p>
                  <p className="text-xs text-gray-500">{nurse.role}</p>
                </div>
                
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </button>
              
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                  <div className="p-3 border-b">
                    <p className="text-sm font-medium text-gray-900">{nurse.name}</p>
                    <p className="text-xs text-gray-500">{nurse.role}</p>
                    <div className="mt-1 flex items-center">
                      <div className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                        {nurse.shift} Shift
                      </div>
                      <div className="bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded-full ml-1">
                        {nurse.ward}
                      </div>
                    </div>
                  </div>
                  
                  <div className="py-1">
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                      <User className="h-4 w-4 mr-3 text-gray-500" />
                      My Profile
                    </a>
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                      <Settings className="h-4 w-4 mr-3 text-gray-500" />
                      Settings
                    </a>
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                      <LogOut className="h-4 w-4 mr-3 text-gray-500" />
                      Sign out
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Notifications dropdown */}
      {isNotificationsOpen && (
        <div className="absolute right-4 mt-2 w-96 max-h-[70vh] overflow-y-auto rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
          <div className="p-3 border-b flex justify-between items-center">
            <h3 className="font-medium text-gray-900">Notifications</h3>
            <span className="text-xs text-blue-600 cursor-pointer hover:text-blue-800">
              Mark all as read
            </span>
          </div>
          
          <div>
            {mockNotifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No notifications
              </div>
            ) : (
              mockNotifications.map(notification => (
                <div 
                  key={notification.id} 
                  className={`p-3 border-b ${!notification.isRead ? 'bg-blue-50' : getNotificationBg(notification.type)} hover:bg-gray-50 cursor-pointer`}
                >
                  <div className="flex">
                    <div className="mr-3 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="text-sm font-medium text-gray-900">{notification.title}</h4>
                        <span className="text-xs text-gray-500 whitespace-nowrap ml-2">{notification.time}</span>
                      </div>
                      <p className="text-sm text-gray-600">{notification.message}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="p-2 border-t text-center">
            <a href="#" className="text-sm text-blue-600 hover:text-blue-800">
              View all notifications
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

export default NurseHeader;