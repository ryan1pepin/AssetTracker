import React, { useMemo, useState, useCallback, useRef } from 'react';
import { useInventoryStream } from '../hooks/useInventoryStream';
import { useInventory } from '../../../context/InventoryContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { TelemetryData } from '../types';

export const TelemetryFeed: React.FC = () => {
  const { assets } = useInventory();
  
  const [isChartPaused, setIsChartPaused] = useState(false);
  const [isStreamPaused, setIsStreamPaused] = useState(false);
  const [maxLogs, setMaxLogs] = useState(20);
  const [hiddenAssetIds, setHiddenAssetIds] = useState<Set<number>>(new Set());
  
  const [chartLogs, setChartLogs] = useState<TelemetryData[]>([]);
  const [streamLogs, setStreamLogs] = useState<TelemetryData[]>([]);

  const isChartPausedRef = useRef(isChartPaused);
  const isStreamPausedRef = useRef(isStreamPaused);
  const maxLogsRef = useRef(maxLogs);

  isChartPausedRef.current = isChartPaused;
  isStreamPausedRef.current = isStreamPaused;
  maxLogsRef.current = maxLogs;

  const handleNewData = useCallback((data: TelemetryData) => {
    if (!isChartPausedRef.current) {
      setChartLogs(prev => {
        const updated = [data, ...prev];
        if (updated.length > maxLogsRef.current) return updated.slice(0, maxLogsRef.current);
        return updated;
      });
    }
    
    if (!isStreamPausedRef.current) {
      setStreamLogs(prev => {
        const updated = [data, ...prev];
        if (updated.length > 50) return updated.slice(0, 50);
        return updated;
      });
    }
  }, []);

  const handleHistory = useCallback((history: TelemetryData[]) => {
    const reversedHistory = [...history].reverse();
    setChartLogs(reversedHistory.slice(0, maxLogsRef.current));
    setStreamLogs(reversedHistory.slice(0, 50));
  }, []);

  const { isConnected } = useInventoryStream(
    'http://localhost:8000/api/v1/telemetry/stream',
    'http://localhost:8000/api/v1/telemetry/history?limit=100',
    handleNewData,
    handleHistory
  );

  const assetNameMap = useMemo(() => {
    const map: Record<number, string> = {};
    assets.forEach(a => map[a.id] = a.name);
    return map;
  }, [assets]);

  const chartData = useMemo(() => {
    const grouped: Record<string, any> = {};
    const assetIds = new Set<number>();
    
    const sorted = [...chartLogs].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    sorted.forEach(log => {
      const timeStr = new Date(log.timestamp).toLocaleTimeString();
      if (!grouped[timeStr]) {
        grouped[timeStr] = { time: timeStr };
      }
      grouped[timeStr][`asset_${log.asset_id}_temp`] = log.temperature;
      grouped[timeStr][`asset_${log.asset_id}_ram`] = log.ram_usage;
      assetIds.add(log.asset_id);
    });

    return {
      data: Object.values(grouped),
      assetIds: Array.from(assetIds)
    };
  }, [chartLogs]);

  React.useEffect(() => {
    setChartLogs(prev => prev.length > maxLogs ? prev.slice(0, maxLogs) : prev);
  }, [maxLogs]);

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const handleLegendClick = (e: any) => {
    const dataKey = e.dataKey as string;
    if (!dataKey) return;
    
    const match = dataKey.match(/asset_(\d+)_/);
    if (match && match[1]) {
      const id = parseInt(match[1]);
      setHiddenAssetIds(prev => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    }
  };

  return (
    <div className="flex-col-large-gap">
      <div className="glass-panel p-1-5">
        
        <div className="flex-row-center mb-1" style={{ justifyContent: 'space-between' }}>
          <h2 className="glow-text" style={{ margin: 0 }}>
            Live Telemetry Charts 
            <span className={`text-sm ml-1 ${isConnected ? 'text-success' : 'text-danger'}`}>
              {isConnected ? '● Connected' : '○ Disconnected'}
            </span>
          </h2>
          
          <div className="flex-row-center">
            <select 
              className="form-control" 
              value={maxLogs} 
              onChange={e => setMaxLogs(Number(e.target.value))}
              style={{ padding: '0.25rem 0.5rem' }}
            >
              <option value={20}>Last 20 points</option>
              <option value={50}>Last 50 points</option>
              <option value={100}>Last 100 points</option>
            </select>
            <button 
              className={`toggle-btn ${isChartPaused ? 'btn-success' : 'btn-danger'}`}
              onClick={() => setIsChartPaused(!isChartPaused)}
            >
              {isChartPaused ? '▶ Resume' : '⏸ Pause Charts'}
            </button>
          </div>
        </div>
        
        {chartData.assetIds.length > 0 ? (
          <div className="grid-charts">
            <div>
              <h3 className="text-center mb-1 text-muted">Temperature (°C)</h3>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="time" stroke="var(--text-muted)" />
                  <YAxis stroke="var(--text-muted)" domain={[30, 90]} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--bg-color)', borderColor: 'var(--card-border)' }} />
                  <Legend onClick={handleLegendClick} wrapperStyle={{ cursor: 'pointer' }} />
                  {chartData.assetIds.map((id, index) => (
                    <Line 
                      key={`temp-${id}`} 
                      type="monotone" 
                      dataKey={`asset_${id}_temp`} 
                      name={assetNameMap[id] || `Asset ${id}`} 
                      stroke={colors[index % colors.length]} 
                      strokeWidth={2}
                      dot={false}
                      hide={hiddenAssetIds.has(id)}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div>
              <h3 className="text-center mb-1 text-muted">RAM Usage (%)</h3>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="time" stroke="var(--text-muted)" />
                  <YAxis stroke="var(--text-muted)" domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--bg-color)', borderColor: 'var(--card-border)' }} />
                  <Legend onClick={handleLegendClick} wrapperStyle={{ cursor: 'pointer' }} />
                  {chartData.assetIds.map((id, index) => (
                    <Line 
                      key={`ram-${id}`} 
                      type="monotone" 
                      dataKey={`asset_${id}_ram`} 
                      name={assetNameMap[id] || `Asset ${id}`} 
                      stroke={colors[index % colors.length]} 
                      strokeWidth={2}
                      dot={false}
                      hide={hiddenAssetIds.has(id)}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="text-muted text-center p-2">
            Waiting for telemetry data to build charts...
          </div>
        )}

      </div>
      
      <div className="glass-panel p-1-5">
        <div className="flex-row-center mb-1" style={{ justifyContent: 'space-between' }}>
          <h3 className="text-muted" style={{ margin: 0 }}>Raw Stream Log</h3>
          <button 
            className={`toggle-btn ${isStreamPaused ? 'btn-success' : 'btn-danger'}`}
            style={{ padding: '0.25rem 1rem', fontSize: '0.8rem' }}
            onClick={() => setIsStreamPaused(!isStreamPaused)}
          >
            {isStreamPaused ? '▶ Resume Log' : '⏸ Pause Log'}
          </button>
        </div>
        
        <div className="telemetry-feed" style={{ height: '25vh' }}>
          {streamLogs.map(log => (
            <div key={log._id} className="log-entry">
              <span className="log-time">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
              <span className="log-data">
                {assetNameMap[log.asset_id] || `Node #${log.asset_id}`} | CPU: {log.cpu_usage}% | RAM: {log.ram_usage}% | Temp: {log.temperature}°C
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
