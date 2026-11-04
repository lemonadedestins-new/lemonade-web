import {
  BadgeCheck,
  CircleCheck,
  Compass,
  Files,
  HeartHandshake,
  MessageSquareText,
  Plane,
  Quote,
  SlidersHorizontal,
  Sparkles,
  Star,
  UsersRound,
} from 'lucide-react';
import Button from '../../../components/common/Button';
import { registrationPath, ROLES } from '../../../constants/routes';
import { destinations, imageUrl } from '../data/destinations';
import { ROLES as ACCOUNT_ROLES } from '../../../constants/routes';
import { useAuthStore } from '../../auth/store/authStore';

const steps = [
  { icon: MessageSquareText, title: 'Pick your place', text: 'Start with a South Indian destination, from Munnar to Pondicherry.' },
  { icon: UsersRound, title: 'Explore the packages', text: 'See the journeys already offered by planners for that destination.' },
  { icon: Files, title: 'Compare the details', text: 'Look at per-person prices, itineraries, stays, and inclusions.' },
  { icon: CircleCheck, title: 'Meet your planner', text: 'Get to know the business and discover their other packages.' },
  { icon: Plane, title: 'Start a conversation', text: 'Share your dates and preferences with the planner offering your package.' },
];
const benefits = [
  { icon: SlidersHorizontal, title: 'Personal, from the start', text: 'Your interests, your pace, your budget. A journey shaped around you.' },
  { icon: UsersRound, title: 'More than one perspective', text: 'Discover possibilities from travel experts with different specialties.' },
  { icon: Files, title: 'Clarity before you choose', text: 'See what each plan includes, so you can decide with confidence.' },
  { icon: BadgeCheck, title: 'People you can trust', text: 'Connect with travel planners who bring care and local expertise.' },
  { icon: Compass, title: 'A clearer starting point', text: 'See what is already available, then ask about the details that matter to you.' },
  { icon: HeartHandshake, title: 'A little help along the way', text: 'Support through the enquiry process, from first hello to finding your fit.' },
];
const stories = [
  { quote: 'We wanted a honeymoon that felt like us. Quiet beaches, great food, and absolutely no rushed mornings.', name: 'Aarav & Meera', trip: 'Dreaming of Munnar', initials: 'AM', color: '#e7e3d2' },
  { quote: 'Traveling with the whole family means a lot of little details. Having someone who gets that makes all the difference.', name: 'Priya S.', trip: 'A family escape to Alleppey', initials: 'PS', color: '#dfe7d8' },
  { quote: 'I love the adventure. I just don’t love opening twenty tabs to plan it. The right local expert changes everything.', name: 'Rohan K.', trip: 'An escape to Coorg', initials: 'RK', color: '#e9dfcf' },
];

export function HowItWorks() {
  const planPath = '/explore';
  return (
    <section className="section how-section" id="how-it-works">
      <div className="container">
        <div className="centered section-heading section-heading-center">
          <p className="eyebrow">FROM “WHAT IF” TO “WE’RE HERE”</p>
          <h2 className="section-title">Big dreams. A few simple steps.</h2>
          <p className="section-description">The joy of a personal trip, without the planning overwhelm.</p>
        </div>
        <ol className="steps-grid">
          {steps.map(({ icon: Icon, title, text }, index) => (
            <li key={title}>
              <span className="step-icon"><Icon size={25} strokeWidth={1.5} /><span>{String(index + 1).padStart(2, '0')}</span></span>
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ol>
        <div className="centered"><Button to={planPath} arrow>Find your next package</Button></div>
      </div>
    </section>
  );
}

export function WhyLemonade() {
  return (
    <section className="section why-section">
      <div className="container why-layout">
        <div className="why-intro">
          <p className="eyebrow">THE LEMONADE WAY</p>
          <h2 className="section-title">A little more you.<br />A lot less ordinary.</h2>
          <p className="section-description">Because the best trip isn’t the one everyone takes. It’s the one that’s right for you.</p>
          <span className="why-signoff">Thoughtfully connected.<br />Personally planned.</span>
        </div>
        <div className="benefits-grid">
          {benefits.map(({ icon: Icon, title, text }) => (
            <article className="benefit" key={title}>
              <Icon size={25} strokeWidth={1.5} />
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TravelPartnerCta() {
  const role = useAuthStore(state => state.role);
  const partnerPath = role === ACCOUNT_ROLES.BUSINESS_OWNER ? '/partner/packages/new' : registrationPath(ROLES.BUSINESS_OWNER);
  return (
    <section className="partner-section container" id="travel-partners">
      <div className="partner-copy">
        <p className="eyebrow">FOR THE PEOPLE WHO KNOW THE WAY</p>
        <h2>You have the packages.<br />Let travelers find them.</h2>
        <p>Independent planner or travel agency? List your South India packages, share your itineraries, and receive enquiries from travelers exploring your destinations.</p>
        <Button to={partnerPath} variant="lemon" arrow>List your travel packages</Button>
        <span>Your packages. Your business profile. Relevant enquiries.</span>
      </div>
      <div className="partner-photo">
        <img src={imageUrl(destinations[1], 1000)} alt={destinations[1].alt} width="1000" height="1100" loading="lazy" />
        <div><Compass size={24} /><span>Good people.<br />Extraordinary places.</span></div>
      </div>
    </section>
  );
}

export function Testimonials() {
  return (
    <section className="section stories-section">
      <div className="container">
        <div className="section-heading">
          <div>
            <p className="eyebrow">IT’S ALWAYS ABOUT THE PEOPLE</p>
            <h2>Every journey starts with a story.</h2>
            <p className="section-description">A few of the travel dreams we’re here for.</p>
          </div>
          <span className="sample-label">Illustrative traveler stories</span>
        </div>
        <div className="stories-grid">
          {stories.map(story => (
            <article className="story-card" key={story.name}>
              <div className="story-stars" aria-label="Illustrative five-star rating">
                {Array.from({ length: 5 }, (_, index) => <Star size={14} key={index} fill="currentColor" strokeWidth={0} />)}
                <Quote size={25} />
              </div>
              <blockquote>“{story.quote}”</blockquote>
              <div className="story-person">
                <span style={{ background: story.color }}>{story.initials}</span>
                <div><h3>{story.name}</h3><p>{story.trip}</p></div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FinalCta() {
  const planPath = '/explore';
  return (
    <section className="final-cta">
      <div className="container">
        <div><p className="eyebrow">THAT “SOMEDAY” TRIP?</p><h2>Let’s make it a little more real.</h2></div>
        <Button to={planPath} variant="primary">Find your next adventure <Sparkles size={17} /></Button>
      </div>
    </section>
  );
}
