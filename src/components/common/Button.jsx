import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

export default function Button({ children, to, variant = 'primary', arrow = false, className = '', ...props }) {
  const classes = `button button-${variant} ${className}`;
  const content = <>{children}{arrow && <ArrowUpRight size={17} aria-hidden="true" />}</>;
  return to ? <Link className={classes} to={to} {...props}>{content}</Link> : <button className={classes} type="button" {...props}>{content}</button>;
}
