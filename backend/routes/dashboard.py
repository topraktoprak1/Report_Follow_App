from flask import Blueprint, jsonify
from models import db
from models.user import User
from models.employee_info import EmployeeInfo
from sqlalchemy import func

dashboard_bp = Blueprint('dashboard', __name__, url_prefix='/api/dashboard')

@dashboard_bp.route('/stats', methods=['GET'])
def get_stats():
    """Get general dashboard statistics."""
    total_personnel = User.query.count()
    # Mock values for now since we don't have performance/MH data in the excel import
    avg_performance = 0 
    total_mh = 0 
    completed_tasks = 0

    return jsonify({
        'totalPersonnel': total_personnel,
        'avgPerformance': avg_performance,
        'totalMH': total_mh,
        'completedTasks': completed_tasks
    })

@dashboard_bp.route('/personnel', methods=['GET'])
def get_personnel():
    """Get list of personnel with details."""
    # Join User and EmployeeInfo
    results = db.session.query(User, EmployeeInfo).outerjoin(EmployeeInfo, User.id == EmployeeInfo.user_id).all()
    
    personnel_data = []
    for user, info in results:
        personnel_data.append({
            'id': user.id,
            'ad': f"{user.first_name} {user.last_name}",
            'departman': info.discipline if info else 'Genel',
            'pozisyon': info.title if info else 'Personel',
            'projects': info.projects if info else '', 
            'toplamMH': 0, # Placeholder
            'tamamlanan': 0, # Placeholder
            'performans': 0 # Placeholder
        })
    
    return jsonify(personnel_data)

@dashboard_bp.route('/department-performance', methods=['GET'])
def get_department_performance():
    """Get performance stats by department (discipline)."""
    # Group by discipline
    results = db.session.query(
        EmployeeInfo.discipline, 
        func.count(EmployeeInfo.id)
    ).group_by(EmployeeInfo.discipline).all()
    
    dept_data = []
    for discipline, count in results:
        if not discipline: continue
        dept_data.append({
            'departman': discipline,
            'ortalama': 0, # Placeholder
            'kisi': count
        })
        
    return jsonify(dept_data)

@dashboard_bp.route('/projects', methods=['GET'])
def get_projects():
    """Get list of projects with aggregated stats."""
    # Fetch all employee info with projects
    employees = EmployeeInfo.query.filter(EmployeeInfo.projects != None).all()
    
    project_map = {}
    
    for emp in employees:
        if not emp.projects: continue
        # Split by comma or semicolon
        projs = [p.strip() for p in emp.projects.replace(';', ',').split(',')]
        for p_name in projs:
            if not p_name: continue
            if p_name not in project_map:
                project_map[p_name] = {'name': p_name, 'userCount': 0, 'disciplines': set()}
            
            project_map[p_name]['userCount'] += 1
            if emp.discipline:
                project_map[p_name]['disciplines'].add(emp.discipline)
    
    # Convert to list
    result = []
    for name, data in project_map.items():
        result.append({
            'name': name,
            'userCount': data['userCount'],
            'category': list(data['disciplines'])[0] if data['disciplines'] else 'Genel', # Pick first as primary
            'status': 'Devam Ediyor' # Default since we don't have this data
        })
        
    return jsonify(result)

@dashboard_bp.route('/project-stats', methods=['GET'])
def get_project_stats():
    """Get aggregated stats for project reporting charts."""
    # Reuse logic to get projects first
    employees = EmployeeInfo.query.filter(EmployeeInfo.projects != None).all()
    
    project_names = set()
    categories = {}
    
    for emp in employees:
        if not emp.projects: continue
        projs = [p.strip() for p in emp.projects.replace(';', ',').split(',')]
        for p_name in projs:
            if not p_name: continue
            project_names.add(p_name)
            
            # Use discipline as category
            cat = emp.discipline or 'Diğer'
            categories[cat] = categories.get(cat, 0) + 1
            
    # Category Distribution (Top 5)
    category_data = [{'name': k, 'value': v} for k, v in categories.items()]
    category_data.sort(key=lambda x: x['value'], reverse=True)
    
    # Assign colors
    colors = ['#00d4ff', '#8b5cf6', '#0cdba8', '#f59e0b', '#ef4444', '#64748b']
    for i, item in enumerate(category_data):
        item['color'] = colors[i % len(colors)]

    return jsonify({
        'activeProjects': len(project_names),
        'totalTasks': 0, # No task data
        'totalMH': 0, # No MH data
        'avgProgress': 0, # No progress data
        'categoryDistribution': category_data,
        'projectStatus': [
            {'name': 'Devam Eden', 'value': len(project_names), 'color': '#00d4ff'},
            {'name': 'Tamamlanan', 'value': 0, 'color': '#22c55e'},
            {'name': 'Bekleyen', 'value': 0, 'color': '#f59e0b'}
        ]
    })
