from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, get_jwt_identity
from models import db
from models.user import User
from middleware.auth_middleware import jwt_required_custom
from utils.permissions import get_allowed_pages

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'E-posta ve şifre gerekli'}), 400
    
    user = User.query.filter_by(email=data['email'].lower().strip()).first()
    
    if not user or not user.check_password(data['password']):
        return jsonify({'error': 'Geçersiz e-posta veya şifre'}), 401
    
    if not user.is_active:
        return jsonify({'error': 'Hesap devre dışı bırakılmış'}), 401
    
    access_token = create_access_token(identity=str(user.id))
    
    return jsonify({
        'token': access_token,
        'user': user.to_dict(),
        'allowedPages': get_allowed_pages(user.role),
    }), 200


@auth_bp.route('/me', methods=['GET'])
@jwt_required_custom
def get_me(current_user):
    return jsonify({
        'user': current_user.to_dict(),
        'allowedPages': get_allowed_pages(current_user.role),
    }), 200
