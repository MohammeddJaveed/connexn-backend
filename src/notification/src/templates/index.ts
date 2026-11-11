import type { NotificationEvent } from '../events.ts';

export interface RenderedEmail {
  subject: string;
  text: string;
  html: string;
}

type Renderers = {
  [K in NotificationEvent['type']]: (
    data: Extract<NotificationEvent, { type: K }>['data'],
  ) => RenderedEmail;
};

const LOGIN_URL = process.env.LOGIN_URL ?? 'http://localhost:3000/login';

const button = (href: string, label: string) =>
  `<a href="${href}" target="_blank" style="display:inline-block;padding:12px 24px;background-color:#2563eb;color:#ffffff;text-decoration:none;font-weight:600;border-radius:6px;font-family:Arial,sans-serif;">${label}</a>`;

const renderers: Renderers = {
  REGISTRATION_COMPLETED: ({ name }) => ({
    subject: 'Welcome to Connexn!',
    text: `Hi ${name}, your registration is complete. Welcome aboard! Log in here: ${LOGIN_URL}`,
    html: `<p>Hi ${name},</p><p>Your registration is complete. Welcome aboard!</p><p>${button(LOGIN_URL, 'Log in to Connexn')}</p>`,
  }),
  PASSWORD_RESET_REQUESTED: ({ name, resetLink }) => ({
    subject: 'Reset your Connexn password',
    text: `Hi ${name}, reset your password here: ${resetLink}`,
    html: `<p>Hi ${name},</p><p><a href="${resetLink}">Reset your password</a></p>`,
  }),
};

export function render(event: NotificationEvent): RenderedEmail {
  return (renderers[event.type] as (d: unknown) => RenderedEmail)(event.data);
}
