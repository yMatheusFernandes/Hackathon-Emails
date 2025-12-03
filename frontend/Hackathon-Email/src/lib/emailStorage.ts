export interface Email {
  id: string;
  subject: string;
  sender: string;
  recipient: string;
  content: string;
  status: 'pending' | 'classified' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category?: string;
  state: string;          // <- Adicionado
  date: string;
  tags?: string[];
}

const STORAGE_KEY = 'email_manager_data';

// Lista de UFs para geração dos mocks
const states = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG",
"PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

const generateMockEmails = (): Email[] => {
  const statuses: Email['status'][] = ['pending', 'classified', 'archived'];
  const priorities: Email['priority'][] = ['low', 'medium', 'high', 'urgent'];
  const categories = ['Trabalho', 'Pessoal', 'Financeiro', 'Suporte', 'Marketing'];
  const senders = ['joao@empresa.com', 'maria@cliente.com', 'suporte@servico.com', 'pedro@parceiro.com', 'ana@fornecedor.com'];
  
  const emails: Email[] = [];
  const now = new Date();
  
  for (let i = 0; i < 25; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));

    emails.push({
      id: `email-${i + 1}`,
      subject: `Assunto do E-mail ${i + 1}`,
      sender: senders[Math.floor(Math.random() * senders.length)],
      recipient: 'voce@empresa.com',
      content: `Este é o conteúdo do e-mail ${i + 1}. Contém informações importantes sobre o assunto em questão.`,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      category: Math.random() > 0.3 ? categories[Math.floor(Math.random() * categories.length)] : undefined,
      state: states[Math.floor(Math.random() * states.length)],   // <- atribuição automática
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
  };
};
