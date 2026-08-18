import type { Prisma, PrismaClient } from "@prisma/client";

type Tx = PrismaClient | Prisma.TransactionClient;

/**
 * Records an internal notification. `userId` null means a clinic-wide
 * notice (shown to any staff member browsing /dashboard/notificaciones).
 * There is no outbound email/SMS delivery yet — that needs a messaging
 * provider (e.g. Resend/Twilio) wired in later.
 */
export async function notify(
  tx: Tx,
  params: { clinicId: string; userId?: string | null; type: string; message: string },
) {
  await tx.notification.create({
    data: {
      clinicId: params.clinicId,
      userId: params.userId ?? null,
      type: params.type,
      channel: "internal",
      status: "sent",
      sentAt: new Date(),
      payload: { message: params.message },
    },
  });
}
