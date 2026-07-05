import React, { useState } from 'react';
import { useAssetMutations } from '../hooks/useAssetMutations';
import { useInventory } from '../../../context/InventoryContext';

interface AddAssetFormProps {
  onClose: () => void;
}

export const AddAssetForm: React.FC<AddAssetFormProps> = ({ onClose }) => {
  const { fetchAssets } = useInventory();
  const { createAsset, isUpdating } = useAssetMutations('http://localhost:8000/api/v1/assets');
  
  const [formData, setFormData] = useState({
    name: '',
    ip_address: '',
    mac_address: '',
    description: '',
    type: 'Server',
    status: 'Active'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createAsset(formData, () => {
      fetchAssets();
      onClose();
    });
  };

  return (
    <div className="glass-panel p-1-5">
      <h2 className="glow-text mb-1">Add New Asset</h2>
      <form onSubmit={handleSubmit} className="grid-form">
        <div className="form-group">
          <label>Name</label>
          <input required name="name" value={formData.name} onChange={handleChange} className="form-control" placeholder="e.g. Web Server 01" />
        </div>
        <div className="form-group">
          <label>IP Address</label>
          <input required name="ip_address" value={formData.ip_address} onChange={handleChange} className="form-control" placeholder="192.168.1.10" />
        </div>
        <div className="form-group">
          <label>MAC Address</label>
          <input name="mac_address" value={formData.mac_address} onChange={handleChange} className="form-control" placeholder="00:1B:44:11:3A:B7" />
        </div>
        <div className="form-group">
          <label>Type</label>
          <select name="type" value={formData.type} onChange={handleChange} className="form-control">
            <option value="Server">Server</option>
            <option value="Database">Database</option>
            <option value="Router">Router</option>
            <option value="Switch">Switch</option>
          </select>
        </div>
        <div className="form-group grid-col-full">
          <label>Description</label>
          <textarea name="description" value={formData.description} onChange={handleChange} className="form-control" rows={2} placeholder="Optional details..."></textarea>
        </div>
        <div className="grid-col-full mt-1 flex-row">
          <button type="button" onClick={onClose} className="toggle-btn flex-1">
            Cancel
          </button>
          <button type="submit" disabled={isUpdating} className="toggle-btn btn-primary flex-1">
            {isUpdating ? 'Adding...' : 'Add Asset to Fleet'}
          </button>
        </div>
      </form>
    </div>
  );
};
