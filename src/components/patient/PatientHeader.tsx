import React from 'react';
import { Bell, Heart, Search, Settings } from 'lucide-react';

interface PatientHeaderProps {
  patient: any;
}

const PatientHeader: React.FC<PatientHeaderProps> = ({ patient }) => {
  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart className="w-8 h-8 text-blue-600" />
          <span className="text-xl font-semibold text-gray-900">MedPortal</span>
        </div>
          
        <div className="flex-1 max-w-md mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input 
              type="text" 
              placeholder="Search for doctors, medications, records..." 
              className="w-full py-2 pl-10 pr-4 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
          
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full hover:bg-gray-100 relative">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
          </button>
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-full bg-blue-100 overflow-hidden flex-shrink-0">
              {patient.profilePicture ? (
                <img src={patient.profilePicture} alt={patient.name} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-blue-600 font-semibold">
                  {patient.name.split(' ').map((n: string) => n[0]).join('')}
                </div>
              )}
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-900">{patient.name}</p>
              <p className="text-xs text-gray-500">Patient</p>
            </div>
          </div>
          <button className="p-2 rounded-full hover:bg-gray-100">
            <Settings className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default PatientHeader; 