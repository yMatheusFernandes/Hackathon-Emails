// emailStorage.ts

// ✅ ATUALIZADA: Adicionado campo 'city'
export interface Email {
  id: string;
  subject: string;
  sender: string;
  recipient: string;
  content: string;
  status: 'pending' | 'classified' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category?: string;
  state: string;
  city?: string; // ✅ NOVO CAMPO: Município
  date: string;
  tags?: string[];
}

// ✅ LISTAS CENTRALIZADAS PARA REUSO EM TODA A APLICAÇÃO

// Estados do Brasil com siglas e nomes completos
export const BRAZILIAN_STATES = [
  { code: "AC", name: "Acre" },
  { code: "AL", name: "Alagoas" },
  { code: "AP", name: "Amapá" },
  { code: "AM", name: "Amazonas" },
  { code: "BA", name: "Bahia" },
  { code: "CE", name: "Ceará" },
  { code: "DF", name: "Distrito Federal" },
  { code: "ES", name: "Espírito Santo" },
  { code: "GO", name: "Goiás" },
  { code: "MA", name: "Maranhão" },
  { code: "MT", name: "Mato Grosso" },
  { code: "MS", name: "Mato Grosso do Sul" },
  { code: "MG", name: "Minas Gerais" },
  { code: "PA", name: "Pará" },
  { code: "PB", name: "Paraíba" },
  { code: "PR", name: "Paraná" },
  { code: "PE", name: "Pernambuco" },
  { code: "PI", name: "Piauí" },
  { code: "RJ", name: "Rio de Janeiro" },
  { code: "RN", name: "Rio Grande do Norte" },
  { code: "RS", name: "Rio Grande do Sul" },
  { code: "RO", name: "Rondônia" },
  { code: "RR", name: "Roraima" },
  { code: "SC", name: "Santa Catarina" },
  { code: "SP", name: "São Paulo" },
  { code: "SE", name: "Sergipe" },
  { code: "TO", name: "Tocantins" }
] as const;

// Municípios por estado (principais cidades de cada estado)
export const BRAZILIAN_CITIES_BY_STATE: Record<string, string[]> = {
  // Acre
  "AC": ["Rio Branco", "Cruzeiro do Sul", "Sena Madureira", "Tarauacá", "Feijó"],
  
  // Alagoas
  "AL": ["Maceió", "Arapiraca", "Palmeira dos Índios", "Rio Largo", "Penedo"],
  
  // Amapá
  "AP": ["Macapá", "Santana", "Laranjal do Jari", "Oiapoque", "Porto Grande"],
  
  // Amazonas
  "AM": ["Manaus", "Parintins", "Itacoatiara", "Manacapuru", "Coari"],
  
  // Bahia
  "BA": ["Salvador", "Feira de Santana", "Vitória da Conquista", "Camaçari", "Juazeiro"],
  
  // Ceará
  "CE": ["Fortaleza", "Caucaia", "Juazeiro do Norte", "Maracanaú", "Sobral"],
  
  // Distrito Federal
  "DF": ["Brasília", "Ceilândia", "Taguatinga", "Samambaia", "Planaltina"],
  
  // Espírito Santo
  "ES": ["Vitória", "Vila Velha", "Serra", "Cariacica", "Linhares"],
  
  // Goiás
  "GO": ["Goiânia", "Aparecida de Goiânia", "Anápolis", "Rio Verde", "Luziânia"],
  
  // Maranhão
  "MA": ["São Luís", "Imperatriz", "Timon", "Caxias", "Codó"],
  
  // Mato Grosso
  "MT": ["Cuiabá", "Várzea Grande", "Rondonópolis", "Sinop", "Tangará da Serra"],
  
  // Mato Grosso do Sul
  "MS": ["Campo Grande", "Dourados", "Três Lagoas", "Corumbá", "Ponta Porã"],
  
  // Minas Gerais
  "MG": ["Belo Horizonte", "Uberlândia", "Contagem", "Juiz de Fora", "Betim"],
  
  // Pará
  "PA": ["Belém", "Ananindeua", "Santarém", "Marabá", "Castanhal"],
  
  // Paraíba
  "PB": ["João Pessoa", "Campina Grande", "Santa Rita", "Patos", "Bayeux"],
  
  // Paraná
  "PR": ["Curitiba", "Londrina", "Maringá", "Ponta Grossa", "Cascavel"],
  
  // Pernambuco
  "PE": ["Recife", "Jaboatão dos Guararapes", "Olinda", "Caruaru", "Petrolina"],
  
  // Piauí
  "PI": ["Teresina", "Parnaíba", "Picos", "Piripiri", "Floriano"],
  
  // Rio de Janeiro
  "RJ": ["Rio de Janeiro", "São Gonçalo", "Duque de Caxias", "Nova Iguaçu", "Niterói"],
  
  // Rio Grande do Norte
  "RN": ["Natal", "Mossoró", "Parnamirim", "São Gonçalo do Amarante", "Macaíba"],
  
  // Rio Grande do Sul
  "RS": ["Porto Alegre", "Caxias do Sul", "Pelotas", "Canoas", "Santa Maria"],
  
  // Rondônia
  "RO": ["Porto Velho", "Ji-Paraná", "Ariquemes", "Vilhena", "Cacoal"],
  
  // Roraima
  "RR": ["Boa Vista", "Rorainópolis", "Caracaraí", "Alto Alegre", "Mucajaí"],
  
  // Santa Catarina
  "SC": ["Florianópolis", "Joinville", "Blumenau", "São José", "Criciúma"],
  
  // São Paulo
  "SP": ["São Paulo", "Guarulhos", "Campinas", "São Bernardo do Campo", "Santo André"],
  
  // Sergipe
  "SE": ["Aracaju", "Nossa Senhora do Socorro", "Lagarto", "Itabaiana", "Estância"],
  
  // Tocantins
  "TO": ["Palmas", "Araguaína", "Gurupi", "Porto Nacional", "Paraíso do Tocantins"]
};

