import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Link } from 'react-router-dom'

import { cn } from '@/lib/utils'

/** An interactive tag: a small rounded pill that links somewhere or does something (search by this tag, filter by it, …). It is
 *  the clickable counterpart of `Badge`, which only labels. Always a real `<a>` or `<button>`, so it is focusable, announced as a
 *  link or button, and works with Enter (and Space for buttons).
 *
 *  Sizes: `sm` is the established tag (12px text, 10px × 2px padding, 22px tall, as the dataset page's tags). Each larger size is
 *  20% bigger than the one before it, so the steps are ×1 · ×1.2 · ×1.44 · ×1.728. Padding and gap are in `em`, so the whole
 *  pill, not just the text, scales together; the 1px border stays 1px. */

export const TAG_SIZES = {
  sm: { fontPx: 12, scale: 1 },
  md: { fontPx: 14.4, scale: 1.2 },
  lg: { fontPx: 17.28, scale: 1.44 },
  xl: { fontPx: 20.736, scale: 1.728 },
} as const
export type TagSize = keyof typeof TAG_SIZES

const tagVariants = cva(
  [
    // 1/6 em vertical, 5/6 em horizontal and 1/3 em gap are the `sm` tag's 2px, 10px and 4px (written as exact fractions).
    'inline-flex shrink-0 items-center gap-[calc(1em/3)] rounded-full border border-border-default bg-surface-subdued px-[calc(5em/6)] py-[calc(1em/6)] font-medium text-text-subdued',
    'transition-colors hover:bg-surface-accent hover:text-text-on-accent',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2',
  ],
  {
    variants: {
      // The line height follows each size (4/3, the `sm` tag's 16px on 12px). It is written with the size because tailwind-merge
      // treats a font size as overriding an earlier line height.
      size: {
        sm: 'text-[12px] leading-[calc(4/3)]',
        md: 'text-[14.4px] leading-[calc(4/3)]',
        lg: 'text-[17.28px] leading-[calc(4/3)]',
        xl: 'text-[20.736px] leading-[calc(4/3)]',
      },
    },
    defaultVariants: { size: 'sm' },
  },
)

type CommonProps = VariantProps<typeof tagVariants> & { children: React.ReactNode; className?: string }
export type TagProps = CommonProps &
  (
    | ({ to: string } & Omit<React.ComponentProps<typeof Link>, 'to' | 'className' | 'children'>)
    | ({ href: string } & Omit<React.ComponentProps<'a'>, 'href' | 'className' | 'children'>)
    | ({ to?: undefined; href?: undefined; onClick: React.MouseEventHandler<HTMLButtonElement> } & Omit<React.ComponentProps<'button'>, 'onClick' | 'className' | 'children'>)
  )

function Tag(props: TagProps) {
  const { size, className, children, ...rest } = props
  const classes = cn(tagVariants({ size }), className)
  if ('to' in rest && rest.to !== undefined) {
    return (
      <Link data-slot="tag" className={classes} {...rest}>
        {children}
      </Link>
    )
  }
  if ('href' in rest && rest.href !== undefined) {
    return (
      <a data-slot="tag" className={classes} {...rest}>
        {children}
      </a>
    )
  }
  const { to: _to, href: _href, ...button } = rest as { to?: undefined; href?: undefined } & React.ComponentProps<'button'>
  return (
    <button data-slot="tag" type="button" className={classes} {...button}>
      {children}
    </button>
  )
}

export { Tag, tagVariants }
