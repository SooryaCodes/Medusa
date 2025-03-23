import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  User, 
  Check, 
  AlertCircle, 
  Calendar, 
  Clock, 
  FileText, 
  Pill, 
  Heart, 
  Activity, 
  Bot, 
  Mic, 
  ChevronDown, 
  Download, 
  Send, 
  ArrowLeft, 
  ArrowRight,
  Loader
} from 'lucide-react';
import { Patient as PatientType } from '@/types/patient';
// We'll use the native Web Speech API and Whisper API

// Add these type definitions at the top of your file
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

// Add SpeechRecognition event type
interface SpeechRecognitionEvent {
  resultIndex: number;
  results: {
    [index: number]: {
      isFinal: boolean;
      [index: number]: {
        transcript: string;
      };
    };
    length: number;
  };
}

// Remove AssemblyAI-related types
// Define Whisper API types
interface WhisperTranscriptionResponse {
  text: string;
  error?: string;
}

interface ConsultationPanelProps {
  patient: PatientType;
  onClose: () => void;
}

// Replace AssemblyAI key with OpenAI API key
const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY || 'your-openai-key-here';

const ConsultationPanel: React.FC<ConsultationPanelProps> = ({ patient, onClose }) => {
  const [activeTab, setActiveTab] = useState('symptoms');
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [notes, setNotes] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [prescription, setPrescription] = useState([
    { name: 'Amlodipine', dosage: '5mg', frequency: 'Once daily', duration: '30 days' }
  ]);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  const [realtimeTranscript, setRealtimeTranscript] = useState('');
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  
  // Declare recognition at component level
  const recognitionRef = useRef<any>(null);
  
  // Replace AssemblyAI transcription with Whisper AI
  const startWhisperTranscription = async () => {
    if (isVoiceRecording) {
      // Stop recording
      setStatusMessage('Stopping recording...');
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      
      // Save current transcript to notes if needed
      if (realtimeTranscript) {
        setNotes(prev => 
          prev + (prev ? ' ' : '') + realtimeTranscript
        );
      }
      
      setIsVoiceRecording(false);
      setRealtimeTranscript('');
      setStatusMessage('');
      return;
    }
    
    try {
      setStatusMessage('Requesting microphone access...');
      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setStatusMessage('Microphone access granted');
      
      // Create audio recorder
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        // Check if recognition exists before stopping it
        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }
        setStatusMessage('Processing audio...');
        // Combine audio chunks into a single blob
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        
        // Send to Whisper API for transcription
        try {
          const transcript = await transcribeWithWhisper(audioBlob);
          // Add transcript without timestamp
          setNotes(prev => 
            prev + (prev ? ' ' : '') + transcript
          );
          setStatusMessage('Transcription complete');
          setTimeout(() => setStatusMessage(''), 2000); // Clear message after 2 seconds
        } catch (error: any) {
          console.error('Error transcribing with Whisper:', error);
          setStatusMessage(`Error: ${error.message}`);
          alert(`Transcription failed: ${error.message}`);
        }
      };
      
      // Start recording
      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsVoiceRecording(true);
      setStatusMessage('Recording in progress');
      
      // For browsers that support Web Speech API, we can provide real-time feedback
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US'; // Explicitly set language to English (US)
        
        // Handle network errors by setting a timeout and reconnecting
        let reconnectTimer: NodeJS.Timeout | null = null;
        
        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let interimTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              setRealtimeTranscript(prev => prev + ' ' + transcript);
            } else {
              interimTranscript += transcript;
            }
          }
          
          // Update with interim results
          if (interimTranscript) {
            setRealtimeTranscript(prev => {
              const finalWords = prev.trim().split(' ');
              // Only show the last few words plus the interim transcript
              const lastWords = finalWords.slice(Math.max(0, finalWords.length - 10)).join(' ');
              return lastWords + ' ' + interimTranscript;
            });
          }
        };
        
        recognition.onerror = (event: any) => {
          // Only log non-network errors to avoid cluttering the console
          if (event.error !== 'network') {
            console.error('Speech recognition error:', event.error);
          }
          
          // Handle specific error types
          if (event.error === 'network') {
            setStatusMessage(`Network issue detected. Using local recording only.`);
            
            // Try to restart after a short delay
            if (reconnectTimer) clearTimeout(reconnectTimer);
            reconnectTimer = setTimeout(() => {
              try {
                if (isVoiceRecording) {
                  recognition.start();
                  setStatusMessage('Recognition reconnected.');
                }
              } catch (e) {
                console.error('Failed to restart recognition after network error:', e);
              }
            }, 3000);
            
            return; // Continue recording without speech recognition
          }
          
          // For other errors, show a user-friendly message
          setStatusMessage(`Recognition issue: ${event.error}. Recording continues.`);
        };
        
        recognition.onend = () => {
          // Restart recognition if it ends unexpectedly during recording
          if (isVoiceRecording && mediaRecorderRef.current?.state === 'recording') {
            try {
              recognition.start();
            } catch (e) {
              console.error('Failed to restart recognition after unexpected end:', e);
            }
          }
        };
        
        try {
          recognition.start();
          recognitionRef.current = recognition;
        } catch (error) {
          console.error('Error starting speech recognition:', error);
          // Continue with recording even if speech recognition fails
          setStatusMessage('Live transcription unavailable. Recording audio only.');
        }
      } else {
        // Speech recognition not supported by browser
        setStatusMessage('Live transcription not supported in this browser. Recording audio only.');
      }
      
    } catch (error: any) {
      console.error('Error starting recording:', error);
      setStatusMessage(`Failed to start: ${error.message}`);
      
      if (error.name === 'NotAllowedError') {
        alert('Microphone access denied. Please allow microphone access in your browser settings and try again.');
      } else {
        alert(`Unable to start recording: ${error.message}`);
      }
      setIsVoiceRecording(false);
    }
  };
  
  const transcribeWithWhisper = async (audioBlob: Blob): Promise<string> => {
    setIsTranscribing(true);
    
    try {
      // Create a FormData object to send the audio file
      const formData = new FormData();
      formData.append('file', audioBlob, 'recording.webm');
      formData.append('model', 'whisper-1');
      formData.append('language', 'en'); // Explicitly specify English language
      
      // Send to OpenAI Whisper API
      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          // No Content-Type header as FormData sets it with the boundary
        },
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Whisper API error: ${errorData.error?.message || response.statusText}`);
      }
      
      const data = await response.json() as WhisperTranscriptionResponse;
      
      if (data.error) {
        throw new Error(`Whisper transcription error: ${data.error}`);
      }
      
      return data.text;
    } catch (error: any) {
      console.error('Error in Whisper transcription:', error);
      throw error;
    } finally {
      setIsTranscribing(false);
    }
  };
  
  const toggleVoiceRecording = async () => {
    await startWhisperTranscription();
  };
  
  // Replace existing transcription with Whisper API
  const transcribeAudio = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    
    try {
      // Use Whisper API for transcription
      const transcription = await transcribeWithWhisper(audioBlob);
      
      // Append transcription to notes without timestamp
      setNotes(prev => 
        prev + (prev ? ' ' : '') + transcription
      );
      
    } catch (error) {
      console.error('Error transcribing audio:', error);
      alert('Failed to transcribe audio. Please try again.');
    } finally {
      setIsTranscribing(false);
      setIsVoiceRecording(false);
    }
  };
  
  // Update cleanup function
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try {
          mediaRecorderRef.current.stop();
        } catch (error: any) {
          console.error('Error stopping media recorder on unmount:', error);
        }
      }
    };
  }, []);
  
  const handleAddMedication = () => {
    setPrescription([
      ...prescription,
      { name: '', dosage: '', frequency: '', duration: '' }
    ]);
  };
  
  const handleComplete = () => {
    // Save consultation data and close
    onClose();
  };
  
  return (
    <div className="bg-white rounded-xl overflow-hidden">
      <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center mr-3">
            {patient.profilePicture ? (
              <img 
                src={patient.profilePicture} 
                alt={patient.name} 
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <User className="h-6 w-6 text-blue-600" />
            )}
          </div>
          <div>
            <h2 className="text-lg font-semibold">{patient.name}</h2>
            <p className="text-blue-100 text-sm">{patient.age} years, {patient.gender}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button 
            onClick={handleComplete}
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-md text-sm font-medium flex items-center"
          >
            <Check className="h-4 w-4 mr-1.5" />
            Complete & Save
          </button>
          
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-blue-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      {/* Patient Info & Vital Signs */}
      <div className="grid grid-cols-3 gap-4 p-4 bg-blue-50 border-b border-blue-100">
        <div className="flex items-center">
          <div className="bg-red-100 p-2 rounded-full mr-2">
            <Heart className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Heart Rate</p>
            <p className="text-base font-semibold text-gray-900">78 BPM</p>
          </div>
        </div>
        
        <div className="flex items-center">
          <div className="bg-blue-100 p-2 rounded-full mr-2">
            <Activity className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Blood Pressure</p>
            <p className="text-base font-semibold text-gray-900">126/82 mmHg</p>
          </div>
        </div>
        
        <div className="flex items-center">
          <div className="bg-amber-100 p-2 rounded-full mr-2">
            <Calendar className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Last Visit</p>
            <p className="text-base font-semibold text-gray-900">Feb 12, 2024</p>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex border-b">
        <button 
          onClick={() => setActiveTab('symptoms')}
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'symptoms' 
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Symptoms & Diagnosis
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'history' 
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Medical History
        </button>
        <button 
          onClick={() => setActiveTab('labs')}
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'labs' 
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Lab Results
        </button>
        <button 
          onClick={() => setActiveTab('prescription')}
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'prescription' 
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Prescription
        </button>
      </div>
      
      {/* Tab Content */}
      <div className="p-6">
        {/* Symptoms & Diagnosis Tab */}
        {activeTab === 'symptoms' && (
          <div className="grid grid-cols-5 gap-6">
            <div className="col-span-3">
              <div className="mb-6">
                <h3 className="text-gray-700 font-medium mb-2">Chief Complaint</h3>
                <div className="p-3 border rounded-lg bg-gray-50">
                  <p className="text-gray-800">{patient.reason}</p>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-gray-700 font-medium">Doctor's Notes</h3>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={toggleVoiceRecording}
                      className={`p-2 rounded-full flex items-center justify-center transition-all duration-200 ${
                        isVoiceRecording 
                          ? 'bg-red-500 text-white hover:bg-red-600' 
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      }`}
                      title={isVoiceRecording ? "Stop recording" : "Start voice recording"}
                      aria-label={isVoiceRecording ? "Stop voice recording" : "Start voice recording"}
                      disabled={isTranscribing}
                    >
                      {isVoiceRecording ? (
                        <div className="relative">
                          <Mic className="h-4 w-4" />
                          <span className="absolute -right-1 -top-1 w-2 h-2 rounded-full bg-red-300 animate-ping"></span>
                        </div>
                      ) : isTranscribing ? (
                        <Loader className="h-4 w-4 animate-spin" />
                      ) : (
                        <Mic className="h-4 w-4" />
                      )}
                    </button>
                    
                    {isVoiceRecording && (
                      <span className="text-xs font-medium bg-red-50 text-red-600 px-2 py-1 rounded-full animate-pulse">
                        Recording in progress
                      </span>
                    )}
                    {isTranscribing && (
                      <span className="text-xs font-medium bg-amber-50 text-amber-600 px-2 py-1 rounded-full">
                        Processing audio...
                      </span>
                    )}
                    <div className="hidden sm:flex items-center space-x-1">
                      <span className="text-xs text-gray-500">EN</span>
                    </div>
                    <button 
                      className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                      title="AI assistance"
                      aria-label="Get AI assistance with notes"
                    >
                      <Bot className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <textarea
                  className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 text-sm"
                  placeholder="Enter your notes about the patient's condition or use voice recording..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  aria-label="Doctor's notes"
                ></textarea>
                
                {/* Status indicator with improved accessibility and visual design */}
                {statusMessage && (
                  <div className="mt-2 text-sm bg-blue-50 border border-blue-100 p-2 rounded-md text-blue-700 flex items-center" 
                       role="status" aria-live="polite">
                    <div className="mr-2">
                      {isTranscribing ? (
                        <Loader className="h-4 w-4 animate-spin text-blue-500" />
                      ) : isVoiceRecording ? (
                        <Mic className="h-4 w-4 text-red-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-blue-500" />
                      )}
                    </div>
                    <span>{statusMessage}</span>
                    {statusMessage.includes('Network') && (
                      <button 
                        onClick={() => {
                          if (recognitionRef.current) {
                            try {
                              recognitionRef.current.stop();
                              setTimeout(() => {
                                try {
                                  recognitionRef.current?.start();
                                  setStatusMessage('Attempting to reconnect speech recognition...');
                                } catch (e) {
                                  console.error('Error restarting recognition:', e);
                                }
                              }, 500);
                            } catch (e) {
                              console.error('Error stopping recognition for restart:', e);
                            }
                          }
                        }}
                        className="ml-2 text-xs bg-blue-100 px-2 py-0.5 rounded text-blue-700 hover:bg-blue-200"
                      >
                        Retry
                      </button>
                    )}
                  </div>
                )}
                
                {/* Improved realtime transcription display */}
                {isVoiceRecording && realtimeTranscript && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-100 rounded-lg shadow-sm" 
                      aria-live="polite" role="status">
                    <div className="flex items-center mb-1">
                      <Bot className="h-4 w-4 text-blue-600 mr-1.5" />
                      <p className="text-xs font-medium text-blue-700">Live Transcription</p>
                    </div>
                    <p className="text-sm text-gray-700">
                      {realtimeTranscript}
                    </p>
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="text-gray-700 font-medium mb-2">Diagnosis</h3>
                <textarea
                  className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 text-sm"
                  placeholder="Enter your diagnosis..."
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                ></textarea>
              </div>
            </div>
            
            <div className="col-span-2">
              <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 mb-6">
                <div className="flex items-center text-indigo-800 mb-3">
                  <Bot className="h-5 w-5 mr-2" />
                  <h3 className="font-medium">AI Suggestions</h3>
                </div>
                
                <div className="bg-white rounded-lg p-3 border border-indigo-100 mb-2 text-sm">
                  <p className="font-medium text-gray-900 mb-1">Possible Hypertension</p>
                  <p className="text-gray-700">Based on the patient's history and current BP readings, consider a diagnosis of Stage 1 Hypertension.</p>
                </div>
                
                <div className="bg-white rounded-lg p-3 border border-indigo-100 text-sm">
                  <p className="font-medium text-gray-900 mb-1">Recommended Tests</p>
                  <ul className="text-gray-700 list-disc pl-4">
                    <li>Comprehensive Metabolic Panel</li>
                    <li>Lipid Profile</li>
                    <li>Urinalysis</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                <h3 className="font-medium text-blue-800 mb-3">Previous Related Visits</h3>
                
                <div className="bg-white rounded-lg p-3 border border-blue-100 mb-2 text-sm">
                  <div className="flex justify-between items-start">
                    <p className="font-medium text-gray-900">Annual Checkup</p>
                    <p className="text-xs text-gray-500">Jan 15, 2024</p>
                  </div>
                  <p className="text-gray-700 mt-1">Patient reported occasional headaches. BP slightly elevated at 135/85.</p>
                </div>
                
                <div className="bg-white rounded-lg p-3 border border-blue-100 text-sm">
                  <div className="flex justify-between items-start">
                    <p className="font-medium text-gray-900">Emergency Visit</p>
                    <p className="text-xs text-gray-500">Oct 8, 2023</p>
                  </div>
                  <p className="text-gray-700 mt-1">Patient experienced severe migraine with visual aura. BP reading: 145/90.</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Prescription Tab */}
        {activeTab === 'prescription' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-gray-800 font-medium">E-Prescription</h3>
              <button 
                onClick={handleAddMedication}
                className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-md text-sm font-medium flex items-center hover:bg-blue-200"
              >
                Add Medication
              </button>
            </div>
            
            {prescription.map((med, index) => (
              <div key={index} className="mb-4 p-4 border rounded-lg bg-gray-50">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Medication Name</label>
                    <input
                      type="text"
                      className="w-full border rounded-md p-2 text-sm"
                      value={med.name}
                      onChange={(e) => {
                        const newPrescription = [...prescription];
                        newPrescription[index].name = e.target.value;
                        setPrescription(newPrescription);
                      }}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Dosage</label>
                    <input
                      type="text"
                      className="w-full border rounded-md p-2 text-sm"
                      value={med.dosage}
                      onChange={(e) => {
                        const newPrescription = [...prescription];
                        newPrescription[index].dosage = e.target.value;
                        setPrescription(newPrescription);
                      }}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Frequency</label>
                    <select
                      className="w-full border rounded-md p-2 text-sm"
                      value={med.frequency}
                      onChange={(e) => {
                        const newPrescription = [...prescription];
                        newPrescription[index].frequency = e.target.value;
                        setPrescription(newPrescription);
                      }}
                    >
                      <option value="Once daily">Once daily</option>
                      <option value="Twice daily">Twice daily</option>
                      <option value="Three times daily">Three times daily</option>
                      <option value="Four times daily">Four times daily</option>
                      <option value="As needed">As needed</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Duration</label>
                    <input
                      type="text"
                      className="w-full border rounded-md p-2 text-sm"
                      value={med.duration}
                      onChange={(e) => {
                        const newPrescription = [...prescription];
                        newPrescription[index].duration = e.target.value;
                        setPrescription(newPrescription);
                      }}
                    />
                  </div>
                </div>
                
                <div className="mt-3">
                  <label className="block text-sm text-gray-600 mb-1">Instructions</label>
                  <textarea
                    className="w-full border rounded-md p-2 text-sm"
                    placeholder="Additional instructions (e.g., take with food)"
                  ></textarea>
                </div>
                
                {prescription.length > 1 && (
                  <button 
                    onClick={() => {
                      setPrescription(prescription.filter((_, i) => i !== index));
                    }}
                    className="mt-3 text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            
            <div className="flex justify-between items-center mt-6">
              <button className="bg-blue-50 text-blue-700 hover:bg-blue-100 px-4 py-2 rounded-md text-sm font-medium flex items-center">
                <Download className="h-4 w-4 mr-1.5" />
                Download as PDF
              </button>
              
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center">
                <Send className="h-4 w-4 mr-1.5" />
                Send to Pharmacy
              </button>
            </div>
          </div>
        )}
        
        {/* Other tabs would be implemented similarly */}
        {activeTab === 'history' && (
          <div>
            <h3 className="text-gray-800 font-medium mb-4">Patient Medical History</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Chronic Conditions</h4>
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 p-3 border-b text-sm font-medium text-gray-600">
                    Condition
                  </div>
                  <div className="p-3 border-b text-sm">
                    <p className="font-medium">Hypertension</p>
                    <p className="text-gray-600 text-xs mt-1">Diagnosed: Jan 2020</p>
                  </div>
                  <div className="p-3 text-sm">
                    <p className="font-medium">Hyperlipidemia</p>
                    <p className="text-gray-600 text-xs mt-1">Diagnosed: Mar 2021</p>
                  </div>
                </div>
                
                <h4 className="text-sm font-medium text-gray-700 mt-6 mb-3">Allergies</h4>
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 p-3 border-b text-sm font-medium text-gray-600">
                    Allergy
                  </div>
                  <div className="p-3 border-b text-sm">
                    <p className="font-medium">Penicillin</p>
                    <p className="text-gray-600 text-xs mt-1">Reaction: Rash, Difficulty Breathing</p>
                  </div>
                  <div className="p-3 text-sm">
                    <p className="font-medium">Shellfish</p>
                    <p className="text-gray-600 text-xs mt-1">Reaction: Hives</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Past Surgeries</h4>
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 p-3 border-b text-sm font-medium text-gray-600">
                    Procedure
                  </div>
                  <div className="p-3 border-b text-sm">
                    <p className="font-medium">Appendectomy</p>
                    <p className="text-gray-600 text-xs mt-1">Date: June 2015</p>
                  </div>
                </div>
                
                <h4 className="text-sm font-medium text-gray-700 mt-6 mb-3">Family History</h4>
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 p-3 border-b text-sm font-medium text-gray-600">
                    Condition
                  </div>
                  <div className="p-3 border-b text-sm">
                    <p className="font-medium">Diabetes</p>
                    <p className="text-gray-600 text-xs mt-1">Relation: Father</p>
                  </div>
                  <div className="p-3 text-sm">
                    <p className="font-medium">Hypertension</p>
                    <p className="text-gray-600 text-xs mt-1">Relation: Mother, Father</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'labs' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-gray-800 font-medium">Laboratory Results</h3>
              <button className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-md text-sm font-medium flex items-center hover:bg-blue-200">
                Order New Tests
              </button>
            </div>
            
            <div className="border rounded-lg overflow-hidden mb-6">
              <div className="bg-gray-50 p-3 border-b text-sm font-medium text-gray-600 grid grid-cols-5">
                <div className="col-span-2">Test</div>
                <div>Date</div>
                <div>Result</div>
                <div>Status</div>
              </div>
              
              <div className="p-3 border-b text-sm grid grid-cols-5 items-center">
                <div className="col-span-2 font-medium">Complete Blood Count (CBC)</div>
                <div>Mar 15, 2024</div>
                <div>
                  <button className="text-blue-600 underline text-xs">View Details</button>
                </div>
                <div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                    Normal
                  </span>
                </div>
              </div>
              
              <div className="p-3 border-b text-sm grid grid-cols-5 items-center">
                <div className="col-span-2 font-medium">Lipid Panel</div>
                <div>Mar 15, 2024</div>
                <div>
                  <button className="text-blue-600 underline text-xs">View Details</button>
                </div>
                <div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                    Abnormal
                  </span>
                </div>
              </div>
              
              <div className="p-3 text-sm grid grid-cols-5 items-center">
                <div className="col-span-2 font-medium">A1C</div>
                <div>Feb 10, 2024</div>
                <div>
                  <button className="text-blue-600 underline text-xs">View Details</button>
                </div>
                <div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                    Normal
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4">
              <div className="flex items-center text-indigo-800 mb-3">
                <Bot className="h-5 w-5 mr-2" />
                <h3 className="font-medium">AI Analysis of Lab Results</h3>
              </div>
              
              <div className="bg-white rounded-lg p-3 border border-indigo-100 mb-2 text-sm">
                <p className="text-gray-700">
                  <span className="font-medium">Lipid Panel:</span> LDL cholesterol is elevated at 145 mg/dL (normal range &lt;130 mg/dL), suggesting a need for lifestyle modifications and possibly medication adjustment.
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-3 border border-indigo-100 text-sm">
                <p className="font-medium text-gray-900 mb-1">Recommendations</p>
                <ul className="text-gray-700 list-disc pl-4">
                  <li>Consider increasing statin dosage</li>
                  <li>Follow up lipid panel in 3 months</li>
                  <li>Dietary consultation for cholesterol management</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Bottom Action Bar */}
      <div className="flex justify-between items-center p-4 border-t bg-gray-50">
        <div className="flex space-x-2">
          <button className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-3 py-1.5 rounded-md text-sm font-medium flex items-center">
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Previous Patient
          </button>
          
          <button className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-3 py-1.5 rounded-md text-sm font-medium flex items-center">
            Next Patient
            <ArrowRight className="h-4 w-4 ml-1.5" />
          </button>
        </div>
        
        <div>
          <span className="text-gray-600 text-sm mr-2">Consultation Duration: <strong>08:12</strong></span>
          
          <button 
            onClick={handleComplete}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-md text-sm font-medium"
          >
            Complete Consultation
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConsultationPanel; 