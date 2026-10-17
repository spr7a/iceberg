import { createClient } from 'redis';

const client = createClient({
    username: 'default',
    password: 'te4ROZmXiAANX7XqNvO9uRjpxCT933G0',
    socket: {
        host: 'redis-18026.c246.us-east-1-4.ec2.cloud.redislabs.com',
        port: 18026
    }
});

client.on('error', err => console.log('Redis Client Error', err));

await client.connect();
