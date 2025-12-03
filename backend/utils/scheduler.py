# utils/scheduler.py
from apscheduler.schedulers.background import BackgroundScheduler
from services.imap_service import ImapService
from services.email_service import EmailService
from repositories.email_repository import EmailRepository
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
        
        # Salva
        db = get_firestore_client()
        repo = EmailRepository(db)
        service = EmailService(repo)
        
        for email_obj in novos:
            service.create_email(
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
    scheduler.add_job(sync_emails_job, 'interval', minutes=0.1)
    scheduler.start()
    print("🚀 Scheduler iniciado - sync a cada 1 minuto")