import { withRetry } from '../utils/retry.js';

export async function scrapePost(url: string): Promise<string> {
  return withRetry(async () => {
    const jinaUrl = `https://r.jina.ai/${url}`;

    const response = await fetch(jinaUrl, {
      headers: {
        Accept: 'text/plain',
        'X-Return-Format': 'markdown',
      },
    });

    if (!response.ok) {
      throw new Error(`Scrape failed: ${response.status} ${response.statusText}`);
    }

    const content = await response.text();

    if (content.length < 200) {
      throw new Error(
        'Scraped content too short — possible paywall, empty page or unsupported URL',
      );
    }

    return content;
  });
}
