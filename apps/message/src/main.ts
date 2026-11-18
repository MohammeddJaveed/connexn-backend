import express, { type Express, type Request, type Response } from 'express';


const app: Express = express();
const Port = process.env.PORT || 3006;
app.listen(Port,() =>{
    console.log(`message service running on port ${Port}`)
})