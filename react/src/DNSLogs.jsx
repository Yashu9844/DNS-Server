import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TableHeader,
    
} from '../src/components/ui/table.tsx';
import { Button } from './components/ui/button.tsx';

const DnsLogs = () => {
    const [dnsLogs, setDnsLogs] = useState([]); // Store DNS logs
    const socket = io('http://localhost:3001'); // Connect to WebSocket server

    useEffect(() => {
        // Listen for 'dns-log' events from the server
        socket.on('dns-log', (data) => {
            console.log('DNS log received:', data);
            setDnsLogs((prevLogs) => [...prevLogs, data]);
        });

        // Cleanup: disconnect socket when the component unmounts
        return () => {
            socket.disconnect();
        };
    }, []);

    const clearLogs = () => {
        setDnsLogs([]);
    };

    return (
        <div className="p-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">DNS Logs</h2>
                <Button
                    variant="outline"
                    className="bg-red-500 text-white hover:bg-red-600"
                    onClick={clearLogs}
                >
                    Clear Logs
                </Button>
            </div>
            {dnsLogs.length === 0 ? (
                <p className="text-gray-500 mt-4">No logs received yet...</p>
            ) : (
                <Table className="mt-4 border rounded-md">
                    <TableHeader>
                        <TableRow>
                            <TableHead>#</TableHead>
                            <TableHead>Query</TableHead>
                            <TableHead>From</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {dnsLogs.map((log, index) => (
                            <TableRow key={index} className="hover:bg-gray-50">
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{log.query}</TableCell>
                                <TableCell>{log.from}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </div>
    );
};

export default DnsLogs;
