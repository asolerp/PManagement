import React, {useState, createContext} from 'react';

export const LoadingModalContext = createContext();

export const LoadinModalProvider = ({children}) => {
  const [visible, setVisible] = useState(false);

  const togleVisible = () => {
    setVisible(!visible);
  };

  const value = {
    togleVisible,
    visible,
    setVisible,
  };

  return (
    <LoadingModalContext.Provider value={value}>
      {children}
    </LoadingModalContext.Provider>
  );
};
