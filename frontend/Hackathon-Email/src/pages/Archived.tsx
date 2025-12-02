import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getEmails } from "@/lib/emailStorage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

type Email = {
  id: string;
  from?: string;
  subject?: string;
  date: string;
  status?: string;
};

export default function Archived() {
  const navigate = useNavigate();
  const [emails, setEmails] = useState<Email[]>([]);

  useEffect(() => {
    const allEmails = getEmails();
    const archivedEmails = allEmails.filter(e => e.status === "archived");
    setEmails(archivedEmails);
  }, []);

  return (
    <div className="space-y-6 p-4 animate-fade-in">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">E-mails Arquivados</h1>
          <p className="text-sm text-muted-foreground">{emails.length} e-mail(s) arquivado(s)</p>
        </div>
      </div>

      <div className="grid gap-3">
        {emails.length === 0 ? (
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-center py-8">Nenhum e-mail arquivado.</p>
            </CardContent>
          </Card>
        ) : (
          emails.map(email => (
            <Card key={email.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{email.subject ?? "(Sem assunto)"}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{email.from}</p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(email.date).toLocaleString('pt-BR')}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
