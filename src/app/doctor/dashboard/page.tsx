'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Calendar,
  FileText,
  Heart,
  Pill,
  MessageCircle,
  AlertCircle,
  Video,
  Download,
  Upload,
  Share2,
  Plus,
  Search,
  Bell,
  User,
  Clock,
  FileSpreadsheet,
  Stethoscope,
  Settings,
  ClipboardPlus,
  X,
  Bot,
  Users,
  Clipboard,
  Check,
  Play,
  ArrowRight,
  PenTool,
  DollarSign,
  Database,
  BarChart,
  Phone,
  MoveRight,
  AlertTriangle,
  Shield,
  HelpCircle,
  Hourglass
} from 'lucide-react';

// Components
import DoctorHeader from '@/components/doctor/DoctorHeader';
import PatientQueueCard from '@/components/doctor/PatientQueueCard';
import AppointmentListItem from '@/components/doctor/AppointmentListItem';
import PatientRecordView from '@/components/doctor/PatientRecordView';
import ConsultationPanel from '@/components/doctor/ConsultationPanel';
import TabNavigation from '@/components/doctor/TabNavigation';
import AIAssistantPanel from '@/components/doctor/AIAssistantPanel';
import EmergencyPanel from '@/components/doctor/EmergencyPanel';
import BillingPanel from '@/components/doctor/BillingPanel';

// Import shared types
import { Patient as PatientType } from '@/types/patient';

// Mock data (would be fetched from API in real implementation)
import { mockDoctor } from '@/data/doctorData';

// Define interfaces
interface Appointment {
  id: number;
  patientName: string;
  patientAge: number;
  time: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'no-show' | 'cancelled';
  reason: string;
  isVideo: boolean;
  department?: string;
  severity?: 'low' | 'medium' | 'high' | 'emergency';
}

