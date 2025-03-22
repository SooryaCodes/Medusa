// Define interfaces for type safety
export interface Vital {
  heartRate: number;
  heartRateStatus: 'normal' | 'elevated' | 'low';
  bloodPressure: string;
  bloodPressureStatus: 'normal' | 'elevated' | 'low';
  bloodSugar: string;
  bloodSugarStatus: 'normal' | 'elevated' | 'low';
  temperature: string;
  oxygenLevel: string;
  glucoseLevel: string;
  glucoseLevelStatus: 'normal' | 'elevated' | 'low';
  cholesterol: string;
  cholesterolStatus: 'normal' | 'elevated' | 'low';
}

export interface TestResult {
  name: string;
  date: string;
  status: 'Normal' | 'Abnormal';
  doctor: string;
}

export interface Appointment {
  doctorName: string;
  doctorAvatar?: string;
  date: string;
  time: string;
  specialty: string;
  location: string;
  isVideo: boolean;
  notes?: string;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  timeOfDay: string;
  refillDate: string;
}

export interface BillingInfo {
  id: string;
  date: string;
  service: string;
  amount: number;
  status: 'Paid' | 'Insurance Processing' | 'Pending';
  insurance: string;
}

export interface Patient {
  name: string;
  age: number;
  profilePicture?: string;
  profileCompletion: number;
  nextAppointment: Appointment;
  upcomingAppointments: Appointment[];
  medications: Medication[];
  testResults: TestResult[];
  vitals: Vital;
  billingInfo: BillingInfo[];
}

// Rich dummy data
export const mockPatient: Patient = {
  name: "Soorya Roberts",
  age: 32,
  profilePicture: "/avatar.png",
  profileCompletion: 85,
  nextAppointment: {
    doctorName: "Dr. Sarah Wilson",
    doctorAvatar: "/doctor-avatar.png",
    date: "March 25, 2024",
    time: "10:30 AM",
    specialty: "Cardiology",
    location: "City Medical Center",
    isVideo: true,
    notes: "Follow-up on recent test results"
  },
  upcomingAppointments: [
    {
      doctorName: "Dr. James Chen",
      specialty: "Dermatology",
      date: "April 5, 2024",
      time: "3:15 PM",
      isVideo: false,
      location: "City Medical Center"
    },
    {
      doctorName: "Dr. Maria Gonzalez",
      specialty: "Neurology",
      date: "April 18, 2024",
      time: "11:00 AM",
      isVideo: true,
      location: "Virtual Appointment"
    }
  ],
  medications: [
    {
      name: "Lisinopril",
      dosage: "10mg",
      frequency: "Once daily",
      timeOfDay: "Morning",
      refillDate: "April 10, 2024"
    },
    {
      name: "Atorvastatin",
      dosage: "20mg",
      frequency: "Once daily",
      timeOfDay: "Evening",
      refillDate: "May 5, 2024"
    },
    {
      name: "Metformin",
      dosage: "500mg",
      frequency: "Twice daily",
      timeOfDay: "Morning and Evening",
      refillDate: "April 22, 2024"
    }
  ],
  testResults: [
    {
      name: "Complete Blood Count",
      date: "March 20, 2024",
      status: "Normal",
      doctor: "Dr. Sarah Wilson"
    },
    {
      name: "Lipid Panel",
      date: "March 20, 2024",
      status: "Abnormal",
      doctor: "Dr. Sarah Wilson"
    },
    {
      name: "Electrocardiogram (ECG)",
      date: "February 15, 2024",
      status: "Normal",
      doctor: "Dr. Sarah Wilson"
    }
  ],
  vitals: {
    heartRate: 72,
    heartRateStatus: "normal",
    bloodPressure: "120/80",
    bloodPressureStatus: "normal",
    bloodSugar: "95 mg/dL",
    bloodSugarStatus: "normal",
    temperature: "98.6°F",
    oxygenLevel: "98%",
    glucoseLevel: "95 mg/dL",
    glucoseLevelStatus: "normal",
    cholesterol: "180 mg/dL",
    cholesterolStatus: "normal"
  },
  billingInfo: [
    {
      id: "INV-2024-0342",
      date: "March 15, 2024",
      service: "Cardiology Consultation",
      amount: 150.00,
      status: "Paid",
      insurance: "BlueCross"
    },
    {
      id: "INV-2024-0297",
      date: "February 28, 2024",
      service: "Blood Tests",
      amount: 85.50,
      status: "Insurance Processing",
      insurance: "BlueCross"
    }
  ]
}; 