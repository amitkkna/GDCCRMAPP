import { supabase } from './supabase';
import { Customer, Enquiry, Segment, Status, Task, TaskStatus } from '@/types/database.types';

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
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('number', number)
      .single();

    if (error) {
      // Check if it's a "no rows returned" error, which is expected when no customer is found
      if (error.code === 'PGRST116') {
        console.log('No customer found with number:', number);
        return null; // No customer found with this number
      }

      // For other errors, log and throw
      console.error('Error in getCustomerByNumber:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching customer by number:', error);
    // Return null instead of throwing to prevent the app from crashing
    return null;
  }
}

export async function createCustomer(customer: Omit<Customer, 'id' | 'created_at'>): Promise<Customer | null> {
  // Log the customer data being created
  console.log('Creating customer with data:', customer);

  const { data, error } = await supabase
    .from('customers')
    .insert([customer])
    .select()
    .single();

  if (error) {
    console.error('Error creating customer:', error);
    console.error('Error details:', JSON.stringify(error));
    return null;
  }

  console.log('Customer created successfully:', data);
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

  // Process the data to handle "Formal Meeting" status
  if (data) {
    data.forEach(enquiry => {
      // Check if the remarks indicate this is actually a "Formal Meeting"
      if (enquiry.status === 'Enquiry' && enquiry.remarks && enquiry.remarks.startsWith('[Formal Meeting]')) {
        enquiry.status = 'Formal Meeting';
        // Remove the status prefix from remarks
        enquiry.remarks = enquiry.remarks.replace('[Formal Meeting] ', '');
      }
    });
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

  // Process the data to handle "Formal Meeting" status
  if (data) {
    data.forEach(enquiry => {
      // Check if the remarks indicate this is actually a "Formal Meeting"
      if (enquiry.status === 'Enquiry' && enquiry.remarks && enquiry.remarks.startsWith('[Formal Meeting]')) {
        enquiry.status = 'Formal Meeting';
        // Remove the status prefix from remarks
        enquiry.remarks = enquiry.remarks.replace('[Formal Meeting] ', '');
      }
    });
  }

  return data || [];
}

export async function createEnquiry(enquiry: Omit<Enquiry, 'id' | 'created_at'>): Promise<Enquiry | null> {
  try {
    console.log('Creating enquiry with data:', enquiry);

    // Validate required fields
    if (!enquiry.date) console.warn('Missing required field: date');
    if (!enquiry.customer_id) console.warn('Missing required field: customer_id');
    if (!enquiry.customer_name) console.warn('Missing required field: customer_name');
    if (!enquiry.number) console.warn('Missing required field: number');
    if (!enquiry.status) console.warn('Missing required field: status');
    if (!enquiry.assigned_to) console.warn('Missing required field: assigned_to');

    // Handle the "Formal Meeting" status - convert to "Enquiry" for database compatibility
    // This is a temporary fix until the database schema is updated
    let enquiryData = { ...enquiry };

    if (enquiryData.status === 'Formal Meeting') {
      console.log('Converting "Formal Meeting" status to "Enquiry" for database compatibility');
      enquiryData.status = 'Enquiry';
      // Store the original status in remarks
      enquiryData.remarks = `[Formal Meeting] ${enquiryData.remarks || ''}`;
    }

    const { data, error } = await supabase
      .from('enquiries')
      .insert([enquiryData])
      .select()
      .single();

    if (error) {
      console.error('Error creating enquiry:', error);
      console.error('Error details:', JSON.stringify(error));
      return null;
    }

    // If we converted the status, convert it back for the returned data
    if (enquiry.status === 'Formal Meeting' && data) {
      data.status = 'Formal Meeting';
    }

    console.log('Enquiry created successfully:', data);

    // Update the customer's meeting_person field if it's provided in the enquiry
    // and not already set for the customer
    if (enquiry.meeting_person && enquiry.customer_id) {
      try {
        // Get the current customer data
        const { data: customerData } = await supabase
          .from('customers')
          .select('meeting_person')
          .eq('id', enquiry.customer_id)
          .single();

        // If the customer doesn't have a meeting_person set, update it
        if (customerData && !customerData.meeting_person) {
          console.log('Updating customer meeting_person field with:', enquiry.meeting_person);

          const { data: updatedCustomer, error: updateError } = await supabase
            .from('customers')
            .update({ meeting_person: enquiry.meeting_person })
            .eq('id', enquiry.customer_id)
            .select()
            .single();

          if (updateError) {
            console.error('Error updating customer meeting_person:', updateError);
          } else {
            console.log('Customer meeting_person updated successfully:', updatedCustomer);
          }
        }
      } catch (error) {
        console.error('Error checking/updating customer meeting_person:', error);
        // Don't fail the enquiry creation if this update fails
      }
    }

    return data;
  } catch (error) {
    console.error('Exception in createEnquiry:', error);
    console.error('Error details:', JSON.stringify(error));
    return null;
  }
}

export async function updateEnquiry(id: string, updates: Partial<Enquiry>): Promise<Enquiry | null> {
  // Log the update request for debugging
  console.log('Updating enquiry with ID:', id);
  console.log('Update payload:', updates);

  // Ensure status is included in the update
  if (!updates.status) {
    console.warn('Status field missing in update payload');
  }

  // Handle the "Formal Meeting" status - convert to "Enquiry" for database compatibility
  let updatesData = { ...updates };

  if (updatesData.status === 'Formal Meeting') {
    console.log('Converting "Formal Meeting" status to "Enquiry" for database compatibility');
    updatesData.status = 'Enquiry';

    // Store the original status in remarks if remarks are being updated
    if (updatesData.remarks !== undefined) {
      updatesData.remarks = `[Formal Meeting] ${updatesData.remarks || ''}`;
    } else {
      // Get the current enquiry to preserve or update remarks
      const { data: currentEnquiry } = await supabase
        .from('enquiries')
        .select('remarks')
        .eq('id', id)
        .single();

      if (currentEnquiry) {
        updatesData.remarks = `[Formal Meeting] ${currentEnquiry.remarks || ''}`;
      }
    }
  }

  const { data, error } = await supabase
    .from('enquiries')
    .update(updatesData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating enquiry:', error);
    console.error('Error details:', JSON.stringify(error));
    return null;
  }

  // If we converted the status, convert it back for the returned data
  if (updates.status === 'Formal Meeting' && data) {
    data.status = 'Formal Meeting';
  }

  console.log('Enquiry updated successfully:', data);

  // Update the customer's meeting_person field if it's provided in the update
  if (updates.meeting_person && data && data.customer_id) {
    try {
      // Get the current customer data
      const { data: customerData } = await supabase
        .from('customers')
        .select('meeting_person')
        .eq('id', data.customer_id)
        .single();

      // If the customer doesn't have a meeting_person set or it's different, update it
      if (customerData &&
          (!customerData.meeting_person ||
           customerData.meeting_person !== updates.meeting_person)) {
        console.log('Updating customer meeting_person field with:', updates.meeting_person);

        const { data: updatedCustomer, error: updateError } = await supabase
          .from('customers')
          .update({ meeting_person: updates.meeting_person })
          .eq('id', data.customer_id)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating customer meeting_person:', updateError);
        } else {
          console.log('Customer meeting_person updated successfully:', updatedCustomer);
        }
      }
    } catch (error) {
      console.error('Error checking/updating customer meeting_person:', error);
      // Don't fail the enquiry update if this update fails
    }
  }

  return data;
}

