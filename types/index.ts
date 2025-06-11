// Donation types
export interface Donation {
  type: string;
  amount: number;
}

export interface DonationMonth {
  date: string;
  total: number;
  donations: Donation[];
}

// Church finances types
export interface ChurchFinances {
  balance: number;
  currentMonth: {
    income: number;
    expenses: number;
  };
  expenseCategories: {
    name: string;
    amount: number;
  }[];
}

// Member profile type
export interface MemberProfile {
  id?: string;
  name: string;
  cpf: string;
  birthDate: string;
  phone?: string;
  email?: string;
  address?: string;
  role: string;
  status: 'active' | 'inactive';
  active?: boolean;
  uuid?: string;
  memberSince: string;
}

// Member basic info type (for auth context)
export interface MemberBasicInfo {
  id: string;
  name: string;
  role: string;
  active: boolean;
  uuid: string;
}

// Birthday type
export interface Birthday {
  id: string;
  name: string;
  birthDate: string; // formato 'YYYY-MM-DD'
}

// Dashboard data type (removed events and notices)
export interface DashboardData {
  memberName: string;
  financialSummary: {
    currentMonthAmount: number;
    previousMonthAmount: number;
  };
  birthdaysThisMonth: {
    id: string;
    name: string;
    birthDate: string;
  }[];
}