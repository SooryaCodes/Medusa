import React from 'react';
import { AlertTriangle, Phone, ArrowRight, Clock, Users, Bed, User } from 'lucide-react';

interface EmergencyCase {
  id: number;
  patientName: string;
  patientAge: number;
  condition: string;
  arrivalTime: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'waiting' | 'in-treatment' | 'stabilized';
  location: string;
}

const EmergencyPanel: React.FC = () => {
  // Mock emergency cases
  const emergencyCases: EmergencyCase[] = [
    {
      id: 1,
      patientName: "James Wilson",
      patientAge: 62,
      condition: "Chest Pain, Possible MI",
      arrivalTime: "10:15 AM",
      severity: 'critical',
      status: 'in-treatment',
      location: 'ER Bay 3'
    },
    {
      id: 2,
      patientName: "Maria Rodriguez",
      patientAge: 45,
      condition: "Severe Allergic Reaction",
      arrivalTime: "10:30 AM",
      severity: 'high',
      status: 'waiting',
      location: 'ER Reception'
    },
    {
      id: 3,
      patientName: "David Chen",
      patientAge: 28,
      condition: "Head Trauma",
      arrivalTime: "9:55 AM",
      severity: 'high',
      status: 'stabilized',
      location: 'ER Bay 6'
    }
  ];
  
  // ER status metrics
  const erStatus = {
    occupiedBeds: 8,
    totalBeds: 12,
    waitingPatients: 5,
    averageWaitTime: '35 mins',
    criticalCases: 1
  };
  
  return (
    <div>
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Emergency Department Status</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <div className="flex items-center">
              <div className="bg-blue-500 p-2 rounded-lg text-white mr-3">
                <Bed className="h-5 w-5" />
              </div>
              <div>
                <p className="text-blue-600 text-sm font-medium">Bed Occupancy</p>
                <div className="flex items-baseline">
                  <h3 className="text-xl font-bold text-blue-800">{erStatus.occupiedBeds}/{erStatus.totalBeds}</h3>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
            <div className="flex items-center">
              <div className="bg-amber-500 p-2 rounded-lg text-white mr-3">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-amber-600 text-sm font-medium">Waiting Patients</p>
                <div className="flex items-baseline">
                  <h3 className="text-xl font-bold text-amber-800">{erStatus.waitingPatients}</h3>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
            <div className="flex items-center">
              <div className="bg-indigo-500 p-2 rounded-lg text-white mr-3">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-indigo-600 text-sm font-medium">Avg. Wait Time</p>
                <div className="flex items-baseline">
                  <h3 className="text-xl font-bold text-indigo-800">{erStatus.averageWaitTime}</h3>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-red-50 rounded-lg p-4 border border-red-100">
            <div className="flex items-center">
              <div className="bg-red-500 p-2 rounded-lg text-white mr-3">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-red-600 text-sm font-medium">Critical Cases</p>
                <div className="flex items-baseline">
                  <h3 className="text-xl font-bold text-red-800">{erStatus.criticalCases}</h3>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4 border border-green-100">
            <div className="flex flex-col justify-center h-full">
              <button className="bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center">
                <Phone className="h-4 w-4 mr-1.5" />
                Call ER Desk
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="p-4 bg-red-50 border-b border-red-100 flex items-center">
          <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
          <h2 className="text-lg font-semibold text-red-800">Active Emergency Cases</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-sm font-medium text-gray-600">
                <th className="p-4">Patient</th>
                <th className="p-4">Condition</th>
                <th className="p-4">Arrival</th>
                <th className="p-4">Severity</th>
                <th className="p-4">Status</th>
                <th className="p-4">Location</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {emergencyCases.map(emergency => (
                <tr key={emergency.id} className="border-t">
                  <td className="p-4">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{emergency.patientName}</p>
                        <p className="text-gray-500 text-xs">{emergency.patientAge} years</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">{emergency.condition}</td>
                  <td className="p-4 whitespace-nowrap">{emergency.arrivalTime}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      emergency.severity === 'critical' ? 'bg-red-100 text-red-800 border border-red-200' :
                      emergency.severity === 'high' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                      emergency.severity === 'medium' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                      'bg-green-100 text-green-800 border border-green-200'
                    }`}>
                      {emergency.severity.charAt(0).toUpperCase() + emergency.severity.slice(1)}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      emergency.status === 'waiting' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                      emergency.status === 'in-treatment' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                      'bg-green-100 text-green-800 border border-green-200'
                    }`}>
                      {emergency.status === 'waiting' ? 'Waiting' :
                       emergency.status === 'in-treatment' ? 'In Treatment' :
                       'Stabilized'}
                    </span>
                  </td>
                  <td className="p-4">{emergency.location}</td>
                  <td className="p-4">
                    <button className="text-blue-600 hover:text-blue-800">
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmergencyPanel; 