# api/dashboard.py
from flask import Blueprint, jsonify
from services.analytics_service import AnalyticsService
from repositories.email_repository import EmailRepository
from services.firestore_client import get_firestore_client

dashboard_bp = Blueprint('dashboard', __name__, url_prefix='/api/dashboard')

@dashboard_bp.route('/stats', methods=['GET'])
def get_stats():
    """Estatísticas do dashboard"""
    try:
        db = get_firestore_client()
        repo = EmailRepository(db)
        service = AnalyticsService(repo)
        
        stats = service.get_dashboard_stats()
        
        return jsonify({
            'success': True,
            'data': stats
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500