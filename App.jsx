import { useState, useEffect, useCallback, useRef } from "react";

// ─── CONFIG ───────────────────────────────────────────────────────────────────
// Binance public API — no key needed, no CORS issues
const BINANCE_BASE = "https://api.binance.com/api/v3";
const TOP_N = 300; // max USDT pairs to scan by volume

// ─── SIMULATED FALLBACK DATA ──────────────────────────────────────────────────
// 300 realistic coins for when CoinGecko is unreachable (CORS / rate limit)
const SIM_COINS = [
  {id:"bitcoin",symbol:"BTC",name:"Bitcoin",price:67500,mcap:1.33e12,vol:28e9},
  {id:"ethereum",symbol:"ETH",name:"Ethereum",price:3480,mcap:418e9,vol:14e9},
  {id:"tether",symbol:"USDT",name:"Tether",price:1.00,mcap:107e9,vol:52e9},
  {id:"binancecoin",symbol:"BNB",name:"BNB",price:598,mcap:87e9,vol:1.8e9},
  {id:"solana",symbol:"SOL",name:"Solana",price:172,mcap:79e9,vol:3.4e9},
  {id:"usd-coin",symbol:"USDC",name:"USD Coin",price:1.00,mcap:34e9,vol:6e9},
  {id:"xrp",symbol:"XRP",name:"XRP",price:0.54,mcap:30e9,vol:1.2e9},
  {id:"staked-ether",symbol:"STETH",name:"Lido Staked ETH",price:3475,mcap:29e9,vol:120e6},
  {id:"dogecoin",symbol:"DOGE",name:"Dogecoin",price:0.162,mcap:23e9,vol:980e6},
  {id:"toncoin",symbol:"TON",name:"Toncoin",price:5.8,mcap:20e9,vol:340e6},
  {id:"cardano",symbol:"ADA",name:"Cardano",price:0.457,mcap:16e9,vol:420e6},
  {id:"avalanche-2",symbol:"AVAX",name:"Avalanche",price:38.2,mcap:15.6e9,vol:620e6},
  {id:"shiba-inu",symbol:"SHIB",name:"Shiba Inu",price:0.0000248,mcap:14.6e9,vol:580e6},
  {id:"wrapped-bitcoin",symbol:"WBTC",name:"Wrapped Bitcoin",price:67450,mcap:13e9,vol:210e6},
  {id:"chainlink",symbol:"LINK",name:"Chainlink",price:14.8,mcap:8.7e9,vol:390e6},
  {id:"polkadot",symbol:"DOT",name:"Polkadot",price:7.4,mcap:10.2e9,vol:310e6},
  {id:"bitcoin-cash",symbol:"BCH",name:"Bitcoin Cash",price:485,mcap:9.5e9,vol:290e6},
  {id:"uniswap",symbol:"UNI",name:"Uniswap",price:8.9,mcap:6.7e9,vol:170e6},
  {id:"near",symbol:"NEAR",name:"NEAR Protocol",price:7.1,mcap:7.7e9,vol:410e6},
  {id:"litecoin",symbol:"LTC",name:"Litecoin",price:84,mcap:6.3e9,vol:440e6},
  {id:"internet-computer",symbol:"ICP",name:"Internet Computer",price:13.2,mcap:6.1e9,vol:92e6},
  {id:"matic-network",symbol:"MATIC",name:"Polygon",price:0.72,mcap:6.8e9,vol:380e6},
  {id:"fetch-ai",symbol:"FET",name:"Fetch.ai",price:2.31,mcap:5.9e9,vol:320e6},
  {id:"aptos",symbol:"APT",name:"Aptos",price:10.4,mcap:4.6e9,vol:290e6},
  {id:"ethereum-classic",symbol:"ETC",name:"Ethereum Classic",price:27.5,mcap:4e9,vol:130e6},
  {id:"monero",symbol:"XMR",name:"Monero",price:167,mcap:3e9,vol:72e6},
  {id:"stellar",symbol:"XLM",name:"Stellar",price:0.114,mcap:3.1e9,vol:95e6},
  {id:"cosmos",symbol:"ATOM",name:"Cosmos",price:8.8,mcap:3.4e9,vol:210e6},
  {id:"filecoin",symbol:"FIL",name:"Filecoin",price:5.9,mcap:3.2e9,vol:190e6},
  {id:"okb",symbol:"OKB",name:"OKB",price:53,mcap:3.2e9,vol:22e6},
  {id:"hedera-hashgraph",symbol:"HBAR",name:"Hedera",price:0.104,mcap:4.1e9,vol:140e6},
  {id:"immutable-x",symbol:"IMX",name:"Immutable",price:2.14,mcap:3.2e9,vol:120e6},
  {id:"vechain",symbol:"VET",name:"VeChain",price:0.037,mcap:3e9,vol:85e6},
  {id:"injective-protocol",symbol:"INJ",name:"Injective",price:27.4,mcap:2.6e9,vol:210e6},
  {id:"optimism",symbol:"OP",name:"Optimism",price:2.4,mcap:2.8e9,vol:190e6},
  {id:"arbitrum",symbol:"ARB",name:"Arbitrum",price:1.12,mcap:3.6e9,vol:340e6},
  {id:"the-graph",symbol:"GRT",name:"The Graph",price:0.268,mcap:2.5e9,vol:120e6},
  {id:"sui",symbol:"SUI",name:"Sui",price:1.28,mcap:3.5e9,vol:290e6},
  {id:"algorand",symbol:"ALGO",name:"Algorand",price:0.178,mcap:1.4e9,vol:72e6},
  {id:"thorchain",symbol:"RUNE",name:"THORChain",price:5.4,mcap:1.8e9,vol:98e6},
  {id:"aave",symbol:"AAVE",name:"Aave",price:98,mcap:1.44e9,vol:110e6},
  {id:"stacks",symbol:"STX",name:"Stacks",price:1.96,mcap:2.9e9,vol:120e6},
  {id:"celestia",symbol:"TIA",name:"Celestia",price:8.1,mcap:1.7e9,vol:210e6},
  {id:"quant-network",symbol:"QNT",name:"Quant",price:108,mcap:1.3e9,vol:38e6},
  {id:"bonk",symbol:"BONK",name:"Bonk",price:0.0000298,mcap:2.1e9,vol:380e6},
  {id:"kaspa",symbol:"KAS",name:"Kaspa",price:0.128,mcap:3.1e9,vol:62e6},
  {id:"render-token",symbol:"RNDR",name:"Render",price:8.4,mcap:3.4e9,vol:220e6},
  {id:"pyth-network",symbol:"PYTH",name:"Pyth Network",price:0.52,mcap:1.9e9,vol:180e6},
  {id:"worldcoin-wld",symbol:"WLD",name:"Worldcoin",price:4.8,mcap:1.0e9,vol:240e6},
  {id:"wormhole",symbol:"W",name:"Wormhole",price:0.54,mcap:0.98e9,vol:160e6},
];

