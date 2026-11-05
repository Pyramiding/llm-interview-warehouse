"use client";
import {useEffect, useState} from "react";

type Stats = {total:number; today:number; todayIps:number; startedAt:number|null};
type Visit = {event_id:string; ip:string; visited_at:number; view:string};
type Data = {stats:Stats;items:Visit[];nextCursor:string|null;series:{day:string;pageviews:number}[];retentionDays:number};
const labels:Record<string,string> = {interviews:"面经",questions:"专题题解",resources:"参考资料"};
const formatTime = (time:number) => new Intl.DateTimeFormat("zh-CN",{timeZone:"Asia/Shanghai",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false}).format(time);
export default function Dashboard({signInPath}:{signInPath:string}) {
  const [data,setData]=useState<Data|null>(null);
  const [days,setDays]=useState("7"),[ip,setIp]=useState("");
  const [busy,setBusy]=useState(false),[error,setError]=useState("");
  const [expired,setExpired]=useState(false);
  async function load(more=false, queryDays=days, queryIp=ip) {
    setBusy(true);setError("");setExpired(false);
    try {
      const query=new URLSearchParams({days:queryDays});
      if(queryIp.trim())query.set("ip",queryIp.trim());
      if(more&&data?.nextCursor)query.set("before",data.nextCursor);
      const response=await fetch("/api/admin?"+query.toString(),{cache:"no-store",credentials:"same-origin"});
      if(response.status===401){setExpired(true);throw new Error("登录已过期，请重新登录。");}
      if(response.status===403)throw new Error("当前账号没有查看权限。");
      const body=await response.json() as Data & {error?:string};
      if(!response.ok)throw new Error(body.error==="invalid_ip"?"请输入有效的IPv4或IPv6地址。":"暂时未能取得统计，请稍后重试。");
      setData(previous=>more&&previous?{...body,items:[...previous.items,...body.items]}:body);
    }catch(problem){setError(problem instanceof Error?problem.message:"读取失败");}
    finally{setBusy(false);}
  }
  useEffect(()=>{void load(false,"7","");},[]);
  const stats=data?.stats;
  const max=Math.max(1,...(data?.series||[]).map(item=>item.pageviews));
  return <>
    <section className="heading"><div><span className="eyebrow">LLM INTERVIEW WAREHOUSE</span><h1>访问统计</h1><p>访问次数公开显示，IP访问记录仅当前管理员可见。</p></div><button className="button secondary" onClick={()=>load()} disabled={busy}>{busy?"读取中…":"刷新统计"}</button></section>
    <section className="metrics" aria-label="统计汇总">{[["累计访问",stats?.total],["今日访问",stats?.today],["今日IP数",stats?.todayIps]].map(([label,count])=><article className="metric" key={String(label)}><span>{label}</span><strong>{count===undefined?"—":Number(count).toLocaleString("zh-CN")}</strong></article>)}</section>
    <p className="small-note">{stats?.startedAt?"统计启用于 "+formatTime(stats.startedAt)+"。":"还没有访问记录。"} 刷新页面计一次访问；今日IP数按出口IP去重，不等同于人数。</p>
    <section className="chart-panel"><div className="section-heading"><h2>最近30天访问量</h2><span>北京时间</span></div>{data?.series.length?<div className="chart" aria-label="最近30天每日访问次数">{data.series.map(item=><div className="bar-column" key={item.day} title={item.day+" · "+item.pageviews+"次"}><span>{item.pageviews}</span><i style={{height:Math.max(3,item.pageviews/max*105)}}/><small>{item.day.slice(5)}</small></div>)}</div>:<p className="empty">开始收到访问后，这里会显示每日次数。</p>}</section>
    <section className="logs-panel"><div className="section-heading"><h2>IP访问记录</h2><span>仅保留最近30天</span></div><form className="log-filters" onSubmit={event=>{event.preventDefault();void load();}}><label>时间范围<select value={days} onChange={event=>setDays(event.target.value)}><option value="1">最近24小时</option><option value="7">最近7天</option><option value="30">最近30天</option></select></label><label className="ip-field">按IP查找<input value={ip} onChange={event=>setIp(event.target.value)} placeholder="IPv4或IPv6，留空查看全部" maxLength={64}/></label><button className="button" disabled={busy} type="submit">查询</button></form>
    {error&&<p role="alert" className="error">{error}{expired&&<a href={signInPath} target="_top">重新登录 ↗</a>}</p>}
    <div className="table-scroll"><table><thead><tr><th>访问时间（北京）</th><th>IP地址</th><th>访问页面</th></tr></thead><tbody>{data?.items.map(item=><tr key={item.event_id}><td>{formatTime(item.visited_at)}</td><td><code>{item.ip}</code></td><td>{labels[item.view]||item.view}</td></tr>)}</tbody></table></div>
    {!busy&&!data?.items.length&&<p className="empty">当前条件下没有访问记录。</p>}
    {data?.nextCursor&&<div className="load-more"><button className="button secondary" disabled={busy} onClick={()=>load(true)}>加载更多</button></div>}
    </section>
  </>;
}
