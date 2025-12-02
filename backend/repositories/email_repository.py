# repositories/email_repository.py
from google.cloud import firestore
from models.email import Email
from typing import List, Optional
from services.firestore_client import get_firestore_client

class EmailRepository:
    """Repositório para persistência de emails no Firestore"""
    
    def __init__(self, db):
        self.db = db
        self.collection = self.db.collection('emails')
    
    def create(self, email: Email) -> Email:
        """Cria novo email"""
        doc_ref = self.collection.document()
        email.id = doc_ref.id
        
        # Converte datetime para timestamp do Firestore
        email_dict = email.to_dict()
        email_dict['data'] = firestore.SERVER_TIMESTAMP
        
        doc_ref.set(email_dict)
        return email
    
    def find_by_id(self, email_id: str) -> Optional[Email]:
        """Busca email por ID"""
        doc = self.collection.document(email_id).get()
        
        if not doc.exists:
            return None
        
        data = doc.to_dict()
        data['id'] = doc.id
        return Email.from_dict(data)
    
    def find_all(self) -> List[Email]:
        """Lista todos emails"""
        docs = self.collection.order_by('data', direction=firestore.Query.DESCENDING).stream()
        
        emails = []
        for doc in docs:
            data = doc.to_dict()
            data['id'] = doc.id
            emails.append(Email.from_dict(data))
        
        return emails
    
    def find_pending(self) -> List[Email]:
        """Lista emails pendentes (não classificados)"""
        docs = self.collection.where('classificado', '==', False).stream()
        
        emails = []
        for doc in docs:
            data = doc.to_dict()
            data['id'] = doc.id
            emails.append(Email.from_dict(data))
        
        return emails
    
    def update(self, email: Email) -> Email:
        """Atualiza email"""
        self.collection.document(email.id).update(email.to_dict())
        return email
    
    def delete(self, email_id: str) -> bool:
        """Deleta email"""
        self.collection.document(email_id).delete()
        return True
    
    def count_by_estado(self) -> dict:
        """Conta emails por estado (para dashboard)"""
        docs = self.collection.stream()
        
        estados = {}
        for doc in docs:
            data = doc.to_dict()
            estado = data.get('estado')
            if estado:
                estados[estado] = estados.get(estado, 0) + 1
        
        return estados