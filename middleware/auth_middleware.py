from functools import wraps
from flask import jsonify, session
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from models import db
from models.user import User


def _get_current_user():
    """Try JWT first, fall back to session. Returns User or None."""
    from flask import request as _req
    # Only attempt JWT decode if the token looks like a real JWT (3 dot-separated parts)
    auth_header = _req.headers.get('Authorization', '')
    token = auth_header[7:] if auth_header.startswith('Bearer ') else ''
    is_real_jwt = token.count('.') == 2 and len(token) > 20

    if is_real_jwt:
        try:
            verify_jwt_in_request()
            user_id = get_jwt_identity()
            return db.session.get(User, int(user_id))
        except Exception:
            pass

    # Fall back to session (legacy mock-token / cookie-based login)
    user_id = session.get('user_id')
    if user_id:
        return db.session.get(User, int(user_id))
    return None


def jwt_required_custom(fn):
    """Custom JWT required decorator that also loads the user."""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        user = _get_current_user()
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
            user = _get_current_user()
            if not user or not user.is_active:
                return jsonify({'error': 'Kullanıcı bulunamadı veya devre dışı'}), 401
            if user.role not in roles:
                return jsonify({'error': 'Bu işlem için yetkiniz yok'}), 403
            kwargs['current_user'] = user
            return fn(*args, **kwargs)
        return wrapper
    return decorator
