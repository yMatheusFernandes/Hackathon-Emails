# repositories/funcionario_repository.py
from google.cloud import firestore
from models.funcionario import Funcionario
from typing import List, Optional

class FuncionarioRepository:
    """Repositório para persistência de funcionários"""
    
    def __init__(self, db: firestore.Client):
        self.db = db
        self.collection = db.collection('funcionarios')
    
    def find_by_email(self, email: str) -> Optional[Funcionario]:
        """Busca funcionário pelo email"""
        docs = self.collection.where('email', '==', email).limit(1).stream()
        
        for doc in docs:
            data = doc.to_dict()
            data['id'] = doc.id
            return Funcionario.from_dict(data)
        
        return None
    
    def create(self, funcionario: Funcionario) -> Funcionario:
        """Cria novo funcionário"""
        doc_ref = self.collection.document()
        funcionario.id = doc_ref.id
        doc_ref.set(funcionario.to_dict())
        return funcionario
    
    def update(self, funcionario: Funcionario) -> Funcionario:
        """Atualiza funcionário"""
        self.collection.document(funcionario.id).update(funcionario.to_dict())
        return funcionario
    
    def find_all(self) -> List[Funcionario]:
        """Lista todos funcionários"""
        docs = self.collection.stream()
        
        funcionarios = []
        for doc in docs:
            data = doc.to_dict()
            data['id'] = doc.id
            funcionarios.append(Funcionario.from_dict(data))
        
        return funcionarios
    
    def get_top_senders(self, limit: int = 3) -> List[Funcionario]:
        """Retorna top N funcionários que mais enviam emails"""
        docs = self.collection.order_by('total_emails', direction=firestore.Query.DESCENDING).limit(limit).stream()
        
        funcionarios = []
        for doc in docs:
            data = doc.to_dict()
            data['id'] = doc.id
            funcionarios.append(Funcionario.from_dict(data))
        
        return funcionarios
    
    def increment_email_count(self, funcionario_id: str, email_id: str):
        """Incrementa contador de emails e adiciona ID do email"""
        doc_ref = self.collection.document(funcionario_id)
        
        doc_ref.update({
            'total_emails': firestore.Increment(1),
            'emails_enviados': firestore.ArrayUnion([email_id])
        })