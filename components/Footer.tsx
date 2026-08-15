import { siteConfig } from "@/lib/config";

export function Footer() {
  return (
    <footer className="mx-auto max-w-6xl px-6 pb-16 pt-8">
      <div className="glass flex flex-col items-center gap-6 px-8 py-10 text-center sm:flex-row sm:justify-between sm:text-left">
        <div>
          <p className="text-sm font-semibold text-ink">{siteConfig.name}</p>
          <p className="mt-1 text-xs text-muted">Pay-per-action safety decisions settled through the GoPlausible x402 facilitator.</p>
        </div>
        <nav className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted">
          <a href={siteConfig.repoUrl} className="transition-colors hover:text-ink" target="_blank" rel="noreferrer">GitHub</a>
          <a href={siteConfig.bazaarUrl} className="transition-colors hover:text-ink" target="_blank" rel="noreferrer">Bazaar listing</a>
          <a href={siteConfig.contactUrl} className="transition-colors hover:text-ink" target="_blank" rel="noreferrer">Contact</a>
        </nav>
      </div>
    </footer>
  );
}
