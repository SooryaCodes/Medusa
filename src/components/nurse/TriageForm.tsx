import React, { useState, useEffect, useRef } from 'react';
import { X, User, Phone, CalendarDays, AlertCircle, Bot, ArrowRight } from 'lucide-react';

// Add type definitions for the Speech Recognition API
interface SpeechRecognitionResult {
  readonly length: number;
  readonly item: (index: number) => SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  readonly isFinal?: boolean;
}

interface SpeechRecognitionEvent {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  readonly item: (index: number) => SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface TriageFormProps {
  onClose: () => void;
  onSubmit: (patientData: any) => void;
}

// Add interface for structured medical data
interface StructuredMedicalData {
  chiefComplaint: string;
  symptoms: string[];
  allergies: string[];
  medications: string[];
  medicalHistory: string[];
  painLevel: string;
}

// Add new interface for Gemini API response
interface GeminiAnalysisResponse {
  chiefComplaint: string;
  symptoms: string[];
  allergies: string[];
  medications: string[];
  medicalHistory: string[];
  painLevel: string;
  assessment: string;
  additionalContext: string;
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
  
  // Enhanced state for speech recognition
  const [analysisInProgress, setAnalysisInProgress] = useState(false);
  const [recognizedCategories, setRecognizedCategories] = useState<{
    symptoms: string[];
    allergies: string[];
    medications: string[];
    medicalHistory: string[];
  }>({
    symptoms: [],
    allergies: [],
    medications: [],
    medicalHistory: []
  });
  
  // Analysis progress indicator
  const [analysisProgress, setAnalysisProgress] = useState(0);
  
  // Add new state variables and refs for local recording fallback
  const [useFallbackRecorder, setUseFallbackRecorder] = useState(false);
  const [networkError, setNetworkError] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  // Add new state variables for improved transcript handling
  const [realtimeTranscript, setRealtimeTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [processingAudio, setProcessingAudio] = useState(false);
  const recognitionRef = useRef<any>(null);
  
  // Add new state for Gemini analysis
  const [geminiAnalysis, setGeminiAnalysis] = useState<GeminiAnalysisResponse | null>(null);
  const [geminiApiKey, setGeminiApiKey] = useState<string>(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');
  
  // Add a keyboard shortcut handler for recording
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt+R to start/stop recording
      if (e.altKey && e.key === 'r') {
        e.preventDefault();
        if (isRecording) {
          stopRecording();
        } else {
          startRecording();
        }
      }
      
      // Alt+A to run analysis on current text
      if (e.altKey && e.key === 'a' && recordingText && !isRecording) {
        e.preventDefault();
        analyzeRecordedText(recordingText);
      }
      
      // Alt+N to navigate to next step (when applicable)
      if (e.altKey && e.key === 'n') {
        e.preventDefault();
        if (step === 1) {
          setStep(2);
        } else if (step === 2) {
          calculateUrgencyScore();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isRecording, recordingText, step]);
  
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
  
  // Improved startRecording function with better error handling and real-time transcription
  const startRecording = () => {
    setIsRecording(true);
    setRecordingText('');
    setNetworkError(false);
    setRealtimeTranscript('');
    setFinalTranscript('');
    
    // Reset recognized categories when starting a new recording
    setRecognizedCategories({
      symptoms: [],
      allergies: [],
      medications: [],
      medicalHistory: []
    });
    
    // Check if we should use the fallback recorder based on previous errors
    if (useFallbackRecorder) {
      startLocalRecording();
      return;
    }
    
    // Set up a periodic analyzer to process text during recording
    const analyzerInterval = setInterval(() => {
      if (finalTranscript.length > 20) { // Only analyze if we have enough text
        analyzeRecordedText(finalTranscript, false); // Pass false to indicate this is not the final analysis
      }
    }, 5000); // Analyze every 5 seconds
    
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      try {
        // Use browser's Speech Recognition API
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        
        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let interimTranscript = '';
          let finalTranscriptPart = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscriptPart += transcript + ' ';
            } else {
              interimTranscript += transcript;
            }
          }
          
          // Update final transcript if there's new final content
          if (finalTranscriptPart) {
            setFinalTranscript(prev => prev + finalTranscriptPart);
          }
          
          // Show both final and interim parts in the UI
          setRealtimeTranscript(finalTranscript + finalTranscriptPart + (interimTranscript ? `(${interimTranscript})` : ''));
          
          // Update the recording text field for display
          const displayText = finalTranscript + finalTranscriptPart + interimTranscript;
          setRecordingText(displayText);
          
          // Add recorded text to form data (just the final parts)
          setFormData(prev => ({
            ...prev,
            recordedNotes: finalTranscript + finalTranscriptPart
          }));
        };
        
        recognition.onend = () => {
          // Clear the analyzer interval if recognition stops
          clearInterval(analyzerInterval);
          
          // Instead of stopping recording, restart it to keep it continuous
          if (isRecording && !networkError) {
            try {
              recognition.start();
              return;
            } catch (error) {
              console.error("Failed to restart recognition:", error);
              fallbackToLocalRecording();
            }
          }
          
          if (finalTranscript.length > 0 && !networkError) {
            analyzeRecordedText(finalTranscript, true); // Pass true to indicate this is the final analysis
          }
          
          if (!networkError) {
            setIsRecording(false);
          }
        };
        
        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          clearInterval(analyzerInterval);
          
          if (event.error === 'network' || event.error === 'service-not-allowed' || event.error === 'not-allowed') {
            // Network errors and permission errors should trigger fallback
            fallbackToLocalRecording();
            return;
          }
          
          if (event.error === 'no-speech') {
            // If no speech is detected, don't stop but just log it
            console.log('No speech detected, continuing to listen...');
          } else if (event.error !== 'aborted') {
            // For other errors (except when deliberately aborted), may want to stop
            setIsRecording(false);
          }
        };
        
