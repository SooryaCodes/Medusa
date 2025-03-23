export interface MedicalRecord {
  id: number;
  date: string;
  title: string;
  doctor: string;
  type: 'visit' | 'lab' | 'procedure' | 'note';
  details: string;
}

export interface Patient {
  id: number;
  name: string;
  age: number;
  gender: string;
  dob?: string;
  profilePicture?: string;
  phone?: string;
  email?: string;
  address?: string;
  insurance?: string;
  allergies?: string[];
  chronicConditions?: string[];
  medications?: {
    name: string;
    dosage: string;
    frequency: string;
  }[];
  records?: MedicalRecord[];
  // Properties for queue display
  reason?: string;
  waitTime?: string;
  severity?: 'low' | 'medium' | 'high' | 'emergency';
  isWalkIn?: boolean;
} 