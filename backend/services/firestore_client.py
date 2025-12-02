# services/firestore_client.py
import firebase_admin
from firebase_admin import credentials, firestore
from google.cloud.firestore import Client
import os
from dotenv import load_dotenv

# Carrega variáveis de ambiente
load_dotenv()

# Singleton - inicializa apenas 1 vez
_firestore_client = None

def get_firestore_client() -> Client:
    """
    Retorna instância única do Firestore Client (Singleton Pattern)
    """
    global _firestore_client
    
    if _firestore_client is None:
        try:
            # Caminho do arquivo de credenciais
            cred_path = os.getenv('FIREBASE_CREDENTIALS_PATH', 'credentials.json')
            
            # Inicializa Firebase Admin SDK
            cred = credentials.Certificate(cred_path)
            
            # Verifica se já foi inicializado (evita erro)
            if not firebase_admin._apps:
                firebase_admin.initialize_app(cred)
            
            # Cria cliente Firestore
            _firestore_client = firestore.client()
            
            print("✅ Firestore conectado com sucesso!")
            
        except Exception as e:
            print(f"❌ Erro ao conectar Firestore: {e}")
            raise
    
    return _firestore_client


def test_connection():
    """
    Testa conexão com Firestore
    """
    try:
        db = get_firestore_client()
        
        # Tenta criar um documento de teste
        test_ref = db.collection('_test').document('connection_test')
        test_ref.set({'timestamp': firestore.SERVER_TIMESTAMP})
        
        # Lê o documento
        doc = test_ref.get()
        
        if doc.exists:
            print("✅ Conexão testada com sucesso!")
            print(f"   Dados: {doc.to_dict()}")
            
            # Remove documento de teste
            test_ref.delete()
            return True
        else:
            print("❌ Documento de teste não encontrado")
            return False
            
    except Exception as e:
        print(f"❌ Erro no teste de conexão: {e}")
        return False


if __name__ == '__main__':
    # Testa conexão ao executar este arquivo diretamente
    test_connection()