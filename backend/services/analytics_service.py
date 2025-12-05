# services/analytics_service.py
from repositories.email_repository import EmailRepository
from repositories.funcionario_repository import FuncionarioRepository
from collections import Counter
from datetime import datetime, timedelta, timezone

class AnalyticsService:
    """Service para analytics do dashboard"""
    
    def __init__(self, email_repository: EmailRepository, funcionario_repository: FuncionarioRepository):
        self.email_repository = email_repository
        self.funcionario_repository = funcionario_repository
    
    def get_dashboard_stats(self) -> dict:
        """Retorna estatísticas do dashboard"""
        emails = self.email_repository.find_all()
        
        total = len(emails)
        classificados = sum(1 for e in emails if getattr(e, "classificado", False))
        pendentes = total - classificados
        
        # Emails por estado
        estados = Counter(e.estado for e in emails if getattr(e, "estado", None))
        
        # Top 5 funcionários (remetentes) da coleção funcionarios
        top_funcionarios = self.funcionario_repository.get_top_senders(limit=5)
        top_remetentes = [
            {
                'nome': f.nome or f.email.split('@')[0],  # Se não tiver nome, usa parte antes do @
                'email': f.email,
                'total_emails': f.total_emails
            }
            for f in top_funcionarios
        ]
        
        # Top 3 destinatários (mantido do código original)
        destinatarios = Counter(e.destinatario for e in emails if getattr(e, "destinatario", None))
        top_destinatarios = [
            {'destinatario': dest, 'count': count} 
            for dest, count in destinatarios.most_common(3)
        ]
        
        # Últimos 7 dias (em UTC)
        sete_dias = datetime.now(timezone.utc) - timedelta(days=7)
        emails_recentes = [
            e for e in emails 
            if e.data and e.data >= sete_dias
        ]
        
        return {
            'total': total,
            'classificados': classificados,
            'pendentes': pendentes,
            'emails_por_estado': dict(estados),
            'emails_ultimos_7_dias': len(emails_recentes),
            'top_remetentes': top_remetentes, 
            'top_destinatarios': top_destinatarios 
        }   