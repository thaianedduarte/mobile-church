import axios from 'axios';
import { 
  Event, 
  Notice, 
  DonationMonth, 
  MemberProfile,
  Birthday,
  MemberBasicInfo,
  DashboardData,
  ChurchFinances,
  Expense
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
          id: '550e8400-e29b-41d4-a716-446655440007',
          type: 'Dízimo',
          amount: 250.00,
          memberId: memberId,
          memberName: 'João Silva',
          date: '2023-05-15',
          notes: null
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440008',
          type: 'Oferta',
          amount: 100.00,
          memberId: memberId,
          memberName: 'João Silva',
          date: '2023-05-15',
          notes: 'Oferta para missões'
        }
      ]
    },
    {
      date: 'abril de 2023',
      total: 300.00,
      donations: [
        {
          id: '550e8400-e29b-41d4-a716-446655440009',
          type: 'Dízimo',
          amount: 250.00,
          memberId: memberId,
          memberName: 'João Silva',
          date: '2023-04-10',
          notes: null
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440010',
          type: 'Oferta',
          amount: 50.00,
          memberId: memberId,
          memberName: 'João Silva',
          date: '2023-04-20',
          notes: null
        }
      ]
    }
  ];

  // Expenses data
  const expenses: Expense[] = [
    {
      id: '550e8400-e29b-41d4-a716-446655440011',
      name: 'Energia Elétrica',
      amount: 800.00,
      dueDate: '2023-05-15',
      type: 'Fixa',
      recurring: true,
      paid: true,
      notes: null
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440012',
      name: 'Água',
      amount: 200.00,
      dueDate: '2023-05-10',
      type: 'Fixa',
      recurring: true,
      paid: true,
      notes: null
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440013',
      name: 'Material Escola Dominical',
      amount: 500.00,
      dueDate: '2023-05-20',
      type: 'Variável',
      recurring: false,
      paid: false,
      notes: 'Materiais para o trimestre'
    }
  ];

  // Church finances data
  const churchFinances: ChurchFinances = {
    currentMonth: {
      income: 15000.00,
      expenses: 12500.00
    },
    balance: 25000.00,
    expenseCategories: [
      { name: 'Manutenção', amount: 3000.00 },
      { name: 'Utilidades', amount: 2500.00 },
      { name: 'Ação Social', amount: 2000.00 },
      { name: 'Eventos', amount: 1500.00 },
      { name: 'Material', amount: 1000.00 },
      { name: 'Outros', amount: 2500.00 }
    ],
    expenses: expenses
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

// API Functions
export const fetchDashboardData = async (token: string): Promise<DashboardData> => {
  try {
    // Try to use Supabase client first, fallback to mock data
    const { supabase } = await import('./supabase');
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Fetch real data from Supabase with RLS
      const [events, notices] = await Promise.all([
        supabase.from('eventos').select('*').limit(2),
        supabase.from('avisos').select('*').eq('ativo', true).limit(2)
      ]);
      
      // Use real data if available, otherwise fallback to mock
      if (events.data && notices.data) {
        return {
          ...mockData.dashboardData,
          upcomingEvents: events.data,
          recentNotices: notices.data
        };
      }
    }
    
    // Fallback to mock data
    await new Promise(resolve => setTimeout(resolve, 800));
    return mockData.dashboardData;
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    // Return mock data on error
    return mockData.dashboardData;
  }
};

export const fetchEvents = async (token: string): Promise<Event[]> => {
  try {
    await new Promise(resolve => setTimeout(resolve, 800));
    return mockData.events;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};

export const fetchNotices = async (token: string): Promise<Notice[]> => {
  try {
    await new Promise(resolve => setTimeout(resolve, 800));
    return mockData.notices;
  } catch (error) {
    console.error('Error fetching notices:', error);
    throw error;
  }
};

export const fetchDonations = async (token: string): Promise<DonationMonth[]> => {
  try {
    await new Promise(resolve => setTimeout(resolve, 800));
    return mockData.donations;
  } catch (error) {
    console.error('Error fetching donations:', error);
    throw error;
  }
};

export const fetchChurchFinances = async (token: string): Promise<ChurchFinances> => {
  try {
    await new Promise(resolve => setTimeout(resolve, 800));
    return mockData.churchFinances;
  } catch (error) {
    console.error('Error fetching church finances:', error);
    throw error;
  }
};

export const fetchMemberProfile = async (token: string): Promise<MemberProfile> => {
  try {
    await new Promise(resolve => setTimeout(resolve, 800));
    return mockData.profile;
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }
};

export const fetchBirthdays = async (token: string): Promise<Birthday[]> => {
  try {
    await new Promise(resolve => setTimeout(resolve, 800));
    return mockData.birthdays;
  } catch (error) {
    console.error('Error fetching birthdays:', error);
    throw error;
  }
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