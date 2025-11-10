interface BrandWordMoonpacketProps {
  as?: string;
  className?: string;
}

export default function BrandWordMoonpacket({ as = 'span', className = '' }: BrandWordMoonpacketProps) {
  const Tag = as as any;
  const combinedClass = `brand-mark ${className}`.trim();
  
  return <Tag className={combinedClass}>moonpacket</Tag>;
}

