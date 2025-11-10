import { useState, useEffect } from "react";

export function useCurrentUser() {
  const [user, setUser] = useState(null);
  const [authenticated, setAuthenticated] = useState(null); 

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("http://localhost:5044/api/auth/me", {
          credentials: "include",
        });

        if (!res.ok) {
          setAuthenticated(false);
          return;
        }

        const data = await res.json();
        setUser(data);
        setAuthenticated(true);
      } catch (err) {
        setAuthenticated(false);
      }
    };

    fetchUser();
  }, []);

  return { user, authenticated };
}
