import Header from './Header';
import AboutJourney from './AboutJourney';
import styles from './About.module.css';

export default function About({ count, paused, onNavigate, onCart }: { count: number; paused: boolean; onNavigate: (path: string, section?: number) => void; onCart: () => void }) {
  return <div className={styles.about}>
    <a className={styles.skip} href="#about-story-controls">Skip to story chapters</a>
    <Header current="about" count={count} onNavigate={onNavigate} onCart={onCart} />
    <AboutJourney paused={paused} onExplore={() => onNavigate('/', 1)} />
  </div>;
}
