import { useState, useCallback } from 'react';

export function useAssetMutations(apiUrl: string) {
  const [isUpdating, setIsUpdating] = useState(false);

  const updateAssetStatus = useCallback(
    async (
      assetId: number, 
      newStatus: string, 
      optimisticUpdate: (id: number, status: string) => void,
      rollback: (id: number) => void
    ) => {
      setIsUpdating(true);
      
      // Optimistic UI update
      optimisticUpdate(assetId, newStatus);
      
      try {
        const response = await fetch(`${apiUrl}/${assetId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to update asset');
        }
      } catch (error) {
        console.error("Mutation failed, rolling back UI", error);
        rollback(assetId);
      } finally {
        setIsUpdating(false);
      }
    },
    [apiUrl]
  );

  const createAsset = useCallback(
    async (assetData: any, onSuccess: () => void) => {
      setIsUpdating(true);
      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(assetData),
        });
        if (!response.ok) throw new Error('Failed to create asset');
        onSuccess();
      } catch (error) {
        console.error("Creation failed", error);
      } finally {
        setIsUpdating(false);
      }
    },
    [apiUrl]
  );

  const deleteAsset = useCallback(
    async (assetId: number, onSuccess: () => void) => {
      setIsUpdating(true);
      try {
        const response = await fetch(`${apiUrl}/${assetId}`, {
          method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete asset');
        onSuccess();
      } catch (error) {
        console.error("Deletion failed", error);
      } finally {
        setIsUpdating(false);
      }
    },
    [apiUrl]
  );

  return { updateAssetStatus, createAsset, deleteAsset, isUpdating };
}
