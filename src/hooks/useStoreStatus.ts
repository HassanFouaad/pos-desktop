import { eq } from "drizzle-orm";
import { useEffect, useState } from "react";
import { drizzleDb } from "../db";
import { powerSyncDb } from "../db/database";
import { stores } from "../db/schemas";
import { StoreDTO } from "../features/stores/repositories/stores.repository";
import { useAppSelector } from "../store/hooks";

interface StoreStatus {
  id: string;
  name: string | null;
  code: string | null;
  isActive: boolean | null;
}

interface UseStoreStatusReturn {
  isActive: boolean;
  loading: boolean;
  storeData: StoreStatus | null;
}

/**
 * Hook that watches the current store status in real-time using PowerSync watched queries.
 * Monitors the isActive field and provides live updates when it changes.
 */
export const useStoreStatus = (): UseStoreStatusReturn => {
  const [isActive, setIsActive] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [storeData, setStoreData] = useState<StoreStatus | null>(null);

  // Get the current store ID from global state
  const { storeId } = useAppSelector((state) => state.global.pairing);

  useEffect(() => {
    // If no store ID is available, assume active and not loading
    if (!storeId) {
      setLoading(false);
      setIsActive(true);
      return;
    }

    let isMounted = true;

    // Function to check store status
    const checkStoreStatus = async () => {
      try {
        const result = await drizzleDb
          .select({
            id: stores.id,
            name: stores.name,
            code: stores.code,
            isActive: stores.isActive,
          })
          .from(stores)
          .where(eq(stores.id, storeId))
          .limit(1)
          .execute();

        if (!isMounted) return;

        setLoading(false);

        if (result.length > 0) {
          const store = result[0];
          setStoreData(store);
          // If isActive is null or undefined, treat as active (default)
          setIsActive(store.isActive ?? true);
        } else {
          // No store found - treat as active to prevent blocking
          setStoreData(null);
          setIsActive(true);
        }
      } catch (error) {
        console.error("Error checking store status:", error);
        if (!isMounted) return;
        setLoading(false);
        setIsActive(true); // Default to active on error
      }
    };

    // Set up PowerSync watched query using the watch method on SQL query
    // PowerSync's watch() monitors the query and triggers callback on changes
    const setupWatch = async () => {
      try {
        const unsubscribe = await powerSyncDb.watch(
          `SELECT id, name, code, isActive FROM stores WHERE id = ?`,
          [storeId],
          {
            onResult: (result: any) => {
              result = result as StoreDTO;
              if (!isMounted) return;

              setLoading(false);

              if (result.rows && result.rows.length > 0) {
                const row = result.rows.item(0) as {
                  id: string;
                  name: string | null;
                  code: string | null;
                  isActive: number | boolean | null;
                };
                const store: StoreStatus = {
                  id: row.id,
                  name: row.name,
                  code: row.code,
                  // SQLite stores booleans as integers (0 or 1)
                  isActive: row.isActive === 1 || row.isActive === true,
                };
                setStoreData(store);
                // If isActive is null or undefined, treat as active (default)
                setIsActive(store.isActive ?? true);
              } else {
                // No store found - treat as active to prevent blocking
                setStoreData(null);
                setIsActive(true);
              }
            },
            onError: (error) => {
              console.error("Store status watch error:", error);
              if (!isMounted) return;
              setLoading(false);
              setIsActive(true); // Default to active on error
            },
          }
        );

        return unsubscribe;
      } catch (error) {
        console.error("Error setting up store watch:", error);
        if (!isMounted) return () => {};
        setLoading(false);
        setIsActive(true);
        return () => {};
      }
    };

    // Initial check
    checkStoreStatus();

    // Set up watch
    const watchPromise = setupWatch();

    // Cleanup subscription on unmount
    return () => {
      isMounted = false;
      watchPromise.then((unsubscribe) => {
        if (unsubscribe) unsubscribe();
      });
    };
  }, [storeId]);

  return { isActive, loading, storeData };
};
