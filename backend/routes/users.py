from flask import Blueprint, request, jsonify
from models import db
from models.user import User
from middleware.auth_middleware import role_required

users_bp = Blueprint('users', __name__, url_prefix='/api/users')


@users_bp.route('', methods=['GET'])
@role_required('admin')
def get_users(current_user):
    users = User.query.order_by(User.created_at.desc()).all()
    return jsonify({'users': [u.to_dict() for u in users]}), 200


@users_bp.route('', methods=['POST'])
@role_required('admin')
def create_user(current_user):
    data = request.get_json()
    
    required = ['email', 'password', 'firstName', 'lastName', 'role']
    for field in required:
        if not data.get(field):
            return jsonify({'error': f'{field} alanı gerekli'}), 400
    
    if data['role'] not in User.VALID_ROLES:
        return jsonify({'error': f"Geçersiz rol. Geçerli roller: {', '.join(User.VALID_ROLES)}"}), 400
    
    if User.query.filter_by(email=data['email'].lower().strip()).first():
        return jsonify({'error': 'Bu e-posta zaten kayıtlı'}), 409
    
    user = User(
        email=data['email'].lower().strip(),
        first_name=data['firstName'].strip(),
        last_name=data['lastName'].strip(),
        role=data['role'],
        is_active=data.get('isActive', True),
    )
    user.set_password(data['password'])
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify({'user': user.to_dict()}), 201


@users_bp.route('/<int:user_id>', methods=['PUT'])
@role_required('admin')
def update_user(user_id, current_user):
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({'error': 'Kullanıcı bulunamadı'}), 404
    
    data = request.get_json()
    
    if 'firstName' in data:
        user.first_name = data['firstName'].strip()
    if 'lastName' in data:
        user.last_name = data['lastName'].strip()
    if 'role' in data:
        if data['role'] not in User.VALID_ROLES:
            return jsonify({'error': 'Geçersiz rol'}), 400
        user.role = data['role']
    if 'isActive' in data:
        user.is_active = data['isActive']
    if 'email' in data:
        existing = User.query.filter_by(email=data['email'].lower().strip()).first()
        if existing and existing.id != user.id:
            return jsonify({'error': 'Bu e-posta zaten kayıtlı'}), 409
        user.email = data['email'].lower().strip()
    if 'password' in data and data['password']:
        user.set_password(data['password'])
    
    db.session.commit()
    return jsonify({'user': user.to_dict()}), 200


@users_bp.route('/<int:user_id>', methods=['DELETE'])
@role_required('admin')
def delete_user(user_id, current_user):
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({'error': 'Kullanıcı bulunamadı'}), 404
    
    if user.id == current_user.id:
        return jsonify({'error': 'Kendinizi silemezsiniz'}), 400
    
    user.is_active = False
    db.session.commit()
    return jsonify({'message': 'Kullanıcı devre dışı bırakıldı'}), 200
