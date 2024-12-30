import DomainManager from './DomainManager';
import DNSLogs from './DNSLogs';
import DNSClient from './WebSocketComponent';

function App() {
    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold text-center">Dynamic DNS Management</h1>
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
