import SorbiChat from '../components/sorbi/SorbiChat.jsx';
import SectionTitle from '../components/SectionTitle.jsx';

function AsistentePage() {
  return (
    <section className="container page-content assistant-page">
      <SectionTitle
        eyebrow="Una ayuda para elegir"
        title="Conversa con Sorbi"
        description="Explora sabores, resuelve dudas del sitio y conoce cómo llegar al Mall del Sol."
        level="h1"
      />
      <SorbiChat initialFocus />
    </section>
  );
}

export default AsistentePage;
