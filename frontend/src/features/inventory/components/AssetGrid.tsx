import React from 'react';
import { useInventory } from '../../../context/InventoryContext';
import { useAssetMutations } from '../hooks/useAssetMutations';

export const AssetGrid: React.FC = () => {
  const { assets, optimisticUpdateStatus, rollbackStatus, fetchAssets } = useInventory();
  const { updateAssetStatus, deleteAsset } = useAssetMutations('http://localhost:8000/api/v1/assets');

  const handleToggleStatus = (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'Active' ? 'Maintenance' : 'Active';
    updateAssetStatus(id, newStatus, optimisticUpdateStatus, rollbackStatus);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this asset?')) {
      deleteAsset(id, fetchAssets);
    }
  };

  return (
    <div className="dashboard-grid">
      {assets.map(asset => (
        <div key={asset.id} className="asset-card glass-panel">
          <div className="card-header">
            <h3 className="glow-text">{asset.name}</h3>
            <span className={`status-badge status-${asset.status.toLowerCase()}`}>
              {asset.status}
            </span>
          </div>
          
          <div className="metrics-row">
            <div className="metric">
              <span className="metric-label">IP Address</span>
              <span className="metric-value">{asset.ip_address}</span>
            </div>
            <div className="metric">
              <span className="metric-label">Type</span>
              <span className="metric-value">{asset.type}</span>
            </div>
            {asset.mac_address && (
              <div className="metric">
                <span className="metric-label">MAC</span>
                <span className="metric-value text-sm">{asset.mac_address}</span>
              </div>
            )}
          </div>
          
          {asset.description && (
            <div className="mt-0-5 text-sm text-muted">
              {asset.description}
            </div>
          )}

          <div className="flex-row mt-1">
            <button 
              className="toggle-btn flex-1"
              onClick={() => handleToggleStatus(asset.id, asset.status)}
            >
              Toggle Status
            </button>
            <button 
              className="toggle-btn btn-danger"
              onClick={() => handleDelete(asset.id)}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
      {assets.length === 0 && (
        <div className="text-muted text-center">No assets loaded yet.</div>
      )}
    </div>
  );
};
