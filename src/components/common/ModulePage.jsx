import { Link } from 'react-router-dom';

export default function ModulePage({ title, description, actions = [], metrics = [], sections = [] }) {
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-normal">{title}</h1>
          {description && <p className="mt-1 max-w-3xl text-sm leading-6 text-stone-500">{description}</p>}
        </div>
        {actions.length > 0 && (
          <div className="grid grid-cols-2 gap-2 sm:flex">
            {actions.map((action) => (
              action.to ? (
                <Link key={action.label} to={action.to} className="inline-flex min-h-11 items-center justify-center rounded-md bg-burgundy-600 px-4 text-sm font-bold text-white focus-ring">
                  {action.label}
                </Link>
              ) : (
                <button key={action.label || action} className="min-h-11 rounded-md bg-burgundy-600 px-4 text-sm font-bold text-white focus-ring">
                  {action.label || action}
                </button>
              )
            ))}
          </div>
        )}
      </div>
      {metrics.length > 0 && (
        <section className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          {metrics.map((metric) => (
            <article key={metric.label} className="min-w-0 rounded-lg bg-white p-3 shadow-soft sm:p-4">
              <p className="text-xs font-medium leading-snug text-stone-500 sm:text-sm">{metric.label}</p>
              <p className="mt-2 break-words text-lg font-bold leading-tight sm:text-2xl">{metric.value}</p>
            </article>
          ))}
        </section>
      )}
      <section className="grid gap-4 lg:grid-cols-2">
        {sections.map((section) => (
          <article key={section.title} className="rounded-lg bg-white p-4 shadow-soft">
            <h2 className="font-bold">{section.title}</h2>
            <p className="mt-2 text-sm leading-6 text-stone-500">{section.body}</p>
            {section.items && (
              <div className="mt-4 grid gap-2">
                {section.items.map((item) => (
                  <div key={item} className="rounded-md bg-cream px-3 py-3 text-sm font-semibold">{item}</div>
                ))}
              </div>
            )}
          </article>
        ))}
      </section>
    </div>
  );
}
