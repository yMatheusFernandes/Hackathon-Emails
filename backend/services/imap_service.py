# services/imap_service.py
import imaplib
import email
from datetime import datetime
from models.email import Email
from typing import List
import os

class ImapService:
    """Service para sincronização IMAP"""

    def __init__(self, email_addr: str, password: str):
        self.email = email_addr
        self.password = password
        self.server = os.getenv("EMAIL_IMAP_HOST", "imap.gmail.com")
        self.port = int(os.getenv("EMAIL_IMAP_PORT", "993"))

    def fetch_new_emails(self) -> List[Email]:
        mail = imaplib.IMAP4_SSL(self.server, self.port)
        mail.login(self.email, self.password)

        mail.select('inbox')
        
        # Busca emails não lidos
        status, messages = mail.search(None, 'UNSEEN')
        email_ids = messages[0].split()
        
        emails = []
        for email_id in email_ids[-10:]:  # Últimos 10 apenas
            try:
                status, msg_data = mail.fetch(email_id, '(RFC822)')
                raw_email = msg_data[0][1]
                msg = email.message_from_bytes(raw_email)
                
                corpo = self._extract_body(msg)
                
                email_obj = Email(
                    remetente=msg['From'],
                    destinatario=msg['To'],
                    assunto=msg.get('Subject', 'Sem assunto'),
                    corpo=corpo,
                    data=datetime.now(),
                    classificado=False
                )
                
                emails.append(email_obj)
            except Exception as e:
                print(f"Erro ao processar email: {e}")
                continue
        
        mail.close()
        mail.logout()
        
        return emails
    
    def _extract_body(self, msg) -> str:
        """Extrai corpo do email"""
        if msg.is_multipart():
            for part in msg.walk():
                if part.get_content_type() == "text/plain":
                    try:
                        return part.get_payload(decode=True).decode()
                    except:
                        return ""
        else:
            try:
                return msg.get_payload(decode=True).decode()
            except:
                return ""
        return ""