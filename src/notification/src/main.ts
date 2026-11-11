import express from 'express';

const app = express();
const PORT = process.env.PORT || 3005;

app.listen(PORT, () => {
    console.log(`Service listening on port ${PORT}`);
});   
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});
