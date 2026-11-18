import express, { type Request, type Response } from 'express';
import expressWs from 'express-ws'
import { connectCassandra } from './db/cassandra.ts';
import { saveMessage } from './db/message.repository.ts';
import { extractToken, verifyAccessToken, type AuthUser } from './auth.ts';
import { addConnection, removeConnection } from './connections.ts';


const { app } = expressWs(express());
const Port = process.env.PORT || 3006;

app.get('/',(req:Request,res:Response)=>{
res.send("Hello from messaging")
})

app.ws('/ws',(ws,req:Request)=>{
    const token = extractToken(req);
    let user: AuthUser;
    try {
        if (!token) throw new Error('missing token');
        user = verifyAccessToken(token);
    } catch {
        ws.close(4401, 'unauthorized');
        return;
    }

    const { userId } = user;
    addConnection(userId, ws);
    console.log(`client connected: ${userId}`);

    ws.on('message',async (msg)=>{
        let data;
        try {
            data = JSON.parse(msg.toString());
        } catch {
            ws.send(JSON.stringify({ error: 'message must be JSON' }));
            return;
        }
        if (typeof data?.conversationId !== 'string' || typeof data?.body !== 'string' || !data.body.trim()) {
            ws.send(JSON.stringify({ error: 'conversationId and body are required strings' }));
            return;
        }
        try {
            const saved = await saveMessage({
                conversationId: data.conversationId,
                senderId: userId,
                body: data.body,
            });
            ws.send(JSON.stringify({ saved }));
        } catch (err) {
            console.error('failed to save message', err);
            ws.send(JSON.stringify({ error: 'failed to save message' }));
        }
    });
    ws.on('close',()=>{
        removeConnection(userId, ws);
        console.log(`client disconnected: ${userId}`)
    })
})

await connectCassandra();
console.log('connected to cassandra');

app.listen(Port,() =>{
    console.log(`message service running on port ${Port}`)
})
