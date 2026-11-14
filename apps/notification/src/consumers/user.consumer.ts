import { handle, subscribe, userSignedUp } from '@connexn/shared';
import { render } from '../templates/index.ts';
import { sendEmail } from '../mailer.ts';

export function startUserConsumer() {
  return subscribe('notification.user-events', [
    handle(userSignedUp, async ({ email, firstName }) => {
      await sendEmail(
        email,
        render({ type: 'REGISTRATION_COMPLETED', to: email, data: { name: firstName } }),
      );
    }),
  ]);
}
