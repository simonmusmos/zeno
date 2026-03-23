import { TIINGO_TOKEN } from '../config';

const WS_URL = 'wss://api.tiingo.com/fx';

/**
 * Tiingo forex ticker map.
 * For each currency, defines the Tiingo pair ticker and whether USD is the base
 * (which means the price = foreign units per 1 USD → we invert to get USD rate).
 */
const TICKER_MAP: Record<string, { ticker: string; usdIsBase: boolean }> = {
  EUR: { ticker: 'eurusd',  usdIsBase: false },
  GBP: { ticker: 'gbpusd',  usdIsBase: false },
  AUD: { ticker: 'audusd',  usdIsBase: false },
  NZD: { ticker: 'nzdusd',  usdIsBase: false },
  JPY: { ticker: 'usdjpy',  usdIsBase: true  },
  CHF: { ticker: 'usdchf',  usdIsBase: true  },
  CAD: { ticker: 'usdcad',  usdIsBase: true  },
  PHP: { ticker: 'usdphp',  usdIsBase: true  },
  SGD: { ticker: 'usdsgd',  usdIsBase: true  },
  HKD: { ticker: 'usdhkd',  usdIsBase: true  },
  MYR: { ticker: 'usdmyr',  usdIsBase: true  },
  INR: { ticker: 'usdinr',  usdIsBase: true  },
  CNY: { ticker: 'usdcny',  usdIsBase: true  },
  KRW: { ticker: 'usdkrw',  usdIsBase: true  },
  THB: { ticker: 'usdthb',  usdIsBase: true  },
  IDR: { ticker: 'usdidr',  usdIsBase: true  },
  TWD: { ticker: 'usdtwd',  usdIsBase: true  },
  AED: { ticker: 'usdaed',  usdIsBase: true  },
  SAR: { ticker: 'usdsar',  usdIsBase: true  },
  QAR: { ticker: 'usdqar',  usdIsBase: true  },
  KWD: { ticker: 'usdkwd',  usdIsBase: true  },
  BRL: { ticker: 'usdbrl',  usdIsBase: true  },
  MXN: { ticker: 'usdmxn',  usdIsBase: true  },
  ZAR: { ticker: 'usdzar',  usdIsBase: true  },
  NGN: { ticker: 'usdngn',  usdIsBase: true  },
  GHS: { ticker: 'usdghs',  usdIsBase: true  },
  EGP: { ticker: 'usdegp',  usdIsBase: true  },
  TRY: { ticker: 'usdtry',  usdIsBase: true  },
  PLN: { ticker: 'usdpln',  usdIsBase: true  },
  HUF: { ticker: 'usdhuf',  usdIsBase: true  },
  CZK: { ticker: 'usdczk',  usdIsBase: true  },
  SEK: { ticker: 'usdsek',  usdIsBase: true  },
  NOK: { ticker: 'usdnok',  usdIsBase: true  },
  DKK: { ticker: 'usddkk',  usdIsBase: true  },
  VND: { ticker: 'usdvnd',  usdIsBase: true  },
  PKR: { ticker: 'usdpkr',  usdIsBase: true  },
  BDT: { ticker: 'usdbdt',  usdIsBase: true  },
};

// Reverse map: tiingo ticker → { currency, usdIsBase }
const TICKER_LOOKUP: Record<string, { currency: string; usdIsBase: boolean }> = {};
for (const [currency, info] of Object.entries(TICKER_MAP)) {
  TICKER_LOOKUP[info.ticker] = { currency, usdIsBase: info.usdIsBase };
}

/** Returns the Tiingo tickers needed to track a set of currency codes */
export function tickersForCurrencies(currencies: string[]): string[] {
  return currencies
    .filter(c => c !== 'USD' && TICKER_MAP[c])
    .map(c => TICKER_MAP[c].ticker);
}

/** Parse a Tiingo /fx/top REST response into a RateUpdate map */
export function parseTopResponse(data: unknown[]): RateUpdate {
  const updates: RateUpdate = {};
  for (const item of data) {
    const d = item as Record<string, unknown>;
    const ticker   = (d.ticker as string)?.toLowerCase();
    const midPrice = d.midPrice as number;
    if (!ticker || !midPrice) continue;
    const info = TICKER_LOOKUP[ticker];
    if (!info) continue;
    updates[info.currency] = info.usdIsBase ? 1 / midPrice : midPrice;
  }
  return updates;
}

export type RateUpdate = Record<string, number>; // currency code → USD rate

export interface TiingoConnection {
  disconnect: () => void;
}

/**
 * Opens a Tiingo FX WebSocket and streams rate updates.
 * @param currencies  ISO currency codes to track (e.g. ['PHP', 'EUR'])
 * @param onUpdate    Called with partial rate updates as they arrive
 * @param onStatus    Called with 'connected' | 'disconnected' | 'error'
 */
export function connectTiingo(
  currencies: string[],
  onUpdate: (rates: RateUpdate) => void,
  onStatus: (status: 'connected' | 'disconnected' | 'error') => void,
): TiingoConnection {
  if (!TIINGO_TOKEN || TIINGO_TOKEN === 'YOUR_TIINGO_TOKEN_HERE') {
    console.warn('[Tiingo] No API token configured — skipping WebSocket.');
    onStatus('error');
    return { disconnect: () => {} };
  }

  const tickers = tickersForCurrencies(currencies);
  if (tickers.length === 0) {
    return { disconnect: () => {} };
  }

  let ws: WebSocket | null = null;
  let destroyed = false;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let reconnectDelay = 2000;

  function connect() {
    if (destroyed) return;
    console.log('[Tiingo] Connecting… tickers:', tickers);
    ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      reconnectDelay = 2000;
      console.log('[Tiingo] Connected. Subscribing to:', tickers);
      ws!.send(JSON.stringify({
        eventName: 'subscribe',
        authorization: TIINGO_TOKEN,
        eventData: { thresholdLevel: 5, tickers },
      }));
      onStatus('connected');
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data as string);
        console.log('[Tiingo] Message:', JSON.stringify(msg).slice(0, 200));

        if (msg.messageType !== 'A') return;

        const data: unknown[] = Array.isArray(msg.data) ? msg.data : [];
        if (!data.length) return;

        const updates: RateUpdate = {};
        const rows: unknown[][] = Array.isArray(data[0]) ? (data as unknown[][]) : [data as unknown[]];
        for (const row of rows) {
          const ticker   = (row[1] as string)?.toLowerCase();
          const midPrice = row[7] as number;
          if (!ticker || !midPrice) continue;

          const info = TICKER_LOOKUP[ticker];
          if (!info) continue;

          updates[info.currency] = info.usdIsBase ? 1 / midPrice : midPrice;
        }

        if (Object.keys(updates).length > 0) {
          console.log('[Tiingo] Rate updates:', updates);
          onUpdate(updates);
        }
      } catch (e) {
        console.warn('[Tiingo] Parse error:', e);
      }
    };

    ws.onerror = (e) => {
      console.warn('[Tiingo] Error:', e);
      onStatus('error');
    };

    ws.onclose = (e) => {
      console.log('[Tiingo] Closed. Code:', e.code, 'Reason:', e.reason);
      if (destroyed) return;
      onStatus('disconnected');
      reconnectTimer = setTimeout(() => {
        reconnectDelay = Math.min(reconnectDelay * 1.5, 30_000);
        connect();
      }, reconnectDelay);
    };
  }

  connect();

  return {
    disconnect() {
      destroyed = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      ws?.close();
    },
  };
}
