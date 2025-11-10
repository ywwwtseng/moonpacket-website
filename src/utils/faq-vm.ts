/**
 * utils/faq-vm.ts
 * 
 * Build FAQ view-model from structured keys (qN_title, qN_body, or qN/aN + section_n)
 * Supports both new structured format (qN_title + qN_body) and legacy flat format (qN/aN + section_n)
 */

import { dropLeadingDupFromBody } from './text';

export type FAQItem = {
  title: string;
  body: string[];
};

export type FAQSection = {
  title?: string;
  items: FAQItem[];
};

export const buildFaqVM = (faq: Record<string, any>): { sections: FAQSection[] } => {
  if (!faq) return { sections: [] };

  const structuredSections: FAQSection[] = [];
  
  // normalize: array | string(\n) | object{0..n} -> string[]
  function toLines(value: any): string[] {
    try {
      if (!value) return [];
      if (Array.isArray(value)) return value.filter(Boolean).map(String);
      if (typeof value === 'string') return value.replace(/\\n/g, '\n').split(/\r?\n/).map(s => s.trim()).filter(Boolean);
      if (typeof value === 'object') return Object.keys(value).sort((a,b)=>Number(a)-Number(b)).map(k => String(value[k])).filter(Boolean);
      return [];
    } catch { return []; }
  }
  
  // Check if using new structured format (qN_title + qN_body)
  const hasNewFormat = Object.keys(faq).some(k => k.includes('_title') || k.includes('_body'));
  
  if (hasNewFormat) {
    // New structured format: qN_title + qN_body
    const titleKeys: number[] = [];
    for (let i = 1; i <= 99; i++) {
      if (faq[`q${i}_title`] || faq[`q${i}_body`]) {
        titleKeys.push(i);
      }
    }

    // Group by tens to create sections
    for (let i = 0; i < titleKeys.length; i++) {
      const num = titleKeys[i];
      const title = faq[`q${num}_title`];
      const body = toLines(faq[`q${num}_body`]);
      
      if (title || body.length > 0) {
        // Each qN_title + qN_body is a separate item in its own section
        const cleanedBody = dropLeadingDupFromBody(body, title, title);
        const item: FAQItem = {
          title: title || '',
          body: Array.isArray(cleanedBody) ? cleanedBody : [cleanedBody]
        };
        
        structuredSections.push({
          title: undefined, // Don't duplicate item title as section title
          items: [item]
        });
      }
    }
  } else {
    // Legacy flat format: qN/aN + section_n
    const qa: Array<{ idx: number; q: string; a: string }> = [];
    for (let i = 1; i <= 200; i++) {
      const qk = `q${i}`;
      const ak = `a${i}`;
      if (typeof faq[qk] === 'string') {
        qa.push({ idx: i, q: faq[qk], a: typeof faq[ak] === 'string' ? faq[ak] : '' });
      }
    }

    const sectionMarkers: Array<{ s: number; title: string }> = [];
    for (let s = 1; s <= 99; s++) {
      const sk = `section_${s}`;
      if (typeof faq[sk] === 'string' && faq[sk].trim() !== '') {
        sectionMarkers.push({ s, title: faq[sk] });
      }
    }

    if (sectionMarkers.length === 0) {
      // No sections, create single section
      const items: FAQItem[] = qa.map(x => {
        const cleanedBody = dropLeadingDupFromBody(x.a ? toLines(x.a) : [], x.q);
        return {
          title: x.q,
          body: Array.isArray(cleanedBody) ? cleanedBody : [cleanedBody]
        };
      });
      structuredSections.push({ items });
    } else {
      // Group items by section
      const sortedQa = qa.sort((a, b) => a.idx - b.idx);
      sectionMarkers.sort((a, b) => a.s - b.s);
      
      for (let i = 0; i < sectionMarkers.length; i++) {
        const cur = sectionMarkers[i];
        const next = sectionMarkers[i + 1];
        
        const items: FAQItem[] = sortedQa
          .filter(x => {
            if (!next) return x.idx >= cur.s;
            return x.idx >= cur.s && x.idx < next.s;
          })
          .map(x => {
            const cleanedBody = dropLeadingDupFromBody(x.a ? toLines(x.a) : [], x.q, cur.title);
            return {
              title: x.q,
              body: Array.isArray(cleanedBody) ? cleanedBody : [cleanedBody]
            };
          });
        
        structuredSections.push({ title: cur.title, items });
      }
    }
  }

  return { sections: structuredSections };
};

