# Real-Time Hardware & Cluster Inventory Tracker

A real-time hardware inventory tracking system demonstrating advanced architecture patterns.

## Architecture

- **Backend**: Python FastAPI, Async Polling, Server-Sent Events (SSE)
- **Frontend**: React, Vite, TypeScript, Optimistic UI Updates
- **Databases (Polyglot Persistence)**:
  - **PostgreSQL**: Relational asset management
  - **MongoDB**: High-velocity time-series telemetry streams
- **Infrastructure**: Kubernetes manifests provided for local deployments

## Local Development

You can deploy the entire stack using the provided Kubernetes manifests located in `k8s/`.

```bash
kubectl apply -f k8s/
```
