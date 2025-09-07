# ================== Signals (Supertrend on Heikin Ashi) — 4H, last 3 months ==================

import ccxt, pandas as pd, numpy as np, time
from datetime import datetime, timezone
from flask import Flask, jsonify
from flask_cors import CORS

# ------------------------------- Config ---------------------------------
EXCHANGE_ID   = "binance"
QUOTE         = "USDT"
TIMEFRAME     = "4h"
MONTHS        = 3

SELECTED_COINS = ["BTC","ETH","BNB","XRP","SOL","DOGE","ADA","XLM","SUI","TRX"]

# Supertrend params (TV-parity)
ATR_PERIOD  = 10
MULT        = 2.0
USE_HEIKIN  = True  # Heikin Ashi üzerinde hesapla

# ------------------------------ Flask App -------------------------------
app = Flask(__name__)
CORS(app)

# ------------------------------ Helpers ---------------------------------
def fetch_ohlcv(exchange, symbol, timeframe, months=3, limit=1000):
    """Son X ayın verisini getirir (loop ile)."""
    since_ms = int((pd.Timestamp.utcnow() - pd.DateOffset(months=months)).timestamp() * 1000)
    out = []
    while True:
        batch = exchange.fetch_ohlcv(symbol, timeframe, since=since_ms, limit=limit)
        if not batch:
            break
        out += batch
        since_ms = batch[-1][0] + 1
        time.sleep(0.05)
        if batch[-1][0] > exchange.milliseconds() - 1000:
            break
    df = pd.DataFrame(out, columns=["ts","open","high","low","close","volume"])
    if df.empty:
        return df
    df["ts"] = pd.to_datetime(df["ts"], unit="ms", utc=True).dt.tz_localize(None)
    return df.drop_duplicates(subset=["ts"]).set_index("ts").sort_index()

def to_heikin_ashi(df):
    """OHLCV -> Heikin Ashi OHLCV (aynı index)."""
    ha_close = (df["open"] + df["high"] + df["low"] + df["close"]) / 4.0
    ha_open = ha_close.copy()
    ha_open.iloc[0] = (df["open"].iloc[0] + df["close"].iloc[0]) / 2.0
    for i in range(1, len(df)):
        ha_open.iloc[i] = (ha_open.iloc[i-1] + ha_close.iloc[i-1]) / 2.0
    ha_high = pd.concat([df["high"], ha_open, ha_close], axis=1).max(axis=1)
    ha_low  = pd.concat([df["low"],  ha_open, ha_close], axis=1).min(axis=1)
    return pd.DataFrame(
        {"open":ha_open,"high":ha_high,"low":ha_low,"close":ha_close,"volume":df["volume"]},
        index=df.index
    )

def rma(x, n):  # Wilder RMA
    return x.ewm(alpha=1/n, adjust=False, min_periods=n).mean()

def supertrend_tv(df, atr_period=10, mult=2.0):
    """TradingView uyumlu Supertrend (flip & final band kuralları)."""
    prev_close = df["close"].shift(1)
    tr = pd.concat([
        df["high"] - df["low"],
        (df["high"] - prev_close).abs(),
        (df["low"]  - prev_close).abs()
    ], axis=1).max(axis=1)
    atr = rma(tr, atr_period)

    hl2 = (df["high"] + df["low"]) / 2.0
    basic_ub = hl2 + mult * atr
    basic_lb = hl2 - mult * atr

    final_ub = pd.Series(index=df.index, dtype="float64")
    final_lb = pd.Series(index=df.index, dtype="float64")
    trend    = pd.Series(index=df.index, dtype="float64")
    direc    = pd.Series(index=df.index, dtype="float64")

    start = atr.first_valid_index()
    if start is None:
        return trend, direc, atr

    i0 = df.index.get_loc(start)
    final_ub.iloc[i0] = basic_ub.iloc[i0]
    final_lb.iloc[i0] = basic_lb.iloc[i0]
    trend.iloc[i0]    = final_lb.iloc[i0]
    direc.iloc[i0]    = 1.0

    for i in range(i0+1, len(df)):
        pc = df["close"].iloc[i-1]
        # upper
        if basic_ub.iloc[i] < final_ub.iloc[i-1] or pc > final_ub.iloc[i-1]:
            final_ub.iloc[i] = basic_ub.iloc[i]
        else:
            final_ub.iloc[i] = final_ub.iloc[i-1]
        # lower
        if basic_lb.iloc[i] > final_lb.iloc[i-1] or pc < final_lb.iloc[i-1]:
            final_lb.iloc[i] = basic_lb.iloc[i]
        else:
            final_lb.iloc[i] = final_lb.iloc[i-1]

        c = df["close"].iloc[i]
        if c > final_ub.iloc[i-1]:
            direc.iloc[i] = 1.0
        elif c < final_lb.iloc[i-1]:
            direc.iloc[i] = -1.0
        else:
            direc.iloc[i] = direc.iloc[i-1]

        trend.iloc[i] = final_lb.iloc[i] if direc.iloc[i] == 1 else final_ub.iloc[i]

    return trend, direc, atr

