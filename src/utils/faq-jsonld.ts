export interface FAQItem {
  title: string;
  body: string | string[];
}

export interface FAQPage {
  questions: FAQItem[];
}

/**
 * Generate JSON-LD FAQPage structured data from FAQ items
 * @param items Array of FAQ items with title and body
 * @returns JSON-LD script tag content
 */
export function generateFaqJsonLd(items: FAQItem[]): string {
  const questions = items
    .filter((item) => item.title && (Array.isArray(item.body) ? item.body.length > 0 : item.body))
    .map((item) => {
      const bodyText = Array.isArray(item.body) ? item.body.join('\n') : item.body;
      // Strip HTML tags for JSON-LD text content
      const cleanBody = bodyText.replace(/<[^>]*>/g, '').trim();
      
      return {
        '@type': 'Question',
        name: item.title,
        acceptedAnswer: {
          '@type': 'Answer',
          text: cleanBody
        }
      };
    });

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions
  };

  return JSON.stringify(schema);
}

/**
 * Strip HTML tags from text content
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
}