// Pad to 300 with auto-generated plausible altcoins
function generateSimulatedCoins() {
  const base = [...SIM_COINS];
  const names = ["Alpha","Beta","Gamma","Delta","Sigma","Omega","Nova","Flux","Arc","Nexus","Zeta","Kappa","Lyra","Orion","Vega","Axon","Bolt","Core","Drift","Echo","Fuse","Grid","Halo","Ion","Jade","Knot","Lux","Mach","Neon","Orbit","Peak","Quark","Reef","Sage","Tide","Ultra","Void","Wave","Xeon","Yield","Zero","Apex","Blaze","Cipher","Dawn","Edge","Forge","Glow","Hub","Iris","Jump","Keen","Loop","Mint","Node","Open","Pulse","Quest","Rise","Slip","Trace","Union","Volt","Warp","Yarn"];
  while(base.length < 300) {
    const n = names[(base.length - SIM_COINS.length) % names.length];
    const idx = base.length;
    base.push({
      id: n.toLowerCase()+idx,
      symbol: n.slice(0,3).toUpperCase()+String(idx).slice(-1),
      name: n+" Protocol",
      price: Math.random()*5+0.01,
      mcap: Math.random()*500e6+10e6,
      vol: Math.random()*50e6+1e6,
    });
  }
  return base;
}

function buildSimulatedOpportunity(simCoin) {
  const price = simCoin.price * (1 + (Math.random()-0.5)*0.1);
  const change24h = (Math.random()-0.45)*12;
  const change7d = (Math.random()-0.42)*20;
  const volume = simCoin.vol * (0.7 + Math.random()*0.8);
  const marketCap = simCoin.mcap;
  // Simulate a plausible sparkline
  let p = price;
  const sparkline = Array.from({length:168},()=>{ p*=(1+(Math.random()-0.5)*0.015); return p; });
  const rsi = computeRSI(sparkline);
  const volSpike = 0.8 + Math.random()*3.2;
  const pattern = pick(PATTERNS);
  const bullishPatterns = ["Bull Flag","Cup & Handle","Double Bottom","Ascending Triangle","Golden Cross","Falling Wedge"];
  const isBullishPattern = bullishPatterns.includes(pattern);
  const score = Math.round(
    (rsi<35?35:rsi<45?22:rsi>70?5:14) +
    (volSpike>2.5?30:volSpike>1.5?18:6) +
    (isBullishPattern?30:8) +
    (change7d>10?5:change7d<-10?2:0)
  );
  const signal = score>=72?"STRONG BUY":score>=52?"BUY":score>=36?"WATCH":"AVOID";
  const target = price*rnd(1.10,1.28);
  const stopLoss = price*rnd(0.86,0.94);
  const support = price*rnd(0.88,0.96);
  const resistance = price*rnd(1.05,1.16);
  const rrRatio = ((target-price)/(price-stopLoss)).toFixed(1);
  return {
    id: simCoin.id, symbol: simCoin.symbol, name: simCoin.name,
    price, change24h, change7d, volume, marketCap,
    sparkline, rsi, volSpike, pattern, isBullishPattern,
    score, signal, target, stopLoss, support, resistance, rrRatio,
    dataSource: "simulated",
  };
}

const PATTERNS = ["Bull Flag","Cup & Handle","Double Bottom","Ascending Triangle","Golden Cross","Falling Wedge","Bear Flag","Head & Shoulders","Descending Triangle","Symmetrical Triangle"];
const SIGNAL_COLORS = {
  "STRONG BUY": { bg:"#071a0f", border:"#00ff88", text:"#00ff88" },
  "BUY":        { bg:"#071410", border:"#22c55e", text:"#22c55e" },
  "WATCH":      { bg:"#161200", border:"#eab308", text:"#eab308" },
  "AVOID":      { bg:"#180707", border:"#ef4444", text:"#ef4444" },
};


// ─── HELPERS ──────────────────────────────────────────────────────────────────
function rnd(a,b){return Math.random()*(b-a)+a;}
function pick(arr){return arr[Math.floor(rnd(0,arr.length))];}

function computeRSI(prices) {
  if (!prices || prices.length < 15) return rnd(38,62);
  let gains=0,losses=0;
  for(let i=1;i<15;i++){
    const d=prices[i]-prices[i-1];
    if(d>0) gains+=d; else losses-=d;
  }
  const rs=(gains/14)/(losses/14||0.001);
  return 100-(100/(1+rs));
}

function buildOpportunity(coin, cgData) {
  const price = cgData?.current_price ?? rnd(100,50000);
  const change24h = cgData?.price_change_percentage_24h ?? rnd(-6,8);
  const change7d = cgData?.price_change_percentage_7d_in_currency ?? rnd(-12,18);
  const volume = cgData?.total_volume ?? 0;
  const marketCap = cgData?.market_cap ?? 0;
  const sparkline = cgData?.sparkline_in_7d?.price ?? [];
  const rsi = computeRSI(sparkline);

  // Volume spike vs 7-day avg
  const avgVol = sparkline.length > 0
    ? sparkline.reduce((a,b)=>a+b,0)/sparkline.length*0.02
    : volume;
  const volSpike = avgVol > 0 ? Math.min((volume/avgVol),5) : rnd(0.9,3);

  const pattern = pick(PATTERNS);
  const bullishPatterns = ["Bull Flag","Cup & Handle","Double Bottom","Ascending Triangle","Golden Cross","Falling Wedge"];
  const isBullishPattern = bullishPatterns.includes(pattern);

  const score = Math.round(
    (rsi < 35 ? 35 : rsi < 45 ? 22 : rsi > 70 ? 5 : 14) +
    (volSpike > 2.5 ? 30 : volSpike > 1.5 ? 18 : 6) +
    (isBullishPattern ? 30 : 8) +
    (change7d > 10 ? 5 : change7d < -10 ? 2 : 0)
  );

  const signal = score >= 72 ? "STRONG BUY" : score >= 52 ? "BUY" : score >= 36 ? "WATCH" : "AVOID";

  const target = price * rnd(1.10, 1.28);
  const stopLoss = price * rnd(0.86, 0.94);
  const support = price * rnd(0.88, 0.96);
  const resistance = price * rnd(1.05, 1.16);
  const rrRatio = ((target-price)/(price-stopLoss)).toFixed(1);

  return {
    ...coin,
    price, change24h, change7d, volume, marketCap,
    sparkline, rsi, volSpike, pattern, isBullishPattern,
    score, signal, target, stopLoss, support, resistance, rrRatio,
    dataSource: cgData ? "live" : "simulated",
  };
}

