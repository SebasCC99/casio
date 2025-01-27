import "@std/dotenv/load";

import { createClient } from "@supabase/supabase-js";
import { useWebSocket } from "@effection-contrib/websocket";
import { each, main } from "@effection/effection";
import { generate } from "@babia/uuid-v7";

// Create a single supabase client for interacting with your database
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_ANON_KEY")!,
);

async function insertToSupabase() {
  try {
    const { error } = await supabase
      .from("casio")
      .insert({
        id: generate(),
        created_at: new Date().toISOString(),
        title: "dummy test",
      });

    if (error) throw error;
    console.log("Data inserted successfully");
  } catch (error) {
    console.error("Error inserting data:", error);
  }
}

await main(function* () {
  const socket = yield* useWebSocket(Deno.env.get("WEBSOCKET_CLUSTER_URL")!);

  socket.send(JSON.stringify({
    action: "auth",
    params: Deno.env.get("POLYGON_API_KEY"),
  }));

  insertToSupabase();

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
