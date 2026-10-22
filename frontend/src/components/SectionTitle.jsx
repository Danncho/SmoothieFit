function SectionTitle({ eyebrow, title, description, id, level = 'h2' }) {
  const Heading = level;

  return (
    <div className="section-heading">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <Heading id={id}>{title}</Heading>
      {description && <p>{description}</p>}
    </div>
  );
}

export default SectionTitle;
