import * as XLSX from 'xlsx';
import { Enquiry, Customer } from '@/types/database.types';

// Format date for Excel
const formatDateForExcel = (dateString: string | null): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Export enquiries to Excel
export const exportEnquiriesToExcel = (enquiries: Enquiry[], filename?: string) => {
  try {
    console.log('Exporting enquiries to Excel:', enquiries.length, 'records');

    // Prepare data for Excel
    const excelData = enquiries.map((enquiry, index) => {
      console.log('Processing enquiry:', index + 1, enquiry);

      return {
        'S.No.': index + 1,
        'Date': formatDateForExcel(enquiry.date),
        'Customer Name': enquiry.customer_name || '',
        'Mobile Number': enquiry.number || '',
        'Location': enquiry.location || '',
        'Meeting Person': enquiry.meeting_person || '',
        'Segment': enquiry.segment || '',
        'Status': enquiry.status || '',
        'Requirement Details': enquiry.requirement_details || '',
        'Remarks': enquiry.remarks || '',
        'Assigned To': enquiry.assigned_to || '',
        'Reminder Date': formatDateForExcel(enquiry.reminder_date),
        'Show in Notification': enquiry.show_in_notification ? 'Yes' : 'No',
        'Created At': formatDateForExcel(enquiry.created_at)
      };
    });

    console.log('Excel data prepared:', excelData.length, 'rows');

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    const columnWidths = [
      { wch: 8 },   // S.No.
      { wch: 12 },  // Date
      { wch: 20 },  // Customer Name
      { wch: 15 },  // Mobile Number
      { wch: 15 },  // Location
      { wch: 15 },  // Meeting Person
      { wch: 12 },  // Segment
      { wch: 12 },  // Status
      { wch: 30 },  // Requirement Details
      { wch: 20 },  // Remarks
      { wch: 12 },  // Assigned To
      { wch: 12 },  // Reminder Date
      { wch: 15 },  // Show in Notification
      { wch: 12 }   // Created At
    ];
    worksheet['!cols'] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Enquiries');

    // Generate filename
    const defaultFilename = `enquiries_${new Date().toISOString().split('T')[0]}.xlsx`;
    const finalFilename = filename || defaultFilename;

    console.log('Downloading file:', finalFilename);

    // Download the file
    XLSX.writeFile(workbook, finalFilename);

    console.log('Excel file generated successfully');
  } catch (error) {
    console.error('Error in exportEnquiriesToExcel:', error);
    throw error;
  }
};

// Export customers to Excel
export const exportCustomersToExcel = (customers: Customer[], filename?: string) => {
  try {
    console.log('Exporting customers to Excel:', customers.length, 'records');

    // Prepare data for Excel using the correct field names from Customer interface
    const excelData = customers.map((customer, index) => {
      console.log('Processing customer:', index + 1, customer);

      return {
        'S.No.': index + 1,
        'Customer Name': customer.name || '',
        'Mobile Number': customer.number || '',
        'Location': customer.location || '',
        'Meeting Person': customer.meeting_person || '',
        'Created At': formatDateForExcel(customer.created_at)
      };
    });

    console.log('Customer Excel data prepared:', excelData.length, 'rows');

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    const columnWidths = [
      { wch: 8 },   // S.No.
      { wch: 20 },  // Customer Name
      { wch: 15 },  // Mobile Number
      { wch: 20 },  // Location
      { wch: 15 },  // Meeting Person
      { wch: 12 }   // Created At
    ];
    worksheet['!cols'] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Customers');

    // Generate filename
    const defaultFilename = `customers_${new Date().toISOString().split('T')[0]}.xlsx`;
    const finalFilename = filename || defaultFilename;

    console.log('Downloading customer file:', finalFilename);

    // Download the file
    XLSX.writeFile(workbook, finalFilename);

    console.log('Customer Excel file generated successfully');
  } catch (error) {
    console.error('Error in exportCustomersToExcel:', error);
    throw error;
  }
};

// Export filtered enquiries to Excel (with filters applied)
export const exportFilteredEnquiriesToExcel = (
  enquiries: Enquiry[],
  filters: {
    assignee?: string;
    status?: string;
    segment?: string;
    fromDate?: string;
    toDate?: string;
  },
  filename?: string
) => {
  try {
    console.log('Exporting filtered enquiries with filters:', filters);

    // Add filter information to the filename
    let filterSuffix = '';
    if (filters.assignee && filters.assignee !== 'All') {
      filterSuffix += `_${filters.assignee}`;
    }
    if (filters.status && filters.status !== 'All') {
      filterSuffix += `_${filters.status}`;
    }
    if (filters.segment && filters.segment !== 'All') {
      filterSuffix += `_${filters.segment}`;
    }
    if (filters.fromDate || filters.toDate) {
      filterSuffix += '_filtered';
    }

    const defaultFilename = `enquiries${filterSuffix}_${new Date().toISOString().split('T')[0]}.xlsx`;
    const finalFilename = filename || defaultFilename;

    console.log('Calling exportEnquiriesToExcel with filename:', finalFilename);
    exportEnquiriesToExcel(enquiries, finalFilename);
  } catch (error) {
    console.error('Error in exportFilteredEnquiriesToExcel:', error);
    throw error;
  }
};
