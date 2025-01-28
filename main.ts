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

async function insertToSupabase(aggregate: Schema) {
  try {
    const { error } = await supabase
      .from("porsche")
      .insert({
        id: generate(),
        created_at: new Date().toISOString(),
        ...aggregate,
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

  for (const message of yield* each(socket)) {
    const wsMessage = message as WebSocketMessageEvent;
    // Want to improve type safety of data
    const [data] = JSON.parse(wsMessage.data);

    if (data.message === "authenticated") {
      socket.send(
        JSON.stringify({ "action": "subscribe", "params": "A.AAPL" }),
      );
    }

    if (data.sym) {
      const wsData = data as Aggregate;
      insertToSupabase({
        ticker: wsData.sym,
        open: wsData.o,
        close: wsData.c,
        high: wsData.h,
        low: wsData.l,
        vwap: wsData.vw,
        aggregate_start_time: wsData.s,
        aggregate_end_time: wsData.e,
        aggregate_type: wsData.ev,
      });
    }

    yield* each.next();
  }
});

Deno.serve(() => {
  return new Response("<h1>WebSocket Server Running</h1>", {
    headers: { "content-type": "text/html" },
  });
});
