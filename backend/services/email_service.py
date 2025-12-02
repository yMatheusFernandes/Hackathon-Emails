# services/email_service.py
from repositories.email_repository import EmailRepository
from models.email import Email
from typing import List

class EmailService:
    """Service com lógica de negócio"""
    
    def __init__(self, repository: EmailRepository):
        self.repository = repository
    
    def create_email(self, remetente: str, destinatario: str, 
                     assunto: str, corpo: str, data, 
                     estado: str = None, municipio: str = None) -> Email:
        """Cria email (manual ou automático)"""
        email = Email(
            remetente=remetente,
            destinatario=destinatario,
            assunto=assunto,
            corpo=corpo,
            data=data,
            estado=estado,
            municipio=municipio,
            classificado=bool(estado and municipio)
        )
        return self.repository.create(email)
    
    def classify_email(self, email_id: str, estado: str, municipio: str) -> Email:
        """Classifica email pendente"""
        email = self.repository.find_by_id(email_id)
        
        if not email:
            raise ValueError(f"Email {email_id} não encontrado")
        
        email.estado = estado
        email.municipio = municipio
        email.classificado = True
        
        return self.repository.update(email)
    
    def get_all_emails(self) -> List[Email]:
        """Lista todos emails"""
        return self.repository.find_all()
    
    def get_pending_emails(self) -> List[Email]:
        """Lista emails pendentes"""
        return self.repository.find_pending()