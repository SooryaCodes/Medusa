import React, { useState } from 'react';
import { Bot, X, Send, Mic, ClipboardList, Download, Pill, AlertCircle } from 'lucide-react';

interface AIAssistantPanelProps {
  onClose: () => void;
}

const AIAssistantPanel: React.FC<AIAssistantPanelProps> = ({ onClose }) => {
  const [input, setInput] = useState('');
  const [isVoiceInput, setIsVoiceInput] = useState(false);
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      type: 'assistant', 
      content: "Hello, I'm your AI medical assistant. How can I help you today?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  
  const handleSendMessage = () => {
    if (input.trim() === '') return;
    
    const newUserMessage = {
      id: messages.length + 1,
      type: 'user',
      content: input,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages([...messages, newUserMessage]);
    setInput('');
    
    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: messages.length + 2,
        type: 'assistant',
        content: "I'm analyzing your query. Here's what I found based on medical literature and guidelines...",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prevMessages => [...prevMessages, aiResponse]);
    }, 1000);
  };
  
  const toggleVoiceInput = () => {
    setIsVoiceInput(!isVoiceInput);
    
    // Just for simulation - would implement actual voice recognition
    if (!isVoiceInput) {
      setTimeout(() => {
        setIsVoiceInput(false);
      }, 3000);
    }
  };
  
  return (
    <div className="bg-white rounded-xl overflow-hidden h-[600px] flex flex-col">
      <div className="bg-indigo-600 text-white p-4 flex justify-between items-center">
        <div className="flex items-center">
          <div className="h-8 w-8 bg-white rounded-full flex items-center justify-center mr-3">
            <Bot className="h-5 w-5 text-indigo-600" />
          </div>
          <h2 className="font-semibold">AI Medical Assistant</h2>
        </div>
        <button 
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-indigo-700"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`mb-4 flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-3/4 rounded-lg p-3 ${
              message.type === 'user' 
                ? 'bg-blue-600 text-white ml-12' 
                : 'bg-white border border-gray-200 mr-12'
            }`}>
              <div className="text-sm">{message.content}</div>
              <div className={`text-xs mt-1 text-right ${
                message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {message.time}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-2 border-t">
        <div className="bg-gray-50 p-2 mb-2 rounded-lg text-gray-700 text-sm">
          <h4 className="font-medium text-xs uppercase text-gray-500 mb-1">Quick Prompts</h4>
          <div className="flex flex-wrap gap-2">
            <button
              className="px-2 py-1 bg-indigo-50 border border-indigo-100 rounded-md text-xs text-indigo-700 hover:bg-indigo-100"
              onClick={() => setInput("Check drug interactions for Lisinopril and Amlodipine")}
            >
              <Pill className="h-3 w-3 inline mr-1" />
              Drug Interactions
            </button>
            
            <button
              className="px-2 py-1 bg-indigo-50 border border-indigo-100 rounded-md text-xs text-indigo-700 hover:bg-indigo-100"
              onClick={() => setInput("Summarize latest guidelines for hypertension treatment")}
            >
              <ClipboardList className="h-3 w-3 inline mr-1" />
              Treatment Guidelines
            </button>
            
            <button
              className="px-2 py-1 bg-indigo-50 border border-indigo-100 rounded-md text-xs text-indigo-700 hover:bg-indigo-100"
              onClick={() => setInput("Analyze possible causes of headache with elevated blood pressure")}
            >
              <AlertCircle className="h-3 w-3 inline mr-1" />
              Symptom Analysis
            </button>
          </div>
        </div>
        
        <div className="flex items-center">
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about medical conditions, treatments, or guidelines..."
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-10"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSendMessage();
                }
              }}
            />
            {isVoiceInput && (
              <div className="absolute inset-0 bg-indigo-50 border border-indigo-200 rounded-lg flex items-center justify-center">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></div>
                  <span className="text-indigo-800 text-sm">Listening...</span>
                </div>
              </div>
            )}
          </div>
          
          <button
            onClick={toggleVoiceInput}
            className={`p-2 rounded-full ml-2 ${
              isVoiceInput
                ? 'bg-red-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Mic className="h-5 w-5" />
          </button>
          
          <button
            onClick={handleSendMessage}
            disabled={input.trim() === ''}
            className="p-2 rounded-full ml-2 bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      <div className="p-2 border-t bg-gray-50 text-xs text-gray-500 text-center">
        AI recommendations are meant to assist clinical decision-making and not replace professional medical judgment.
      </div>
    </div>
  );
};

export default AIAssistantPanel; 