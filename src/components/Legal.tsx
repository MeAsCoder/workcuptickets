export function LegalLayout({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <div className="container-page py-14">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-4xl font-extrabold">{title}</h1>
        <p className="mt-2 text-sm text-ink-500">Last updated {updated}</p>
        <div className="prose-legal mt-8 space-y-5 text-ink-700 [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-bold [&_p]:leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  )
}
