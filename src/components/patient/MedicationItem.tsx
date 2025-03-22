import React from 'react';
import { Bell, Clock } from 'lucide-react';

interface MedicationItemProps {
  medication: any;
}

const MedicationItem: React.FC<MedicationItemProps> = ({ medication }) => {
  return (
    <div className="p-4 border rounded-lg bg-white hover:border-blue-300 hover:bg-blue-50/30 transition-all">
      <div className="flex justify-between">
        <div>
          <div className="flex items-center">
            <h4 className="font-semibold text-gray-900">{medication.name}</h4>
            <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md text-xs font-medium">{medication.dosage}</span>
          </div>
          <p className="text-gray-600 text-sm mt-1">{medication.frequency} • {medication.timeOfDay}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Refill by</p>
          <p className="font-medium text-blue-700">{medication.refillDate}</p>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
        <div className="flex space-x-2">
          <button className="border border-blue-200 text-blue-700 px-3 py-1.5 rounded-md text-sm bg-white hover:bg-blue-50">
            Request Refill
          </button>
          <button className="text-gray-600 px-3 py-1.5 rounded-md text-sm hover:bg-gray-50">
            View Details
          </button>
        </div>
        <button className="p-2 text-gray-500 flex items-center justify-center hover:bg-gray-100 rounded-full">
          <Bell className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default MedicationItem; 