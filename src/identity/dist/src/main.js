import express, {} from 'express';
const app = express();
app.get('/', (req, res) => {
    res.send('identity service is running');
});
const port = Number(process.env.PORT) || 3001;
app.listen(port, () => {
    console.log(`Identity service listening on http://localhost:${port}`);
});
