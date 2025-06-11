import axios from 'axios';
import { 
  DonationMonth, 
  MemberProfile,
  Birthday,
  MemberBasicInfo,
  DashboardData,
  ChurchFinances
} from '@/types';

// Test authentication key - DO NOT use in production!
export const TEST_AUTH_KEY = "test_member_2024";

// Base URL for the API
const API_BASE_URL = 'https://api.igrejademocristofake.com/api';

// Create an axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Add token to requests
const addAuthHeader = (token: string) => {
  return {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };
};

// Mock data for development/demo
const generateMockData = () => {
  // Member data
  const memberId = '550e8400-e29b-41d4-a716-446655440000';
  const memberUUID = '38fca868-c675-4749-8823-0b3a1e555247';
  
  // Dashboard data (removed events and notices)
  const dashboardData: DashboardData = {
    memberName: 'João Silva',
    financialSummary: {
      currentMonthAmount: 350.00,
      previousMonthAmount: 300.00
    },
    birthdaysThisMonth: [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Maria Oliveira',
        birthDate: '15/05'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        name: 'Carlos Souza',
        birthDate: '22/05'
      }
    ]
  };

  // Donations data
  const donations: DonationMonth[] = [
    {
      date: 'maio de 2023',
      total: 350.00,
      donations: [
        {
          type: 'Dízimo',
          amount: 250.00
        },
        {
          type: 'Oferta',
          amount: 100.00
        }
      ]
    },
    {
      date: 'abril de 2023',
      total: 300.00,
      donations: [
        {
          type: 'Dízimo',
          amount: 250.00
        },
        {
          type: 'Oferta',
          amount: 50.00
        }
      ]
    }
  ];

  // Church finances data
  const churchFinances: ChurchFinances = {
    balance: 25000.00,
    currentMonth: {
      income: 15000.00,
      expenses: 12500.00
    },
    expenseCategories: [
      { name: 'Manutenção', amount: 3000.00 },
      { name: 'Utilidades', amount: 2500.00 },
      { name: 'Ação Social', amount: 2000.00 },
      { name: 'Eventos', amount: 1500.00 },
      { name: 'Material', amount: 1000.00 },
      { name: 'Outros', amount: 2500.00 }
    ]
  };

  // Profile data
  const profile: MemberProfile = {
    id: memberId,
    name: 'João Silva',
    cpf: '123.456.789-00',
    birthDate: '1985-06-10',
    phone: '(11) 98765-4321',
    email: 'joao.silva@email.com',
    address: 'Rua das Flores, 123 - Centro',
    role: 'Membro',
    active: true,
    uuid: memberUUID
  };

  // Birthdays data
  const birthdays: Birthday[] = [
    {
      id: '550e8400-e29b-41d4-a716-446655440014',
      name: 'Maria Oliveira',
      birthDate: '2023-05-15'
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440015',
      name: 'Carlos Souza',
      birthDate: '2023-05-22'
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440016',
      name: 'Ana Santos',
      birthDate: '2023-06-05'
    }
  ];

  // Member basic info
  const memberBasicInfo: MemberBasicInfo = {
    id: memberId,
    name: 'João Silva',
    role: 'Membro',
    active: true,
    uuid: memberUUID
  };

  return {
    dashboardData,
    donations,
    churchFinances,
    profile,
    birthdays,
    memberBasicInfo
  };
};

// Mock data
const mockData = generateMockData();

// API Functions - Updated to use Supabase with cache
export const fetchDashboardData = async (token: string): Promise<DashboardData> => {
  const { cacheService } = await import('./cache');
  
  return cacheService.getOrFetch(
    'dashboard_data',
    async () => {
      try {
        const { fetchDashboardData: supabaseFetchDashboard } = await import('./supabase');
        return await supabaseFetchDashboard();
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Return mock data on error
        await new Promise(resolve => setTimeout(resolve, 800));
        return mockData.dashboardData;
      }
    },
    10 // Cache por 10 minutos para dados do dashboard
  );
};

export const fetchDonations = async (token: string): Promise<DonationMonth[]> => {
  const { cacheService } = await import('./cache');
  
  return cacheService.getOrFetch(
    'donations',
    async () => {
      try {
        const { fetchDonations: supabaseFetchDonations } = await import('./supabase');
        return await supabaseFetchDonations();
      } catch (error) {
        console.error('Error fetching donations:', error);
        // Fallback to mock data
        await new Promise(resolve => setTimeout(resolve, 800));
        return mockData.donations;
      }
    },
    30 // Cache por 30 minutos para doações
  );
};

export const fetchChurchFinances = async (token: string): Promise<ChurchFinances> => {
  const { cacheService } = await import('./cache');
  
  return cacheService.getOrFetch(
    'church_finances',
    async () => {
      try {
        const { fetchChurchFinances: supabaseFetchChurchFinances } = await import('./supabase');
        return await supabaseFetchChurchFinances();
      } catch (error) {
        console.error('Error fetching church finances:', error);
        // Fallback to mock data
        await new Promise(resolve => setTimeout(resolve, 800));
        return mockData.churchFinances;
      }
    },
    20 // Cache por 20 minutos para finanças da igreja
  );
};

export const fetchMemberProfile = async (token: string): Promise<MemberProfile> => {
  const { cacheService } = await import('./cache');
  
  return cacheService.getOrFetch(
    'member_profile',
    async () => {
      try {
        const { fetchMemberProfile: supabaseFetchMemberProfile } = await import('./supabase');
        const profile = await supabaseFetchMemberProfile();
        if (!profile) {
          throw new Error('Perfil não encontrado');
        }
        return profile;
      } catch (error) {
        console.error('Error fetching member profile:', error);
        // Fallback to mock data
        await new Promise(resolve => setTimeout(resolve, 800));
        return mockData.profile;
      }
    },
    60 // Cache por 60 minutos para perfil (dados mais estáticos)
  );
};

export const fetchBirthdays = async (token: string, month: number): Promise<Birthday[]> => {
  const { cacheService } = await import('./cache');
  
  return cacheService.getOrFetch(
    `birthdays_${month}`,
    async () => {
      try {
        const { fetchBirthdays: supabaseFetchBirthdays } = await import('./supabase');
        return await supabaseFetchBirthdays(month);
      } catch (error) {
        console.error('Error fetching birthdays:', error);
        // Fallback to mock data filtrado por mês
        await new Promise(resolve => setTimeout(resolve, 800));
        return mockData.birthdays.filter(birthday => 
          new Date(birthday.birthDate).getMonth() === month - 1
        );
      }
    },
    30 // Cache por 30 minutos para aniversariantes
  );
};

export const fetchMemberBasicInfo = async (token: string): Promise<MemberBasicInfo> => {
  try {
    await new Promise(resolve => setTimeout(resolve, 800));
    return mockData.memberBasicInfo;
  } catch (error) {
    console.error('Error fetching member info:', error);
    throw error;
  }
};