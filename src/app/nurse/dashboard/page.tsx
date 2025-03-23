'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, Calendar, FileText, Heart, Pill, MessageCircle, AlertCircle,
  Video, Plus, Search, Bell, User, Clock, Stethoscope, Settings,
  ClipboardPlus, Bot, Users, Clipboard, Check, Play, ArrowRight,
  PenTool, DollarSign, Database, BarChart, Phone, MoveRight,
  AlertTriangle, Shield, HelpCircle, Hourglass, Thermometer, Droplet,
  Smartphone, Volume2, X
} from 'lucide-react';

// Components
import NurseHeader from '@/components/nurse/NurseHeader';
import TabNavigation from '@/components/nurse/TabNavigation';
import QuickActionsPanel from '@/components/nurse/QuickActionsPanel';
import PatientTriageCard from '@/components/nurse/PatientTriageCard';
import TriageForm from '@/components/nurse/TriageForm';
import VitalSignsPanel from '@/components/nurse/VitalSignsPanel';
import ERStatusPanel from '@/components/nurse/ERStatusPanel';
import PatientQueuePanel from '@/components/nurse/PatientQueuePanel';
import AIAssistantPanel from '@/components/nurse/AIAssistantPanel';

// Define interfaces
interface Nurse {
  id: number;
  name: string;
  avatar: string;
  shift: 'Morning' | 'Afternoon' | 'Night';
  ward: string;
  role: string;
}

interface Patient {
  id: number;
  name: string;
  age: number;
  gender: string;
  profilePicture?: string;
  reason: string;
  waitTime: string;
  severity: 'high' | 'medium' | 'low';
  status: 'waiting' | 'in-consultation' | 'discharged';
  vitalSigns?: {
    bloodPressure: string;
    heartRate: number;
    oxygenSaturation: number;
    temperature: number;
    respiratoryRate: number;
  };
}

// Mock data
const mockNurse: Nurse = {
  id: 1,
  name: 'Sarah Johnson',
  avatar: '/avatars/nurse1.jpg',
  shift: 'Morning',
  ward: 'Emergency Department',
  role: 'Head Nurse'
};

