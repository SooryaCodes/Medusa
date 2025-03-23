import React from 'react';
import { DollarSign, CreditCard, FileText, Download, Send, Check, X, AlertCircle, Clock } from 'lucide-react';

interface InsuranceClaim {
  id: number;
  patientName: string;
  procedureCode: string;
  description: string;
  date: string;
  amount: string;
  status: 'approved' | 'pending' | 'rejected';
  insuranceProvider: string;
}

const BillingPanel: React.FC = () => {
  // Mock insurance claims
  const insuranceClaims: InsuranceClaim[] = [
    {
      id: 1,
      patientName: "Soorya Roberts",
      procedureCode: "99214",
      description: "Office Visit - Established Patient",
      date: "Mar 15, 2024",
      amount: "$120.00",
      status: 'approved',
      insuranceProvider: "Blue Cross"
    },
    {
      id: 2,
      patientName: "Meera Patel",
      procedureCode: "85025",
      description: "Complete Blood Count (CBC)",
      date: "Mar 14, 2024",
      amount: "$75.50",
      status: 'pending',
      insuranceProvider: "Aetna"
    },
    {
      id: 3,
      patientName: "Raj Kumar",
      procedureCode: "93000",
      description: "Electrocardiogram (ECG)",
      date: "Mar 10, 2024",
      amount: "$185.25",
      status: 'rejected',
      insuranceProvider: "Medicare"
    },
  ];
  
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Procedure Cost Estimator</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Procedure
            </label>
            <select className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Select a procedure</option>
              <option>Office Visit - New Patient (99203)</option>
              <option>Office Visit - Established Patient (99214)</option>
              <option>Complete Blood Count (85025)</option>
              <option>Comprehensive Metabolic Panel (80053)</option>
              <option>Lipid Panel (80061)</option>
              <option>Electrocardiogram (93000)</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Patient's Insurance
            </label>
            <select className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Select insurance provider</option>
              <option>Blue Cross Blue Shield</option>
              <option>Aetna</option>
              <option>UnitedHealthcare</option>
              <option>Cigna</option>
              <option>Medicare</option>
              <option>Medicaid</option>
              <option>No Insurance</option>
            </select>
          </div>
          
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium">
            Calculate Estimate
          </button>
          
          <div className="mt-6 bg-blue-50 border border-blue-100 rounded-lg p-4">
            <h3 className="font-medium text-blue-800 mb-2">Cost Breakdown</h3>
            
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-gray-600">Procedure Fee:</div>
              <div className="text-right font-semibold">$120.00</div>
              
              <div className="text-gray-600">Insurance Coverage:</div>
              <div className="text-right font-semibold">-$96.00</div>
              
              <div className="text-gray-600">Patient Co-Pay:</div>
              <div className="text-right font-semibold">$20.00</div>
              
              <div className="text-gray-600 pt-2 border-t font-medium">Estimated Patient Cost:</div>
              <div className="text-right font-bold text-blue-800 pt-2 border-t">$44.00</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Generate Medical Report</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Patient
            </label>
            <select className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Select a patient</option>
              <option>Soorya Roberts</option>
              <option>Meera Patel</option>
              <option>Raj Kumar</option>
              <option>David Wilson</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Report Type
            </label>
            <select className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Select report type</option>
              <option>Consultation Summary</option>
              <option>Discharge Summary</option>
              <option>Follow-up Report</option>
              <option>Lab Results Report</option>
              <option>Medical Certificate</option>
              <option>Insurance Claim Form</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Include
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" defaultChecked />
                <span className="ml-2 text-sm text-gray-700">Diagnosis</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" defaultChecked />
                <span className="ml-2 text-sm text-gray-700">Treatment Plan</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" defaultChecked />
                <span className="ml-2 text-sm text-gray-700">Medication List</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" />
                <span className="ml-2 text-sm text-gray-700">Lab Results</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" />
                <span className="ml-2 text-sm text-gray-700">Imaging Studies</span>
              </label>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium flex items-center justify-center">
              <Download className="h-4 w-4 mr-1.5" />
              Generate PDF
            </button>
            
            <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium flex items-center justify-center">
              <Send className="h-4 w-4 mr-1.5" />
              Email to Patient
            </button>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Recent Insurance Claims</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-sm font-medium text-gray-600">
                <th className="p-4">Patient</th>
                <th className="p-4">Procedure</th>
                <th className="p-4">Date</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Insurance</th>
                <th className="p-4">Status</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {insuranceClaims.map(claim => (
                <tr key={claim.id} className="border-t">
                  <td className="p-4 font-medium">{claim.patientName}</td>
                  <td className="p-4">
                    <div>
                      <p>{claim.description}</p>
                      <p className="text-gray-500 text-xs">Code: {claim.procedureCode}</p>
                    </div>
                  </td>
                  <td className="p-4">{claim.date}</td>
                  <td className="p-4 font-medium">{claim.amount}</td>
                  <td className="p-4">{claim.insuranceProvider}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      claim.status === 'approved' ? 'bg-green-100 text-green-800 border border-green-200' :
                      claim.status === 'pending' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                      'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                      <span className="flex items-center">
                        {claim.status === 'approved' ? 
                          <Check className="h-3 w-3 mr-1" /> :
                         claim.status === 'pending' ? 
                          <Clock className="h-3 w-3 mr-1" /> :
                          <X className="h-3 w-3 mr-1" />
                        }
                        {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                      </span>
                    </span>
                  </td>
                  <td className="p-4">
                    <button className="text-blue-600 hover:text-blue-800 text-sm underline">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="mt-6 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Insurance Verification</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-2">
            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Patient ID or Name
                </label>
                <button className="text-blue-600 hover:text-blue-800 text-xs">
                  Scan Insurance Card
                </button>
              </div>
              <input 
                type="text" 
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter patient ID or name"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Insurance Provider
              </label>
              <select className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Select insurance provider</option>
                <option>Blue Cross Blue Shield</option>
                <option>Aetna</option>
                <option>UnitedHealthcare</option>
                <option>Cigna</option>
                <option>Medicare</option>
                <option>Medicaid</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Member ID
              </label>
              <input 
                type="text" 
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter member ID from insurance card"
              />
            </div>
            
            <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium">
              Verify Coverage
            </button>
          </div>
          
          <div>
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 mb-4">
              <div className="flex items-center text-amber-800 mb-2">
                <AlertCircle className="h-5 w-5 mr-2" />
                <h3 className="font-medium">Coverage Alert</h3>
              </div>
              <p className="text-sm text-amber-700">
                Some procedures may require pre-authorization from insurance provider.
              </p>
            </div>
            
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
              <h3 className="font-medium text-blue-800 mb-3">Quick Verification Steps</h3>
              <ol className="list-decimal pl-4 text-sm text-blue-700 space-y-1">
                <li>Enter patient details</li>
                <li>Select insurance provider</li>
                <li>Enter member ID exactly as shown on card</li>
                <li>Click Verify Coverage</li>
                <li>Review coverage summary</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingPanel;