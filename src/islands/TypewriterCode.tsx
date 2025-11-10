import { useEffect, useRef } from 'react';

interface Props {
  selector: string;
  text: string;
  speed?: number; // 打字速度（毫秒/字符）
}

export default function TypewriterCode({ selector, text, speed = 30 }: Props) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const textRef = useRef(text);

  useEffect(() => {
    textRef.current = text;
  }, [text]);

  useEffect(() => {
    const target = document.querySelector(selector) as HTMLElement | null;
    if (!target) return;
    const el = target as HTMLElement;

    // 如果 text 为空，直接清空内容
    if (!textRef.current) {
      target.textContent = '';
      return;
    }

    let currentIndex = 0;
    el.textContent = '';

    function type() {
      if (currentIndex < textRef.current.length) {
        el.textContent = textRef.current.substring(0, currentIndex + 1);
        currentIndex++;
        timeoutRef.current = setTimeout(type, speed);
      }
    }

    // 延迟开始，让页面先渲染
    timeoutRef.current = setTimeout(type, 100);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [selector, speed]);

  return null;
}

