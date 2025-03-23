import React, { useState } from 'react';
import { 
  Users, Search, Check, Clock, AlertTriangle,
  ChevronDown, ChevronUp, User, Filter, Trash2, ArrowRight,
  Play, Stethoscope, MessageSquare
} from 'lucide-react';

interface PatientQueuePanelProps {
  filterBySeverity?: 'high' | 'medium' | 'low';
  compact?: boolean;
  onFastTrack?: (patientId: number) => void;
  onAssignDoctor?: (patientId: number, doctorId: number) => void;
  onUpdateStatus?: (patientId: number, status: string) => void;
}

// Mock patient data
const mockPatients = [
  {
    id: 1,
    name: "Michael Brown",
    age: 45,
    gender: "Male",
    reason: "Severe chest pain, shortness of breath",
    waitTime: "12 mins",
    severity: "high",
    status: "waiting"
  },
  {
    id: 2,
    name: "Sarah Johnson",
    age: 32,
    gender: "Female",
    reason: "Migraine, nausea",
    waitTime: "25 mins",
    severity: "medium",
    status: "waiting"
  },
  {
    id: 3,
    name: "James Wilson",
    age: 62,
    reason: "Fall injury, possible fracture",
    waitTime: "5 mins",
    severity: "high",
    gender: "Male",
    status: "waiting"
  },
  {
    id: 4,
    name: "Emily Davis",
    age: 28,
    gender: "Female",
    reason: "Fever, cough",
    waitTime: "30 mins",
    severity: "low",
    status: "in-consultation"
  },
  {
    id: 5,
    name: "Robert Miller",
    age: 55,
    gender: "Male",
    reason: "Abdominal pain",
    waitTime: "18 mins",
    severity: "medium",
    status: "waiting"
  },
  {
    id: 6,
    name: "Maria Rodriguez",
    age: 45,
    gender: "Female",
    reason: "Severe allergic reaction",
    waitTime: "7 mins",
    severity: "high",
    status: "waiting"
  }
];

// Mock doctor data
const mockDoctors = [
  { id: 1, name: "Dr. Sharma", specialty: "Emergency Medicine", availability: "Available" },
  { id: 2, name: "Dr. Chen", specialty: "Internal Medicine", availability: "Busy" },
  { id: 3, name: "Dr. Johnson", specialty: "Cardiology", availability: "Available" },
  { id: 4, name: "Dr. Patel", specialty: "Orthopedics", availability: "In Surgery" }
];

