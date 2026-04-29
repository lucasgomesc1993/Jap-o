import { describe, it, expect, vi } from 'vitest';
import { metadata as layoutMetadata } from './layout';
import { metadata as loginMetadata } from './login/page';
import { metadata as cadastroMetadata } from './cadastro/page';
import { metadata as dashboardMetadata } from './dashboard/page';
import { metadata as ordersMetadata } from './dashboard/orders/page';
import robots from './robots';
import sitemap from './sitemap';

describe('SEO & Metadata', () => {
  it('should have robust global metadata in RootLayout', () => {
    expect(layoutMetadata.title).toBeDefined();
    expect(layoutMetadata.description).toContain('NipponBox');
    expect(layoutMetadata.openGraph).toBeDefined();
    expect(layoutMetadata.openGraph?.images).toBeDefined();
    expect(layoutMetadata.twitter).toBeDefined();
  });

  it('should have unique titles for main pages', () => {
    const loginTitle = typeof loginMetadata.title === 'string' ? loginMetadata.title : (loginMetadata.title as any)?.default;
    const cadastroTitle = typeof cadastroMetadata.title === 'string' ? cadastroMetadata.title : (cadastroMetadata.title as any)?.default;
    
    expect(loginTitle).toContain('Login');
    expect(cadastroTitle).toContain('Cadastro');
    expect(loginTitle).not.toBe(cadastroTitle);
  });

  it('should have specific metadata for dashboard pages', () => {
    expect(dashboardMetadata.title).toContain('Dashboard');
    expect(ordersMetadata.title).toContain('Meus Pedidos');
  });

  it('should generate correct robots.txt rules', () => {
    const robotsConfig = robots();
    expect(robotsConfig.rules).toBeDefined();
    const rules = Array.isArray(robotsConfig.rules) ? robotsConfig.rules[0] : robotsConfig.rules;
    expect(rules.disallow).toContain('/admin/');
    expect(rules.disallow).toContain('/dashboard/');
  });

  it('should generate a valid sitemap', () => {
    const sitemapConfig = sitemap();
    expect(sitemapConfig.length).toBeGreaterThan(0);
    const urls = sitemapConfig.map(s => s.url);
    expect(urls).toContain('https://nipponbox.com.br');
    expect(urls).toContain('https://nipponbox.com.br/login');
    expect(urls).toContain('https://nipponbox.com.br/cadastro');
  });
});