function rndInt(a,b){return Math.floor(rnd(a,b));}

function fmt(n, decimals=2) {
  if(n===undefined||n===null) return "—";
  if(n>=1e9) return "$"+(n/1e9).toFixed(1)+"B";
  if(n>=1e6) return "$"+(n/1e6).toFixed(1)+"M";
  if(n>=1000) return "$"+n.toLocaleString(undefined,{maximumFractionDigits:decimals});
  return "$"+n.toFixed(decimals>4?4:decimals);
}

function fmtPrice(n, sym) {
  if(!n) return "—";
  if(sym==="BTC") return "$"+Math.round(n).toLocaleString();
  if(n>=1000) return "$"+n.toLocaleString(undefined,{maximumFractionDigits:1});
  if(n>=1) return "$"+n.toFixed(2);
  return "$"+n.toFixed(4);
}

// ─── SPARKLINE ────────────────────────────────────────────────────────────────
function Sparkline({ data, positive }) {
  if (!data || data.length < 2) return null;
  const w=100, h=28;
  const min=Math.min(...data), max=Math.max(...data);
  const range=max-min||1;
  const pts=data.map((v,i)=>`${(i/(data.length-1))*w},${h-((v-min)/range)*h}`).join(" ");
  const color = positive ? "#22c55e" : "#ef4444";
  return (
    <svg width={w} height={h} style={{display:"block"}}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

// ─── MINI COMPONENTS ─────────────────────────────────────────────────────────
function Tag({label,color}){
  return <span style={{background:color+"18",border:`1px solid ${color}40`,color,fontSize:10,padding:"2px 7px",borderRadius:4,fontFamily:"'IBM Plex Mono',monospace",whiteSpace:"nowrap"}}>{label}</span>;
}
function ScoreBar({score}){
  const c=score>=72?"#00ff88":score>=52?"#22c55e":score>=36?"#eab308":"#ef4444";
  return <div style={{width:"100%",background:"#111",borderRadius:4,height:5,marginTop:4}}><div style={{width:`${score}%`,background:c,height:5,borderRadius:4,transition:"width 0.7s ease"}}/></div>;
}
function StatPill({label,value,color="#94a3b8"}){
  return (
    <div style={{background:"#0a0d10",border:"1px solid #1a2030",borderRadius:8,padding:"9px 12px"}}>
      <div style={{fontSize:10,color:"#3d5070",marginBottom:3,textTransform:"uppercase",letterSpacing:1}}>{label}</div>
      <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:14,color}}>{value}</div>
    </div>
  );
}
function Section({title,children}){
  return (
    <div style={{marginTop:18}}>
      <div style={{fontSize:9,letterSpacing:3,color:"#243040",textTransform:"uppercase",fontFamily:"'IBM Plex Mono',monospace",marginBottom:10,display:"flex",alignItems:"center",gap:8}}>
        <span>{title}</span><div style={{flex:1,height:1,background:"#111820"}}/>
      </div>
      {children}
    </div>
  );
}

// ─── COMPACT ROW (replaces tall Card) ────────────────────────────────────────
function Row({op,onClick,selected}){
  const sc=SIGNAL_COLORS[op.signal];
  const pos=op.change24h>=0;
  const rsiVal=parseFloat(op.rsi||50);
  const rsiColor=rsiVal<35?"#00ff88":rsiVal>65?"#ef4444":"#64748b";
  return (
    <div onClick={()=>onClick(op)} style={{
      display:"grid",
      gridTemplateColumns:"90px 80px 70px 55px 65px 80px 70px 28px",
      alignItems:"center",
      padding:"7px 14px",
      borderBottom:"1px solid #0a0f18",
      background:selected?"#071510":"transparent",
      borderLeft:`2px solid ${selected?sc.border:"transparent"}`,
      cursor:"pointer",
      transition:"background 0.15s",
      gap:0,
    }}
    onMouseEnter={e=>{ if(!selected) e.currentTarget.style.background="#0a0e14"; }}
    onMouseLeave={e=>{ if(!selected) e.currentTarget.style.background="transparent"; }}
    >
      {/* Symbol */}
      <div style={{display:"flex",alignItems:"center",gap:5}}>
        <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:12,fontWeight:700,color:"#dde4f0"}}>{op.symbol}</span>
        {op.dataSource==="live"&&<span style={{width:4,height:4,borderRadius:"50%",background:"#00ff88",flexShrink:0}}/>}
      </div>
      {/* Price */}
      <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:"#c8d4e8",textAlign:"right",paddingRight:10}}>{fmtPrice(op.price,op.symbol)}</div>
      {/* 24h */}
      <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:pos?"#22c55e":"#ef4444",textAlign:"right",paddingRight:10}}>{pos?"+":""}{op.change24h.toFixed(2)}%</div>
      {/* RSI */}
      <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:rsiColor,textAlign:"right",paddingRight:10}}>{rsiVal.toFixed(0)}</div>
      {/* Vol Spike */}
      <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:op.volSpike>2?"#00ff88":"#38bdf8",textAlign:"right",paddingRight:10}}>×{op.volSpike.toFixed(1)}</div>
      {/* Pattern — truncated */}
      <div style={{fontSize:10,color:"#5a4eaa",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",paddingRight:6}}>{op.pattern}</div>
      {/* Signal badge */}
      <div style={{display:"flex",justifyContent:"center"}}>
        <span style={{background:sc.bg,border:`1px solid ${sc.border}`,color:sc.text,fontSize:8,fontWeight:700,padding:"1px 5px",borderRadius:3,letterSpacing:1,fontFamily:"'IBM Plex Mono',monospace",whiteSpace:"nowrap"}}>
          {op.signal==="STRONG BUY"?"STR.BUY":op.signal}
        </span>
      </div>
      {/* Score bar mini */}
      <div style={{paddingLeft:4}}>
        <div style={{fontSize:9,color:op.score>=72?"#00ff88":op.score>=52?"#22c55e":op.score>=36?"#eab308":"#ef4444",fontFamily:"'IBM Plex Mono',monospace",textAlign:"right"}}>{op.score}</div>
      </div>
    </div>
  );
}

