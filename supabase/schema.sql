-- Create customers table
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  number TEXT NOT NULL UNIQUE,
  location TEXT NOT NULL,
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
  status TEXT NOT NULL CHECK (status IN ('Lead', 'Enquiry', 'Quote', 'Won', 'Loss')),
  remarks TEXT,
  reminder_date DATE,
  assigned_to TEXT NOT NULL CHECK (assigned_to IN ('Amit', 'Prateek')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_enquiries_assigned_to ON enquiries(assigned_to);
CREATE INDEX idx_enquiries_date ON enquiries(date);
CREATE INDEX idx_enquiries_status ON enquiries(status);
CREATE INDEX idx_customers_number ON customers(number);

-- Enable Row Level Security (RLS)
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;

-- Create policies that allow all operations for now (since we're not implementing auth yet)
CREATE POLICY "Allow all operations on customers" ON customers FOR ALL USING (true);
CREATE POLICY "Allow all operations on enquiries" ON enquiries FOR ALL USING (true);
