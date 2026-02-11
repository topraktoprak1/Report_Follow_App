from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from config import Config
from models import db
from models.user import User
from routes.auth import auth_bp
from routes.users import users_bp


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Initialize extensions
    # Allow CORS for all origins during development to avoid network issues
    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)
    db.init_app(app)
    JWTManager(app)
    Migrate(app, db)
    
    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(users_bp)
    
    # Health check
    @app.route('/api/health')
    def health():
        return {'status': 'ok'}, 200
    
    return app


def seed_admin(app):
    """Seed default admin user if none exists."""
    with app.app_context():
        admin = User.query.filter_by(role='admin').first()
        if not admin:
            admin = User(
                email='admin@firma.com',
                first_name='Admin',
                last_name='Kullanıcı',
                role='admin',
                is_active=True,
            )
            admin.set_password('admin123')
            db.session.add(admin)
            db.session.commit()
            print('✓ Varsayılan admin hesabı oluşturuldu: admin@firma.com / admin123')


app = create_app()

with app.app_context():
    # Attempt to create tables - if this fails due to permissions, run fix_db_user.py
    try:
        db.create_all()
        seed_admin(app)
    except Exception as e:
        print(f"Warning: Database setup failed: {e}")
        print("Please run 'python fix_db_user.py' to fix permissions.")

if __name__ == '__main__':
    # Host='0.0.0.0' allows access from network
    app.run(debug=True, host='0.0.0.0', port=5174)
