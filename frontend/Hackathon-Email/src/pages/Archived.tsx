import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getEmails, type Email } from "@/lib/emailStorage";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Eye } from "lucide-react";

export default function Archived() {
  const navigate = useNavigate();
  const [emails, setEmails] = useState<Email[]>([]);

  useEffect(() => {
    const allEmails = getEmails();
    const archivedEmails = allEmails.filter(e => e.status === "archived");
    setEmails(archivedEmails);
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
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
            <Card key={email.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{email.subject ?? "(Sem assunto)"}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{email.sender}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(email.date).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/email/${email.id}`)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Detalhes
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
