import React from 'react';
import Link from 'next/link';
import styles from './Button.module.css';

interface ButtonBaseProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'error';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
}

interface ButtonAsButtonProps extends ButtonBaseProps, React.ButtonHTMLAttributes<HTMLButtonElement> {
  href?: never;
}

interface ButtonAsLinkProps extends ButtonBaseProps, React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
}

type ButtonProps = ButtonAsButtonProps | ButtonAsLinkProps;

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  className = '',
  ...props
}) => {
  const buttonClasses = [
    styles.button,
    styles[variant],
    styles[size],
    loading ? styles.loading : '',
    fullWidth ? styles.fullWidth : '',
    className,
  ].join(' ');

  if ('href' in props && props.href) {
    const { href, ...linkProps } = props as ButtonAsLinkProps;
    return (
      <Link href={href} className={buttonClasses} {...linkProps}>
        {children}
      </Link>
    );
  }

  const { disabled, ...buttonProps } = props as ButtonAsButtonProps;

  return (
    <button 
      className={buttonClasses} 
      disabled={disabled || loading} 
      {...(buttonProps as React.ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {loading && <span className={styles.spinner}></span>}
      <span className={loading ? styles.contentHidden : ''}>{children}</span>
    </button>
  );
};