const NurseDashboard: React.FC = () => {
  // States
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showTriageForm, setShowTriageForm] = useState<boolean>(false);
  const [showAIAssistant, setShowAIAssistant] = useState<boolean>(false);
  const [emergencyAlert, setEmergencyAlert] = useState<boolean>(false);
  
  // Tabs configuration
  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Activity className="h-5 w-5" /> },
    { id: 'triage', label: 'Triage', icon: <ClipboardPlus className="h-5 w-5" /> },
    { id: 'queue', label: 'Patient Queue', icon: <Users className="h-5 w-5" /> },
    { id: 'communication', label: 'Communication', icon: <MessageCircle className="h-5 w-5" /> },
    { id: 'lab', label: 'Lab Orders', icon: <FileText className="h-5 w-5" /> },
    { id: 'medication', label: 'Medication', icon: <Pill className="h-5 w-5" /> }
  ];
  
  // Emergency alert handler with text-to-speech
  const triggerEmergencyAlert = (patientName: string, condition: string) => {
    setEmergencyAlert(true);
    
    // Text-to-speech announcement for emergency cases
    if ('speechSynthesis' in window) {
      const announcement = new SpeechSynthesisUtterance(
        `Emergency Alert! Critical patient ${patientName} with ${condition} requires immediate attention!`
      );
      window.speechSynthesis.speak(announcement);
    }
    
    // Reset alert after 10 seconds
    setTimeout(() => setEmergencyAlert(false), 10000);
  };
  
  const handleNewPatientTriage = () => {
    setShowTriageForm(true);
  };
  
  const closeTriageForm = () => {
    setShowTriageForm(false);
  };
  
  const handleOpenAIAssistant = () => {
    setShowAIAssistant(true);
  };
  
  const closeAIAssistant = () => {
    setShowAIAssistant(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NurseHeader nurse={mockNurse} onOpenAI={handleOpenAIAssistant} />
      
      {/* Emergency Alert Banner with voice announcement */}
      <AnimatePresence>
        {emergencyAlert && (
          <motion.div 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="bg-red-600 text-white p-3 flex items-center justify-between"
          >
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              <span className="font-semibold">EMERGENCY ALERT: Critical patient requires immediate attention!</span>
            </div>
            <div className="flex items-center">
              <Volume2 className="h-5 w-5 mr-2" />
              <button 
                onClick={() => setEmergencyAlert(false)}
                className="bg-white/20 hover:bg-white/30 rounded-full p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="container mx-auto py-6 px-4">
        <TabNavigation tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <div className="mt-8">
          {activeTab === 'overview' && (
            <div>
              <h1 className="text-xl font-bold text-gray-800 mb-6">Overview & Quick Actions</h1>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Welcome panel */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Welcome, {mockNurse.name}</h2>
                  <div className="flex items-center mb-4">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                      {mockNurse.avatar ? (
                        <img src={mockNurse.avatar} alt={mockNurse.name} className="h-12 w-12 rounded-full object-cover" />
                      ) : (
                        <User className="h-6 w-6 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-gray-600">{mockNurse.role}</p>
                      <p className="text-gray-500 text-sm">
                        <span className="inline-flex items-center text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-0.5 mr-2">
                          <Clock className="h-3 w-3 mr-1" /> {mockNurse.shift} Shift
                        </span>
                        <span className="inline-flex items-center text-xs bg-purple-100 text-purple-800 rounded-full px-2 py-0.5">
                          <Stethoscope className="h-3 w-3 mr-1" /> {mockNurse.ward}
                        </span>
                      </p>
                    </div>
                  </div>
                  
                  <QuickActionsPanel onEmergencyAlert={() => triggerEmergencyAlert('John Doe', 'Cardiac Arrest')} />
                </div>
                
                {/* ER Status Panel */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <ERStatusPanel onFastTrack={(patientId) => console.log('Fast-tracking patient', patientId)} />
                </div>
                
                {/* AI Triage Assistant */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <AIAssistantPanel miniVersion={true} />
                </div>
              </div>
              
              {/* Critical Patients */}
              <div className="mt-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Critical Patients</h2>
                  <PatientQueuePanel filterBySeverity="high" compact={true} />
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'triage' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-xl font-bold text-gray-800">Patient Triage & Vital Signs</h1>
                <button 
                  onClick={handleNewPatientTriage}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center"
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  New Patient
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-800">Recent Triage Cases</h2>
                    <div className="flex space-x-2 items-center">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search patients..."
                          className="pl-8 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                      </div>
                      <select className="border border-gray-200 rounded-lg text-sm p-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="all">All Patients</option>
                        <option value="high">High Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="low">Low Priority</option>
                      </select>
                    </div>
                  </div>
                  {/* List of patients who need triage */}
                  <div className="p-6">
                    <PatientTriageCard 
                      patient={{
                        id: 1,
                        name: "Michael Brown",
                        age: 45,
                        gender: "Male",
                        reason: "Severe chest pain, shortness of breath",
                        waitTime: "Just now",
                        severity: "high",
                        status: "waiting"
                      }}
                      onSelectPatient={(patient) => setSelectedPatient(patient)}
                    />
                    {/* More patient cards would be here */}
                    <PatientTriageCard 
                      patient={{
                        id: 2,
                        name: "Emma Wilson",
                        age: 32,
                        gender: "Female",
                        reason: "Severe headache, dizziness, blurred vision",
                        waitTime: "5 min ago",
                        severity: "medium",
                        status: "waiting"
                      }}
                      onSelectPatient={(patient) => setSelectedPatient(patient)}
                    />
                    <PatientTriageCard 
                      patient={{
                        id: 3,
                        name: "Juan Martinez",
                        age: 58,
                        gender: "Male",
                        reason: "Fall injury, possible fracture",
                        waitTime: "12 min ago",
                        severity: "medium",
                        status: "waiting"
                      }}
                      onSelectPatient={(patient) => setSelectedPatient(patient)}
                    />
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                  <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800">Emergency Statistics</h2>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                        <p className="text-sm text-red-700 font-medium">Critical</p>
                        <p className="text-2xl font-bold text-red-700">3</p>
                      </div>
                      <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                        <p className="text-sm text-orange-700 font-medium">Urgent</p>
                        <p className="text-2xl font-bold text-orange-700">7</p>
                      </div>
                      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                        <p className="text-sm text-yellow-700 font-medium">Standard</p>
                        <p className="text-2xl font-bold text-yellow-700">12</p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                        <p className="text-sm text-green-700 font-medium">Non-urgent</p>
                        <p className="text-2xl font-bold text-green-700">5</p>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Current Wait Times</h3>
                      <div className="space-y-2">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-red-600 font-medium">Critical</span>
                            <span className="text-gray-700">Immediate</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-red-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-orange-600 font-medium">Urgent</span>
                            <span className="text-gray-700">~15 min</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-orange-600 h-2 rounded-full" style={{ width: '80%' }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-yellow-600 font-medium">Standard</span>
                            <span className="text-gray-700">~45 min</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '50%' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Emergency Actions</h3>
                      <button className="bg-red-100 hover:bg-red-200 w-full p-3 rounded-lg text-red-800 font-medium flex items-center justify-center mb-2">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Declare Mass Casualty Event
                      </button>
                      <button className="bg-blue-100 hover:bg-blue-200 w-full p-3 rounded-lg text-blue-800 font-medium flex items-center justify-center">
                        <Phone className="h-4 w-4 mr-2" />
                        Notify Emergency Response Team
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {selectedPatient && (
                <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-800">Vital Signs Collection: {selectedPatient.name}</h2>
                    <div className="flex space-x-2">
                      <button className="text-gray-500 hover:text-gray-700">
                        <X className="h-5 w-5" onClick={() => setSelectedPatient(null)} />
                      </button>
                    </div>
                  </div>
                  <div className="p-6">
                    <VitalSignsPanel 
                      patient={selectedPatient}
                      onSave={(patientId, vitalSigns) => console.log('Saving vital signs for patient', patientId, vitalSigns)}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'queue' && (
            <div>
              <h1 className="text-xl font-bold text-gray-800 mb-6">Patient Queue Management</h1>
              <PatientQueuePanel 
                onFastTrack={(patientId) => console.log('Fast-tracking patient', patientId)}
                onAssignDoctor={(patientId, doctorId) => console.log('Assigning patient', patientId, 'to doctor', doctorId)}
                onUpdateStatus={(patientId, status) => console.log('Updating status for patient', patientId, 'to', status)}
              />
            </div>
          )}
          
          {activeTab === 'communication' && (
            <div>
              <h1 className="text-xl font-bold text-gray-800 mb-6">Communication & Collaboration</h1>
              <p className="text-gray-600">Communication panel would be implemented here</p>
            </div>
          )}
          
          {activeTab === 'lab' && (
            <div>
              <h1 className="text-xl font-bold text-gray-800 mb-6">Lab & Test Orders</h1>
              <p className="text-gray-600">Lab orders panel would be implemented here</p>
            </div>
          )}
          
          {activeTab === 'medication' && (
            <div>
              <h1 className="text-xl font-bold text-gray-800 mb-6">Medication & Treatment Support</h1>
              <p className="text-gray-600">Medication panel would be implemented here</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Triage Form Modal */}
      <AnimatePresence>
        {showTriageForm && (
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
              <TriageForm 
                onClose={closeTriageForm}
                onSubmit={(patientData: any) => {
                  console.log('New triage data:', patientData);
                  closeTriageForm();
                  // Logic to handle the new patient
                }}
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
              className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <AIAssistantPanel 
                miniVersion={false}
                onClose={closeAIAssistant}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NurseDashboard;
