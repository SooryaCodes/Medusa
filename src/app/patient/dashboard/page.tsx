'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Calendar,
  FileText,
  Heart,
  Pill,
  CreditCard,
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
  X
} from 'lucide-react';

// Components
import PatientHeader from '@/components/patient/PatientHeader';
import HealthStatusCard from '@/components/patient/HealthStatusCard';
import AppointmentCard from '@/components/patient/AppointmentCard';
import MedicationItem from '@/components/patient/MedicationItem';
import VitalsDisplay from '@/components/patient/VitalsDisplay';
import ChatInterface from '@/components/patient/ChatInterface';
import DocumentUploader from '@/components/patient/DocumentUploader';
import TabNavigation from '@/components/patient/TabNavigation';
import MedicalHistoryForm from '@/components/patient/MedicalHistoryForm';

// Mock data (would be fetched from API in real implementation)
import { mockPatient } from '@/data/patientData';

// Extend the Vital interface to include missing properties
interface ExtendedVital {
  heartRate: number;
  heartRateStatus: 'normal' | 'elevated' | 'low';
  bloodPressure: string;
  bloodPressureStatus: 'normal' | 'elevated' | 'low';
  glucoseLevel: string;
  glucoseLevelStatus: 'normal' | 'elevated' | 'low';
  cholesterol: string;
  cholesterolStatus: 'normal' | 'elevated' | 'low';
}

// Define the MedicalRecord interface
interface MedicalRecord {
  id: number;
  date: string;
  title: string;
  doctor: string;
  details: string;
}

// Add this new interface for the detailed view
interface DetailedMedicalRecord extends MedicalRecord {
  hospital?: string;
  contactInfo?: string;
  followUp?: string;
  prescriptions?: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }>;
  labResults?: Array<{
    name: string;
    result: string;
    normalRange: string;
    status: 'normal' | 'abnormal';
  }>;
  attachments?: Array<{
    name: string;
    type: string;
    date: string;
  }>;
}

