-- Create customers table
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  number TEXT NOT NULL UNIQUE,
  location TEXT NOT NULL,
  meeting_person TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create enquiries table
CREATE TABLE enquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  segment TEXT NOT NULL CHECK (segment IN ('Agri', 'Corporate', 'Others')),
  customer_id UUID REFERENCES customers(id),
  customer_name TEXT NOT NULL,
  number TEXT NOT NULL,
  location TEXT NOT NULL,
  requirement_details TEXT,
  status TEXT NOT NULL CHECK (status IN ('Lead', 'Enquiry', 'Formal Meeting', 'Quote', 'Won', 'Loss')),
  remarks TEXT,
  reminder_date DATE,
  assigned_to TEXT NOT NULL CHECK (assigned_to IN ('Amit', 'Prateek')),
  show_in_notification BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  enquiry_id UUID REFERENCES enquiries(id),
  status TEXT NOT NULL CHECK (status IN ('Pending', 'Completed')),
  assigned_to TEXT NOT NULL CHECK (assigned_to IN ('Amit', 'Prateek')),
  due_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_enquiries_assigned_to ON enquiries(assigned_to);
CREATE INDEX idx_enquiries_date ON enquiries(date);
CREATE INDEX idx_enquiries_status ON enquiries(status);
CREATE INDEX idx_customers_number ON customers(number);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_enquiry_id ON tasks(enquiry_id);

-- Enable Row Level Security (RLS)
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;

-- Create policies that allow all operations for now (since we're not implementing auth yet)
CREATE POLICY "Allow all operations on customers" ON customers FOR ALL USING (true);
CREATE POLICY "Allow all operations on enquiries" ON enquiries FOR ALL USING (true);
