import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";

const FavoritesContext = createContext({
  favorites: [],
  loading: true,
  isFavorite: () => false,
  toggleFavorite: () => {},
});

const parseStoredFavorites = (storedValue) => {
  if (!storedValue) return [];
  try {
    const parsed = JSON.parse(storedValue);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("Impossible de lire les favoris stockés", error);
    return [];
  }
};

export function FavoritesProvider({ children }) {
  const { user, loading: authLoading } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const storageKey = useMemo(() => {
    if (!user) return "favorites:guest";
    return `favorites:${user.id}`;
  }, [user]);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    const storedFavorites = parseStoredFavorites(
      window.localStorage.getItem(storageKey)
    );
    setFavorites(storedFavorites);
    setLoading(false);
  }, [authLoading, storageKey, user]);

  useEffect(() => {
    if (loading || !user) return;
    window.localStorage.setItem(storageKey, JSON.stringify(favorites));
  }, [favorites, loading, storageKey, user]);

  const isFavorite = useCallback(
    (listingId) => favorites.includes(listingId),
    [favorites]
  );

  const toggleFavorite = useCallback((listingId) => {
    if (!listingId) return;
    setFavorites((prev) =>
      prev.includes(listingId)
        ? prev.filter((id) => id !== listingId)
        : [...prev, listingId]
    );
  }, []);

  const value = useMemo(
    () => ({
      favorites,
      loading,
      isFavorite,
      toggleFavorite,
    }),
    [favorites, isFavorite, loading, toggleFavorite]
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  return useContext(FavoritesContext);
}