export default function PatientDashboard() {
  const [activeTab, setActiveTab] = useState('health-status');
  const [showMedicalHistoryForm, setShowMedicalHistoryForm] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<DetailedMedicalRecord | null>(null);
  
  const [medicalRecords, setMedicalRecords] = useState<DetailedMedicalRecord[]>([
    { 
      id: 1, 
      date: "August 20, 2023", 
      title: "Hypertension Follow-Up", 
      doctor: "Dr. Neha Varma (Cardiology)", 
      details: "Patient has consistently high BP readings. Advised lifestyle modifications and medication adjustment.",
      hospital: "Global Hospital",
      contactInfo: "456 Cardiology Avenue, Kochi",
      followUp: "Encouraged to reduce sodium intake and engage in daily exercise.",
      prescriptions: [
        {
          name: "Amlodipine",
          dosage: "5mg",
          frequency: "Once daily",
          duration: "8/21/2023 - 8/21/2024"
        }
      ]
    },
    { 
      id: 2, 
      date: "March 15, 2023", 
      title: "Diabetes Type 2 Diagnosis", 
      doctor: "Dr. Aakash Menon (Endocrinology)", 
      details: "Patient diagnosed with Type 2 Diabetes. Symptoms include excessive thirst, frequent urination, weight loss."
    },
    { 
      id: 3, 
      date: "Jan 05, 2023", 
      title: "Annual Physical", 
      doctor: "Dr. Sarah Wilson", 
      details: "Regular checkup, all vitals normal" 
    },
  ]);
  
  // Function to add a new medical record
  const addMedicalRecord = (record: Omit<MedicalRecord, 'id'>) => {
    setMedicalRecords([
      { id: medicalRecords.length + 1, ...record },
      ...medicalRecords
    ]);
  };
  
  // Function to remove a medical record
  const removeMedicalRecord = (id: number) => {
    setMedicalRecords(medicalRecords.filter(record => record.id !== id));
  };
  
  // Function to view detailed medical record
  const viewMedicalRecordDetails = (id: number) => {
    const record = medicalRecords.find(record => record.id === id);
    if (record) {
      setSelectedRecord(record);
    }
  };
  
  // Function to close detailed view
  const closeDetailedView = () => {
    setSelectedRecord(null);
  };
  
  const tabs = [
    { id: 'health-status', label: 'Health Status', icon: <Activity className="w-4 h-4" /> },
    { id: 'medical-history', label: 'Medical History', icon: <ClipboardPlus className="w-4 h-4" /> },
    { id: 'appointments', label: 'Appointments', icon: <Calendar className="w-4 h-4" /> },
    { id: 'medications', label: 'Medications', icon: <Pill className="w-4 h-4" /> },
    { id: 'documents', label: 'Documents', icon: <FileText className="w-4 h-4" /> },
    { id: 'chat', label: 'Doctor Chat', icon: <MessageCircle className="w-4 h-4" /> },
    { id: 'billing', label: 'Billing', icon: <CreditCard className="w-4 h-4" /> },
  ];

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  // Animation variants
  const tabVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PatientHeader patient={mockPatient} />
      
      {/* Improved Patient Greeting and Health Status Summary */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-8 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-6 md:mb-0">
              <h1 className="text-3xl font-bold">Good morning, {mockPatient.name}!</h1>
              <p className="mt-2 text-blue-100">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              
              {mockPatient.nextAppointment && (
                <div className="mt-4 flex items-center bg-white/10 rounded-lg px-4 py-2 backdrop-blur-sm">
                  <Clock className="w-5 h-5 mr-2" />
                  <span>Your next appointment with {mockPatient.nextAppointment.doctorName} is on {mockPatient.nextAppointment.date}</span>
                </div>
              )}
            </div>
            
            {/* Updated Health Status Card */}
            <div className="bg-white text-gray-900 rounded-xl shadow-lg p-4">
              <div className="flex items-center mb-4">
                <Heart className="w-6 h-6 text-red-500 mr-2" />
                <span className="text-lg font-semibold">Your Health Status</span>
              </div>
              
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Overall Health:</span>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    Good
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Risk Level:</span>
                  <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
                    Moderate
                  </span>
                </div>
                
                <button className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  View Potential Risks
                </button>
                
                <button className="w-full bg-white border border-blue-300 text-blue-600 hover:bg-blue-50 py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-center">
                  <Activity className="w-4 h-4 mr-2" />
                  View Detailed Health Metrics
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tab Navigation */}
        <TabNavigation 
          tabs={tabs} 
          activeTab={activeTab} 
          onTabChange={handleTabChange} 
        />

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={tabVariants}
            className="mt-6"
          >
            {/* Health Status Content */}
            {activeTab === 'health-status' && (
              <div className="space-y-6">
                {/* Vitals Overview */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                  <div className="border-b border-gray-100 px-6 py-4 bg-blue-50">
                    <h2 className="text-lg font-semibold text-blue-800 flex items-center">
                      <Activity className="w-5 h-5 mr-2 text-blue-600" />
                      Your Health Overview
                    </h2>
                  </div>
                  <div className="p-6">
                    <VitalsDisplay vitals={mockPatient.vitals} />
                  </div>
                </div>

                {/* Test Results */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                  <div className="border-b border-gray-100 px-6 py-4 bg-blue-50">
                    <h2 className="text-lg font-semibold text-blue-800 flex items-center">
                      <FileSpreadsheet className="w-5 h-5 mr-2 text-blue-600" />
                      Recent Test Results
                    </h2>
                  </div>
                  <div className="p-6">
                    <div className="space-y-3">
                      {mockPatient.testResults.map((test, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50/30 transition-all">
                          <div>
                            <p className="font-medium text-gray-900">{test.name}</p>
                            <div className="flex items-center text-sm text-gray-600 mt-1">
                              <Calendar className="w-3.5 h-3.5 mr-1 text-blue-600" />
                              {test.date}
                              <span className="mx-2">•</span>
                              <User className="w-3.5 h-3.5 mr-1 text-blue-600" />
                              {test.doctor}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                              test.status === "Normal" 
                                ? "bg-green-100 text-green-800 border border-green-200" 
                                : "bg-amber-100 text-amber-800 border border-amber-200"
                            }`}>
                              {test.status}
                            </span>
                            <button className="p-2 rounded-full text-blue-700 hover:bg-blue-100">
                              <Download className="w-4 h-4" />
                            </button>
                            <button className="p-2 rounded-full text-blue-700 hover:bg-blue-100">
                              <Share2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex justify-end">
                      <button className="text-blue-600 hover:text-blue-800 flex items-center text-sm font-medium">
                        View All Test Results 
                    </button>
                    </div>
                  </div>
                </div>

                {/* Medical History Summary */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                  <div className="border-b border-gray-100 px-6 py-4 bg-blue-50">
                    <div className="flex justify-between items-center">
                      <h2 className="text-lg font-semibold text-blue-800 flex items-center">
                        <ClipboardPlus className="w-5 h-5 mr-2 text-blue-600" />
                        Medical History
                    </h2>
                      <button 
                        onClick={() => setShowMedicalHistoryForm(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center text-sm"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Update Medical History
                      </button>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h3 className="font-medium text-gray-900 mb-2">Allergies</h3>
                        <p className="text-gray-700">Penicillin, Peanuts</p>
                      </div>
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h3 className="font-medium text-gray-900 mb-2">Chronic Conditions</h3>
                        <p className="text-gray-700">Hypertension</p>
                        </div>
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h3 className="font-medium text-gray-900 mb-2">Past Surgeries</h3>
                        <p className="text-gray-700">Appendectomy (2015)</p>
                        </div>
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h3 className="font-medium text-gray-900 mb-2">Family History</h3>
                        <p className="text-gray-700">Diabetes, Heart Disease</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Updated Medical History Timeline */}
            {activeTab === 'medical-history' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                  <div className="border-b border-gray-100 px-6 py-4 bg-blue-50 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-blue-800 flex items-center">
                      <ClipboardPlus className="w-5 h-5 mr-2 text-blue-600" />
                      Medical History
                    </h2>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search medical records..."
                          className="pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                      </div>
                      <select className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>All</option>
                        <option>2023</option>
                        <option>2022</option>
                        <option>2021</option>
                      </select>
                      <button 
                        onClick={() => setShowMedicalHistoryForm(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center text-sm font-medium"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Medical Record
                      </button>
                    </div>
                  </div>
                  <div className="p-6">
                    {medicalRecords.length === 0 ? (
                      <div className="text-center py-6 text-gray-500">
                        No medical records yet. Click "Add Medical Record" to add your first entry.
                      </div>
                    ) : (
                      <div className="relative border-l-2 border-blue-200 pl-8 ml-4 space-y-8">
                        {medicalRecords.map((record) => (
                          <div key={record.id} className="relative">
                            {/* Timeline dot */}
                            <div className={`absolute -left-[2.6rem] mt-1.5 w-4 h-4 rounded-full 
                              ${record.title.includes("Hypertension") ? "bg-red-500" : 
                                record.title.includes("Diabetes") ? "bg-orange-500" : "bg-blue-500"} 
                              border-4 border-white shadow`}></div>
                            
                            {/* Content card */}
                            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:border-blue-300 transition-all">
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="flex items-center">
                                    <span className="text-sm text-blue-600 font-medium">{record.date}</span>
                                  </div>
                                  <h3 className="font-medium text-gray-900 mt-1">{record.title}</h3>
                                  <div className="flex items-center text-sm text-gray-600 mt-1">
                                    <User className="w-3.5 h-3.5 mr-1 text-blue-600" />
                                    <span>{record.doctor}</span>
                                  </div>
                                  <p className="text-gray-700 mt-1">{record.details}</p>
                                  <button 
                                    onClick={() => viewMedicalRecordDetails(record.id)}
                                    className="mt-3 text-blue-600 flex items-center text-sm hover:text-blue-800"
                                  >
                                    View Details &rarr;
                                  </button>
                                </div>
                                <div className="flex items-center">
                                  <span className={`inline-flex items-center px-2.5 py-1 mr-2 rounded-full text-xs font-medium ${
                                    record.title.includes("Hypertension") ? "bg-red-100 text-red-800 border border-red-200" : 
                                    record.title.includes("Diabetes") ? "bg-orange-100 text-orange-800 border border-orange-200" :
                                    "bg-green-100 text-green-800 border border-green-200"
                                  }`}>
                                    {record.title.includes("Hypertension") ? "Final" : 
                                    record.title.includes("Diabetes") ? "Final" : "Complete"}
                                  </span>
                                  <button 
                                    onClick={() => removeMedicalRecord(record.id)} 
                                    className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-red-500"
                                    title="Remove record"
                                  >
                                    <X className="w-5 h-5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-center mt-4">
                  <button className="text-blue-600 hover:underline">
                    Export Medical History
                  </button>
                </div>
              </div>
            )}

            {/* Appointments Content */}
            {activeTab === 'appointments' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                  <div className="border-b border-gray-100 px-6 py-4 bg-blue-50 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-blue-800 flex items-center">
                      <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                      Upcoming Appointments
                    </h2>
                    <div className="flex space-x-3">
                      <button className="text-blue-600 bg-white border border-blue-300 hover:bg-blue-50 px-4 py-2 rounded-lg text-sm font-medium">
                        View Past Appointments
                      </button>
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center text-sm font-medium">
                        <Plus className="w-4 h-4 mr-1" />
                        Schedule New Appointment
                      </button>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {/* Map through appointments and render AppointmentCard component */}
                      {[mockPatient.nextAppointment, ...mockPatient.upcomingAppointments].map((appointment, index) => (
                        <AppointmentCard 
                          key={index}
                          appointment={appointment}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Medications Content */}
            {activeTab === 'medications' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                  <div className="border-b border-gray-100 px-6 py-4 bg-blue-50 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-blue-800 flex items-center">
                      <Pill className="w-5 h-5 mr-2 text-blue-600" />
                      Current Medications
                    </h2>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center text-sm font-medium">
                      <Plus className="w-4 h-4 mr-1" />
                      Add Medication
                    </button>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {mockPatient.medications.map((medication, index) => (
                        <MedicationItem 
                          key={index}
                          medication={medication}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Documents Content */}
            {activeTab === 'documents' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                  <div className="border-b border-gray-100 px-6 py-4 bg-blue-50">
                    <h2 className="text-lg font-semibold text-blue-800 flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-blue-600" />
                      Medical Documents
                    </h2>
                  </div>
                  <div className="p-6">
                    <DocumentUploader />
                    
                    <div className="mt-8">
                      <h3 className="text-gray-900 font-medium mb-4">Recently Uploaded Documents</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition-all">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-gray-900">Blood Test Results</p>
                              <p className="text-sm text-gray-600 mt-1">Uploaded Mar 15, 2024</p>
                            </div>
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-medium">PDF</span>
                          </div>
                          <div className="mt-4 flex justify-end space-x-2">
                            <button className="p-1.5 rounded-full text-blue-700 hover:bg-blue-100">
                              <Download className="w-4 h-4" />
                            </button>
                            <button className="p-1.5 rounded-full text-blue-700 hover:bg-blue-100">
                              <Share2 className="w-4 h-4" />
                            </button>
                        </div>
                      </div>

                        <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition-all">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-gray-900">Prescription</p>
                              <p className="text-sm text-gray-600 mt-1">Uploaded Mar 10, 2024</p>
                            </div>
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-medium">JPG</span>
                          </div>
                          <div className="mt-4 flex justify-end space-x-2">
                            <button className="p-1.5 rounded-full text-blue-700 hover:bg-blue-100">
                              <Download className="w-4 h-4" />
                            </button>
                            <button className="p-1.5 rounded-full text-blue-700 hover:bg-blue-100">
                              <Share2 className="w-4 h-4" />
                            </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                          </div>
                        </div>
            )}

            {/* Chat Content */}
            {activeTab === 'chat' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 h-[70vh]">
                  <div className="border-b border-gray-100 px-6 py-4 bg-blue-50">
                    <h2 className="text-lg font-semibold text-blue-800 flex items-center">
                      <MessageCircle className="w-5 h-5 mr-2 text-blue-600" />
                      Doctor Chat
                    </h2>
                              </div>
                  <ChatInterface />
                </div>
              </div>
            )}

            {/* Billing Content */}
            {activeTab === 'billing' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                  <div className="border-b border-gray-100 px-6 py-4 bg-blue-50">
                    <h2 className="text-lg font-semibold text-blue-800 flex items-center">
                      <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
                      Billing & Insurance
                    </h2>
                  </div>
                  <div className="p-6">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-5">
                  <div className="flex items-center justify-between">
                    <div>
                          <p className="text-sm text-blue-700">Your Current Plan</p>
                      <h3 className="text-xl font-bold text-gray-900">BlueCross Premium</h3>
                      <p className="text-sm text-gray-500 mt-1">Policy ID: BC-98765432</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Annual Deductible</p>
                      <div className="flex items-center mt-1">
                        <span className="text-lg font-semibold text-gray-900">$450</span>
                        <span className="text-sm text-gray-500 ml-1">/ $1,000</span>
                      </div>
                          <div className="h-2 w-24 ml-auto mt-1 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{width: '45%'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <h4 className="font-medium text-gray-800 mb-3">Recent Transactions</h4>
                <div className="space-y-3">
                  {mockPatient.billingInfo.map((bill, index) => (
                        <div key={index} className="border rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50/30 transition-all">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">{bill.service}</p>
                          <div className="flex items-center text-sm text-gray-600 mt-1">
                                <Calendar className="w-3.5 h-3.5 mr-1 text-blue-600" />
                            {bill.date}
                            <span className="mx-2">•</span>
                                <span className="text-blue-600">{bill.insurance}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">${bill.amount.toFixed(2)}</p>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            bill.status === "Paid" 
                                  ? "bg-green-100 text-green-800 border border-green-200 mt-1" 
                                  : "bg-amber-100 text-amber-800 border border-amber-200 mt-1"
                          }`}>
                            {bill.status}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between">
                        <p className="text-xs text-gray-500">{bill.id}</p>
                        <div className="flex space-x-2">
                              <button className="text-blue-600 flex items-center px-3 py-1.5 rounded-md text-sm hover:bg-blue-50">
                            <Download className="w-3.5 h-3.5 mr-1" />
                            Receipt
                          </button>
                              <button className="text-blue-600 flex items-center px-3 py-1.5 rounded-md text-sm hover:bg-blue-50">
                            <AlertCircle className="w-3.5 h-3.5 mr-1" />
                            Help
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Medical History Form Modal */}
      <AnimatePresence>
        {showMedicalHistoryForm && (
          <MedicalHistoryForm 
            onClose={() => setShowMedicalHistoryForm(false)}
            onAddRecord={addMedicalRecord}
          />
        )}
      </AnimatePresence>
      
      {/* New - Medical Record Detailed View Modal */}
      <AnimatePresence>
        {selectedRecord && (
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
              <div className="border-b border-gray-100 px-6 py-4 bg-blue-50 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center">
                  <div className="bg-blue-600 text-white p-2 rounded-lg mr-3">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-blue-800 flex items-center">
                      Medical Record Details
                    </h2>
                    <p className="text-sm text-blue-600">Final</p>
                  </div>
                </div>
                <button 
                  onClick={closeDetailedView}
                  className="p-2 hover:bg-blue-100 rounded-full text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900">{selectedRecord.title}</h3>
                  <div className="flex items-center mt-2">
                    <Calendar className="w-4 h-4 text-gray-500 mr-1" />
                    <span className="text-gray-600 mr-3">{selectedRecord.date}</span>
                    <User className="w-4 h-4 text-gray-500 mr-1" />
                    <span className="text-gray-600">{selectedRecord.doctor}</span>
                  </div>
                  
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                      hypertension
                    </span>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                      cardiology
                    </span>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h4 className="font-medium text-gray-800 mb-2">Notes</h4>
                  <p className="text-gray-700 p-4 bg-gray-50 rounded-lg border border-gray-100">
                    {selectedRecord.details}
                  </p>
                </div>
                
                {selectedRecord.hospital && (
                  <div className="mb-6 p-5 rounded-lg bg-blue-50 border border-blue-100">
                    <h4 className="font-medium text-gray-800 mb-2">Hospital Information</h4>
                    <p className="text-gray-700">{selectedRecord.hospital}</p>
                    <p className="text-gray-700">Contact: {selectedRecord.contactInfo}</p>
                    {selectedRecord.followUp && (
                      <p className="text-gray-700 mt-2">Follow-up: {selectedRecord.followUp}</p>
                    )}
                  </div>
                )}
                
                {selectedRecord.prescriptions && selectedRecord.prescriptions.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center mb-3">
                      <Pill className="w-5 h-5 text-blue-600 mr-2" />
                      <h4 className="font-medium text-gray-800">Prescriptions</h4>
                    </div>
                    
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      {selectedRecord.prescriptions.map((prescription, index) => (
                        <div key={index} className="p-4 border-b last:border-b-0">
                          <div className="flex justify-between">
                            <div>
                              <p className="font-medium text-gray-900">{prescription.name}</p>
                              <p className="text-sm text-gray-600 mt-1">Dosage: {prescription.dosage}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-600">Frequency: {prescription.frequency}</p>
                              <p className="text-sm text-gray-600 mt-1">Duration: {prescription.duration}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex justify-between mt-6 border-t border-gray-100 pt-4">
                  <div className="flex space-x-2">
                    <button className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium flex items-center">
                      <Download className="w-4 h-4 mr-2" />
                      Download Record
                    </button>
                    <button className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium flex items-center">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </button>
                  </div>
                  <button 
                    onClick={closeDetailedView}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}