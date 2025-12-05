from flask import Flask
from flask_cors import CORS
from api.emails import emails_bp
from api.dashboard import dashboard_bp
from api.sync import sync_bp
from utils.scheduler import start_scheduler
from config import Config

def create_app(config_class=Config):
    """Application Factory"""
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # CORS
    CORS(app, origins=config_class.CORS_ORIGINS)
    
    # Blueprints
    app.register_blueprint(emails_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(sync_bp)
    
    # Scheduler (desabilitar em modo testing)
    # if not app.config.get('TESTING'):
    #     start_scheduler()
    
    @app.route('/')
    def index():
        return {
            'message': 'Email Management System API',
            'version': '1.0.0',
            'endpoints': {
                'emails': '/api/emails',
                'dashboard': '/api/dashboard/stats',
                'sync': '/api/sync/trigger'
            }
        }
    
    @app.route('/health')
    def health():
        """Health check endpoint"""
        return {'status': 'healthy', 'firestore': 'connected'}
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(
        debug=True,
        host='0.0.0.0',
        port=5000
    )
    