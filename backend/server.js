import dgram from 'dgram';

// Create a UDP socket
const server = dgram.createSocket('udp4');

// Define the port number
const PORT = 5354;

// Parse DNS request and build response
function handleDnsQuery(msg) {
    const queryName = parseDnsQueryName(msg);
    console.log(`DNS Query for: ${queryName}`);

    // Build a simple DNS response
    const response = Buffer.alloc(512); // Allocate a 512-byte buffer
    msg.copy(response, 0, 0, 12); // Copy the header from the query
    response[2] |= 0x80; // Set the response flag
    response.writeUInt16BE(1, 6); // Answer count
    response.writeUInt16BE(0, 8); // Authority count
    response.writeUInt16BE(0, 10); // Additional count

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
    response.writeUInt8(127, offset); // 127.0.0.1
    response.writeUInt8(0, offset + 1);
    response.writeUInt8(0, offset + 2);
    response.writeUInt8(1, offset + 3);

    return response.slice(0, offset + 4);
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
    return name.slice(0, -1); // Remove trailing dot
}

// Event listener for incoming messages
server.on('message', (msg, rinfo) => {
    const response = handleDnsQuery(msg);
    server.send(response, rinfo.port, rinfo.address, (err) => {
        if (err) {
            console.error('Error sending response:', err);
        }
    });
});

// Event listener for errors
server.on('error', (err) => {
    console.error('Server error:', err);
    server.close();
});

// Bind the server to the specified port
server.bind(PORT, () => {
    console.log(`DNS server is listening on port ${PORT}`);
});
