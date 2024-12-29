import dgram from 'dgram';

const client = dgram.createSocket('udp4');
const PORT = 5354; // Replace with your server port
const HOST = '127.0.0.1'; // Replace with your server address

// Construct a simple DNS query
const query = Buffer.from([
    0x00, 0x01, // Transaction ID
    0x01, 0x00, // Standard query
    0x00, 0x01, // Questions: 1
    0x00, 0x00, // Answer RRs
    0x00, 0x00, // Authority RRs
    0x00, 0x00, // Additional RRs
    0x07, 0x65, 0x78, 0x61, 0x6d, 0x70, 0x6c, 0x65, // "example"
    0x03, 0x63, 0x6f, 0x6d, // "com"
    0x00, // End of the name
    0x00, 0x01, // Type A
    0x00, 0x01, // Class IN
]);

// Send the query
client.send(query, PORT, HOST, (err) => {
    if (err) console.error(err);
    else console.log('Query sent!');
});

// Listen for response
client.on('message', (msg) => {
    console.log('Response received:', msg);
    client.close();
});
