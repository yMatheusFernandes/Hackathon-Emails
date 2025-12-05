import axios from "axios";

// URL base da sua API Flask
const API_URL = "http://127.0.0.1:5000";

// Cria uma instância do Axios
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 segundos — valor padrão bom para APIs locais
});

// Tratamento de erros padrão
const handleError = (error: unknown, context: string) => {
  console.error(`Erro ao ${context}:`, error);

  if (axios.isAxiosError(error)) {
    if (error.response) {
      return {
        error:
          error.response.data?.message ||
          error.response.data?.error ||
          `Erro ao ${context}`,
        status: error.response.status,
      };
    } else if (error.request) {
      return {
        error: "Sem resposta do servidor. Verifique se o Flask está rodando.",
        status: 503,
      };
    }
  }

  return { error: `Erro inesperado ao ${context}` };
};

// ==================== ENDPOINTS ====================

// Dashboard Stats
export const fetchDashboardStats = async () => {
  try {
    const response = await api.get("/api/dashboard/stats");
    return response.data;
  } catch (error) {
    return handleError(error, "buscar estatísticas do dashboard");
  }
};

// Emails
export const fetchEmails = async () => {
  try {
    const response = await api.get("/api/emails");
    return response.data;
    
  } catch (error) {
    return handleError(error, "buscar emails");
  }
};

// Emails
export const fetchEmailsPending = async () => {
  try {
    const response = await api.get("/api/emails/pending");
    return response.data;
  } catch (error) {
    return handleError(error, "buscar emails pendentes");
  }
};

export const classifyEmail = async (
  email_id: string,
  estado: string,
  municipio: string,
  categoria: string
) => {
  try {
    const response = await api.put(`/api/emails/${email_id}/classify`, {
      estado,
      municipio,
      categoria
    });

    return response.data;
  } catch (error: any) {
    console.error("Erro ao classificar email:", error);
    throw error;
  }
};

// =============================
// 📌 Buscar um único e-mail
// =============================
export const fetchEmailById = async (emailId: string) => {
  try {
    const response = await api.get(`/api/emails/${emailId}`);

    if (response?.data?.data) return response.data.data;
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar email por id:", error);
    return null;
  }
};

// =============================
// 📌 Criar e-mail manualmente
// =============================
export const createEmail = async (emailData: any) => {
  try {
    const response = await api.post("/api/emails/create", emailData);
    return response.data;
  } catch (error) {
    console.error("Erro ao criar email manual:", error);
    throw error;
  }
};

export async function deleteEmailAPI(emailId: string) {
  try {
    const res = await api.delete(`api/emails/${emailId}`);
    return res.data;
  } catch (err) {
    console.error("Erro ao deletar e-mail:", err);
    throw err;
  }
}


// Exporte tudo junto se quiser usar "import * as api"
export default {
  fetchDashboardStats,
  fetchEmails,
  fetchEmailsPending,
  classifyEmail,
  fetchEmailById,
  createEmail,
  deleteEmailAPI,
};
