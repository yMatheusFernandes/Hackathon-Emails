# models/funcionario.py
from dataclasses import dataclass
from typing import Optional, List

@dataclass
class Funcionario:
    """Model de Funcionário"""
    email: str
    nome: Optional[str] = None
    id: Optional[str] = None
    emails_enviados: List[str] = None  # Lista de IDs de emails
    total_emails: int = 0
    ativo: bool = True
    
    def __post_init__(self):
        if self.emails_enviados is None:
            self.emails_enviados = []
    
    def to_dict(self):
        """Converte para dict (Firestore/JSON)"""
        return {
            'email': self.email,
            'nome': self.nome,
            'emails_enviados': self.emails_enviados,
            'total_emails': self.total_emails,
            'ativo': self.ativo
        }
    
    @staticmethod
    def from_dict(data: dict):
        """Cria Funcionario a partir de dict"""
        return Funcionario(
            id=data.get('id'),
            email=data['email'],
            nome=data.get('nome'),
            emails_enviados=data.get('emails_enviados', []),
            total_emails=data.get('total_emails', 0),
            ativo=data.get('ativo', True)
        )