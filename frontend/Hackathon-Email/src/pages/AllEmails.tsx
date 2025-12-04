import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Eye, Search, X } from "lucide-react";
import { getEmails, type Email } from "@/lib/emailStorage";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function AllEmails() {
  const navigate = useNavigate();
  const query = useQuery();
  const location = useLocation();

  const urlSender = query.get("sender") ?? "all";
  const [emails, setEmails] = useState<Email[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [senderFilter, setSenderFilter] = useState(urlSender);

  useEffect(() => {
    const all = getEmails();
    setEmails(all);
    setSenderFilter(urlSender);
  }, [location.search]);

  // Agrupa os e-mails por remetente
  const groupedEmails = emails.reduce((acc, email) => {
    if (senderFilter !== "all" && email.sender !== senderFilter) return acc;

    if (searchTerm) {
      const matches =
        email.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.content.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matches) return acc;
    }

    if (!acc[email.sender]) acc[email.sender] = [];
    acc[email.sender].push(email);
    return acc;
  }, {} as Record<string, Email[]>);

  const clearFilters = () => {
    setSearchTerm("");
    setSenderFilter("all");
    navigate("/all-emails");
  };

  const getStatusColor = (status: Email["status"]) =>
    ({
      pending: "bg-yellow-200 text-yellow-700",
      classified: "bg-green-200 text-green-700",
      archived: "bg-gray-200 text-gray-700",
      urgent: "bg-red-200 text-red-700",
    }[status] ?? "");

  const senderKeys = Object.keys(groupedEmails);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-1">Todos os E-mails</h1>
          {senderFilter !== "all" ? (
            <p className="text-muted-foreground">
              Mostrando e-mails de <strong>{senderFilter}</strong>
            </p>
          ) : (
            <p className="text-muted-foreground">
              Pesquise um remetente ou palavra-chave
            </p>
          )}
        </div>

        {senderFilter !== "all" || searchTerm ? (
          <Button variant="outline" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" /> Limpar filtros
          </Button>
        ) : null}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" /> Buscar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Digite o nome ou e-mail do remetente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
          <p className="text-sm text-muted-foreground mt-2">
            Encontrados {senderKeys.length} remetentes
          </p>
        </CardContent>
      </Card>

      {senderKeys.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Nenhum e-mail encontrado
          </CardContent>
        </Card>
      ) : (
        senderKeys.map((sender) => (
          <Card key={sender} className="hover:shadow-md transition">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-lg font-semibold">{sender}</CardTitle>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate(`/sender-emails?sender=${encodeURIComponent(sender)}`)}

              >
                Ver todos os e-mails
              </Button>
            </CardHeader>

            <CardContent className="space-y-3">
              {groupedEmails[sender].slice(0, 3).map((email) => (
                <div key={email.id} className="border rounded-md p-3 flex flex-col gap-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-medium">{email.subject}</h3>
                    <Badge className={getStatusColor(email.status)}>
                      {email.status}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {new Date(email.date).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => navigate(`/email/${email.id}`)}
                    className="self-start text-sm"
                  >
                    <Eye className="h-4 w-4 mr-1" /> Ver e-mail
                  </Button>
                </div>
              ))}

              {groupedEmails[sender].length > 3 && (
                <p className="text-xs text-muted-foreground">
                  +{groupedEmails[sender].length - 3} e-mails adicionais...
                </p>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
