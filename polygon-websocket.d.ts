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

type PolygonWSMessageData = {
  ev: string;
  status: string;
  message: string;
};
