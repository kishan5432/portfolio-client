import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';

interface AnimatedTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  type?: 'words' | 'letters';
  as?: keyof JSX.IntrinsicElements;
  id?: string;
}

export function AnimatedText({
  text,
  className,
  delay = 0,
  duration = 0.5,
  type = 'words',
  as: Component = 'div',
  id
}: AnimatedTextProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <Component className={className} id={id}>{text}</Component>;
  }

  const words = text.split(' ');

  if (type === 'letters') {
    const letters = text.split('');
    return (
      <Component className={className} aria-label={text} id={id}>
        {letters.map((letter, index) => (
          <motion.span
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: duration / letters.length,
              delay: delay + (index * 0.02)
            }}
            className="inline-block"
          >
            {letter === ' ' ? '\u00A0' : letter}
          </motion.span>
        ))}
      </Component>
    );
  }

  return (
    <Component className={className} aria-label={text} id={id}>
      {words.map((word, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: duration / words.length,
            delay: delay + (index * 0.1)
          }}
          className="inline-block mr-2"
        >
          {word}
        </motion.span>
      ))}
    </Component>
  );
}

// Variant for typing effect
export function TypingText({
  text,
  className,
  delay = 0,
  speed = 50
}: Omit<AnimatedTextProps, 'type' | 'duration'> & { speed?: number }) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{text}</div>;
  }

  return (
    <motion.div
      className={cn('overflow-hidden', className)}
      initial={{ width: 0 }}
      animate={{ width: 'auto' }}
      transition={{
        duration: text.length * (speed / 1000),
        delay,
        ease: 'linear'
      }}
      aria-label={text}
    >
      {text}
    </motion.div>
  );
}
