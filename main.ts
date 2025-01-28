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

async function insertToSupabase(aggregate: Aggregate) {
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

  // setInterval(function () {
  //   insertToSupabase({
  //     ticker: "AAPL",
  //     open: 230,
  //     close: 229.96,
  //     high: 230.01,
  //     low: 229.96,
  //     vwap: 229.99,
  //     aggregate_transactions: 121,
  //     aggregate_start_time: 1738066560000,
  //     aggregate_end_time: null,
  //     aggregate_type: "minute",
  //     request_id: "6a7e466379af0a71039d60cc78e72282",
  //   });
  // }, 1000);

  for (const message of yield* each(socket)) {
    const wsMessage = message as WebSocketMessageEvent;
    const [data] = JSON.parse(wsMessage.data) as WebSocketMessageData[];

    console.log(data);

    // if (data.status === "auth_success" && data.message === "authenticated") {
    //   socket.send(
    //     // A for second aggregates - AM for minute aggregates
    //     JSON.stringify({ "action": "subscribe", "params": "A.AAPL" }),
    //   );
    // }
    yield* each.next();
  }
});