const PatientQueuePanel: React.FC<PatientQueuePanelProps> = ({ 
  filterBySeverity, 
  compact = false, 
  onFastTrack, 
  onAssignDoctor,
  onUpdateStatus
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDoctorAssignment, setShowDoctorAssignment] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'waitTime' | 'severity'>('severity');
  
  // Filter patients based on criteria
  const filteredPatients = mockPatients
    .filter(patient => {
      // Filter by severity if provided
      if (filterBySeverity && patient.severity !== filterBySeverity) {
        return false;
      }
      
      // Filter by status if selected
      if (statusFilter !== 'all' && patient.status !== statusFilter) {
        return false;
      }
      
      // Filter by search term
      if (searchTerm && !patient.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !patient.reason.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      // Sort by selected criteria
      if (sortBy === 'severity') {
        const severityOrder = { high: 0, medium: 1, low: 2 };
        return severityOrder[a.severity as keyof typeof severityOrder] - severityOrder[b.severity as keyof typeof severityOrder];
      } else {
        // Sort by wait time (assuming format "X mins")
        return parseInt(a.waitTime) - parseInt(b.waitTime);
      }
    });
  
  const handleFastTrack = (patientId: number) => {
    if (onFastTrack) {
      onFastTrack(patientId);
    }
  };
  
  const handleAssignDoctor = (patientId: number, doctorId: number) => {
    if (onAssignDoctor) {
      onAssignDoctor(patientId, doctorId);
      setShowDoctorAssignment(null);
    }
  };
  
  const handleUpdateStatus = (patientId: number, status: string) => {
    if (onUpdateStatus) {
      onUpdateStatus(patientId, status);
    }
  };
  
  // Status counts for the header
  const statusCounts = {
    waiting: mockPatients.filter(p => p.status === 'waiting').length,
    inConsultation: mockPatients.filter(p => p.status === 'in-consultation').length,
    discharged: mockPatients.filter(p => p.status === 'discharged').length,
    critical: mockPatients.filter(p => p.severity === 'high').length
  };
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {!compact && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <Users className="h-5 w-5 mr-2 text-blue-600" />
              Patient Queue
            </h2>
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search patients..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="relative">
                <select
                  className="appearance-none pl-3 pr-8 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Patients</option>
                  <option value="waiting">Waiting</option>
                  <option value="in-consultation">In Consultation</option>
                  <option value="discharged">Discharged</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </div>
              </div>
              
              <button
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  sortBy === 'severity' 
                    ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                    : 'bg-gray-100 text-gray-700 border border-gray-200'
                }`}
                onClick={() => setSortBy('severity')}
              >
                <AlertTriangle className="h-4 w-4 inline mr-1" />
                By Severity
              </button>
              
              <button
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  sortBy === 'waitTime' 
                    ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                    : 'bg-gray-100 text-gray-700 border border-gray-200'
                }`}
                onClick={() => setSortBy('waitTime')}
              >
                <Clock className="h-4 w-4 inline mr-1" />
                By Wait Time
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-blue-50 p-3 rounded-lg flex items-center justify-between border border-blue-100">
              <div>
                <p className="text-xs text-blue-700 font-medium">Waiting</p>
                <p className="text-xl font-bold text-blue-800">{statusCounts.waiting}</p>
              </div>
              <div className="bg-blue-200 p-2 rounded-full">
                <Clock className="h-5 w-5 text-blue-700" />
              </div>
            </div>
            
            <div className="bg-amber-50 p-3 rounded-lg flex items-center justify-between border border-amber-100">
              <div>
                <p className="text-xs text-amber-700 font-medium">In Consultation</p>
                <p className="text-xl font-bold text-amber-800">{statusCounts.inConsultation}</p>
              </div>
              <div className="bg-amber-200 p-2 rounded-full">
                <Stethoscope className="h-5 w-5 text-amber-700" />
              </div>
            </div>
            
            <div className="bg-green-50 p-3 rounded-lg flex items-center justify-between border border-green-100">
              <div>
                <p className="text-xs text-green-700 font-medium">Discharged</p>
                <p className="text-xl font-bold text-green-800">{statusCounts.discharged}</p>
              </div>
              <div className="bg-green-200 p-2 rounded-full">
                <Check className="h-5 w-5 text-green-700" />
              </div>
            </div>
            
            <div className="bg-red-50 p-3 rounded-lg flex items-center justify-between border border-red-100">
              <div>
                <p className="text-xs text-red-700 font-medium">Critical Patients</p>
                <p className="text-xl font-bold text-red-800">{statusCounts.critical}</p>
              </div>
              <div className="bg-red-200 p-2 rounded-full">
                <AlertTriangle className="h-5 w-5 text-red-700" />
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Patient
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reason
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Wait Time
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Severity
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredPatients.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                  No patients matching your criteria
                </td>
              </tr>
            ) : (
              filteredPatients.map(patient => (
                <tr key={patient.id} className={`${patient.severity === 'high' ? 'bg-red-50' : ''} hover:bg-gray-50`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-500" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                        <div className="text-sm text-gray-500">{patient.age} years, {patient.gender}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{patient.reason}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center">
                      <Clock className="h-4 w-4 mr-1 text-gray-400" />
                      {patient.waitTime}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      patient.severity === 'high' 
                        ? 'bg-red-100 text-red-800' 
                        : patient.severity === 'medium'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-green-100 text-green-800'
                    }`}>
                      {patient.severity === 'high' ? 'High' : patient.severity === 'medium' ? 'Medium' : 'Low'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      patient.status === 'waiting' 
                        ? 'bg-blue-100 text-blue-800' 
                        : patient.status === 'in-consultation'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-green-100 text-green-800'
                    }`}>
                      {patient.status === 'waiting' ? 'Waiting' : 
                       patient.status === 'in-consultation' ? 'In Consultation' : 
                       'Discharged'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      {patient.severity === 'high' && patient.status === 'waiting' && onFastTrack && (
                        <button
                          onClick={() => handleFastTrack(patient.id)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                        >
                          Fast-Track
                        </button>
                      )}
                      
                      {patient.status === 'waiting' && onAssignDoctor && (
                        <div className="relative">
                          <button
                            onClick={() => setShowDoctorAssignment(showDoctorAssignment === patient.id ? null : patient.id)}
                            className="inline-flex items-center px-3 py-1 border border-blue-300 text-xs font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100"
                          >
                            Assign Doctor
                          </button>
                          
                          {showDoctorAssignment === patient.id && (
                            <div className="absolute z-10 right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                              <div className="py-1">
                                <div className="px-3 py-2 text-xs text-gray-700 font-medium border-b">Select Doctor</div>
                                {mockDoctors.map(doctor => (
                                  <button
                                    key={doctor.id}
                                    onClick={() => handleAssignDoctor(patient.id, doctor.id)}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center justify-between"
                                  >
                                    <div>
                                      <div>{doctor.name}</div>
                                      <div className="text-xs text-gray-500">{doctor.specialty}</div>
                                    </div>
                                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                                      doctor.availability === 'Available' 
                                        ? 'bg-green-100 text-green-800' 
                                        : doctor.availability === 'Busy'
                                          ? 'bg-amber-100 text-amber-800'
                                          : 'bg-red-100 text-red-800'
                                    }`}>
                                      {doctor.availability}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {onUpdateStatus && (
                        <div className="relative inline-block">
                          <button
                            className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                          >
                            Status
                            <ChevronDown className="ml-1 h-3 w-3" />
                          </button>
                          
                          <div className="hidden absolute z-10 right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100">
                            <div className="py-1">
                              <button
                                onClick={() => handleUpdateStatus(patient.id, 'waiting')}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <Clock className="inline-block mr-2 h-4 w-4 text-blue-500" />
                                Waiting
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(patient.id, 'in-consultation')}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <Stethoscope className="inline-block mr-2 h-4 w-4 text-amber-500" />
                                In Consultation
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(patient.id, 'discharged')}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <Check className="inline-block mr-2 h-4 w-4 text-green-500" />
                                Discharged
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PatientQueuePanel; 