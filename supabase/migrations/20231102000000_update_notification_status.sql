-- Create a function to update the notification status
CREATE OR REPLACE FUNCTION update_notification_status(enquiry_id UUID, notification_status BOOLEAN)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update the notification status
  UPDATE enquiries
  SET show_in_notification = notification_status
  WHERE id = enquiry_id;
  
  -- Return true to indicate success
  RETURN TRUE;
END;
$$;
