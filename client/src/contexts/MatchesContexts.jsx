import React, { createContext, useContext, useState } from 'react';

const MatchesContext = createContext();

export const MatchesProvider = ({ children }) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refreshMatches = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <MatchesContext.Provider value={{ refreshMatches }}>
      {children}
    </MatchesContext.Provider>
  );
};

export const useMatches = () => {
  const context = useContext(MatchesContext);
  if (!context) {
    throw new Error('useMatches must be used within a MatchesProvider');
  }
  return context;
};

export default MatchesContext;