def generate_signals(direction):
    """Yön değişimlerinde sinyal: -1→+1 BUY, +1→-1 SELL."""
    sig = pd.Series(0, index=direction.index, dtype="int8")
    chg = direction.diff()
    sig[chg ==  2] =  1
    sig[chg == -2] = -1
    return sig

def build_symbols_from_selection(exchange, bases, quote="USDT", target_n=10):
    """
    Kullanıcının verdiği base listeden borsada var olan spot/USDT sembolleri oluşturur.
    Örn: ["BTC","ETH"] -> ["BTC/USDT","ETH/USDT"] (varlık kontrolü ile)
    """
    markets = exchange.load_markets()
    all_symbols = set(markets.keys())
    out = []
    for base in bases:
        candidate = f"{base}/{quote}"
        if candidate in all_symbols:
            # Kaldıraçlı tokenları filtrele
            bad = any(bt in candidate for bt in ["UP/", "DOWN/", "BULL/", "BEAR/", "3L/", "3S/", "4L/", "4S/", "5L/", "5S/"])
            if not bad:
                out.append(candidate)
        else:
            print(f"[WARN] Sembol bulunamadı (atlanıyor): {candidate}")
        if len(out) >= target_n:
            break
    if len(out) < target_n:
        print(f"[INFO] {len(out)} sembol bulundu (hedef {target_n}). Mevcutlarla devam ediliyor.")
    return out

# ------------------------------- API Endpoint ----------------------------------
@app.route("/signals", methods=['GET'])
def get_signals():
    results = run_main()
    return jsonify(results)

def run_main():
    ex = getattr(ccxt, EXCHANGE_ID)({'enableRateLimit': True})
    symbols = build_symbols_from_selection(ex, SELECTED_COINS, quote=QUOTE, target_n=10)
    if not symbols:
        return {"error": "Hiç geçerli sembol bulunamadı. Lütfen SELECTED_COINS listesini kontrol et."}
    
    rows = []
    for sym in symbols:
        try:
            df = fetch_ohlcv(ex, sym, TIMEFRAME, months=MONTHS)
            if df.empty or len(df) < ATR_PERIOD + 5:
                rows.append({"SYMBOL": sym.split("/")[0], "SIGNAL": np.nan, "TIMESTAMP": None})
                continue

            src = to_heikin_ashi(df) if USE_HEIKIN else df
            trend, direction, atr = supertrend_tv(src, ATR_PERIOD, MULT)
            signals = generate_signals(direction)

            last_ts  = src.index[-1]
            last_sig = signals.iloc[-1]

            if last_sig == 1:
                sig_txt = "Buy"
            elif last_sig == -1:
                sig_txt = "Sell"
            else:
                sig_txt = np.nan

            ts_iso = pd.to_datetime(last_ts, utc=True).isoformat().replace("+00:00", "Z")
            rows.append({"SYMBOL": sym.split("/")[0], "SIGNAL": sig_txt, "TIMESTAMP": ts_iso})
        except Exception as e:
            rows.append({"SYMBOL": sym.split("/")[0], "SIGNAL": np.nan, "TIMESTAMP": None})
            print(f"[WARN] {sym}: {e}")

    return rows

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)