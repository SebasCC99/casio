import "@std/dotenv/load";

import { useWebSocket } from "@effection-contrib/websocket";
import { each, main } from "@effection/effection";

await main(function* () {
  const socket = yield* useWebSocket(Deno.env.get("WEBSOCKET_CLUSTER_URL")!);

  socket.send(JSON.stringify({
    action: "auth",
    params: Deno.env.get("POLYGON_API_KEY"),
  }));

  for (const message of yield* each(socket)) {
    const wsMessage = message as WebSocketMessageEvent;
    const [data] = JSON.parse(wsMessage.data) as PolygonWSMessageData[];

    if (data.status === "auth_success" && data.message === "authenticated") {
      socket.send(
        JSON.stringify({ "action": "subscribe", "params": "AM.AAPL" }),
      );
    }
    yield* each.next();
  }
});
