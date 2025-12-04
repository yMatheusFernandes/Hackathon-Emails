import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, ArrowLeft } from "lucide-react";
import { getEmails, type Email } from "@/lib/emailStorage";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function SenderEmails() {
  const navigate = useNavigate();
  const query = useQuery();
  const sender = query.get("sender");

  const [emails, setEmails] = useState<Email[]>([]);
  const [filtered, setFiltered] = useState<Email[]>([]);

  useEffect(() => {
    const all = getEmails();
    setEmails(all);
  }, []);

  useEffect(() => {
    if (!sender) return;
    setFiltered(emails.filter((e) => e.sender === sender));
  }, [emails, sender]);

  const getStatusColor = (status: Email["status"]) =>
    ({
      pending: "bg-yellow-200 text-yellow-700",
      classified: "bg-green-200 text-green-700",
      archived: "bg-gray-200 text-gray-700",
      urgent: "bg-red-200 text-red-700",
    }[status] ?? "");

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
            Total de {filtered.length} e-mails enviados
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={() => navigate("/all-emails")}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
        </Button>
      </div>

      {/* Lista de e-mails */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Nenhum e-mail encontrado para este remetente
          </CardContent>
        </Card>
      ) : (
        filtered.map((email) => (
          <Card key={email.id} className="hover:shadow-md transition">
            <CardContent className="p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold">{email.subject}</h3>
                <Badge className={getStatusColor(email.status)}>{email.status}</Badge>
                {email.category && <Badge variant="outline">{email.category}</Badge>}
                {email.state && <Badge variant="outline">{email.state}</Badge>}
              </div>

              <p className="text-sm text-muted-foreground">
                Enviado em{" "}
                {new Date(email.date).toLocaleDateString("pt-BR", {
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
