from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from models import db
from models.user import User


def jwt_required_custom(fn):
    """Custom JWT required decorator that also loads the user."""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        user_id = get_jwt_identity()
        user = db.session.get(User, user_id)
        if not user or not user.is_active:
            return jsonify({'error': 'Kullanıcı bulunamadı veya devre dışı'}), 401
        kwargs['current_user'] = user
        return fn(*args, **kwargs)
    return wrapper


def role_required(*roles):
    """Decorator to require specific roles for an endpoint."""
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            user_id = get_jwt_identity()
            user = db.session.get(User, user_id)
            if not user or not user.is_active:
                return jsonify({'error': 'Kullanıcı bulunamadı veya devre dışı'}), 401
            if user.role not in roles:
                return jsonify({'error': 'Bu işlem için yetkiniz yok'}), 403
            kwargs['current_user'] = user
            return fn(*args, **kwargs)
        return wrapper
    return decorator
