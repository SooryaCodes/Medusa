import React from 'react';
import { Calendar, Clock, Map, Stethoscope, Phone } from 'lucide-react';

interface AppointmentProps {
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  location: string;
  isVideo: boolean;
  notes?: string;
  duration?: number;
  status?: string;
}

interface AppointmentCardProps {
  appointment: AppointmentProps;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment }) => {
  // Function to get status badge color
  const getStatusBadgeClass = (status?: string) => {
    switch(status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'rescheduled':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-purple-100 text-purple-800 border-purple-200';
    }
  };

  return (
    <div className="border rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50/30 transition-all">
      <div className="flex items-start justify-between">
        <div className="flex items-start">
          <div className="bg-blue-100 text-blue-800 h-12 w-12 rounded-full flex items-center justify-center mr-3">
            <Stethoscope className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">{appointment.doctorName}</p>
            <p className="text-sm text-blue-700">{appointment.specialty}</p>
            <div className="mt-1 flex items-center text-sm text-gray-600">
              <Clock className="w-3.5 h-3.5 mr-1 text-blue-500" />
              {appointment.date} at {appointment.time}
              {appointment.duration && (
                <span className="ml-1.5 text-xs text-gray-500">
                  ({appointment.duration} min)
                </span>
              )}
            </div>
            {appointment.location && (
              <div className="mt-1 flex items-center text-sm text-gray-600">
                {appointment.isVideo ? (
                  <Phone className="w-3.5 h-3.5 mr-1 text-blue-500" />
                ) : (
                  <Map className="w-3.5 h-3.5 mr-1 text-blue-500" />
                )}
                {appointment.location}
              </div>
            )}
            {appointment.notes && (
              <div className="mt-2 text-sm text-gray-700 bg-gray-50 p-2 rounded-md">
                <p className="font-medium">Reason:</p>
                <p>{appointment.notes}</p>
              </div>
            )}
          </div>
        </div>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(appointment.status)}`}>
          {appointment.isVideo ? 'Video Consultation' : 'In-Person Visit'}
        </span>
      </div>
      <div className="mt-3 flex space-x-2">
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-sm flex items-center">
          <Calendar className="w-3.5 h-3.5 mr-1.5" />
          Reschedule
        </button>
        
        <button className="text-gray-600 px-3 py-1.5 rounded-md text-sm hover:bg-gray-50 border border-gray-200">
          Cancel Appointment
        </button>
      </div>
    </div>
  );
};

export default AppointmentCard; 