import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  // Read from localStorage immediately
  const savedToken = localStorage.getItem('token');
  const savedUser  = localStorage.getItem('user');

  const [token, setToken] = useState(savedToken || null);

  const [user, setUser] = useState(
    savedUser ? JSON.parse(savedUser) : null
  );

  const login = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);

    localStorage.setItem('token', userToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);

    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const refreshUser = async () => {
  try {
    const res = await fetch(`http://localhost:5000/api/auth/profile`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    const data = await res.json();
    setUser(data);
    localStorage.setItem('user', JSON.stringify(data));
  } catch (err) { console.error(err); }
};

  const isLoggedIn = !!token;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isLoggedIn,
        
        refreshUser
        
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => useContext(AuthContext);
