# services/analytics_service.py
from repositories.email_repository import EmailRepository
from collections import Counter
from datetime import datetime, timedelta

class AnalyticsService:
    """Service para analytics do dashboard"""
    
    def __init__(self, repository: EmailRepository):
        self.repository = repository
    
    def get_dashboard_stats(self) -> dict:
        """Retorna estatísticas do dashboard"""
        emails = self.repository.find_all()
        
        total = len(emails)
        classificados = sum(1 for e in emails if e.classificado)
        pendentes = total - classificados
        
        # Emails por estado
        estados = Counter(e.estado for e in emails if e.estado)
        
        # Top 3 destinatários
        destinatarios = Counter(e.destinatario for e in emails)
        top_destinatarios = [
            {'destinatario': dest, 'count': count} 
            for dest, count in destinatarios.most_common(3)
        ]
        
        # Últimos 7 dias
        sete_dias = datetime.now() - timedelta(days=7)
        emails_recentes = [e for e in emails if e.data >= sete_dias]
        
        return {
            'total': total,
            'classificados': classificados,
            'pendentes': pendentes,
            'emails_por_estado': dict(estados),
            'emails_ultimos_7_dias': len(emails_recentes),
            'top_destinatarios': top_destinatarios
        }