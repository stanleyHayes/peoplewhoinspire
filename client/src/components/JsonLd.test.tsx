import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import JsonLd, { setPageJsonLd } from './JsonLd';
import { FOUNDER, SITE } from '../config/site';

function getGraph() {
  const el = document.head.querySelector<HTMLScriptElement>('script#pwi-jsonld');
  expect(el).toBeInTheDocument();
  return JSON.parse(el!.textContent || '{}');
}

describe('JsonLd', () => {
  it('always emits Organization and WebSite entities', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <JsonLd />
      </MemoryRouter>,
    );
    const graph = getGraph();
    const types = graph['@graph'].map((node: { '@type': string }) => node['@type']);
    expect(types).toContain('Organization');
    expect(types).toContain('WebSite');
    const org = graph['@graph'].find((node: { '@type': string }) => node['@type'] === 'Organization');
    expect(org.name).toBe(SITE.name);
    expect(org.sameAs.length).toBeGreaterThanOrEqual(4);
  });

  it('adds breadcrumbs on inner pages', () => {
    render(
      <MemoryRouter initialEntries={['/about']}>
        <JsonLd />
      </MemoryRouter>,
    );
    const graph = getGraph();
    const breadcrumbs = graph['@graph'].find(
      (node: { '@type': string }) => node['@type'] === 'BreadcrumbList',
    );
    expect(breadcrumbs).toBeTruthy();
    expect(breadcrumbs.itemListElement).toHaveLength(2);
    expect(breadcrumbs.itemListElement[1].name).toBe('About');
  });

  it('describes the founder as a Person on the founder page', () => {
    render(
      <MemoryRouter initialEntries={['/founder']}>
        <JsonLd />
      </MemoryRouter>,
    );
    const graph = getGraph();
    const person = graph['@graph'].find((node: { '@type': string }) => node['@type'] === 'Person');
    expect(person.name).toBe(FOUNDER.name);
  });

  it('describes the weekly live Event on the conversations page', () => {
    render(
      <MemoryRouter initialEntries={['/conversations']}>
        <JsonLd />
      </MemoryRouter>,
    );
    const graph = getGraph();
    const event = graph['@graph'].find((node: { '@type': string }) => node['@type'] === 'Event');
    expect(event.name).toContain('PWI Conversations');
  });
});

describe('setPageJsonLd', () => {
  it('injects and removes a page-specific block', () => {
    setPageJsonLd({ '@type': 'BlogPosting', headline: 'Hello' });
    const el = document.head.querySelector<HTMLScriptElement>('script#pwi-jsonld-page');
    expect(el).toBeInTheDocument();
    expect(JSON.parse(el!.textContent || '{}').headline).toBe('Hello');

    setPageJsonLd(null);
    expect(document.head.querySelector('script#pwi-jsonld-page')).not.toBeInTheDocument();
  });
});