// Task API functions
export async function getTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }

  return data || [];
}

export async function getTasksByStatus(status: TaskStatus): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: false });

  if (error) {
    console.error(`Error fetching ${status} tasks:`, error);
    return [];
  }

  return data || [];
}

export async function getTasksByAssignee(assignee: 'Amit' | 'Prateek'): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('assigned_to', assignee)
    .order('created_at', { ascending: false });

  if (error) {
    console.error(`Error fetching tasks for ${assignee}:`, error);
    return [];
  }

  return data || [];
}

export async function getTasksWithEnquiries(): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select(`
      *,
      enquiry:enquiries(*)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching tasks with enquiries:', error);
    return [];
  }

  return data || [];
}

export async function getTasksByStatusWithEnquiries(status: TaskStatus): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select(`
      *,
      enquiry:enquiries(*)
    `)
    .eq('status', status)
    .order('created_at', { ascending: false });

  if (error) {
    console.error(`Error fetching ${status} tasks with enquiries:`, error);
    return [];
  }

  return data || [];
}

export async function createTask(task: Omit<Task, 'id' | 'created_at' | 'completed_at'>): Promise<Task | null> {
  console.log('Creating task with data:', task);

  const { data, error } = await supabase
    .from('tasks')
    .insert([task])
    .select()
    .single();

  if (error) {
    console.error('Error creating task:', error);
    console.error('Error details:', JSON.stringify(error));
    return null;
  }

  console.log('Task created successfully:', data);
  return data;
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<Task | null> {
  console.log('Updating task with ID:', id);
  console.log('Update payload:', updates);

  // If marking as completed, add the completed_at timestamp
  if (updates.status === 'Completed' && !updates.completed_at) {
    updates.completed_at = new Date().toISOString();
  }

  // If marking as pending, remove the completed_at timestamp
  if (updates.status === 'Pending') {
    updates.completed_at = null;
  }

  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating task:', error);
    console.error('Error details:', JSON.stringify(error));
    return null;
  }

  console.log('Task updated successfully:', data);
  return data;
}

export async function deleteTask(id: string): Promise<boolean> {
  console.log('Deleting task with ID:', id);

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting task:', error);
    console.error('Error details:', JSON.stringify(error));
    return false;
  }

  console.log('Task deleted successfully');
  return true;
}

// Add show_in_notification column to enquiries table if it doesn't exist
export async function addNotificationColumnIfNeeded(id: string): Promise<boolean> {
  console.log('Checking if show_in_notification column exists...');

  try {
    // First, let's try a direct update to see if the column exists
    const { error: updateError } = await supabase
      .from('enquiries')
      .update({ show_in_notification: false })
      .eq('id', id);

    // If there's no error, the column exists
    if (!updateError) {
      console.log('Column exists and was updated successfully');
      return true;
    }

    // If there's an error about the column not existing, we need to handle it
    if (updateError && updateError.message && updateError.message.includes('does not exist')) {
      console.log('Column does not exist, we need to create it manually');

      // Since we can't add columns through the Supabase JS client directly,
      // we'll need to use a workaround by creating a temporary field in the client

      // Let's inform the user about the issue
      console.error('Database schema needs to be updated to include show_in_notification column');
      console.error('Please run the migration script or add the column manually');

      // For now, let's use a client-side workaround
      console.log('Using client-side workaround for notification status');

      // Store the notification status in localStorage
      const key = `notification_${id}`;
      localStorage.setItem(key, 'true');

      return true;
    }

    // Some other error occurred
    console.error('Error checking/updating column:', updateError);
    console.error('Error details:', JSON.stringify(updateError));
    return false;
  } catch (error) {
    console.error('Exception in addNotificationColumnIfNeeded:', error);
    console.error('Error details:', JSON.stringify(error));
    return false;
  }
}

// Toggle notification status for an enquiry
export async function toggleEnquiryNotification(id: string, value: boolean): Promise<boolean> {
  console.log('Toggling notification status for enquiry ID:', id, 'to:', value);

  try {
    // First, check if the enquiry exists
    const { data: enquiry, error: fetchError } = await supabase
      .from('enquiries')
      .select('id, show_in_notification')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error fetching enquiry before toggle:', fetchError);
      console.error('Error details:', JSON.stringify(fetchError));
      return false;
    }

    if (!enquiry) {
      console.error('Enquiry not found with ID:', id);
      return false;
    }

    console.log('Current notification status:', enquiry.show_in_notification);

    // Use a direct update approach for simplicity and reliability
    console.log('Attempting to update notification status in database');
    const { data, error } = await supabase
      .from('enquiries')
      .update({ show_in_notification: value })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error toggling notification status with update:', error);
      console.error('Error details:', JSON.stringify(error));

      // Last resort: use localStorage
      console.log('Using localStorage as fallback');
      const key = `notification_${id}`;
      if (value) {
        localStorage.setItem(key, 'true');
        console.log('Notification status stored in localStorage:', key, 'true');
      } else {
        localStorage.removeItem(key);
        console.log('Notification status removed from localStorage:', key);
      }

      // Force a refresh of the data by dispatching a custom event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('notification-toggled', {
          detail: { id, value }
        }));
        console.log('Dispatched notification-toggled event');
      }

      return true;
    }

    console.log('Notification status toggled successfully:', data);

    // Verify the update was successful
    const { data: verifyData, error: verifyError } = await supabase
      .from('enquiries')
      .select('id, show_in_notification')
      .eq('id', id)
      .single();

    if (verifyError) {
      console.error('Error verifying update:', verifyError);
    } else {
      console.log('Verified notification status after update:', verifyData.show_in_notification);
    }

    // Force a refresh of the data by dispatching a custom event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('notification-toggled', {
        detail: { id, value }
      }));
      console.log('Dispatched notification-toggled event');
    }

    return true;
  } catch (error) {
    console.error('Exception in toggleEnquiryNotification:', error);
    console.error('Error details:', JSON.stringify(error));
    return false;
  }
}