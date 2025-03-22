import React from 'react';
import { Heart as HeartIcon, Activity, Droplets, Thermometer } from 'lucide-react';
import { Vital } from '@/data/patientData';

interface VitalsDisplayProps {
  vitals: Vital;
}

const VitalsDisplay: React.FC<VitalsDisplayProps> = ({ vitals }) => {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-red-100 p-2 rounded-full mr-3">
                <HeartIcon className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Heart Rate</p>
                <p className="text-xl font-semibold text-gray-900">{vitals.heartRate} <span className="text-sm font-normal">BPM</span></p>
              </div>
            </div>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              vitals.heartRateStatus === 'normal' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {vitals.heartRateStatus}
            </span>
          </div>
          <div className="mt-3">
            <div className="h-10 bg-red-50 rounded-md relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VitalsDisplay; 