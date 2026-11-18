import express, { type Request, type Response } from 'express';
import expressWs from 'express-ws'
import { connectCassandra } from './db/cassandra.ts';
import { saveMessage } from './db/message.repository.ts';


const { app } = expressWs(express());
const Port = process.env.PORT || 3006;

app.get('/',(req:Request,res:Response)=>{
res.send("Hello from messaging")
})
//websocket endpoint
app.ws('/ws',(ws,req:Request)=>{
    console.log('client connected');
    ws.on('message',async (msg)=>{
        console.log(`received message: ${msg}`);
        let data;
        try {
            data = JSON.parse(msg.toString());
        } catch {
            ws.send(JSON.stringify({ error: 'message must be JSON' }));
            return;
        }
        if (typeof data?.conversationId !== 'string' || typeof data?.senderId !== 'string' || typeof data?.body !== 'string' || !data.body.trim()) {
            ws.send(JSON.stringify({ error: 'conversationId, senderId and body are required strings' }));
            return;
        }
        try {
            const saved = await saveMessage(data);
            ws.send(JSON.stringify({ saved }));
        } catch (err) {
            console.error('failed to save message', err);
            ws.send(JSON.stringify({ error: 'failed to save message' }));
        }
    });
    ws.on('close',()=>{
        console.log('client disconnected')
    })
})

await connectCassandra();
console.log('connected to cassandra');

app.listen(Port,() =>{
    console.log(`message service running on port ${Port}`)
})