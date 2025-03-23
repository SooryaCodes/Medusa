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
  Loader,
  StopCircle,
  Plus,
  Stethoscope
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
  const [prescription, setPrescription] = useState<Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  }>>([]);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  const [realtimeTranscript, setRealtimeTranscript] = useState('');
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  
  // Declare recognition at component level
  const recognitionRef = useRef<any>(null);
  
  // Create separate state variables for each recording feature
  const [isNotesRecording, setIsNotesRecording] = useState(false);
  const [isDiagnosisRecording, setIsDiagnosisRecording] = useState(false);
  const [notesRealtimeTranscript, setNotesRealtimeTranscript] = useState('');
  const [diagnosisRealtimeTranscript, setDiagnosisRealtimeTranscript] = useState('');
  const [notesStatusMessage, setNotesStatusMessage] = useState('');
  const [diagnosisStatusMessage, setDiagnosisStatusMessage] = useState('');

  // Separate media recorder refs for each feature
  const notesMediaRecorderRef = useRef<MediaRecorder | null>(null);
  const diagnosisMediaRecorderRef = useRef<MediaRecorder | null>(null);
  const notesAudioChunksRef = useRef<Blob[]>([]);
  const diagnosisAudioChunksRef = useRef<Blob[]>([]);
  const notesRecognitionRef = useRef<any>(null);
  const diagnosisRecognitionRef = useRef<any>(null);
  
  // Add this new state for prescription dictation
  const [isPrescriptionDictating, setIsPrescriptionDictating] = useState(false);
  const [prescriptionTranscript, setPrescriptionTranscript] = useState('');
  const prescriptionRecognitionRef = useRef<any>(null);
  const prescriptionMediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [isProcessingDictation, setIsProcessingDictation] = useState(false); // New loading state
  
  // Add useEffect to monitor isPrescriptionDictating state and stop recording when needed
  useEffect(() => {
    if (!isPrescriptionDictating && prescriptionMediaRecorderRef.current && 
        prescriptionMediaRecorderRef.current.state === 'recording') {
      prescriptionMediaRecorderRef.current.stop();
    }
  }, [isPrescriptionDictating]);
  
  // Modify the startWhisperTranscription function to handle the context better
  const startWhisperTranscription = async (context: 'symptoms' | 'diagnosis') => {
    if (isVoiceRecording) {
      // Stop recording
      setStatusMessage('Stopping recording...');
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      
      // Save current transcript to the appropriate field based on the context parameter
      if (realtimeTranscript) {
        if (context === 'symptoms') {
          setNotes(prev => 
            prev + (prev ? ' ' : '') + realtimeTranscript
          );
        } else if (context === 'diagnosis') {
          setDiagnosis(prev => 
            prev + (prev ? ' ' : '') + realtimeTranscript
          );
        }
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
          
          // Add transcript to the appropriate field based on the context parameter
          if (context === 'symptoms') {
            setNotes(prev => 
              prev + (prev ? ' ' : '') + transcript
            );
          } else if (context === 'diagnosis') {
            setDiagnosis(prev => 
              prev + (prev ? ' ' : '') + transcript
            );
          }
          
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
        let isNetworkError = false;
        
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
          // Prevent excessive console logs for common network errors
          if (event.error !== 'network') {
            console.error('Speech recognition error:', event.error, event);
          } else {
            console.log('Network error detected in speech recognition');
          }
          
          // For network errors, keep recording but notify user
          if (event.error === 'network') {
            isNetworkError = true;
            setStatusMessage('Network issue detected. Using local recording only.');
            
            // Clear any existing reconnect timer
            if (reconnectTimer) clearTimeout(reconnectTimer);
            
            // Try to restart speech recognition after delay with exponential backoff
            let attempts = 0;
            const maxAttempts = 5;
            
            const attemptReconnect = () => {
              attempts++;
              const backoffDelay = Math.min(2000 * Math.pow(1.5, attempts - 1), 15000); // 2s, 3s, 4.5s, etc.
              
              reconnectTimer = setTimeout(() => {
                if (isPrescriptionDictating) {
                  try {
                    // First abort any existing recognition session
                    try {
                      recognition.abort();
                    } catch (err) {
                      // Ignore errors from abort
                    }
                    
                    // Then try to start a new one
                    recognition.start();
                    setStatusMessage(`Recognition reconnected (attempt ${attempts})`);
                    isNetworkError = false;
                    attempts = 0; // Reset attempts on success
                  } catch (e) {
                    console.warn(`Failed to restart recognition (attempt ${attempts}/${maxAttempts})`, e);
                    
                    if (attempts < maxAttempts) {
                      setStatusMessage(`Reconnection failed. Trying again in ${Math.round(backoffDelay/1000)}s...`);
                      attemptReconnect(); // Try again with increased backoff
                    } else {
                      setStatusMessage('Could not reconnect. Using local recording only.');
                    }
                  }
                }
              }, backoffDelay);
            };
            
            attemptReconnect();
            
            // Don't stop recording - continue with local recording
            return;
          } 
          else if (event.error === 'no-speech') {
            // No speech detected - normal, just wait
            setStatusMessage('Waiting for speech...');
            return;
          }
          else if (event.error === 'aborted') {
            // Recognition was aborted, but we're still recording locally
            setStatusMessage('Speech recognition paused. Still recording audio.');
            return;
          }
          // For other errors, log but continue with local recording
          setStatusMessage(`Recognition issue: ${event.error}. Local recording continues.`);
        };
        
        recognition.onend = () => {
          // Restart recognition if it ends unexpectedly during recording
          if (isPrescriptionDictating && mediaRecorderRef.current?.state === 'recording') {
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
  
  // Completely separate recording function for Doctor's Notes
  const startNotesRecording = async () => {
    if (isNotesRecording) {
      // Stop recording
      setNotesStatusMessage('Stopping recording...');
      if (notesMediaRecorderRef.current && notesMediaRecorderRef.current.state !== 'inactive') {
        notesMediaRecorderRef.current.stop();
      }
      
      // Save transcript to notes
      if (notesRealtimeTranscript) {
        setNotes(prev => prev + (prev ? ' ' : '') + notesRealtimeTranscript);
      }
      
      setIsNotesRecording(false);
      setNotesRealtimeTranscript('');
      setNotesStatusMessage('');
      return;
    }
    
    try {
      setNotesStatusMessage('Requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setNotesStatusMessage('Recording in progress');
      
      // Create audio recorder
      notesAudioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          notesAudioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        // Stop recognition if running
        if (notesRecognitionRef.current) {
          notesRecognitionRef.current.stop();
        }
        
        setNotesStatusMessage('Processing audio...');
        const audioBlob = new Blob(notesAudioChunksRef.current, { type: 'audio/webm' });
        
        // Send to Whisper API for transcription
        try {
          const transcript = await transcribeWithWhisper(audioBlob);
          setNotes(prev => prev + (prev ? ' ' : '') + transcript);
          setNotesStatusMessage('Transcription complete');
          setTimeout(() => setNotesStatusMessage(''), 2000);
        } catch (error: any) {
          console.error('Error transcribing notes with Whisper:', error);
          setNotesStatusMessage(`Error: ${error.message}`);
        }
      };
      
      // Start recording
      mediaRecorder.start();
      notesMediaRecorderRef.current = mediaRecorder;
      setIsNotesRecording(true);
      
      // Real-time feedback with Web Speech API if available
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        
        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let interimTranscript = '';
          let finalTranscript = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }
          
          if (finalTranscript !== '') {
            setNotesRealtimeTranscript(prev => prev + finalTranscript + ' ');
          } else if (interimTranscript !== '') {
            setNotesRealtimeTranscript(prev => {
              // Keep only the non-interim part of the previous transcript
              const prevFinal = prev.split('(')[0] || '';
              return prevFinal + (interimTranscript ? `(${interimTranscript})` : '');
            });
          }
        };
        
        recognition.onerror = (event: any) => {
          if (event.error === 'network') {
            setNotesStatusMessage('Network error detected. Using local recording only.');
          }
          console.error('Speech recognition error:', event.error);
        };
        
        recognition.start();
        notesRecognitionRef.current = recognition;
      }
    } catch (error: any) {
      setNotesStatusMessage(`Microphone error: ${error.message}`);
      console.error('Error accessing microphone:', error);
    }
  };

  // Completely separate recording function for Diagnosis Notes
  const startDiagnosisRecording = async () => {
    if (isDiagnosisRecording) {
      // Stop recording
      setDiagnosisStatusMessage('Stopping recording...');
      if (diagnosisMediaRecorderRef.current && diagnosisMediaRecorderRef.current.state !== 'inactive') {
        diagnosisMediaRecorderRef.current.stop();
      }
      
      // Save transcript to diagnosis
      if (diagnosisRealtimeTranscript) {
        setDiagnosis(prev => prev + (prev ? ' ' : '') + diagnosisRealtimeTranscript);
      }
      
      setIsDiagnosisRecording(false);
      setDiagnosisRealtimeTranscript('');
      setDiagnosisStatusMessage('');
      return;
    }
    
    try {
      setDiagnosisStatusMessage('Requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setDiagnosisStatusMessage('Recording in progress');
      
      // Create audio recorder
      diagnosisAudioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          diagnosisAudioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        // Stop recognition if running
        if (diagnosisRecognitionRef.current) {
          diagnosisRecognitionRef.current.stop();
        }
        
        setDiagnosisStatusMessage('Processing audio...');
        const audioBlob = new Blob(diagnosisAudioChunksRef.current, { type: 'audio/webm' });
        
        // Send to Whisper API for transcription
        try {
          const transcript = await transcribeWithWhisper(audioBlob);
          setDiagnosis(prev => prev + (prev ? ' ' : '') + transcript);
          setDiagnosisStatusMessage('Transcription complete');
          setTimeout(() => setDiagnosisStatusMessage(''), 2000);
        } catch (error: any) {
          console.error('Error transcribing diagnosis with Whisper:', error);
          setDiagnosisStatusMessage(`Error: ${error.message}`);
        }
      };
      
      // Start recording
      mediaRecorder.start();
      diagnosisMediaRecorderRef.current = mediaRecorder;
      setIsDiagnosisRecording(true);
      
      // Real-time feedback with Web Speech API if available
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        
        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let interimTranscript = '';
          let finalTranscript = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }
          
          if (finalTranscript !== '') {
            setDiagnosisRealtimeTranscript(prev => prev + finalTranscript + ' ');
          } else if (interimTranscript !== '') {
            setDiagnosisRealtimeTranscript(prev => {
              // Keep only the non-interim part of the previous transcript
              const prevFinal = prev.split('(')[0] || '';
              return prevFinal + (interimTranscript ? `(${interimTranscript})` : '');
            });
          }
        };
        
        recognition.onerror = (event: any) => {
          if (event.error === 'network') {
            setDiagnosisStatusMessage('Network error detected. Using local recording only.');
          }
          console.error('Speech recognition error:', event.error);
        };
        
        recognition.start();
        diagnosisRecognitionRef.current = recognition;
      }
    } catch (error: any) {
      setDiagnosisStatusMessage(`Microphone error: ${error.message}`);
      console.error('Error accessing microphone:', error);
    }
  };
  
  // Handle tab change to clean up any ongoing recordings
  const handleTabChange = (tab: string) => {
    // Stop any ongoing recordings when changing tabs
    if (isNotesRecording) {
      if (notesMediaRecorderRef.current && notesMediaRecorderRef.current.state !== 'inactive') {
        notesMediaRecorderRef.current.stop();
      }
      if (notesRecognitionRef.current) {
        notesRecognitionRef.current.stop();
      }
      setIsNotesRecording(false);
      setNotesRealtimeTranscript('');
      setNotesStatusMessage('');
    }
    
    if (isDiagnosisRecording) {
      if (diagnosisMediaRecorderRef.current && diagnosisMediaRecorderRef.current.state !== 'inactive') {
        diagnosisMediaRecorderRef.current.stop();
      }
      if (diagnosisRecognitionRef.current) {
        diagnosisRecognitionRef.current.stop();
      }
      setIsDiagnosisRecording(false);
      setDiagnosisRealtimeTranscript('');
      setDiagnosisStatusMessage('');
    }
    
    setActiveTab(tab);
  };
  
  // Update the toggleVoiceRecording function to pass the active tab context
  const toggleVoiceRecording = async () => {
    await startWhisperTranscription('symptoms');
  };

  // Create a separate function for diagnosis recording
  const toggleDiagnosisRecording = async () => {
    await startWhisperTranscription('diagnosis');
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
      { name: '', dosage: '', frequency: '', duration: '', instructions: '' }
    ]);
  };
  
  const handleComplete = () => {
    // Save consultation data and close
    onClose();
  };
  
  // Add medication parser function
  const parseMedicationFromText = (text: string) => {
    // More sophisticated regex to extract medication details
    const medicationRegex = /\b([A-Za-z]+(?:\s[A-Za-z]+)*)\s+(\d+(?:\.\d+)?)\s*([a-zA-Z]+)?\s+(?:(once|twice|thrice|three times|four times|1|2|3|4)\s+(daily|a day|every day|weekly|a week|every week|monthly|a month|every month)|every\s+(\d+)\s+hours)\s+for\s+(\d+)\s+(days|weeks|months)(?:\s+(?:starting|from)\s+([A-Za-z]+\s+\d+)(?:\s+to\s+([A-Za-z]+\s+\d+))?)?/i;
    
    // Simpler fallback regex
    const simpleRegex = /([A-Za-z]+(?:\s[A-Za-z]+)*)\s+(\d+(?:\.\d+)?)\s*([a-zA-Z]+)?/i;
    
    let match = text.match(medicationRegex);
    
    if (match) {
      const [
        _, 
        name, 
        dosageValue, 
        dosageUnit = 'mg', 
        timesPerPeriod,
        periodUnit,
        everyXHours,
        durationValue,
        durationUnit,
        startDate,
        endDate
      ] = match;
      
      // Map text frequency to standardized format
      let frequency = '';
      if (everyXHours) {
        frequency = `Every ${everyXHours} hours`;
      } else {
        const times = timesPerPeriod?.toLowerCase();
        const period = periodUnit?.toLowerCase();
        
        if (times === 'once' || times === '1') frequency = 'Once daily';
        else if (times === 'twice' || times === '2') frequency = 'Twice daily';
        else if (times === 'thrice' || times === 'three times' || times === '3') frequency = 'Three times daily';
        else if (times === 'four times' || times === '4') frequency = 'Four times daily';
        
        if (period?.includes('week')) frequency = frequency.replace('daily', 'weekly');
        else if (period?.includes('month')) frequency = frequency.replace('daily', 'monthly');
      }
      
      // Format the dosage
      const dosage = `${dosageValue}${dosageUnit}`;
      
      // Format the duration
      let duration = `${durationValue} ${durationUnit}`;
      
      // Additional instructions based on dates if provided
      let instructions = '';
      if (startDate) {
        instructions = `Start on ${startDate}`;
        if (endDate) instructions += ` until ${endDate}`;
      }
      
      return {
        name: name.trim(),
        dosage: dosage,
        frequency: frequency,
        duration: duration,
        instructions: instructions
      };
    } else {
      // Try simpler matching as fallback
      match = text.match(simpleRegex);
      if (match) {
        const [_, name, dosageValue, dosageUnit = 'mg'] = match;
        
        // Return with default values for missing fields
        return {
          name: name.trim(),
          dosage: `${dosageValue}${dosageUnit}`,
          frequency: 'Once daily', // Default
          duration: '30 days',     // Default
          instructions: 'Auto-populated from dictation'
        };
      }
    }
    
    // If nothing matched, try to create a default entry with just the name
    const words = text.split(' ');
    if (words.length > 0) {
      return {
        name: words.slice(0, Math.min(3, words.length)).join(' '),
        dosage: '',
        frequency: 'Once daily',
        duration: '30 days',
        instructions: `From dictation: "${text}"`
      };
    }
    
    return null;
  };

  // Start dictation function for prescriptions
  const startPrescriptionDictation = () => {
    if (isPrescriptionDictating) {
      // Stop dictation
      setIsPrescriptionDictating(false);
      setIsProcessingDictation(true); // Show loading state
      setStatusMessage('Stopping recording and processing audio...');
      
      // Stop WebSpeech recognition if active
      if (prescriptionRecognitionRef.current) {
        try {
          prescriptionRecognitionRef.current.stop();
        } catch (e) {
          console.error('Error stopping speech recognition:', e);
        }
      }
      
      // Explicitly stop MediaRecorder
      if (prescriptionMediaRecorderRef.current && prescriptionMediaRecorderRef.current.state === 'recording') {
        try {
          prescriptionMediaRecorderRef.current.stop();
        } catch (e) {
          console.error('Error stopping media recorder:', e);
        }
      }
      
      // Process the transcript to extract medication details right away
      if (prescriptionTranscript && prescriptionTranscript.trim() !== '') {
        console.log("Processing transcript on stop:", prescriptionTranscript);
        
        // Check if there are multiple medications in the transcript
        const nextCommands = ['next medication', 'add another', 'next'];
        const doneCommands = ['that\'s all', 'done', 'finish', 'complete', 'end'];
        const allCommands = [...nextCommands, ...doneCommands];
        
        // Split transcript by commands to handle multiple medications
        let transcripts: string[] = [prescriptionTranscript];
        
        // Find all command positions in the transcript
        let commandPositions: {pos: number, cmd: string}[] = [];
        allCommands.forEach(cmd => {
          let pos = prescriptionTranscript.toLowerCase().indexOf(cmd.toLowerCase());
          while (pos !== -1) {
            commandPositions.push({pos, cmd});
            pos = prescriptionTranscript.toLowerCase().indexOf(cmd.toLowerCase(), pos + 1);
          }
        });
        
        // Sort positions and split transcript by commands
        if (commandPositions.length > 0) {
          commandPositions.sort((a, b) => a.pos - b.pos);
          transcripts = [];
          let startPos = 0;
          
          commandPositions.forEach(({pos, cmd}) => {
            // Extract text before command
            const medText = prescriptionTranscript.substring(startPos, pos).trim();
            if (medText) {
              transcripts.push(medText);
            }
            startPos = pos + cmd.length;
          });
          
          // Get the last part after the final command
          const lastPart = prescriptionTranscript.substring(startPos).trim();
          if (lastPart) {
            transcripts.push(lastPart);
          }
        }
        
        console.log(`Found ${transcripts.length} potential medications in transcript`);
        
        // Process each medication text and add to prescription
        const newMedications = transcripts
          .filter(text => text.trim().length > 0)
          .map(medicationText => {
            console.log(`Processing medication text: "${medicationText}"`);
            const medicationData = parseMedicationFromText(medicationText);
            
            if (medicationData) {
              console.log("Parsed medication:", medicationData);
              return medicationData;
            } else {
              // Fallback to create a basic medication entry
              const words = medicationText.split(' ');
              const fallbackData = {
                name: words.slice(0, Math.min(3, words.length)).join(' '),
                dosage: '',
                frequency: 'Once daily',
                duration: '30 days',
                instructions: `From dictation: "${medicationText}"`
              };
              console.log("Using fallback data:", fallbackData);
              return fallbackData;
            }
          });
        
        // Add all medications at once
        if (newMedications.length > 0) {
          setPrescription(prev => [...prev, ...newMedications]);
          const count = newMedications.length;
          setStatusMessage(`Added ${count} medication${count > 1 ? 's' : ''} successfully`);
        } else {
          setStatusMessage('No medications detected in transcript');
        }
        
        setTimeout(() => {
          setIsProcessingDictation(false); // Hide loading state
          setStatusMessage('');
        }, 2000);
      } else {
        setIsProcessingDictation(false); // Hide loading state
        setStatusMessage('No speech detected');
        setTimeout(() => setStatusMessage(''), 2000);
      }
      
      setPrescriptionTranscript('');
      return;
    }
    
    try {
      // Clear any previous transcript before starting
      setPrescriptionTranscript('');
      setStatusMessage('Requesting microphone access...');
      // First get microphone access for local recording
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          setStatusMessage('Microphone access granted');
          
          // Set up local recording as a fallback
          const mediaRecorder = new MediaRecorder(stream);
          // Store reference in the component ref
          prescriptionMediaRecorderRef.current = mediaRecorder;
          
          const audioChunks: Blob[] = [];
          
          mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              audioChunks.push(event.data);
            }
          };
          
          // Set up cleanup function to stop all tracks when recording ends
          const cleanupStream = () => {
            // Stop and release all media tracks to properly release the microphone
            stream.getTracks().forEach(track => {
              if (track.readyState === 'live') {
                track.stop();
              }
            });
          };
          
          mediaRecorder.onstop = async () => {
            setIsProcessingDictation(true); // Show loading state
            setStatusMessage('Processing audio...');
            
            // Release the microphone
            cleanupStream();
            
            // Create a single audio blob from all chunks
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            
            // Don't transcribe if there's no audio data
            if (audioBlob.size === 0) {
              setStatusMessage('No audio recorded');
              setIsProcessingDictation(false); // Hide loading state
              setTimeout(() => setStatusMessage(''), 2000);
              return;
            }
            
            // Send to Whisper API for transcription as fallback
            try {
              const transcript = await transcribeWithWhisper(audioBlob);
              console.log("Whisper transcript:", transcript);
              
              // Only process if we haven't already processed this through WebSpeech
              if (prescriptionTranscript === '') {
                // Check for multiple medications in the transcript
                const parts = transcript.split(/next medication|add another|next|that's all|done|finish|complete|end/i)
                  .map(part => part.trim())
                  .filter(part => part.length > 0);
                
                if (parts.length > 0) {
                  const newMeds = parts.map(part => {
                    const medicationData = parseMedicationFromText(part);
                    if (medicationData) {
                      return medicationData;
                    } else {
                      // Fallback
                      return {
                        name: part.split(' ').slice(0, 3).join(' '),
                        dosage: '',
                        frequency: 'Once daily',
                        duration: '30 days',
                        instructions: `From dictation: "${part}"`
                      };
                    }
                  });
                  
                  setPrescription(prev => [...prev, ...newMeds]);
                  const count = newMeds.length;
                  setStatusMessage(`Added ${count} medication${count > 1 ? 's' : ''} from Whisper transcription`);
                } else {
                  // Try to parse the whole transcript as a single medication
                  const medicationData = parseMedicationFromText(transcript);
                  if (medicationData) {
                    console.log("Adding medication from Whisper:", medicationData);
                    setPrescription(prev => [...prev, medicationData]);
                    setStatusMessage('Medication added successfully');
                  } else {
                    // Fallback to create a basic medication entry
                    const words = transcript.split(' ');
                    const fallbackData = {
                      name: words.slice(0, Math.min(3, words.length)).join(' '),
                      dosage: '',
                      frequency: 'Once daily',
                      duration: '30 days',
                      instructions: `From dictation: "${transcript}"`
                    };
                    console.log("Using fallback data from Whisper:", fallbackData);
                    setPrescription(prev => [...prev, fallbackData]);
                    setStatusMessage('Added medication with partial data');
                  }
                }
              }
              
              setIsProcessingDictation(false); // Hide loading state
              setTimeout(() => setStatusMessage(''), 3000);
            } catch (error: any) {
              console.error('Error transcribing with Whisper:', error);
              setStatusMessage(`Transcription error: ${error.message}`);
              setIsProcessingDictation(false); // Hide loading state
              setTimeout(() => setStatusMessage(''), 5000);
            }
          };
          
          // Set up error handling for the MediaRecorder
          mediaRecorder.onerror = (event: any) => {
            console.error('MediaRecorder error:', event);
            setStatusMessage('Error with audio recording');
            setIsPrescriptionDictating(false);
            
            // Clean up media stream on error
            cleanupStream();
          };
          
          // Start local recording
          mediaRecorder.start();
          setIsPrescriptionDictating(true);
          setStatusMessage('Recording started');
          
          // Now set up Web Speech API for real-time feedback
          if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';
            
            let reconnectTimer: NodeJS.Timeout | null = null;
            let isNetworkError = false;
            let reconnectionAttempts = 0;
            const maxReconnectionAttempts = 5;
            let justAddedMedication = false; // Flag to prevent double processing
            
            recognition.onstart = () => {
              setStatusMessage('Real-time transcription active');
              // Reset reconnection attempts counter on successful start
              reconnectionAttempts = 0;
            };
            
            recognition.onresult = (event: SpeechRecognitionEvent) => {
              // Don't process results if we just added a medication
              if (justAddedMedication) {
                return;
              }
              
              let interimTranscript = '';
              let finalTranscript = '';
              
              for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                  finalTranscript += transcript + ' ';
                } else {
                  interimTranscript += transcript;
                }
              }
              
              // Update the transcript
              setPrescriptionTranscript(prev => {
                // For final results, simply append
                if (finalTranscript) {
                  return prev + finalTranscript;
                }
                
                // For interim results, show them differently
                const finalPart = prev.split('(')[0] || '';
                return finalPart + (interimTranscript ? `(${interimTranscript})` : '');
              });
              
              // Check for command phrases in final transcript
              if (finalTranscript) {
                console.log("Final transcript segment:", finalTranscript);
                
                // Define command phrases - case insensitive matching
                const nextCommands = ['next medication', 'add another', 'next'];
                const doneCommands = ['that\'s all', 'done', 'finish', 'complete', 'end'];
                const allCommands = [...nextCommands, ...doneCommands];
                
                // Check if transcript contains any command
                const hasCommand = allCommands.some(cmd => 
                  finalTranscript.toLowerCase().includes(cmd.toLowerCase())
                );
                
                if (hasCommand) {
                  // Find the earliest command phrase position
                  const commandPositions = allCommands.map(cmd => {
                    const pos = finalTranscript.toLowerCase().indexOf(cmd.toLowerCase());
                    return pos === -1 ? Infinity : pos;
                  });
                  
                  const earliestCommandPos = Math.min(...commandPositions);
                  const commandIndex = commandPositions.indexOf(earliestCommandPos);
                  const command = commandIndex !== -1 ? allCommands[commandIndex] : '';
                  
                  if (earliestCommandPos !== Infinity) {
                    // Extract medication text (everything before the command)
                    const fullTranscript = prescriptionTranscript + finalTranscript;
                    const medicationText = fullTranscript.substring(0, 
                      prescriptionTranscript.length + earliestCommandPos).trim();
                    
                    console.log("Medication text to parse:", medicationText);
                    
                    // Only process if we have some text to work with
                    if (medicationText) {
                      const medicationData = parseMedicationFromText(medicationText);
                      
                      if (medicationData) {
                        console.log("Adding medication during dictation:", medicationData);
                        setPrescription(prev => [...prev, medicationData]);
                        justAddedMedication = true;
                        
                        // Visual feedback
                        setStatusMessage('Medication added');
                      } else {
                        // Fallback to add medication with basic data
                        const words = medicationText.split(' ');
                        const fallbackData = {
                          name: words.slice(0, Math.min(3, words.length)).join(' '),
                          dosage: '',
                          frequency: 'Once daily',
                          duration: '30 days',
                          instructions: `From dictation: "${medicationText}"`
                        };
                        console.log("Using fallback data for medication:", fallbackData);
                        setPrescription(prev => [...prev, fallbackData]);
                        justAddedMedication = true;
                        
                        // Visual feedback
                        setStatusMessage('Added medication with partial information');
                      }
                      
                      // Clear transcript to prepare for next medication
                      setPrescriptionTranscript('');
                      
                      // Reset the flag after a short delay
                      setTimeout(() => {
                        justAddedMedication = false;
                      }, 1000);
                      
                      // For done commands, stop the dictation
                      const isDoneCommand = doneCommands.some(cmd => 
                        command.toLowerCase().includes(cmd.toLowerCase())
                      );
                      
                      if (isDoneCommand) {
                        setStatusMessage('Dictation complete');
                        
                        if (prescriptionMediaRecorderRef.current && 
                            prescriptionMediaRecorderRef.current.state === 'recording') {
                          prescriptionMediaRecorderRef.current.stop();
                        }
                        
                        recognition.stop();
                        setIsPrescriptionDictating(false);
                        setTimeout(() => setStatusMessage(''), 2000);
                      } else {
                        // For next commands, just clear and continue
                        setStatusMessage('Ready for next medication');
                        setTimeout(() => setStatusMessage('Listening...'), 1500);
                      }
                    }
                  }
                }
              }
            };
            
            recognition.onerror = (event: any) => {
              // Prevent excessive console logs for common network errors
              if (event.error !== 'network') {
                console.error('Speech recognition error:', event.error, event);
              } else {
                console.log('Network error detected in speech recognition');
              }
              
              // For network errors, keep recording but notify user
              if (event.error === 'network') {
                isNetworkError = true;
                setStatusMessage('Network issue detected. Using local recording only.');
                
                // Clear any existing reconnect timer
                if (reconnectTimer) clearTimeout(reconnectTimer);
                
                // Try to restart speech recognition after delay with exponential backoff
                let attempts = 0;
                const maxAttempts = 5;
                
                const attemptReconnect = () => {
                  attempts++;
                  const backoffDelay = Math.min(2000 * Math.pow(1.5, attempts - 1), 15000); // 2s, 3s, 4.5s, etc.
                  
                  reconnectTimer = setTimeout(() => {
                    if (isPrescriptionDictating) {
                      try {
                        // First abort any existing recognition session
                        try {
                          recognition.abort();
                        } catch (err) {
                          // Ignore errors from abort
                        }
                        
                        // Then try to start a new one
                        recognition.start();
                        setStatusMessage(`Recognition reconnected (attempt ${attempts})`);
                        isNetworkError = false;
                        attempts = 0; // Reset attempts on success
                      } catch (e) {
                        console.warn(`Failed to restart recognition (attempt ${attempts}/${maxAttempts})`, e);
                        
                        if (attempts < maxAttempts) {
                          setStatusMessage(`Reconnection failed. Trying again in ${Math.round(backoffDelay/1000)}s...`);
                          attemptReconnect(); // Try again with increased backoff
                        } else {
                          setStatusMessage('Could not reconnect. Using local recording only.');
                        }
                      }
                    }
                  }, backoffDelay);
                };
                
                attemptReconnect();
                
                // Don't stop recording - continue with local recording
                return;
              } 
              else if (event.error === 'no-speech') {
                // No speech detected - normal, just wait
                setStatusMessage('Waiting for speech...');
                return;
              }
              else if (event.error === 'aborted') {
                // Recognition was aborted, but we're still recording locally
                setStatusMessage('Speech recognition paused. Still recording audio.');
                return;
              }
              // For other errors, log but continue with local recording
              setStatusMessage(`Recognition issue: ${event.error}. Local recording continues.`);
            };
            
            recognition.onend = () => {
              // Only try to restart if we're still supposed to be recording
              // and it's not a network error (which we handle separately)
              if (isPrescriptionDictating && !isNetworkError) {
                try {
                  recognition.start();
                  setStatusMessage('Recognition restarted');
                } catch (e) {
                  console.error('Failed to restart recognition after end:', e);
                  setStatusMessage('Real-time transcription unavailable. Using local recording only.');
                }
              }
            };
            
            // Save reference so we can stop it later
            prescriptionRecognitionRef.current = recognition;
            
            // Start speech recognition
            try {
              recognition.start();
            } catch (e) {
              console.error('Failed to start speech recognition:', e);
              setStatusMessage('Real-time transcription unavailable. Using local recording only.');
            }
          } else {
            // Web Speech API not supported
            setStatusMessage('Real-time transcription not available in this browser. Using local recording only.');
          }
        })
        .catch(error => {
          console.error('Error accessing microphone:', error);
          setStatusMessage(`Microphone access error: ${error.message}`);
          setIsPrescriptionDictating(false);
        });
    } catch (error: any) {
      console.error('Error in prescription dictation setup:', error);
      setStatusMessage(`Setup error: ${error.message}`);
      setIsPrescriptionDictating(false);
    }
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
      <div className="border-b flex">
        <button
          className={`${activeTab === 'symptoms' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'} flex items-center px-4 py-2 border-b-2 font-medium text-sm`}
          onClick={() => handleTabChange('symptoms')}
        >
          <Stethoscope className="h-4 w-4 mr-1.5" />
          Symptoms
        </button>
        <button 
          onClick={() => handleTabChange('history')}
          className={`${activeTab === 'history' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'} flex items-center px-4 py-2 border-b-2 font-medium text-sm`}
        >
          Medical History
        </button>
        <button 
          onClick={() => handleTabChange('labs')}
          className={`${activeTab === 'labs' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'} flex items-center px-4 py-2 border-b-2 font-medium text-sm`}
        >
          Lab Results
        </button>
        <button 
          onClick={() => handleTabChange('prescription')}
          className={`${activeTab === 'prescription' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'} flex items-center px-4 py-2 border-b-2 font-medium text-sm`}
        >
          Prescription
        </button>
      </div>
      
      {/* Tab Content */}
      <div className="p-6">
        {/* Symptoms Tab with both notes sections */}
        {activeTab === 'symptoms' && (
          <div className="space-y-6">
            {/* Chief Complaint section */}
            <div className="mb-6">
              <h3 className="text-gray-700 font-medium mb-2">Chief Complaint</h3>
              <div className="p-3 border rounded-lg bg-gray-50">
                <p className="text-gray-800">{patient.reason}</p>
              </div>
            </div>
            
            {/* AI Suggestions for Doctor - Added component */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 mb-6">
              <div className="flex items-center text-indigo-800 mb-3">
                <Bot className="h-5 w-5 mr-2" />
                <h3 className="font-medium">AI Suggestions for Doctor</h3>
              </div>
              
              <div className="bg-white rounded-lg p-3 border border-indigo-100 mb-2 text-sm">
                <p className="text-gray-700">
                  <span className="font-medium">Possible diagnoses to consider:</span> Based on the symptoms described, consider Acute Sinusitis, Upper Respiratory Infection, or Seasonal Allergies.
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-3 border border-indigo-100 text-sm">
                <p className="font-medium text-gray-900 mb-1">Recommended Questions</p>
                <ul className="text-gray-700 list-disc pl-4">
                  <li>Duration of headache and nasal congestion?</li>
                  <li>Any recent fever or chills?</li>
                  <li>History of previous similar episodes?</li>
                  <li>Any known allergies or triggers?</li>
                </ul>
              </div>
            </div>
            
            {/* Doctor's Notes section */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-gray-700 font-medium">Doctor's Notes</h3>
                <button 
                  onClick={startNotesRecording}
                  className={`flex items-center ${isNotesRecording ? 'bg-red-500 text-white' : 'bg-blue-50 text-blue-700'} px-3 py-1.5 rounded-md text-sm font-medium`}
                >
                  {isNotesRecording ? (
                    <>
                      <StopCircle className="h-4 w-4 mr-1.5" />
                      Stop Recording
                    </>
                  ) : (
                    <>
                      <Mic className="h-4 w-4 mr-1.5" />
                      Voice Record
                    </>
                  )}
                </button>
              </div>
              
              {notesStatusMessage && (
                <div className="bg-blue-50 text-blue-700 p-2 rounded-md text-sm mb-2">
                  {notesStatusMessage}
                </div>
              )}
              
              {notesRealtimeTranscript && (
                <div className="bg-gray-50 p-3 rounded-md text-sm italic mb-2">
                  {notesRealtimeTranscript}
                </div>
              )}
              
              <textarea
                rows={5}
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your notes about the patient's condition or use voice recording..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              ></textarea>
            </div>
            
            {/* Diagnosis Notes section */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-gray-700 font-medium">Diagnosis Notes</h3>
                <button 
                  onClick={startDiagnosisRecording}
                  className={`flex items-center ${isDiagnosisRecording ? 'bg-red-500 text-white' : 'bg-blue-50 text-blue-700'} px-3 py-1.5 rounded-md text-sm font-medium`}
                >
                  {isDiagnosisRecording ? (
                    <>
                      <StopCircle className="h-4 w-4 mr-1.5" />
                      Stop Recording
                    </>
                  ) : (
                    <>
                      <Mic className="h-4 w-4 mr-1.5" />
                      Voice Record
                    </>
                  )}
                </button>
              </div>
              
              {diagnosisStatusMessage && (
                <div className="bg-blue-50 text-blue-700 p-2 rounded-md text-sm mb-2">
                  {diagnosisStatusMessage}
                </div>
              )}
              
              {diagnosisRealtimeTranscript && (
                <div className="bg-gray-50 p-3 rounded-md text-sm italic mb-2">
                  {diagnosisRealtimeTranscript}
                </div>
              )}
              
              <textarea
                rows={5}
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter diagnosis details..."
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
              ></textarea>
            </div>
          </div>
        )}
        
        {/* Prescription Tab */}
        {activeTab === 'prescription' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Prescription</h3>
              <div className="flex space-x-2">
                <button 
                  onClick={startPrescriptionDictation} 
                  className={`flex items-center ${isPrescriptionDictating ? 'bg-red-500 text-white' : isProcessingDictation ? 'bg-yellow-500 text-white' : 'bg-blue-500 text-white'} px-3 py-2 rounded-md text-sm font-medium`}
                  disabled={isProcessingDictation}
                >
                  {isPrescriptionDictating ? (
                    <>
                      <StopCircle className="h-4 w-4 mr-1.5" />
                      Stop Dictation
                    </>
                  ) : isProcessingDictation ? (
                    <>
                      <Loader className="h-4 w-4 mr-1.5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Mic className="h-4 w-4 mr-1.5" />
                      Dictate Prescription
                    </>
                  )}
                </button>
                <button 
                  onClick={() => setPrescription(prev => [...prev, { 
                    name: '', 
                    dosage: '', 
                    frequency: 'Once daily', 
                    duration: '', 
                    instructions: '' 
                  }])}
                  className="bg-blue-50 text-blue-700 px-3 py-2 rounded-md text-sm font-medium flex items-center"
                  disabled={isProcessingDictation}
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  Add Medication
                </button>
              </div>
            </div>
            
            {!isPrescriptionDictating && !isProcessingDictation && prescription.length === 0 && (
              <div className="bg-blue-50 p-4 rounded-md mb-4 border border-blue-200">
                <h4 className="text-blue-800 font-medium mb-2">Voice Dictation Example:</h4>
                <p className="text-blue-800 text-sm mb-1">Try saying something like:</p>
                <p className="bg-white p-3 rounded text-gray-700 text-sm">"Amlodipine 5 mg once daily for 30 days"</p>
                <p className="text-xs text-blue-700 mt-2">
                  Format: [Medication Name] [Dosage] [Frequency] for [Duration] [Optional Instructions]
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  To add another medication, say "next medication" or to finish say "that's all"
                </p>
              </div>
            )}
            
            {isProcessingDictation && (
              <div className="bg-yellow-50 p-6 rounded-md mb-4 border border-yellow-200 flex items-center justify-center">
                <div className="flex flex-col items-center">
                  <Loader className="h-8 w-8 text-yellow-500 animate-spin mb-2" />
                  <p className="text-yellow-700 font-medium">{statusMessage || 'Processing dictation...'}</p>
                  <p className="text-xs text-yellow-600 mt-1">Please wait while we process your audio...</p>
                </div>
              </div>
            )}
            
            {isPrescriptionDictating && (
              <div className="bg-blue-50 p-4 rounded-md text-sm mb-4 border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-blue-800 flex items-center">
                    <span className="animate-pulse mr-2 text-red-500">●</span> 
                    {statusMessage || 'Listening...'}
                  </p>
                  <div className="text-xs text-blue-700 px-2 py-1 bg-blue-100 rounded-md">
                    {prescriptionTranscript ? prescriptionTranscript.length + ' chars' : 'Waiting for speech...'}
                  </div>
                </div>
                <div className="bg-white p-3 rounded border border-blue-100 min-h-[80px] mb-2">
                  {prescriptionTranscript ? (
                    <div>
                      {prescriptionTranscript.split('(')[0]}
                      {prescriptionTranscript.includes('(') && (
                        <span className="text-gray-500 italic">
                          {prescriptionTranscript.substring(prescriptionTranscript.indexOf('('))}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-400 italic">Speak now...</span>
                  )}
                </div>
                <div className="flex flex-col space-y-1">
                  <div className="flex items-center justify-between bg-white p-2 rounded border border-green-100">
                    <p className="text-xs text-green-700 font-medium">Command examples:</p>
                    <div className="flex space-x-2">
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        "next medication"
                      </span>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        "that's all"
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-blue-700">
                    <strong>Format:</strong> Say the medication name, dosage, frequency and duration
                    <br/>
                    Example: "Amlodipine 5 mg once daily for 30 days"
                  </p>
                  <p className="text-xs text-blue-700">
                    <strong>Commands:</strong> Say "next medication" for another or "that's all" when finished
                  </p>
                </div>
              </div>
            )}
            
            {prescription.map((med, index) => (
              <div key={index} className="bg-white rounded-lg border p-4 transition-all duration-300 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Medication Name</label>
                    <input
                      type="text"
                      className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Amlodipine"
                      value={med.name}
                      onChange={(e) => {
                        const updatedPrescription = [...prescription];
                        updatedPrescription[index].name = e.target.value;
                        setPrescription(updatedPrescription);
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dosage</label>
                    <input
                      type="text"
                      className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., 5mg"
                      value={med.dosage}
                      onChange={(e) => {
                        const updatedPrescription = [...prescription];
                        updatedPrescription[index].dosage = e.target.value;
                        setPrescription(updatedPrescription);
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                    <select
                      className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={med.frequency}
                      onChange={(e) => {
                        const updatedPrescription = [...prescription];
                        updatedPrescription[index].frequency = e.target.value;
                        setPrescription(updatedPrescription);
                      }}
                    >
                      <option value="Once daily">Once daily</option>
                      <option value="Twice daily">Twice daily</option>
                      <option value="Three times daily">Three times daily</option>
                      <option value="Four times daily">Four times daily</option>
                      <option value="Every 4 hours">Every 4 hours</option>
                      <option value="Every 6 hours">Every 6 hours</option>
                      <option value="Every 8 hours">Every 8 hours</option>
                      <option value="Every 12 hours">Every 12 hours</option>
                      <option value="Once weekly">Once weekly</option>
                      <option value="As needed">As needed (PRN)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                    <input
                      type="text"
                      className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., 30 days"
                      value={med.duration}
                      onChange={(e) => {
                        const updatedPrescription = [...prescription];
                        updatedPrescription[index].duration = e.target.value;
                        setPrescription(updatedPrescription);
                      }}
                    />
                  </div>
                </div>
                
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Additional Instructions</label>
                  <textarea
                    rows={2}
                    className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Additional instructions (e.g., take with food)"
                    value={med.instructions}
                    onChange={(e) => {
                      const updatedPrescription = [...prescription];
                      updatedPrescription[index].instructions = e.target.value;
                      setPrescription(updatedPrescription);
                    }}
                  />
                </div>
                
                <div className="flex justify-end mt-3">
                  <button 
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                    onClick={() => {
                      const updatedPrescription = [...prescription];
                      updatedPrescription.splice(index, 1);
                      setPrescription(updatedPrescription);
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            
            {prescription.length === 0 && !isPrescriptionDictating && !isProcessingDictation && (
              <div className="text-center py-8 border rounded-lg bg-gray-50">
                <Pill className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-600">No medications added yet</p>
                <p className="text-sm text-gray-500 mt-1">Click "Add Medication" or use voice dictation</p>
              </div>
            )}
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