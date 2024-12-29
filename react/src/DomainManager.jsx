import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3000';

function DomainManager() {
    const [domains, setDomains] = useState([]);
    const [domain, setDomain] = useState('');
    const [ip, setIp] = useState('');

    useEffect(() => {
        fetchDomains();
    }, []);

    const fetchDomains = async () => {
        const response = await axios.get(`${API_URL}/domains`);
        setDomains(response.data);
    };

    const addDomain = async () => {
        await axios.post(`${API_URL}/domains`, { domain, ip });
        fetchDomains();
        setDomain('');
        setIp('');
    };

    const deleteDomain = async (domain) => {
        await axios.delete(`${API_URL}/domains/${domain}`);
        fetchDomains();
    };

    return (
        <div>
            <h2>Manage Domains</h2>
            <div>
                <input
                    type="text"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    placeholder="Domain"
                />
                <input
                    type="text"
                    value={ip}
                    onChange={(e) => setIp(e.target.value)}
                    placeholder="IP Address"
                />
                <button onClick={addDomain}>Add/Update</button>
            </div>
            <ul>
                {Object.entries(domains).map(([domain, ip]) => (
                    <li key={domain}>
                        {domain} → {ip}{' '}
                        <button onClick={() => deleteDomain(domain)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default DomainManager;
