'use client';

import Link from 'next/link';

import Profile from '@/components/home/Profile';
import About from '@/components/home/About';
import SelectedPublications from '@/components/home/SelectedPublications';
import News, { NewsItem } from '@/components/home/News';
import PublicationsList from '@/components/publications/PublicationsList';
import TextPage from '@/components/pages/TextPage';
import CardPage from '@/components/pages/CardPage';
import type { SiteConfig } from '@/lib/config';
import { Publication } from '@/types/publication';
import { CardPageConfig, PublicationPageConfig, TextPageConfig } from '@/types/page';
import { useLocaleStore } from '@/lib/stores/localeStore';

export interface SectionConfig {
  id: string;
  type: 'markdown' | 'publications' | 'list' | 'highlights';
  title?: string;
  source?: string;
  filter?: string;
  limit?: number;
  content?: string;
  publications?: Publication[];
  items?: NewsItem[];
  highlights?: Pick<CardPageConfig, 'title' | 'items'>;
}

type PageData =
  | { type: 'about'; id: string; sections: SectionConfig[] }
  | { type: 'publication'; id: string; config: PublicationPageConfig; publications: Publication[] }
  | { type: 'text'; id: string; config: TextPageConfig; content: string }
  | { type: 'card'; id: string; config: CardPageConfig };

export interface HomePageLocaleData {
  author: SiteConfig['author'];
  social: SiteConfig['social'];
  features: SiteConfig['features'];
  enableOnePageMode?: boolean;
  researchInterests?: string[];
  pagesToShow: PageData[];
}

interface HomePageClientProps {
  dataByLocale: Record<string, HomePageLocaleData>;
  defaultLocale: string;
}

export default function HomePageClient({ dataByLocale, defaultLocale }: HomePageClientProps) {
  const locale = useLocaleStore((state) => state.locale);
  const fallback = dataByLocale[defaultLocale] || Object.values(dataByLocale)[0];
  const data = dataByLocale[locale] || fallback;

  if (!data) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-background min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-1">
          <Profile
            author={data.author}
            social={data.social}
            features={data.features}
            researchInterests={data.researchInterests}
          />
        </div>

        <div className="lg:col-span-2 space-y-8">
          {data.pagesToShow.map((page) => (
            <section key={page.id} id={page.id} className="scroll-mt-24 space-y-8">
              {page.type === 'about' && page.sections.map((section: SectionConfig) => {
                switch (section.type) {
                  case 'markdown':
                    return (
                      <About
                        key={section.id}
                        content={section.content || ''}
                        title={section.title}
                      />
                    );
                  case 'publications':
                    return (
                      <SelectedPublications
                        key={section.id}
                        publications={section.publications || []}
                        title={section.title}
                        enableOnePageMode={data.enableOnePageMode}
                      />
                    );
                  case 'highlights': {
                    const highlights = section.highlights;
                    if (!highlights) return null;
                    const headingId = `highlights-${section.id}`;

                    return (
                      <section key={section.id} aria-labelledby={headingId} className="border-t border-neutral-200 pt-6 dark:border-neutral-800">
                        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                          <h2 id={headingId} className="font-serif text-2xl font-bold text-primary">{highlights.title}</h2>
                          <Link href={`/${section.source}/`} aria-label={`View all ${highlights.title.toLowerCase()}`} className="text-sm font-medium text-neutral-600 underline-offset-4 hover:underline dark:text-neutral-500">
                            View all →
                          </Link>
                        </div>
                        <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
                          {highlights.items.map((item, index) => (
                            <li key={index} className="py-2.5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-500">
                              <strong className="text-primary">{item.title}</strong>
                              {item.subtitle && <> · {item.subtitle}</>}
                              {item.date && <> <span className="whitespace-nowrap text-xs">({item.date})</span></>}
                              {item.award && <strong className="block text-primary">{item.award}</strong>}
                            </li>
                          ))}
                        </ul>
                      </section>
                    );
                  }
                  case 'list':
                    return (
                      <News
                        key={section.id}
                        items={section.items || []}
                        title={section.title}
                      />
                    );
                  default:
                    return null;
                }
              })}
              {page.type === 'publication' && (
                <PublicationsList
                  config={page.config}
                  publications={page.publications}
                  embedded={true}
                />
              )}
              {page.type === 'text' && (
                <TextPage
                  config={page.config}
                  content={page.content}
                  embedded={true}
                />
              )}
              {page.type === 'card' && (
                <CardPage
                  config={page.config}
                  embedded={true}
                />
              )}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
