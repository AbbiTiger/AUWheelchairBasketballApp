/**
 * AuthContext.jsx
 * Stripped of all @base44/sdk references.
 *
 * Currently ships as "always authenticated / no auth" so the app works
 * immediately without any auth service. When you're ready to add Azure AD
 * (MSAL) or another provider, replace the TODO sections below.
 */
import React, { createContext, useState, useContext } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // -------------------------------------------------------------------------
  // TODO (Azure AD / MSAL): Replace this stub with real token acquisition.
  //
  // Quick-start with MSAL:
  //   npm install @azure/msal-browser @azure/msal-react
  //   Wrap <App> with <MsalProvider instance={msalInstance}> in main.jsx
  //   Call useMsal() here to get accounts / tokens.
  // -------------------------------------------------------------------------
  const [user] = useState({ name: "Coach", email: "" }); // stub user
  const isAuthenticated = true;
  const isLoadingAuth = false;

  const logout = () => {
    // TODO: call msalInstance.logoutPopup() or logoutRedirect()
    console.log("logout called — wire up your auth provider here");
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoadingAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
