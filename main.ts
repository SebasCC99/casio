import "@std/dotenv/load";

import { createClient } from "@supabase/supabase-js";
import { generate } from "@babia/uuid-v7";

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
  } catch (error) {
    console.error("Error inserting data:", error);
  }
}

const socket = new WebSocket(Deno.env.get("WEBSOCKET_CLUSTER_URL")!);

socket.onopen = () => {
  socket.send(JSON.stringify({
    action: "auth",
    params: Deno.env.get("POLYGON_API_KEY"),
  }));
};

socket.onmessage = (event) => {
  const [wsMessage] = JSON.parse(event.data);

  console.log(JSON.stringify(wsMessage));

  if (wsMessage.message === "authenticated") {
    socket.send(
      JSON.stringify({ "action": "subscribe", "params": "A.AAPL" }),
    );
  }

  if (wsMessage.sym) {
    const wsData = wsMessage as Aggregate;
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
};

socket.onclose = (event) => {
  console.log(event);
};

socket.onerror = (error) => {
  console.log(error);
  console.error("Error at the socket level:", error);
};

Deno.serve(() => new Response("Hello world"));
