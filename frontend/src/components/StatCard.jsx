export default function StatCard({ icon: Icon, value, label, trend, trendValue, color }) {
    const bgColor = color ? `${color}20` : 'rgba(0,212,255,0.15)';
    const iconColor = color || 'var(--accent-cyan)';

    return (
        <div className="stat-card">
            <div className="stat-icon" style={{ background: bgColor }}>
                <Icon size={22} style={{ color: iconColor }} />
            </div>
            <div className="stat-content">
                <div className="stat-value">{value}</div>
                <div className="stat-label">{label}</div>
            </div>
            {trend && (
                <div className={`stat-trend ${trend}`}>
                    {trend === 'up' ? '↑' : '↓'} {trendValue}
                </div>
            )}
        </div>
    );
}
