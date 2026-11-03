import express, { type Express, type Request, type Response } from 'express';

const app: Express = express();

app.get('/', (req: Request, res: Response) => {
  res.send('identity service is running');
});

const port = Number(process.env.PORT) || 3001;

app.listen(port, () => {
  console.log(`Identity service listening on http://localhost:${port}`);
});
