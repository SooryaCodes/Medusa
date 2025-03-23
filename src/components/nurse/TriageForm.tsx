import React, { useState } from 'react';
import { X, User, Phone, CalendarDays, AlertCircle, Bot, ArrowRight } from 'lucide-react';

interface TriageFormProps {
  onClose: () => void;
  onSubmit: (patientData: any) => void;
}

const TriageForm: React.FC<TriageFormProps> = ({ onClose, onSubmit }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    contact: '',
    address: '',
    chiefComplaint: '',
    presentingSymptoms: '',
    painLevel: '0',
    allergyHistory: '',
    medicationHistory: '',
    medicalHistory: '',
    temperature: '',
    bloodPressure: '',
    heartRate: '',
    respiratoryRate: '',
    oxygenSaturation: '',
    patientImages: [] as string[],
    isEmergency: false,
    triageCategory: '',
    recordedNotes: ''
  });
  
  const [urgencyScore, setUrgencyScore] = useState<null | {
    score: number;
    level: 'critical' | 'high' | 'medium' | 'low';
    recommendedTests: string[];
    recommendedSpecialist: string;
    estimatedWaitTime: string;
  }>(null);
  
  const [isRecording, setIsRecording] = useState(false);
  const [recordingText, setRecordingText] = useState('');
  
  // New state for handling image uploads
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const calculateUrgencyScore = () => {
    // This would be a more sophisticated algorithm in a real application
    // Here we're using a simple demonstration
    
    const symptoms = formData.presentingSymptoms.toLowerCase();
    const painLevel = parseInt(formData.painLevel);
    
    let score = 0;
    let level: 'critical' | 'high' | 'medium' | 'low' = 'low';
    let recommendedTests: string[] = [];
    let recommendedSpecialist = 'General Practitioner';
    let estimatedWaitTime = '30-45 minutes';
    
    // Add points based on symptoms
    if (symptoms.includes('chest pain') || 
        symptoms.includes('difficulty breathing') || 
        symptoms.includes('shortness of breath')) {
      score += 40;
      recommendedTests.push('ECG', 'Chest X-ray', 'Cardiac Enzymes');
      recommendedSpecialist = 'Cardiologist';
    }
    
    if (symptoms.includes('severe headache') || 
        symptoms.includes('unconscious') || 
        symptoms.includes('seizure')) {
      score += 35;
      recommendedTests.push('CT Scan', 'Neurological Assessment');
      recommendedSpecialist = 'Neurologist';
    }
    
    if (symptoms.includes('bleeding') || 
        symptoms.includes('injury') || 
        symptoms.includes('trauma')) {
      score += 30;
      recommendedTests.push('Complete Blood Count', 'Imaging');
    }
    
    if (symptoms.includes('fever') || 
        symptoms.includes('infection')) {
      score += 15;
      recommendedTests.push('Blood Culture', 'Complete Blood Count');
    }
    
    // Add points based on pain level
    score += painLevel * 3;
    
    // Determine urgency level and wait time
    if (score >= 50) {
      level = 'critical';
      estimatedWaitTime = 'Immediate';
    } else if (score >= 30) {
      level = 'high';
      estimatedWaitTime = '5-15 minutes';
    } else if (score >= 15) {
      level = 'medium';
      estimatedWaitTime = '15-30 minutes';
    }
    
    // If no specific tests were recommended, add general ones
    if (recommendedTests.length === 0) {
      recommendedTests = ['Vital Signs Monitoring'];
    }
    
    setUrgencyScore({
      score,
      level,
      recommendedTests,
      recommendedSpecialist,
      estimatedWaitTime
    });
    
    // Move to next step
    setStep(3);
  };
  
  const handleSubmit = () => {
    onSubmit({
      ...formData,
      urgencyScore
    });
  };
  
  // New function for handling image uploads
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      
      // Create preview URLs for the images
      const newImageUrls = filesArray.map(file => URL.createObjectURL(file));
      
      setUploadedImages(prev => [...prev, ...filesArray]);
      setImagePreviewUrls(prev => [...prev, ...newImageUrls]);
      
      // Add image references to form data
      setFormData(prev => ({
        ...prev,
        patientImages: [...prev.patientImages, ...newImageUrls]
      }));
    }
  };
  
  // Function to remove an uploaded image
  const removeImage = (index: number) => {
    // Remove image from arrays
    const newUploadedImages = [...uploadedImages];
    const newImagePreviewUrls = [...imagePreviewUrls];
    
    // Release object URL to prevent memory leaks
    URL.revokeObjectURL(newImagePreviewUrls[index]);
    
    newUploadedImages.splice(index, 1);
    newImagePreviewUrls.splice(index, 1);
    
    setUploadedImages(newUploadedImages);
    setImagePreviewUrls(newImagePreviewUrls);
    
    // Update form data
    const newPatientImages = [...formData.patientImages];
    newPatientImages.splice(index, 1);
    
    setFormData(prev => ({
      ...prev,
      patientImages: newPatientImages
    }));
  };
  
  // Function to handle speech recognition for patient notes
  const startRecording = () => {
    setIsRecording(true);
    
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      // Use browser's Speech Recognition API
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        
        setRecordingText(transcript);
      };
      
      recognition.start();
    }
  };
  
  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center p-6 border-b">
        <h2 className="text-xl font-semibold text-gray-800">
          {step === 1 && 'New Patient Registration'}
          {step === 2 && 'Symptoms & Medical History'}
          {step === 3 && 'AI Urgency Assessment'}
        </h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X className="h-5 w-5" />
        </button>
      </div>
      
      <div className="p-6">
        {/* Step 1: Patient Info */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                  <User className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Patient's full name"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Age</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Age in years"
                />
              </div>
              
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Contact Number</label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                  <Phone className="h-4 w-4" />
                </span>
                <input
                  type="tel"
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Contact number"
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Patient's address"
              />
            </div>
            
            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Next: Symptoms <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          </div>
        )}
        
        {/* Step 2: Symptoms & Medical History */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Chief Complaint</label>
              <input
                type="text"
                name="chiefComplaint"
                value={formData.chiefComplaint}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Main reason for visit"
              />
            </div>
            
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Presenting Symptoms (detailed)</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <textarea
                  name="presentingSymptoms"
                  value={formData.presentingSymptoms}
                  onChange={handleChange}
                  rows={4}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe all symptoms in detail"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <Bot className="h-5 w-5 text-indigo-500" />
                </div>
              </div>
              <p className="mt-1 text-xs text-indigo-600">AI will analyze symptoms for urgency assessment</p>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Pain Level (0-10)</label>
              <input
                type="range"
                name="painLevel"
                min="0"
                max="10"
                value={formData.painLevel}
                onChange={handleChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>No Pain (0)</span>
                <span>Moderate (5)</span>
                <span>Severe (10)</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Allergy History</label>
                <textarea
                  name="allergyHistory"
                  value={formData.allergyHistory}
                  onChange={handleChange}
                  rows={2}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Any known allergies"
                />
              </div>
              
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Current Medications</label>
                <textarea
                  name="medicationHistory"
                  value={formData.medicationHistory}
                  onChange={handleChange}
                  rows={2}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Medications currently taking"
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Medical History</label>
              <textarea
                name="medicalHistory"
                value={formData.medicalHistory}
                onChange={handleChange}
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Relevant medical history or chronic conditions"
              />
            </div>
            
            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Back
              </button>
              <button
                type="button"
                onClick={calculateUrgencyScore}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Calculate Urgency
              </button>
            </div>
          </div>
        )}
        
        {/* Step 3: AI Assessment Results */}
        {step === 3 && urgencyScore && (
          <div className="space-y-6">
            <div className={`p-4 rounded-lg border ${
              urgencyScore.level === 'critical' ? 'bg-red-50 border-red-200' :
              urgencyScore.level === 'high' ? 'bg-orange-50 border-orange-200' :
              urgencyScore.level === 'medium' ? 'bg-amber-50 border-amber-200' :
              'bg-green-50 border-green-200'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">Urgency Assessment</h3>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  urgencyScore.level === 'critical' ? 'bg-red-100 text-red-800' :
                  urgencyScore.level === 'high' ? 'bg-orange-100 text-orange-800' :
                  urgencyScore.level === 'medium' ? 'bg-amber-100 text-amber-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {urgencyScore.level === 'critical' ? 'CRITICAL' :
                   urgencyScore.level === 'high' ? 'HIGH PRIORITY' :
                   urgencyScore.level === 'medium' ? 'MEDIUM PRIORITY' :
                   'LOW PRIORITY'}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-white p-3 rounded border">
                  <p className="text-xs text-gray-500">Urgency Score</p>
                  <p className="text-lg font-bold">{urgencyScore.score}/100</p>
                </div>
                <div className="bg-white p-3 rounded border">
                  <p className="text-xs text-gray-500">Estimated Wait Time</p>
                  <p className="text-lg font-bold">{urgencyScore.estimatedWaitTime}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">Recommended Tests</h4>
                  <div className="flex flex-wrap gap-2">
                    {urgencyScore.recommendedTests.map((test, index) => (
                      <span 
                        key={index} 
                        className="bg-white px-2 py-1 text-xs rounded border border-gray-300"
                      >
                        {test}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-1">Recommended Specialist</h4>
                  <p className="bg-white px-2 py-1 text-sm rounded border border-gray-300 inline-block">
                    {urgencyScore.recommendedSpecialist}
                  </p>
                </div>
                
                {urgencyScore.level === 'critical' && (
                  <div className="bg-red-100 border border-red-200 p-3 rounded-lg">
                    <div className="flex items-center text-red-800 mb-2">
                      <AlertCircle className="h-5 w-5 mr-2" />
                      <p className="font-medium">Critical Patient Alert</p>
                    </div>
                    <p className="text-sm text-red-700">
                      This patient requires immediate medical attention. Please notify the physician on duty immediately.
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  urgencyScore.level === 'critical' 
                    ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' 
                    : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-offset-2`}
              >
                {urgencyScore.level === 'critical' ? 'Register as Critical Patient' : 'Complete Registration'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TriageForm; 