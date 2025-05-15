export type Segment = 'Agri' | 'Corporate' | 'Others';
export type Status = 'Lead' | 'Enquiry' | 'Formal Meeting' | 'Quote' | 'Won' | 'Loss';
export type TaskStatus = 'Pending' | 'Completed';

export interface Customer {
  id: string;
  name: string;
  number: string;
  location: string;
  meeting_person?: string;
  created_at: string;
}

export interface Enquiry {
  id: string;
  date: string;
  segment: Segment;
  customer_id: string | null;
  customer_name: string;
  number: string;
  location: string;
  meeting_person?: string;
  requirement_details: string;
  status: Status;
  remarks: string;
  reminder_date: string | null;
  assigned_to: 'Amit' | 'Prateek';
  created_at: string;
  show_in_notification?: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  enquiry_id: string;
  status: TaskStatus;
  assigned_to: 'Amit' | 'Prateek';
  due_date: string | null;
  completed_at: string | null;
  created_at: string;

  // Additional fields for UI display (not stored in database)
  enquiry?: Enquiry;
}
