import React, { useState, useEffect } from 'react';
import { Heart, Thermometer, Droplet, Activity, Wind, Smartphone, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';

interface VitalSignsProps {
  patient: {
    id: number;
    name: string;
    vitalSigns?: {
      bloodPressure: string;
      heartRate: number;
      oxygenSaturation: number;
      temperature: number;
      respiratoryRate: number;
    }
  };
  onSave: (patientId: number, vitalSigns: any) => void;
}

const VitalSignsPanel: React.FC<VitalSignsProps> = ({ patient, onSave }) => {
  const [vitalSigns, setVitalSigns] = useState({
    bloodPressure: patient.vitalSigns?.bloodPressure || '',
    heartRate: patient.vitalSigns?.heartRate || 0,
    oxygenSaturation: patient.vitalSigns?.oxygenSaturation || 0,
    temperature: patient.vitalSigns?.temperature || 0,
    respiratoryRate: patient.vitalSigns?.respiratoryRate || 0
  });
  
  const [autoSync, setAutoSync] = useState(false);
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  const [aiAnalysis, setAIAnalysis] = useState('');
  
  // Simulate auto-sync with medical devices
  useEffect(() => {
    if (autoSync) {
      const interval = setInterval(() => {
        // Simulate receiving data from connected medical devices
        setVitalSigns({
          bloodPressure: `${Math.floor(110 + Math.random() * 30)}/${Math.floor(70 + Math.random() * 20)}`,
          heartRate: Math.floor(60 + Math.random() * 40),
          oxygenSaturation: Math.floor(94 + Math.random() * 6),
          temperature: Number((36.5 + Math.random() * 1.5).toFixed(1)),
          respiratoryRate: Math.floor(12 + Math.random() * 8)
        });
      }, 5000); // Update every 5 seconds

      return () => clearInterval(interval);
    }
  }, [autoSync]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setVitalSigns(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSaveVitals = () => {
    onSave(patient.id, vitalSigns);
    
    // Simulate AI analysis based on vitals
    const analysis = analyzeVitals(vitalSigns);
    setAIAnalysis(analysis);
    setShowAIAnalysis(true);
  };
  
  // Simple function to analyze vitals
  const analyzeVitals = (vitals: any) => {
    let concerns = [];
    let severity = 'normal';
    
    if (vitals.heartRate > 100) concerns.push('Elevated heart rate');
    if (vitals.heartRate < 60) concerns.push('Low heart rate');
    if (vitals.oxygenSaturation < 95) concerns.push('Decreased oxygen saturation');
    if (vitals.temperature > 38) concerns.push('Fever');
    if (vitals.respiratoryRate > 20) concerns.push('Tachypnea');
    
    // Determine severity
    if (
      vitals.heartRate > 120 || 
      vitals.heartRate < 50 || 
      vitals.oxygenSaturation < 90 || 
      vitals.temperature > 39 ||
      vitals.respiratoryRate > 24
    ) {
      severity = 'critical';
    } else if (concerns.length > 0) {
      severity = 'moderate';
    }
    
    if (concerns.length === 0) {
      return "All vital signs appear within normal ranges. Patient is stable.";
    } else {
      return `${severity === 'critical' ? 'CRITICAL ALERT: ' : ''}Detected concerns: ${concerns.join(', ')}. Recommend ${severity === 'critical' ? 'immediate physician consultation' : 'monitoring and reassessment'}.`;
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-medium text-gray-800">Vital Signs Entry</h3>
        <div className="flex items-center">
          <label className="flex items-center cursor-pointer">
            <div className="relative">
              <input 
                type="checkbox" 
                className="sr-only" 
                checked={autoSync}
                onChange={() => setAutoSync(!autoSync)}
              />
              <div className={`block w-10 h-6 rounded-full ${autoSync ? 'bg-green-400' : 'bg-gray-300'}`}></div>
              <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${autoSync ? 'transform translate-x-4' : ''}`}></div>
            </div>
            <div className="ml-2 text-sm font-medium text-gray-700 flex items-center">
              <Smartphone className="h-4 w-4 mr-1" />
              Auto-Sync with Devices
            </div>
          </label>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <Droplet className="h-5 w-5 text-red-500 mr-2" />
            <label className="text-sm font-medium text-gray-700">Blood Pressure (mmHg)</label>
          </div>
          <input
            type="text"
            name="bloodPressure"
            value={vitalSigns.bloodPressure}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g. 120/80"
            disabled={autoSync}
          />
        </div>
        
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <Heart className="h-5 w-5 text-red-500 mr-2" />
            <label className="text-sm font-medium text-gray-700">Heart Rate (BPM)</label>
          </div>
          <input
            type="number"
            name="heartRate"
            value={vitalSigns.heartRate}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g. 75"
            disabled={autoSync}
          />
        </div>
        
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <Activity className="h-5 w-5 text-blue-500 mr-2" />
            <label className="text-sm font-medium text-gray-700">Oxygen Saturation (%)</label>
          </div>
          <input
            type="number"
            name="oxygenSaturation"
            value={vitalSigns.oxygenSaturation}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g. 98"
            disabled={autoSync}
          />
        </div>
        
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <Thermometer className="h-5 w-5 text-orange-500 mr-2" />
            <label className="text-sm font-medium text-gray-700">Temperature (°C)</label>
          </div>
          <input
            type="number"
            name="temperature"
            value={vitalSigns.temperature}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g. 37.0"
            step="0.1"
            disabled={autoSync}
          />
        </div>
        
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <Wind className="h-5 w-5 text-purple-500 mr-2" />
            <label className="text-sm font-medium text-gray-700">Respiratory Rate (breaths/min)</label>
          </div>
          <input
            type="number"
            name="respiratoryRate"
            value={vitalSigns.respiratoryRate}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g. 16"
            disabled={autoSync}
          />
        </div>
      </div>
      
      <div className="flex justify-end">
        <button 
          onClick={handleSaveVitals}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Save Vital Signs
        </button>
      </div>
      
      {showAIAnalysis && (
        <div className={`mt-6 p-4 rounded-lg border ${
          aiAnalysis.includes('CRITICAL ALERT') 
            ? 'bg-red-50 border-red-200 text-red-800' 
            : aiAnalysis.includes('concerns') 
              ? 'bg-amber-50 border-amber-200 text-amber-800'
              : 'bg-green-50 border-green-200 text-green-800'
        }`}>
          <div className="flex items-start">
            <div className={`p-2 rounded-full mr-3 ${
              aiAnalysis.includes('CRITICAL ALERT') 
                ? 'bg-red-100 text-red-600' 
                : aiAnalysis.includes('concerns') 
                  ? 'bg-amber-100 text-amber-600'
                  : 'bg-green-100 text-green-600'
            }`}>
              {aiAnalysis.includes('CRITICAL ALERT') 
                ? <AlertTriangle className="h-5 w-5" /> 
                : aiAnalysis.includes('concerns') 
                  ? <AlertCircle className="h-5 w-5" />
                  : <CheckCircle className="h-5 w-5" />
              }
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-1">AI Assessment</h4>
              <p className="text-sm">{aiAnalysis}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VitalSignsPanel; 