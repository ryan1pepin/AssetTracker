import { Dashboard } from './features/inventory/components/Dashboard';
import { InventoryProvider } from './context/InventoryContext';

function App() {
  return (
    <InventoryProvider>
      <Dashboard />
    </InventoryProvider>
  );
}

export default App;
