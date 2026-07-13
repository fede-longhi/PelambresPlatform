import NavLinks from './nav-links';

export default function SideNav() {
  return (
    <aside className="md:sticky md:top-24 md:self-start">
      <p className="mb-2 hidden text-xs font-semibold uppercase tracking-wide text-muted-foreground md:block">
        Contenido
      </p>
      <NavLinks />
    </aside>
  );
}
