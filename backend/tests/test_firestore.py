# test_firestore.py
from services.firestore_client import get_firestore_client, test_connection
from datetime import datetime

def test_crud_operations():
    """Testa operações CRUD no Firestore"""
    
    print("\n🧪 Testando operações CRUD no Firestore...\n")
    
    try:
        db = get_firestore_client()
        
        # CREATE
        print("1️⃣ CREATE - Criando documento de teste...")
        test_data = {
            'remetente': 'teste@example.com',
            'destinatario': 'cliente@example.com',
            'assunto': 'Email de Teste',
            'corpo': 'Conteúdo de teste',
            'data': datetime.now(),
            'classificado': False
        }
        
        doc_ref = db.collection('emails').document()
        doc_ref.set(test_data)
        doc_id = doc_ref.id
        print(f"   ✅ Documento criado com ID: {doc_id}")
        
        # READ
        print("\n2️⃣ READ - Lendo documento...")
        doc = db.collection('emails').document(doc_id).get()
        if doc.exists:
            print(f"   ✅ Documento encontrado: {doc.to_dict()}")
        else:
            print("   ❌ Documento não encontrado")
            return False
        
        # UPDATE
        print("\n3️⃣ UPDATE - Atualizando documento...")
        db.collection('emails').document(doc_id).update({
            'classificado': True,
            'estado': 'PI',
            'municipio': 'Piripiri'
        })
        print("   ✅ Documento atualizado")
        
        # READ UPDATED
        doc_updated = db.collection('emails').document(doc_id).get()
        print(f"   📄 Dados atualizados: {doc_updated.to_dict()}")
        
        # QUERY
        print("\n4️⃣ QUERY - Buscando documentos classificados...")
        classificados = db.collection('emails').where('classificado', '==', True).stream()
        count = 0
        for doc in classificados:
            count += 1
            print(f"   📧 {doc.id}: {doc.to_dict()}")
        print(f"   ✅ Encontrados {count} emails classificados")
        
        # DELETE
        print("\n5️⃣ DELETE - Removendo documento de teste...")
        db.collection('emails').document(doc_id).delete()
        print("   ✅ Documento removido")
        
        # VERIFY DELETE
        doc_deleted = db.collection('emails').document(doc_id).get()
        if not doc_deleted.exists:
            print("   ✅ Confirmado: documento não existe mais")
        
        print("\n✅ TODOS OS TESTES PASSARAM! Firestore está funcionando perfeitamente!\n")
        return True
        
    except Exception as e:
        print(f"\n❌ ERRO nos testes: {e}\n")
        return False


if __name__ == '__main__':
    # Testa conexão básica
    test_connection()
    
    # Testa operações CRUD
    test_crud_operations()