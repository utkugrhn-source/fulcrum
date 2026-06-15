import './fulcrum.tokens.css';
import markUrl from '../svg/fulcrum_mark_on_navy.svg';

export default function FulcrumHeader() {
  return (
    <header className="fulcrum-header">
      <a className="fulcrum-brand" href="/" aria-label="Fulcrum home">
        <img className="fulcrum-brand__mark" src={markUrl} alt="" />
        <span className="fulcrum-brand__word">Fulcrum</span>
      </a>
      <nav className="fulcrum-nav" aria-label="Primary navigation">
        <a href="/journal">Journal</a>
        <a href="/cases">Cases</a>
        <a href="/library">Library</a>
        <a href="/about">About</a>
        <a className="fulcrum-cta" href="/submit">Submit</a>
      </nav>
    </header>
  );
}
