import React, { useState } from 'react';
import { Input } from './components/ui/input'; // Import Input component
import { Button } from './components/ui/button'; // Import Button component

const DNSClient = () => {
  const [domain, setDomain] = useState(''); // State to store user input
  const [dnsResponse, setDnsResponse] = useState(null); // State to store DNS query response

  const queryDNS = async () => {
    if (domain) {
      try {
        // Send DNS query to the backend
        const response = await fetch(`http://localhost:3000/dns-query?domain=${domain}`);
        const data = await response.json();
        setDnsResponse(data); // Update the state with the response
      } catch (error) {
        console.error('Error querying DNS:', error);
      }
    }
  };

  const clearDNS = () => {
    setDomain('');
    setDnsResponse(null);
  }

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-semibold mb-4">DNS Query Client</h2>

      {/* Input for the domain */}
      <div className="flex items-center gap-4 mb-6">
        <Input
          placeholder="Enter domain (e.g., example.com)"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          className="flex-1"
        />
        <Button
          onClick={queryDNS}
          className="bg-blue-500 text-white hover:bg-blue-600"
        >
          Query DNS
        </Button>
        <Button
          onClick={clearDNS}
          className="bg-red-500 text-white hover:bg-blue-600"
        >
          Clear DNS
        </Button>
      </div>

      {/* Display the DNS Response in a simple Card layout */}
      {dnsResponse && (
  <div className="max-w-md mx-auto bg-white dark:bg-gray-800 text-black dark:text-white shadow-md rounded-md p-4 border dark:border-gray-700">
    <div className="border-b dark:border-gray-700 pb-4 mb-4">
      <h3 className="text-lg font-semibold">DNS Response</h3>
    </div>
    <div className="space-y-2">
      <p><strong>Domain:</strong> {dnsResponse.domain}</p>
      <p><strong>IP Address:</strong> {dnsResponse.ip}</p>
    </div>
    <div className="border-t dark:border-gray-700 pt-4 mt-4">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Query completed successfully.
      </p>
    </div>
  </div>
)}
    </div>
  );
};

export default DNSClient;
