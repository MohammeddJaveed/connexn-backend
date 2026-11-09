import express, { type Express, type Request, type Response } from 'express';
import { logger } from './utils/req.logger.ts';


const app: Express = express();
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  logger.info({ method: req.method, path: req.path }, 'Handling root request');
  res.send('api gateway service is running!');
});

const port = Number(process.env.PORT) || 3003;

app.listen(port, () => {
  logger.info({ port }, 'API gateway started');
});
