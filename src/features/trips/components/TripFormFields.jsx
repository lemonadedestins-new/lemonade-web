import { destinations } from '../../home/data/destinations';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import { Controller } from 'react-hook-form';
import { ACCOMMODATIONS, INTERESTS, TRANSPORT, TRIP_TYPES } from '../../../constants/trips';
import { dateInput } from '../tripModel';

export function TripField({ name, label, register, errors, helperText, ...props }) {
  const { ref, ...registration } = register(name);
  return <TextField id={`trip-${name}`} label={label} fullWidth {...registration} inputRef={ref} error={!!errors[name]} helperText={errors[name]?.message || helperText} {...props} />;
}
function SelectField({ name, label, options, control, errors }) {
  return <Controller name={name} control={control} render={({ field }) => <TextField {...field} id={`trip-${name}`} select label={label} fullWidth error={!!errors[name]} helperText={errors[name]?.message}><MenuItem value="" disabled>Choose an option</MenuItem>{options.map(value => <MenuItem key={value} value={value}>{value}</MenuItem>)}</TextField>} />;
}
export function EssentialsFields({ register, errors, startDate }) {
  const shared = { register, errors };
  return <div className="trip-form-fields">
    <TripField {...shared} name="destination" label="Where would you like to go?" required select slotProps={{ select: { native: true }, inputLabel: { shrink: true } }} helperText="We currently offer these South Indian destinations."><option value="">Choose a destination</option>{destinations.map(place => <option key={place.id} value={place.name}>{place.name}, {place.country}</option>)}</TripField>
    <TripField {...shared} name="departureCity" label="Departure city" required placeholder="Where your journey begins" autoComplete="address-level2" slotProps={{ htmlInput: { maxLength: 100 } }} />
    <div className="form-two-columns"><TripField {...shared} name="startDate" label="Start date" type="date" required slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: dateInput() } }} /><TripField {...shared} name="endDate" label="End date" type="date" required slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: startDate || dateInput() } }} /></div>
    <div className="form-section-label"><h3>Who’s coming along?</h3><p>Include everyone in your travel party.</p></div>
    <div className="form-two-columns"><TripField {...shared} name="adults" label="Adults" type="number" required helperText="18 years and above" slotProps={{ htmlInput: { min: 1, max: 20, step: 1 } }} /><TripField {...shared} name="children" label="Children" type="number" required helperText="Under 18 years" slotProps={{ htmlInput: { min: 0, max: 20, step: 1 } }} /></div>
  </div>;
}
export function PreferencesFields({ register, control, errors }) {
  const shared = { register, errors };
  return <div className="trip-form-fields">
    <div className="form-two-columns"><TripField {...shared} name="budget" label="Total trip budget (₹ INR)" type="number" required helperText="Approximate budget for all travelers combined." slotProps={{ htmlInput: { min: 1000, max: 10000000, step: 1000 } }} /><SelectField name="tripType" label="What kind of trip? *" control={control} errors={errors} options={TRIP_TYPES} /></div>
    <div className="form-two-columns"><SelectField name="accommodation" label="Your ideal stay" control={control} errors={errors} options={ACCOMMODATIONS} /><SelectField name="transportation" label="Getting around" control={control} errors={errors} options={TRANSPORT} /></div>
    <fieldset className="interests-fieldset"><legend>What brings you joy?</legend><p>Choose as many interests as you like. Optional.</p><Controller name="interests" control={control} render={({ field }) => <div className="interest-options">{INTERESTS.map(interest => <label key={interest} className={field.value.includes(interest) ? 'selected' : ''}><input type="checkbox" checked={field.value.includes(interest)} onChange={event => field.onChange(event.target.checked ? [...field.value, interest] : field.value.filter(value => value !== interest))} />{interest}</label>)}</div>} /></fieldset>
    <TripField {...shared} name="specialRequirements" label="Anything we should keep in mind?" multiline minRows={3} placeholder="Accessibility, dietary preferences, a special occasion…" helperText="Optional. Share preferences, without sensitive medical details." slotProps={{ htmlInput: { maxLength: 1500 } }} />
    <TripField {...shared} name="notes" label="A little more about your dream trip" multiline minRows={3} placeholder="A must-see place, a slower pace, something you’ve always wanted to do…" helperText="Optional · up to 1,500 characters." slotProps={{ htmlInput: { maxLength: 1500 } }} />
  </div>;
}
