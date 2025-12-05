import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, ArrowLeft } from "lucide-react";
import { fetchEmails } from "@/services/api"; // <--- AGORA É API!
import { type Email } from "@/lib/emailStorage";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function SenderEmails() {
  const navigate = useNavigate();
  const query = useQuery();
  const sender = query.get("sender");

  const [emails, setEmails] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);

  // 1) Carrega TODOS da API
  useEffect(() => {
    async function load() {
      try {
        const result = await fetchEmails(); // GET /api/emails
        const resultEmails: Email[] = result.data.map((e: any) => ({
                  id: e.id,
                  subject: e.assunto,
                  sender: e.remetente,
                  receiver: e.destinatario,
                  content: e.corpo,
                  date: e.data,
                  status: e.classificado ? "classified" : "pending",
                  state: e.estado,
                  city: e.municipio,
                  category: e.categoria,   // ainda não vem da API
                  tags: [],
                })); 
        //console.log("Emails da API:", result);
        setEmails(resultEmails || []);
      } catch (err) {
        console.error("Erro ao carregar emails:", err);
      }
    }
    load();
  }, []);

  // 2) Filtra só os do remetente
  useEffect(() => {
    if (!sender) return;
    const list = emails.filter((e) => e.remetente === sender || e.sender === sender);
    console.log("Filtrados:", list);
    setFiltered(list);
  }, [emails, sender]);

  const getStatusColor = (status: string) =>
    ({
      pending: "bg-yellow-200 text-yellow-700",
      classified: "bg-green-200 text-green-700",
      archived: "bg-gray-200 text-gray-700",
    }[status] || "bg-gray-200 text-gray-700");

  if (!sender) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          Nenhum remetente selecionado
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-1">{sender}</h1>
          <p className="text-muted-foreground">
            Total de {filtered.length} e-mails
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={() => navigate("/all-emails")}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
        </Button>
      </div>

      {/* Lista */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Nenhum e-mail encontrado para este remetente.
          </CardContent>
        </Card>
      ) : (
        filtered.map((email) => (
          <Card key={email.id} className="hover:shadow-md transition">
            <CardContent className="p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold">{email.assunto || email.subject}</h3>
                <Badge className={getStatusColor(email.status)}>{email.status}</Badge>
                {email.category && <Badge variant="outline">{email.category}</Badge>}
                {email.city && <Badge variant="outline">{email.city}</Badge>}
              </div>

              <p className="text-sm text-muted-foreground">
                Recebido em{" "}
                {new Date(email.data || email.date).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>

              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate(`/email/${email.id}`)}
              >
                <Eye className="h-4 w-4 mr-1" /> Ver e-mail
              </Button>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
