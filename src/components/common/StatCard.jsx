export default function StatCard({ label, value, detail, icon: Icon }) {
  return <div className="stat-card"><div><p>{label}</p><strong>{value}</strong><span>{detail}</span></div><span className="stat-icon"><Icon size={21} strokeWidth={1.5} /></span></div>;
}
