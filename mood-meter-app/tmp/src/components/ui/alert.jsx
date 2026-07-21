import React from 'react';

const Alert = ({ children, className }) => {
  return (
    <div className={`border-l-4 p-4 ${className} bg-yellow-100 border-yellow-500`} role="alert">
      {children}
    </div>
  );
};

const AlertTitle = ({ children }) => {
  return <h4 className="font-bold">{children}</h4>;
};

const AlertDescription = ({ children }) => {
  return <div className="mt-2">{children}</div>;
};

export { Alert, AlertTitle, AlertDescription };