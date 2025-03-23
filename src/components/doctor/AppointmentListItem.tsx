import React from 'react';
import { Clock, User, Check, X, Calendar, MapPin } from 'lucide-react';

interface Appointment {
  id: number;
  patientName: string;
  patientAge: number;
  time: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'no-show' | 'cancelled';
  reason: string;
  department?: string;
  severity?: 'low' | 'medium' | 'high' | 'emergency';
}

interface AppointmentListItemProps {
  appointment: Appointment;
  onUpdateStatus: (status: Appointment['status']) => void;
  onStartConsultation: () => void;
}

const AppointmentListItem: React.FC<AppointmentListItemProps> = ({ 
  appointment, 
  onUpdateStatus, 
  onStartConsultation 
}) => {
  return (
    <div className="grid grid-cols-6 p-4 border-b text-sm items-center hover:bg-gray-50">
      <div className="col-span-2 flex items-center">
        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
          <User className="h-4 w-4 text-blue-600" />
        </div>
        <div>
          <p className="font-medium text-gray-900">{appointment.patientName}</p>
          <p className="text-gray-500 text-xs">{appointment.patientAge} years</p>
        </div>
      </div>
      
      <div className="flex items-center text-gray-600">
        <Clock className="h-3.5 w-3.5 mr-1 text-gray-400" />
        {appointment.time}
      </div>
      
      <div>{appointment.reason}</div>
      
      <div>
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
          <MapPin className="h-3 w-3 mr-1" />
          In-Person
        </span>
      </div>
      
      <div className="flex items-center space-x-2">
        <button 
          onClick={onStartConsultation}
          className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs font-medium"
          disabled={appointment.status !== 'scheduled'}
        >
          Begin Consultation
        </button>
        
        <div className="relative group">
          <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs font-medium">
            More Options
          </button>
          
          <div className="absolute right-0 mt-1 bg-white border rounded-md shadow-lg py-1 w-32 hidden group-hover:block z-10">
            <button 
              onClick={() => onUpdateStatus('completed')}
              className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 flex items-center"
            >
              <Check className="h-3.5 w-3.5 mr-1.5 text-green-500" />
              Mark Complete
            </button>
            <button 
              onClick={() => onUpdateStatus('no-show')}
              className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 flex items-center"
            >
              <X className="h-3.5 w-3.5 mr-1.5 text-red-500" />
              Patient No-show
            </button>
            <button 
              onClick={() => onUpdateStatus('cancelled')}
              className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 flex items-center"
            >
              <Calendar className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
              Reschedule
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentListItem; 