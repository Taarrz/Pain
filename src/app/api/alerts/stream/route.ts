import { requireNurse } from "@/lib/dal";
import { alertBus, type AlertBusEvent } from "@/lib/alert-bus";
import { prisma } from "@/lib/prisma";
import { serializeAlert } from "@/lib/alert-serialize";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  await requireNurse();

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let closed = false;

      const safeEnqueue = (chunk: string) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(chunk));
        } catch {
          closed = true;
        }
      };

      const sendEvent = (data: unknown) => {
        safeEnqueue(`data: ${JSON.stringify(data)}\n\n`);
      };

      sendEvent({ type: "ready" });

      const onEvent = async (event: AlertBusEvent) => {
        if (closed) return;
        if (event.type === "new") {
          const alert = await prisma.alert.findUnique({
            where: { id: event.alertId },
            include: {
              painRecord: {
                include: { patient: { include: { user: true } } },
              },
            },
          });
          if (alert) sendEvent({ type: "new", alert: serializeAlert(alert) });
        } else {
          sendEvent({ type: "acknowledged", alertId: event.alertId });
        }
      };

      alertBus.on("event", onEvent);

      const keepAlive = setInterval(() => safeEnqueue(`: ping\n\n`), 25000);

      const cleanup = () => {
        if (closed) return;
        closed = true;
        clearInterval(keepAlive);
        alertBus.off("event", onEvent);
        try {
          controller.close();
        } catch {}
      };

      request.signal.addEventListener("abort", cleanup);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
