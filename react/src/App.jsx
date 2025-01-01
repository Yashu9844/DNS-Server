import DomainManager from './DomainManager';
import DNSLogs from './DNSLogs';
import DNSClient from './WebSocketComponent';
import ThemeToggle from './ThemeToggle';

function App() {
    return (
      <div className="p-6 space-y-6 bg-white text-black dark:bg-gray-900 dark:text-white">
        <div className="flex justify-evenly items-center">
          <h1 className="text-3xl font-bold ">Dyanamic DNS Management</h1>
          <ThemeToggle />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border p-4 rounded shadow-md">
            <DomainManager />
          </div>
          <div className="border p-4 rounded shadow-md">
            <DNSClient />
          </div>
        </div>
      </div>
    );
  }
  
  export default App;
  
