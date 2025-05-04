export type Segment = 'Agri' | 'Corporate' | 'Others';
export type Status = 'Lead' | 'Enquiry' | 'Quote' | 'Won' | 'Loss';

export interface Customer {
  id: string;
  name: string;
  number: string;
  location: string;
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
  requirement_details: string;
  status: Status;
  remarks: string;
  reminder_date: string | null;
  assigned_to: 'Amit' | 'Prateek';
  created_at: string;
}
