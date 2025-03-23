import React, { useState, useRef, useEffect } from 'react';
import { SendHorizontal, Paperclip, Video, Bot, User, Mic, X } from 'lucide-react';

const ChatInterface: React.FC = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      sender: 'ai', 
      message: 'Hello! I\'m your AI health assistant. How can I help you today?', 
      time: '10:30 AM',
      avatar: '/ai-avatar.png',
      name: 'HealthBot'
    },
    { 
      id: 2, 
      sender: 'user', 
      message: 'I\'ve been having headaches lately. What could be causing them?', 
      time: '10:32 AM' 
    },
    { 
      id: 3, 
      sender: 'ai', 
      message: 'There are many possible causes for headaches including stress, dehydration, lack of sleep, or eye strain. Can you describe when they usually occur and how long they last?', 
      time: '10:35 AM',
      avatar: '/ai-avatar.png',
      name: 'HealthBot'
    },
    { 
      id: 4, 
      sender: 'user', 
      message: 'They usually happen in the afternoon and last for a few hours. I\'ve been working a lot at my computer lately.', 
      time: '10:38 AM' 
    },
    { 
      id: 5, 
      sender: 'ai', 
      message: 'It sounds like it could be related to eye strain or stress. I\'d recommend taking regular breaks from your computer, staying hydrated, and possibly trying the 20-20-20 rule: every 20 minutes, look at something 20 feet away for 20 seconds. Would you like me to suggest some exercises that might help?', 
      time: '10:42 AM',
      avatar: '/ai-avatar.png',
      name: 'HealthBot'
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const handleSendMessage = () => {
    if (message.trim() === '') return;
    
    // Add user message
    const newUserMessage = {
      id: messages.length + 1,
      sender: 'user',
      message: message.trim(),
      time: formatTime()
    };
    
    setMessages([...messages, newUserMessage]);
    setMessage('');
    setIsLoading(true);
    
    // Using proper AI responses based on user input
    setTimeout(() => {
      let aiResponseText = '';
      const userMsg = message.toLowerCase();
      
      if (userMsg.includes('headache') || userMsg.includes('pain')) {
        aiResponseText = "Headaches can have many causes including stress, dehydration, lack of sleep, or underlying conditions. How long have you been experiencing this symptom? Has anything helped relieve the pain?";
      } else if (userMsg.includes('cold') || userMsg.includes('fever') || userMsg.includes('flu')) {
        aiResponseText = "Common cold and flu symptoms should be managed with rest, fluids, and over-the-counter medications for fever and pain. If symptoms persist beyond 7-10 days or worsen suddenly, it's recommended to consult a healthcare provider.";
      } else if (userMsg.includes('sleep') || userMsg.includes('insomnia')) {
        aiResponseText = "Sleep problems can significantly impact your health. Try establishing a regular sleep schedule, creating a restful environment, limiting screen time before bed, and avoiding caffeine in the afternoon. Would you like more specific recommendations?";
      } else if (userMsg.includes('diet') || userMsg.includes('nutrition') || userMsg.includes('eating')) {
        aiResponseText = "A balanced diet is crucial for good health. Focus on whole foods, plenty of fruits and vegetables, lean proteins, and whole grains. Would you like some specific dietary recommendations based on your health goals?";
      } else if (userMsg.includes('stress') || userMsg.includes('anxiety')) {
        aiResponseText = "Stress management is important for both mental and physical health. Regular exercise, meditation, deep breathing exercises, and adequate sleep can all help. Would you like to learn some specific relaxation techniques?";
      } else {
        aiResponseText = `I understand your question about "${message.trim()}". This is general health information, and I recommend consulting with a healthcare professional for personalized advice. Can I help you with anything specific?`;
      }
      
      const aiResponse = {
        id: messages.length + 2,
        sender: 'ai',
        message: aiResponseText,
        time: formatTime(),
        avatar: '/ai-avatar.png',
        name: 'HealthBot'
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const toggleVoiceInput = () => {
    setIsListening(!isListening);
    // Voice recognition would be implemented here
    if (!isListening) {
      // Start listening
      setTimeout(() => {
        setIsListening(false);
      }, 5000);
    }
  };

  const clearChat = () => {
    if (window.confirm('Are you sure you want to clear the chat history?')) {
      setMessages([{ 
        id: 1, 
        sender: 'ai', 
        message: 'Hello! I\'m your AI health assistant. How can I help you today?', 
        time: formatTime(),
        avatar: '/ai-avatar.png',
        name: 'HealthBot'
      }]);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between p-3 sm:p-4 border-b bg-white">
        <div className="flex items-center">
          <div className="h-9 w-9 rounded-full bg-blue-600 mr-3 flex items-center justify-center text-white font-semibold">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <p className="font-medium text-gray-900">HealthBot AI</p>
            <p className="text-xs text-green-600 flex items-center">
              <span className="h-2 w-2 bg-green-500 rounded-full mr-1.5"></span>
              Online
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={clearChat}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
            title="Clear chat"
          >
            <X className="w-4 h-4" />
          </button>
          <button className="hidden sm:flex bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm items-center">
            <Video className="w-4 h-4 mr-1.5" />
            Talk to a Doctor
          </button>
        </div>
      </div>

      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 bg-gray-50"
      >
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'ai' && (
              <div className="h-8 w-8 rounded-full bg-blue-600 mr-2 flex-shrink-0 flex items-center justify-center text-white">
                <Bot className="h-4 w-4" />
              </div>
            )}
            <div 
              className={`max-w-[80%] sm:max-w-[75%] rounded-lg p-3 ${
                msg.sender === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-white border border-gray-200 rounded-tl-none'
              }`}
            >
              {msg.sender === 'ai' && (
                <p className="text-xs text-blue-600 font-medium mb-1">{msg.name}</p>
              )}
              <p className={msg.sender === 'user' ? 'text-white text-sm sm:text-base' : 'text-gray-800 text-sm sm:text-base'}>
                {msg.message}
              </p>
              <p className={`text-xs mt-1 text-right ${
                msg.sender === 'user' ? 'text-blue-200' : 'text-gray-500'
              }`}>
                {msg.time}
              </p>
            </div>
            {msg.sender === 'user' && (
              <div className="h-8 w-8 rounded-full bg-gray-200 ml-2 flex-shrink-0 flex items-center justify-center">
                <User className="h-4 w-4 text-gray-600" />
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="h-8 w-8 rounded-full bg-blue-600 mr-2 flex-shrink-0 flex items-center justify-center text-white">
              <Bot className="h-4 w-4" />
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-3 rounded-tl-none">
              <div className="flex space-x-1.5">
                <div className="h-2.5 w-2.5 bg-gray-300 rounded-full animate-pulse"></div>
                <div className="h-2.5 w-2.5 bg-gray-300 rounded-full animate-pulse delay-150"></div>
                <div className="h-2.5 w-2.5 bg-gray-300 rounded-full animate-pulse delay-300"></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 sm:p-4 border-t bg-white">
        <div className="flex items-center">
          <button className="p-2 rounded-full text-gray-500 hover:bg-gray-100 mr-1 sm:mr-2">
            <Paperclip className="w-5 h-5" />
          </button>
          <button 
            className={`p-2 rounded-full mr-1 sm:mr-2 ${isListening ? 'bg-red-100 text-red-500' : 'text-gray-500 hover:bg-gray-100'}`}
            onClick={toggleVoiceInput}
          >
            <Mic className="w-5 h-5" />
          </button>
          <div className="relative flex-1">
            <input
              type="text"
              className="w-full border border-gray-200 rounded-full px-4 py-2.5 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              placeholder={isListening ? "Listening..." : "Ask me anything about your health..."}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={isListening}
            />
            {message.trim() !== '' && (
              <button 
                className="absolute right-1 top-1/2 transform -translate-y-1/2 p-1.5 rounded-full bg-blue-600 text-white"
                onClick={handleSendMessage}
              >
                <SendHorizontal className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        <div className="mt-2 text-xs text-center text-gray-500">
          HealthBot provides general information and is not a substitute for professional medical advice
        </div>
      </div>
    </div>
  );
};

export default ChatInterface; 