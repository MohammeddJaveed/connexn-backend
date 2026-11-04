import express, { type Express, type Request, type Response } from 'express';

const app: Express = express();

app.get('/', (req: Request, res: Response) => {
  res.send('Posts service is running!');
});

app.listen(3002, () => {
  console.log('Posts service is running at http://localhost:3002');
});
