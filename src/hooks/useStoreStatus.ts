import { useEffect } from "react";
import { powerSyncDb } from "../db/database";
import { StoreDto } from "../features/stores/types";
import { setStore } from "../store/globalSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";

/**
 * Hook that watches the current store status in real-time using PowerSync watched queries.
 * Monitors the isActive field and provides live updates when it changes.
 */
export const useStoreStatus = () => {
  // Get the current store ID from global state
  const { storeId } = useAppSelector((state) => state.global.pairing);

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!storeId) {
      return;
    }

    let isMounted = true;

    // Set up PowerSync watched query using the watch method on SQL query
    // PowerSync's watch() monitors the query and triggers callback on changes
    const setupWatch = async () => {
      try {
        const unsubscribe = await powerSyncDb.watch(
          `SELECT * FROM stores WHERE id = ?`,
          [storeId],
          {
            onResult: (result) => {
              if (!isMounted) return;
              const store = result?.rows?._array?.[0] as any as StoreDto;
              if (store) {
                console.log("Store Steream updated", store);
                dispatch(setStore(store));
              }
            },
            onError: (error) => {
              console.error("Store status watch error:", error);
              if (!isMounted) return;
            },
          }
        );

        return unsubscribe;
      } catch (error) {
        console.error("Error setting up store watch:", error);
        if (!isMounted) return () => {};

        return () => {};
      }
    };

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

  return {};
};
