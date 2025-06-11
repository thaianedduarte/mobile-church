// Event type
export interface Event {
  id: string;
  title: string;
  type: 'Culto' | 'Estudo' | 'Retiro' | 'Reunião' | 'Outro';
  date: string;
  time: string | null;
  location: string | null;
  description: string | null;
}

// Notice type
export interface Notice {
  id: string;
  title: string;
  content: string;
  priority: 'baixa' | 'média' | 'alta';
  date: string;
  author: string;
  active: boolean;
}

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
  birthDate: string;
}

// Dashboard data type
export interface DashboardData {
  memberName: string;
  upcomingEvents: Event[];
  recentNotices: Notice[];
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