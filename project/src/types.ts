export interface Appointment {
  id: string;
  startTime: string;
  endTime: string;
  startAddress: string;
  endAddress: string;
  vehicle: string;
  driver: string;
  passengers: string[];
  date: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export interface AppointmentFormData {
  startTime: string;
  endTime: string;
  startAddress: string;
  endAddress: string;
  vehicle: string;
  driver: string;
  passengers: string;
}