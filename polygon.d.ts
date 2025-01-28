type WebSocketInstance = {
  url: string;
  readyState: number;
  extensions: string;
  protocol: string;
  binaryType: string;
  bufferedAmount: number;
  // deno-lint-ignore no-explicit-any
  onmessage: null | ((event: any) => void);
  // deno-lint-ignore no-explicit-any
  onerror: null | ((event: any) => void);
  // deno-lint-ignore no-explicit-any
  onclose: null | ((event: any) => void);
  // deno-lint-ignore no-explicit-any
  onopen: null | ((event: any) => void);
};

type WebSocketMessageEvent = {
  // Standard event properties
  bubbles: boolean;
  cancelable: boolean;
  composed: boolean;
  currentTarget: WebSocketInstance;
  defaultPrevented: boolean;
  eventPhase: number;
  srcElement: null;
  target: WebSocketInstance;
  returnValue: boolean;
  timeStamp: number;
  type: string;

  // WebSocket specific properties
  data: string; // This contains the JSON message
  origin: string;
  lastEventId: string;
};

type WebSocketMessageData = {
  ev: string;
  status: string;
  message: string;
};

type Schema = {
  ticker: string; // sym
  open: number; // o
  close: number; // c
  high: number; // h
  low: number; // l
  vwap: number | null; // vw
  aggregate_transactions?: number | null; //
  aggregate_start_time: number | null; // s
  aggregate_end_time: number | null; // e
  aggregate_type: string; // ev
  request_id?: string | null; //
};

type Aggregate = {
  sym: string; // sym
  o: number; // o
  c: number; // c
  h: number; // h
  l: number; // l
  vw: number; // vw
  s: number; // s
  e: number; // e
  ev: string; // ev
};
