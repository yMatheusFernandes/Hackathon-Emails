# api/emails.py
from flask import Blueprint, request, jsonify
from services.funcionario_service import FuncionarioService
from repositories.funcionario_repository import FuncionarioRepository
from services.firestore_client import get_firestore_client
from datetime import datetime

funcionarios_bp = Blueprint('funcionarios', __name__, url_prefix='/api/funcionarios')

def get_service():
    """Helper: cria service"""
    db = get_firestore_client()
    repo = FuncionarioRepository(db)
    return FuncionarioService(repo)

@funcionarios_bp.route('/', methods=['GET'])
def list_funcionarios():
    """Lista todos funcionários"""
    try:
        service = get_service()
        funcionarios = service.get_all_funcionarios()
        return jsonify({
            'success': True,
            'data': [e.to_dict() for e in funcionarios]
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500