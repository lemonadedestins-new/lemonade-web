import DestinationsSection from '../components/DestinationsSection';
import Button from '../../../components/common/Button';
import { registrationPath } from '../../../constants/routes';
import '../home.css';
import '../sections.css';

export default function ExplorePage() {
  return <><div className="explore-intro container"><p className="eyebrow">FOLLOW YOUR CURIOSITY</p><h1>A world worth getting lost in.</h1><p>Sun-soaked islands. Mountain mornings. A city you haven’t met yet.<br />Find your inspiration, then make the journey your own.</p></div><DestinationsSection explore /><section className="explore-outro container"><div><h2>Somewhere else on your mind?</h2><p>Your dream destination doesn’t have to be on this list.</p></div><Button to={registrationPath()} arrow>Let’s find your kind of trip</Button></section></>;
}
