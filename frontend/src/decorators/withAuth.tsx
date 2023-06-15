import { useAtom } from "jotai";
import { createContext, useState } from "react";
import { toast } from "react-toastify";
import { ALERT_TYPES, Alert } from "../components/alert";
import { CONFIG } from "../config/config";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "../config/constants";
import SignIn from "../screens/sign-in/sign-in";
import { configState } from "../state/atoms/config.atom";
// import { parseJwt } from "../utils/common";
import { fetchUrl } from "../utils/fetch";

// Export auth context
export const AuthContext = createContext(null);

export const setTokens = (result: any) => {
  if (result?.access_token) {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, result?.access_token);
  }

  if (result?.refresh_token) {
    sessionStorage.setItem(REFRESH_TOKEN_KEY, result?.refresh_token);
  }
};

export const removeTokens = () => {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const signOut = () => {
  removeTokens();
  window.location.reload();
};

export const getNewToken = async () => {
  const refreshToken = sessionStorage.getItem(REFRESH_TOKEN_KEY);

  if (!refreshToken) {
    return;
  }

  const payload = {
    method: "POST",
    headers: {
      authorization: `Bearer ${refreshToken}`,
    },
  };

  const result = await fetchUrl(CONFIG.AUTH_REFRESH_TOKEN_URL, payload);

  if (!result?.access_token) {
    return signOut();
  }

  setTokens(result);

  return result;
};

// Add auth data in compo
export const withAuth = (AppComponent: any) => (props: any) => {
  const [config] = useAtom(configState);

  const localToken = sessionStorage.getItem(ACCESS_TOKEN_KEY);

  // const [isLoadingToken, setIsLoadingToken] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [accessToken, setAccessToken] = useState(localToken);

  const signOut = () => {
    removeTokens();
    setAccessToken("");
  };

  const signIn = async (data: any) => {
    const payload = {
      method: "POST",
      body: JSON.stringify(data),
    };

    const result = await fetchUrl(CONFIG.AUTH_SIGN_IN_URL, payload);

    setIsLoading(false);

    if (!result?.access_token) {
      toast(<Alert type={ALERT_TYPES.ERROR} message="Invalid username and password" />);

      return;
    }

    setAccessToken(result?.access_token);

    setTokens(result);
  };

  if (
    config?.experimental_features?.ignore_authentication_requirements ||
    config?.main?.allow_anonymous_access
  ) {
    return (
      <AuthContext.Provider value={null}>
        <AppComponent {...props} />
      </AuthContext.Provider>
    );
  }

  if (accessToken) {
    const auth = {
      accessToken,
      signOut,
    };

    return (
      <AuthContext.Provider value={auth}>
        <AppComponent {...props} />
      </AuthContext.Provider>
    );
  }

  return <SignIn isLoading={isLoading} onSubmit={signIn} />;
};
