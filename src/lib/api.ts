import { supabase } from './supabase';
import { Customer, Enquiry, Segment, Status } from '@/types/database.types';

// Customer API functions
export async function getCustomers(): Promise<Customer[]> {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching customers:', error);
    return [];
  }

  return data || [];
}

export async function getCustomerByNumber(number: string): Promise<Customer | null> {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('number', number)
    .single();

  if (error) {
    console.error('Error fetching customer by number:', error);
    return null;
  }

  return data;
}

export async function createCustomer(customer: Omit<Customer, 'id' | 'created_at'>): Promise<Customer | null> {
  const { data, error } = await supabase
    .from('customers')
    .insert([customer])
    .select()
    .single();

  if (error) {
    console.error('Error creating customer:', error);
    return null;
  }

  return data;
}

export async function updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer | null> {
  const { data, error } = await supabase
    .from('customers')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating customer:', error);
    return null;
  }

  return data;
}

// Enquiry API functions
export async function getEnquiries(): Promise<Enquiry[]> {
  const { data, error } = await supabase
    .from('enquiries')
    .select('*')
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching enquiries:', error);
    return [];
  }

  return data || [];
}

export async function getEnquiriesByAssignee(assignee: 'Amit' | 'Prateek'): Promise<Enquiry[]> {
  const { data, error } = await supabase
    .from('enquiries')
    .select('*')
    .eq('assigned_to', assignee)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching enquiries by assignee:', error);
    return [];
  }

  return data || [];
}

export async function createEnquiry(enquiry: Omit<Enquiry, 'id' | 'created_at'>): Promise<Enquiry | null> {
  const { data, error } = await supabase
    .from('enquiries')
    .insert([enquiry])
    .select()
    .single();

  if (error) {
    console.error('Error creating enquiry:', error);
    return null;
  }

  return data;
}

export async function updateEnquiry(id: string, updates: Partial<Enquiry>): Promise<Enquiry | null> {
  // Log the update request for debugging
  console.log('Updating enquiry with ID:', id);
  console.log('Update payload:', updates);

  // Ensure status is included in the update
  if (!updates.status) {
    console.warn('Status field missing in update payload');
  }

  const { data, error } = await supabase
    .from('enquiries')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating enquiry:', error);
    return null;
  }

  console.log('Enquiry updated successfully:', data);
  return data;
}
