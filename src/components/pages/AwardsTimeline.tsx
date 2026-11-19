import type { CardItem, CardPageConfig } from '@/types/page';

export default function AwardsTimeline({ config, embedded }: { config: CardPageConfig; embedded: boolean }) {
    const groups = new Map<string, CardItem[]>();
    for (const item of config.items) {
        const year = item.date?.match(/\b\d{4}$/)?.[0] || 'Undergraduate';
        const items = groups.get(year) ?? [];
        items.push(item);
        groups.set(year, items);
    }

    const Title = embedded ? 'h2' : 'h1';
    const GroupTitle = embedded ? 'h3' : 'h2';
    const sortedGroups = [...groups].sort(([a], [b]) => (Number(b) || 0) - (Number(a) || 0));

    return (
        <section aria-label={config.title} className="grid gap-8 border-t border-neutral-200 pt-7 sm:gap-10 md:grid-cols-[minmax(10rem,1fr)_3fr] dark:border-neutral-800">
            <div>
                <Title className={`font-serif font-bold text-primary ${embedded ? 'text-2xl' : 'text-4xl md:text-5xl'}`}>{config.title}</Title>
                {config.description && <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-500">{config.description}</p>}
            </div>
            <div className="space-y-9">
                {sortedGroups.map(([year, items]) => (
                    <section key={year} aria-label={year}>
                        <GroupTitle className="mb-4 text-sm font-semibold tracking-wide text-neutral-600 dark:text-neutral-500">{year}</GroupTitle>
                        <ul className="relative space-y-4 before:absolute before:bottom-3.5 before:left-1.5 before:top-3 before:w-px before:bg-neutral-200 dark:before:bg-neutral-700">
                            {items.map((item, index) => (
                                <li key={index} className="relative pl-7 leading-relaxed text-neutral-600 dark:text-neutral-500">
                                    <span aria-hidden="true" className="absolute left-0 top-[0.42rem] size-[13px] rounded-full border-2 border-accent-dark bg-background" />
                                    <strong className="font-bold text-primary">{item.title}</strong>
                                    {item.subtitle && <>, {item.subtitle}</>}
                                    {item.date && item.date !== year && <> <span className="whitespace-nowrap text-sm">({item.date})</span></>}
                                    {item.content && <p className="text-sm">{item.content}</p>}
                                </li>
                            ))}
                        </ul>
                    </section>
                ))}
            </div>
        </section>
    );
}
