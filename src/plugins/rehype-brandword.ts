import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';

// Wrap brand words in a span.brand-word with font-brand, enforcing lowercase display
// - "moonpocket" (case-insensitive) → render as "moonpacket" with brand styling
// - "$MOONINI" / "Moonini" (case-insensitive, with or without leading $) → render as "$moonini" or "moonini" with brand styling
// Avoid inside code/pre/script/style/link tags.
export const rehypeBrandword: Plugin = () => {
  const skip = new Set(['code', 'pre', 'script', 'style', 'link']);
  return (tree: any) => {
    visit(tree, 'text', (node: any, index, parent: any) => {
      if (!parent || index == null) return;
      // @ts-ignore
      if (skip.has((parent as any).tagName)) return;
      const value = node.value;
      if (!value || !/(moonpocket|moonpacket|\$?moonini)/i.test(value)) return;
      const parts: string[] = value.split(/(moonpocket|moonpacket|\$?moonini)/i);
      const children = parts.map((part: string) => {
        if (/^(moonpocket|moonpacket)$/i.test(part)) {
          // Apply .brand-mark class only (no color, size, tone - inherits from context)
          return {
            type: 'element',
            tagName: 'span',
            properties: { className: ['brand-mark'] },
            children: [{ type: 'text', value: 'moonpacket' }],
          };
        }
        if (/^\$?moonini$/i.test(part)) {
          const hasDollar = part.trim().startsWith('$');
          const text = (hasDollar ? '$' : '') + 'moonini';
          // Apply .brand-mark class only (no color, size, tone - inherits from context)
          return {
            type: 'element',
            tagName: 'span',
            properties: { className: ['brand-mark'] },
            children: [{ type: 'text', value: text }],
          };
        }
        return { type: 'text', value: part } as any;
      });
      // @ts-ignore
      parent.children.splice(index, 1, ...children);
      return index + children.length;
    });
  };
};

export default rehypeBrandword;