export default function DoctorDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPatient, setSelectedPatient] = useState<PatientType | null>(null);
  const [showConsultation, setShowConsultation] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Mock queue data
  const [patientQueue, setPatientQueue] = useState<PatientType[]>([
    {
      id: 1,
      name: "Soorya Roberts",
      age: 32,
      gender: "Male",
      reason: "Hypertension Follow-up",
      waitTime: "10 mins",
      severity: "medium",
      profilePicture: "/avatar.png",
      dob: "1992-05-15",
      phone: "(555) 123-4567",
      email: "soorya.roberts@example.com",
      address: "123 Main St, Cityville, ST 12345",
      insurance: "Blue Cross Blue Shield",
      allergies: ["Penicillin"],
      chronicConditions: ["Hypertension"],
      medications: [
        {
          name: "Lisinopril",
          dosage: "10mg",
          frequency: "Once daily"
        }
      ],
      records: []
    },
    {
      id: 2,
      name: "Meera Patel",
      age: 45,
      gender: "Female",
      reason: "Diabetes Review",
      waitTime: "25 mins",
      severity: "medium",
      dob: "1979-10-20",
      phone: "(555) 987-6543",
      email: "meera.patel@example.com",
      address: "456 Oak St, Townsville, ST 54321",
      insurance: "Aetna",
      allergies: ["Sulfa drugs"],
      chronicConditions: ["Diabetes Type 2"],
      medications: [
        {
          name: "Metformin",
          dosage: "500mg",
          frequency: "Twice daily"
        }
      ],
      records: []
    },
    {
      id: 3,
      name: "Raj Kumar",
      age: 65,
      gender: "Male",
      reason: "Chest Pain",
      waitTime: "5 mins",
      severity: "high",
      dob: "1959-03-12",
      phone: "(555) 234-5678",
      email: "raj.kumar@example.com",
      address: "789 Pine St, Villagetown, ST 67890",
      insurance: "Medicare",
      allergies: [],
      chronicConditions: ["Coronary Artery Disease", "Hypertension"],
      medications: [
        {
          name: "Aspirin",
          dosage: "81mg",
          frequency: "Once daily"
        },
        {
          name: "Atorvastatin",
          dosage: "40mg",
          frequency: "Once daily"
        }
      ],
      records: []
    },
    {
      id: 4,
      name: "David Wilson",
      age: 28,
      gender: "Male",
      reason: "Sprained Ankle",
      waitTime: "45 mins",
      severity: "low",
      isWalkIn: true,
      dob: "1996-08-25",
      phone: "(555) 876-5432",
      email: "david.wilson@example.com",
      address: "321 Elm St, Hamletville, ST 13579",
      insurance: "United Healthcare",
      allergies: ["Latex"],
      chronicConditions: [],
      medications: [],
      records: []
    },
  ]);
  
  // Mock appointments data
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: 1,
      patientName: "Soorya Roberts",
      patientAge: 32,
      time: "9:30 AM",
      status: "scheduled",
      reason: "Hypertension Follow-up",
      isVideo: false,
      department: "Cardiology",
      severity: "medium"
    },
    {
      id: 2,
      patientName: "Meera Patel",
      patientAge: 45,
      time: "10:15 AM",
      status: "scheduled",
      reason: "Diabetes Review",
      isVideo: true,
      department: "Endocrinology",
      severity: "medium"
    },
    {
      id: 3,
      patientName: "Raj Kumar",
      patientAge: 65,
      time: "11:00 AM",
      status: "scheduled",
      reason: "Chest Pain",
      isVideo: false,
      department: "Cardiology",
      severity: "high"
    },
    {
      id: 4,
      patientName: "David Wilson",
      patientAge: 28,
      time: "12:30 PM",
      status: "scheduled",
      reason: "Sprained Ankle",
      isVideo: false,
      department: "Orthopedics",
      severity: "low"
    },
    {
      id: 5,
      patientName: "Priya Singh",
      patientAge: 39,
      time: "2:00 PM",
      status: "scheduled",
      reason: "Annual Checkup",
      isVideo: false,
      department: "General Medicine",
      severity: "low"
    },
  ]);
  
  // Stats for overview
  const stats = {
    totalAppointments: appointments.length,
    completedAppointments: appointments.filter(a => a.status === 'completed').length,
    pendingAppointments: appointments.filter(a => a.status === 'scheduled').length,
    queueLength: patientQueue.length,
    averageWaitTime: "22 mins",
    emergencyCases: patientQueue.filter(p => p.severity === 'high' || p.severity === 'emergency').length
  };
  
  // Start consultation with a patient
  const startConsultation = (patient: PatientType) => {
    setSelectedPatient(patient);
    setShowConsultation(true);
  };
  
  // Close consultation panel
  const closeConsultation = () => {
    setShowConsultation(false);
  };
  
  // Toggle AI assistant panel
  const toggleAIAssistant = () => {
    setShowAIAssistant(!showAIAssistant);
  };
  
  // Mark appointment status (completed, no-show, etc.)
  const updateAppointmentStatus = (id: number, status: Appointment['status']) => {
    setAppointments(appointments.map(appointment => 
      appointment.id === id ? {...appointment, status} : appointment
    ));
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <DoctorHeader doctor={mockDoctor} />
      
      <div className="container mx-auto px-4 py-6">
        <TabNavigation 
          tabs={[
            { id: 'overview', label: 'Overview', icon: <Activity /> },
            { id: 'queue', label: 'Patient Queue', icon: <Users /> },
            { id: 'appointments', label: 'Appointments', icon: <Calendar /> },
            { id: 'records', label: 'Medical Records', icon: <FileText /> },
            { id: 'billing', label: 'Billing', icon: <DollarSign /> },
            { id: 'emergency', label: 'Emergency', icon: <AlertCircle /> }
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
        
        <div className="mt-6">
          {/* Overview & Quick Actions */}
          {activeTab === 'overview' && (
            <div>
              {/* Welcome & Profile Section */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
                <h1 className="text-2xl font-bold text-gray-800">
                  Good Morning, Dr. {mockDoctor.name}
                </h1>
                <p className="text-gray-600">
                  {mockDoctor.specialty} | {mockDoctor.hospital}
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-blue-600 text-sm font-medium">Today's Appointments</p>
                        <h3 className="text-2xl font-bold text-blue-800 mt-1">{stats.totalAppointments}</h3>
                      </div>
                      <div className="bg-blue-500 p-2 rounded-lg text-white">
                        <Calendar className="h-5 w-5" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-green-600 text-sm font-medium">Completed</p>
                        <h3 className="text-2xl font-bold text-green-800 mt-1">{stats.completedAppointments}</h3>
                      </div>
                      <div className="bg-green-500 p-2 rounded-lg text-white">
                        <Check className="h-5 w-5" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-amber-600 text-sm font-medium">Pending</p>
                        <h3 className="text-2xl font-bold text-amber-800 mt-1">{stats.pendingAppointments}</h3>
                      </div>
                      <div className="bg-amber-500 p-2 rounded-lg text-white">
                        <Hourglass className="h-5 w-5" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-red-600 text-sm font-medium">Emergency Cases</p>
                        <h3 className="text-2xl font-bold text-red-800 mt-1">{stats.emergencyCases}</h3>
                      </div>
                      <div className="bg-red-500 p-2 rounded-lg text-white">
                        <AlertTriangle className="h-5 w-5" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Next Patient and Queue Status */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-1 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-800">Next Patient</h2>
                    <div className="text-sm text-white bg-blue-500 px-2 py-1 rounded">
                      Ready
                    </div>
                  </div>
                  
                  {patientQueue.length > 0 && (
                    <div className="border rounded-lg p-4 bg-blue-50 border-blue-100">
                      <div className="flex items-center">
                        <div className="h-12 w-12 rounded-full bg-blue-200 flex items-center justify-center mr-3">
                          {patientQueue[0].profilePicture ? (
                            <img 
                              src={patientQueue[0].profilePicture} 
                              alt={patientQueue[0].name} 
                              className="h-12 w-12 rounded-full object-cover"
                            />
                          ) : (
                            <User className="h-6 w-6 text-blue-700" />
                          )}
                        </div>
                        
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {patientQueue[0].name} <span className="text-gray-500 text-sm font-normal">
                              ({patientQueue[0].age}, {patientQueue[0].gender})
                            </span>
                          </h3>
                          <p className="text-sm text-gray-600">{patientQueue[0].reason}</p>
                          
                          <div className="mt-1 flex items-center text-sm">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              patientQueue[0].severity === 'high' ? 'bg-red-100 text-red-800 border border-red-200' :
                              patientQueue[0].severity === 'medium' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                              'bg-green-100 text-green-800 border border-green-200'
                            }`}>
                              {patientQueue[0].severity === 'high' ? 'High Priority' :
                               patientQueue[0].severity === 'medium' ? 'Medium Priority' :
                               'Low Priority'}
                            </span>
                            
                            {patientQueue[0].isWalkIn && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                                Walk-in
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => startConsultation(patientQueue[0])}
                        className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium flex items-center justify-center"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Start Consultation
                      </button>
                    </div>
                  )}
                  
                  {patientQueue.length === 0 && (
                    <div className="text-center py-6 text-gray-500">
                      No patients in queue
                    </div>
                  )}
                </div>
                
                <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Queue Status</h2>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Current Queue Length</p>
                      <p className="text-2xl font-bold text-blue-700">{stats.queueLength} patients</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Average Wait Time</p>
                      <p className="text-2xl font-bold text-amber-600">{stats.averageWaitTime}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Next Available Slot</p>
                      <p className="text-xl font-bold text-green-600">2:30 PM</p>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg overflow-hidden">
                    <div className="grid grid-cols-3 bg-gray-50 p-3 border-b text-sm font-medium text-gray-600">
                      <div>Patient</div>
                      <div>Reason</div>
                      <div>Wait Time</div>
                    </div>
                    
                    {patientQueue.slice(0, 3).map((patient, index) => (
                      <div key={patient.id} className="grid grid-cols-3 p-3 border-b text-sm items-center">
                        <div className="flex items-center">
                          <div className={`h-2 w-2 rounded-full mr-2 ${
                            patient.severity === 'high' ? 'bg-red-500' :
                            patient.severity === 'medium' ? 'bg-amber-500' :
                            'bg-green-500'
                          }`}></div>
                          {patient.name}
                        </div>
                        <div>{patient.reason}</div>
                        <div>{patient.waitTime}</div>
                      </div>
                    ))}
                  </div>
                  
                  <button 
                    onClick={() => setActiveTab('queue')}
                    className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                  >
                    View full queue <MoveRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
              </div>
              
              {/* Today's Appointments Preview */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">Today's Appointments</h2>
                  <button 
                    onClick={() => setActiveTab('appointments')}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                  >
                    View all <MoveRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
                
                <div className="border rounded-lg overflow-hidden">
                  <div className="grid grid-cols-4 bg-gray-50 p-3 border-b text-sm font-medium text-gray-600">
                    <div>Patient</div>
                    <div>Time</div>
                    <div>Reason</div>
                    <div>Actions</div>
                  </div>
                  
                  {appointments.slice(0, 3).map((appointment) => (
                    <div key={appointment.id} className="grid grid-cols-4 p-3 border-b text-sm items-center">
                      <div>
                        {appointment.patientName} ({appointment.patientAge})
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 text-gray-400 mr-1" />
                        {appointment.time}
                      </div>
                      <div>{appointment.reason}</div>
                      <div>
                        <button 
                          onClick={() => {
                            const patient = patientQueue.find(p => p.name === appointment.patientName);
                            if (patient) startConsultation(patient);
                          }}
                          className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded text-xs font-medium"
                        >
                          Start
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Quick Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <button 
                  onClick={toggleAIAssistant}
                  className="bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 rounded-lg p-4 flex flex-col items-center transition-colors"
                >
                  <div className="bg-indigo-100 text-indigo-700 p-3 rounded-lg mb-2">
                    <Bot className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium text-indigo-800">Ask AI Assistant</span>
                </button>
                
                <button className="bg-green-50 hover:bg-green-100 border border-green-100 rounded-lg p-4 flex flex-col items-center transition-colors">
                  <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-2">
                    <Clipboard className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium text-green-800">Create New Note</span>
                </button>
                
                <button className="bg-amber-50 hover:bg-amber-100 border border-amber-100 rounded-lg p-4 flex flex-col items-center transition-colors">
                  <div className="bg-amber-100 text-amber-700 p-3 rounded-lg mb-2">
                    <Phone className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium text-amber-800">Call Nurse Station</span>
                </button>
                
                <button className="bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-lg p-4 flex flex-col items-center transition-colors">
                  <div className="bg-blue-100 text-blue-700 p-3 rounded-lg mb-2">
                    <Database className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium text-blue-800">Lab Test Orders</span>
                </button>
              </div>
            </div>
          )}
          
          {/* Patient Queue & Appointments */}
          {activeTab === 'queue' && (
            <div>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-5">
                <h1 className="text-xl font-bold text-gray-800 mb-3 md:mb-0">Patient Queue</h1>
                <div className="flex flex-col sm:flex-row w-full md:w-auto items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                  <div className="relative w-full sm:w-auto">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search patients..."
                      className="pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <select className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto">
                    <option>All Patients</option>
                    <option>High Priority</option>
                    <option>Walk-ins</option>
                    <option>Scheduled</option>
                  </select>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <div className="min-w-full">
                <div className="grid grid-cols-6 bg-gray-50 p-4 border-b text-sm font-medium text-gray-600">
                  <div className="col-span-2">Patient</div>
                  <div>Reason</div>
                  <div>Wait Time</div>
                  <div>Status</div>
                  <div>Action</div>
                </div>
                
                {patientQueue.map((patient) => (
                  <PatientQueueCard 
                    key={patient.id}
                    patient={patient}
                    onStartConsultation={() => startConsultation(patient)}
                  />
                ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Today's Appointments</h2>
                
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="grid grid-cols-7 bg-gray-50 p-4 border-b text-sm font-medium text-gray-600">
                    <div className="col-span-2">Patient</div>
                    <div>Time</div>
                    <div>Reason</div>
                    <div>Type</div>
                    <div>Status</div>
                    <div>Actions</div>
                  </div>
                  
                  {appointments.map((appointment) => (
                    <AppointmentListItem 
                      key={appointment.id}
                      appointment={appointment}
                      onUpdateStatus={(status: Appointment['status']) => updateAppointmentStatus(appointment.id, status)}
                      onStartConsultation={() => {
                        const patient = patientQueue.find(p => p.name === appointment.patientName);
                        if (patient) startConsultation(patient);
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Other tabs would be implemented similarly */}
          {activeTab === 'appointments' && (
            <div>
              <h1 className="text-xl font-bold text-gray-800 mb-6">Appointments Schedule</h1>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-5">
                  <div className="mb-4 md:mb-0">
                    <h2 className="text-lg font-semibold text-gray-800">Today's Appointments</h2>
                    <p className="text-gray-500 text-sm">
                      {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                      <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search appointments..."
                        className="pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <select className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option>All Appointments</option>
                      <option>Scheduled</option>
                      <option>Completed</option>
                      <option>Cancelled</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <div className="min-w-full rounded-lg overflow-hidden border">
                    <div className="grid grid-cols-7 bg-gray-50 p-4 border-b text-sm font-medium text-gray-600">
                      <div className="col-span-2">Patient</div>
                      <div>Time</div>
                      <div>Reason</div>
                      <div>Type</div>
                      <div>Status</div>
                      <div>Actions</div>
                    </div>
                    
                    {appointments.map((appointment) => (
                      <AppointmentListItem 
                        key={appointment.id}
                        appointment={appointment}
                        onUpdateStatus={(status: Appointment['status']) => updateAppointmentStatus(appointment.id, status)}
                        onStartConsultation={() => {
                          const patient = patientQueue.find(p => p.name === appointment.patientName);
                          if (patient) startConsultation(patient);
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <h3 className="font-medium text-blue-800 mb-2 flex items-center">
                      <Calendar className="h-4 w-4 mr-2" /> Upcoming Week
                    </h3>
                    <p className="text-blue-700 text-2xl font-bold">24</p>
                    <p className="text-blue-600 text-sm">scheduled appointments</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                    <h3 className="font-medium text-green-800 mb-2 flex items-center">
                      <Video className="h-4 w-4 mr-2" /> Telemedicine
                    </h3>
                    <p className="text-green-700 text-2xl font-bold">8</p>
                    <p className="text-green-600 text-sm">virtual appointments</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                    <h3 className="font-medium text-purple-800 mb-2 flex items-center">
                      <Users className="h-4 w-4 mr-2" /> New Patients
                    </h3>
                    <p className="text-purple-700 text-2xl font-bold">5</p>
                    <p className="text-purple-600 text-sm">first-time visits</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'records' && (
            <div>
              <h1 className="text-xl font-bold text-gray-800 mb-6">Patient Medical Records</h1>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-5">
                  <div className="mb-4 md:mb-0">
                    <h2 className="text-lg font-semibold text-gray-800">Search Patient Records</h2>
                    <p className="text-gray-500 text-sm">Find and view complete medical histories</p>
                  </div>
                  <div className="w-full md:w-1/2 lg:w-1/3">
                    <div className="relative">
                      <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search by patient name or ID..."
                        className="pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {selectedPatient ? (
                  <PatientRecordView 
                    patient={selectedPatient} 
                    onClose={() => setSelectedPatient(null)} 
                  />
                ) : (
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                      {patientQueue.map(patient => (
                        <div 
                          key={patient.id}
                          className="border rounded-lg p-4 hover:bg-blue-50 cursor-pointer transition-colors"
                          onClick={() => setSelectedPatient(patient)}
                        >
                          <div className="flex items-center">
                            <div className="h-12 w-12 rounded-full bg-blue-200 flex items-center justify-center mr-3">
                              {patient.profilePicture ? (
                                <img 
                                  src={patient.profilePicture} 
                                  alt={patient.name} 
                                  className="h-12 w-12 rounded-full object-cover"
                                />
                              ) : (
                                <User className="h-6 w-6 text-blue-700" />
                              )}
                            </div>
                            
                            <div>
                              <h3 className="font-medium text-gray-900">
                                {patient.name} <span className="text-gray-500 text-sm font-normal">
                                  ({patient.age}, {patient.gender})
                                </span>
                              </h3>
                              <p className="text-sm text-gray-600">{patient.reason}</p>
                              
                              <div className="mt-1 flex items-center text-sm">
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
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="text-center py-4 text-gray-500 border-t">
                      <p>Select a patient to view their complete medical record</p>
                      <p className="text-sm mt-1">Or use the search box to find other patients</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {activeTab === 'billing' && (
            <div>
              <h1 className="text-xl font-bold text-gray-800 mb-6">Billing & Insurance</h1>
              <BillingPanel />
            </div>
          )}
          
          {activeTab === 'emergency' && (
            <div>
              <h1 className="text-xl font-bold text-gray-800 mb-6">Emergency Cases</h1>
              <EmergencyPanel />
            </div>
          )}
        </div>
      </div>
      
      {/* Consultation Panel Modal */}
      <AnimatePresence>
        {showConsultation && selectedPatient && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4"
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto"
            >
              <ConsultationPanel 
                patient={selectedPatient} 
                onClose={closeConsultation}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* AI Assistant Modal */}
      <AnimatePresence>
        {showAIAssistant && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4"
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            >
              <AIAssistantPanel onClose={toggleAIAssistant} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
