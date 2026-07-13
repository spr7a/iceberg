import { createClient } from 'redis';

const client = createClient({
    username: 'default',
    password: 'RXCeJcLQZp2ObOkp9IcGdwwNOXbZSAta',
    socket: {
        host: 'redis-14817.crce217.ap-south-1-1.ec2.cloud.redislabs.com',
        port: 14817
    }
});

client.on('error', err => console.log('Redis Client Error', err));

await client.connect();


