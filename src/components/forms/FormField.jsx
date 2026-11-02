import { useState } from 'react';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import { Eye, EyeOff } from 'lucide-react';

export default function FormField({ registration, error, label, type = 'text', helperText, ...props }) {
  const [visible, setVisible] = useState(false);
  const { ref, ...field } = registration;
  const password = type === 'password';
  return <TextField {...props} {...field} inputRef={ref} label={label} id={field.name} type={password && visible ? 'text' : type} error={!!error} helperText={error?.message || helperText} slotProps={{ htmlInput: { 'aria-invalid': !!error, maxLength: password ? 128 : 254 }, input: password ? { endAdornment: <InputAdornment position="end"><IconButton onClick={() => setVisible(value => !value)} aria-label={visible ? 'Hide password' : 'Show password'} edge="end"><>{visible ? <EyeOff size={19} /> : <Eye size={19} />}</></IconButton></InputAdornment> } : undefined }} />;
}
