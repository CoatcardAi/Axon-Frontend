const net = require('net');

const client = net.createConnection({ port: 15004, host: 'cow-iron-smiling-97066.db.redis.io' }, () => {
    client.write('*3\r\n$4\r\nAUTH\r\n$7\r\ndefault\r\n$32\r\nCMVH55CZcFDAz6P1O54IevfiPr9N5jRj\r\n');
});

let authed = false;
let buffer = '';
client.on('data', (data) => {
    buffer += data.toString();
    if (!authed) {
        if (buffer.includes('+OK\r\n')) {
            authed = true;
            buffer = '';
            client.write('*2\r\n$4\r\nKEYS\r\n$1\r\n*\r\n');
        }
    }
});

setTimeout(() => {
    console.log('Buffer length:', buffer.length);
    console.log('Keys List Contains otp:', buffer.includes('otp'));
    
    // Parse Redis RESP array response
    const lines = buffer.split('\r\n');
    const keys = lines.filter(l => l && !l.startsWith('*') && !l.startsWith('$'));
    console.log('Total keys parsed:', keys.length);
    const otpKeys = keys.filter(k => k.includes('otp'));
    console.log('OTP keys:', otpKeys);
    
    // Also look for values if any OTP key is found
    if (otpKeys.length > 0) {
        const otpKey = otpKeys[0];
        console.log('Found OTP key:', otpKey);
        // Let's do a GET on this key
        const client2 = net.createConnection({ port: 15004, host: 'cow-iron-smiling-97066.db.redis.io' }, () => {
            client2.write('*3\r\n$4\r\nAUTH\r\n$7\r\ndefault\r\n$32\r\nCMVH55CZcFDAz6P1O54IevfiPr9N5jRj\r\n');
        });
        let auth2 = false;
        let buf2 = '';
        client2.on('data', (d) => {
            buf2 += d.toString();
            if (!auth2) {
                if (buf2.includes('+OK\r\n')) {
                    auth2 = true;
                    buf2 = '';
                    const cmd = `*2\r\n$3\r\nGET\r\n$${otpKey.length}\r\n${otpKey}\r\n`;
                    client2.write(cmd);
                }
            } else {
                console.log('GET Response:', JSON.stringify(buf2));
                client2.end();
            }
        });
    }
    
    client.end();
}, 2000);
