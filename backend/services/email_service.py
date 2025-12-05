# services/email_service.py
from repositories.email_repository import EmailRepository
from services.funcionario_service import FuncionarioService
from models.email import Email
from utils.email_parser import EmailParser
from typing import List

class EmailService:
    """Service com lógica de negócio"""
    
    def __init__(self, repository: EmailRepository, funcionario_service: FuncionarioService = None):
        self.repository = repository
        self.funcionario_service = funcionario_service
        self.email_parser = EmailParser()
    
    def create_email(self, remetente: str, destinatario: str, 
                     assunto: str, corpo: str, data, 
                     estado: str = None, municipio: str = None, categoria: str = None) -> Email:
        """Cria email (manual ou automático)"""
        
        # Extrai email e nome do remetente
        email_remetente, nome_remetente = self.email_parser.extract_email_and_name(remetente)
        
        # Extrai apenas email do destinatário
        email_destinatario, _ = self.email_parser.extract_email_and_name(destinatario)
        
        # Cria email
        email = Email(
            remetente=email_remetente,  # Apenas o email
            destinatario=email_destinatario,  # Apenas o email
            assunto=assunto,
            corpo=corpo,
            data=data,
            estado=estado,
            municipio=municipio,
            categoria=categoria,
            classificado=bool(estado and municipio)
        )
        
        # Salva email
        email = self.repository.create(email)
        
        # Registra funcionário (se service disponível)
        if self.funcionario_service:
            self.funcionario_service.register_email_sent(
                email_remetente=email_remetente,
                nome_remetente=nome_remetente,
                email_id=email.id,
                ativo=True
            )
        
        return email
    
    def classify_email(self, email_id: str, estado: str, municipio: str, categoria: str) -> Email:
        """Classifica email pendente"""
        email = self.repository.find_by_id(email_id)
        
        if not email:
            raise ValueError(f"Email {email_id} não encontrado")
        
        email.estado = estado
        email.municipio = municipio
        email.categoria = categoria
        email.classificado = True
        
        return self.repository.update(email)
    
    def get_all_emails(self) -> List[Email]:
        """Lista todos emails"""
        return self.repository.find_all()
    
    def get_pending_emails(self) -> List[Email]:
        """Lista emails pendentes"""
        return self.repository.find_pending()
    
    def get_emails_by_id(self, email_id: str) -> Email:
        """Busca email por ID"""
        email = self.repository.find_by_id(email_id)
        if not email:
            raise ValueError(f"Email {email_id} não encontrado")
        return email
    
    def delete_email(self, email_id: str):
        """Exclui email"""
        email = self.repository.find_by_id(email_id)
        if not email:
            raise ValueError(f"Email {email_id} não encontrado")
        self.repository.delete(email_id)