// Categorias de e-mail
export const EMAIL_CATEGORIES = [
  "Trabalho",
  "Pessoal",
  "Financeiro",
  "Suporte",
  "Marketing",
  "Compras",
  "Outros"
] as const;

export const EMAIL_STATUSES = ['pending', 'classified', 'archived'] as const;

// ✅ Funções utilitárias para trabalhar com estados e municípios
export const getStateName = (stateCode: string): string => {
  const state = BRAZILIAN_STATES.find(s => s.code === stateCode);
  return state ? state.name : "Estado não encontrado";
};

export const getCitiesByState = (stateCode: string): string[] => {
  return BRAZILIAN_CITIES_BY_STATE[stateCode] || [];
};

export const getAllCities = (): string[] => {
  return Object.values(BRAZILIAN_CITIES_BY_STATE).flat();
};

// Tipos TypeScript
export type EmailCategory = typeof EMAIL_CATEGORIES[number];
export type BrazilianStateCode = typeof BRAZILIAN_STATES[number]['code'];
export type BrazilianStateName = typeof BRAZILIAN_STATES[number]['name'];

const STORAGE_KEY = 'email_manager_data';

// ✅ ATUALIZADA: Agora inclui o campo city
const generateMockEmails = (): Email[] => {
  const statuses: Email['status'][] = ['pending', 'classified', 'archived'];
  const priorities: Email['priority'][] = ['low', 'medium', 'high', 'urgent'];
  const senders = ['joao@empresa.com', 'maria@cliente.com', 'suporte@servico.com', 'pedro@parceiro.com', 'ana@fornecedor.com'];
  
  const emails: Email[] = [];
  const now = new Date();
  
  for (let i = 0; i < 25; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));

    // Seleciona um estado aleatório
    const randomState = BRAZILIAN_STATES[Math.floor(Math.random() * BRAZILIAN_STATES.length)];
    
    // Seleciona uma cidade aleatória do estado escolhido
    const stateCities = BRAZILIAN_CITIES_BY_STATE[randomState.code] || [];
    const randomCity = stateCities.length > 0 
      ? stateCities[Math.floor(Math.random() * stateCities.length)]
      : "";

    emails.push({
      id: `email-${i + 1}`,
      subject: `Assunto do E-mail ${i + 1}`,
      sender: senders[Math.floor(Math.random() * senders.length)],
      recipient: 'voce@empresa.com',
      content: `Este é o conteúdo do e-mail ${i + 1}. Contém informações importantes sobre ${randomCity ? `a cidade de ${randomCity}` : 'o estado'} ${randomState.name}.`,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      category: Math.random() > 0.3 
        ? EMAIL_CATEGORIES[Math.floor(Math.random() * EMAIL_CATEGORIES.length)] 
        : undefined,
      state: randomState.code,
      city: randomCity, // ✅ ADICIONANDO MUNICÍPIO
      date: date.toISOString(),
      tags: Math.random() > 0.5 ? ['importante', 'revisar'] : [],
    });
  }
  
  return emails;
};

