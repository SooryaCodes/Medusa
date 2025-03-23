// Mock data for doctor profiles and information

export interface Doctor {
  id: number;
  name: string;
  specialty: string;
  hospital: string;
  department: string;
  yearsOfExperience: number;
  profilePicture?: string;
  email: string;
  phone: string;
  consultationHours: string;
  education: string[];
  certifications: string[];
  languages: string[];
}

export const mockDoctor: Doctor = {
  id: 1,
  name: "Michael Chen",
  specialty: "Cardiology",
  hospital: "City Medical Center",
  department: "Cardiovascular Medicine",
  yearsOfExperience: 12,
  profilePicture: "/doctor-avatar.png",
  email: "dr.chen@citymedical.com",
  phone: "(555) 987-6543",
  consultationHours: "Mon-Fri: 9:00 AM - 5:00 PM",
  education: [
    "MD, Harvard Medical School",
    "Residency in Internal Medicine, Mass General Hospital",
    "Fellowship in Cardiology, Stanford Medical Center"
  ],
  certifications: [
    "American Board of Internal Medicine",
    "American Board of Cardiology",
    "Advanced Cardiac Life Support (ACLS)"
  ],
  languages: ["English", "Mandarin", "Spanish"]
};

export const doctors: Doctor[] = [
  mockDoctor,
  {
    id: 2,
    name: "Sarah Wilson",
    specialty: "Family Medicine",
    hospital: "City Medical Center",
    department: "Primary Care",
    yearsOfExperience: 8,
    email: "dr.wilson@citymedical.com",
    phone: "(555) 234-5678",
    consultationHours: "Mon, Wed, Fri: 8:00 AM - 6:00 PM",
    education: [
      "MD, Johns Hopkins University",
      "Residency in Family Medicine, UCSF Medical Center"
    ],
    certifications: [
      "American Board of Family Medicine",
      "Advanced Life Support (ALS)"
    ],
    languages: ["English", "French"]
  },
  {
    id: 3,
    name: "Raj Patel",
    specialty: "Neurology",
    hospital: "City Medical Center",
    department: "Neuroscience",
    yearsOfExperience: 15,
    email: "dr.patel@citymedical.com",
    phone: "(555) 876-5432",
    consultationHours: "Tue, Thu: 9:00 AM - 4:00 PM",
    education: [
      "MD, University of Pennsylvania",
      "Residency in Neurology, Mayo Clinic",
      "Fellowship in Epilepsy, Cleveland Clinic"
    ],
    certifications: [
      "American Board of Neurology",
      "Clinical Neurophysiology Certification"
    ],
    languages: ["English", "Hindi", "Gujarati"]
  }
];

// Doctor schedule and availability
export const doctorSchedule = {
  availableSlots: [
    { date: "2024-03-25", slots: ["9:00 AM", "10:00 AM", "2:00 PM", "3:00 PM", "4:00 PM"] },
    { date: "2024-03-26", slots: ["9:00 AM", "11:00 AM", "1:00 PM", "3:00 PM"] },
    { date: "2024-03-27", slots: ["10:00 AM", "11:00 AM", "1:00 PM", "2:00 PM", "4:00 PM"] },
    { date: "2024-03-28", slots: ["9:00 AM", "10:00 AM", "2:00 PM", "3:00 PM"] },
    { date: "2024-03-29", slots: ["9:00 AM", "11:00 AM", "1:00 PM", "3:00 PM", "4:00 PM"] }
  ],
  blockedTime: [
    { date: "2024-03-26", time: "2:00 PM - 5:00 PM", reason: "Staff Meeting" },
    { date: "2024-03-28", time: "11:00 AM - 1:00 PM", reason: "Hospital Rounds" }
  ],
  timeOff: [
    { startDate: "2024-04-10", endDate: "2024-04-17", reason: "Vacation" }
  ]
};

// Performance metrics for doctor dashboard
export const doctorMetrics = {
  patientsSeenToday: 12,
  totalPatientsThisWeek: 58,
  averageConsultationTime: "18 mins",
  patientSatisfaction: 4.8,
  reportsCompleted: 42,
  reportsOutstanding: 3,
  followUpReminders: 8
};

// Notification types for doctor dashboard
export interface DoctorNotification {
  id: number;
  type: 'lab' | 'appointment' | 'message' | 'alert' | 'system';
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  actionRequired?: boolean;
  link?: string;
}

export const doctorNotifications: DoctorNotification[] = [
  {
    id: 1,
    type: 'lab',
    title: 'Lab Results Available',
    message: 'New lab results for Soorya Roberts are ready for review.',
    time: '10 mins ago',
    isRead: false,
    priority: 'medium',
    actionRequired: true,
    link: '/lab-results/123'
  },
  {
    id: 2,
    type: 'appointment',
    title: 'New Appointment Request',
    message: 'Meera Patel has requested an appointment for March 30.',
    time: '25 mins ago',
    isRead: false,
    priority: 'low',
    actionRequired: true,
    link: '/appointments/requests'
  },
  {
    id: 3,
    type: 'alert',
    title: 'Medication Interaction Warning',
    message: 'Potential adverse interaction detected in Raj Kumar\'s prescription.',
    time: '1 hour ago',
    isRead: true,
    priority: 'high',
    actionRequired: true,
    link: '/patients/456/prescriptions'
  },
  {
    id: 4,
    type: 'message',
    title: 'Message from Nurse',
    message: 'Nurse Johnson has a question about David Wilson\'s treatment plan.',
    time: '2 hours ago',
    isRead: true,
    priority: 'medium',
    link: '/messages/789'
  },
  {
    id: 5,
    type: 'system',
    title: 'System Maintenance',
    message: 'EHR system will be undergoing maintenance tonight from 2-4 AM.',
    time: '5 hours ago',
    isRead: true,
    priority: 'low',
    link: '/announcements'
  }
]; 