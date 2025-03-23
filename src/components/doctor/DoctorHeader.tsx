import React from 'react';
import { Bell, Search, Settings, User, HelpCircle } from 'lucide-react';

interface DoctorHeaderProps {
  doctor: any;
}

const DoctorHeader: React.FC<DoctorHeaderProps> = ({ doctor }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="mr-4">
              <img src="/medusa-logo.svg" alt="Medusa Health" className="h-8" />
            </div>
            <div className="hidden md:block relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search patients, records, medications..."
                className="pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button className="p-2 rounded-full hover:bg-gray-100 relative">
              <Bell className="h-5 w-5 text-gray-600" />
              <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>
            
            <button className="p-2 rounded-full hover:bg-gray-100">
              <HelpCircle className="h-5 w-5 text-gray-600" />
            </button>
            
            <button className="p-2 rounded-full hover:bg-gray-100">
              <Settings className="h-5 w-5 text-gray-600" />
            </button>
            
            <div className="flex items-center">
              <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center text-white mr-2">
                {doctor.profilePicture ? (
                  <img 
                    src={doctor.profilePicture} 
                    alt={doctor.name} 
                    className="h-9 w-9 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-5 w-5" />
                )}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-800">Dr. {doctor.name}</p>
                <p className="text-xs text-gray-500">{doctor.specialty}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DoctorHeader; 