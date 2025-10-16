import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  title,
  description,
}) => {
  return (
    <div className={`bg-card rounded-lg shadow-md border border-border ${className}`}>
      {(title || description) && (
        <div className="px-6 py-4 border-b border-border">
          {title && <h3 className="text-lg font-semibold text-card-foreground">{title}</h3>}
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};