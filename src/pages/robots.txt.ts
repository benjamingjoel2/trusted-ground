import type { APIRoute } from 'astro';
import { site } from '../config/site.config';
const agents = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-User', 'Claude-SearchBot', 'anthropic-ai', 'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Googlebot', 'Bingbot', 'Applebot', 'Applebot-Extended'];
export const GET: APIRoute = () =>
  new Response(
    [
      '# Trusted Ground welcomes search engines and AI assistants.',
      ...agents.flatMap((a) => [`User-agent: ${a}`, 'Allow: /', '']),
      'User-agent: *',
      'Allow: /',
      '',
      `Sitemap: ${site.url}/sitemap.xml`,
      '',
    ].join('\n'),
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
