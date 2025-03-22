import React, { useState } from 'react';
import { SendHorizontal, Paperclip, Video } from 'lucide-react';

const ChatInterface: React.FC = () => {
  const [message, setMessage] = useState('');

  // Demo chat messages
  const chatMessages = [
    { 
      id: 1, 
      sender: 'doctor', 
      message: 'Hello! How can I help you today?', 
      time: '10:30 AM',
      avatar: '/doctor-avatar.png',
      name: 'Dr. Sarah Wilson'
    },
    { 
      id: 2, 
      sender: 'patient', 
      message: 'Hi doctor, I\'ve been having headaches lately. What could be causing them?', 
      time: '10:32 AM' 
    },
    { 
      id: 3, 
      sender: 'doctor', 
      message: 'There are many possible causes for headaches including stress, dehydration, lack of sleep, or eye strain. Can you describe when they usually occur and how long they last?', 
      time: '10:35 AM',
      avatar: '/doctor-avatar.png',
      name: 'Dr. Sarah Wilson'
    },
    { 
      id: 4, 
      sender: 'patient', 
      message: 'They usually happen in the afternoon and last for a few hours. I\'ve been working a lot at my computer lately.', 
      time: '10:38 AM' 
    },
    { 
      id: 5, 
      sender: 'doctor', 
      message: 'It sounds like it could be related to eye strain or stress. I\'d recommend taking regular breaks from your computer, staying hydrated, and possibly trying the 20-20-20 rule: every 20 minutes, look at something 20 feet away for 20 seconds. Would you like to schedule a video appointment to discuss this further?', 
      time: '10:42 AM',
      avatar: '/doctor-avatar.png',
      name: 'Dr. Sarah Wilson'
    },
  ];

  const handleSendMessage = () => {
    if (message.trim() === '') return;
    // In a real app, this would send the message to the backend
    console.log('Sending message:', message);
    setMessage('');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center p-4 border-b bg-white">
        <div className="h-10 w-10 rounded-full bg-blue-100 mr-3 flex items-center justify-center text-blue-600 font-semibold">
          SW
        </div>
        <div>
          <p className="font-medium text-gray-900">Dr. Sarah Wilson</p>
          <p className="text-sm text-gray-500">Cardiology</p>
        </div>
        <button className="ml-auto bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm flex items-center">
          <Video className="w-4 h-4 mr-1.5" />
          Start Video Call
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {chatMessages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.sender === 'patient' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'doctor' && (
              <div className="h-8 w-8 rounded-full bg-blue-100 mr-2 flex-shrink-0 flex items-center justify-center text-blue-600 font-semibold">
                SW
              </div>
            )}
            <div 
              className={`max-w-[75%] rounded-lg p-3 ${
                msg.sender === 'patient' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white border border-gray-200'
              }`}
            >
              <p className={msg.sender === 'patient' ? 'text-white' : 'text-gray-800'}>
                {msg.message}
              </p>
              <p className={`text-xs mt-1 text-right ${
                msg.sender === 'patient' ? 'text-blue-200' : 'text-gray-500'
              }`}>
                {msg.time}
              </p>
            </div>
            {msg.sender === 'patient' && (
              <div className="h-8 w-8 rounded-full bg-blue-100 ml-2 flex-shrink-0 flex items-center justify-center text-blue-600 font-semibold">
                YO
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="p-4 border-t bg-white">
        <div className="flex items-center">
          <button className="p-2 rounded-full text-gray-500 hover:bg-gray-100 mr-2">
            <Paperclip className="w-5 h-5" />
          </button>
          <input
            type="text"
            className="flex-1 border border-gray-200 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <button 
            className="p-2 rounded-full bg-blue-600 text-white ml-2"
            onClick={handleSendMessage}
          >
            <SendHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface; 