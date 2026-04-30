"use client";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://ftsyzeuzjivysinlzfks.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0c3l6ZXV6aml2eXNpbmx6ZmtzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NjM4NjIsImV4cCI6MjA5MzEzOTg2Mn0.gWX0WR5JVshrgjw7LKUscR5ETkgzurZaXG2KZ7FmUdU"
);

const STAGES = [
  { id: "lead", label: "Lead 进来", color: "#f59e0b", bg: "rgba(245,158,11,0.12)", icon: "🟡" },
  { id: "following", label: "跟进中", color: "#3b82f6", bg: "rgba(59,130,246,0.12)", icon: "🔵" },
  { id: "closed", label: "成交", color: "#22c55e", bg: "rgba(34,197,94,0.12)", icon: "🟢" },
  { id: "lost", label: "丢失", color: "#ef4444", bg: "rgba(239,68,68,0.12)", icon: "🔴" },
];

function getMonthKey(d) {
  const date = new Date(d);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export default function Home() {
  const [deals, setDeals] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [dbOk, setDbOk] = useState(null);
  const [saveMsg, setSaveMsg] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [tab, setTab] = useState("lead");
  const [expandedId, setExpandedId] = useState(null);
  const [fName, setFName] = useState("");
  const [fPhone, setFPhone] = useState("");
  const [fCloser, setFCloser] = useState("sam");
  const [fSource, setFSource] = useState("xhs");
  const [fAccount, setFAccount] = useState("");
  const [fBanks, setFBanks] = useState([]);
  const [fAmount, setFAmount] = useState("350");
  const [fNote, setFNote] = useState("");

  const loadDeals = useCallback(async () => {
    try {
      const { data, error } = await supabase.from("deals").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      setDeals(data || []);
      setDbOk(true);
    } catch (e) { console.error(e); setDbOk(false); }
    setLoaded(true);
  }, []);

  useEffect(() => { loadDeals(); }, [loadDeals]);
  useEffect(() => {
    const ch = supabase.channel("deals-changes").on("postgres_changes", { event: "*", schema: "public", table: "deals" }, () => loadDeals()).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [loadDeals]);

  const flash = (m) => { setSaveMsg(m); setTimeout(() => setSaveMsg(""), 1500); };

  const addDeal = async () => {
    if (!fName.trim()) return;
    const deal = { name: fName.trim().toUpperCase(), phone: fPhone.trim(), closer: fCloser, source: fSource, account: fAccount.trim() || "-", banks: fBanks.join(", ") || "-", amount: parseFloat(fAmount) || 350, note: fNote.trim(), stage: "lead", month: getMonthKey(new Date()) };
    try { const { error } = await supabase.from("deals").insert([deal]); if (error) throw error; flash("✓"); await loadDeals(); } catch (e) { console.error(e); flash("⚠ 失败"); }
    setFName(""); setFPhone(""); setFNote(""); setFBanks([]); setShowForm(false);
  };

  const moveStage = async (id, ns) => {
    const u = { stage: ns, updated_at: new Date().toISOString() };
    if (ns === "closed") u.closed_at = new Date().toISOString();
    try { const { error } = await supabase.from("deals").update(u).eq("id", id); if (error) throw error; flash("✓"); await loadDeals(); } catch { flash("⚠"); }
  };

  const deleteDeal = async (id) => {
    try { const { error } = await supabase.from("deals").delete().eq("id", id); if (error) throw error; flash("✓ 已删除"); await loadDeals(); } catch { flash("⚠"); }
  };

  const cm = getMonthKey(new Date());
  const md = deals.filter(d => d.month === cm);
  const lc = deals.filter(d => d.stage === "lead").length;
  const fc = deals.filter(d => d.stage === "following").length;
  const clm = md.filter(d => d.stage === "closed");
  const lom = md.filter(d => d.stage === "lost");
  const ct = clm.reduce((s, d) => s + (d.amount || 0), 0);
  const sc = clm.filter(d => d.closer === "sam").length;
  const cc = clm.filter(d => d.closer === "chester").length;
  const cr = md.length > 0 ? ((clm.length / md.length) * 100).toFixed(0) : 0;
  const sd = deals.filter(d => d.stage === tab);

  if (!loaded) return <div style={{ minHeight: "100vh", background: "#0a0f1a", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", fontFamily: "-apple-system, sans-serif" }}>加载中...</div>;

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(145deg, #0a0f1a 0%, #111827 50%, #0d1525 100%)", fontFamily: "-apple-system, 'SF Pro Display', sans-serif", color: "#e2e8f0" }}>
      <div style={{ padding: "32px 24px 14px", textAlign: "center", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ fontSize: "11px", letterSpacing: "3px", color: "#64748b", textTransform: "uppercase" }}>Nova Tax SG</div>
        <h1 style={{ fontSize: "24px", fontWeight: "700", margin: "4px 0 0", background: "linear-gradient(135deg, #f8fafc, #94a3b8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Sales Pipeline</h1>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginTop: "6px" }}>
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: dbOk ? "#22c55e" : dbOk === false ? "#ef4444" : "#f59e0b", boxShadow: dbOk ? "0 0 6px #22c55e" : "none" }} />
          <span style={{ fontSize: "10px", color: "#64748b" }}>{dbOk ? "已连接" : dbOk === false ? "连接失败" : "连接中..."}</span>
          {saveMsg && <span style={{ fontSize: "10px", color: saveMsg.includes("✓") ? "#22c55e" : "#f59e0b", fontWeight: "700" }}>{saveMsg}</span>}
        </div>
      </div>
      <div style={{ padding: "14px 24px 0", display: "flex", gap: "6px" }}>
        {STAGES.map(s => {
          const count = s.id === "closed" ? clm.length : s.id === "lost" ? lom.length : deals.filter(d => d.stage === s.id).length;
          return (<div key={s.id} onClick={() => setTab(s.id)} style={{ flex: 1, background: tab === s.id ? s.bg : "rgba(255,255,255,0.03)", borderRadius: "12px", padding: "10px 6px", border: `1.5px solid ${tab === s.id ? s.color + "55" : "rgba(255,255,255,0.06)"}`, textAlign: "center", cursor: "pointer" }}>
            <div style={{ fontSize: "10px", color: s.color }}>{s.icon}</div>
            <div style={{ fontSize: "22px", fontWeight: "800", color: s.color }}>{count}</div>
            <div style={{ fontSize: "9px", color: "#64748b", marginTop: "2px" }}>{s.label}</div>
          </div>);
        })}
      </div>
      <div style={{ padding: "10px 24px 0", display: "flex", gap: "10px" }}>
        <div style={{ flex: 1, background: "rgba(255,255,255,0.03)", borderRadius: "12px", padding: "12px", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize: "10px", color: "#64748b" }}>本月成交</div>
          <div style={{ fontSize: "22px", fontWeight: "800", color: ct > 0 ? "#22c55e" : "#475569" }}>${ct.toLocaleString()}</div>
          <div style={{ fontSize: "10px", color: "#475569", marginTop: "2px" }}>Chester {cc} · Sam {sc}</div>
        </div>
        <div style={{ flex: 1, background: "rgba(255,255,255,0.03)", borderRadius: "12px", padding: "12px", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize: "10px", color: "#64748b" }}>转化率</div>
          <div style={{ fontSize: "22px", fontWeight: "800", color: "#f1f5f9" }}>{cr}%</div>
          <div style={{ fontSize: "10px", color: "#475569", marginTop: "2px" }}>Pending: {lc + fc}</div>
        </div>
      </div>
      <div style={{ padding: "14px 24px 0" }}>
        <button onClick={() => setShowForm(!showForm)} style={{ width: "100%", padding: "13px", border: "none", borderRadius: "12px", fontSize: "14px", fontWeight: "700", cursor: "pointer", background: showForm ? "rgba(255,255,255,0.06)" : "linear-gradient(135deg, #f59e0b, #d97706)", color: showForm ? "#94a3b8" : "#000", boxShadow: showForm ? "none" : "0 4px 16px rgba(245,158,11,0.2)" }}>{showForm ? "取消" : "+ 新 Lead"}</button>
      </div>
      {showForm && (
        <div style={{ padding: "10px 24px 0" }}>
          <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: "14px", padding: "14px", border: "1px solid rgba(255,255,255,0.08)", display: "flex", flexDirection: "column", gap: "8px" }}>
            <input value={fName} onChange={e => setFName(e.target.value)} placeholder="客户名字" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "11px 13px", color: "#f1f5f9", fontSize: "14px", outline: "none" }} />
            <input value={fPhone} onChange={e => setFPhone(e.target.value)} placeholder="WhatsApp 号码" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "11px 13px", color: "#f1f5f9", fontSize: "14px", outline: "none" }} />
            <div style={{ fontSize: "10px", color: "#64748b" }}>Closer</div>
            <div style={{ display: "flex", gap: "6px" }}>
              {[["sam", "Sam"], ["chester", "Chester"]].map(([v, l]) => (<button key={v} onClick={() => setFCloser(v)} style={{ flex: 1, padding: "9px", border: `1.5px solid ${fCloser === v ? "#3b82f6" : "rgba(255,255,255,0.08)"}`, borderRadius: "10px", background: fCloser === v ? "rgba(59,130,246,0.12)" : "transparent", color: fCloser === v ? "#60a5fa" : "#64748b", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>{l}</button>))}
            </div>
            <div style={{ fontSize: "10px", color: "#64748b" }}>渠道</div>
            <div style={{ display: "flex", gap: "6px" }}>
              {[["xhs", "XHS"], ["fb", "Facebook"], ["wa", "WhatsApp"], ["ref", "Referral"]].map(([v, l]) => (<button key={v} onClick={() => setFSource(v)} style={{ flex: 1, padding: "8px 2px", border: `1.5px solid ${fSource === v ? "#22c55e" : "rgba(255,255,255,0.08)"}`, borderRadius: "10px", background: fSource === v ? "rgba(34,197,94,0.12)" : "transparent", color: fSource === v ? "#22c55e" : "#64748b", fontSize: "11px", fontWeight: "600", cursor: "pointer" }}>{l}</button>))}
            </div>
            {fSource === "xhs" && (<><div style={{ fontSize: "10px", color: "#64748b" }}>来源账号</div><input value={fAccount} onChange={e => setFAccount(e.target.value)} placeholder="例：美宝姐姐" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "11px 13px", color: "#f1f5f9", fontSize: "14px", outline: "none" }} /></>)}
            <div style={{ fontSize: "10px", color: "#64748b" }}>户口（可多选）</div>
            <div style={{ display: "flex", gap: "6px" }}>
              {["MARI", "LP", "其他"].map(b => { const sel = fBanks.includes(b); return (<button key={b} onClick={() => setFBanks(sel ? fBanks.filter(x => x !== b) : [...fBanks, b])} style={{ flex: 1, padding: "9px", border: `1.5px solid ${sel ? "#a855f7" : "rgba(255,255,255,0.08)"}`, borderRadius: "10px", background: sel ? "rgba(168,85,247,0.12)" : "transparent", color: sel ? "#a855f7" : "#64748b", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>{b} {sel ? "✓" : ""}</button>); })}
            </div>
            <input type="number" value={fAmount} onChange={e => setFAmount(e.target.value)} placeholder="金额 SGD（默认350）" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "11px 13px", color: "#f1f5f9", fontSize: "14px", outline: "none" }} />
            <input value={fNote} onChange={e => setFNote(e.target.value)} placeholder="备注（选填）" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "11px 13px", color: "#f1f5f9", fontSize: "14px", outline: "none" }} />
            <button onClick={addDeal} style={{ padding: "12px", border: "none", borderRadius: "10px", background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#000", fontSize: "14px", fontWeight: "700", cursor: "pointer" }}>添加 Lead</button>
          </div>
        </div>
      )}
      <div style={{ padding: "14px 24px 0" }}>
        <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "10px", fontWeight: "600" }}>{STAGES.find(s => s.id === tab)?.icon} {STAGES.find(s => s.id === tab)?.label} ({sd.length})</div>
        {sd.length === 0 && <div style={{ textAlign: "center", padding: "40px", color: "#374151", fontSize: "13px" }}>没有{STAGES.find(s => s.id === tab)?.label}的客户</div>}
        {sd.map(d => {
          const isExp = expandedId === d.id;
          const stage = STAGES.find(s => s.id === d.stage);
          const ds = Math.floor((Date.now() - new Date(d.updated_at || d.created_at).getTime()) / 86400000);
          return (<div key={d.id} style={{ background: "rgba(255,255,255,0.03)", borderRadius: "12px", marginBottom: "8px", border: `1px solid ${stage.color}22`, overflow: "hidden" }}>
            <div onClick={() => setExpandedId(isExp ? null : d.id)} style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "700", flexShrink: 0, background: stage.bg, color: stage.color }}>{d.name?.charAt(0)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "14px", fontWeight: "600" }}>{d.name}</div>
                <div style={{ fontSize: "10px", color: "#64748b" }}>{d.closer === "sam" ? "SAM" : "Chester"} · {d.source?.toUpperCase()}{d.source === "xhs" && d.account && d.account !== "-" ? ` · ${d.account}` : ""}{d.banks && d.banks !== "-" ? ` · ${d.banks}` : ""} · {ds}天前</div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontSize: "14px", fontWeight: "700" }}>${d.amount}</div>
                {ds >= 3 && d.stage !== "closed" && d.stage !== "lost" && <div style={{ fontSize: "9px", color: "#ef4444", fontWeight: "600" }}>⚠ {ds}天没动</div>}
              </div>
            </div>
            {isExp && (<div style={{ padding: "0 14px 14px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              {d.phone && <div style={{ fontSize: "11px", color: "#94a3b8", padding: "8px 0 4px" }}>📱 {d.phone}</div>}
              {d.note && <div style={{ fontSize: "11px", color: "#94a3b8", paddingBottom: "8px" }}>📝 {d.note}</div>}
              <div style={{ fontSize: "10px", color: "#475569", paddingBottom: "10px" }}>创建: {new Date(d.created_at).toLocaleDateString("zh-CN")}{d.closed_at && ` · 成交: ${new Date(d.closed_at).toLocaleDateString("zh-CN")}`}</div>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {d.stage === "lead" && (<><button onClick={() => moveStage(d.id, "following")} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "none", cursor: "pointer", background: "rgba(59,130,246,0.15)", color: "#60a5fa", fontSize: "12px", fontWeight: "700" }}>🔵 开始跟进</button><button onClick={() => moveStage(d.id, "closed")} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "none", cursor: "pointer", background: "rgba(34,197,94,0.15)", color: "#22c55e", fontSize: "12px", fontWeight: "700" }}>🟢 直接成交</button><button onClick={() => moveStage(d.id, "lost")} style={{ padding: "10px", borderRadius: "8px", border: "none", cursor: "pointer", background: "rgba(239,68,68,0.1)", color: "#ef4444", fontSize: "12px", fontWeight: "600" }}>丢失</button></>)}
                {d.stage === "following" && (<><button onClick={() => moveStage(d.id, "closed")} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "none", cursor: "pointer", background: "rgba(34,197,94,0.15)", color: "#22c55e", fontSize: "12px", fontWeight: "700" }}>🟢 成交！</button><button onClick={() => moveStage(d.id, "lost")} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "none", cursor: "pointer", background: "rgba(239,68,68,0.1)", color: "#ef4444", fontSize: "12px", fontWeight: "600" }}>🔴 丢失</button><button onClick={() => moveStage(d.id, "lead")} style={{ padding: "10px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#64748b", fontSize: "12px", cursor: "pointer" }}>退回Lead</button></>)}
                {d.stage === "closed" && <button onClick={() => moveStage(d.id, "following")} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#64748b", fontSize: "12px", cursor: "pointer" }}>退回跟进中</button>}
                {d.stage === "lost" && <button onClick={() => moveStage(d.id, "following")} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "none", cursor: "pointer", background: "rgba(59,130,246,0.15)", color: "#60a5fa", fontSize: "12px", fontWeight: "600" }}>重新跟进</button>}
                <button onClick={() => deleteDeal(d.id)} style={{ padding: "10px", borderRadius: "8px", border: "1px solid rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.08)", color: "#ef4444", fontSize: "11px", cursor: "pointer" }}>删除</button>
              </div>
            </div>)}
          </div>);
        })}
      </div>
      <div style={{ padding: "16px 24px 12px" }}>
        <div style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: "12px", padding: "12px 16px" }}>
          <div style={{ fontSize: "11px", fontWeight: "700", color: "#f87171", marginBottom: "4px" }}>Sam KPI</div>
          <div style={{ fontSize: "11px", color: "#94a3b8", lineHeight: "1.6" }}>每月最少成交 2 单 · 每单 SGD 900<br />Lead超过3天没跟进 = ⚠ 红色警告</div>
        </div>
      </div>
      <div style={{ height: "40px" }} />
    </div>
  );
}
