import { motion, useReducedMotion } from 'framer-motion'
import { CSS_GRADE } from '../lib/grade'
import { img, isLocal } from '../data/content'

export const EASE = [0.22, 1, 0.36, 1]

// Two stacked copies of a label that roll vertically on hover (reference nav / buttons)
export function RollText({ children }) {
  return (
    <span className="roll" aria-hidden="false">
      <span className="roll__inner">
        <span>{children}</span>
        <span aria-hidden="true">{children}</span>
      </span>
    </span>
  )
}

// Masked line-by-line text reveal
export function Reveal({ lines, as: Tag = 'div', className, delay = 0, stagger = 0.08, id }) {
  const reduce = useReducedMotion()
  return (
    <Tag className={className} id={id}>
      {lines.map((l, i) => (
        <span className="line-mask" key={i}>
          <motion.span
            initial={reduce ? { opacity: 0 } : { y: '105%' }}
            whileInView={reduce ? { opacity: 1 } : { y: '0%' }}
            viewport={{ once: true, margin: '0px 0px -10% 0px' }}
            transition={{ duration: 1, ease: EASE, delay: delay + i * stagger }}
          >
            {l}
          </motion.span>
        </span>
      ))}
    </Tag>
  )
}

export function FadeUp({ children, delay = 0, className, as = 'div', ...rest }) {
  const reduce = useReducedMotion()
  const M = motion[as]
  return (
    <M
      className={className}
      initial={{ opacity: 0, y: reduce ? 0 : 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -8% 0px' }}
      transition={{ duration: 0.9, ease: EASE, delay }}
      {...rest}
    >
      {children}
    </M>
  )
}

// Image with the shared grade, lazy loading and a clip-path reveal
export function Photo({ id, w = 1200, h, alt, ratio, className, reveal = true, style, sizes }) {
  const reduce = useReducedMotion()
  const src = img(id, w, h)
  const srcSet = isLocal(id) ? undefined : [600, 1000, 1600].map((x) => `${img(id, x, h ? Math.round((h / w) * x) : undefined)} ${x}w`).join(', ')
  return (
    <motion.div
      className={className}
      style={{ aspectRatio: ratio, ...style }}
      initial={reveal && !reduce ? { clipPath: 'inset(100% 0% 0% 0%)' } : false}
      whileInView={{ clipPath: 'inset(0% 0% 0% 0%)' }}
      viewport={{ once: true, margin: '0px 0px -5% 0px' }}
      transition={{ duration: 1.2, ease: EASE }}
    >
      <img
        src={src}
        srcSet={srcSet}
        sizes={sizes || '(max-width: 767px) 100vw, 33vw'}
        alt={alt}
        loading="lazy"
        decoding="async"
        style={{ filter: CSS_GRADE, width: '100%', height: '100%', objectFit: 'cover' }}
      />
    </motion.div>
  )
}
