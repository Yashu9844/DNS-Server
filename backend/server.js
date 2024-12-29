import dgram from 'dgram';
import fs from 'fs';

const server = dgram.createSocket('udp4');
const PORT = 5352;
const DOMAIN_MAPPINGS_FILE = './domainMappings.json';

// Load domain mappings
let domainMappings = JSON.parse(fs.readFileSync(DOMAIN_MAPPINGS_FILE, 'utf-8'));

// Save domain mappings back to file
function saveMappings() {
    fs.writeFileSync(DOMAIN_MAPPINGS_FILE, JSON.stringify(domainMappings, null, 2));
}

// Handle DNS Queries
function handleDnsQuery(msg) {
    const queryName = parseDnsQueryName(msg);

    console.log(`DNS Query for: ${queryName}`);

    const ip = domainMappings[queryName] || '127.0.0.1'; // Default IP if domain is not found

    // Build DNS response
    const response = Buffer.alloc(512);
    msg.copy(response, 0, 0, 12); // Copy header
    response[2] |= 0x80; // Set response flag
    response.writeUInt16BE(1, 6); // Answer count

    // Append the answer
    let offset = msg.length;
    response.writeUInt16BE(0xc00c, offset); // Pointer to the query name
    offset += 2;
    response.writeUInt16BE(1, offset); // Type A
    offset += 2;
    response.writeUInt16BE(1, offset); // Class IN
    offset += 2;
    response.writeUInt32BE(300, offset); // TTL
    offset += 4;
    response.writeUInt16BE(4, offset); // Data length
    offset += 2;

    const ipParts = ip.split('.').map(Number);
    ipParts.forEach((part, i) => response.writeUInt8(part, offset + i));

    return Buffer.from(response.subarray(0, offset + 4));
}

// Parse DNS query name
function parseDnsQueryName(msg) {
    let name = '';
    let offset = 12; // Start after the DNS header
    while (msg[offset] !== 0) {
        const length = msg[offset];
        offset++;
        name += msg.slice(offset, offset + length).toString() + '.';
        offset += length;
    }
    return name.slice(0, -1);
}

// Event listeners
server.on('message', (msg, rinfo) => {
    const response = handleDnsQuery(msg);
    server.send(response, rinfo.port, rinfo.address, (err) => {
        if (err) console.error('Error sending response:', err);
    });
});

server.on('error', (err) => {
    console.error('Server error:', err);
    server.close();
});

server.bind(PORT, () => {
    console.log(`DNS server is listening on port ${PORT}`);
});

// API for React UI
import express from 'express';
const app = express();
app.use(express.json());

// Get all domain mappings
app.get('/domains', (req, res) => {
    res.json(domainMappings);
});

// Add or update domain mapping
app.post('/domains', (req, res) => {
    const { domain, ip } = req.body;
    if (domain && ip) {
        domainMappings[domain] = ip;
        saveMappings();
        res.status(200).json({ message: 'Domain added/updated successfully.' });
    } else {
        res.status(400).json({ message: 'Invalid data.' });
    }
});

// Delete domain mapping
app.delete('/domains/:domain', (req, res) => {
    const { domain } = req.params;
    if (domainMappings[domain]) {
        delete domainMappings[domain];
        saveMappings();
        res.status(200).json({ message: 'Domain deleted successfully.' });
    } else {
        res.status(404).json({ message: 'Domain not found.' });
    }
});

app.listen(3000, () => console.log('API server running on port 3000.'));
