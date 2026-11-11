import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';
import type { RenderedEmail } from './templates/index.ts';

const ses = new SESv2Client({
  region: process.env.AWS_REGION ?? 'us-east-1',
  endpoint: process.env.SES_ENDPOINT,
});

const FROM = process.env.SES_FROM_EMAIL ?? 'no-reply@connexn.local';

export async function sendEmail(to: string, email: RenderedEmail) {
  await ses.send(
    new SendEmailCommand({
      FromEmailAddress: FROM,
      Destination: { ToAddresses: [to] },
      Content: {
        Simple: {
          Subject: { Data: email.subject },
          Body: { Text: { Data: email.text }, Html: { Data: email.html } },
        },
      },
    }),
  );
}
