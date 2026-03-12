export interface Superviseur {
  id: number;
  name: string;
  email: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: Superviseur;
}

export interface Student {
  id: number;
  superviseurId: number;
  name: string;
  nfcUid: string | null;
}

export interface SessionData {
  sessionId: number;
  studentName: string;
  startTime: string;
  endTime?: string;
  macAddress?: string;
  status: string;
  timeWorked?: number;
}