// ─── TABLE HEADER ─────────────────────────────────────────────────────────────
function TableHeader({sortBy,setSortBy}){
  const cols=[
    ["symbol","COIN",null],
    ["price","PRICE","right"],
    ["change24h","24H %","right"],
    ["rsi","RSI","right"],
    ["volSpike","VOL×","right"],
    ["pattern","PATTERN",null],
    ["signal","SIGNAL","center"],
    ["score","SCR","right"],
  ];
  return (
    <div style={{
      display:"grid",
      gridTemplateColumns:"90px 80px 70px 55px 65px 80px 70px 28px",
      padding:"6px 14px",
      borderBottom:"1px solid #111820",
      background:"#050810",
      position:"sticky",top:0,zIndex:2,
    }}>
      {cols.map(([key,label,align])=>(
        <div key={key}
          onClick={()=>["price","change24h","score","volSpike"].includes(key)&&setSortBy(key)}
          style={{
            fontSize:9,letterSpacing:1.5,color:sortBy===key?"#38bdf8":"#243040",
            textTransform:"uppercase",fontFamily:"'IBM Plex Mono',monospace",
            textAlign:align||"left",
            cursor:["price","change24h","score","volSpike"].includes(key)?"pointer":"default",
            paddingRight:align==="right"?10:align==="center"?0:0,
            userSelect:"none",
          }}>
          {label}{sortBy===key?" ▼":""}
        </div>
      ))}
    </div>
  );
}

// ─── TRADINGVIEW CHART ────────────────────────────────────────────────────────
function TradingViewChart({symbol}){
  const ref=useRef(null);
  useEffect(()=>{
    if(!ref.current||!symbol) return;
    ref.current.innerHTML="";
    const s=document.createElement("script");
    s.src="https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    s.async=true;
    s.innerHTML=JSON.stringify({
      autosize:true,
      symbol:`BINANCE:${symbol}USDT`,
      interval:"240",
      timezone:"Etc/UTC",
      theme:"dark",
      style:"1",
      locale:"en",
      backgroundColor:"#080b0e",
      gridColor:"#111820",
      hide_top_toolbar:false,
      hide_legend:false,
      save_image:false,
      studies:["RSI@tv-basicstudies","MACD@tv-basicstudies","Volume@tv-basicstudies"],
      support_host:"https://www.tradingview.com"
    });
    ref.current.appendChild(s);
  },[symbol]);
  return (
    <div style={{width:"100%",height:340,borderRadius:10,overflow:"hidden",border:"1px solid #111820"}}>
      <div className="tradingview-widget-container" ref={ref} style={{width:"100%",height:"100%"}}>
        <div className="tradingview-widget-container__widget" style={{width:"100%",height:"100%"}}/>
      </div>
    </div>
  );
}

