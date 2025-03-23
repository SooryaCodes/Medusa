import React, { useState } from 'react';
import { User, FileText, Heart, Activity, Pill, AlertCircle, Download, Calendar, ChevronDown, ChevronUp, Search, Stethoscope, FileSpreadsheet } from 'lucide-react';
import { Patient, MedicalRecord } from '@/types/patient';

interface PatientRecordViewProps {
  patient?: Patient;
  onClose?: () => void;
}

const PatientRecordView: React.FC<PatientRecordViewProps> = ({ patient, onClose }) => {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(patient || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRecords, setExpandedRecords] = useState<number[]>([]);
  
  // Mock patients data
  const patients: Patient[] = [
    {
      id: 1,
      name: "Soorya Roberts",
      age: 32,
      gender: "Male",
      dob: "1992-05-15",
      profilePicture: "/avatar.png",
      phone: "(555) 123-4567",
      email: "soorya.roberts@example.com",
      address: "123 Main St, Cityville, ST 12345",
      insurance: "Blue Cross Blue Shield",
      allergies: ["Penicillin", "Shellfish"],
      chronicConditions: ["Hypertension", "Hyperlipidemia"],
      medications: [
        {
          name: "Lisinopril",
          dosage: "10mg",
          frequency: "Once daily"
        },
        {
          name: "Atorvastatin",
          dosage: "20mg",
          frequency: "Once daily"
        }
      ],
      records: [
        {
          id: 1,
          date: "2024-03-15",
          title: "Annual Physical Examination",
          doctor: "Dr. Sarah Wilson",
          type: "visit",
          details: "Patient reports feeling well overall. BP slightly elevated at 135/85. Discussed lifestyle modifications."
        },
        {
          id: 2,
          date: "2024-03-15",
          title: "Lipid Panel",
          doctor: "Dr. Sarah Wilson",
          type: "lab",
          details: "Total Cholesterol: 210 mg/dL (High)\nHDL: 45 mg/dL (Normal)\nLDL: 145 mg/dL (High)\nTriglycerides: 150 mg/dL (Normal)"
        },
        {
          id: 3,
          date: "2024-02-10",
          title: "Follow-up Visit",
          doctor: "Dr. James Chen",
          type: "visit",
          details: "Patient reports occasional headaches. BP reading: 138/88. Advised to monitor BP at home."
        }
      ]
    }
  ];
  
  const toggleRecordExpansion = (recordId: number) => {
    setExpandedRecords(prev => 
      prev.includes(recordId) 
        ? prev.filter(id => id !== recordId) 
        : [...prev, recordId]
    );
  };
  
  const handlePatientSelect = (patientId: number) => {
    const patient = patients.find(p => p.id === patientId);
    if (patient) {
      setSelectedPatient(patient);
    }
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {!patient && (
        <div className="md:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search patients..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div className="max-h-[600px] overflow-y-auto">
              {patients.map(patient => (
                <div 
                  key={patient.id} 
                  className={`p-4 border-b hover:bg-blue-50 cursor-pointer ${
                    selectedPatient?.id === patient.id ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => handlePatientSelect(patient.id)}
                >
                  <div className="flex items-center">
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
                      <p className="text-gray-500 text-xs">
                        {patient.age} years, {patient.gender} • {patient.dob}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      <div className={patient ? "md:col-span-3" : "md:col-span-2"}>
        {selectedPatient ? (
          <div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
              <div className="p-6 border-b flex justify-between items-start">
                <div className="flex items-start">
                  <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                    {selectedPatient.profilePicture ? (
                      <img 
                        src={selectedPatient.profilePicture} 
                        alt={selectedPatient.name} 
                        className="h-16 w-16 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-8 w-8 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{selectedPatient.name}</h2>
                    <p className="text-gray-600 text-sm">
                      {selectedPatient.age} years, {selectedPatient.gender} 
                      {selectedPatient.dob && <> • DOB: {selectedPatient.dob}</>}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedPatient.insurance && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                          {selectedPatient.insurance}
                        </span>
                      )}
                      
                      {selectedPatient.allergies && selectedPatient.allergies.length > 0 && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Allergies: {selectedPatient.allergies.length}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {onClose && (
                  <button 
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </div>
              
              {/* Phone/Email/Address info - Only render if available */}
              {(selectedPatient.phone || selectedPatient.email || selectedPatient.address) && (
                <div className="grid grid-cols-2 p-4 gap-4 border-b">
                  {selectedPatient.phone && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Phone</p>
                      <p className="text-sm font-medium">{selectedPatient.phone}</p>
                    </div>
                  )}
                  {selectedPatient.email && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Email</p>
                      <p className="text-sm font-medium">{selectedPatient.email}</p>
                    </div>
                  )}
                  {selectedPatient.address && (
                    <div className="col-span-2">
                      <p className="text-xs text-gray-500 mb-1">Address</p>
                      <p className="text-sm font-medium">{selectedPatient.address}</p>
                    </div>
                  )}
                </div>
              )}
              
              <div className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Chronic Conditions</h3>
                    <div className="space-y-1">
                      {selectedPatient.chronicConditions && selectedPatient.chronicConditions.length > 0 ? (
                        selectedPatient.chronicConditions.map((condition, index) => (
                          <div key={index} className="flex items-center bg-gray-50 py-1.5 px-3 rounded-md">
                            <Activity className="h-3.5 w-3.5 text-blue-500 mr-2" />
                            <span className="text-sm">{condition}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 italic">No chronic conditions</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Allergies</h3>
                    <div className="space-y-1">
                      {selectedPatient.allergies && selectedPatient.allergies.length > 0 ? (
                        selectedPatient.allergies.map((allergy, index) => (
                          <div key={index} className="flex items-center bg-red-50 py-1.5 px-3 rounded-md">
                            <AlertCircle className="h-3.5 w-3.5 text-red-500 mr-2" />
                            <span className="text-sm">{allergy}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 italic">No known allergies</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <h3 className="text-sm font-medium text-gray-700 mt-4 mb-2">Current Medications</h3>
                <div className="bg-gray-50 rounded-lg overflow-hidden">
                  {selectedPatient.medications && selectedPatient.medications.length > 0 ? (
                    <>
                      <div className="grid grid-cols-3 bg-gray-100 p-2 text-xs font-medium text-gray-600">
                        <div>Medication</div>
                        <div>Dosage</div>
                        <div>Frequency</div>
                      </div>
                      
                      {selectedPatient.medications.map((medication, index) => (
                        <div key={index} className="grid grid-cols-3 p-2 text-sm border-b border-gray-100">
                          <div>{medication.name}</div>
                          <div>{medication.dosage}</div>
                          <div>{medication.frequency}</div>
                        </div>
                      ))}
                    </>
                  ) : (
                    <p className="text-sm text-gray-500 italic p-3">No current medications</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Medical Records */}
            <div className="p-4 border-t">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Medical Records</h3>
              
              {selectedPatient.records && selectedPatient.records.length > 0 ? (
                <div className="space-y-3">
                  {selectedPatient.records.map((record) => (
                    <div key={record.id} className="border rounded-lg overflow-hidden">
                      <div 
                        className={`p-3 flex justify-between items-center cursor-pointer ${
                          expandedRecords.includes(record.id) ? 'bg-blue-50' : 'bg-gray-50'
                        }`}
                        onClick={() => toggleRecordExpansion(record.id)}
                      >
                        <div className="flex items-center">
                          <div className={`p-1.5 rounded-md mr-3 ${
                            record.type === 'visit' ? 'bg-blue-100 text-blue-700' :
                            record.type === 'lab' ? 'bg-green-100 text-green-700' :
                            record.type === 'procedure' ? 'bg-amber-100 text-amber-700' :
                            'bg-purple-100 text-purple-700'
                          }`}>
                            {record.type === 'visit' ? <Stethoscope className="h-4 w-4" /> :
                             record.type === 'lab' ? <FileText className="h-4 w-4" /> :
                             record.type === 'procedure' ? <Activity className="h-4 w-4" /> :
                             <FileSpreadsheet className="h-4 w-4" />}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{record.title}</p>
                            <p className="text-xs text-gray-500">
                              {record.date} • {record.doctor}
                            </p>
                          </div>
                        </div>
                        <div>
                          {expandedRecords.includes(record.id) ? 
                            <ChevronUp className="h-4 w-4 text-gray-500" /> : 
                            <ChevronDown className="h-4 w-4 text-gray-500" />
                          }
                        </div>
                      </div>
                      
                      {expandedRecords.includes(record.id) && (
                        <div className="p-3 border-t bg-white">
                          <p className="text-sm whitespace-pre-line">{record.details}</p>
                          
                          <div className="mt-3 flex justify-end">
                            <button className="text-blue-600 hover:text-blue-800 text-xs font-medium flex items-center">
                              <Download className="h-3 w-3 mr-1" />
                              Download
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">No medical records available</p>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-gray-500 font-medium">Select a patient to view records</h3>
            <p className="text-gray-400 text-sm mt-2">
              Patient medical records and history will appear here
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientRecordView; 