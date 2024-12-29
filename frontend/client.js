import dgram from 'dgram';

const client = dgram.createSocket('udp4');
const PORT = 5352; // Replace with your server port
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

// Parse DNS query name from the response message
function parseDnsQueryName(msg) {
    let name = '';
    let offset = 12; // Start after the DNS header
    console.log('Parsing DNS Query Name...');
    while (msg[offset] !== 0) { // 0 indicates the end of the name
        const length = msg[offset];
        console.log(`Label length: ${length}`);
        offset++;
        const label = msg.slice(offset, offset + length).toString();
        console.log(`Label: ${label}`);
        name += label + '.';
        offset += length;
    }
    console.log(`Final offset: ${offset}`);
    return name.slice(0, -1); // Remove trailing dot
}

// Listen for response
client.on('message', (msg) => {
    const transactionId = msg.readUInt16BE(0);
    const flags = msg.readUInt16BE(2);
    const questions = msg.readUInt16BE(4);
    const answerCount = msg.readUInt16BE(6);
    const queryName = parseDnsQueryName(msg);
    const answerIp = Array.from(msg.subarray(msg.length - 4)).join('.');

    console.log(`Transaction ID: ${transactionId}`);
    console.log(`Flags: ${flags.toString(16)}`);
    console.log(`Questions: ${questions}`);
    console.log(`Answer Count: ${answerCount}`);
    console.log(`Query Name: ${queryName}`);
    console.log(`Answer IP: ${answerIp}`);
    client.close();
});
