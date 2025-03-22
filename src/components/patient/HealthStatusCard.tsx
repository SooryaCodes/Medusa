import React from 'react';
import { Activity, Heart, Droplets, Thermometer } from 'lucide-react';
import { Vital } from '@/data/patientData';

interface HealthStatusCardProps {
  vitals: Vital;
}

const HealthStatusCard: React.FC<HealthStatusCardProps> = ({ vitals }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="flex items-center p-2 rounded-lg">
        <div className="bg-red-100 p-2 rounded-full mr-3 flex-shrink-0">
          <Heart className="h-5 w-5 text-red-600" />
        </div>
        <div>
          <p className="text-xs text-gray-500">Heart Rate</p>
          <div className="flex items-baseline">
            <p className="text-lg font-bold text-gray-900">{vitals.heartRate}</p>
            <p className="ml-1 text-xs text-gray-600">BPM</p>
          </div>
          <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs ${
            vitals.heartRateStatus === 'normal' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-amber-100 text-amber-800'
          }`}>
            {vitals.heartRateStatus}
          </span>
        </div>
      </div>

      <div className="flex items-center p-2 rounded-lg">
        <div className="bg-blue-100 p-2 rounded-full mr-3 flex-shrink-0">
          <Activity className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <p className="text-xs text-gray-500">Blood Pressure</p>
          <div className="flex items-baseline">
            <p className="text-lg font-bold text-gray-900">{vitals.bloodPressure}</p>
            <p className="ml-1 text-xs text-gray-600">mmHg</p>
          </div>
          <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs ${
            vitals.bloodPressureStatus === 'normal' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-amber-100 text-amber-800'
          }`}>
            {vitals.bloodPressureStatus}
          </span>
        </div>
      </div>

      <div className="flex items-center p-2 rounded-lg">
        <div className="bg-purple-100 p-2 rounded-full mr-3 flex-shrink-0">
          <Droplets className="h-5 w-5 text-purple-600" />
        </div>
        <div>
          <p className="text-xs text-gray-500">Blood Sugar</p>
          <div className="flex items-baseline">
            <p className="text-lg font-bold text-gray-900">{vitals.bloodSugar.split(' ')[0]}</p>
            <p className="ml-1 text-xs text-gray-600">mg/dL</p>
          </div>
          <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs ${
            vitals.bloodSugarStatus === 'normal' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-amber-100 text-amber-800'
          }`}>
            {vitals.bloodSugarStatus}
          </span>
        </div>
      </div>

      <div className="flex items-center p-2 rounded-lg">
        <div className="bg-amber-100 p-2 rounded-full mr-3 flex-shrink-0">
          <Thermometer className="h-5 w-5 text-amber-600" />
        </div>
        <div>
          <p className="text-xs text-gray-500">Temperature</p>
          <div className="flex items-baseline">
            <p className="text-lg font-bold text-gray-900">{vitals.temperature.split('°')[0]}</p>
            <p className="ml-1 text-xs text-gray-600">°F</p>
          </div>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-green-100 text-green-800">
            normal
          </span>
        </div>
      </div>
    </div>
  );
};

export default HealthStatusCard; 