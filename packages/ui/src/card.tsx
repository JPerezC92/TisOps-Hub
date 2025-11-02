import { type JSX } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';

const card = tv({
  slots: {
    base: 'block rounded-lg border bg-white shadow-sm transition-all group',
    title: 'mb-2 text-xl font-semibold',
    arrow: 'inline-block transition-transform group-hover:translate-x-1',
    description: 'text-sm',
  },
  variants: {
    variant: {
      default: {
        base: 'border-gray-200 hover:shadow-md hover:border-gray-300 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700',
        title: 'text-gray-900 dark:text-gray-100',
        description: 'text-gray-600 dark:text-gray-400',
      },
      outlined: {
        base: 'border-2 border-blue-200 hover:border-blue-400 hover:shadow-lg dark:border-blue-800 dark:hover:border-blue-600',
        title: 'text-blue-900 dark:text-blue-100',
        description: 'text-blue-700 dark:text-blue-300',
      },
    },
    padding: {
      sm: { base: 'p-4' },
      md: { base: 'p-6' },
      lg: { base: 'p-8' },
    },
  },
  defaultVariants: {
    variant: 'default',
    padding: 'md',
  },
});

interface CardProps extends VariantProps<typeof card> {
  className?: string;
  title: string;
  children: React.ReactNode;
  href: string;
}

export function Card({
  className,
  title,
  children,
  href,
  variant,
  padding,
}: CardProps): JSX.Element {
  const styles = card({ variant, padding });
  
  return (
    <a
      className={styles.base({ className })}
      href={`${href}?utm_source=create-turbo&utm_medium=basic&utm_campaign=create-turbo"`}
      rel="noopener noreferrer"
      target="_blank"
    >
      <h2 className={styles.title()}>
        {title} <span className={styles.arrow()}>-&gt;</span>
      </h2>
      <p className={styles.description()}>{children}</p>
    </a>
  );
}
