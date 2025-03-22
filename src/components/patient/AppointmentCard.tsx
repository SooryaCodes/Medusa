import React from 'react';
import { Calendar, Clock, Map, Video, Stethoscope } from 'lucide-react';

interface AppointmentCardProps {
  appointment: any;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment }) => {
  return (
    <div className="border rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50/30 transition-all">
      <div className="flex items-start justify-between">
        <div className="flex items-start">
          <div className="bg-blue-100 text-blue-800 h-12 w-12 rounded-full flex items-center justify-center mr-3">
            {appointment.isVideo ? 
              <Video className="h-5 w-5" /> : 
              <Stethoscope className="h-5 w-5" />
            }
          </div>
          <div>
            <p className="font-semibold text-gray-900">{appointment.doctorName}</p>
            <p className="text-sm text-blue-700">{appointment.specialty}</p>
            <div className="mt-1 flex items-center text-sm text-gray-600">
              <Clock className="w-3.5 h-3.5 mr-1 text-blue-500" />
              {appointment.date} at {appointment.time}
            </div>
            {appointment.location && (
              <div className="mt-1 flex items-center text-sm text-gray-600">
                <Map className="w-3.5 h-3.5 mr-1 text-blue-500" />
                {appointment.location}
              </div>
            )}
            {appointment.notes && (
              <div className="mt-2 text-sm text-gray-700 bg-gray-50 p-2 rounded-md">
                <p className="font-medium">Notes:</p>
                <p>{appointment.notes}</p>
              </div>
            )}
          </div>
        </div>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          appointment.isVideo
            ? "bg-blue-100 text-blue-800 border border-blue-200"
            : "bg-purple-100 text-purple-800 border border-purple-200"
        }`}>
          {appointment.isVideo ? 'Virtual' : 'In-Person'}
        </span>
      </div>
      <div className="mt-3 flex space-x-2">
        {appointment.isVideo && (
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-sm flex items-center">
            <Video className="w-3.5 h-3.5 mr-1.5" />
            Join Call
          </button>
        )}
        <button className="border border-blue-200 text-blue-700 px-3 py-1.5 rounded-md text-sm bg-white hover:bg-blue-50">
          Reschedule
        </button>
        <button className="text-gray-600 px-3 py-1.5 rounded-md text-sm hover:bg-gray-50">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default AppointmentCard; 