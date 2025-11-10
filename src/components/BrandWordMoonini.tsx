interface BrandWordMooniniProps {
  as?: string;
  className?: string;
}

export default function BrandWordMoonini({ as = 'span', className = '' }: BrandWordMooniniProps) {
  const Tag = as as any;
  const combinedClass = `brand-mark ${className}`.trim();
  
  return <Tag className={combinedClass}>moonini</Tag>;
}

