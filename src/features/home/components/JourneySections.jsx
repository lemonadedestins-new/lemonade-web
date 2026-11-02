import { MessageSquareText, UsersRound, Files, CircleCheck, Plane, SlidersHorizontal, BadgeCheck, HeartHandshake, ArrowUpRight, Star, Quote, Compass } from 'lucide-react';
import Button from '../../../components/common/Button';
import { registrationPath, ROLES } from '../../../constants/routes';
import { destinations, imageUrl } from '../data/destinations';

const steps = [
  { icon: MessageSquareText, title: 'Tell us your travel dreams', text: 'The where, the when, and the little things that matter to you.' },
  { icon: UsersRound, title: 'Meet the right experts', text: 'We connect you with planners who understand your kind of trip.' },
  { icon: Files, title: 'Discover your options', text: 'Receive thoughtful, personalized plans made around you.' },
  { icon: CircleCheck, title: 'Find your perfect fit', text: 'Compare the possibilities and choose what feels right.' },
  { icon: Plane, title: 'Make some memories', text: 'Pack your curiosity. Your next chapter is waiting.' },
];
const benefits = [
  { icon: SlidersHorizontal, title: 'Personal, from the start', text: 'Your interests, your pace, your budget. A journey shaped around you.' },
  { icon: UsersRound, title: 'More than one perspective', text: 'Discover possibilities from travel experts with different specialties.' },
  { icon: Files, title: 'Clarity before you choose', text: 'See what each plan includes, so you can decide with confidence.' },
  { icon: BadgeCheck, title: 'People you can trust', text: 'Connect with travel planners who bring care and local expertise.' },
  { icon: Compass, title: 'Less back and forth', text: 'Share your wish list once. Let the right planners take it from there.' },
  { icon: HeartHandshake, title: 'A little help along the way', text: 'Support through the enquiry process, from first hello to finding your fit.' },
];
const stories = [
  { quote: 'We wanted a honeymoon that felt like us. Quiet beaches, great food, and absolutely no rushed mornings.', name: 'Aarav & Meera', trip: 'Dreaming of the Maldives', initials: 'AM', color: '#e7e3d2' },
  { quote: 'Traveling with the whole family means a lot of little details. Having someone who gets that makes all the difference.', name: 'Priya S.', trip: 'A family escape to Kerala', initials: 'PS', color: '#dfe7d8' },
  { quote: 'I love the adventure. I just don’t love opening twenty tabs to plan it. The right local expert changes everything.', name: 'Rohan K.', trip: 'An adventure in Bali', initials: 'RK', color: '#e9dfcf' },
];

export function HowItWorks() {
  return <section className="section how-section" id="how-it-works"><div className="container"><div className="centered section-heading-center"><p className="eyebrow">FROM “WHAT IF” TO “WE’RE HERE”</p><h2 className="section-title">Big dreams. A few simple steps.</h2><p className="section-description">The joy of a personal trip, without the planning overwhelm.</p></div><ol className="steps-grid">{steps.map(({ icon: Icon, title, text }, index) => <li key={title}><span className="step-icon"><Icon size={25} strokeWidth={1.5} /><span>{String(index + 1).padStart(2, '0')}</span></span><h3>{title}</h3><p>{text}</p></li>)}</ol><div className="centered"><Button to={registrationPath()} arrow>Let’s plan something wonderful</Button></div></div></section>;
}
export function WhyLemonade() {
  return <section className="section why-section"><div className="container why-layout"><div className="why-intro"><p className="eyebrow">THE LEMONADE WAY</p><h2 className="section-title">A little more you.<br />A lot less ordinary.</h2><p className="section-description">Because the best trip isn’t the one everyone takes. It’s the one that’s right for you.</p><span className="why-signoff">Thoughtfully connected.<br />Personally planned.</span></div><div className="benefits-grid">{benefits.map(({ icon: Icon, title, text }) => <article className="benefit" key={title}><Icon size={25} strokeWidth={1.5} /><h3>{title}</h3><p>{text}</p></article>)}</div></div></section>;
}
export function TravelPartnerCta() {
  return <section className="partner-section container" id="travel-partners"><div className="partner-copy"><p className="eyebrow">FOR THE PEOPLE WHO KNOW THE WAY</p><h2>You make great trips.<br />Let’s make great connections.</h2><p>Independent planner or travel agency? Bring your expertise to travelers who are looking for exactly what you do best.</p><Button to={registrationPath(ROLES.BUSINESS_OWNER)} variant="lemon" arrow>Become a travel partner</Button><span>Relevant enquiries. Personal connections. New possibilities.</span></div><div className="partner-photo"><img src={imageUrl(destinations[1], 1000)} alt="Terraced rice fields and tropical greenery in Bali" width="1000" height="1100" loading="lazy" /><div><Compass size={24} /><span>Good people.<br />Extraordinary places.</span></div></div></section>;
}
export function Testimonials() {
  return <section className="section stories-section"><div className="container"><div className="section-heading"><div><p className="eyebrow">IT’S ALWAYS ABOUT THE PEOPLE</p><h2>Every journey starts with a story.</h2><p className="section-description">A few of the travel dreams we’re here for.</p></div><span className="sample-label">Illustrative traveler stories</span></div><div className="stories-grid">{stories.map(story => <article className="story-card" key={story.name}><div className="story-stars" aria-label="Sample five-star review">{Array.from({ length: 5 }, (_, index) => <Star size={14} key={index} fill="currentColor" strokeWidth={0} />)}<Quote size={25} /></div><blockquote>“{story.quote}”</blockquote><div className="story-person"><span style={{ background: story.color }}>{story.initials}</span><div><h3>{story.name}</h3><p>{story.trip}</p></div></div></article>)}</div></div></section>;
}
export function FinalCta() {
  return <section className="final-cta"><div className="container"><div><p className="eyebrow">THAT “SOMEDAY” TRIP?</p><h2>Let’s make it a little more real.</h2></div><Button to={registrationPath()} variant="primary">Find your next adventure <ArrowUpRight size={18} /></Button></div></section>;
}
