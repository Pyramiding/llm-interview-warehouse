const KEY = 'llm-interview-warehouse:analytics-opt-out:v1';
const VIEWS = new Set(['interviews','questions','resources']);
export function privacyDisabled(navigatorInfo, optOut=false) {
  return optOut || navigatorInfo?.globalPrivacyControl === true || navigatorInfo?.doNotTrack === '1';
}
export function isProductionLocation(locationInfo, settings) {
  return locationInfo.origin === settings.siteOrigin && locationInfo.pathname.startsWith(settings.sitePath);
}
export function visitPayload(view, eventId, token) {
  return {eventId,token,view:VIEWS.has(view)?view:'interviews'};
}
export function validatedStats(data) {
  if (!data || !['total','today','todayIps'].every(key=>Number.isSafeInteger(data[key])&&data[key]>=0)) throw new Error('Invalid statistics');
  return {total:data.total,today:data.today,todayIps:data.todayIps};
}
export async function recordVisit(endpoint, view, {fetcher=fetch, eventId=crypto.randomUUID(), signal}={}) {
  const requestSignal=()=>signal?AbortSignal.any([signal,AbortSignal.timeout(7000)]):AbortSignal.timeout(7000);
  const options = {method:'POST',mode:'cors',credentials:'omit',cache:'no-store',referrerPolicy:'origin',signal:requestSignal()};
  const challengeResponse = await fetcher(endpoint+'/api/challenge',options);
  if (!challengeResponse.ok) throw new Error('Challenge unavailable');
  const challenge = await challengeResponse.json();
  if(typeof challenge.token!=='string')throw new Error('Invalid challenge');
  const response = await fetcher(endpoint+'/api/collect',{...options,signal:requestSignal(),headers:{'Content-Type':'application/json'},body:JSON.stringify(visitPayload(view,eventId,challenge.token)),keepalive:true});
  if(!response.ok)throw new Error('Collection unavailable');
  const result=await response.json();
  return validatedStats(result.stats);
}
export async function readStats(endpoint, fetcher=fetch) {
  const response=await fetcher(endpoint+'/api/stats',{mode:'cors',credentials:'omit',cache:'no-store',referrerPolicy:'origin',signal:AbortSignal.timeout(7000)});
  if(!response.ok)throw new Error('Statistics unavailable');
  return validatedStats(await response.json());
}
export async function startAnalytics() {
  const region=document.querySelector('#site-analytics');
  if(!region)return;
  const status=document.querySelector('#analytics-state');
  const toggle=document.querySelector('#analytics-toggle');
  let optOut=false, collectionController=null;
  try{optOut=localStorage.getItem(KEY)==='1';}catch{/* Respect browser privacy settings even without storage. */}
  function updateToggle(){
    const browserDisabled=privacyDisabled(navigator,false);
    toggle.textContent=browserDisabled?'浏览器已关闭访问记录':optOut?'允许后续统计':'停止后续统计';
    toggle.disabled=browserDisabled;
    toggle.setAttribute('aria-pressed',String(optOut||browserDisabled));
  }
  updateToggle();
  toggle.addEventListener('click',()=>{
    optOut=!optOut;
    if(optOut)collectionController?.abort();
    let persisted=true;
    try{localStorage.setItem(KEY,optOut?'1':'0');}catch{persisted=false;}
    updateToggle();
    status.textContent=optOut?(persisted?'后续访问不再记录':'本次已停止；浏览器无法保存设置'):'下次访问开始记录';
  });
  try{
    const version=document.querySelector('meta[name="site-version"]')?.content||'';
    const configResponse=await fetch('./analytics-config.json?v='+encodeURIComponent(version));
    if(!configResponse.ok)throw new Error('Missing analytics configuration');
    const settings=await configResponse.json();
    const endpoint=new URL(settings.endpoint);
    if(endpoint.protocol!=='https:')throw new Error('Invalid endpoint');
    const admin=document.querySelector('#analytics-admin');admin.href=endpoint.origin+'/';admin.hidden=false;
    if(!isProductionLocation(location,settings)){status.textContent='本地预览不计入访问统计';return;}
    const disabled=privacyDisabled(navigator,optOut);
    let stats;
    if(disabled){stats=await readStats(endpoint.origin);status.textContent='已关闭访问记录';}
    else{
      collectionController=new AbortController();
      try{stats=await recordVisit(endpoint.origin,new URLSearchParams(location.search).get('view'),{signal:collectionController.signal});status.textContent=optOut?'后续访问不再记录':'从统计启用后累计';}
      catch{stats=await readStats(endpoint.origin);status.textContent=optOut?'后续访问不再记录':'本次记录未成功，展示已有统计';}
    }
    for(const key of ['total','today','todayIps'])document.querySelector('[data-visit-count="'+key+'"]').textContent=stats[key].toLocaleString('zh-CN');
  }catch{status.textContent='暂时无法读取统计';}
}
if(typeof document!=='undefined')void startAnalytics();
