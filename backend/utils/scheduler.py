# utils/scheduler.py
from apscheduler.schedulers.background import BackgroundScheduler
from services.imap_service import ImapService
from services.email_service import EmailService
from services.funcionario_service import FuncionarioService
from repositories.email_repository import EmailRepository
from repositories.funcionario_repository import FuncionarioRepository
from services.firestore_client import get_firestore_client
import os

def sync_emails_job():
    """Job que roda a cada 1 minuto"""
    try:
        # IMAP
        imap = ImapService(
            email_addr=os.getenv('EMAIL_ADDRESS'),
            password=os.getenv('EMAIL_PASSWORD')
        )
        
        novos = imap.fetch_new_emails()
        
        # Setup services
        db = get_firestore_client()
        email_repo = EmailRepository(db)
        func_repo = FuncionarioRepository(db)
        
        func_service = FuncionarioService(func_repo)
        email_service = EmailService(email_repo, func_service)  # Passa funcionario_service
        
        # Salva emails e registra funcionários
        for email_obj in novos:
            email_service.create_email(
                remetente=email_obj.remetente,
                destinatario=email_obj.destinatario,
                assunto=email_obj.assunto,
                corpo=email_obj.corpo,
                data=email_obj.data
            )
        
        print(f"✅ {len(novos)} emails sincronizados")
        
    except Exception as e:
        print(f"❌ Erro no sync: {e}")

def start_scheduler():
    """Inicia scheduler"""
    scheduler = BackgroundScheduler()
    scheduler.add_job(sync_emails_job, 'interval', seconds=6, max_instances=3)
    scheduler.start()
    print("🚀 Scheduler iniciado - sync a cada 6 segundos")