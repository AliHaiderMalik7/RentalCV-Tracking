// Dummy data for properties
export const properties = [
    {
      id: '1',
      address: '23 Baker Street',
      postcode: 'NW1 6XE',
      propertyType: 'flat',
      bedrooms: 2,
      rentAmount: 1250, // monthly rent in GBP
      status: 'maintenance',
      description: 'Modern 2-bed flat near Regent\'s Park',
      createdAt: Date.now()
    },
    {
      id: '2',
      address: '10 Downing Street',
      postcode: 'SW1A 2AA',
      propertyType: 'house',
      bedrooms: 4,
      rentAmount: 3200, // monthly rent in GBP
      status: 'occupied',
      description: 'Historic townhouse in central London',
      createdAt: Date.now() - 86400000
    },
    {
      id: '3',
      address: '221B Baker Street',
      postcode: 'NW1 6XE',
      propertyType: 'flat',
      bedrooms: 1,
      rentAmount: 950, // monthly rent in GBP
      status: 'vacant',
      description: 'Cozy studio near Marylebone Station',
      createdAt: Date.now() - 172800000
    },
  ];
  

  export const alerts = [
  {
    id: '1',
    type: 'payment',
    message: 'Rent overdue for 123 Main St',
    createdAt: new Date().toISOString()
  }
];

export const tenants = [
    {
      id: '1',
      name: 'John Smith',
      propertyId: '1',
      paymentStatus: 'late',
      openIssues: 1,
      leaseStart: '2023-01-01',
      leaseEnd: '2024-01-01'
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      propertyId: '2', 
      paymentStatus: 'paid',
      openIssues: 0,
      leaseStart: '2023-03-15',
      leaseEnd: '2024-03-15'
    }
  ];

  export const payments = [
    { month: 'Jan', amount: 1200 },
    { month: 'Feb', amount: 1350 },
    { month: 'Mar', amount: 1100 },
    { month: 'Apr', amount: 1400 },
    { month: 'May', amount: 1250 },
    { month: 'Jun', amount: 1600 },
    { month: 'Jul', amount: 1550 },
    { month: 'Aug', amount: 1300 },
    { month: 'Sep', amount: 1450 },
    { month: 'Oct', amount: 1500 },
    { month: 'Nov', amount: 1400 },
    { month: 'Dec', amount: 1700 },
  ];
  