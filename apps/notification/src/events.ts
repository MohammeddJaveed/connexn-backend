import { z } from 'zod';

// One entry per notification type. Add new events here.
export const notificationSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('REGISTRATION_COMPLETED'),
    to: z.email(),
    data: z.object({ name: z.string() }),
  }),
  z.object({
    type: z.literal('PASSWORD_RESET_REQUESTED'),
    to: z.email(),
    data: z.object({ name: z.string(), resetLink: z.url() }),
  }),
]);

export type NotificationEvent = z.infer<typeof notificationSchema>;
