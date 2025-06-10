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
  id: string;
  type: 'Dízimo' | 'Oferta' | 'Doação';
  amount: number;
  memberId: string | null;
  memberName: string | null;
  date: string;
  notes: string | null;
}

export interface DonationMonth {
  date: string;
  total: number;
  donations: Donation[];
}

// Church finances types
export interface Expense {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  type: 'Fixa' | 'Variável';
  recurring: boolean;
  paid: boolean;
  notes: string | null;
}

export interface ExpenseCategory {
  name: string;
  amount: number;
}

export interface MonthlyFinances {
  income: number;
  expenses: number;
}

export interface ChurchFinances {
  currentMonth: MonthlyFinances;
  balance: number;
  expenseCategories: ExpenseCategory[];
  expenses: Expense[];
}

// Member profile type
export interface MemberProfile {
  id: string;
  name: string;
  cpf: string | null;
  birthDate: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  role: string;
  active: boolean;
  uuid: string;
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