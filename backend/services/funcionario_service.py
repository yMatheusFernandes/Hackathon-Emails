# services/funcionario_service.py
from repositories.funcionario_repository import FuncionarioRepository
from models.funcionario import Funcionario
from typing import Optional

class FuncionarioService:
    """Service para gerenciar funcionários"""
    
    def __init__(self, repository: FuncionarioRepository):
        self.repository = repository
    
    def get_or_create_funcionario(self, email: str, nome: Optional[str] = None, ativo: bool = True) -> Funcionario:
        """
        Busca funcionário por email, se não existir cria um novo
        """
        funcionario = self.repository.find_by_email(email)
        
        if not funcionario:
            # Cria novo funcionário
            funcionario = Funcionario(
                email=email,
                nome=nome,
                total_emails=0,
                ativo=ativo
            )
            funcionario = self.repository.create(funcionario)
            print(f"✨ Novo funcionário criado: {email}")
        else:
            # Atualiza nome se veio diferente
            if nome and funcionario.nome != nome:
                funcionario.nome = nome
                self.repository.update(funcionario)
        
        return funcionario
    
    def register_email_sent(self, email_remetente: str, nome_remetente: Optional[str], email_id: str, ativo: bool = True):
        """
        Registra que um funcionário enviou um email
        """
        # Busca ou cria funcionário
        funcionario = self.get_or_create_funcionario(email_remetente, nome_remetente, ativo)
        
        # Incrementa contador e adiciona ID do email
        self.repository.increment_email_count(funcionario.id, email_id)
        
        print(f"📧 Email registrado para {funcionario.nome or funcionario.email}")
    
    def get_top_senders(self, limit: int = 3):
        """Retorna top funcionários que mais enviam"""
        return self.repository.get_top_senders(limit)
    
    def get_all_funcionarios(self):
        """Lista todos funcionários"""
        return self.repository.find_all()