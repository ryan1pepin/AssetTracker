import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Asset } from '../features/inventory/types';

interface InventoryContextType {
  assets: Asset[];
  setAssets: React.Dispatch<React.SetStateAction<Asset[]>>;
  optimisticUpdateStatus: (id: number, status: string) => void;
  rollbackStatus: (id: number) => void;
  fetchAssets: () => Promise<void>;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [assets, setAssets] = useState<Asset[]>([]);
  
  const fetchAssets = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/assets/');
      if (response.ok) {
        const data = await response.json();
        setAssets(data);
      }
    } catch (error) {
      console.error("Failed to fetch assets", error);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const optimisticUpdateStatus = (id: number, status: string) => {
    setAssets(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  };

  const rollbackStatus = (_id: number) => {
    // Re-fetch from truth source to rollback
    fetchAssets();
  };

  return (
    <InventoryContext.Provider value={{ assets, setAssets, optimisticUpdateStatus, rollbackStatus, fetchAssets }}>
      {children}
    </InventoryContext.Provider>
  );
}

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) throw new Error("useInventory must be used within InventoryProvider");
  return context;
};
