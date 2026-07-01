import React, { useState } from 'react';
import { AssetGrid } from './AssetGrid';
import { TelemetryFeed } from './TelemetryFeed';
import { AddAssetForm } from './AddAssetForm';
import type { ViewMode } from '../types';

export const Dashboard: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('SQL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="app-container">
      <header>
        <div>
          <h1 className="glow-text">Hardware Tracker</h1>
          <p className="text-muted">Advanced Polyglot Architecture</p>
        </div>
        
        <div className="flex-row-center">
          {viewMode === 'SQL' && (
            <button 
              className="toggle-btn btn-success"
              onClick={() => setIsModalOpen(true)}
            >
              + Add Asset
            </button>
          )}
          
          <div className="view-toggle glass-panel p-0-5 rounded-pill">
            <button 
              className={`toggle-btn ${viewMode === 'SQL' ? 'active' : ''}`}
              onClick={() => setViewMode('SQL')}
            >
              Asset Management (PostgreSQL)
            </button>
            <button 
              className={`toggle-btn ${viewMode === 'NOSQL' ? 'active' : ''}`}
              onClick={() => setViewMode('NOSQL')}
            >
              Live Telemetry (MongoDB)
            </button>
          </div>
        </div>
      </header>

      <main>
        {isModalOpen && (
          <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <AddAssetForm onClose={() => setIsModalOpen(false)} />
            </div>
          </div>
        )}
        
        {viewMode === 'SQL' ? (
          <AssetGrid />
        ) : (
          <TelemetryFeed />
        )}
      </main>
    </div>
  );
};
