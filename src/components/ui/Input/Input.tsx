import React, { forwardRef } from 'react';
import styles from './Input.module.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, helperText, errorMessage, icon, className = '', id, ...props }, ref) => {
    const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, '-')}`;
    
    return (
      <div className={`${styles.container} ${className}`}>
        {label && (
          <label htmlFor={inputId} className={styles.label}>
            {label}
          </label>
        )}
        <div className={styles.inputWrapper}>
          {icon && <span className={styles.icon}>{icon}</span>}
          <input
            ref={ref}
            id={inputId}
            className={`${styles.input} ${errorMessage ? styles.error : ''} ${icon ? styles.hasIcon : ''}`}
            aria-invalid={!!errorMessage}
            aria-describedby={errorMessage ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
            {...props}
          />
        </div>
        {errorMessage ? (
          <span id={`${inputId}-error`} className={styles.errorMessage}>
            {errorMessage}
          </span>
        ) : (
          helperText && (
            <span id={`${inputId}-helper`} className={styles.helperText}>
              {helperText}
            </span>
          )
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
