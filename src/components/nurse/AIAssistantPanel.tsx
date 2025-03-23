import React, { useState, useRef } from 'react';
import { 
  X, Bot, Send, Plus, Volume2, VolumeX, 
  Mic, RotateCcw, Copy, ClipboardList, FileText, 
  Pill, Thermometer, BarChart2, AlertCircle
} from 'lucide-react';

interface AIAssistantPanelProps {
  miniVersion?: boolean;
  onClose?: () => void;
}

const AIAssistantPanel: React.FC<AIAssistantPanelProps> = ({ miniVersion = false, onClose }) => {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m your AI nursing assistant. I can help with patient assessments, medication information, treatment protocols, or any nursing-related questions.',
      timestamp: new Date()
    }
  ]);
  const [isTextToSpeech, setIsTextToSpeech] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  
  const handleSendMessage = () => {
    if (!input.trim()) return;
    
    // Add user message
    const userMessage = {
      role: 'user' as const,
      content: input,
      timestamp: new Date()
    };
    
    setMessages([...messages, userMessage]);
    setInput('');
    
    // Simulate AI response (would be replaced with actual API call)
    setTimeout(() => {
      let aiResponse = '';
      
      if (input.toLowerCase().includes('vital') || input.toLowerCase().includes('blood pressure')) {
        aiResponse = 'For vital signs collection, remember to ensure the patient is properly positioned. For blood pressure, the patient should be seated with their arm at heart level. The normal adult range is typically 90-120/60-80 mmHg. Readings outside this range may require additional assessment.';
      } else if (input.toLowerCase().includes('medication') || input.toLowerCase().includes('drug')) {
        aiResponse = 'When administering medications, always follow the five rights: right patient, right medication, right dose, right route, and right time. Document administration immediately and monitor for side effects.';
      } else if (input.toLowerCase().includes('triage') || input.toLowerCase().includes('priority')) {
        aiResponse = 'Triage assessment should evaluate airway, breathing, circulation, disability, and exposure (ABCDE approach). Patient priorities are typically classified as: Immediate (red), Urgent (yellow), Delayed (green), or Deceased (black). Remember to reassess regularly as conditions may change.';
      } else if (input.toLowerCase().includes('protocol') || input.toLowerCase().includes('emergency')) {
        aiResponse = 'For cardiac emergencies, initiate the Code Blue protocol: call for help, start CPR if needed, connect defib/monitor, establish IV access, and prepare emergency medications. Document all interventions and response times.';
      } else {
        aiResponse = 'I understand your query about ' + input.split(' ').slice(0, 3).join(' ') + '... To provide more specific guidance, could you provide additional details about the patient\'s condition or your specific question?';
      }
      
      const assistantMessage = {
        role: 'assistant' as const,
        content: aiResponse,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      // If text-to-speech is enabled, read the message
      if (isTextToSpeech && 'speechSynthesis' in window) {
        const speech = new SpeechSynthesisUtterance(aiResponse);
        window.speechSynthesis.speak(speech);
      }
    }, 1000);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const toggleSpeech = () => {
    // If turning off, cancel any ongoing speech
    if (isTextToSpeech && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsTextToSpeech(!isTextToSpeech);
  };
  
  const toggleRecording = () => {
    if (!isRecording) {
      // Start recording
      setIsRecording(true);
      // Here we would implement actual speech recognition
      // For demo purposes, we'll just set a timeout
      setTimeout(() => {
        setInput(prev => prev + " I need help with triage protocol for chest pain patient");
        setIsRecording(false);
      }, 3000);
    } else {
      // Stop recording
      setIsRecording(false);
    }
  };
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Scroll to bottom when messages change
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  if (miniVersion) {
    return (
      <div className="rounded-lg bg-white border border-gray-200">
        <div className="flex items-center p-4 border-b border-gray-100">
          <Bot className="h-5 w-5 text-indigo-600 mr-2" />
          <h3 className="text-base font-medium text-gray-800">AI Triage Assistant</h3>
        </div>
        
        <div className="p-4">
          <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 mb-3 text-sm">
            <p className="text-gray-700">
              I can help with triage assessments, vital signs interpretation, and treatment protocols.
            </p>
          </div>
          
          <div className="flex">
            <input
              type="text"
              placeholder="Ask a quick question..."
              className="flex-1 p-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              onClick={handleSendMessage}
              className="bg-indigo-600 p-2 rounded-r-md text-white"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-[90vh] bg-white rounded-xl overflow-hidden">
      <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-indigo-50">
        <div className="flex items-center">
          <div className="bg-indigo-100 p-2 rounded-full mr-3">
            <Bot className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Nurse AI Assistant</h2>
            <p className="text-sm text-gray-500">Helping with triage, protocols, and clinical decisions</p>
          </div>
        </div>
        
        <div className="flex items-center">
          <button 
            className={`p-2 rounded-full mr-2 ${isTextToSpeech ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'}`}
            onClick={toggleSpeech}
            title={isTextToSpeech ? "Disable voice responses" : "Enable voice responses"}
          >
            {isTextToSpeech ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
          </button>
          
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-4 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`rounded-lg p-3 max-w-[80%] ${
                message.role === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-800'
              }`}
            >
              <div className="text-sm">{message.content}</div>
              <div
                className={`text-xs mt-1 text-right ${
                  message.role === 'user' ? 'text-indigo-200' : 'text-gray-400'
                }`}
              >
                {formatTime(message.timestamp)}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 border-t border-gray-200">
        <div className="bg-gray-50 p-2 mb-2 rounded-lg text-gray-700 text-sm">
          <h4 className="font-medium text-xs uppercase text-gray-500 mb-1">Nurse-Specific Quick Prompts</h4>
          <div className="flex flex-wrap gap-2">
            <button
              className="px-2 py-1 bg-indigo-50 border border-indigo-100 rounded-md text-xs text-indigo-700 hover:bg-indigo-100"
              onClick={() => setInput("Triage protocol for chest pain patient")}
            >
              <ClipboardList className="h-3 w-3 inline mr-1" />
              Chest Pain Triage
            </button>
            
            <button
              className="px-2 py-1 bg-indigo-50 border border-indigo-100 rounded-md text-xs text-indigo-700 hover:bg-indigo-100"
              onClick={() => setInput("Normal vital sign ranges for pediatric patients")}
            >
              <Thermometer className="h-3 w-3 inline mr-1" />
              Pediatric Vitals
            </button>
            
            <button
              className="px-2 py-1 bg-indigo-50 border border-indigo-100 rounded-md text-xs text-indigo-700 hover:bg-indigo-100"
              onClick={() => setInput("Medication administration protocol for antibiotics")}
            >
              <Pill className="h-3 w-3 inline mr-1" />
              Antibiotic Admin
            </button>
            
            <button
              className="px-2 py-1 bg-indigo-50 border border-indigo-100 rounded-md text-xs text-indigo-700 hover:bg-indigo-100"
              onClick={() => setInput("How to interpret abnormal blood pressure readings")}
            >
              <BarChart2 className="h-3 w-3 inline mr-1" />
              BP Interpretation
            </button>
            
            <button
              className="px-2 py-1 bg-indigo-50 border border-indigo-100 rounded-md text-xs text-indigo-700 hover:bg-indigo-100"
              onClick={() => setInput("Emergency protocol for anaphylactic reaction")}
            >
              <AlertCircle className="h-3 w-3 inline mr-1" />
              Anaphylaxis Protocol
            </button>
          </div>
        </div>
        
        <div className="flex items-end">
          <textarea
            className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
            placeholder="Type your question here..."
            rows={3}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <div className="flex flex-col bg-gray-50 border-t border-r border-b border-gray-300 rounded-r-lg">
            <button
              className={`p-3 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 ${
                isRecording ? 'bg-red-50 text-red-500' : ''
              }`}
              onClick={toggleRecording}
              title="Voice input"
            >
              <Mic className="h-5 w-5" />
            </button>
            <button
              className="p-3 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 border-t border-gray-300"
              onClick={() => setInput('')}
              title="Clear input"
            >
              <RotateCcw className="h-5 w-5" />
            </button>
            <button
              className="p-3 bg-indigo-600 text-white hover:bg-indigo-700 rounded-br-lg"
              onClick={handleSendMessage}
              title="Send message"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistantPanel; 