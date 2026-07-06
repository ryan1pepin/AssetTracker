import { useState, useEffect } from 'react';
import type { TelemetryData } from '../types';

export function useInventoryStream(
  streamUrl: string,
  historyUrl: string,
  onMessage: (data: TelemetryData) => void,
  onHistory: (history: TelemetryData[]) => void
) {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let active = true;
    let eventSource: EventSource | null = null;

    async function initStream() {
      try {
        const res = await fetch(historyUrl);
        if (!res.ok) throw new Error('Failed to fetch telemetry history');
        const historyData: TelemetryData[] = await res.json();
        
        if (!active) return;
        
        onHistory(historyData);

        const lastId = historyData.length > 0 ? historyData[historyData.length - 1]._id : '';
        const urlWithParam = lastId ? `${streamUrl}?last_id=${lastId}` : streamUrl;

        eventSource = new EventSource(urlWithParam);

        eventSource.onopen = () => {
          if (active) setIsConnected(true);
        };

        eventSource.onmessage = (event) => {
          if (!active) return;
          const data: TelemetryData = JSON.parse(event.data);
          onMessage(data);
        };

        eventSource.onerror = () => {
          if (active) {
            setIsConnected(false);
            eventSource?.close();
          }
        };
      } catch (err) {
        console.error('Telemetry stream init error:', err);
        if (active) {
          eventSource = new EventSource(streamUrl);
          eventSource.onopen = () => {
            if (active) setIsConnected(true);
          };
          eventSource.onmessage = (event) => {
            if (!active) return;
            const data: TelemetryData = JSON.parse(event.data);
            onMessage(data);
          };
          eventSource.onerror = () => {
            if (active) {
              setIsConnected(false);
              eventSource?.close();
            }
          };
        }
      }
    }

    initStream();

    return () => {
      active = false;
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [streamUrl, historyUrl, onMessage, onHistory]);

  return { isConnected };
}
