# api/emails.py
from flask import Blueprint, request, jsonify
from services.email_service import EmailService
from repositories.email_repository import EmailRepository
from services.firestore_client import get_firestore_client
from datetime import datetime

emails_bp = Blueprint('emails', __name__, url_prefix='/api/emails')

def get_service():
    """Helper: cria service"""
    db = get_firestore_client()
    repo = EmailRepository(db)
    return EmailService(repo)

@emails_bp.route('/', methods=['GET'])
def list_emails():
    """Lista todos emails"""
    try:
        service = get_service()
        emails = service.get_all_emails()
        return jsonify({
            'success': True,
            'data': [e.to_dict() for e in emails]
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
    
@emails_bp.route('/<email_id>', methods=['GET'])
def email_by_id(email_id):
    """Lista todos emails"""
    try:
        service = get_service()
        email = service.get_emails_by_id(email_id)
        return jsonify({
            'success': True,
            'data': email.to_dict()
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@emails_bp.route('/pending', methods=['GET'])
def list_pending():
    """Lista pendentes"""
    try:
        service = get_service()
        emails = service.get_pending_emails()
        return jsonify({
            'success': True,
            'data': [e.to_dict() for e in emails]
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@emails_bp.route('/create', methods=['POST'])
def create_email():
    """Cadastro manual"""
    try:
        data = request.get_json()
        service = get_service()
        
        email = service.create_email(
            remetente=data['remetente'],
            destinatario=data['destinatario'],
            assunto=data['assunto'],
            corpo=data['corpo'],
            data=datetime.now(),
            estado=data.get('estado'),
            municipio=data.get('municipio'),
            categoria=data.get('categoria')
        )
        
        return jsonify({
            'success': True,
            'data': email.to_dict()
        }), 201
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

@emails_bp.route('/<email_id>/classify', methods=['PUT'])
def classify_email(email_id):
    """Classificar email"""
    try:
        data = request.get_json()
        print(data)
        service = get_service()
        
        email = service.classify_email(
            email_id=email_id,
            estado=data['estado'],
            municipio=data['municipio'], 
            categoria=data['categoria']
        )
        
        return jsonify({
            'success': True,
            'data': email.to_dict()
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400
    
@emails_bp.route('/<email_id>', methods=['DELETE'])
def delete_email(email_id):
    """Excluir email"""
    try:
        service = get_service()
        service.delete_email(email_id)
        return jsonify({'success': True}), 200 
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400