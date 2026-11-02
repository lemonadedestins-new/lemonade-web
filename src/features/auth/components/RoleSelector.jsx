import { Compass, BriefcaseBusiness, Check } from 'lucide-react';
import { ROLES } from '../../../constants/routes';

const choices = [{ value: ROLES.CUSTOMER, title: 'I’m a traveler', description: 'Find my kind of journey', icon: Compass }, { value: ROLES.BUSINESS_OWNER, title: 'I’m a travel planner', description: 'Bring journeys to life', icon: BriefcaseBusiness }];
export default function RoleSelector({ registration, selected }) {
  return <fieldset className="role-selector"><legend>What brings you here?</legend><div className="role-options">{choices.map(({ value, title, description, icon: Icon }) => <label key={value} className={`role-option ${selected === value ? 'selected' : ''}`}><input type="radio" value={value} {...registration} /><Icon size={21} strokeWidth={1.6} /><strong>{title}</strong><span>{description}</span>{selected === value && <Check className="role-check" size={15} />}</label>)}</div></fieldset>;
}
