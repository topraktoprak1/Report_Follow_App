export default function ChartCard({ title, subtitle, children, actions, style }) {
    return (
        <div className="chart-card" style={style}>
            <div className="chart-card-header">
                <div>
                    <div className="chart-card-title">{title}</div>
                    {subtitle && <div className="chart-card-subtitle">{subtitle}</div>}
                </div>
                {actions && <div style={{ display: 'flex', gap: 8 }}>{actions}</div>}
            </div>
            {children}
        </div>
    );
}
