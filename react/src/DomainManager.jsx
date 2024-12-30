import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TableHeader,
} from "../src/components/ui/table.tsx";
import { Input } from "../src/components/ui/input.tsx";
import { Button } from "../src/components/ui/button.tsx";
import { Card } from "./components/ui/card.tsx";

const API_URL = 'http://localhost:3000';

function DomainManager() {
    const [domains, setDomains] = useState([]);
    const [domain, setDomain] = useState('');
    const [ip, setIp] = useState('');
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchDomains();
    }, []);

    const fetchDomains = async () => {
        try {
            const response = await axios.get(`${API_URL}/domains`);
            setDomains(response.data);
        } catch (error) {
            console.error("Error fetching domains:", error);
        }
    };

    const addDomain = async () => {
        try {
            await axios.post(`${API_URL}/domains`, { domain, ip });
            fetchDomains();
            setDomain('');
            setIp('');
        } catch (error) {
            console.error("Error adding/updating domain:", error);
        }
    };

    const deleteDomain = async (domain) => {
        try {
            await axios.delete(`${API_URL}/domains/${domain}`);
            fetchDomains();
        } catch (error) {
            console.error("Error deleting domain:", error);
        }
    };

    const searchDomains = async (query) => {
        try {
            const response = await axios.get(`${API_URL}/domains/search`, { params: { query } });
            setDomains(response.data);
        } catch (error) {
            console.error("Error searching domains:", error);
        }
    };

    // Trigger search whenever the search input changes
    useEffect(() => {
        if (search.trim()) {
            searchDomains(search);
        } else {
            fetchDomains(); // Reset to all domains if search is empty
        }
    }, [search]);

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <h2 className="text-2xl font-bold text-center">Manage Domains</h2>

            {/* Add Domain Form */}
            <Card className="p-4 shadow-md">
                <div className="flex space-x-4">
                    <Input
                        placeholder="Domain (e.g., example.com)"
                        value={domain}
                        onChange={(e) => setDomain(e.target.value)}
                        className="flex-1"
                    />
                    <Input
                        placeholder="IP Address (e.g., 192.168.1.1)"
                        value={ip}
                        onChange={(e) => setIp(e.target.value)}
                        className="flex-1"
                    />
                    <Button onClick={addDomain}>Add/Update</Button>
                </div>
            </Card>

            {/* Search Bar */}
            <div className="flex justify-center">
                <Input
                    placeholder="Search domain..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-md"
                />
            </div>

            {/* Domain Table */}
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-1/2">Domain</TableHead>
                        <TableHead className="w-1/2">IP Address</TableHead>
                        <TableHead>Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Object.entries(domains).map(([domain, ip]) => (
                        <TableRow key={domain}>
                            <TableCell>{domain}</TableCell>
                            <TableCell>{ip}</TableCell>
                            <TableCell>
                                <Button
                                    variant="destructive"
                                    onClick={() => deleteDomain(domain)}
                                >
                                    Delete
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

export default DomainManager;