        recognition.start();
        recognitionRef.current = recognition;
        
        // Store the recognition instance to stop it later
        (window as any).recognitionInstance = recognition;
        (window as any).analyzerInterval = analyzerInterval;
      } catch (error) {
        console.error("Error initializing speech recognition:", error);
        clearInterval(analyzerInterval);
        fallbackToLocalRecording();
      }
    } else {
      // Browser doesn't support SpeechRecognition API
      clearInterval(analyzerInterval);
      fallbackToLocalRecording();
    }
  };
  
  const fallbackToLocalRecording = () => {
    console.log("Falling back to local recording");
    setNetworkError(true);
    setUseFallbackRecorder(true);
    startLocalRecording();
  };
  
  // Improved local recording function with better audio processing
  const startLocalRecording = () => {
    setIsRecording(true);
    setNetworkError(true);
    
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        // Create options for better audio quality
        const options = {
          mimeType: 'audio/webm;codecs=opus',
          audioBitsPerSecond: 128000
        };
        
        // Try to use specified options, fall back to browser defaults if not supported
        let mediaRecorder;
        try {
          mediaRecorder = new MediaRecorder(stream, options);
        } catch (err) {
          console.warn('Requested codec not supported, using default codec', err);
          mediaRecorder = new MediaRecorder(stream);
        }
        
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];
        
        // Collect audio data
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };
        
        // Handle recording completion
        mediaRecorder.onstop = () => {
          setProcessingAudio(true);
          
          // Create high-quality audio blob
          const audioBlob = new Blob(audioChunksRef.current, { 
            type: mediaRecorder.mimeType || 'audio/webm' 
          });
          
          // Show recording status in UI
          setRecordingText("Audio recorded successfully. Processing...");
          
          // Simulate processing with progress indicator
          let progress = 0;
          const progressInterval = setInterval(() => {
            progress += 5;
            setAnalysisProgress(progress);
            setAnalysisInProgress(true);
            
            if (progress >= 100) {
              clearInterval(progressInterval);
              
              // Create a simulated transcript based on common triage phrases
              // In a real app, this would be replaced with actual server-side transcription
              const simulatedExamples = [
                "Patient reports severe chest pain that started approximately two hours ago. Pain is rated as 8 out of 10.",
                "Patient has been experiencing intermittent fever and cough for the past three days. Pain level is 4/10.",
                "Patient has history of hypertension and diabetes. Currently taking metformin 500mg twice daily and lisinopril 10mg daily.",
                "Patient is allergic to penicillin which causes rash and difficulty breathing. Also has seasonal allergies.",
                "Chief complaint is headache with pain level of 7 out of 10. Patient reports nausea and sensitivity to light."
              ];
              
              const randomExample = simulatedExamples[Math.floor(Math.random() * simulatedExamples.length)];
              const simulatedTranscript = `${randomExample} Additional symptoms include fatigue and shortness of breath.`;
              
              setRecordingText(simulatedTranscript);
              setFinalTranscript(simulatedTranscript);
              
              setFormData(prev => ({
                ...prev,
                recordedNotes: simulatedTranscript
              }));
              
              // Use the more accurate structured analysis
              extractStructuredMedicalData(simulatedTranscript).then(structuredData => {
                // Update recognized categories
                setRecognizedCategories({
                  symptoms: structuredData.symptoms,
                  allergies: structuredData.allergies,
                  medications: structuredData.medications,
                  medicalHistory: structuredData.medicalHistory
                });
                
                // Update form data with more accurate information
                setFormData(prev => ({
                  ...prev,
                  chiefComplaint: structuredData.chiefComplaint || prev.chiefComplaint,
                  presentingSymptoms: structuredData.symptoms.join('\n'),
                  allergyHistory: structuredData.allergies.join('\n'),
                  medicationHistory: structuredData.medications.join('\n'),
                  medicalHistory: structuredData.medicalHistory.join('\n'),
                  painLevel: structuredData.painLevel || prev.painLevel
                }));
                
                setProcessingAudio(false);
                setIsRecording(false);
                
                // Complete UI updates
                setTimeout(() => {
                  setAnalysisInProgress(false);
                  setAnalysisProgress(0);
                }, 1000);
              });
            }
          }, 100);
          
          // Clean up the media stream
          stream.getTracks().forEach(track => track.stop());
        };
        
        // Start recording with small timeslices to improve responsiveness
        mediaRecorder.start(1000);
        
        // Add visual indicator that recording is happening
        setRecordingText("Recording audio locally... (Speech recognition will happen when you stop)");
      })
      .catch(error => {
        console.error("Error accessing microphone:", error);
        setRecordingText("Error: Could not access microphone. Please check permissions.");
        setIsRecording(false);
        setNetworkError(false);
      });
  };
  
  // Improved stop recording function with better cleanup
  const stopRecording = () => {
    // Clear any analyzer intervals
    if ((window as any).analyzerInterval) {
      clearInterval((window as any).analyzerInterval);
      (window as any).analyzerInterval = null;
    }
    
    // Handle both local and web speech recognition
    if (useFallbackRecorder && mediaRecorderRef.current) {
      // Stop the MediaRecorder if we're using the fallback
      if (mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    } else if (recognitionRef.current) {
      // Stop the SpeechRecognition if we're using it
      recognitionRef.current.stop();
      recognitionRef.current = null;
    } else if ((window as any).recognitionInstance) {
      // Fallback for older implementation
      (window as any).recognitionInstance.stop();
      (window as any).recognitionInstance = null;
    }
    
    // Don't set isRecording to false here for local recording
    // as we need to wait for processing to complete
    if (!useFallbackRecorder || !mediaRecorderRef.current) {
      setIsRecording(false);
    }
  };
  
  // Add function to call Gemini API with text for structured medical data
  const analyzeWithGemini = async (text: string): Promise<GeminiAnalysisResponse> => {
    try {
      setAnalysisInProgress(true);
      setAnalysisProgress(10);
      
      // Format the prompt for Gemini to analyze the medical text
      const prompt = `
        Analyze the following medical transcription and extract structured medical data:
        
        ${text}
        
        Provide a comprehensive structured analysis including:
        1. Chief complaint (primary reason for visit)
        2. List of all symptoms mentioned
        3. Any allergies mentioned
        4. Current medications with dosages
        5. Relevant medical history
        6. Pain level (0-10 scale)
        7. Brief assessment of the patient's condition
        8. Any additional important context from the text
        
        Format your response as valid JSON with the following schema:
        {
          "chiefComplaint": "string",
          "symptoms": ["string"],
          "allergies": ["string"],
          "medications": ["string"],
          "medicalHistory": ["string"],
          "painLevel": "string",
          "assessment": "string",
          "additionalContext": "string"
        }
      `;
      
      setAnalysisProgress(30);
      
      // Use API key from environment variable
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || geminiApiKey;
      
      // Make the API request to Gemini
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.2,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
      });
      
      setAnalysisProgress(60);
      
      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }
      
      const data = await response.json();
      setAnalysisProgress(80);
      
      // Parse the response to extract the JSON
      let jsonResponse: GeminiAnalysisResponse;
      
      try {
        // Extract the JSON from the text response
        const textResponse = data.candidates[0].content.parts[0].text;
        const jsonMatch = textResponse.match(/```json\n([\s\S]*?)\n```/) || 
                         textResponse.match(/{[\s\S]*}/);
                         
        if (jsonMatch) {
          jsonResponse = JSON.parse(jsonMatch[0].replace(/```json\n|```/g, ''));
        } else {
          throw new Error("Could not parse JSON from response");
        }
        
        setGeminiAnalysis(jsonResponse);
        setAnalysisProgress(100);
        
        return jsonResponse;
      } catch (err) {
        console.error("Error parsing Gemini response:", err);
        throw new Error("Failed to parse structured data from Gemini response");
      }
      
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      setAnalysisInProgress(false);
      
      // Fallback to the existing analysis method
      return extractStructuredMedicalData(text);
    }
  };
  
  // Enhanced analyzeRecordedText to always use Gemini if available
  const analyzeRecordedText = async (text: string, isFinalAnalysis = true) => {
    // Only show the analysis progress UI for final analysis
    if (isFinalAnalysis) {
      setAnalysisInProgress(true);
      setAnalysisProgress(0);
    }
    
    let progressInterval: ReturnType<typeof setInterval> | undefined;
    if (isFinalAnalysis) {
      // Simulating analysis progress
      progressInterval = setInterval(() => {
        setAnalysisProgress(prev => {
          if (prev >= 20) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 2;
        });
      }, 50);
    }
    
    try {
      // Use Gemini if API key is available (from env or state)
      let structuredData: StructuredMedicalData;
      const hasApiKey = !!process.env.NEXT_PUBLIC_GEMINI_API_KEY || !!geminiApiKey;
      
      if (hasApiKey) {
        const geminiResult = await analyzeWithGemini(text);
        
        // Map Gemini response to our structured format
        structuredData = {
          chiefComplaint: geminiResult.chiefComplaint || '',
          symptoms: geminiResult.symptoms || [],
          allergies: geminiResult.allergies || [],
          medications: geminiResult.medications || [],
          medicalHistory: geminiResult.medicalHistory || [],
          painLevel: geminiResult.painLevel || '0'
        };
        
        // Update UI with additional Gemini context if provided
        if (geminiResult.additionalContext || geminiResult.assessment) {
          setRecordingText(prevText => {
            const additionalInfo = [
              geminiResult.assessment ? `\n\nGemini Assessment: ${geminiResult.assessment}` : '',
              geminiResult.additionalContext ? `\n\nAdditional Context: ${geminiResult.additionalContext}` : ''
            ].filter(Boolean).join('');
            
            return prevText + additionalInfo;
          });
        }
      } else {
        // Fallback to the existing method
        structuredData = await extractStructuredMedicalData(text);
      }
      
      // Update recognized categories
      setRecognizedCategories({
        symptoms: structuredData.symptoms,
        allergies: structuredData.allergies,
        medications: structuredData.medications,
        medicalHistory: structuredData.medicalHistory
      });
      
      // Update form data with more accurate information
      setFormData(prev => ({
        ...prev,
        chiefComplaint: structuredData.chiefComplaint || prev.chiefComplaint,
        presentingSymptoms: structuredData.symptoms.join('\n'),
        allergyHistory: structuredData.allergies.join('\n'),
        medicationHistory: structuredData.medications.join('\n'),
        medicalHistory: structuredData.medicalHistory.join('\n'),
        painLevel: structuredData.painLevel || prev.painLevel
      }));
      
      // Complete the analysis UI
      if (isFinalAnalysis) {
        if (progressInterval) clearInterval(progressInterval);
        setAnalysisProgress(100);
        
        // Hide progress after a delay
        setTimeout(() => {
          setAnalysisInProgress(false);
          setAnalysisProgress(0);
        }, 1000);
      }
    } catch (error) {
      console.error("Analysis error:", error);
      
      // Show error in UI and complete progress
      if (isFinalAnalysis) {
        if (progressInterval) clearInterval(progressInterval);
        setAnalysisProgress(100);
        setTimeout(() => {
          setAnalysisInProgress(false);
          setAnalysisProgress(0);
        }, 1000);
      }
      
      // Still try the fallback method
      const fallbackData = await extractStructuredMedicalData(text);
      
      // Update with fallback data
      setRecognizedCategories({
        symptoms: fallbackData.symptoms,
        allergies: fallbackData.allergies,
        medications: fallbackData.medications,
        medicalHistory: fallbackData.medicalHistory
      });
      
      // Still update form data with best effort
      setFormData(prev => ({
        ...prev,
        chiefComplaint: fallbackData.chiefComplaint || prev.chiefComplaint,
        presentingSymptoms: fallbackData.symptoms.join('\n'),
        allergyHistory: fallbackData.allergies.join('\n'),
        medicationHistory: fallbackData.medications.join('\n'),
        medicalHistory: fallbackData.medicalHistory.join('\n'),
        painLevel: fallbackData.painLevel || prev.painLevel
      }));
    }
  };
  
  // Function to extract structured medical data - simulates AI model processing
  const extractStructuredMedicalData = (text: string): Promise<StructuredMedicalData & { assessment: string; additionalContext: string }> => {
    return new Promise((resolve) => {
      // Simple preprocessing to normalize text
      const normalizedText = text
        .replace(/\s+/g, ' ')                  // Normalize whitespace
        .replace(/(\d+)\s*\/\s*10/g, '$1/10')  // Normalize pain scales
        .replace(/\bmgs\b/g, 'mg')             // Fix common unit errors
        .replace(/\bmls\b/g, 'ml');            // Fix common unit errors
      
      const lowerText = normalizedText.toLowerCase();
      
      // Split into sentences for better context handling
      const sentences = normalizedText
        .split(/(?<=[.!?])\s+/)
        .filter(s => s.trim().length > 0);
      
      // Initialize structured output
      const output: StructuredMedicalData = {
        chiefComplaint: '',
        symptoms: [],
        allergies: [],
        medications: [],
        medicalHistory: [],
        painLevel: '0'  // Default pain level
      };
      
      // Chief complaint detection - explicit mentions
      const chiefComplaintPatterns = [
        /chief\s+complaint\s+(?:is|:)\s+(.+?)(?:\.|$)/i,
        /presenting\s+(?:with|for)\s+(.+?)(?:\.|$)/i,
        /primary\s+concern\s+(?:is|:)\s+(.+?)(?:\.|$)/i,
        /main\s+(?:reason|issue|problem|concern)\s+(?:is|:)\s+(.+?)(?:\.|$)/i,
        /came\s+in\s+(?:for|with)\s+(.+?)(?:\.|$)/i,
        /reason\s+for\s+visit\s+(?:is|:)\s+(.+?)(?:\.|$)/i
      ];
      
      // Try to find explicit chief complaint
      for (const pattern of chiefComplaintPatterns) {
        const match = normalizedText.match(pattern);
        if (match && match[1]) {
          output.chiefComplaint = match[1].trim();
          break;
        }
      }
      
      // Pain level detection - more comprehensive patterns
      const painLevelPatterns = [
        /pain\s+(?:level|score|rating|scale|intensity)?\s*(?:of|is|at)?\s*(\d+)(?:\s*\/\s*10)?/i,
        /(\d+)(?:\s*\/\s*10)?\s+(?:out of 10)?\s+(?:on|for)?\s+(?:the)?\s*pain\s+(?:scale|level)?/i,
        /rates\s+(?:the|their)?\s*pain\s+(?:as|at)?\s*(\d+)/i,
        /pain\s+(?:is)?\s*rated\s+(?:as|at)?\s*(\d+)/i
      ];
      
      // Check each pattern for pain level
      for (const pattern of painLevelPatterns) {
        const match = normalizedText.match(pattern);
        if (match && match[1]) {
          const level = parseInt(match[1]);
          if (level >= 0 && level <= 10) {
            output.painLevel = level.toString();
            break;
          }
        }
      }
      
      // Check for descriptive pain levels
      const painDescriptions: Record<string, string> = {
        'no pain': '0',
        'minimal pain': '1', 
        'mild pain': '2',
        'uncomfortable pain': '3',
        'moderate pain': '4',
        'moderate to severe pain': '5',
        'moderate-to-severe pain': '5',
        'distressing pain': '6',
        'severe pain': '7',
        'intense pain': '8',
        'very severe pain': '9',
        'worst possible pain': '10',
        'worst pain': '10',
        'excruciating pain': '10',
        'unbearable pain': '10'
      };
      
      for (const [description, level] of Object.entries(painDescriptions)) {
        if (lowerText.includes(description)) {
          output.painLevel = level;
          break;
        }
      }
      
      // Process each sentence for categorization
      for (const sentence of sentences) {
        const lowerSentence = sentence.toLowerCase();
        
        // ALLERGIES - check for allergy indicators
        if (
          /allerg(y|ic|ies)/i.test(sentence) || 
          /sensitiv(e|ity)/i.test(sentence) ||
          /intoleran(t|ce)/i.test(sentence) ||
          /adverse reaction/i.test(sentence) ||
          (/(cannot|can't) take/i.test(sentence) && 
            /(because|due to|as it|cause|makes)/i.test(sentence))
        ) {
          output.allergies.push(sentence.trim());
          continue; // Skip further checks for this sentence
        }
        
        // MEDICATIONS - check for medication indicators
        if (
          /taking|medication|prescribed|dose|tablet|capsule|pill|drug/i.test(sentence) ||
          /\d+\s*mg|\d+\s*mcg|\d+\s*ml/i.test(sentence) ||
          /daily|twice|once|every|q\d+h|bid|tid|qid|prn/i.test(sentence) ||
          /treat(s|ed|ing|ment)/i.test(sentence)
        ) {
          output.medications.push(sentence.trim());
          continue;
        }
        
        // MEDICAL HISTORY - check for history indicators
        if (
          /history|condition|chronic|diagnosed|surgery|hospital/i.test(sentence) ||
          /previous|prior|underwent|had a|has had|suffered from/i.test(sentence) ||
          /for \d+ years|since \d+|long-?term|ongoing/i.test(sentence)
        ) {
          output.medicalHistory.push(sentence.trim());
          continue;
        }
        
        // SYMPTOMS - If no other category matched, check for symptom indicators
        if (
          /symptoms?|complain(s|ing)|presented|experiencing|feeling|suffered|having/i.test(sentence) ||
          /pain|ache|sore|hurt|fever|cough|headache|nausea|vomiting|dizzy/i.test(sentence) ||
          /difficulty|problem with|trouble|worsening|started|began|developed/i.test(sentence)
        ) {
          output.symptoms.push(sentence.trim());
          continue;
        }
      }
      
      // If no chief complaint was found explicitly, infer from first symptom 
      // or first sentence with serious symptoms
      if (!output.chiefComplaint && output.symptoms.length > 0) {
        // Look for severe symptoms
        const severeSymptomTerms = [
          'chest pain', 'breathing', 'shortness of breath', 'sob', 
          'severe', 'extreme', 'worst', 'unbearable', 'excruciating',
          'bleeding', 'collapsed', 'unconscious', 'fever', 'seizure'
        ];
        
        const severeSymptom = output.symptoms.find(s => 
          severeSymptomTerms.some(term => s.toLowerCase().includes(term))
        );
        
        output.chiefComplaint = severeSymptom || output.symptoms[0];
      }
      
      // Extract medication details more accurately using a comprehensive regex
      const medicationWithDetails: string[] = [];
      const medicationRegex = /\b(\w+(?:\s+\w+){0,3})\s+(\d+(?:\.\d+)?)\s*(mg|mcg|g|ml|iu|mg\/ml|mg\/g|patch|tab)(?:\s+(once|twice|three times|four times|daily|every day|weekly|monthly|every|q\d+h|bid|tid|qid|prn|as needed|before meals|after meals|with meals|at bedtime|morning|evening|night|am|pm))?\b/gi;
      
      let match;
      while ((match = medicationRegex.exec(normalizedText)) !== null) {
        const medName = match[1].trim();
        const dosage = match[2];
        const unit = match[3];
        const frequency = match[4] ? ` ${match[4]}` : '';
        
        medicationWithDetails.push(`${medName} ${dosage}${unit}${frequency}`);
      }
      
      // If we have detailed medications, prioritize them over sentences
      if (medicationWithDetails.length > 0) {
        // Extract medication names for comparison
        const medicationNames = medicationWithDetails.map(med => 
          med.split(' ')[0].toLowerCase()
        );
        
        // Remove any general medication entries that are covered by detailed entries
        output.medications = output.medications.filter(med => 
          !medicationNames.some(name => med.toLowerCase().includes(name) && 
            (/\d+\s*mg/i.test(med) || /\d+\s*mcg/i.test(med) || /\d+\s*ml/i.test(med)))
        );
        
        // Add the detailed entries
        output.medications = [...output.medications, ...medicationWithDetails];
      }
      
      // Deduplicate all arrays
      output.symptoms = [...new Set(output.symptoms)];
      output.allergies = [...new Set(output.allergies)];
      output.medications = [...new Set(output.medications)];
      output.medicalHistory = [...new Set(output.medicalHistory)];
      
      // Add the fields required for GeminiAnalysisResponse
      const enhancedOutput = {
        ...output,
        assessment: "Analysis performed using local pattern matching. For more accurate assessment, please add a Gemini API key.",
        additionalContext: "This is a fallback analysis without using the Gemini API."
      };
      
      // Simulate processing time
      setTimeout(() => resolve(enhancedOutput), 300);
    });
  };
  
  // Add the new formatting function
  const formatTranscriptWithHighlights = (text: string) => {
    if (!text) return null;
    
    // Apply highlighting patterns 
    return text
      // Highlight pain levels
      .replace(/(\bpain\s+(?:level|score|rating)?\s*(?:of|is|at)?\s*\d+(?:\s*\/\s*10)?)/gi, 
        '<span class="bg-yellow-100 px-1 rounded">$1</span>')
      .replace(/(\d+(?:\s*\/\s*10)?\s+(?:out of 10)?\s+(?:on|for)\s+(?:the)?\s*pain)/gi, 
        '<span class="bg-yellow-100 px-1 rounded">$1</span>')
      
      // Highlight allergies
      .replace(/(\b(?:allerg(?:y|ic|ies)|sensitivity|reaction to)\s+\w+(?:\s+\w+){0,3})/gi, 
        '<span class="bg-red-100 px-1 rounded">$1</span>')
      
      // Highlight medications
      .replace(/(\b\w+(?:\s+\w+){0,2}\s+\d+(?:\.\d+)?\s*(?:mg|mcg|g|ml|iu))/gi, 
        '<span class="bg-blue-100 px-1 rounded">$1</span>')
        
      // Highlight medical history terms
      .replace(/(\bhistory of\s+\w+(?:\s+\w+){0,5})/gi, 
        '<span class="bg-purple-100 px-1 rounded">$1</span>')
        
      // Add line breaks for better readability
      .split('. ').join('.<br/>')
      // Convert to React JSX
      .split('<br/>').map((line, i) => (
        <React.Fragment key={i}>
          {i > 0 && <br />}
          <span dangerouslySetInnerHTML={{ __html: line }} />
        </React.Fragment>
      ));
  };
  
  // Add a new component for speech guidance
  const SpeechGuidance = () => (
    <div className="mt-4 bg-blue-50 p-3 rounded-lg border border-blue-200">
      <h4 className="text-sm font-medium text-blue-800 mb-2">Speech Recognition Guidelines</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <p className="text-xs font-semibold text-blue-700 mb-1">For efficient recording:</p>
          <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
            <li>Speak clearly and at a moderate pace</li>
            <li>Use complete sentences</li>
            <li>Pause briefly between different topics</li>
            <li>Mention category terms explicitly (symptoms, allergies, etc.)</li>
            <li>Include descriptive details and timing information</li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold text-blue-700 mb-1">Sample phrases for structured input:</p>
          <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
            <li>"Chief complaint is chest pain"</li>
            <li>"Patient reports symptoms of fever and cough"</li>
            <li>"Patient has allergies to penicillin"</li>
            <li>"Currently taking lisinopril 10mg daily"</li>
            <li>"Medical history includes hypertension"</li>
            <li>"Pain level is 7 out of 10"</li>
          </ul>
        </div>
      </div>
      <p className="text-xs text-blue-600 mt-2 border-t border-blue-100 pt-2">
        <span className="font-semibold">Example structured input:</span> "The chief complaint is severe chest pain that started 2 hours ago. 
        Patient reports symptoms of shortness of breath and nausea. Pain level is 8 out of 10.
        Medical history includes hypertension and diabetes. Patient is currently taking metformin 500mg twice daily and lisinopril 10mg.
        Patient has allergies to penicillin which causes skin rash."
      </p>
    </div>
  );
  
  // Render the recording status component with improved feedback
  const RecordingStatus = () => {
    if (!isRecording && !processingAudio) return null;
    
    // Count recognized items to show real-time progress
    const totalRecognized = 
      recognizedCategories.symptoms.length + 
      recognizedCategories.allergies.length + 
      recognizedCategories.medications.length + 
      recognizedCategories.medicalHistory.length;
    
    const hasApiKey = !!process.env.NEXT_PUBLIC_GEMINI_API_KEY || !!geminiApiKey;
    
    return (
      <div className={`mb-3 ${networkError ? 'bg-yellow-50 p-2 rounded-md' : ''}`}>
        <div className="flex items-center space-x-2 mb-1">
          <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></div>
          <p className={`text-sm ${networkError ? 'text-yellow-700' : 'text-red-600'} font-medium`}>
            {processingAudio 
              ? "Processing audio recording... Please wait."
              : networkError 
                ? "Using local audio recording. Speech will be processed when you stop recording." 
                : `Recording in progress... ${hasApiKey ? "Using Gemini AI for enhanced analysis." : "Speak clearly using structured phrases."}`}
          </p>
        </div>
        
        {/* Show real-time category counts when items are recognized */}
        {totalRecognized > 0 && (
          <div className="flex flex-wrap gap-2 mt-2 text-xs">
            {recognizedCategories.symptoms.length > 0 && (
              <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full">
                {recognizedCategories.symptoms.length} symptom{recognizedCategories.symptoms.length !== 1 ? 's' : ''}
              </span>
            )}
            {recognizedCategories.allergies.length > 0 && (
              <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full">
                {recognizedCategories.allergies.length} allerg{recognizedCategories.allergies.length !== 1 ? 'ies' : 'y'}
              </span>
            )}
            {recognizedCategories.medications.length > 0 && (
              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                {recognizedCategories.medications.length} medication{recognizedCategories.medications.length !== 1 ? 's' : ''}
              </span>
            )}
            {recognizedCategories.medicalHistory.length > 0 && (
              <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full">
                {recognizedCategories.medicalHistory.length} history item{recognizedCategories.medicalHistory.length !== 1 ? 's' : ''}
              </span>
            )}
            {formData.chiefComplaint && (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-800 rounded-full">
                Chief complaint identified
              </span>
            )}
            {hasApiKey && (
              <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-full">
                Using Gemini for analysis
              </span>
            )}
          </div>
        )}
      </div>
    );
  };
  
  // Add Gemini insights component to display additional context
  const GeminiInsights = () => {
    if (!geminiAnalysis || !geminiApiKey) return null;
    
    return (
      <div className="mt-3 bg-indigo-50 p-3 rounded-lg border border-indigo-100">
        <h4 className="text-sm font-medium text-indigo-800 mb-2 flex items-center">
          <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#4F46E5"/>
            <path d="M2 17L12 22L22 17" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Gemini AI Insights
        </h4>
        
        {geminiAnalysis.assessment && (
          <div className="mb-2">
            <p className="text-xs font-semibold text-indigo-700 mb-1">Clinical Assessment:</p>
            <p className="text-sm text-indigo-700 bg-white p-2 rounded border border-indigo-100">
              {geminiAnalysis.assessment}
            </p>
          </div>
        )}
        
        {geminiAnalysis.additionalContext && (
          <div>
            <p className="text-xs font-semibold text-indigo-700 mb-1">Additional Context:</p>
            <p className="text-sm text-indigo-700 bg-white p-2 rounded border border-indigo-100">
              {geminiAnalysis.additionalContext}
            </p>
          </div>
        )}
      </div>
    );
  };
  
  // Add reset function to clear speech data and analysis
  const resetSpeechInput = () => {
    setRecordingText('');
    setRealtimeTranscript('');
    setFinalTranscript('');
    setRecognizedCategories({
      symptoms: [],
      allergies: [],
      medications: [],
      medicalHistory: []
    });
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
            {/* Voice recording section */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-700">Speech to Text Input</h3>
                <div className="flex space-x-2">
                  {!isRecording ? (
                    <>
                      <button
                        type="button"
                        onClick={startRecording}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        aria-label="Start recording patient information"
                        title="Start recording (Alt+R)"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                        Start Recording <span className="opacity-70 text-2xs ml-1">(Alt+R)</span>
                      </button>
                      {recordingText && (
                        <button
                          type="button"
                          onClick={resetSpeechInput}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-full shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          aria-label="Clear speech input"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Reset
                        </button>
                      )}
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      aria-label="Stop recording patient information"
                      title="Stop recording (Alt+R)"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                      </svg>
                      Stop Recording <span className="opacity-70 text-2xs ml-1">(Alt+R)</span>
                    </button>
                  )}
                </div>
              </div>
              
              {/* Replace the Recording indicator with the new component */}
              <RecordingStatus />
              
              {/* Analysis progress */}
              {analysisInProgress && (
                <div className="mb-3">
                  <p className="text-xs text-indigo-600 mb-1">Analyzing and categorizing patient information...</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-300 ease-in-out" 
                      style={{ width: `${analysisProgress}%` }}
                      role="progressbar"
                      aria-valuenow={analysisProgress}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    ></div>
                  </div>
                </div>
              )}
              
              {/* Transcribed text */}
              <div className="bg-white border border-gray-200 rounded-md p-3 min-h-[100px] max-h-[200px] overflow-y-auto">
                {recordingText ? (
                  <div className="text-sm text-gray-700">
                    {/* Format the text to show interim results in gray and highlight important terms */}
                    {realtimeTranscript.includes('(') 
                      ? <>
                          {/* Split and format the stable part of the transcript */}
                          {formatTranscriptWithHighlights(realtimeTranscript.split('(')[0])}
                          {/* Show interim part in gray */}
                          <span className="text-gray-400">
                            ({realtimeTranscript.split('(')[1]}
                          </span>
                        </>
                      : formatTranscriptWithHighlights(recordingText)
                    }
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">
                    Recording will appear here. Speak clearly about patient's symptoms, allergies, medications, and medical history.
                  </p>
                )}
              </div>
              
              {/* Add Gemini insights after the transcript */}
              <GeminiInsights />
              
              {/* Add the speech guidance component */}
              <SpeechGuidance />
              
              {/* Categorization results */}
              {(recognizedCategories.symptoms.length > 0 || 
                recognizedCategories.allergies.length > 0 || 
                recognizedCategories.medications.length > 0 || 
                recognizedCategories.medicalHistory.length > 0) && (
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-green-50 p-2 rounded-md border border-green-100">
                    <p className="font-medium text-green-700 mb-1">Identified Symptoms:</p>
                    <ul className="list-disc list-inside text-green-600 pl-1">
                      {recognizedCategories.symptoms.map((symptom, idx) => (
                        <li key={idx} className="truncate">{symptom}</li>
                      ))}
                      {recognizedCategories.symptoms.length === 0 && (
                        <li className="italic text-green-500">None identified</li>
                      )}
                    </ul>
                  </div>
                  <div className="bg-amber-50 p-2 rounded-md border border-amber-100">
                    <p className="font-medium text-amber-700 mb-1">Identified Allergies:</p>
                    <ul className="list-disc list-inside text-amber-600 pl-1">
                      {recognizedCategories.allergies.map((allergy, idx) => (
                        <li key={idx} className="truncate">{allergy}</li>
                      ))}
                      {recognizedCategories.allergies.length === 0 && (
                        <li className="italic text-amber-500">None identified</li>
                      )}
                    </ul>
                  </div>
                  <div className="bg-blue-50 p-2 rounded-md border border-blue-100">
                    <p className="font-medium text-blue-700 mb-1">Identified Medications:</p>
                    <ul className="list-disc list-inside text-blue-600 pl-1">
                      {recognizedCategories.medications.map((medication, idx) => (
                        <li key={idx} className="truncate">{medication}</li>
                      ))}
                      {recognizedCategories.medications.length === 0 && (
                        <li className="italic text-blue-500">None identified</li>
                      )}
                    </ul>
                  </div>
                  <div className="bg-purple-50 p-2 rounded-md border border-purple-100">
                    <p className="font-medium text-purple-700 mb-1">Identified Medical History:</p>
                    <ul className="list-disc list-inside text-purple-600 pl-1">
                      {recognizedCategories.medicalHistory.map((history, idx) => (
                        <li key={idx} className="truncate">{history}</li>
                      ))}
                      {recognizedCategories.medicalHistory.length === 0 && (
                        <li className="italic text-purple-500">None identified</li>
                      )}
                    </ul>
                  </div>
                </div>
              )}
            </div>
            
            {/* Image upload section - New */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-700">Upload Patient Images</h3>
                <div>
                  <label 
                    htmlFor="image-upload" 
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Upload Images
                  </label>
                  <input 
                    id="image-upload" 
                    type="file" 
                    multiple 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                    className="hidden" 
                  />
                </div>
              </div>
              
              {/* Image preview area */}
              {imagePreviewUrls.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {imagePreviewUrls.map((url, index) => (
                    <div key={index} className="relative border border-gray-200 rounded overflow-hidden h-24">
                      <img 
                        src={url} 
                        alt={`Patient upload ${index + 1}`} 
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 shadow-sm hover:bg-red-700 focus:outline-none"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                  <p className="text-sm text-gray-500">
                    Drag and drop image files here, or click "Upload Images" to select files.
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Injuries, rashes, medications, or any other visual evidence.
                  </p>
                </div>
              )}
            </div>
            
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
                title="Calculate Urgency (Alt+N)"
              >
                Calculate Urgency <span className="opacity-70 text-xs ml-1">(Alt+N)</span>
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