import React from 'react';
import { Clock, AlertTriangle, User, FileText, Clipboard } from 'lucide-react';

interface Patient {
  id: number;
  name: string;
  age: number;
  gender: string;
  reason: string;
  waitTime: string;
  severity: 'high' | 'medium' | 'low';
  status: 'waiting' | 'in-consultation' | 'discharged';
  profilePicture?: string;
}

interface PatientTriageCardProps {
  patient: Patient;
  onSelectPatient: (patient: Patient) => void;
}

const PatientTriageCard: React.FC<PatientTriageCardProps> = ({ patient, onSelectPatient }) => {
  // Severity color mapping
  const severityColorMap = {
    high: {
      bg: 'bg-red-50',
      border: 'border-red-100',
      text: 'text-red-800',
      badge: 'bg-red-100 text-red-800 border-red-200',
      icon: 'text-red-500'
    },
    medium: {
      bg: 'bg-amber-50',
      border: 'border-amber-100',
      text: 'text-amber-800',
      badge: 'bg-amber-100 text-amber-800 border-amber-200',
      icon: 'text-amber-500'
    },
    low: {
      bg: 'bg-green-50',
      border: 'border-green-100',
      text: 'text-green-800',
      badge: 'bg-green-100 text-green-800 border-green-200',
      icon: 'text-green-500'
    }
  };
  
  const colors = severityColorMap[patient.severity];
  
  return (
    <div className={`mb-3 rounded-lg border ${colors.border} ${colors.bg} overflow-hidden`}>
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-blue-100 mr-3 flex items-center justify-center">
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
              <h3 className="font-medium text-gray-900">{patient.name}</h3>
              <p className="text-sm text-gray-500">{patient.age} years, {patient.gender}</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.badge}`}>
              {patient.severity === 'high' ? 'High Priority' : 
               patient.severity === 'medium' ? 'Medium Priority' : 
               'Low Priority'}
            </span>
          </div>
        </div>
        
        <div className="mb-3">
          <div className="flex items-start">
            <AlertTriangle className={`h-4 w-4 mt-0.5 mr-2 ${colors.icon}`} />
            <p className="text-sm text-gray-700">
              <span className="font-medium">Chief Complaint:</span> {patient.reason}
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-gray-500">
            <Clock className="h-4 w-4 mr-1" />
            <span>Waiting: {patient.waitTime}</span>
          </div>
          
          <div className="flex space-x-2">
            <button 
              onClick={() => onSelectPatient(patient)}
              className="inline-flex items-center px-3 py-1 bg-white border border-gray-200 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Clipboard className="h-3.5 w-3.5 mr-1.5" />
              Collect Vitals
            </button>
            
            <button 
              className="inline-flex items-center px-3 py-1 bg-blue-600 border border-blue-600 rounded-md text-sm font-medium text-white hover:bg-blue-700"
              onClick={() => onSelectPatient(patient)}
            >
              <FileText className="h-3.5 w-3.5 mr-1.5" />
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientTriageCard; 