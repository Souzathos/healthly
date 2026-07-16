import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TOKEN_KEY } from "../services/api";
import * as authApi from "../services/auth";
import { getMe } from "../services/users";

const USER_KEY = "healthly_user";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restaura sessão salva ao abrir o app
  useEffect(() => {
    (async () => {
      try {
        const savedToken = await AsyncStorage.getItem(TOKEN_KEY);
        const savedUser = await AsyncStorage.getItem(USER_KEY);
        if (savedToken) {
          setToken(savedToken);
          if (savedUser) setUserState(JSON.parse(savedUser));
        }
      } catch {
        // ignora
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const persist = async (t, u) => {
    setToken(t);
    setUserState(u);
    await AsyncStorage.setItem(TOKEN_KEY, t);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(u));
  };

  const signIn = useCallback(async (email, password) => {
    const res = await authApi.login(email, password);
    await persist(res.token, res.data);
  }, []);

  const signUp = useCallback(async (payload) => {
    await authApi.register(payload);
    const res = await authApi.login(payload.email, payload.password);
    await persist(res.token, res.data);
  }, []);

  const signOut = useCallback(async () => {
    setToken(null);
    setUserState(null);
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const me = await getMe();
      const u = {
        id: me.id,
        name: me.name,
        email: me.email,
        handle: me.handle,
        bio: me.bio,
        goal: me.goal,
      };
      setUserState(u);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(u));
    } catch {
      // ignora
    }
  }, []);

  const setUser = useCallback((u) => {
    setUserState(u);
    AsyncStorage.setItem(USER_KEY, JSON.stringify(u));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        signIn,
        signUp,
        signOut,
        refreshUser,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
