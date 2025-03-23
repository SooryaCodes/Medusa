import React from 'react';
import { 
  Phone, AlertTriangle, MessageCircle, 
  Stethoscope, FileText, Pill, 
  ClipboardList, Printer, CalendarDays
} from 'lucide-react';

interface QuickActionsPanelProps {
  onEmergencyAlert: () => void;
}

const QuickActionsPanel: React.FC<QuickActionsPanelProps> = ({ onEmergencyAlert }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-base font-medium text-gray-800">Quick Actions</h3>
      
      <div className="grid grid-cols-3 gap-2">
        {/* Emergency Call to Doctor */}
        <button 
          className="p-3 bg-red-50 rounded-lg border border-red-100 hover:bg-red-100 transition-colors flex flex-col items-center justify-center"
          onClick={onEmergencyAlert}
        >
          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mb-1">
            <AlertTriangle className="h-4 w-4 text-white" />
          </div>
          <span className="text-xs text-center font-medium text-red-700">Emergency Alert</span>
        </button>
        
        {/* Call to Doctor */}
        <button className="p-3 bg-blue-50 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors flex flex-col items-center justify-center">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mb-1">
            <Phone className="h-4 w-4 text-white" />
          </div>
          <span className="text-xs text-center font-medium text-blue-700">Call Doctor</span>
        </button>
        
        {/* Message Doctor */}
        <button className="p-3 bg-indigo-50 rounded-lg border border-indigo-100 hover:bg-indigo-100 transition-colors flex flex-col items-center justify-center">
          <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center mb-1">
            <MessageCircle className="h-4 w-4 text-white" />
          </div>
          <span className="text-xs text-center font-medium text-indigo-700">Message</span>
        </button>
        
        {/* Request Specialist */}
        <button className="p-3 bg-purple-50 rounded-lg border border-purple-100 hover:bg-purple-100 transition-colors flex flex-col items-center justify-center">
          <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mb-1">
            <Stethoscope className="h-4 w-4 text-white" />
          </div>
          <span className="text-xs text-center font-medium text-purple-700">Specialist</span>
        </button>
        
        {/* Lab Orders */}
        <button className="p-3 bg-green-50 rounded-lg border border-green-100 hover:bg-green-100 transition-colors flex flex-col items-center justify-center">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mb-1">
            <FileText className="h-4 w-4 text-white" />
          </div>
          <span className="text-xs text-center font-medium text-green-700">Lab Orders</span>
        </button>
        
        {/* Medications */}
        <button className="p-3 bg-cyan-50 rounded-lg border border-cyan-100 hover:bg-cyan-100 transition-colors flex flex-col items-center justify-center">
          <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center mb-1">
            <Pill className="h-4 w-4 text-white" />
          </div>
          <span className="text-xs text-center font-medium text-cyan-700">Medications</span>
        </button>
      </div>
      
      <div className="pt-2 border-t border-gray-100">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Additional Actions</h4>
        <div className="flex flex-wrap gap-2">
          <button className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-xs font-medium text-gray-700 flex items-center">
            <ClipboardList className="h-3.5 w-3.5 mr-1.5" />
            Nurse Notes
          </button>
          
          <button className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-xs font-medium text-gray-700 flex items-center">
            <Printer className="h-3.5 w-3.5 mr-1.5" />
            Print Records
          </button>
          
          <button className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-xs font-medium text-gray-700 flex items-center">
            <CalendarDays className="h-3.5 w-3.5 mr-1.5" />
            Schedule Follow-up
          </button>
        </div>
      </div>
      
      {/* Emergency Protocol Quick Access */}
      <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-100">
        <h4 className="text-sm font-medium text-red-800 mb-2 flex items-center">
          <AlertTriangle className="h-4 w-4 mr-1.5" />
          Emergency Protocols
        </h4>
        <div className="space-y-1">
          <button className="w-full px-3 py-1.5 bg-white hover:bg-red-50 border border-red-100 rounded text-xs font-medium text-gray-700 flex items-center justify-between">
            <span>Code Blue - Cardiac Arrest</span>
            <span className="text-red-500">→</span>
          </button>
          <button className="w-full px-3 py-1.5 bg-white hover:bg-red-50 border border-red-100 rounded text-xs font-medium text-gray-700 flex items-center justify-between">
            <span>Code Red - Fire Emergency</span>
            <span className="text-red-500">→</span>
          </button>
          <button className="w-full px-3 py-1.5 bg-white hover:bg-red-50 border border-red-100 rounded text-xs font-medium text-gray-700 flex items-center justify-between">
            <span>Rapid Response Team</span>
            <span className="text-red-500">→</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickActionsPanel; 