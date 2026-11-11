import express from 'express';
import { notificationSchema } from './events.ts';
import { render } from './templates/index.ts';
import { sendEmail } from './mailer.ts';

const app = express();
const PORT = process.env.PORT || 3005;

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Internal endpoint: other services call this, e.g. identity after registration.
app.post('/notifications', async (req, res) => {
  const parsed = notificationSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues });
  }
  try {
    await sendEmail(parsed.data.to, render(parsed.data));
    res.status(202).json({ status: 'sent' });
  } catch (err) {
    console.error('failed to send notification', err);
    res.status(502).json({ error: 'email provider failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Notification service listening on port ${PORT}`);
});
