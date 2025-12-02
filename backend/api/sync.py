# api/sync.py
from flask import Blueprint, jsonify
from services.imap_service import ImapService
from services.email_service import EmailService
from repositories.email_repository import EmailRepository
from services.firestore_client import get_firestore_client
import os

sync_bp = Blueprint('sync', __name__, url_prefix='/api/sync')

@sync_bp.route('/trigger', methods=['POST'])
def trigger_sync():
    """Trigger sincronização manual"""
    try:
        # IMAP Service
        imap = ImapService(
            email_addr=os.getenv('EMAIL_ADDRESS'),
            password=os.getenv('EMAIL_PASSWORD')
        )
        
        # Busca novos emails
        novos_emails = imap.fetch_new_emails()
        
        # Salva no banco
        db = get_firestore_client()
        repo = EmailRepository(db)
        service = EmailService(repo)
        
        salvos = []
        for email_obj in novos_emails:
            email_salvo = service.create_email(
                remetente=email_obj.remetente,
                destinatario=email_obj.destinatario,
                assunto=email_obj.assunto,
                corpo=email_obj.corpo,
                data=email_obj.data
            )
            salvos.append(email_salvo)
        
        return jsonify({
            'success': True,
            'message': f'{len(salvos)} emails sincronizados',
            'data': [e.to_dict() for e in salvos]
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500