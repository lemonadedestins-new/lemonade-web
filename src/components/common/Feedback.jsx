import { Component } from 'react';
import { AlertCircle, Compass } from 'lucide-react';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import MuiButton from '@mui/material/Button';
import Button from './Button';
import { useNotificationStore } from '../../store/notificationStore';

export function LoadingSpinner({ size = 24 }) { return <CircularProgress size={size} color="inherit" aria-label="Loading" />; }
export function PageLoader() { return <div className="page-loader" role="status"><LoadingSpinner size={32} /><p>Getting things ready for you…</p></div>; }
export function ErrorState({ title = 'A small detour.', message = 'Something didn’t load as expected. Let’s try again.', onRetry }) { return <div className="state-card" role="alert"><AlertCircle size={38} /><h2>{title}</h2><p>{message}</p>{onRetry ? <Button onClick={onRetry}>Try again</Button> : <Button to="/">Back to home</Button>}</div>; }
export function EmptyState({ title, message, children }) { return <div className="state-card"><Compass size={38} /><h2>{title}</h2><p>{message}</p>{children}</div>; }
export function ToastNotification() {
  const notifications = useNotificationStore(state => state.notifications);
  const dismiss = useNotificationStore(state => state.dismiss);
  const notification = notifications[0];
  return <Snackbar key={notification?.id} open={!!notification} autoHideDuration={5500} onClose={(_, reason) => { if (reason !== 'clickaway' && notification) dismiss(notification.id); }} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>{notification ? <Alert severity={notification.severity} variant="filled" onClose={() => dismiss(notification.id)} sx={{ width: '100%' }}>{notification.message}</Alert> : undefined}</Snackbar>;
}
export function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', onConfirm, onClose, loading = false }) { return <Dialog open={open} onClose={loading ? undefined : onClose} fullWidth maxWidth="xs" aria-labelledby="confirmation-title" aria-describedby="confirmation-description"><DialogTitle id="confirmation-title">{title}</DialogTitle><DialogContent><DialogContentText id="confirmation-description">{message}</DialogContentText></DialogContent><DialogActions sx={{ px: 3, pb: 3 }}><MuiButton onClick={onClose} disabled={loading}>Cancel</MuiButton><MuiButton variant="contained" onClick={onConfirm} disabled={loading}>{loading ? 'Please wait…' : confirmLabel}</MuiButton></DialogActions></Dialog>; }
export class AppErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <ErrorState title="Let’s get you back on track." onRetry={() => window.location.reload()} /> : this.props.children; }
}
