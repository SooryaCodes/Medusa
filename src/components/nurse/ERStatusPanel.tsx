import React from 'react';
import { AlertTriangle, Users, Clock, Bed, User, Activity } from 'lucide-react';

interface ERStatusPanelProps {
  onFastTrack: (patientId: number) => void;
}

const ERStatusPanel: React.FC<ERStatusPanelProps> = ({ onFastTrack }) => {
  // Mock ER status data
  const erStatus = {
    occupiedBeds: 8,
    totalBeds: 12,
    waitingPatients: 5,
    averageWaitTime: '35 mins',
    criticalCases: 2,
    ongoingCases: 6
  };
  
  // Mock critical patients
  const criticalPatients = [
    {
      id: 1,
      name: "James Wilson",
      age: 62,
      condition: "Chest Pain, Possible MI",
      arrivalTime: "10:15 AM",
      severity: 'critical',
      waitTime: '5 mins'
    },
    {
      id: 2,
      name: "Maria Rodriguez",
      age: 45,
      condition: "Severe Allergic Reaction",
      arrivalTime: "10:30 AM",
      severity: 'high',
      waitTime: '12 mins'
    }
  ];
  
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Live ER & Triage Status</h2>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
          <div className="flex items-center">
            <div className="bg-blue-500 p-2 rounded-lg text-white mr-3">
              <Bed className="h-4 w-4" />
            </div>
            <div>
              <p className="text-blue-600 text-xs font-medium">Bed Occupancy</p>
              <div className="flex items-baseline">
                <h3 className="text-lg font-bold text-blue-800">{erStatus.occupiedBeds}/{erStatus.totalBeds}</h3>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
          <div className="flex items-center">
            <div className="bg-amber-500 p-2 rounded-lg text-white mr-3">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <p className="text-amber-600 text-xs font-medium">Waiting Patients</p>
              <div className="flex items-baseline">
                <h3 className="text-lg font-bold text-amber-800">{erStatus.waitingPatients}</h3>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-100">
          <div className="flex items-center">
            <div className="bg-indigo-500 p-2 rounded-lg text-white mr-3">
              <Activity className="h-4 w-4" />
            </div>
            <div>
              <p className="text-indigo-600 text-xs font-medium">Ongoing Cases</p>
              <div className="flex items-baseline">
                <h3 className="text-lg font-bold text-indigo-800">{erStatus.ongoingCases}</h3>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-red-50 rounded-lg p-3 border border-red-100">
          <div className="flex items-center">
            <div className="bg-red-500 p-2 rounded-lg text-white mr-3">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <p className="text-red-600 text-xs font-medium">Critical Cases</p>
              <div className="flex items-baseline">
                <h3 className="text-lg font-bold text-red-800">{erStatus.criticalCases}</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <h3 className="text-sm font-medium text-gray-700 mb-2">Fast-Track Critical Patients</h3>
      
      <div className="space-y-3">
        {criticalPatients.map(patient => (
          <div key={patient.id} className="p-3 bg-red-50 border border-red-100 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center mr-2">
                  <User className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">{patient.name}, {patient.age}</p>
                  <p className="text-xs text-gray-600">{patient.condition}</p>
                </div>
              </div>
              <button 
                onClick={() => onFastTrack(patient.id)}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-medium flex items-center"
              >
                Fast-Track
              </button>
            </div>
            <div className="mt-2 flex items-center text-xs text-gray-500">
              <Clock className="h-3 w-3 mr-1" />
              Waiting: {patient.waitTime}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ERStatusPanel; 