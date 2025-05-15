-- Create a function to add the show_in_notification column if it doesn't exist
CREATE OR REPLACE FUNCTION add_notification_column()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the column already exists
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'enquiries'
    AND column_name = 'show_in_notification'
  ) THEN
    -- Add the column with a default value of false
    EXECUTE 'ALTER TABLE enquiries ADD COLUMN show_in_notification BOOLEAN DEFAULT FALSE';
  END IF;
END;
$$;

-- Execute the function to ensure the column exists
SELECT add_notification_column();
