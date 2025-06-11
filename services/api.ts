import axios from 'axios';
import { 
  Event, 
  Notice, 
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
  
  // Dashboard data
  const dashboardData: DashboardData = {
    memberName: 'João Silva',
    upcomingEvents: [
      {
        id: '7d9dc92c-0e88-4758-a7c2-8d6fc6c3e91a',
        title: 'Culto de Domingo',
        type: 'Culto',
        date: new Date(Date.now() + 86400000 * 2).toISOString(),
        time: '10:00',
        location: 'Templo Principal',
        description: 'Culto dominical com celebração da Santa Ceia.'
      },
      {
        id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        title: 'Reunião de Líderes',
        type: 'Reunião',
        date: new Date(Date.now() + 86400000 * 5).toISOString(),
        time: '19:30',
        location: 'Sala de Reuniões',
        description: 'Reunião para planejamento de atividades do próximo mês.'
      }
    ],
    recentNotices: [
      {
        id: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
        title: 'Campanha de Arrecadação',
        content: 'Estamos realizando uma campanha de arrecadação de alimentos não perecíveis para o projeto social da igreja.',
        priority: 'alta',
        date: new Date(Date.now() - 86400000 * 2).toISOString(),
        author: 'Pastor José',
        active: true
      },
      {
        id: '6ba7b811-9dad-11d1-80b4-00c04fd430c8',
        title: 'Aulas da Escola Dominical',
        content: 'As aulas da escola dominical retornarão no próximo domingo, às 9h, com novos materiais.',
        priority: 'média',
        date: new Date(Date.now() - 86400000 * 5).toISOString(),
        author: 'Maria Santos',
        active: true
      }
    ],
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

  // Events data
  const events: Event[] = [
    ...dashboardData.upcomingEvents,
    {
      id: '550e8400-e29b-41d4-a716-446655440003',
      title: 'Culto de Adoração',
      type: 'Culto',
      date: new Date(Date.now() - 86400000 * 7).toISOString(),
      time: '19:00',
      location: 'Templo Principal',
      description: 'Culto de adoração com ministração da Palavra.'
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440004',
      title: 'Encontro de Jovens',
      type: 'Outro',
      date: new Date(Date.now() + 86400000 * 10).toISOString(),
      time: '20:00',
      location: 'Auditório',
      description: 'Encontro mensal dos jovens da igreja com louvor e comunhão.'
    }
  ];

  // Notices data
  const notices: Notice[] = [
    ...dashboardData.recentNotices,
    {
      id: '550e8400-e29b-41d4-a716-446655440005',
      title: 'Horário de Atendimento Pastoral',
      content: 'O pastor estará disponível para atendimento às terças e quintas, das 14h às 17h. Agende seu horário na secretaria.',
      priority: 'baixa',
      date: new Date(Date.now() - 86400000 * 10).toISOString(),
      author: 'Secretaria',
      active: true
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440006',
      title: 'Acampamento de Verão',
      content: 'As inscrições para o acampamento de verão já estão abertas. Vagas limitadas!',
      priority: 'alta',
      date: new Date(Date.now() - 86400000 * 3).toISOString(),
      author: 'Ministério de Jovens',
      active: true
    }
  ];

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
    events,
    notices,
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

export const fetchEvents = async (token: string, filter: 'upcoming' | 'past' | 'all' = 'all'): Promise<Event[]> => {
  const { cacheService } = await import('./cache');
  
  return cacheService.getOrFetch(
    `events_${filter}`,
    async () => {
      try {
        const { fetchEvents: supabaseFetchEvents } = await import('./supabase');
        return await supabaseFetchEvents(filter);
      } catch (error) {
        console.error('Error fetching events:', error);
        // Fallback to mock data
        await new Promise(resolve => setTimeout(resolve, 800));
        return mockData.events;
      }
    },
    15 // Cache por 15 minutos para eventos
  );
};

export const fetchNotices = async (token: string, filter: 'all' | 'important' | 'regular' = 'all'): Promise<Notice[]> => {
  const { cacheService } = await import('./cache');
  
  return cacheService.getOrFetch(
    `notices_${filter}`,
    async () => {
      try {
        const { fetchNotices: supabaseFetchNotices } = await import('./supabase');
        return await supabaseFetchNotices(filter);
      } catch (error) {
        console.error('Error fetching notices:', error);
        // Fallback to mock data
        await new Promise(resolve => setTimeout(resolve, 800));
        return mockData.notices;
      }
    },
    5 // Cache por 5 minutos para avisos (mais dinâmicos)
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