export default function FormMessage({ type = 'error', children }) {
  if (!children) return null;
  return <div className={`form-message ${type}`} role={type === 'error' ? 'alert' : 'status'}>{children}</div>;
}
