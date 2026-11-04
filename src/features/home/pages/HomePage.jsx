import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, Compass, Sparkles, MapPin, Check, MoveUpRight, Search } from 'lucide-react';
import Button from '../../../components/common/Button';
import { HERO_IMAGE, destinations } from '../data/destinations';
import { browsePath } from '../../packages/packageModel';
import DestinationsSection from '../components/DestinationsSection';
import { FinalCta, HowItWorks, Testimonials, TravelPartnerCta, WhyLemonade } from '../components/JourneySections';
import '../home.css';
import '../sections.css';
import '../../packages/packages.css';

export default function HomePage() {
  const [destination, setDestination] = useState('munnar');
  const navigate = useNavigate();
  return <><section className="hero"><div className="container hero-grid">
    <div className="hero-copy fade-in">
      <p className="hero-eyebrow"><span /> SOUTH INDIA. SO MANY WAYS TO GO.</p>
      <h1>Find your place.<br />Meet your<br /><span>kind of planner.</span></h1>
      <p className="hero-description">Tea country or a coastal escape? Discover packages from travel planners across South India. Compare the journeys, meet the people behind them, and find your fit.</p>
      <form className="home-destination-search" onSubmit={event => { event.preventDefault(); navigate(browsePath(destination)); }}>
        <label className="sr-only" htmlFor="home-destination">Where would you like to go?</label>
        <select id="home-destination" value={destination} onChange={event => setDestination(event.target.value)}><option value="">All South India</option>{destinations.map(place => <option key={place.id} value={place.id}>{place.name}, {place.country}</option>)}</select>
        <Button type="submit"><Search size={17} /> Find packages</Button>
      </form>
      <div className="hero-actions"><a className="hero-secondary" href="#how-it-works">See how it works <span><ArrowUpRight size={18} /></span></a></div>
      <div className="hero-reassurance"><span><Check size={17} /> Packages from local planners</span><i /><span><Check size={17} /> Details before decisions</span></div>
    </div>
    <div className="hero-visual fade-in">
      <img className="hero-photo" src={HERO_IMAGE} alt="Tea plantations on a green hillside in Munnar, Kerala" fetchPriority="high" width="1400" height="1600" />
      <div className="hero-place"><MapPin size={14} /> A greener kind of getaway · Munnar, Kerala</div>
      <div className="hero-note"><div className="hero-note-icon"><Compass size={24} strokeWidth={1.5} /></div><div><strong>A place you’ll love.</strong><span>A planner who knows it.</span></div><Sparkles size={18} className="note-sparkle" /></div>
      <div className="hero-stamp"><MoveUpRight size={23} strokeWidth={1.4} /><span>GO SOMEWHERE<br />GOOD.</span></div>
    </div>
  </div></section><div className="promise-strip"><div className="container promise-inner"><span><Sparkles size={17} /> Find your kind of South.</span><span>Several planners. More possibilities.</span><span>See the itinerary. Know the inclusions.</span><span>A conversation before a commitment.</span></div></div>
    <DestinationsSection /><HowItWorks /><WhyLemonade /><TravelPartnerCta /><Testimonials /><FinalCta />
  </>;
}