export const getEmails = (): Email[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    const mockEmails = generateMockEmails();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockEmails));
    return mockEmails;
  }
  return JSON.parse(stored);
};

export const saveEmails = (emails: Email[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(emails));
};

// ✅ ATUALIZADA: Tipo Omit agora também inclui 'city'
export const addEmail = (email: Omit<Email, 'id' | 'date'>): Email => {
  const emails = getEmails();
  const newEmail: Email = {
    ...email,
    id: `email-${Date.now()}`,
    date: new Date().toISOString(),
  };

  emails.unshift(newEmail);
  saveEmails(emails);
  return newEmail;
};

export const updateEmail = (id: string, updates: Partial<Email>): Email | null => {
  const emails = getEmails();
  const index = emails.findIndex(e => e.id === id);
  if (index === -1) return null;
  
  emails[index] = { ...emails[index], ...updates };
  saveEmails(emails);
  return emails[index];
};

export const deleteEmail = (id: string): boolean => {
  const emails = getEmails();
  const filtered = emails.filter(e => e.id !== id);
  if (filtered.length === emails.length) return false;
  
  saveEmails(filtered);
  return true;
};

export const getEmailById = (id: string): Email | null => {
  const emails = getEmails();
  return emails.find(e => e.id === id) || null;
};

export const getEmailStats = () => {
  const emails = getEmails();
  const now = new Date();
  const last7Days = new Date(now);
  last7Days.setDate(last7Days.getDate() - 7);

  return {
    total: emails.length,
    pending: emails.filter(e => e.status === 'pending').length,
    classified: emails.filter(e => e.status === 'classified').length,
    archived: emails.filter(e => e.status === 'archived').length,
    urgent: emails.filter(e => e.priority === 'urgent').length,
    recent: emails.filter(e => new Date(e.date) >= last7Days).length,
    // Estatísticas por estado
    byState: BRAZILIAN_STATES.map(state => ({
      state: state.code,
      name: state.name,
      count: emails.filter(e => e.state === state.code).length
    })),
    // Estatísticas por categoria
    byCategory: EMAIL_CATEGORIES.map(category => ({
      category,
      count: emails.filter(e => e.category === category).length
    })),
    // ✅ NOVO: Estatísticas por município
    byCity: emails.reduce((acc, email) => {
      if (email.city) {
        const key = `${email.state}-${email.city}`;
        acc[key] = (acc[key] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>)
  };
};

// Função para buscar e-mails por estado
export const getEmailsByState = (stateCode: string): Email[] => {
  const emails = getEmails();
  return emails.filter(email => email.state === stateCode);
};

// ✅ NOVA: Função para buscar e-mails por município
export const getEmailsByCity = (city: string): Email[] => {
  const emails = getEmails();
  return emails.filter(email => email.city === city);
};

// ✅ NOVA: Função para buscar e-mails por estado e município
export const getEmailsByStateAndCity = (stateCode: string, city: string): Email[] => {
  const emails = getEmails();
  return emails.filter(email => email.state === stateCode && email.city === city);
};

// Função para buscar e-mails por categoria
export const getEmailsByCategory = (category: string): Email[] => {
  const emails = getEmails();
  return emails.filter(email => email.category === category);
};

// Função para buscar e-mails por status
export const getEmailsByStatus = (status: Email['status']): Email[] => {
  const emails = getEmails();
  return emails.filter(email => email.status === status);
};

// Função para buscar e-mails por intervalo de datas
export const getEmailsByDateRange = (startDate: Date, endDate: Date): Email[] => {
  const emails = getEmails();
  return emails.filter(email => {
    const emailDate = new Date(email.date);
    return emailDate >= startDate && emailDate <= endDate;
  });
};

// Função para limpar todos os e-mails (útil para testes)
export const clearAllEmails = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

// Função para recarregar com dados mock (útil para reset)
export const reloadMockData = (): Email[] => {
  const mockEmails = generateMockEmails();
  saveEmails(mockEmails);
  return mockEmails;
};

// ✅ NOVA: Função para obter todos os municípios únicos de um estado
export const getUniqueCitiesByState = (stateCode: string): string[] => {
  const emails = getEmails();
  const cities = emails
    .filter(email => email.state === stateCode && email.city)
    .map(email => email.city as string);
  
  return Array.from(new Set(cities)).sort();
};

// ✅ NOVA: Função para obter todos os municípios únicos
export const getAllUniqueCities = (): string[] => {
  const emails = getEmails();
  const cities = emails
    .filter(email => email.city)
    .map(email => email.city as string);
  
  return Array.from(new Set(cities)).sort();
};