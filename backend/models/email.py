# models/email.py
from dataclasses import dataclass
from datetime import datetime
from typing import Optional

@dataclass
class Email:
    """Model simples de Email"""
    remetente: str
    destinatario: str
    assunto: str
    corpo: str
    data: datetime
    id: Optional[str] = None
    estado: Optional[str] = None
    municipio: Optional[str] = None
    classificado: bool = False
    
    def to_dict(self):
        """Converte para dict (Firestore/JSON)"""
        return {
            'id': self.id,
            'remetente': self.remetente,
            'destinatario': self.destinatario,
            'assunto': self.assunto,
            'corpo': self.corpo,
            'data': self.data,
            'estado': self.estado,
            'municipio': self.municipio,
            'classificado': self.classificado
        }
    
    @staticmethod
    def from_dict(data: dict):
        """Cria Email a partir de dict"""
        return Email(
            id=data.get('id'),
            remetente=data['remetente'],
            destinatario=data['destinatario'],
            assunto=data['assunto'],
            corpo=data['corpo'],
            data=data['data'],
            estado=data.get('estado'),
            municipio=data.get('municipio'),
            classificado=data.get('classificado', False)
        )