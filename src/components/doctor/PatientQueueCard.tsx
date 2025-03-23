import React from 'react';
import { User, Clock, Play } from 'lucide-react';
import { Patient as PatientType } from '@/types/patient';

interface PatientQueueCardProps {
  patient: PatientType;
  onStartConsultation: () => void;
}

const PatientQueueCard: React.FC<PatientQueueCardProps> = ({ patient, onStartConsultation }) => {
  return (
    <div className="grid grid-cols-6 p-4 border-b text-sm items-center hover:bg-gray-50">
      <div className="col-span-2 flex items-center">
        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
          {patient.profilePicture ? (
            <img 
              src={patient.profilePicture} 
              alt={patient.name} 
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <User className="h-5 w-5 text-blue-600" />
          )}
        </div>
        <div>
          <p className="font-medium text-gray-900">{patient.name}</p>
          <p className="text-gray-500 text-xs">{patient.age} years, {patient.gender}</p>
        </div>
      </div>
      <div className="text-gray-700">{patient.reason}</div>
      <div className="flex items-center text-gray-600">
        <Clock className="h-3.5 w-3.5 mr-1 text-gray-400" />
        {patient.waitTime}
      </div>
      <div>
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
          patient.severity === 'high' ? 'bg-red-100 text-red-800 border border-red-200' :
          patient.severity === 'medium' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
          'bg-green-100 text-green-800 border border-green-200'
        }`}>
          {patient.severity === 'high' ? 'High Priority' :
           patient.severity === 'medium' ? 'Medium Priority' :
           'Low Priority'}
        </span>
      </div>
      <div>
        <button 
          onClick={onStartConsultation}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-xs font-medium flex items-center"
        >
          <Play className="h-3 w-3 mr-1" />
          Start
        </button>
      </div>
    </div>
  );
}; 

export default PatientQueueCard;