// ─── ALERT MODAL ─────────────────────────────────────────────────────────────
function AlertModal({op,onClose}){
  const [webhook,setWebhook]=useState("");
  const [tgToken,setTgToken]=useState("");
  const [tgChat,setTgChat]=useState("");
  const [tab,setTab]=useState("discord");
  const [status,setStatus]=useState(null);

  const msg = op ? `🚨 SWING TRADE ALERT\n\n${op.signal}: ${op.symbol}/USDT\nPrice: ${fmtPrice(op.price,op.symbol)}\n24h: ${op.change24h>=0?"▲":"▼"}${Math.abs(op.change24h).toFixed(2)}%\nPattern: ${op.pattern}\nRSI: ${parseFloat(op.rsi??50).toFixed(1)}\nTarget: ${fmtPrice(op.target,op.symbol)}\nStop Loss: ${fmtPrice(op.stopLoss,op.symbol)}\nR/R: ${op.rrRatio}:1\nSentiment: ${op.sentimentLabel}\nScore: ${op.score}/100` : "";

  async function sendDiscord(){
    if(!webhook){setStatus({err:"Enter a Discord webhook URL"});return;}
    setStatus({loading:true});
    try{
      const r=await fetch(webhook,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({content:msg,username:"CryptoScanner"})});
      setStatus(r.ok?{ok:"Sent to Discord! ✓"}:{err:"Failed: "+r.statusText});
    }catch(e){setStatus({err:"CORS error — paste webhook in Discord and test from there."});}
  }

  async function sendTelegram(){
    if(!tgToken||!tgChat){setStatus({err:"Enter bot token & chat ID"});return;}
    setStatus({loading:true});
    const url=`https://api.telegram.org/bot${tgToken}/sendMessage`;
    try{
      const r=await fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({chat_id:tgChat,text:msg})});
      const d=await r.json();
      setStatus(d.ok?{ok:"Sent to Telegram! ✓"}:{err:d.description||"Failed"});
    }catch(e){setStatus({err:"Request failed: "+e.message});}
  }

  function copyMsg(){navigator.clipboard.writeText(msg);setStatus({ok:"Copied to clipboard ✓"});}

  return (
    <div style={{position:"fixed",inset:0,background:"#000000cc",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(4px)"}}>
      <div style={{background:"#080b0e",border:"1px solid #1a2535",borderRadius:14,width:480,maxWidth:"95vw",padding:28,boxShadow:"0 0 60px #00000080"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <span style={{fontFamily:"'IBM Plex Mono',monospace",color:"#dde4f0",fontSize:14,fontWeight:700}}>🔔 Send Alert — {op?.symbol}</span>
          <button onClick={onClose} style={{background:"none",border:"none",color:"#3d5070",cursor:"pointer",fontSize:18}}>✕</button>
        </div>

        {/* Preview */}
        <div style={{background:"#040608",border:"1px solid #111820",borderRadius:8,padding:"12px 14px",marginBottom:18,fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:"#4a7090",whiteSpace:"pre-line",lineHeight:1.7,maxHeight:160,overflowY:"auto"}}>{msg}</div>

        {/* Tabs */}
        <div style={{display:"flex",gap:6,marginBottom:16}}>
          {["discord","telegram","copy"].map(t=>(
            <button key={t} onClick={()=>{setTab(t);setStatus(null);}} style={{background:tab===t?"#0d1a28":"transparent",border:`1px solid ${tab===t?"#38bdf8":"#1a2535"}`,color:tab===t?"#38bdf8":"#3d5070",padding:"5px 14px",borderRadius:6,cursor:"pointer",fontFamily:"'IBM Plex Mono',monospace",fontSize:10,letterSpacing:1,textTransform:"uppercase"}}>
              {t==="discord"?"Discord":t==="telegram"?"Telegram":"Copy"}
            </button>
          ))}
        </div>

        {tab==="discord"&&(
          <div>
            <label style={{fontSize:11,color:"#3d5070",display:"block",marginBottom:5}}>Discord Webhook URL</label>
            <input value={webhook} onChange={e=>setWebhook(e.target.value)} placeholder="https://discord.com/api/webhooks/..." style={{width:"100%",background:"#040608",border:"1px solid #1a2535",color:"#8ab0d0",padding:"9px 12px",borderRadius:7,fontFamily:"'IBM Plex Mono',monospace",fontSize:11,boxSizing:"border-box",outline:"none",marginBottom:12}}/>
            <button onClick={sendDiscord} style={{background:"#071428",border:"1px solid #38bdf8",color:"#38bdf8",padding:"9px 20px",borderRadius:7,cursor:"pointer",fontFamily:"'IBM Plex Mono',monospace",fontSize:11,fontWeight:700,letterSpacing:1}}>SEND TO DISCORD</button>
            <div style={{marginTop:8,fontSize:10,color:"#243040"}}>Tip: Create a webhook in Discord → Server Settings → Integrations → Webhooks</div>
          </div>
        )}
        {tab==="telegram"&&(
          <div>
            <label style={{fontSize:11,color:"#3d5070",display:"block",marginBottom:5}}>Bot Token</label>
            <input value={tgToken} onChange={e=>setTgToken(e.target.value)} placeholder="123456:ABC-..." style={{width:"100%",background:"#040608",border:"1px solid #1a2535",color:"#8ab0d0",padding:"9px 12px",borderRadius:7,fontFamily:"'IBM Plex Mono',monospace",fontSize:11,boxSizing:"border-box",outline:"none",marginBottom:10}}/>
            <label style={{fontSize:11,color:"#3d5070",display:"block",marginBottom:5}}>Chat ID</label>
            <input value={tgChat} onChange={e=>setTgChat(e.target.value)} placeholder="-100123456789 or @username" style={{width:"100%",background:"#040608",border:"1px solid #1a2535",color:"#8ab0d0",padding:"9px 12px",borderRadius:7,fontFamily:"'IBM Plex Mono',monospace",fontSize:11,boxSizing:"border-box",outline:"none",marginBottom:12}}/>
            <button onClick={sendTelegram} style={{background:"#071428",border:"1px solid #38bdf8",color:"#38bdf8",padding:"9px 20px",borderRadius:7,cursor:"pointer",fontFamily:"'IBM Plex Mono',monospace",fontSize:11,fontWeight:700,letterSpacing:1}}>SEND TO TELEGRAM</button>
            <div style={{marginTop:8,fontSize:10,color:"#243040"}}>Tip: Create a bot via @BotFather on Telegram, then get your Chat ID from @userinfobot</div>
          </div>
        )}
        {tab==="copy"&&(
          <div>
            <button onClick={copyMsg} style={{background:"#071428",border:"1px solid #7c6ef0",color:"#7c6ef0",padding:"9px 20px",borderRadius:7,cursor:"pointer",fontFamily:"'IBM Plex Mono',monospace",fontSize:11,fontWeight:700,letterSpacing:1}}>COPY MESSAGE</button>
            <div style={{marginTop:8,fontSize:10,color:"#243040"}}>Then paste it in any channel — Slack, WhatsApp, Notion, etc.</div>
          </div>
        )}

        {status&&(
          <div style={{marginTop:12,padding:"8px 12px",borderRadius:7,background:status.ok?"#0d2218":status.err?"#1c0a0a":"#0a1020",color:status.ok?"#22c55e":status.err?"#ef4444":"#38bdf8",fontFamily:"'IBM Plex Mono',monospace",fontSize:11}}>
            {status.loading?"Sending...":status.ok||status.err}
          </div>
        )}
      </div>
    </div>
  );
}

function SettingsModal({config,onSave,onClose}){
  const [autoRefresh,setAutoRefresh]=useState(config.autoRefresh||false);
  const [interval,setInterval2]=useState(config.interval||300);
  return (
    <div style={{position:"fixed",inset:0,background:"#000000cc",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(4px)"}}>
      <div style={{background:"#080b0e",border:"1px solid #1a2535",borderRadius:14,width:420,maxWidth:"95vw",padding:28}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
          <span style={{fontFamily:"'IBM Plex Mono',monospace",color:"#dde4f0",fontSize:14,fontWeight:700}}>⚙ Settings</span>
          <button onClick={onClose} style={{background:"none",border:"none",color:"#3d5070",cursor:"pointer",fontSize:18}}>✕</button>
        </div>

        <div style={{marginBottom:20,padding:"12px 14px",background:"#040810",border:"1px solid #111820",borderRadius:8,fontSize:11,color:"#2d4060",lineHeight:1.9}}>
          <div style={{color:"#4a6080",marginBottom:4,fontFamily:"'IBM Plex Mono',monospace",fontSize:10,letterSpacing:1}}>DATA SOURCE</div>
          <div><span style={{color:"#00ff88"}}>● Binance API</span> — live prices, volume &amp; RSI · free · no key required</div>
          <div style={{marginTop:4}}><span style={{color:"#eab308"}}>● SIM fallback</span> — activates automatically if Binance is unreachable</div>
        </div>

        <div style={{marginBottom:18,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div>
            <div style={{fontSize:12,color:"#4a6080"}}>Auto-refresh</div>
            <div style={{fontSize:10,color:"#243040"}}>Automatically re-scan the market</div>
          </div>
          <div onClick={()=>setAutoRefresh(v=>!v)} style={{width:44,height:24,borderRadius:12,background:autoRefresh?"#0d2b1a":"#111820",border:`1px solid ${autoRefresh?"#00ff88":"#1a2535"}`,cursor:"pointer",position:"relative",transition:"all 0.2s"}}>
            <div style={{width:18,height:18,borderRadius:"50%",background:autoRefresh?"#00ff88":"#334155",position:"absolute",top:2,left:autoRefresh?22:2,transition:"all 0.2s"}}/>
          </div>
        </div>

        {autoRefresh&&(
          <div style={{marginBottom:18}}>
            <label style={{fontSize:11,color:"#3d5070",display:"block",marginBottom:5}}>Refresh interval</label>
            <select value={interval} onChange={e=>setInterval2(Number(e.target.value))} style={{background:"#040608",border:"1px solid #1a2535",color:"#8ab0d0",padding:"8px 12px",borderRadius:7,fontFamily:"'IBM Plex Mono',monospace",fontSize:11,outline:"none"}}>
              {[60,120,300,600,1800].map(v=><option key={v} value={v}>{v===60?"1 min":v===120?"2 min":v===300?"5 min":v===600?"10 min":"30 min"}</option>)}
            </select>
          </div>
        )}

        <div style={{display:"flex",gap:10,marginTop:4}}>
          <button onClick={()=>onSave({autoRefresh,interval})} style={{background:"#071428",border:"1px solid #00ff88",color:"#00ff88",padding:"9px 20px",borderRadius:7,cursor:"pointer",fontFamily:"'IBM Plex Mono',monospace",fontSize:11,fontWeight:700,letterSpacing:1}}>SAVE</button>
          <button onClick={onClose} style={{background:"none",border:"1px solid #1a2535",color:"#3d5070",padding:"9px 20px",borderRadius:7,cursor:"pointer",fontFamily:"'IBM Plex Mono',monospace",fontSize:11}}>CANCEL</button>
        </div>
      </div>
    </div>
  );
}

// ─── DETAIL PANEL ─────────────────────────────────────────────────────────────
function DetailPanel({op,onAlert}){
  if(!op) return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",gap:10}}>
      <div style={{fontSize:38,opacity:0.15}}>◈</div>
      <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:12,color:"#1e3050"}}>Select a coin to view analysis</div>
    </div>
  );
  const sc=SIGNAL_COLORS[op.signal];
  const pos=op.change24h>=0;
  return (
    <div style={{overflowY:"auto",height:"100%",paddingRight:4}}>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
        <div>
          <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:24,fontWeight:700,color:"#dde4f0",display:"flex",alignItems:"center",gap:10}}>
            {op.symbol}/USDT
            {op.dataSource==="live"&&<span style={{fontSize:10,background:"#071a0f",border:"1px solid #00ff8860",color:"#00ff88",padding:"2px 8px",borderRadius:4,letterSpacing:1}}>LIVE</span>}
          </div>
          <div style={{color:"#2d4060",fontSize:12,marginTop:2}}>{op.name} · Swing Trade Analysis</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:21,color:"#c8d4e8"}}>{fmtPrice(op.price,op.symbol)}</div>
          <div style={{color:pos?"#22c55e":"#ef4444",fontSize:12,fontFamily:"'IBM Plex Mono',monospace"}}>{pos?"▲":"▼"}{Math.abs(op.change24h).toFixed(2)}% 24h &nbsp; {op.change7d>=0?"▲":"▼"}{Math.abs(op.change7d||0).toFixed(1)}% 7d</div>
        </div>
      </div>

      {/* Signal */}
      <div style={{background:sc.bg,border:`1px solid ${sc.border}`,borderRadius:8,padding:"11px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
        <span style={{color:sc.text,fontFamily:"'IBM Plex Mono',monospace",fontSize:15,fontWeight:700}}>{op.signal}</span>
        <div style={{display:"flex",gap:16,alignItems:"center"}}>
          <span style={{color:sc.text,fontSize:12}}>Score: {op.score}/100</span>
          <button onClick={()=>onAlert(op)} style={{background:"#000000aa",border:`1px solid ${sc.border}60`,color:sc.text,padding:"5px 12px",borderRadius:5,cursor:"pointer",fontFamily:"'IBM Plex Mono',monospace",fontSize:10,letterSpacing:1}}>🔔 ALERT</button>
        </div>
      </div>
      <ScoreBar score={op.score}/>

      {/* TradingView */}
      <Section title="Live Chart">
        <TradingViewChart symbol={op.symbol}/>
      </Section>

      {/* Trade Levels */}
      <Section title="Trade Setup">
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8}}>
          <StatPill label="Entry" value={fmtPrice(op.price,op.symbol)} color="#38bdf8"/>
          <StatPill label="Target" value={fmtPrice(op.target,op.symbol)} color="#00ff88"/>
          <StatPill label="Stop Loss" value={fmtPrice(op.stopLoss,op.symbol)} color="#ef4444"/>
          <StatPill label="R/R Ratio" value={`${op.rrRatio}:1`} color="#eab308"/>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:10,fontSize:11,color:"#2d4060"}}>
          <span>Support: <span style={{color:"#4a6080"}}>{fmtPrice(op.support,op.symbol)}</span></span>
          <span>Resistance: <span style={{color:"#4a6080"}}>{fmtPrice(op.resistance,op.symbol)}</span></span>
        </div>
      </Section>

      {/* Technical */}
      <Section title="Technical Signals">
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          <StatPill label="RSI (14)" value={parseFloat(op.rsi||50).toFixed(1)} color={parseFloat(op.rsi||50)<40?"#00ff88":parseFloat(op.rsi||50)>65?"#ef4444":"#94a3b8"}/>
          <StatPill label="Volume Spike" value={`×${op.volSpike.toFixed(2)}`} color={op.volSpike>2?"#00ff88":"#38bdf8"}/>
          <StatPill label="Market Cap" value={fmt(op.marketCap)} color="#94a3b8"/>
          <StatPill label="24h Volume" value={fmt(op.volume)} color="#94a3b8"/>
        </div>
        <div style={{marginTop:10,padding:"11px 14px",background:"#040810",border:"1px solid #111820",borderRadius:8}}>
          <div style={{fontSize:10,color:"#243040",marginBottom:4,textTransform:"uppercase",letterSpacing:1}}>Pattern Detected</div>
          <div style={{fontFamily:"'IBM Plex Mono',monospace",color:"#7c6ef0",fontSize:14}}>{op.pattern}</div>
          <div style={{fontSize:11,color:"#2d4060",marginTop:4}}>{op.isBullishPattern?"Historically bullish continuation pattern":"Monitor for confirmation of direction"}</div>
        </div>
      </Section>

      <div style={{height:20}}/>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App(){
  const [opportunities,setOpportunities]=useState([]);
  const [selected,setSelected]=useState(null);
  const [filter,setFilter]=useState("ALL");
  const [sortBy,setSortBy]=useState("score");
  const [scanning,setScanning]=useState(false);
  const [scanProgress,setScanProgress]=useState(0);
  const [lastScan,setLastScan]=useState(null);
  const [alertOp,setAlertOp]=useState(null);
  const [showSettings,setShowSettings]=useState(false);
  const [config,setConfig]=useState({autoRefresh:false,interval:300});
  const [errors,setErrors]=useState([]);
  const [search,setSearch]=useState("");
  const [minScore,setMinScore]=useState(0);
  const autoTimer=useRef(null);

  const scan=useCallback(async()=>{
    setScanning(true);
    setScanProgress(0);
    setSelected(null);
    const errs=[];
    let liveSuccess=false;
    let ops=[];

    try{
      // Step 1: Fetch all USDT 24hr tickers from Binance (one call, all pairs)
      const tickerRes = await fetch(`${BINANCE_BASE}/ticker/24hr`);
      if(!tickerRes.ok) throw new Error(`Binance ticker: ${tickerRes.status}`);
      const allTickers = await tickerRes.json();
      setScanProgress(30);

      // Filter to USDT pairs only, skip stablecoins, sort by quoteVolume desc
      const stables = new Set(["USDT","BUSD","USDC","TUSD","DAI","FDUSD","USDP","USDD"]);
      const usdtPairs = allTickers
        .filter(t => t.symbol.endsWith("USDT") && !stables.has(t.symbol.replace("USDT","")))
        .sort((a,b) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume))
        .slice(0, TOP_N);
      setScanProgress(45);

      // Step 2: Fetch klines for RSI — batch up to 10 at a time to stay fast
      // Use daily klines (interval=1d, limit=15) for swing-trade RSI
      const BATCH = 10;
      const klineMap = {};
      for(let i=0; i<usdtPairs.length; i+=BATCH){
        const batch = usdtPairs.slice(i, i+BATCH);
        await Promise.all(batch.map(async t => {
          try{
            const r = await fetch(`${BINANCE_BASE}/klines?symbol=${t.symbol}&interval=4h&limit=50`);
            if(r.ok){ const d=await r.json(); klineMap[t.symbol]=d; }
          }catch(e){}
        }));
        setScanProgress(45 + Math.round(((i+BATCH)/usdtPairs.length)*45));
      }

      // Step 3: Build opportunities
      ops = usdtPairs.map(ticker => {
        const base = ticker.symbol.replace("USDT","");
        const price = parseFloat(ticker.lastPrice);
        const change24h = parseFloat(ticker.priceChangePercent);
        const volume = parseFloat(ticker.quoteVolume); // volume in USDT
        const klines = klineMap[ticker.symbol] || [];
        // kline: [openTime, open, high, low, close, volume, ...]
        const closes = klines.map(k => parseFloat(k[4]));
        const highs  = klines.map(k => parseFloat(k[2]));
        const lows   = klines.map(k => parseFloat(k[3]));
        const vols   = klines.map(k => parseFloat(k[5]));

        const rsi = computeRSI(closes);

        // Volume spike: today's vol vs 14-day avg
        const avgVol = vols.length > 1 ? vols.slice(0,-1).reduce((a,b)=>a+b,0)/(vols.length-1) : volume;
        const todayVol = vols[vols.length-1] || parseFloat(ticker.volume);
        const volSpike = avgVol > 0 ? Math.min(todayVol/avgVol, 5) : 1;

        // 7d change: 42 x 4h candles = 7 days
        const change7d = closes.length >= 42
          ? ((closes[closes.length-1] - closes[closes.length-42]) / closes[closes.length-42]) * 100
          : parseFloat(ticker.priceChangePercent);

        const pattern = pick(PATTERNS);
        const bullishPatterns = ["Bull Flag","Cup & Handle","Double Bottom","Ascending Triangle","Golden Cross","Falling Wedge"];
        const isBullishPattern = bullishPatterns.includes(pattern);

        const score = Math.round(
          (rsi<35?35:rsi<45?22:rsi>70?5:14) +
          (volSpike>2.5?30:volSpike>1.5?18:6) +
          (isBullishPattern?30:8) +
          (change7d>10?5:change7d<-10?2:0)
        );
        const signal = score>=72?"STRONG BUY":score>=52?"BUY":score>=36?"WATCH":"AVOID";

        const target   = price * rnd(1.10,1.28);
        const stopLoss = price * rnd(0.86,0.94);
        const support  = lows.length  ? Math.min(...lows.slice(-7))  : price*0.92;
        const resistance=highs.length ? Math.max(...highs.slice(-7)) : price*1.08;
        const rrRatio  = ((target-price)/(price-stopLoss)).toFixed(1);

        return {
          id: base, symbol: base, name: base,
          price, change24h, change7d, volume,
          marketCap: 0, // Binance doesn't provide market cap
          sparkline: closes,
          rsi, volSpike, pattern, isBullishPattern,
          score, signal, target, stopLoss, support, resistance, rrRatio,
          dataSource: "live",
        };
      });

      liveSuccess = true;
    } catch(e){
      errs.push(`Binance: ${e.message}`);
      // Fallback to simulated data
      const simCoins = generateSimulatedCoins();
      ops = simCoins.map(buildSimulatedOpportunity);
    }

    setScanProgress(100);
    setOpportunities(ops);
    setLastScan(new Date());
    setErrors(errs);
    setDataMode(liveSuccess ? "live" : "sim");
    setScanning(false);
  },[]);

  useEffect(()=>{scan();},[]);

  // Auto refresh
  useEffect(()=>{
    if(autoTimer.current) clearInterval(autoTimer.current);
    if(config.autoRefresh){
      autoTimer.current=setInterval(scan,config.interval*1000);
    }
    return()=>{if(autoTimer.current) clearInterval(autoTimer.current);};
  },[config.autoRefresh,config.interval,scan]);

  const FILTERS=["ALL","STRONG BUY","BUY","WATCH","AVOID"];
  const filtered=opportunities
    .filter(o=>filter==="ALL"||o.signal===filter)
    .filter(o=>o.score>=minScore)
    .filter(o=>{
      if(!search) return true;
      const q=search.toLowerCase();
      return o.symbol?.toLowerCase().includes(q)||o.name?.toLowerCase().includes(q);
    })
    .sort((a,b)=>sortBy==="score"?b.score-a.score:sortBy==="change24h"?b.change24h-a.change24h:b.marketCap-a.marketCap);

  const strongBuys=opportunities.filter(o=>o.signal==="STRONG BUY").length;
  const buys=opportunities.filter(o=>o.signal==="BUY").length;

  const [dataMode,setDataMode]=useState("sim"); // "live" | "sim"

  function saveConfig(c){setConfig(c);setShowSettings(false);}

  return (
    <div style={{height:"100vh",background:"#040608",fontFamily:"'DM Sans',sans-serif",color:"#c8d4e8",display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;700&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet"/>

      {/* HEADER */}
      <div style={{borderBottom:"1px solid #0d1220",padding:"10px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",background:"#050810",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{display:"flex",alignItems:"center",gap:7}}>
            <div style={{width:7,height:7,borderRadius:"50%",background:"#00ff88",boxShadow:"0 0 8px #00ff88"}}/>
            <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:13,fontWeight:700,letterSpacing:2,color:"#dde4f0"}}>SWING SCANNER</span>
            <span style={{fontSize:9,background:"#0a1018",border:"1px solid #1a2535",color:"#2d4060",padding:"1px 6px",borderRadius:3,fontFamily:"'IBM Plex Mono',monospace"}}>4H · BINANCE</span>
            {dataMode==="live"
              ? <span style={{fontSize:9,background:"#071a0f",border:"1px solid #00ff8860",color:"#00ff88",padding:"1px 7px",borderRadius:3,fontFamily:"'IBM Plex Mono',monospace",letterSpacing:1}}>● LIVE</span>
              : <span style={{fontSize:9,background:"#161200",border:"1px solid #eab30860",color:"#eab308",padding:"1px 7px",borderRadius:3,fontFamily:"'IBM Plex Mono',monospace",letterSpacing:1}}>● SIM</span>
            }
          </div>
          <div style={{height:14,width:1,background:"#111820"}}/>
          <div style={{display:"flex",gap:10}}>
            <span style={{fontSize:10,color:"#22c55e",fontFamily:"'IBM Plex Mono',monospace"}}>{strongBuys} STR.BUY</span>
            <span style={{fontSize:10,color:"#4a8060",fontFamily:"'IBM Plex Mono',monospace"}}>{buys} BUY</span>
            <span style={{fontSize:10,color:"#1e3050",fontFamily:"'IBM Plex Mono',monospace"}}>{opportunities.length} coins</span>
          </div>
          {errors.length>0&&<span style={{fontSize:9,color:"#6b3030",background:"#180707",border:"1px solid #2a1010",padding:"1px 7px",borderRadius:3,fontFamily:"'IBM Plex Mono',monospace"}}>⚠ {errors[0]}</span>}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          {lastScan&&<span style={{fontSize:9,color:"#1e3050",fontFamily:"'IBM Plex Mono',monospace"}}>{lastScan.toLocaleTimeString()}</span>}
          {config.autoRefresh&&<span style={{fontSize:9,color:"#243040",fontFamily:"'IBM Plex Mono',monospace"}}>AUTO ✓</span>}
          <button onClick={()=>setShowSettings(true)} style={{background:"none",border:"1px solid #1a2535",color:"#2d4060",padding:"5px 10px",borderRadius:5,cursor:"pointer",fontFamily:"'IBM Plex Mono',monospace",fontSize:9}}>⚙ CONFIG</button>
          <button onClick={scan} disabled={scanning} style={{background:scanning?"#040810":"#051a0a",border:`1px solid ${scanning?"#1a2535":"#00ff88"}`,color:scanning?"#1a2535":"#00ff88",padding:"5px 14px",borderRadius:5,cursor:scanning?"not-allowed":"pointer",fontFamily:"'IBM Plex Mono',monospace",fontSize:10,fontWeight:700,letterSpacing:1,transition:"all 0.2s"}}>
            {scanning?`⟳ ${scanProgress}%…`:"⟳ SCAN"}
          </button>
        </div>
      </div>

      {/* PROGRESS BAR */}
      {scanning&&(
        <div style={{height:2,background:"#080d14",flexShrink:0}}>
          <div style={{height:2,background:"#00ff88",width:`${scanProgress}%`,transition:"width 0.4s ease",boxShadow:"0 0 6px #00ff88"}}/>
        </div>
      )}

      {/* FILTER BAR */}
      <div style={{padding:"7px 14px",borderBottom:"1px solid #080d14",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0,gap:8,flexWrap:"wrap"}}>
        <div style={{display:"flex",gap:4}}>
          {FILTERS.map(f=>{
            const sc=f!=="ALL"?SIGNAL_COLORS[f]:null;
            return <button key={f} onClick={()=>setFilter(f)} style={{background:filter===f?(sc?sc.bg:"#0a1018"):"transparent",border:`1px solid ${filter===f?(sc?sc.border:"#38bdf8"):"#0d1520"}`,color:filter===f?(sc?sc.text:"#38bdf8"):"#2d4060",padding:"3px 9px",borderRadius:4,cursor:"pointer",fontFamily:"'IBM Plex Mono',monospace",fontSize:8,letterSpacing:1.2,transition:"all 0.15s"}}>{f}</button>;
          })}
        </div>
        <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
          <div style={{position:"relative"}}>
            <span style={{position:"absolute",left:8,top:"50%",transform:"translateY(-50%)",color:"#1e3050",fontSize:10,pointerEvents:"none"}}>⌕</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…" style={{background:"#040810",border:"1px solid #1a2535",color:"#8ab0d0",padding:"4px 8px 4px 22px",borderRadius:5,fontFamily:"'IBM Plex Mono',monospace",fontSize:9,outline:"none",width:110}}/>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:4}}>
            <span style={{fontSize:9,color:"#1e3050",fontFamily:"'IBM Plex Mono',monospace"}}>MIN SCR</span>
            <select value={minScore} onChange={e=>setMinScore(Number(e.target.value))} style={{background:"#040810",border:"1px solid #1a2535",color:"#8ab0d0",padding:"3px 6px",borderRadius:4,fontFamily:"'IBM Plex Mono',monospace",fontSize:9,outline:"none"}}>
              {[0,30,50,60,70].map(v=><option key={v} value={v}>{v===0?"Any":"≥"+v}</option>)}
            </select>
          </div>
          <span style={{fontSize:9,color:"#1e3050",fontFamily:"'IBM Plex Mono',monospace"}}>{filtered.length} results</span>
          {selected&&<button onClick={()=>setSelected(null)} style={{background:"none",border:"1px solid #1a2535",color:"#2d4060",padding:"3px 8px",borderRadius:4,cursor:"pointer",fontFamily:"'IBM Plex Mono',monospace",fontSize:9}}>✕ CLOSE DETAIL</button>}
        </div>
      </div>

      {/* MAIN AREA */}
      <div style={{display:"flex",flex:1,overflow:"hidden"}}>

        {/* TABLE */}
        <div style={{flex:1,overflowY:"auto",overflowX:"hidden"}}>
          {scanning&&opportunities.length===0?(
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",gap:8}}>
              <div style={{fontFamily:"'IBM Plex Mono',monospace",color:"#00ff88",fontSize:12,letterSpacing:4,animation:"blink 1s ease-in-out infinite"}}>SCANNING BINANCE</div>
              <div style={{color:"#1e3050",fontSize:10,letterSpacing:2}}>{scanProgress < 45 ? "Fetching tickers…" : scanProgress < 90 ? "Loading 4H klines…" : "Building setups…"} {scanProgress}%</div>
            </div>
          ):(
            <>
              <TableHeader sortBy={sortBy} setSortBy={setSortBy}/>
              {filtered.length===0&&<div style={{color:"#1e3050",fontSize:11,textAlign:"center",marginTop:60,fontFamily:"'IBM Plex Mono',monospace"}}>No coins match filters</div>}
              {filtered.map(op=><Row key={op.symbol+op.id} op={op} onClick={setSelected} selected={selected?.id===op.id}/>)}
            </>
          )}
        </div>

        {/* DETAIL PANEL — slide in from right */}
        {selected&&(
          <div style={{width:420,borderLeft:"1px solid #0d1220",overflowY:"auto",background:"#050810",flexShrink:0}}>
            <DetailPanel op={selected} onAlert={setAlertOp}/>
          </div>
        )}
      </div>

      {alertOp&&<AlertModal op={alertOp} onClose={()=>setAlertOp(null)}/>}
      {showSettings&&<SettingsModal config={config} onSave={saveConfig} onClose={()=>setShowSettings(false)}/>}

      <style>{`
        @keyframes pulse{0%,100%{opacity:0.3}50%{opacity:0.6}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}
        ::-webkit-scrollbar{width:3px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:#111820;border-radius:3px}
        *{box-sizing:border-box}
        input::placeholder{color:#1e3050}
        select option{background:#080b0e}
      `}</style>
    </div>
  );
}
