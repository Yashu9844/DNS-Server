import dgram from 'dgram';
import fs from 'fs';
import express from 'express';
import mongoose from 'mongoose';
import DomainMapping from './model/inout.model.js';
import cors from 'cors';
// MongoDB setup
const DATABASE_URL = "mongodb+srv://yashu:yashu@cluster0.3rzmd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0" 

mongoose.connect(DATABASE_URL);
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB.');
});





// UDP Server for DNS
const server = dgram.createSocket('udp4');
const PORT = 5352;

// Handle DNS Queries
async function handleDnsQuery(msg) {
    const queryName = parseDnsQueryName(msg);

    console.log(`DNS Query for: ${queryName}`);

    const mapping = await DomainMapping.findOne({ domain: queryName });
    const ip = mapping ? mapping.ip : '127.0.0.1'; // Default IP if domain is not found

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
server.on('message', async (msg, rinfo) => {
    const response = await handleDnsQuery(msg);
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
const app = express();
app.use(cors());
app.use(express.json());

// Get all domain mappings
app.get('/domains', async (req, res) => {
    const mappings = await DomainMapping.find();
    res.json(mappings.reduce((acc, mapping) => {
        acc[mapping.domain] = mapping.ip;
        return acc;
    }, {}));
});

// Add or update domain mapping
app.post('/domains', async (req, res) => {
    const { domain, ip } = req.body;
    if (domain && ip) {
        try {
            await DomainMapping.findOneAndUpdate({ domain }, { ip }, { upsert: true });
            res.status(200).json({ message: 'Domain added/updated successfully.' });
        } catch (error) {
            res.status(500).json({ message: 'Error saving domain mapping.' });
        }
    } else {
        res.status(400).json({ message: 'Invalid data.' });
    }
});

// Delete domain mapping
app.delete('/domains/:domain', async (req, res) => {
    const { domain } = req.params;
    try {
        const result = await DomainMapping.findOneAndDelete({ domain });
        if (result) {
            res.status(200).json({ message: 'Domain deleted successfully.' });
        } else {
            res.status(404).json({ message: 'Domain not found.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error deleting domain mapping.' });
    }
});
// Search for domains matching a query
app.get('/domains/search', async (req, res) => {
    const { query } = req.query;
    if (!query) {
        return res.status(400).json({ message: 'Search query is required.' });
    }

    try {
        const mappings = await DomainMapping.find({ 
            domain: { $regex: query, $options: 'i' } // Case-insensitive search
        });

        const result = mappings.reduce((acc, mapping) => {
            acc[mapping.domain] = mapping.ip;
            return acc;
        }, {});

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error searching domains.' });
    }
});

app.listen(3000, () => console.log('API server running on port 3000.'));
