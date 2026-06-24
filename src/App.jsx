import { useState, useEffect, useRef, Component } from "react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { Home, Users, FileText, MapPin, BarChart2, Settings, Bell, LogOut, ChevronRight, ChevronDown, ChevronLeft, Search, TrendingUp, Phone, Target, CheckCircle, XCircle, Clock, DollarSign, Eye, EyeOff, Menu, X, Award, Filter, Download, Plus, ArrowUpRight, ArrowDownRight, Activity, Shield, UserCheck, AlertTriangle, Building2, Map, Wallet, Calendar, Layers, Star, Zap, Globe, RefreshCw, Lock, User, Building, Edit2, Trash2, Save, Send, ChevronUp, Wifi, WifiOff, Database, TrendingDown, LogIn, Copy } from "lucide-react";

/* ─── DESIGN TOKENS ─────────────────────────────────────────────────────── */
const C = {
  navy:"#0D2B4E", navyMed:"#1B3F7E", navyLight:"#2554A3",
  teal:"#0BC5A9", tealBg:"#E0F5F3", tealDark:"#089B85",
  bg:"#F4F6FB", white:"#FFFFFF", text:"#1C2B3A",
  muted:"#6B7D93", border:"#DDE5EE", borderLight:"#EEF2F8",
  success:"#22C990", successBg:"#E5FAF3",
  warning:"#F5A623", warningBg:"#FEF3E2",
  danger:"#E84040", dangerBg:"#FDE8E8",
  info:"#5B6EF5", infoBg:"#EEF2FF",
  purple:"#8B5CF6", purpleBg:"#EDE9FF",
};
const F = { xs:10, sm:11, base:13, md:14, lg:16, xl:18, xl2:22, xl3:28, xl4:36 };
const R = { sm:6, md:10, lg:14, xl:20, full:99 };

/* ─── ERROR BOUNDARY ─────────────────────────────────────────────────────────
   Catches render-time exceptions anywhere in the tree and shows a recoverable
   fallback instead of a blank white screen / raw minified React error. This
   does not require a backend — it's pure client-side resilience. */
/* ── Error reporting (3.4 Monitoring) ────────────────────────────────────────
   Sends structured crash reports to a configurable endpoint.
   Supports two modes:
   • window.SENTRY_DSN set:  Reports to Sentry via the Sentry Loader Script.
     Add to index.html:  <script src="https://browser.sentry-cdn.com/..."></script>
     See: https://docs.sentry.io/platforms/javascript/install/loader/
   • window.SUNAV_API_URL set:  Posts to the backend's /api/errors endpoint
     (not yet implemented — falls back to structured console output).
   In both cases a structured payload is produced and logged.
   ─────────────────────────────────────────────────────────────────────────── */
function _reportError(error,info){
  const payload={
    ts:  new Date().toISOString(),
    msg: error?.message||String(error),
    stack: error?.stack?.slice(0,1200),
    component: info?.componentStack?.split("\n")[1]?.trim(),
    url:  typeof window!=="undefined"?window.location.href:undefined,
    ua:   typeof navigator!=="undefined"?navigator.userAgent:undefined,
  };
  // 1. Sentry (if Sentry Loader Script added to index.html)
  if(typeof window!=="undefined"&&window.Sentry&&window.Sentry.captureException){
    window.Sentry.captureException(error,{extra:payload});
    return;
  }
  // 2. Structured fallback — visible in production log aggregators
  console.error("[ErrorBoundary] Application crash",JSON.stringify(payload));
}

class ErrorBoundary extends Component{
  constructor(props){super(props);this.state={hasError:false,error:null};}
  static getDerivedStateFromError(error){return{hasError:true,error};}
  componentDidCatch(error,info){
    _reportError(error,info);
  }
  render(){
    if(this.state.hasError){
      return(
        <div style={{minHeight:"100vh",background:"#F4F6FB",display:"flex",
          alignItems:"center",justifyContent:"center",padding:24,
          fontFamily:"-apple-system,BlinkMacSystemFont,system-ui,sans-serif"}}>
          <div style={{maxWidth:440,background:"white",borderRadius:20,padding:"32px 28px",
            textAlign:"center",boxShadow:"0 12px 40px rgba(0,0,0,0.12)"}}>
            <div style={{width:56,height:56,borderRadius:99,background:"#FDE8E8",
              display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px"}}>
              <span style={{fontSize:26}}>⚠️</span>
            </div>
            <div style={{fontSize:18,fontWeight:800,color:"#1C2B3A",marginBottom:6}}>
              Something went wrong
            </div>
            <div style={{fontSize:13,color:"#6B7D93",lineHeight:1.6,marginBottom:20}}>
              SunaV Pulse hit an unexpected error and stopped to avoid showing broken data.
              Your demo data for this session may be reset. This has been logged for review.
            </div>
            {this.state.error&&(
              <div style={{background:"#F4F6FB",borderRadius:10,padding:"10px 12px",
                marginBottom:20,textAlign:"left",fontSize:11,color:"#6B7D93",
                fontFamily:"monospace",wordBreak:"break-word",maxHeight:80,overflow:"auto"}}>
                {String(this.state.error.message||this.state.error)}
              </div>
            )}
            <button onClick={()=>window.location.reload()} style={{padding:"10px 24px",
              borderRadius:99,border:"none",background:"#0D2B4E",color:"white",
              fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
              Reload Application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ─── DEMO DATA ──────────────────────────────────────────────────────────── */
const DEMO_USERS = {
  "rep.demo":   { id:"U001", name:"Ramesh Sharma",  initials:"RS", role:"rep",              roleLabel:"Medical Representative", territory:"Pune Central",     employeeId:"MR-2401", teamSize:null,  email:"ramesh.sharma@sunavpulse.com" },
  "asm.demo":   { id:"U002", name:"Suresh Patel",   initials:"SP", role:"area_manager",     roleLabel:"Area Sales Manager",     territory:"Pune Area",         employeeId:"AM-1201", teamSize:12,    email:"suresh.patel@sunavpulse.com" },
  "rsm.demo":   { id:"U003", name:"Kavitha Reddy",  initials:"KR", role:"regional_manager", roleLabel:"Regional Sales Manager", territory:"Maharashtra Region", employeeId:"RM-0401", teamSize:48,    email:"kavitha.reddy@sunavpulse.com" },
  "admin.demo": { id:"U004", name:"Dev Kumar",      initials:"DK", role:"admin",            roleLabel:"System Administrator",   territory:"All Territories",   employeeId:"AD-0001", teamSize:1247,  email:"dev.kumar@sunavpulse.com" },
};

const VISIT_TREND = [
  {week:"Wk 1",actual:28,target:32},{week:"Wk 2",actual:35,target:32},
  {week:"Wk 3",actual:30,target:32},{week:"Wk 4",actual:38,target:32},
  {week:"Wk 5",actual:32,target:32},{week:"Wk 6",actual:40,target:32},
  {week:"Wk 7",actual:36,target:32},{week:"Wk 8",actual:38,target:32},
  {week:"Wk 9",actual:42,target:32},{week:"Wk 10",actual:35,target:32},
  {week:"Wk 11",actual:44,target:32},{week:"Wk 12",actual:39,target:32},
];
const PRODUCT_MIX = [
  {product:"CardioMax",rx:18,target:20},{product:"RespiClear",rx:11,target:15},
  {product:"GlucoBalance",rx:7,target:10},{product:"NeuroCalm XR",rx:2,target:8},
];
const TERRITORY_PERF = [
  {area:"Pune Central",achievement:108,calls:342,reps:6},
  {area:"Pune East",achievement:82,calls:261,reps:5},
  {area:"Nashik",achievement:96,calls:318,reps:7},
  {area:"Aurangabad",achievement:91,calls:287,reps:6},
];
const TEAM_PERF = [
  {name:"Priya Mehta",calls:168,target:160,achievement:105,status:"above"},
  {name:"Anand Joshi",calls:155,target:160,achievement:97,status:"on"},
  {name:"Ramesh Sharma",calls:147,target:160,achievement:92,status:"on"},
  {name:"Sunita Rao",calls:138,target:160,achievement:86,status:"below"},
  {name:"Vikram Nair",calls:118,target:160,achievement:74,status:"below"},
];
const ADMIN_ACTIVITY = [
  {day:"Mon",logins:420,reports:312},{day:"Tue",logins:468,reports:356},
  {day:"Wed",logins:445,reports:338},{day:"Thu",logins:512,reports:402},
  {day:"Fri",logins:498,reports:381},{day:"Sat",logins:162,reports:89},
  {day:"Sun",logins:54,reports:12},
];
const NOTIFICATIONS = [
  {id:1,type:"approval",icon:CheckCircle,color:C.teal,bg:C.tealBg,title:"Call report approved","body":"Dr. Nguyễn Thị Lan — Approved by Area Manager","time":"5 min ago",unread:true},
  {id:2,type:"warning",icon:AlertTriangle,color:C.warning,bg:C.warningBg,title:"2 reports pending sync","body":"You have 2 offline reports waiting to sync","time":"22 min ago",unread:true},
  {id:3,type:"info",icon:Award,color:C.info,bg:C.infoBg,title:"You're ranked #2 this month","body":"92% quota attainment · 6% behind #1 Thu Nguyen","time":"2 hrs ago",unread:false},
  {id:4,type:"approval",icon:Clock,color:C.warning,bg:C.warningBg,title:"Expense claim pending","body":"₹4,200 TA claim — awaiting Area Manager review","time":"1 day ago",unread:false},
];

const PHASE_LABELS = {1:"Live",2:"Phase 2",3:"Phase 3",4:"Phase 4",5:"Phase 5",6:"Phase 6"};
const NAV_GROUPS = [
  { label:"Field Operations", items:[
    {id:"dashboard",label:"Dashboard",icon:Home,phase:1,roles:["rep","area_manager","regional_manager","admin"]},
    {id:"doctors",label:"Doctor Management",icon:Users,phase:1,roles:["rep","area_manager","regional_manager","admin"]},
    {id:"calls",label:"Call Reports",icon:FileText,phase:1,roles:["rep","area_manager","regional_manager","admin"]},
    {id:"chemist",label:"Chemist Reports",icon:Building,phase:1,roles:["rep","area_manager","regional_manager"]},
    {id:"hospital",label:"Hospital Reports",icon:Building2,phase:1,roles:["rep","area_manager","regional_manager"]},
    {id:"products",label:"Product Detailing",icon:Layers,phase:1,roles:["rep","area_manager","regional_manager","admin"]},
    {id:"gps",label:"GPS Verification",icon:MapPin,phase:1,roles:["rep","area_manager","regional_manager","admin"]},
    {id:"routeplan",label:"Route Planning",icon:Map,phase:1,roles:["rep","area_manager","regional_manager","admin"]},
  ]},
  { label:"Management", items:[
    {id:"expenses",label:"Expense Claims",icon:Wallet,phase:1,roles:["rep","area_manager","regional_manager"]},
    {id:"leave",label:"Leave Management",icon:Calendar,phase:1,roles:["rep","area_manager","regional_manager","admin"]},
    {id:"approvals",label:"Approvals",icon:CheckCircle,phase:1,roles:["area_manager","regional_manager","admin"]},
    {id:"targets",label:"Target Tracking",icon:Target,phase:1,roles:["rep","area_manager","regional_manager","admin"]},
  ]},
  { label:"Analytics", items:[
    {id:"kpi",label:"KPI Dashboard",icon:BarChart2,phase:1,roles:["rep","area_manager","regional_manager","admin"]},
    {id:"territory",label:"Territory Mgmt",icon:Map,phase:1,roles:["regional_manager","admin"]},
  ]},
  { label:"Administration", items:[
    {id:"users",label:"User Management",icon:UserCheck,phase:1,roles:["admin"]},
    {id:"audit",label:"Audit Logs",icon:Shield,phase:1,roles:["regional_manager","admin"]},
    {id:"config",label:"System Config",icon:Settings,phase:1,roles:["admin"]},
  ]},
];

/* ─── PRIMITIVES ─────────────────────────────────────────────────────────── */
const Badge = ({children,type="info",small=false})=>{
  const m={info:{bg:C.infoBg,c:C.info},success:{bg:C.successBg,c:C.tealDark},
    warn:{bg:C.warningBg,c:C.warning},danger:{bg:C.dangerBg,c:C.danger},
    navy:{bg:C.navyMed,c:"white"},muted:{bg:C.borderLight,c:C.muted}};
  const s=m[type]||m.info;
  return <span style={{display:"inline-block",padding:small?"1px 6px":"2px 9px",borderRadius:R.full,
    fontSize:small?F.xs:F.sm,fontWeight:700,background:s.bg,color:s.c,whiteSpace:"nowrap"}}>{children}</span>;
};

const Btn = ({children,variant="primary",onClick,icon:Icon,disabled,small,style:sx={}})=>{
  const m={primary:{bg:C.teal,c:"white",bdr:"none"},
    danger:{bg:C.danger,c:"white",bdr:"none"},
    secondary:{bg:C.bg,c:C.text,bdr:`1px solid ${C.border}`},
    ghost:{bg:"transparent",c:C.teal,bdr:"none"},
    navy:{bg:C.navy,c:"white",bdr:"none"}};
  const s=m[variant]||m.primary;
  return(
    <button onClick={onClick} disabled={disabled} style={{
      display:"flex",alignItems:"center",gap:6,padding:small?"8px 13px":"11px 18px",
      borderRadius:R.lg,border:s.bdr,background:disabled?C.border:s.bg,
      color:disabled?C.muted:s.c,fontSize:F.base,fontWeight:700,cursor:disabled?"not-allowed":"pointer",
      fontFamily:"inherit",whiteSpace:"nowrap",minHeight:small?32:44,...sx}}>
      {Icon&&<Icon size={small?14:16}/>}{children}
    </button>
  );
};

const MetricCard = ({label,value,trend,trendDir="up",icon:Icon,iconColor=C.teal,sub,onClick})=>{
  const up=trendDir==="up";
  return(
    <div onClick={onClick} style={{background:C.white,borderRadius:R.xl,padding:"18px 20px",
      border:`1px solid ${C.border}`,cursor:onClick?"pointer":"default",
      transition:"box-shadow 0.15s",flex:1,minWidth:160}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
        <span style={{fontSize:F.sm,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:"0.6px"}}>{label}</span>
        <div style={{width:36,height:36,borderRadius:R.lg,background:iconColor+"18",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <Icon size={18} color={iconColor}/>
        </div>
      </div>
      <div style={{fontSize:F.xl3,fontWeight:800,color:C.text,lineHeight:1,marginBottom:6}}>{value}</div>
      {trend&&(
        <div style={{display:"flex",alignItems:"center",gap:4}}>
          {up?<ArrowUpRight size={14} color={C.success}/>:<ArrowDownRight size={14} color={C.danger}/>}
          <span style={{fontSize:F.sm,fontWeight:700,color:up?C.success:C.danger}}>{trend}</span>
          {sub&&<span style={{fontSize:F.sm,color:C.muted}}>· {sub}</span>}
        </div>
      )}
      {!trend&&sub&&<span style={{fontSize:F.sm,color:C.muted}}>{sub}</span>}
    </div>
  );
};

const SectionCard = ({title,children,action,style:sx={}})=>(
  <div style={{background:C.white,borderRadius:R.xl,border:`1px solid ${C.border}`,
    overflow:"hidden",...sx}}>
    <div style={{padding:"16px 20px",display:"flex",justifyContent:"space-between",
      alignItems:"center",borderBottom:`1px solid ${C.border}`}}>
      <span style={{fontSize:F.md,fontWeight:700,color:C.text}}>{title}</span>
      {action}
    </div>
    <div style={{padding:"16px 20px"}}>{children}</div>
  </div>
);

/* ─── CHARTS ─────────────────────────────────────────────────────────────── */
const CT = {fontSize:11,fill:C.muted};
const CustomTooltip=({active,payload,label})=>{
  if(!active||!payload?.length) return null;
  return(
    <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:R.lg,
      padding:"10px 14px",boxShadow:"0 4px 16px rgba(0,0,0,0.1)"}}>
      <div style={{fontSize:F.sm,fontWeight:700,color:C.text,marginBottom:6}}>{label}</div>
      {payload.map((p,i)=>(
        <div key={i} style={{display:"flex",gap:8,alignItems:"center",fontSize:F.sm}}>
          <div style={{width:8,height:8,borderRadius:99,background:p.color}}/>
          <span style={{color:C.muted}}>{p.name}:</span>
          <span style={{fontWeight:700,color:C.text}}>{p.value}</span>
        </div>
      ))}
    </div>
  );
};

const VisitTrendChart=()=>(
  <ResponsiveContainer width="100%" height={220}>
    <AreaChart data={VISIT_TREND} margin={{top:5,right:10,left:-20,bottom:0}}>
      <defs>
        <linearGradient id="gActual" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor={C.teal} stopOpacity={0.18}/>
          <stop offset="95%" stopColor={C.teal} stopOpacity={0}/>
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false}/>
      <XAxis dataKey="week" tick={CT} axisLine={false} tickLine={false}/>
      <YAxis tick={CT} axisLine={false} tickLine={false}/>
      <Tooltip content={<CustomTooltip/>}/>
      <Area type="monotone" dataKey="target" stroke={C.border} strokeWidth={2}
        fill="none" strokeDasharray="4 4" name="Target"/>
      <Area type="monotone" dataKey="actual" stroke={C.teal} strokeWidth={2.5}
        fill="url(#gActual)" name="Actual Calls"/>
    </AreaChart>
  </ResponsiveContainer>
);

const ProductMixChart=()=>(
  <ResponsiveContainer width="100%" height={220}>
    <BarChart data={PRODUCT_MIX} margin={{top:5,right:10,left:-20,bottom:0}} barGap={4}>
      <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false}/>
      <XAxis dataKey="product" tick={{...CT,fontSize:10}} axisLine={false} tickLine={false}/>
      <YAxis tick={CT} axisLine={false} tickLine={false}/>
      <Tooltip content={<CustomTooltip/>}/>
      <Bar dataKey="target" fill={C.border} radius={[4,4,0,0]} name="Target"/>
      <Bar dataKey="rx" fill={C.teal} radius={[4,4,0,0]} name="Actual Rx"/>
    </BarChart>
  </ResponsiveContainer>
);

const TerritoryChart=()=>(
  <ResponsiveContainer width="100%" height={220}>
    <BarChart data={TERRITORY_PERF} layout="vertical" margin={{top:0,right:20,left:10,bottom:0}}>
      <CartesianGrid strokeDasharray="3 3" stroke={C.border} horizontal={false}/>
      <XAxis type="number" tick={CT} axisLine={false} tickLine={false} domain={[0,130]}/>
      <YAxis type="category" dataKey="area" tick={{...CT,fontSize:11}} axisLine={false} tickLine={false} width={90}/>
      <Tooltip content={<CustomTooltip/>}/>
      <Bar dataKey="achievement" radius={[0,4,4,0]} name="Achievement %" maxBarSize={22}
        fill={C.teal}>
        {TERRITORY_PERF.map((e,i)=>(
          <Cell key={i} fill={e.achievement>=100?C.success:e.achievement>=85?C.teal:e.achievement>=75?C.warning:C.danger}/>
        ))}
      </Bar>
    </BarChart>
  </ResponsiveContainer>
);

const AdminActivityChart=()=>(
  <ResponsiveContainer width="100%" height={220}>
    <BarChart data={ADMIN_ACTIVITY} margin={{top:5,right:10,left:-20,bottom:0}} barGap={4}>
      <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false}/>
      <XAxis dataKey="day" tick={CT} axisLine={false} tickLine={false}/>
      <YAxis tick={CT} axisLine={false} tickLine={false}/>
      <Tooltip content={<CustomTooltip/>}/>
      <Bar dataKey="logins" fill={C.navyMed} radius={[4,4,0,0]} name="Logins" maxBarSize={24}/>
      <Bar dataKey="reports" fill={C.teal} radius={[4,4,0,0]} name="Reports Filed" maxBarSize={24}/>
    </BarChart>
  </ResponsiveContainer>
);

/* ─── LOGIN SCREEN ───────────────────────────────────────────────────────── */

/* ═══════════════════════════════════════════════════
   PHASE 2 — DATA: DOCTORS · PRODUCTS · CALL REPORTS
═══════════════════════════════════════════════════ */
const DOCTORS_DB_INIT = [
  {id:"D001",name:"Dr. Nguyễn Thị Lan",spec:"Cardiologist",hosp:"City General Hospital",tier:"A",score:94,lastVisit:"2 days ago",rxMTD:28,phone:"+84 28 3822 1234",email:"lan.nguyen@cityhospital.vn",ini:"NL",col:"#5B6EF5",addr:"123 Lê Lợi, District 1, HCMC",notes:"Strong KOL. Attends major cardiology conferences. Very data-driven.",hist:[22,25,28],lat:10.7769,lng:106.7009,active:true},
  {id:"D002",name:"Dr. Trần Minh Khoa",spec:"Internist",hosp:"St. Mary's Medical",tier:"B",score:72,lastVisit:"1 week ago",rxMTD:15,phone:"+84 28 3918 5566",email:"khoa.tran@stmarys.vn",ini:"MK",col:"#E05BB8",addr:"45 Nguyễn Huệ, District 1, HCMC",notes:"Price-sensitive. Prefers 6-month outcome data before switching.",hist:[12,14,15],lat:10.7815,lng:106.6954,active:true},
  {id:"D003",name:"Dr. Lê Văn Hùng",spec:"Pulmonologist",hosp:"Central Hospital",tier:"A",score:88,lastVisit:"Today",rxMTD:22,phone:"+84 28 3829 9900",email:"hung.le@centralhospital.vn",ini:"VH",col:"#F5A623",addr:"201 Đinh Tiên Hoàng, Bình Thạnh, HCMC",notes:"Early adopter. Champions new treatments. Influential in dept.",hist:[18,20,22],lat:10.7851,lng:106.7102,active:true},
  {id:"D004",name:"Dr. Phạm Thị Hoa",spec:"Endocrinologist",hosp:"University Medical",tier:"B",score:65,lastVisit:"2 weeks ago",rxMTD:10,phone:"+84 28 3855 7788",email:"hoa.pham@unimed.edu.vn",ini:"TH",col:"#0BC5A9",addr:"215 Hồng Bàng, District 5, HCMC",notes:"New prescriber. Large T2DM patient base — high potential.",hist:[7,8,10],lat:10.7698,lng:106.6982,active:true},
  {id:"D005",name:"Dr. Hoàng Đức Nam",spec:"Neurologist",hosp:"Private Clinic",tier:"C",score:41,lastVisit:"1 month ago",rxMTD:4,phone:"+84 28 3866 1122",email:"nam.hoang@neuroclinic.vn",ini:"ĐN",col:"#E84040",addr:"78 Trần Phú, District 5, HCMC",notes:"Skeptical of new brands. Needs long-term trust building.",hist:[3,4,4],lat:10.7642,lng:106.6891,active:true},
  {id:"D006",name:"Dr. Vũ Thị Mai",spec:"Cardiologist",hosp:"City General Hospital",tier:"A",score:91,lastVisit:"5 days ago",rxMTD:31,phone:"+84 28 3822 3344",email:"mai.vu@cityhospital.vn",ini:"TM",col:"#3BB5FF",addr:"123 Lê Lợi, District 1, HCMC",notes:"Top prescriber. Dept head — influences 8 residents.",hist:[25,28,31],lat:10.7771,lng:106.7012,active:true},
  {id:"D007",name:"Dr. Ngô Thị Thu",spec:"Internist",hosp:"East Clinic",tier:"B",score:58,lastVisit:"3 days ago",rxMTD:12,phone:"+84 28 3877 4455",email:"thu.ngo@eastclinic.vn",ini:"NT",col:"#8B5CF6",addr:"88 Đinh Bộ Lĩnh, Bình Thạnh, HCMC",notes:"Growing prescriber. Interested in combination therapies.",hist:[9,11,12],lat:10.7902,lng:106.7195,active:true},
  {id:"D008",name:"Dr. Đỗ Văn Tâm",spec:"General Practitioner",hosp:"Family Health Clinic",tier:"C",score:35,lastVisit:"2 weeks ago",rxMTD:6,phone:"+84 28 3888 9900",email:"tam.do@familyhealth.vn",ini:"VT",col:"#059669",addr:"12 Cộng Hòa, Tân Bình, HCMC",notes:"High patient volume. Very price-focused.",hist:[4,5,6],lat:10.7958,lng:106.6847,active:true},
];

const PRODUCTS_DB = [
  {id:"P001",name:"CardioMax 10mg",cat:"Antihypertensive",comp:"Amlodipine Besylate 10mg",col:"#5B6EF5",s1:{v:"-18",u:"mmHg",d:"SBP Reduction"},s2:{v:"94%",u:"",d:"Response Rate 12wks"},trial:"CARDIA-III (n=1,240)",msg:"Once-daily dosing with sustained 24h BP control. Superior tolerability vs ACEi — 2.1% discontinuation rate.",slides:4,rxMTD:18,approved:true},
  {id:"P002",name:"RespiClear 5mg",cat:"Bronchodilator",comp:"Salbutamol Sulfate 5mg",col:"#0BC5A9",s1:{v:"82%",u:"",d:"Bronchodilation Rate"},s2:{v:"+1.4L",u:"",d:"FEV1 Improvement"},trial:"BREATH-II (n=860)",msg:"Fast-acting relief within 5 minutes. 12-hour sustained bronchodilation with minimal side effects.",slides:4,rxMTD:11,approved:true},
  {id:"P003",name:"GlucoBalance 50mg",cat:"Antidiabetic",comp:"Metformin HCl 500mg + Glipizide 5mg",col:"#F5A623",s1:{v:"-2.1%",u:"",d:"HbA1c Reduction"},s2:{v:"76%",u:"",d:"Target Achievement"},trial:"GLUCON-IV (n=1,480)",msg:"Dual-action glycaemic control. Weight-neutral profile ideal for overweight T2DM patients.",slides:4,rxMTD:7,approved:true},
  {id:"P004",name:"NeuroCalm XR",cat:"Neuropathic Agent",comp:"Pregabalin Extended Release 150mg",col:"#E84040",s1:{v:"68%",u:"",d:"Pain Reduction ≥50%"},s2:{v:"4.2pts",u:"",d:"NRS Improvement"},trial:"NEURO-VI (n=920)",msg:"Extended release for consistent plasma levels. Once-daily convenience improves patient adherence.",slides:4,rxMTD:2,approved:true},
];

const REPORTS_INIT = [
  {id:"CR001",docId:"D001",docName:"Dr. Nguyễn Thị Lan",spec:"Cardiologist",hosp:"City General",date:"2026-06-17",time:"08:15 AM",dur:20,status:"approved",prods:["P001"],samples:{P001:2},tags:["Will prescribe to 3 Px"],nextAction:"Send renal outcomes study",notes:"Receptive to CardioMax. Interested in renal protection data.",approver:"Suresh Patel",approvedAt:"10:30 AM"},
  {id:"CR002",docId:"D002",docName:"Dr. Trần Minh Khoa",spec:"Internist",hosp:"St. Mary's Medical",date:"2026-06-17",time:"09:45 AM",dur:15,status:"approved",prods:["P002"],samples:{P002:1},tags:["Needs more data"],nextAction:"Follow up in 2 weeks",notes:"Good discussion. Will trial RespiClear with COPD patients next week.",approver:"Suresh Patel",approvedAt:"11:00 AM"},
  {id:"CR003",docId:"D003",docName:"Dr. Lê Văn Hùng",spec:"Pulmonologist",hosp:"Central Hospital",date:"2026-06-17",time:"10:30 AM",dur:25,status:"approved",prods:["P002"],samples:{P002:3},tags:["Strong advocate"],nextAction:"Confirm symposium invite",notes:"Placed order for 20 units. Invited to July symposium.",approver:"Suresh Patel",approvedAt:"12:00 PM"},
  {id:"CR004",docId:"D004",docName:"Dr. Phạm Thị Hoa",spec:"Endocrinologist",hosp:"University Medical",date:"2026-06-17",time:"12:00 PM",dur:20,status:"submitted",prods:["P003"],samples:{P003:2},tags:["Needs more data","Will trial 3 Px"],nextAction:"Send CARDIA-II study PDF",notes:"Interested in GlucoBalance for T2DM patients.",approver:null,approvedAt:null},
  {id:"CR005",docId:"D007",docName:"Dr. Ngô Thị Thu",spec:"Internist",hosp:"East Clinic",date:"2026-06-16",time:"02:30 PM",dur:18,status:"rejected",prods:["P001","P003"],samples:{P001:1,P003:1},tags:["Price concern"],nextAction:"Revisit next month",notes:"Price was main objection.",approver:"Suresh Patel",approvedAt:"05:00 PM",rejReason:"GPS coordinates do not match registered clinic address. Please verify visit location."},
];

const SLIDE_CONTENT = {
  0:[
    {title:"Efficacy Overview",body:"Landmark CARDIA-III data demonstrating superior efficacy across 1,240 patients over 52 weeks."},
    {title:"Safety Profile",body:"Best-in-class tolerability: 2.1% discontinuation vs 8.4% ACEi comparator (p<0.001)."},
    {title:"Dosing Convenience",body:"Once-daily tablet. No food restrictions. Consistent absorption profile regardless of timing."},
    {title:"Real-World Evidence",body:"Post-marketing data from 45,000 patients confirms clinical trial findings in routine practice."},
  ],
  1:[
    {title:"Mechanism of Action",body:"Selective beta-2 adrenergic agonist. Rapid bronchodilation via smooth muscle relaxation."},
    {title:"Onset & Duration",body:"Onset: 3-5 minutes. Peak effect: 30-60 minutes. Duration: 12 hours."},
    {title:"Safety Data",body:"BREATH-II: No clinically significant cardiovascular effects at therapeutic doses."},
    {title:"Patient Selection",body:"Ideal for COPD, exercise-induced bronchospasm, and acute asthma relief."},
  ],
  2:[
    {title:"Dual Mechanism",body:"Metformin reduces hepatic glucose output; Glipizide stimulates insulin secretion."},
    {title:"HbA1c Reduction",body:"Mean -2.1% HbA1c reduction at 24 weeks vs -0.9% monotherapy (GLUCON-IV)."},
    {title:"Weight Profile",body:"Weight-neutral: 0.2kg mean change at 52 weeks. Significant advantage vs sulfonylurea mono."},
    {title:"Cardiovascular Safety",body:"CVOT-compliant trial design. No increased MACE risk confirmed."},
  ],
  3:[
    {title:"Extended Release Technology",body:"Osmotic pump delivery ensures steady plasma levels over 24 hours — no peaks or troughs."},
    {title:"Pain Reduction",body:"68% of patients achieved ≥50% pain reduction at 12 weeks (NEURO-VI)."},
    {title:"Sleep & QoL",body:"Secondary endpoints: significant improvement in sleep quality and interference with daily activities."},
    {title:"Titration Guide",body:"Start 75mg once daily. Titrate to 150mg after 1 week based on tolerability."},
  ],
};

/* ═══════════════════════════════════════════════════
   ROUTE PLANNING DATA
═══════════════════════════════════════════════════ */
const RP_STATUS_CFG={
  draft:       {label:"Draft",           bg:"#F4F6FB",   c:"#6B7D93"},
  submitted:   {label:"Awaiting RSM",    bg:"#FEF3E2",   c:"#C47D0D"},
  rsm_approved:{label:"Awaiting ASM",    bg:"#EEF2FF",   c:"#5B6EF5"},
  asm_approved:{label:"Fully Approved",  bg:"#E5FAF3",   c:"#089B85"},
  rsm_rejected:{label:"RSM Rejected",    bg:"#FDE8E8",   c:"#C03030"},
  asm_rejected:{label:"ASM Rejected",    bg:"#FDE8E8",   c:"#C03030"},
};

const ROUTE_PLANS_INIT=[
  {id:"RP001",title:"Week 3 — Pune Central Circuit",repId:"U001",repName:"Ramesh Sharma",
   territory:"Pune Central",planDate:"2026-06-22",estimatedKm:42,
   notes:"Focus on Tier A doctors. Carry 3 samples each product.",
   stops:[
     {sid:"S1",order:1,time:"08:30",docId:"D001",docName:"Dr. Nguyễn Thị Lan",spec:"Cardiologist",hosp:"City General Hospital",products:["P001"],purpose:"CardioMax follow-up — check prescription intent"},
     {sid:"S2",order:2,time:"10:00",docId:"D003",docName:"Dr. Lê Văn Hùng",spec:"Pulmonologist",hosp:"Central Hospital",products:["P002"],purpose:"Sample drop + July symposium confirmation"},
     {sid:"S3",order:3,time:"11:30",docId:"D006",docName:"Dr. Vũ Thị Mai",spec:"Cardiologist",hosp:"City General Hospital",products:["P001","P003"],purpose:"New Rx push — GlucoBalance intro"},
     {sid:"S4",order:4,time:"14:00",docId:"D004",docName:"Dr. Phạm Thị Hoa",spec:"Endocrinologist",hosp:"University Medical",products:["P003"],purpose:"First call — T2DM patient discussion"},
   ],
   status:"rsm_approved",submittedAt:"2026-06-18",
   rsmNote:"Well-structured route. Prioritisation of A-tier doctors looks good. Approved.",
   asmNote:"",
   rsmApprovedBy:"Kavitha Reddy",rsmApprovedAt:"2026-06-18 02:30 PM",
   asmApprovedBy:null,asmApprovedAt:null},

  {id:"RP002",title:"Week 3 — East Territory Sweep",repId:"U001",repName:"Ramesh Sharma",
   territory:"Pune Central",planDate:"2026-06-23",estimatedKm:28,
   notes:"Bring competitor comparison data for Dr. Ngô. Focus on value messaging.",
   stops:[
     {sid:"S1",order:1,time:"09:00",docId:"D007",docName:"Dr. Ngô Thị Thu",spec:"Internist",hosp:"East Clinic",products:["P001"],purpose:"Re-engage after price objection"},
     {sid:"S2",order:2,time:"10:30",docId:"D008",docName:"Dr. Đỗ Văn Tâm",spec:"GP",hosp:"Family Health Clinic",products:["P003"],purpose:"GlucoBalance value messaging"},
     {sid:"S3",order:3,time:"12:00",docId:"D005",docName:"Dr. Hoàng Đức Nam",spec:"Neurologist",hosp:"Private Clinic",products:["P004"],purpose:"NeuroCalm XR first call"},
   ],
   status:"submitted",submittedAt:"2026-06-18",
   rsmNote:"",asmNote:"",
   rsmApprovedBy:null,rsmApprovedAt:null,
   asmApprovedBy:null,asmApprovedAt:null},

  {id:"RP003",title:"Mid-June Catch-Up — Tier B Focus",repId:"U001",repName:"Ramesh Sharma",
   territory:"Pune Central",planDate:"2026-06-20",estimatedKm:18,
   notes:"",
   stops:[
     {sid:"S1",order:1,time:"09:30",docId:"D002",docName:"Dr. Trần Minh Khoa",spec:"Internist",hosp:"St. Mary's Medical",products:["P002"],purpose:"COPD trial follow-up"},
     {sid:"S2",order:2,time:"11:00",docId:"D004",docName:"Dr. Phạm Thị Hoa",spec:"Endocrinologist",hosp:"University Medical",products:["P003"],purpose:"Outcome data delivery"},
   ],
   status:"asm_approved",submittedAt:"2026-06-15",
   rsmNote:"Good focus on Tier B growth. Approved.",
   asmNote:"Approved. Please log all visits same day.",
   rsmApprovedBy:"Kavitha Reddy",rsmApprovedAt:"2026-06-15 11:00 AM",
   asmApprovedBy:"Suresh Patel",asmApprovedAt:"2026-06-15 03:30 PM"},
];

/* ═══════════════════════════════════════════════════
   PHASE 2 — DOCTOR MANAGEMENT
═══════════════════════════════════════════════════ */
const TIER_COLORS = {A:{bg:"#E5FAF3",c:"#089B85"},B:{bg:"#FEF3E2",c:"#C47D0D"},C:{bg:"#FDE8E8",c:"#C03030"}};

function DoctorCard({doc,onClick,onDelete,onLogVisit}){
  const tc=TIER_COLORS[doc.tier]||TIER_COLORS.C;
  const bc=doc.score>=80?C.success:doc.score>=60?C.warning:C.danger;
  return(
    <div onClick={()=>onClick(doc)} style={{background:C.white,borderRadius:R.xl,padding:16,
      border:`1px solid ${C.border}`,cursor:"pointer",transition:"box-shadow 0.15s",position:"relative"}}>
      {onDelete&&<button onClick={e=>{e.stopPropagation();onDelete(doc);}}
        title="Remove doctor" style={{position:"absolute",top:10,right:10,
          background:C.dangerBg,border:"none",borderRadius:R.full,
          width:26,height:26,cursor:"pointer",
          display:"flex",alignItems:"center",justifyContent:"center",zIndex:1}}>
        <Trash2 size={12} color={C.danger}/>
      </button>}
      <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
        <div style={{width:46,height:46,borderRadius:R.full,background:doc.col,flexShrink:0,
          display:"flex",alignItems:"center",justifyContent:"center",color:"white",
          fontSize:F.base,fontWeight:800}}>{doc.ini}</div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:6,paddingRight:onDelete?20:0}}>
            <div style={{fontSize:F.md,fontWeight:700,color:C.text,overflow:"hidden",
              textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{doc.name}</div>
            <span style={{padding:"2px 8px",borderRadius:R.full,fontSize:F.xs,fontWeight:800,
              background:tc.bg,color:tc.c,flexShrink:0}}>Tier {doc.tier}</span>
          </div>
          <div style={{fontSize:F.sm,color:C.muted,marginTop:2}}>{doc.spec} · {doc.hosp}</div>
          <div style={{display:"flex",gap:14,marginTop:10}}>
            <div>
              <div style={{fontSize:F.xs,color:C.muted,marginBottom:3}}>Engagement</div>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <div style={{width:56,height:4,background:C.border,borderRadius:99,overflow:"hidden"}}>
                  <div style={{width:doc.score+"%",height:"100%",background:bc,borderRadius:99}}/>
                </div>
                <span style={{fontSize:F.xs,fontWeight:700,color:bc}}>{doc.score}</span>
              </div>
            </div>
            <div><div style={{fontSize:F.xs,color:C.muted}}>Scripts MTD</div>
              <div style={{fontSize:F.md,fontWeight:800,color:C.text}}>{doc.rxMTD}</div></div>
            <div><div style={{fontSize:F.xs,color:C.muted}}>Last Visit</div>
              <div style={{fontSize:F.xs,fontWeight:600,color:doc.lastVisit==="Today"?C.success:C.text}}>{doc.lastVisit}</div></div>
          </div>
        </div>
      </div>
      {/* Quick actions */}
      <div style={{display:"flex",gap:6,marginTop:10,paddingTop:10,borderTop:`1px solid ${C.border}`}}
        onClick={e=>e.stopPropagation()}>
        <Btn variant="primary" icon={FileText} small style={{flex:1}}
          onClick={()=>onLogVisit&&onLogVisit(doc)}>Log Visit</Btn>
        <Btn variant="secondary" icon={Eye} small style={{flex:1}}
          onClick={()=>onClick(doc)}>View Profile</Btn>
      </div>
    </div>
  );
}

function DoctorHistChart({hist}){
  const data=[{m:"Apr",rx:hist[0]},{m:"May",rx:hist[1]},{m:"Jun",rx:hist[2]}];
  return(
    <ResponsiveContainer width="100%" height={80}>
      <BarChart data={data} margin={{top:4,right:4,left:-28,bottom:0}} barSize={22}>
        <XAxis dataKey="m" tick={{fontSize:10,fill:C.muted}} axisLine={false} tickLine={false}/>
        <Bar dataKey="rx" radius={[4,4,0,0]}>
          {data.map((_,i)=><Cell key={i} fill={i===2?C.teal:"#B8E8DF"}/>)}
        </Bar>
        <Tooltip content={({active,payload,label})=>active&&payload?.length?(<div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:8,padding:"6px 10px",fontSize:11}}>{label}: <b>{payload[0].value} Rx</b></div>):null}/>
      </BarChart>
    </ResponsiveContainer>
  );
}


/* ═══════════════════════════════════════════════════
   GPS UTILITIES — Haversine · Leaflet Loader · LiveMap
═══════════════════════════════════════════════════ */
const haversine=(lat1,lon1,lat2,lon2)=>{
  const R=6371000,rad=x=>x*Math.PI/180;
  const dLat=rad(lat2-lat1),dLon=rad(lon2-lon1);
  const a=Math.sin(dLat/2)**2+Math.cos(rad(lat1))*Math.cos(rad(lat2))*Math.sin(dLon/2)**2;
  return Math.round(R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a)));
};

function useLeaflet(){
  const [ready,setReady]=useState(()=>typeof window!=="undefined"&&!!window.L);
  useEffect(()=>{
    /* S-13: isMounted prevents setState after unmount if Leaflet loads asynchronously
             and the component has already been removed from the tree.
       S-14: integrity + crossOrigin enable SRI verification — browser refuses to execute
             the script if the hash does not match what cdnjs serves.
             Hashes sourced from https://cdnjs.com/libraries/leaflet/1.9.4 — re-verify
             before upgrading Leaflet to a new version.
       L-01: replaced console.warn with structured error state so the map renders a
             recoverable fallback instead of silently logging to the console. */
    let isMounted=true;
    if(window.L){setReady(true);return()=>{isMounted=false;};}
    const link=document.createElement("link");
    link.rel="stylesheet";
    link.href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
    link.integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
    link.crossOrigin="anonymous";
    document.head.appendChild(link);
    const script=document.createElement("script");
    script.src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
    script.integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV/XN2GqCk=";
    script.crossOrigin="anonymous";
    script.onload=()=>{if(isMounted)setReady(true);};
    script.onerror=()=>{if(isMounted)setReady(false);}; // L-01: no console.warn in production
    document.head.appendChild(script);
    return()=>{
      isMounted=false;
      /* Only remove injected nodes if Leaflet hasn't finished loading yet —
         if window.L is set, other mounted map components depend on the script. */
      if(!window.L){
        if(link.parentNode)link.parentNode.removeChild(link);
        if(script.parentNode)script.parentNode.removeChild(script);
      }
    };
  },[]);
  return ready&&window.L?window.L:null;
}

function LiveMap({userCoords,docCoords,docName,distanceM,withinRange,radius=100}){
  const mapRef=useRef(null);
  const inst=useRef(null);
  const L=useLeaflet();

  useEffect(()=>{
    if(!L||!mapRef.current)return;
    if(inst.current){inst.current.remove();inst.current=null;}
    const map=L.map(mapRef.current,{zoomControl:true,attributionControl:true,scrollWheelZoom:false});
    addTileLayer(L,map); /* 3.3 SPF: primary=OSM, fallback=CARTO on tileerror */
    const bounds=[[userCoords.lat,userCoords.lng],[docCoords.lat,docCoords.lng]];
    map.fitBounds(bounds,{padding:[48,48]});
    // User marker — teal pulse
    const uIcon=L.divIcon({
      html:`<div style="width:16px;height:16px;border-radius:50%;background:#0BC5A9;border:3px solid white;box-shadow:0 0 0 4px rgba(11,197,169,0.25),0 2px 8px rgba(0,0,0,0.25)"></div>`,
      iconSize:[16,16],iconAnchor:[8,8],className:""
    });
    L.marker([userCoords.lat,userCoords.lng],{icon:uIcon})
      .bindPopup(`<b style="color:#0BC5A9">📍 Your Location</b><br/>Accuracy: ±${userCoords.accuracy}m`)
      .addTo(map);
    // Doctor marker — navy
    const dIcon=L.divIcon({
      html:`<div style="width:20px;height:20px;border-radius:50%;background:#0D2B4E;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)"><div style="position:absolute;top:-22px;left:50%;transform:translateX(-50%);background:#0D2B4E;color:white;padding:2px 6px;border-radius:4px;font-size:10px;font-weight:700;white-space:nowrap">🏥 ${docName}</div></div>`,
      iconSize:[20,20],iconAnchor:[10,10],className:""
    });
    L.marker([docCoords.lat,docCoords.lng],{icon:dIcon})
      .bindPopup(`<b style="color:#0D2B4E">🏥 ${docName}</b>`)
      .addTo(map);
    // Distance line
    L.polyline([[userCoords.lat,userCoords.lng],[docCoords.lat,docCoords.lng]],{
      color:withinRange?"#22C990":"#E84040",weight:2.5,dashArray:"8,6",opacity:0.85
    }).addTo(map);
    // Geofence circle — radius reflects the live System Config setting
    L.circle([docCoords.lat,docCoords.lng],{
      radius:radius,color:withinRange?"#22C990":"#E84040",
      fillColor:withinRange?"#22C990":"#E84040",
      fillOpacity:0.08,weight:2,dashArray:"5,5"
    }).addTo(map).bindTooltip(`${radius}m geofence`,{permanent:false});
    inst.current=map;
    return()=>{if(inst.current){inst.current.remove();inst.current=null;}};
  },[L]);

  if(!L) return(
    <div style={{height:280,background:C.bg,borderRadius:R.lg,display:"flex",alignItems:"center",
      justifyContent:"center",flexDirection:"column",gap:8,border:`1px solid ${C.border}`}}>
      <RefreshCw size={22} color={C.muted} style={{animation:"spin 1s linear infinite"}}/>
      <span style={{fontSize:F.sm,color:C.muted}}>Loading map…</span>
    </div>
  );
  return(
    <div style={{position:"relative",borderRadius:R.lg,overflow:"hidden",
      border:`2px solid ${withinRange?C.success:C.danger}`,marginBottom:14}}>
      <div ref={mapRef} style={{height:280}}/>
      <div style={{position:"absolute",bottom:10,left:10,zIndex:1000,
        background:"white",borderRadius:R.lg,padding:"6px 12px",
        boxShadow:"0 2px 10px rgba(0,0,0,0.18)",display:"flex",gap:10,alignItems:"center",
        border:`1px solid ${withinRange?C.success:C.danger}`}}>
        <div style={{width:8,height:8,borderRadius:99,background:withinRange?C.success:C.danger}}/>
        <span style={{fontSize:F.sm,fontWeight:700,color:withinRange?C.success:C.danger}}>
          {distanceM<1000?`${distanceM}m away`:`${(distanceM/1000).toFixed(1)}km away`}
        </span>
        <span style={{fontSize:F.xs,color:C.muted}}>
          {withinRange?`· Within ${radius}m geofence ✓`:`· Outside ${radius}m geofence`}
        </span>
      </div>
    </div>
  );
}

/* DoctorField extracted as top-level component to prevent remount-on-rerender
   which caused input focus loss (cursor stopping) after each keystroke */
function DoctorField({label,k,placeholder,half,value,error,onChange}){
  return(
    <div style={{flex:half?"0 0 calc(50% - 6px)":1}}>
      <label style={{fontSize:F.xs,fontWeight:700,color:C.muted,textTransform:"uppercase",
        letterSpacing:"0.5px",display:"block",marginBottom:5}}>{label}</label>
      <input value={value} onChange={e=>onChange(k,e.target.value)} placeholder={placeholder}
        style={{width:"100%",padding:"9px 11px",
          border:`1.5px solid ${error?C.danger:C.border}`,
          borderRadius:R.md,fontSize:F.base,color:C.text,
          outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
      {error&&<div style={{fontSize:F.xs,color:C.danger,marginTop:3}}>{error}</div>}
    </div>
  );
}

function DoctorForm({doc,onSave,onClose}){
  const init={name:"",spec:"",hosp:"",tier:"C",phone:"",email:"",addr:"",notes:""};
  const [f,setF]=useState(doc?{name:doc.name,spec:doc.spec,hosp:doc.hosp,tier:doc.tier,phone:doc.phone,email:doc.email,addr:doc.addr,notes:doc.notes}:init);
  const [errs,setErrs]=useState({});
  const set=(k,v)=>setF(p=>({...p,[k]:v}));
  const validate=()=>{const e={};if(!f.name.trim())e.name="Required";if(!f.spec.trim())e.spec="Required";if(!f.hosp.trim())e.hosp="Required";return e;};
  const submit=()=>{const e=validate();if(Object.keys(e).length){setErrs(e);return;}onSave(f);};

  return(
    <div style={{maxWidth:540,margin:"0 auto"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
        <button onClick={onClose} style={{display:"flex",alignItems:"center",gap:6,
          background:"none",border:"none",cursor:"pointer",color:C.teal,
          fontSize:F.base,fontWeight:700,fontFamily:"inherit",padding:0}}>
          <ChevronLeft size={18}/>Back
        </button>
        <span style={{fontSize:F.lg,fontWeight:800,color:C.text}}>
          {doc?"Edit Doctor":"Add New Doctor"}
        </span>
      </div>
      <div style={{background:C.white,borderRadius:R.xl,border:`1px solid ${C.border}`,
        padding:22,display:"flex",flexDirection:"column",gap:14}}>
          <DoctorField label="Full Name *" k="name" placeholder="Dr. First Last" value={f.name} error={errs.name} onChange={set}/>
          <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
            <DoctorField label="Specialization *" k="spec" placeholder="e.g. Cardiologist" half value={f.spec} error={errs.spec} onChange={set}/>
            <DoctorField label="Hospital / Clinic *" k="hosp" placeholder="Hospital name" half value={f.hosp} error={errs.hosp} onChange={set}/>
          </div>
          <div>
            <label style={{fontSize:F.xs,fontWeight:700,color:C.muted,textTransform:"uppercase",
              letterSpacing:"0.5px",display:"block",marginBottom:5}}>Tier Classification</label>
            <div style={{display:"flex",gap:8}}>
              {["A","B","C"].map(t=>{const tc=TIER_COLORS[t];return(
                <button key={t} onClick={()=>set("tier",t)} style={{flex:1,padding:"9px",borderRadius:R.lg,
                  border:`2px solid ${f.tier===t?tc.c:C.border}`,background:f.tier===t?tc.bg:C.white,
                  cursor:"pointer",fontFamily:"inherit",fontSize:F.base,fontWeight:700,color:f.tier===t?tc.c:C.muted}}>
                  Tier {t}
                </button>
              );})}
            </div>
          </div>
          <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
            <DoctorField label="Phone" k="phone" placeholder="+84 28 xxxx xxxx" half value={f.phone} error={errs.phone} onChange={set}/>
            <DoctorField label="Email" k="email" placeholder="doctor@hospital.vn" half value={f.email} error={errs.email} onChange={set}/>
          </div>
          <DoctorField label="Address" k="addr" placeholder="Street address, District, City" value={f.addr} error={errs.addr} onChange={set}/>
          <div>
            <label style={{fontSize:F.xs,fontWeight:700,color:C.muted,textTransform:"uppercase",
              letterSpacing:"0.5px",display:"block",marginBottom:5}}>Rep Notes</label>
            <textarea value={f.notes} onChange={e=>set("notes",e.target.value)}
              placeholder="Notes about this doctor's preferences, objections, or key information..."
              style={{width:"100%",padding:"9px 11px",border:`1.5px solid ${C.border}`,borderRadius:R.md,
                fontSize:F.base,color:C.text,resize:"none",height:72,fontFamily:"inherit",
                outline:"none",boxSizing:"border-box"}}/>
          </div>
          <div style={{display:"flex",gap:10,paddingTop:4}}>
            <Btn variant="secondary" onClick={onClose} style={{flex:1}}>Cancel</Btn>
            <Btn variant="primary" icon={Save} onClick={submit} style={{flex:2}}>{doc?"Save Changes":"Add Doctor"}</Btn>
          </div>
      </div>
    </div>
  );
}

function DoctorProfile({doc,onBack,onLogVisit,onEdit,onDelete,onNoteSave}){
  const [notes,setNotes]=useState(doc.notes);
  const [saved,setSaved]=useState(false);
  const tc=TIER_COLORS[doc.tier]||TIER_COLORS.C;
  const bc=doc.score>=80?C.success:doc.score>=60?C.warning:C.danger;
  const saveNotes=()=>{
    setSaved(true);
    onNoteSave&&onNoteSave(doc.id,notes);
    setTimeout(()=>setSaved(false),2000);
  };
  return(
    <div>
      {/* Back header */}
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
        <button onClick={onBack} style={{display:"flex",alignItems:"center",gap:6,background:"none",
          border:"none",cursor:"pointer",color:C.teal,fontSize:F.base,fontWeight:700,fontFamily:"inherit",padding:0}}>
          <ChevronLeft size={18}/>Back to Doctors
        </button>
        <span style={{color:C.border}}>|</span>
        <span style={{fontSize:F.base,color:C.muted}}>{doc.name}</span>
        <div style={{marginLeft:"auto",display:"flex",gap:8}}>
          <Btn variant="secondary" icon={Edit2} onClick={()=>onEdit(doc)} small>Edit</Btn>
          {onDelete&&<Btn variant="danger" icon={Trash2} small onClick={()=>{if(window.confirm&&window.confirm("Remove "+doc.name+"?")){onDelete(doc);}else{onDelete(doc);}}}>Remove</Btn>}
          <Btn variant="primary" icon={CheckCircle} onClick={()=>onLogVisit(doc)} small>Log Visit</Btn>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:16}}>
        {/* Profile card */}
        <SectionCard title="Doctor Profile">
          <div style={{textAlign:"center",paddingBottom:16,borderBottom:`1px solid ${C.border}`,marginBottom:16}}>
            <div style={{width:72,height:72,borderRadius:R.full,background:doc.col,margin:"0 auto 12px",
              display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontSize:F.xl2,fontWeight:800}}>
              {doc.ini}
            </div>
            <div style={{fontSize:F.lg,fontWeight:800,color:C.text}}>{doc.name}</div>
            <div style={{fontSize:F.base,color:C.muted,marginTop:3}}>{doc.spec}</div>
            <div style={{fontSize:F.sm,color:C.muted,display:"flex",alignItems:"center",justifyContent:"center",gap:4,marginTop:3}}>
              <Building size={12}/>{doc.hosp}
            </div>
            <div style={{marginTop:10}}>
              <span style={{padding:"3px 12px",borderRadius:R.full,fontSize:F.sm,fontWeight:800,
                background:tc.bg,color:tc.c}}>Tier {doc.tier} Doctor</span>
            </div>
            <div style={{marginTop:14,textAlign:"left"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                <span style={{fontSize:F.sm,color:C.muted}}>Engagement Score</span>
                <span style={{fontSize:F.sm,fontWeight:700,color:bc}}>{doc.score}/100</span>
              </div>
              <div style={{background:C.border,borderRadius:99,height:7,overflow:"hidden"}}>
                <div style={{width:doc.score+"%",height:"100%",background:bc,borderRadius:99}}/>
              </div>
            </div>
          </div>
          <div style={{display:"flex",gap:8,marginBottom:16}}>
            <button style={{flex:1,padding:"10px 6px",borderRadius:R.md,border:`1px solid ${C.border}`,
              background:C.bg,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
              <Phone size={17} color={C.teal}/><span style={{fontSize:F.xs,fontWeight:600,color:C.text}}>Call</span>
            </button>
            <button style={{flex:1,padding:"10px 6px",borderRadius:R.md,border:`1px solid ${C.border}`,
              background:C.bg,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
              <Send size={17} color={C.navyMed}/><span style={{fontSize:F.xs,fontWeight:600,color:C.text}}>Email</span>
            </button>
            <button style={{flex:1,padding:"10px 6px",borderRadius:R.md,border:`1px solid ${C.border}`,
              background:C.bg,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
              <Calendar size={17} color={C.info}/><span style={{fontSize:F.xs,fontWeight:600,color:C.text}}>Schedule</span>
            </button>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {[["Phone",doc.phone,Phone],["Email",doc.email,Send],["Address",doc.addr,MapPin]].map(([l,v,Icon])=>(
              <div key={l} style={{display:"flex",gap:8,alignItems:"flex-start"}}>
                <Icon size={14} color={C.muted} style={{marginTop:2,flexShrink:0}}/>
                <div><div style={{fontSize:F.xs,color:C.muted}}>{l}</div>
                  <div style={{fontSize:F.sm,color:C.text,marginTop:1}}>{v}</div></div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Right column */}
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <SectionCard title="Prescription History (Rx/month)"
            action={<div style={{display:"flex",gap:14,fontSize:F.xs,color:C.muted}}>
              {["Apr","May","Jun"].map((m,i)=><span key={m}>{m}: <b style={{color:C.text}}>{doc.hist[i]}</b></span>)}
            </div>}>
            <DoctorHistChart hist={doc.hist}/>
            <div style={{display:"flex",gap:16,marginTop:10}}>
              <MetricCard label="Scripts MTD" value={doc.rxMTD} icon={TrendingUp} iconColor={C.teal} sub="prescriptions this month"/>
              <MetricCard label="Last Visit" value={doc.lastVisit} icon={Clock} iconColor={C.navyMed}/>
            </div>
          </SectionCard>
          <SectionCard title="Rep Notes"
            action={saved?<Badge type="success">Saved ✓</Badge>:null}>
            <textarea value={notes} onChange={e=>setNotes(e.target.value)}
              style={{width:"100%",padding:"10px",border:`1.5px solid ${C.border}`,borderRadius:R.md,
                fontSize:F.base,color:C.text,resize:"none",height:90,fontFamily:"inherit",
                outline:"none",boxSizing:"border-box",lineHeight:1.5}}/>
            <Btn variant="primary" icon={Save} onClick={saveNotes} style={{marginTop:10,width:"100%"}}>Save Notes</Btn>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

function DoctorManagement({user,onLogVisitFor}){
  const [docs,setDocs]=useState(DOCTORS_DB_INIT);
  const [view,setView]=useState("list");
  const [sel,setSel]=useState(null);
  const [search,setSearch]=useState("");
  const [tierF,setTierF]=useState("all");
  const [editDoc,setEditDoc]=useState(null);
  const [formFrom,setFormFrom]=useState("list");

  const norm=s=>s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/đ/g,"d");
  const filtered=docs.filter(d=>{
    const q=norm(search);
    const matchS=!q||norm(d.name).includes(q)||norm(d.spec).includes(q)||norm(d.hosp).includes(q);
    const matchT=tierF==="all"||d.tier===tierF;
    return matchS&&matchT&&d.active;
  });

  const openProfile=(doc)=>{setSel(doc);setView("profile");};
  const openForm=(doc,from)=>{setEditDoc(doc||null);setFormFrom(from||view);setView("form");};
  const closeForm=()=>{setEditDoc(null);setView(formFrom);};
  const deleteDoc=(doc)=>{
    setDocs(p=>p.map(d=>d.id===doc.id?{...d,active:false}:d));
    if(view==="profile"){setView("list");setSel(null);}
  };
  const handleNoteSave=(docId,updatedNotes)=>{
    setDocs(p=>p.map(d=>d.id===docId?{...d,notes:updatedNotes}:d));
  };
  const saveDoc=(f)=>{
    if(editDoc){setDocs(p=>p.map(d=>d.id===editDoc.id?{...d,...f}:d));}
    else{const nd={...f,id:"D"+(docs.length+1).toString().padStart(3,"0"),ini:f.name.split(" ").slice(-1)[0].slice(0,2).toUpperCase(),col:["#5B6EF5","#E05BB8","#F5A623","#0BC5A9","#E84040","#3BB5FF"][docs.length%6],score:40,lastVisit:"Never",rxMTD:0,hist:[0,0,0],lat:10.7769,lng:106.7009,active:true,notes:f.notes||""};setDocs(p=>[...p,nd]);}
    closeForm();
  };

  if(view==="form") return(
    <DoctorForm doc={editDoc} onSave={saveDoc} onClose={closeForm}/>
  );

  if(view==="profile"&&sel) return(
    <DoctorProfile doc={docs.find(d=>d.id===sel.id)||sel} onBack={()=>{setView("list");setSel(null);}}
      onLogVisit={d=>{onLogVisitFor&&onLogVisitFor(d);}}
      onEdit={d=>{openForm(d,"profile");}}
      onDelete={deleteDoc}
      onNoteSave={handleNoteSave}/>
  );

  return(
    <>
      <div style={{display:"flex",gap:12,marginBottom:16,alignItems:"center",flexWrap:"wrap"}}>
        <div style={{flex:1,display:"flex",alignItems:"center",gap:8,background:C.white,
          borderRadius:R.lg,padding:"9px 13px",border:`1px solid ${C.border}`,minWidth:220}}>
          <Search size={16} color={C.muted}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name, specialty, or hospital..."
            style={{border:"none",background:"none",flex:1,fontSize:F.base,color:C.text,outline:"none",fontFamily:"inherit"}}/>
          {search&&<button onClick={()=>setSearch("")} style={{background:"none",border:"none",cursor:"pointer",padding:2}}><X size={14} color={C.muted}/></button>}
        </div>
        <div style={{display:"flex",gap:6}}>
          {["all","A","B","C"].map(t=>(
            <button key={t} onClick={()=>setTierF(t)} style={{padding:"8px 14px",borderRadius:R.full,
              border:`1.5px solid ${tierF===t?(TIER_COLORS[t]||{c:C.teal}).c:C.border}`,
              background:tierF===t?(TIER_COLORS[t]||{bg:C.tealBg}).bg:C.white,
              color:tierF===t?(TIER_COLORS[t]||{c:C.teal}).c:C.muted,
              fontSize:F.sm,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
              {t==="all"?"All Tiers":"Tier "+t}
            </button>
          ))}
        </div>
        <Btn variant="primary" icon={Plus} onClick={()=>openForm(null,"list")}>Add Doctor</Btn>
      </div>
      <div style={{marginBottom:12,fontSize:F.sm,color:C.muted}}>
        Showing <strong style={{color:C.text}}>{filtered.length}</strong> of {docs.filter(d=>d.active).length} doctors
        {tierF!=="all"&&<span> · Tier {tierF} filter active</span>}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))",gap:12}}>
        {filtered.map(d=><DoctorCard key={d.id} doc={d} onClick={openProfile} onDelete={deleteDoc} onLogVisit={d=>{onLogVisitFor&&onLogVisitFor(d);}}/>)}
        {filtered.length===0&&(
          <div style={{gridColumn:"1/-1",textAlign:"center",padding:"48px 0",color:C.muted}}>
            <Users size={40} color={C.border} style={{marginBottom:12,display:"block",margin:"0 auto 12px"}}/>
            <div style={{fontSize:F.md,fontWeight:700}}>No doctors found</div>
            <div style={{fontSize:F.sm,marginTop:4}}>Try adjusting your search or tier filter</div>
          </div>
        )}
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════
   PHASE 2 — CALL REPORTS
═══════════════════════════════════════════════════ */
const STATUS_META={
  approved:{bg:C.successBg,c:"#089B85",label:"Approved"},
  submitted:{bg:C.warningBg,c:C.warning,label:"Pending Review"},
  rejected:{bg:C.dangerBg,c:C.danger,label:"Rejected"},
  draft:{bg:C.borderLight,c:C.muted,label:"Draft"},
  queued:{bg:"#FEF3E2",c:"#C47D0D",label:"Queued (Offline)"},
};

function CallReportCard({rep,onClick}){
  const sm=STATUS_META[rep.status]||STATUS_META.draft;
  const prod=PRODUCTS_DB.find(p=>p.id===rep.prods[0]);
  return(
    <div onClick={()=>onClick(rep)} style={{display:"flex",gap:10,cursor:"pointer"}}>
      <div style={{minWidth:72,textAlign:"right",paddingTop:2}}>
        <div style={{fontSize:F.sm,fontWeight:700,color:C.muted}}>{rep.time}</div>
        <div style={{fontSize:F.xs,color:C.muted}}>{rep.dur} min</div>
      </div>
      <div style={{display:"flex",alignItems:"flex-start",paddingTop:4}}>
        <div style={{width:9,height:9,borderRadius:99,flexShrink:0,
          background:rep.status==="approved"?C.success:rep.status==="submitted"?C.warning:rep.status==="rejected"?C.danger:C.muted,
          boxShadow:rep.status==="submitted"?`0 0 0 3px ${C.warningBg}`:undefined}}/>
      </div>
      <div style={{flex:1,background:C.white,borderRadius:R.lg,padding:"10px 13px",
        borderLeft:`3px solid ${rep.status==="approved"?C.success:rep.status==="submitted"?C.warning:rep.status==="rejected"?C.danger:C.border}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
          <div>
            <div style={{fontSize:F.base,fontWeight:700,color:C.text}}>{rep.docName}</div>
            <div style={{fontSize:F.sm,color:C.muted,marginTop:1}}>{rep.spec} · {rep.hosp}</div>
          </div>
          <span style={{padding:"2px 8px",borderRadius:R.full,fontSize:F.xs,fontWeight:700,
            background:sm.bg,color:sm.c,flexShrink:0}}>{sm.label}</span>
        </div>
        <div style={{marginTop:8,display:"flex",gap:6,flexWrap:"wrap"}}>
          {rep.prods.map(pid=>{const p=PRODUCTS_DB.find(x=>x.id===pid);return p?(
            <span key={pid} style={{padding:"2px 8px",borderRadius:R.full,fontSize:F.xs,
              fontWeight:600,background:p.col+"18",color:p.col}}>{p.name}</span>
          ):null;})}
        </div>
      </div>
    </div>
  );
}

function NewCallForm({onSubmit,onCancel,prefillDoctor,isOnline,queueForSync,geofenceRadius,onAudit,user}){
  const [step,setStep]=useState(prefillDoctor?2:1);
  const [selDoc,setSelDoc]=useState(prefillDoctor||null);
  const [docSearch,setDocSearch]=useState(prefillDoctor?prefillDoctor.name:"");
  const [gps,setGps]=useState("idle");
  const [checkinTime,setCheckinTime]=useState(null);
  const [userCoords,setUserCoords]=useState(null);
  const [distanceM,setDistanceM]=useState(null);
  const [gpsError,setGpsError]=useState("");
  const [overrideReason,setOverrideReason]=useState("");
  const [prods,setProds]=useState([]);
  const [samples,setSamples]=useState({});
  const [tags,setTags]=useState([]);
  const [nextAction,setNextAction]=useState("");
  const [notes,setNotes]=useState("");
  const [submitting,setSubmitting]=useState(false);

  const filteredDocs=DOCTORS_DB_INIT.filter(d=>d.name.toLowerCase().includes(docSearch.toLowerCase())||d.spec.toLowerCase().includes(docSearch.toLowerCase()));
  const toggleProd=(pid)=>{setProds(p=>p.includes(pid)?p.filter(x=>x!==pid):[...p,pid]);};
  const toggleTag=(t)=>{setTags(p=>p.includes(t)?p.filter(x=>x!==t):[...p,t]);};
  const adjSamp=(pid,d)=>setSamples(p=>({...p,[pid]:Math.max(0,(p[pid]||0)+d)}));

  const FENCE=geofenceRadius||100;
  const doCheckin=()=>{
    setGps("acquiring");setGpsError("");setUserCoords(null);setDistanceM(null);
    if(!navigator.geolocation){setGps("error");setGpsError("Geolocation is not supported by this browser.");return;}
    navigator.geolocation.getCurrentPosition(
      pos=>{
        const{latitude:lat,longitude:lng,accuracy}=pos.coords;
        const dist=haversine(lat,lng,selDoc.lat,selDoc.lng);
        setUserCoords({lat,lng,accuracy:Math.round(accuracy)});
        setDistanceM(dist);
        setCheckinTime(new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}));
        setGps(dist<=FENCE?"success":"outofrange");
      },
      err=>{
        const msgs={1:"Location permission denied. Please allow location access in your browser settings.",
          2:"GPS signal unavailable. Please check your device settings and try again.",
          3:"Location request timed out. Please move to an open area and retry."};
        setGpsError(msgs[err.code]||"Unable to retrieve location.");
        setGps("error");
      },
      {enableHighAccuracy:true,timeout:15000,maximumAge:0}
    );
  };
  const doOverride=()=>{
    if(overrideReason.trim().length<20)return;
    setGps("override");
    setCheckinTime(new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}));
    if(onAudit&&user) onAudit(user.name,user.role,"GPS","warning","GPS override used",
      `${selDoc?.name||"Unknown doctor"} · ${distanceM}m from registered location · reason: ${overrideReason.trim()}`);
  };
  const doSimulateCheckin=(withinFence=true)=>{
    // Demo/fallback check-in for environments where live browser GPS is blocked
    // (e.g. sandboxed previews without geolocation permission). Generates a
    // realistic coordinate near the doctor's registered location.
    setGps("acquiring");setGpsError("");
    setTimeout(()=>{
      const jitterM=withinFence?(20+Math.random()*60):(150+Math.random()*250);
      const bearing=Math.random()*2*Math.PI;
      const dLat=(jitterM*Math.cos(bearing))/111320;
      const dLng=(jitterM*Math.sin(bearing))/(111320*Math.cos(selDoc.lat*Math.PI/180));
      const lat=selDoc.lat+dLat, lng=selDoc.lng+dLng;
      const dist=haversine(lat,lng,selDoc.lat,selDoc.lng);
      setUserCoords({lat,lng,accuracy:12+Math.round(Math.random()*10)});
      setDistanceM(dist);
      setCheckinTime(new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}));
      setGps(dist<=FENCE?"success":"outofrange");
    },900);
  };

  const doSubmit=async()=>{
    if(!selDoc||(gps!=="success"&&gps!=="override")||prods.length===0)return;
    setSubmitting(true);
    await new Promise(r=>setTimeout(r,1000));
    const nr={id:"CR"+(Date.now()),docId:selDoc.id,docName:selDoc.name,spec:selDoc.spec,hosp:selDoc.hosp,
      date:new Date().toISOString().split("T")[0],time:checkinTime,dur:Math.floor(Math.random()*15)+12,
      status:(isOnline===false)?"queued":"submitted",prods,samples,tags,nextAction:sanitise(nextAction),notes:sanitise(notes),approver:null,approvedAt:null,gpsLat:userCoords?.lat||null,gpsLng:userCoords?.lng||null,gpsAccuracy:userCoords?.accuracy||null,gpsDistanceM:distanceM||null,gpsStatus:gps,gpsOverrideReason:gps==="override"?overrideReason:null};
    onSubmit(nr);
    if(isOnline===false&&queueForSync) queueForSync("call_report","Call · "+selDoc.name+" · "+new Date().toLocaleDateString("en-GB",{day:"2-digit",month:"short"}),nr);
    setSubmitting(false);
  };

  const TAGS=["Will prescribe to 3 Px","Needs more data","Price concern","Competitor using","Strong advocate","Requested samples","Will trial this month"];
  const NEXT_ACTIONS=["Send clinical study PDF","Follow up in 2 weeks","Schedule next visit","Invite to symposium","Send product samples","No action required"];

  const stepLabels=["Select Doctor","GPS Check-In","Visit Details"];

  return(
    <div style={{maxWidth:680,margin:"0 auto"}}>
      {/* Progress */}
      <div style={{display:"flex",alignItems:"center",marginBottom:24,background:C.white,
        borderRadius:R.xl,padding:"14px 20px",border:`1px solid ${C.border}`}}>
        {stepLabels.map((l,i)=>(
          <div key={i} style={{flex:1,display:"flex",alignItems:"center",gap:0}}>
            <div style={{display:"flex",alignItems:"center",gap:8,flex:"none"}}>
              <div style={{width:36,height:36,borderRadius:R.full,display:"flex",alignItems:"center",
                justifyContent:"center",fontSize:F.sm,fontWeight:800,
                background:step>i+1?C.success:step===i+1?C.teal:C.border,
                color:step>=i+1?"white":C.muted}}>
                {step>i+1?<CheckCircle size={14}/>:i+1}
              </div>
              <span style={{fontSize:F.sm,fontWeight:step===i+1?700:500,
                color:step===i+1?C.text:step>i+1?C.success:C.muted}}>{l}</span>
            </div>
            {i<2&&<div style={{flex:1,height:2,background:step>i+1?C.success:C.border,margin:"0 10px"}}/>}
          </div>
        ))}
      </div>

      {/* Step 1: Doctor */}
      {step===1&&(
        <SectionCard title="Select Doctor for this Visit">
          <div style={{display:"flex",alignItems:"center",gap:8,background:C.bg,borderRadius:R.lg,
            padding:"9px 13px",border:`1px solid ${C.border}`,marginBottom:12}}>
            <Search size={16} color={C.muted}/>
            <input value={docSearch} onChange={e=>setDocSearch(e.target.value)} autoFocus
              placeholder="Search doctor by name or specialty..."
              style={{border:"none",background:"none",flex:1,fontSize:F.base,color:C.text,outline:"none",fontFamily:"inherit"}}/>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:6,maxHeight:360,overflowY:"auto"}}>
            {filteredDocs.map(d=>{const tc=TIER_COLORS[d.tier]||TIER_COLORS.C;return(
              <div key={d.id} onClick={()=>{setSelDoc(d);setStep(2);}}
                style={{padding:"12px 14px",borderRadius:R.lg,border:`1.5px solid ${selDoc?.id===d.id?C.teal:C.border}`,
                  background:selDoc?.id===d.id?C.tealBg:C.white,cursor:"pointer",
                  display:"flex",gap:12,alignItems:"center"}}>
                <div style={{width:40,height:40,borderRadius:R.full,background:d.col,flexShrink:0,
                  display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontSize:F.sm,fontWeight:800}}>
                  {d.ini}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:F.base,fontWeight:700,color:C.text}}>{d.name}</div>
                  <div style={{fontSize:F.sm,color:C.muted}}>{d.spec} · {d.hosp}</div>
                </div>
                <span style={{fontSize:F.xs,fontWeight:700,padding:"2px 8px",borderRadius:R.full,
                  background:tc.bg,color:tc.c}}>Tier {d.tier}</span>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:F.xs,color:C.muted}}>Last visit</div>
                  <div style={{fontSize:F.xs,fontWeight:600,color:d.lastVisit==="Today"?C.success:C.text}}>{d.lastVisit}</div>
                </div>
              </div>
            );})}
          </div>
        </SectionCard>
      )}

      {/* Step 2: GPS */}
      {step===2&&selDoc&&(
        <SectionCard title="GPS Visit Verification">
          <div style={{background:C.bg,borderRadius:R.lg,padding:16,marginBottom:16,
            display:"flex",gap:12,alignItems:"center",border:`1px solid ${C.border}`}}>
            <div style={{width:44,height:44,borderRadius:R.full,background:selDoc.col,
              display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontWeight:800}}>
              {selDoc.ini}
            </div>
            <div>
              <div style={{fontSize:F.md,fontWeight:700,color:C.text}}>{selDoc.name}</div>
              <div style={{fontSize:F.sm,color:C.muted}}>{selDoc.spec} · {selDoc.hosp}</div>
              <div style={{fontSize:F.sm,color:C.muted,display:"flex",alignItems:"center",gap:4,marginTop:3}}>
                <MapPin size={12}/>{selDoc.addr}
              </div>
            </div>
          </div>
          <div style={{padding:"0 0 8px"}}>
            {/* IDLE */}
            {gps==="idle"&&(
              <div style={{textAlign:"center",padding:"28px 0"}}>
                <div style={{width:80,height:80,borderRadius:R.full,background:C.bg,
                  border:`2px dashed ${C.border}`,display:"flex",alignItems:"center",
                  justifyContent:"center",margin:"0 auto 16px"}}>
                  <MapPin size={32} color={C.muted}/>
                </div>
                <div style={{fontSize:F.md,fontWeight:700,color:C.text,marginBottom:6}}>
                  Ready to Check In?
                </div>
                <div style={{fontSize:F.sm,color:C.muted,marginBottom:20,lineHeight:1.6,maxWidth:320,margin:"0 auto 20px"}}>
                  Tap below to capture your real GPS coordinates via your device's location services. Your position will be verified against {selDoc.name}'s registered address.
                </div>
                <Btn variant="primary" icon={MapPin} onClick={doCheckin} style={{margin:"0 auto"}}>
                  Check In with Live GPS
                </Btn>
                <div style={{marginTop:14,fontSize:F.xs,color:C.muted}}>
                  Live GPS blocked or unavailable in this preview?{" "}
                  {__IS_DEV__&&(
                    /* S-11 DEV ONLY — hidden on production Vercel deployments */
                    <button onClick={()=>doSimulateCheckin(true)}
                      style={{background:"none",border:"none",color:C.teal,fontWeight:700,
                        cursor:"pointer",fontFamily:"inherit",fontSize:F.xs,padding:0,textDecoration:"underline"}}>
                      Simulate GPS (dev only)
                    </button>
                  )}
                </div>
              </div>
            )}
            {/* ACQUIRING */}
            {gps==="acquiring"&&(
              <div style={{textAlign:"center",padding:"28px 0"}}>
                <div style={{width:80,height:80,borderRadius:R.full,background:C.tealBg,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  margin:"0 auto 16px",animation:"pulse 1.5s ease-in-out infinite"}}>
                  <Activity size={32} color={C.teal}/>
                </div>
                <div style={{fontSize:F.md,fontWeight:700,color:C.text,marginBottom:4}}>
                  Acquiring GPS Signal…
                </div>
                <div style={{fontSize:F.sm,color:C.muted,maxWidth:300,margin:"0 auto",lineHeight:1.5}}>
                  Using your device's GPS to determine precise location. Please stay still.
                </div>
              </div>
            )}
            {/* SUCCESS — within geofence */}
            {gps==="success"&&userCoords&&(
              <div>
                <div style={{display:"flex",alignItems:"center",gap:10,background:C.successBg,
                  borderRadius:R.lg,padding:"12px 14px",marginBottom:14,
                  border:`1px solid ${C.success}30`}}>
                  <CheckCircle size={20} color={C.success} style={{flexShrink:0}}/>
                  <div>
                    <div style={{fontSize:F.base,fontWeight:700,color:C.success}}>
                      Check-In Confirmed — Within Geofence ✓
                    </div>
                    <div style={{fontSize:F.sm,color:C.tealDark,marginTop:1}}>
                      Checked in at {checkinTime} · {distanceM}m from {selDoc.name}'s clinic
                    </div>
                  </div>
                </div>
                <LiveMap userCoords={userCoords} docCoords={{lat:selDoc.lat,lng:selDoc.lng}}
                  docName={selDoc.name} distanceM={distanceM} withinRange={true}/>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:8,marginBottom:14}}>
                  {[["Latitude",userCoords.lat.toFixed(6)+"° N"],["Longitude",userCoords.lng.toFixed(6)+"° E"],["Accuracy","±"+userCoords.accuracy+"m"]].map(([l,v])=>(
                    <div key={l} style={{background:C.bg,borderRadius:R.lg,padding:"10px",textAlign:"center"}}>
                      <div style={{fontSize:F.xs,color:C.muted,textTransform:"uppercase",letterSpacing:"0.5px"}}>{l}</div>
                      <div style={{fontSize:F.sm,fontWeight:700,color:C.text,marginTop:3}}>{v}</div>
                    </div>
                  ))}
                </div>
                <Btn variant="primary" icon={ChevronRight} onClick={()=>setStep(3)} style={{width:"100%"}}>
                  Proceed to Visit Details
                </Btn>
              </div>
            )}
            {/* OUT OF RANGE — real GPS but outside geofence */}
            {gps==="outofrange"&&userCoords&&(
              <div>
                <div style={{display:"flex",alignItems:"center",gap:10,background:C.warningBg,
                  borderRadius:R.lg,padding:"12px 14px",marginBottom:14,
                  border:`1px solid ${C.warning}40`}}>
                  <AlertTriangle size={20} color={C.warning} style={{flexShrink:0}}/>
                  <div>
                    <div style={{fontSize:F.base,fontWeight:700,color:C.warning}}>
                      Outside Geofence — {distanceM<1000?distanceM+"m":(distanceM/1000).toFixed(1)+"km"} from clinic
                    </div>
                    <div style={{fontSize:F.sm,color:C.warning,opacity:0.85,marginTop:1}}>
                      You must be within 100m. Request an override below if visiting indoors or nearby.
                    </div>
                  </div>
                </div>
                <LiveMap userCoords={userCoords} docCoords={{lat:selDoc.lat,lng:selDoc.lng}}
                  docName={selDoc.name} distanceM={distanceM} withinRange={false}/>
                <div style={{background:C.bg,borderRadius:R.lg,padding:14,
                  border:`1px solid ${C.border}`,marginBottom:10}}>
                  <div style={{fontSize:F.sm,fontWeight:700,color:C.text,marginBottom:6}}>
                    GPS Override Request
                  </div>
                  <div style={{fontSize:F.sm,color:C.muted,marginBottom:8,lineHeight:1.5}}>
                    Provide a justification for visiting outside the registered geofence (e.g., met at hospital lobby, patient referral, indoor venue). Minimum 20 characters.
                  </div>
                  <textarea value={overrideReason} onChange={e=>setOverrideReason(e.target.value)}
                    placeholder="e.g. Met doctor at hospital lobby during rounds — clinic closed for renovation…"
                    style={{width:"100%",padding:"9px 11px",border:`1.5px solid ${overrideReason.length>=20?C.teal:C.border}`,
                      borderRadius:R.md,fontSize:F.sm,color:C.text,resize:"none",height:72,
                      fontFamily:"inherit",outline:"none",boxSizing:"border-box"}}/>
                  <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
                    <span style={{fontSize:F.xs,color:overrideReason.length>=20?C.success:C.muted}}>
                      {overrideReason.length}/20 characters minimum
                    </span>
                    <span style={{fontSize:F.xs,color:C.muted}}>
                      Logged to audit trail
                    </span>
                  </div>
                </div>
                <div style={{display:"flex",gap:8}}>
                  <Btn variant="secondary" icon={MapPin} onClick={doCheckin} style={{flex:1}}>
                    Retry GPS
                  </Btn>
                  <Btn variant="primary" icon={CheckCircle}
                    onClick={doOverride} disabled={overrideReason.trim().length<20}
                    style={{flex:2}}>
                    {overrideReason.trim().length<20?"Enter justification to proceed":"Proceed with Override"}
                  </Btn>
                </div>
              </div>
            )}
            {/* OVERRIDE APPROVED */}
            {gps==="override"&&userCoords&&(
              <div>
                <div style={{display:"flex",alignItems:"center",gap:10,background:C.infoBg,
                  borderRadius:R.lg,padding:"12px 14px",marginBottom:14,
                  border:`1px solid ${C.info}30`}}>
                  <CheckCircle size={20} color={C.info} style={{flexShrink:0}}/>
                  <div>
                    <div style={{fontSize:F.base,fontWeight:700,color:C.info}}>GPS Override Approved</div>
                    <div style={{fontSize:F.sm,color:C.info,opacity:0.8,marginTop:1}}>
                      Checked in at {checkinTime} with override · Justification logged to audit trail
                    </div>
                  </div>
                </div>
                <LiveMap userCoords={userCoords} docCoords={{lat:selDoc.lat,lng:selDoc.lng}}
                  docName={selDoc.name} distanceM={distanceM} withinRange={false}/>
                <Btn variant="primary" icon={ChevronRight} onClick={()=>setStep(3)} style={{width:"100%",marginTop:4}}>
                  Proceed to Visit Details
                </Btn>
              </div>
            )}
            {/* ERROR */}
            {gps==="error"&&(
              <div style={{textAlign:"center",padding:"20px 0"}}>
                <div style={{width:72,height:72,borderRadius:R.full,background:C.dangerBg,
                  display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px"}}>
                  <XCircle size={28} color={C.danger}/>
                </div>
                <div style={{fontSize:F.md,fontWeight:700,color:C.danger,marginBottom:6}}>
                  GPS Unavailable
                </div>
                <div style={{fontSize:F.sm,color:C.muted,marginBottom:14,maxWidth:340,
                  margin:"0 auto 14px",lineHeight:1.55}}>{gpsError}</div>
                <div style={{background:C.infoBg,borderRadius:R.lg,padding:"10px 14px",
                  maxWidth:380,margin:"0 auto 18px",textAlign:"left",border:`1px solid ${C.info}30`}}>
                  <div style={{fontSize:F.xs,color:C.info,lineHeight:1.5}}>
                    Live device GPS is often blocked in preview/sandboxed environments.
                    Use Simulate GPS below to test the check-in flow without real location access.
                  </div>
                </div>
                <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap"}}>
                  <Btn variant="secondary" icon={RefreshCw} onClick={doCheckin}>
                    Retry Live GPS
                  </Btn>
                  {__IS_DEV__&&(
                    /* S-11 DEV ONLY (hidden on production Vercel deployments) */
                    <Btn variant="primary" icon={MapPin} onClick={()=>doSimulateCheckin(true)}>
                      Simulate GPS (dev only)
                    </Btn>
                  )}
                </div>
              </div>
            )}
          </div>
          <div style={{display:"flex",gap:10,marginTop:8,paddingTop:16,borderTop:`1px solid ${C.border}`}}>
            <Btn variant="secondary" icon={ChevronLeft} onClick={()=>setStep(1)} style={{flex:1}}>Back</Btn>
          </div>
        </SectionCard>
      )}

      {/* Step 3: Details */}
      {step===3&&(
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <SectionCard title="Products Discussed">
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {PRODUCTS_DB.map(p=>(
                <label key={p.id} style={{display:"flex",alignItems:"center",gap:12,cursor:"pointer",
                  padding:"10px 12px",borderRadius:R.lg,border:`1.5px solid ${prods.includes(p.id)?p.col:C.border}`,
                  background:prods.includes(p.id)?p.col+"0D":C.white}}>
                  <input type="checkbox" checked={prods.includes(p.id)} onChange={()=>toggleProd(p.id)}
                    style={{width:17,height:17,accentColor:p.col,cursor:"pointer",flexShrink:0}}/>
                  <div style={{flex:1}}>
                    <div style={{fontSize:F.base,fontWeight:700,color:C.text}}>{p.name}</div>
                    <div style={{fontSize:F.xs,color:C.muted}}>{p.cat}</div>
                  </div>
                  {prods.includes(p.id)&&(
                    <div style={{display:"flex",alignItems:"center",gap:0}} onClick={e=>e.stopPropagation()}>
                      <button onClick={()=>adjSamp(p.id,-1)} style={{width:36,height:36,border:`1px solid ${C.border}`,
                        borderRadius:"7px 0 0 7px",background:C.bg,cursor:"pointer",fontSize:16,display:"flex",
                        alignItems:"center",justifyContent:"center",lineHeight:1}}>−</button>
                      <div style={{width:36,height:28,borderTop:`1px solid ${C.border}`,borderBottom:`1px solid ${C.border}`,
                        display:"flex",alignItems:"center",justifyContent:"center",fontSize:F.sm,fontWeight:700,
                        color:p.col,background:C.white}}>{samples[p.id]||0}</div>
                      <button onClick={()=>adjSamp(p.id,1)} style={{width:36,height:36,border:`1px solid ${C.border}`,
                        borderRadius:"0 7px 7px 0",background:C.bg,cursor:"pointer",fontSize:16,display:"flex",
                        alignItems:"center",justifyContent:"center",lineHeight:1}}>+</button>
                      <span style={{fontSize:F.xs,color:C.muted,marginLeft:6}}>samples</span>
                    </div>
                  )}
                </label>
              ))}
            </div>
          </SectionCard>
          <SectionCard title="Feedback & Outcome">
            <div style={{marginBottom:12}}>
              <div style={{fontSize:F.xs,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:8}}>Feedback Tags</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {TAGS.map(t=>(
                  <button key={t} onClick={()=>toggleTag(t)} style={{padding:"5px 12px",borderRadius:R.full,
                    border:`1.5px solid ${tags.includes(t)?C.teal:C.border}`,
                    background:tags.includes(t)?C.tealBg:C.white,
                    color:tags.includes(t)?C.tealDark:C.muted,
                    fontSize:F.sm,fontWeight:tags.includes(t)?700:500,cursor:"pointer",fontFamily:"inherit"}}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div style={{marginBottom:12}}>
              <div style={{fontSize:F.xs,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:6}}>Next Action</div>
              <select value={nextAction} onChange={e=>setNextAction(e.target.value)}
                style={{width:"100%",padding:"9px 11px",border:`1.5px solid ${C.border}`,borderRadius:R.md,
                  fontSize:F.base,color:nextAction?C.text:C.muted,outline:"none",fontFamily:"inherit",background:C.white}}>
                <option value="">Select next action...</option>
                {NEXT_ACTIONS.map(a=><option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <div style={{fontSize:F.xs,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:6}}>Visit Notes</div>
              <textarea value={notes} onChange={e=>setNotes(e.target.value)}
                placeholder="Add notes from this call — key discussion points, objections, commitments..."
                style={{width:"100%",padding:"9px 11px",border:`1.5px solid ${C.border}`,borderRadius:R.md,
                  fontSize:F.base,color:C.text,resize:"none",height:80,fontFamily:"inherit",
                  outline:"none",boxSizing:"border-box"}}/>
            </div>
          </SectionCard>
          <div style={{display:"flex",gap:10}}>
            <Btn variant="secondary" icon={ChevronLeft} onClick={()=>setStep(2)} style={{flex:1}}>Back</Btn>
            <Btn variant="primary" icon={Send} onClick={doSubmit} disabled={prods.length===0||submitting}
              style={{flex:2}}>{submitting?"Submitting...":"Submit Call Report"}</Btn>
          </div>
        </div>
      )}

      {step!==1&&(
        <div style={{marginTop:12,textAlign:"center"}}>
          <button onClick={onCancel} style={{background:"none",border:"none",cursor:"pointer",
            fontSize:F.sm,color:C.muted,fontFamily:"inherit"}}>Cancel and discard</button>
        </div>
      )}
      <style>{`@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}`}</style>
    </div>
  );
}

function CallReportDetail({rep,user,onBack,onApprove,onReject}){
  const [rejNote,setRejNote]=useState("");
  const [showRej,setShowRej]=useState(false);
  const sm=STATUS_META[rep.status]||STATUS_META.draft;
  const canApprove=isManagerRole(user.role)&&rep.status==="submitted";
  return(
    <div>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
        <button onClick={onBack} style={{display:"flex",alignItems:"center",gap:6,background:"none",
          border:"none",cursor:"pointer",color:C.teal,fontSize:F.base,fontWeight:700,fontFamily:"inherit",padding:0}}>
          <ChevronLeft size={18}/>Back to Reports
        </button>
        <div style={{marginLeft:"auto",display:"flex",gap:8,alignItems:"center"}}>
          <span style={{padding:"4px 12px",borderRadius:R.full,fontSize:F.sm,fontWeight:700,
            background:sm.bg,color:sm.c}}>{sm.label}</span>
          {canApprove&&<>
            <Btn variant="primary" icon={CheckCircle} small onClick={()=>onApprove(rep)}>Approve</Btn>
            <Btn variant="danger" icon={XCircle} small onClick={()=>setShowRej(true)}>Reject</Btn>
          </>}
        </div>
      </div>
      {showRej&&(
        <div style={{background:C.dangerBg,borderRadius:R.lg,padding:14,marginBottom:16,
          border:`1px solid ${C.danger}30`}}>
          <div style={{fontSize:F.base,fontWeight:700,color:C.danger,marginBottom:8}}>Rejection Reason (required)</div>
          <textarea value={rejNote} onChange={e=>setRejNote(e.target.value)} placeholder="Explain why this report is being rejected..."
            style={{width:"100%",padding:"9px",border:`1px solid ${C.danger}60`,borderRadius:R.md,
              fontSize:F.base,color:C.text,resize:"none",height:68,fontFamily:"inherit",outline:"none",boxSizing:"border-box"}}/>
          <div style={{display:"flex",gap:8,marginTop:8}}>
            <Btn variant="secondary" small onClick={()=>setShowRej(false)} style={{flex:1}}>Cancel</Btn>
            <Btn variant="danger" icon={XCircle} small onClick={()=>{if(rejNote.trim().length>=10)onReject(rep,rejNote);}} style={{flex:2}} disabled={rejNote.trim().length<10}>
              {rejNote.trim().length<10?"Min 10 chars required":"Confirm Rejection"}
            </Btn>
          </div>
        </div>
      )}
      {/* GPS Verification Section */}
      <div style={{marginBottom:16}}>
        <SectionCard title="GPS Check-In Verification">
          {rep.gpsLat?(
            <div>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12,
                background:rep.gpsStatus==="override"?C.warningBg:C.successBg,
                borderRadius:R.lg,padding:"10px 14px",
                border:`1px solid ${rep.gpsStatus==="override"?C.warning:C.success}30`}}>
                {rep.gpsStatus==="override"?<AlertTriangle size={16} color={C.warning}/>:<CheckCircle size={16} color={C.success}/>}
                <div>
                  <div style={{fontSize:F.base,fontWeight:700,color:rep.gpsStatus==="override"?C.warning:C.success}}>
                    {rep.gpsStatus==="override"?"GPS Override — Visit outside geofence":"GPS Verified — Within 100m geofence"}
                  </div>
                  <div style={{fontSize:F.sm,color:C.muted}}>Checked in at {rep.time}</div>
                </div>
                <div style={{marginLeft:"auto",textAlign:"right"}}>
                  <div style={{fontSize:F.xl,fontWeight:800,color:rep.gpsDistanceM<=100?C.success:C.warning}}>{rep.gpsDistanceM}m</div>
                  <div style={{fontSize:F.xs,color:C.muted}}>from clinic</div>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:8,marginBottom:rep.gpsOverrideReason?12:0}}>
                {[["Latitude",rep.gpsLat.toFixed(6)+"° N"],["Longitude",rep.gpsLng.toFixed(6)+"° E"],["GPS Accuracy","±"+rep.gpsAccuracy+"m"]].map(([l,v])=>(
                  <div key={l} style={{background:C.bg,borderRadius:R.md,padding:"8px 10px",textAlign:"center"}}>
                    <div style={{fontSize:F.xs,color:C.muted,textTransform:"uppercase",letterSpacing:"0.4px"}}>{l}</div>
                    <div style={{fontSize:F.sm,fontWeight:700,color:C.text,marginTop:2}}>{v}</div>
                  </div>
                ))}
              </div>
              {rep.gpsOverrideReason&&(
                <div style={{background:C.warningBg,borderRadius:R.md,padding:"8px 12px",
                  display:"flex",gap:8,border:`1px solid ${C.warning}30`}}>
                  <AlertTriangle size={13} color={C.warning} style={{flexShrink:0,marginTop:1}}/>
                  <div>
                    <div style={{fontSize:F.xs,fontWeight:700,color:C.warning}}>Override Justification</div>
                    <div style={{fontSize:F.sm,color:C.text,marginTop:2}}>{rep.gpsOverrideReason}</div>
                  </div>
                </div>
              )}
            </div>
          ):(
            <div style={{display:"flex",gap:8,alignItems:"center",color:C.muted}}>
              <MapPin size={16} color={C.border}/>
              <span style={{fontSize:F.sm}}>GPS data not available for this report</span>
            </div>
          )}
        </SectionCard>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:16}}>
        <SectionCard title="Visit Summary">
          <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:16,
            paddingBottom:16,borderBottom:`1px solid ${C.border}`}}>
            <div style={{width:44,height:44,borderRadius:R.full,flexShrink:0,
              background:(DOCTORS_DB_INIT.find(d=>d.id===rep.docId)||{col:C.teal}).col,
              display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontWeight:800,fontSize:F.sm}}>
              {rep.docName.split(" ").slice(-1)[0].slice(0,2).toUpperCase()}
            </div>
            <div>
              <div style={{fontSize:F.md,fontWeight:700,color:C.text}}>{rep.docName}</div>
              <div style={{fontSize:F.sm,color:C.muted}}>{rep.spec} · {rep.hosp}</div>
            </div>
          </div>
          {[["Date",rep.date],["Check-In Time",rep.time],["Duration",rep.dur+" minutes"],
            ["Approved by",rep.approver||"—"],["Approved at",rep.approvedAt||"—"]].map(([l,v])=>(
            <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",
              borderBottom:`0.5px solid ${C.border}`}}>
              <span style={{fontSize:F.sm,color:C.muted}}>{l}</span>
              <span style={{fontSize:F.sm,fontWeight:600,color:C.text}}>{v}</span>
            </div>
          ))}
          {rep.rejReason&&<div style={{marginTop:12,background:C.dangerBg,borderRadius:R.md,padding:"10px 12px",
            border:`1px solid ${C.danger}30`}}>
            <div style={{fontSize:F.xs,fontWeight:700,color:C.danger,marginBottom:3}}>Rejection Reason</div>
            <div style={{fontSize:F.sm,color:C.danger}}>{rep.rejReason}</div>
          </div>}
        </SectionCard>
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <SectionCard title="Products & Samples">
            {rep.prods.map(pid=>{const p=PRODUCTS_DB.find(x=>x.id===pid);return p?(
              <div key={pid} style={{display:"flex",justifyContent:"space-between",
                alignItems:"center",padding:"8px 0",borderBottom:`0.5px solid ${C.border}`}}>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <div style={{width:8,height:8,borderRadius:99,background:p.col}}/>
                  <span style={{fontSize:F.base,color:C.text}}>{p.name}</span>
                </div>
                <span style={{fontSize:F.sm,color:C.muted}}>{rep.samples[pid]||0} samples</span>
              </div>
            ):null;})}
            <div style={{marginTop:12}}>
              <div style={{fontSize:F.xs,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:6}}>Feedback Tags</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {rep.tags.map(t=><span key={t} style={{padding:"3px 10px",borderRadius:R.full,background:C.tealBg,color:C.tealDark,fontSize:F.xs,fontWeight:600}}>{t}</span>)}
              </div>
            </div>
          </SectionCard>
          <SectionCard title="Notes & Next Action">
            {rep.nextAction&&<div style={{marginBottom:10,display:"flex",gap:8,alignItems:"flex-start"}}>
              <ChevronRight size={15} color={C.teal} style={{flexShrink:0,marginTop:1}}/>
              <span style={{fontSize:F.base,fontWeight:600,color:C.text}}>{rep.nextAction}</span>
            </div>}
            <p style={{fontSize:F.base,color:C.text,lineHeight:1.6,margin:0}}>{rep.notes||"No notes recorded."}</p>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

function CallReports({user,prefillDoctor,onPrefillUsed,isOnline,queueForSync,reports,setReports,geofenceRadius,onAudit}){
  const [view,setView]=useState(prefillDoctor?"new":"list");
  const [sel,setSel]=useState(null);
  const [statusF,setStatusF]=useState("all");

  useEffect(()=>{
    /* S-13: isMounted prevents calling the prop callback after unmount */
    let isMounted=true;
    if(prefillDoctor&&isMounted){setView("new");onPrefillUsed&&onPrefillUsed();}
    return()=>{isMounted=false;};
  },[]);

  const filtered=reports.filter(r=>statusF==="all"||r.status===statusF);
  const counts={all:reports.length,submitted:reports.filter(r=>r.status==="submitted").length,
    approved:reports.filter(r=>r.status==="approved").length,rejected:reports.filter(r=>r.status==="rejected").length};

  const addReport=(r)=>{setReports(p=>[r,...p]);setView("list");};
  const approveRep=(r)=>{setReports(p=>p.map(x=>x.id===r.id?{...x,status:"approved",approver:user.name,approvedAt:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}:x));
    onAudit&&onAudit(user.name,user.role,"Approval","info","Approved Call Report "+r.id,`${r.docName} · ${r.date}`);};
  const rejectRep=(r,reason)=>{setReports(p=>p.map(x=>x.id===r.id?{...x,status:"rejected",approver:user.name,approvedAt:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),rejReason:reason}:x));setSel(p=>p?{...p,status:"rejected",rejReason:reason}:null);
    onAudit&&onAudit(user.name,user.role,"Approval","warning","Rejected Call Report "+r.id,`${r.docName} · reason: ${reason}`);};

  if(view==="new") return(
    <div>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
        <button onClick={()=>setView("list")} style={{display:"flex",alignItems:"center",gap:6,
          background:"none",border:"none",cursor:"pointer",color:C.teal,fontSize:F.base,fontWeight:700,fontFamily:"inherit",padding:0}}>
          <ChevronLeft size={18}/>Back to Reports
        </button>
        <span style={{fontSize:F.lg,fontWeight:800,color:C.text}}>New Call Report</span>
      </div>
      <NewCallForm onSubmit={addReport} onCancel={()=>setView("list")} prefillDoctor={prefillDoctor} isOnline={isOnline} queueForSync={queueForSync} geofenceRadius={geofenceRadius} onAudit={onAudit} user={user}/>
    </div>
  );

  if(view==="detail"&&sel) return(
    <CallReportDetail rep={reports.find(r=>r.id===sel.id)||sel} user={user}
      onBack={()=>{setView("list");setSel(null);}}
      onApprove={(r)=>{approveRep(r);setView("list");setSel(null);}}
      onReject={(r,reason)=>{rejectRep(r,reason);setView("list");setSel(null);}}/>
  );

  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:10}}>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {[["all","All"],["submitted","Pending"],["approved","Approved"],["rejected","Rejected"]].map(([k,l])=>(
            <button key={k} onClick={()=>setStatusF(k)} style={{padding:"7px 14px",borderRadius:R.full,
              border:`1.5px solid ${statusF===k?C.teal:C.border}`,
              background:statusF===k?C.tealBg:C.white,
              color:statusF===k?C.tealDark:C.muted,
              fontSize:F.sm,fontWeight:statusF===k?700:500,cursor:"pointer",fontFamily:"inherit",
              display:"flex",alignItems:"center",gap:5}}>
              {l}
              <span style={{background:statusF===k?C.teal+"30":C.bg,borderRadius:99,padding:"1px 6px",
                fontSize:F.xs,fontWeight:700,color:statusF===k?C.tealDark:C.muted}}>{counts[k]}</span>
            </button>
          ))}
        </div>
        <Btn variant="primary" icon={Plus} onClick={()=>setView("new")}>New Call Report</Btn>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {filtered.map(r=><CallReportCard key={r.id} rep={r} onClick={r=>{setSel(r);setView("detail");}}/>)}
        {filtered.length===0&&(
          <div style={{textAlign:"center",padding:"48px 0",color:C.muted}}>
            <FileText size={40} color={C.border} style={{display:"block",margin:"0 auto 12px"}}/>
            <div style={{fontSize:F.md,fontWeight:700}}>No {statusF!=="all"?statusF+" ":""} reports</div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   PHASE 2 — PRODUCT DETAILING
═══════════════════════════════════════════════════ */
function MoleculeIcon({color}){
  return(
    <svg width="80" height="72" viewBox="0 0 80 72">
      <circle cx="40" cy="36" r="11" fill={color} opacity="0.85"/>
      <circle cx="14" cy="22" r="7" fill={color} opacity="0.6"/>
      <circle cx="66" cy="22" r="7" fill={color} opacity="0.6"/>
      <circle cx="14" cy="50" r="7" fill={color} opacity="0.45"/>
      <circle cx="66" cy="50" r="7" fill={color} opacity="0.45"/>
      <circle cx="40" cy="64" r="7" fill={color} opacity="0.35"/>
      {[[40,36,14,22],[40,36,66,22],[40,36,14,50],[40,36,66,50],[40,36,40,64]].map(([x1,y1,x2,y2],i)=>(
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="2" opacity="0.4"/>
      ))}
    </svg>
  );
}

function ProductDetailing({user}){
  const [view,setView]=useState("library");
  const [sel,setSel]=useState(null);
  const [slide,setSlide]=useState(0);
  const [presentMode,setPresentMode]=useState(false);

  if(presentMode&&sel){
    const slides=SLIDE_CONTENT[PRODUCTS_DB.findIndex(p=>p.id===sel.id)]||[];
    const s=slides[slide]||slides[0];
    return(
      <div style={{margin:"-24px",minHeight:"calc(100vh - 60px)",background:C.navy,display:"flex",
        flexDirection:"column",alignItems:"center",justifyContent:"center",padding:40,position:"relative"}}>
        <div style={{position:"absolute",top:20,right:20,display:"flex",gap:10,zIndex:10}}>
          <div style={{display:"flex",gap:6}}>
            {slides.map((_,i)=><div key={i} style={{width:i===slide?24:8,height:8,borderRadius:99,
              background:i===slide?"white":"rgba(255,255,255,0.3)",transition:"width 0.2s"}}/>)}
          </div>
          <button onClick={()=>setPresentMode(false)} style={{background:"rgba(255,255,255,0.15)",
            border:"none",borderRadius:R.full,width:36,height:36,cursor:"pointer",
            display:"flex",alignItems:"center",justifyContent:"center"}}>
            <X size={18} color="white"/>
          </button>
        </div>
        <div style={{textAlign:"center",maxWidth:600}}>
          <MoleculeIcon color={sel.col}/>
          <div style={{fontSize:14,fontWeight:700,color:sel.col,marginTop:16,
            textTransform:"uppercase",letterSpacing:"2px"}}>{sel.cat}</div>
          <div style={{fontSize:36,fontWeight:800,color:"white",marginTop:6,marginBottom:4}}>{sel.name}</div>
          <div style={{fontSize:15,color:"rgba(255,255,255,0.5)",marginBottom:32}}>{sel.comp}</div>
          <div style={{background:"rgba(255,255,255,0.07)",borderRadius:20,padding:"24px 32px",
            border:"1px solid rgba(255,255,255,0.1)",marginBottom:24}}>
            <div style={{fontSize:20,fontWeight:800,color:"white",marginBottom:8}}>{s.title}</div>
            <div style={{fontSize:15,color:"rgba(255,255,255,0.7)",lineHeight:1.7}}>{s.body}</div>
          </div>
          <div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:20}}>
            <button onClick={()=>setSlide(p=>Math.max(0,p-1))} disabled={slide===0}
              style={{width:44,height:44,borderRadius:R.full,border:"1px solid rgba(255,255,255,0.2)",
                background:"rgba(255,255,255,0.08)",cursor:"pointer",display:"flex",
                alignItems:"center",justifyContent:"center",opacity:slide===0?0.3:1}}>
              <ChevronLeft size={20} color="white"/>
            </button>
            <span style={{color:"rgba(255,255,255,0.5)",fontSize:F.base}}>{slide+1} / {slides.length}</span>
            <button onClick={()=>setSlide(p=>Math.min(slides.length-1,p+1))} disabled={slide===slides.length-1}
              style={{width:44,height:44,borderRadius:R.full,border:"1px solid rgba(255,255,255,0.2)",
                background:"rgba(255,255,255,0.08)",cursor:"pointer",display:"flex",
                alignItems:"center",justifyContent:"center",opacity:slide===slides.length-1?0.3:1}}>
              <ChevronRight size={20} color="white"/>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if(view==="detail"&&sel){
    const pidx=PRODUCTS_DB.findIndex(p=>p.id===sel.id);
    const slides=SLIDE_CONTENT[pidx]||[];
    const curSlide=slides[slide]||slides[0];
    return(
      <div>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
          <button onClick={()=>{setView("library");setSel(null);setSlide(0);}} style={{display:"flex",
            alignItems:"center",gap:6,background:"none",border:"none",cursor:"pointer",
            color:C.teal,fontSize:F.base,fontWeight:700,fontFamily:"inherit",padding:0}}>
            <ChevronLeft size={18}/>Product Library
          </button>
          <div style={{marginLeft:"auto",display:"flex",gap:8}}>
            <Btn variant="secondary" icon={Download} small>Share</Btn>
            <Btn variant="navy" icon={Layers} small onClick={()=>setPresentMode(true)}>Present Mode</Btn>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:16,marginBottom:16}}>
          <SectionCard title="">
            <div style={{background:`${sel.col}12`,borderRadius:R.lg,height:120,display:"flex",
              alignItems:"center",justifyContent:"center",marginBottom:16}}>
              <MoleculeIcon color={sel.col}/>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
              <span style={{fontSize:F.xs,color:C.muted,textTransform:"uppercase",fontWeight:700,letterSpacing:"0.5px"}}>{sel.cat}</span>
              {sel.approved&&<Badge type="success">MLR Approved</Badge>}
            </div>
            <div style={{fontSize:F.xl,fontWeight:800,color:C.text,marginBottom:3}}>{sel.name}</div>
            <div style={{fontSize:F.sm,color:C.muted,marginBottom:16}}>{sel.comp}</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:10,marginBottom:14}}>
              {[sel.s1,sel.s2].map((s,i)=>(
                <div key={i} style={{background:C.bg,borderRadius:R.lg,padding:"12px",textAlign:"center"}}>
                  <div style={{fontSize:F.xl3,fontWeight:800,color:i===0?C.navyMed:sel.col,lineHeight:1}}>{s.v}{s.u}</div>
                  <div style={{fontSize:F.xs,color:C.muted,marginTop:4,lineHeight:1.3}}>{s.d}</div>
                  <div style={{fontSize:F.xs,color:C.success,marginTop:3,fontWeight:600}}>{sel.trial}</div>
                </div>
              ))}
            </div>
            <div style={{background:C.infoBg,borderRadius:R.lg,padding:"12px 14px",
              border:`1px solid ${C.info}30`,display:"flex",gap:10,alignItems:"flex-start"}}>
              <Star size={15} color={C.info} style={{flexShrink:0,marginTop:2}}/>
              <div>
                <div style={{fontSize:F.xs,fontWeight:700,color:C.info,marginBottom:3}}>KEY MESSAGE</div>
                <div style={{fontSize:F.sm,color:C.navyMed,lineHeight:1.55}}>{sel.msg}</div>
              </div>
            </div>
          </SectionCard>
          <SectionCard title="Detail Slides">
            <div style={{display:"flex",gap:5,marginBottom:14}}>
              {slides.map((_,i)=>(
                <button key={i} onClick={()=>setSlide(i)} style={{flex:1,height:6,borderRadius:99,
                  border:"none",background:i===slide?sel.col:C.border,cursor:"pointer",transition:"background 0.2s"}}/>
              ))}
            </div>
            <div style={{background:C.bg,borderRadius:R.lg,padding:"20px",minHeight:180,
              border:`1px solid ${C.border}`,marginBottom:14}}>
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10}}>
                <div style={{width:6,height:6,borderRadius:99,background:sel.col}}/>
                <span style={{fontSize:F.xs,fontWeight:700,color:sel.col,textTransform:"uppercase",letterSpacing:"0.5px"}}>Slide {slide+1} of {slides.length}</span>
              </div>
              <div style={{fontSize:F.md,fontWeight:700,color:C.text,marginBottom:8}}>{curSlide.title}</div>
              <div style={{fontSize:F.sm,color:C.muted,lineHeight:1.65}}>{curSlide.body}</div>
            </div>
            <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:14}}>
              <Btn variant="secondary" icon={ChevronLeft} onClick={()=>setSlide(p=>Math.max(0,p-1))} small disabled={slide===0}/>
              <span style={{fontSize:F.sm,color:C.muted,display:"flex",alignItems:"center"}}>{slide+1} / {slides.length}</span>
              <Btn variant="secondary" icon={ChevronRight} onClick={()=>setSlide(p=>Math.min(slides.length-1,p+1))} small disabled={slide===slides.length-1}/>
            </div>
            <Btn variant="navy" icon={Layers} onClick={()=>setPresentMode(true)} style={{width:"100%"}}>Launch Full-Screen Presentation</Btn>
          </SectionCard>
        </div>
      </div>
    );
  }

  return(
    <div>
      <div style={{marginBottom:16,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <div style={{fontSize:F.md,fontWeight:700,color:C.text}}>Product Library</div>
          <div style={{fontSize:F.sm,color:C.muted,marginTop:2}}>4 MLR-approved products available for detailing</div>
        </div>
        <Badge type="success">All MLR Approved</Badge>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:14}}>
        {PRODUCTS_DB.map((p,i)=>(
          <div key={p.id} onClick={()=>{setSel(p);setView("detail");setSlide(0);}}
            style={{background:C.white,borderRadius:R.xl,padding:18,border:`1px solid ${C.border}`,
              cursor:"pointer",transition:"box-shadow 0.15s",borderTop:`4px solid ${p.col}`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
              <div style={{background:`${p.col}18`,borderRadius:R.lg,padding:10}}>
                <MoleculeIcon color={p.col}/>
              </div>
              <Badge type="success" small>MLR ✓</Badge>
            </div>
            <div style={{fontSize:F.xs,fontWeight:700,color:p.col,textTransform:"uppercase",
              letterSpacing:"0.5px",marginBottom:4}}>{p.cat}</div>
            <div style={{fontSize:F.lg,fontWeight:800,color:C.text,marginBottom:2}}>{p.name}</div>
            <div style={{fontSize:F.sm,color:C.muted,marginBottom:14}}>{p.comp}</div>
            <div style={{display:"flex",gap:10,marginBottom:14}}>
              <div style={{flex:1,background:C.bg,borderRadius:R.md,padding:"10px",textAlign:"center"}}>
                <div style={{fontSize:F.xl,fontWeight:800,color:p.col}}>{p.s1.v}{p.s1.u}</div>
                <div style={{fontSize:F.xs,color:C.muted,marginTop:2}}>{p.s1.d}</div>
              </div>
              <div style={{flex:1,background:C.bg,borderRadius:R.md,padding:"10px",textAlign:"center"}}>
                <div style={{fontSize:F.xl,fontWeight:800,color:C.navyMed}}>{p.s2.v}{p.s2.u}</div>
                <div style={{fontSize:F.xs,color:C.muted,marginTop:2}}>{p.s2.d}</div>
              </div>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:F.sm,color:C.muted}}>{p.rxMTD} Rx this month</span>
              <span style={{fontSize:F.sm,fontWeight:700,color:C.teal,display:"flex",alignItems:"center",gap:4}}>
                View Detail <ChevronRight size={14}/>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}



/* ═══════════════════════════════════════════════════
   CHEMIST REPORTS DATA
═══════════════════════════════════════════════════ */
const CHEMISTS_DB=[
  {id:"CH001",name:"Apollo Pharmacy — MG Road",owner:"Rajesh Kumar",phone:"+84 28 3822 1001",
   addr:"12 MG Road, District 1",lat:10.7734,lng:106.7030,tier:"A",
   avgMonthlyOrders:45000,lastVisit:"2026-06-16",active:true,
   stock:{P001:48,P002:32,P003:60,P004:12},rxDemand:{P001:22,P002:14,P003:18,P004:5}},
  {id:"CH002",name:"MedPlus — District 3",owner:"Sunita Agarwal",phone:"+84 28 3823 2002",
   addr:"88 Vo Van Tan, District 3",lat:10.7756,lng:106.6881,tier:"A",
   avgMonthlyOrders:38000,lastVisit:"2026-06-14",active:true,
   stock:{P001:30,P002:40,P003:22,P004:8},rxDemand:{P001:18,P002:20,P003:10,P004:3}},
  {id:"CH003",name:"HealthPlus Pharmacy — Binh Thanh",owner:"Nguyen Van Duc",phone:"+84 28 3556 3003",
   addr:"55 Xo Viet Nghe Tinh, Binh Thanh",lat:10.8031,lng:106.7120,tier:"B",
   avgMonthlyOrders:22000,lastVisit:"2026-06-10",active:true,
   stock:{P001:18,P002:15,P003:28,P004:6},rxDemand:{P001:10,P002:8,P003:14,P004:2}},
  {id:"CH004",name:"City Chemist — Tan Binh",owner:"Tran Thi Lan",phone:"+84 28 3845 4004",
   addr:"120 Hoang Van Thu, Tan Binh",lat:10.7980,lng:106.6650,tier:"B",
   avgMonthlyOrders:18000,lastVisit:"2026-06-08",active:true,
   stock:{P001:12,P002:10,P003:15,P004:4},rxDemand:{P001:6,P002:5,P003:8,P004:1}},
  {id:"CH005",name:"Pharmacity — Phu Nhuan",owner:"Le Minh Tuan",phone:"+84 28 3990 5005",
   addr:"44 Nguyen Van Troi, Phu Nhuan",lat:10.7958,lng:106.6860,tier:"A",
   avgMonthlyOrders:52000,lastVisit:"2026-06-17",active:true,
   stock:{P001:60,P002:45,P003:70,P004:20},rxDemand:{P001:28,P002:22,P003:30,P004:8}},
  {id:"CH006",name:"FPT Pharmacy — Go Vap",owner:"Pham Quoc Hung",phone:"+84 28 3984 6006",
   addr:"98 Nguyen Oanh, Go Vap",lat:10.8358,lng:106.6690,tier:"C",
   avgMonthlyOrders:9000,lastVisit:"2026-06-05",active:true,
   stock:{P001:8,P002:6,P003:10,P004:2},rxDemand:{P001:4,P002:3,P003:5,P004:1}},
];

const CHEMIST_VISITS_INIT=[
  {id:"CVR001",chemistId:"CH001",chemistName:"Apollo Pharmacy — MG Road",
   date:"2026-06-16",time:"09:30",repName:"Ramesh Sharma",repId:"U001",
   purpose:"Stock check & order collection",
   stockChecked:{P001:48,P002:32,P003:60,P004:12},
   orderCollected:{P001:24,P002:18,P003:30,P004:6},orderValue:42500,
   rxDemand:{P001:22,P002:14,P003:18,P004:5},
   competitorActivity:"Competing brand CardioRel visible on shelf. Owner mentions competitor rep visited last week.",
   promotional:"Placed 2 counter cards, distributed 30 patient leaflets for CardioMax.",
   notes:"Owner requested CardioMax sample strips for 3 HCP referrals.",
   status:"approved",approver:"Suresh Patel",approvedAt:"2026-06-16 04:00 PM"},
  {id:"CVR002",chemistId:"CH005",chemistName:"Pharmacity — Phu Nhuan",
   date:"2026-06-17",time:"11:00",repName:"Ramesh Sharma",repId:"U001",
   purpose:"Relationship visit + GlucoBalance push",
   stockChecked:{P001:60,P002:45,P003:70,P004:20},
   orderCollected:{P001:20,P002:15,P003:40,P004:10},orderValue:58000,
   rxDemand:{P001:28,P002:22,P003:30,P004:8},
   competitorActivity:"No direct competitor. Owner is loyal — high P003 velocity.",
   promotional:"Displayed GlucoBalance standee. Explained patient support program.",
   notes:"Owner requested digital prescription pad for referring HCPs.",
   status:"submitted",approver:null,approvedAt:null},
  {id:"CVR003",chemistId:"CH002",chemistName:"MedPlus — District 3",
   date:"2026-06-14",time:"14:30",repName:"Ramesh Sharma",repId:"U001",
   purpose:"Stock replenishment + RespiClear awareness",
   stockChecked:{P001:30,P002:40,P003:22,P004:8},
   orderCollected:{P001:12,P002:22,P003:10,P004:4},orderValue:28000,
   rxDemand:{P001:18,P002:20,P003:10,P004:3},
   competitorActivity:"Competitor RespiQuick heavily stocked. Owner says 3 doctors in area prescribe it.",
   promotional:"Counter card placed. Left RespiClear comparison brochure.",
   notes:"Follow up with Dr. Trần to generate pull demand at this chemist.",
   status:"approved",approver:"Suresh Patel",approvedAt:"2026-06-15 10:30 AM"},
];

/* ═══════════════════════════════════════════════════
   HOSPITAL REPORTS DATA
═══════════════════════════════════════════════════ */
const HOSPITALS_DB=[
  {id:"H001",name:"City General Hospital",type:"Government",beds:850,
   addr:"201 Nguyen Chi Thanh, District 5",lat:10.7634,lng:106.6802,tier:"A",
   contacts:[
     {name:"Dr. Vijay Shah",role:"Chief Medical Officer",phone:"+84 28 3855 0101"},
     {name:"Mrs. Priya Nair",role:"Purchase Manager",phone:"+84 28 3855 0102"},
     {name:"Dr. Anil Mehta",role:"Head of Cardiology",phone:"+84 28 3855 0103"},
   ],
   monthlySupply:{P001:500,P002:300,P003:200,P004:80},
   monthlyTarget:850000,lastVisit:"2026-06-15"},
  {id:"H002",name:"St. Mary's Medical Centre",type:"Private",beds:320,
   addr:"38 Ngo Duc Ke, District 1",lat:10.7801,lng:106.6996,tier:"A",
   contacts:[
     {name:"Dr. Rosa Fernandez",role:"Medical Director",phone:"+84 28 3822 0201"},
     {name:"Mr. Arun Sharma",role:"Procurement Head",phone:"+84 28 3822 0202"},
   ],
   monthlySupply:{P001:180,P002:220,P003:150,P004:60},
   monthlyTarget:420000,lastVisit:"2026-06-12"},
  {id:"H003",name:"Central Hospital",type:"Government",beds:1200,
   addr:"201 Nguyen Chi Thanh, District 5",lat:10.7723,lng:106.6953,tier:"A",
   contacts:[
     {name:"Dr. Ravi Kumar",role:"Medical Superintendent",phone:"+84 28 3856 0301"},
     {name:"Ms. Leena Das",role:"Purchase Officer",phone:"+84 28 3856 0302"},
     {name:"Dr. Preet Singh",role:"Head of Pulmonology",phone:"+84 28 3856 0303"},
   ],
   monthlySupply:{P001:300,P002:500,P003:250,P004:100},
   monthlyTarget:1200000,lastVisit:"2026-06-10"},
  {id:"H004",name:"University Medical Center",type:"Teaching",beds:600,
   addr:"215 Hong Bang, District 5",lat:10.7562,lng:106.6712,tier:"B",
   contacts:[
     {name:"Prof. Deepak Roy",role:"Dean & CMO",phone:"+84 28 3855 0401"},
     {name:"Dr. Kavya Nair",role:"HOD Endocrinology",phone:"+84 28 3855 0402"},
   ],
   monthlySupply:{P001:120,P002:100,P003:280,P004:40},
   monthlyTarget:380000,lastVisit:"2026-06-08"},
  {id:"H005",name:"East District Clinic",type:"Private",beds:120,
   addr:"12 Xuan Hong, Binh Thanh",lat:10.8045,lng:106.7190,tier:"B",
   contacts:[
     {name:"Dr. Tan Van Nam",role:"Director",phone:"+84 28 3541 0501"},
   ],
   monthlySupply:{P001:60,P002:80,P003:70,P004:20},
   monthlyTarget:120000,lastVisit:"2026-06-05"},
];

const HOSPITAL_VISITS_INIT=[
  {id:"HVR001",hospitalId:"H001",hospitalName:"City General Hospital",
   contactMet:"Mrs. Priya Nair",contactRole:"Purchase Manager",
   date:"2026-06-15",time:"10:00",visitType:"Procurement Discussion",
   products:["P001","P003"],
   qtyRequested:{P001:200,P003:100},supplyValue:320000,
   tenderStatus:"Approved in annual tender. Rate contract valid till Dec 2026.",
   notes:"Discussed Q3 supply schedule. Mrs. Nair requested additional 50 units P003 for new Diabetes ward.",
   followUp:"Send updated rate contract by 20 June.",
   status:"approved",approver:"Kavitha Reddy",approvedAt:"2026-06-15 06:00 PM"},
  {id:"HVR002",hospitalId:"H003",hospitalName:"Central Hospital",
   contactMet:"Dr. Preet Singh",contactRole:"Head of Pulmonology",
   date:"2026-06-10",time:"09:00",visitType:"Ward Round",
   products:["P002"],
   qtyRequested:{P002:150},supplyValue:82500,
   tenderStatus:"RespiClear on formulary since March 2026.",
   notes:"Ward Round in Pulmonology. 8 patients on RespiClear currently. Dr. Singh satisfied with outcomes. Requested case study material.",
   followUp:"Deliver BREATH-II clinical reprint by next visit.",
   status:"submitted",approver:null,approvedAt:null},
  {id:"HVR003",hospitalId:"H002",hospitalName:"St. Mary's Medical Centre",
   contactMet:"Dr. Rosa Fernandez",contactRole:"Medical Director",
   date:"2026-06-12",time:"11:30",visitType:"KOL Engagement",
   products:["P001","P002","P003","P004"],
   qtyRequested:{P001:80,P002:100,P003:60,P004:30},supplyValue:148000,
   tenderStatus:"Private hospital — direct purchase. Monthly standing order.",
   notes:"Dr. Fernandez interested in organizing CME event. Discussed SunaV Pulse digital detailing platform.",
   followUp:"Share CME proposal with 3 date options. Loop in Medical Affairs.",
   status:"approved",approver:"Kavitha Reddy",approvedAt:"2026-06-13 09:00 AM"},
];

/* ═══════════════════════════════════════════════════
   GPS VERIFICATION AUDIT DATA
═══════════════════════════════════════════════════ */
const GPS_AUDIT_INIT=[
  {id:"GPS001",repId:"U001",repName:"Ramesh Sharma",date:"2026-06-18",time:"08:32",
   visitType:"Doctor",targetName:"Dr. Nguyễn Thị Lan",targetAddr:"City General Hospital",
   targetLat:10.7769,targetLng:106.7009,
   actualLat:10.7771,actualLng:106.7012,
   distanceM:28,accuracy:15,status:"verified",overrideReason:null,
   callReportId:"CR001"},
  {id:"GPS002",repId:"U001",repName:"Ramesh Sharma",date:"2026-06-17",time:"11:05",
   visitType:"Chemist",targetName:"Pharmacity — Phu Nhuan",targetAddr:"44 Nguyen Van Troi, Phu Nhuan",
   targetLat:10.7958,targetLng:106.6860,
   actualLat:10.7972,actualLng:106.6875,
   distanceM:198,accuracy:22,status:"override",
   overrideReason:"Chemist temporarily relocated to adjacent building during renovation. Confirmed with owner.",
   callReportId:"CVR002"},
  {id:"GPS003",repId:"U001",repName:"Ramesh Sharma",date:"2026-06-16",time:"09:28",
   visitType:"Chemist",targetName:"Apollo Pharmacy — MG Road",targetAddr:"12 MG Road, District 1",
   targetLat:10.7734,targetLng:106.7030,
   actualLat:10.7736,actualLng:106.7031,
   distanceM:24,accuracy:12,status:"verified",overrideReason:null,
   callReportId:"CVR001"},
  {id:"GPS004",repId:"U001",repName:"Ramesh Sharma",date:"2026-06-15",time:"10:12",
   visitType:"Hospital",targetName:"City General Hospital",targetAddr:"201 Nguyen Chi Thanh, District 5",
   targetLat:10.7634,targetLng:106.6802,
   actualLat:10.7635,actualLng:106.6804,
   distanceM:22,accuracy:18,status:"verified",overrideReason:null,
   callReportId:"HVR001"},
  {id:"GPS005",repId:"U001",repName:"Ramesh Sharma",date:"2026-06-14",time:"14:28",
   visitType:"Chemist",targetName:"MedPlus — District 3",targetAddr:"88 Vo Van Tan, District 3",
   targetLat:10.7756,targetLng:106.6881,
   actualLat:10.7758,actualLng:106.6883,
   distanceM:31,accuracy:10,status:"verified",overrideReason:null,
   callReportId:"CVR003"},
  {id:"GPS006",repId:"U001",repName:"Ramesh Sharma",date:"2026-06-12",time:"11:35",
   visitType:"Hospital",targetName:"St. Mary's Medical Centre",targetAddr:"38 Ngo Duc Ke, District 1",
   targetLat:10.7801,targetLng:106.6996,
   actualLat:10.7830,actualLng:106.7010,
   distanceM:342,accuracy:35,status:"override",
   overrideReason:"Met Dr. Fernandez in hospital lobby cafeteria — main building access restricted for renovation.",
   callReportId:"HVR003"},
  {id:"GPS007",repId:"U001",repName:"Ramesh Sharma",date:"2026-06-10",time:"09:02",
   visitType:"Hospital",targetName:"Central Hospital",targetAddr:"201 Nguyen Chi Thanh",
   targetLat:10.7723,targetLng:106.6953,
   actualLat:10.7725,actualLng:106.6955,
   distanceM:29,accuracy:14,status:"verified",overrideReason:null,
   callReportId:"HVR002"},
  {id:"GPS008",repId:"U001",repName:"Ramesh Sharma",date:"2026-06-08",time:"10:45",
   visitType:"Doctor",targetName:"Dr. Phạm Thị Hoa",targetAddr:"University Medical Center",
   targetLat:10.7698,targetLng:106.6982,
   actualLat:10.7700,actualLng:106.6984,
   distanceM:27,accuracy:16,status:"verified",overrideReason:null,
   callReportId:"CR004"},
];


/* ═══════════════════════════════════════════════════
   PHASE 4 — MANAGEMENT DATA
═══════════════════════════════════════════════════ */
const EXP_CATS=[
  {id:"travel",  label:"Travel (Fuel/Vehicle)",  icon:MapPin,   color:"#5B6EF5", limit:8000},
  {id:"meals",   label:"Meals & Entertainment",  icon:Star,     color:"#F5A623", limit:3000},
  {id:"lodging", label:"Lodging / Stay",          icon:Building, color:"#8B5CF6", limit:5000},
  {id:"samples", label:"Sample Distribution",     icon:Layers,   color:C.teal,   limit:2000},
  {id:"misc",    label:"Miscellaneous",            icon:Zap,      color:"#E84040", limit:1500},
];

const EXPENSE_INIT=[
  {id:"EX001",repId:"U001",repName:"Ramesh Sharma",date:"2026-06-17",category:"travel",
   description:"Field visits — MG Road to District 3 (28 km)",amount:980,receiptNo:"REC-001",
   status:"approved",approver:"Suresh Patel",approvedAt:"2026-06-18 09:00 AM",rejReason:null},
  {id:"EX002",repId:"U001",repName:"Ramesh Sharma",date:"2026-06-16",category:"meals",
   description:"Lunch with Dr. Nguyen Thi Lan & Dr. Le Van Hung — working lunch",amount:1250,receiptNo:"REC-002",
   status:"submitted",approver:null,approvedAt:null,rejReason:null},
  {id:"EX003",repId:"U001",repName:"Ramesh Sharma",date:"2026-06-14",category:"samples",
   description:"Sample transport — courier to 3 chemists in East territory",amount:450,receiptNo:"REC-003",
   status:"approved",approver:"Suresh Patel",approvedAt:"2026-06-15 02:00 PM",rejReason:null},
  {id:"EX004",repId:"U001",repName:"Ramesh Sharma",date:"2026-06-12",category:"travel",
   description:"Hospital visits — City General & Central Hospital (42 km)",amount:1470,receiptNo:"REC-004",
   status:"rejected",approver:"Suresh Patel",approvedAt:"2026-06-13 11:00 AM",
   rejReason:"Distance claim seems high — please resubmit with odometer reading."},
  {id:"EX005",repId:"U001",repName:"Ramesh Sharma",date:"2026-06-10",category:"misc",
   description:"Printing — product comparison charts for chemist visits",amount:320,receiptNo:"REC-005",
   status:"approved",approver:"Suresh Patel",approvedAt:"2026-06-11 10:30 AM",rejReason:null},
];

const LEAVE_TYPES={
  CL:{label:"Casual Leave",      color:"#5B6EF5", total:12},
  SL:{label:"Sick Leave",        color:"#E84040", total:10},
  EL:{label:"Earned Leave",      color:C.teal,    total:15},
  CO:{label:"Compensatory Off",  color:"#F5A623", total:4},
};
const LEAVE_BALANCE={CL:{used:3,pending:1},SL:{used:1,pending:0},EL:{used:0,pending:0},CO:{used:0,pending:0}};

const LEAVE_APPS_INIT=[
  {id:"LV001",repId:"U001",repName:"Ramesh Sharma",type:"CL",
   from:"2026-07-04",to:"2026-07-05",days:2,
   reason:"Personal family commitment — pre-planned",
   status:"submitted",approver:null,approvedAt:null,rejReason:null},
  {id:"LV002",repId:"U001",repName:"Ramesh Sharma",type:"SL",
   from:"2026-06-03",to:"2026-06-03",days:1,
   reason:"Fever — medical certificate attached",
   status:"approved",approver:"Suresh Patel",approvedAt:"2026-06-03 08:30 AM",rejReason:null},
  {id:"LV003",repId:"U001",repName:"Ramesh Sharma",type:"CL",
   from:"2026-05-15",to:"2026-05-17",days:3,
   reason:"Short family trip",
   status:"approved",approver:"Suresh Patel",approvedAt:"2026-05-14 03:00 PM",rejReason:null},
];

const TARGETS_DATA={
  products:[
    {id:"P001",name:"CardioMax",    monthTarget:25,monthActual:18,qtrTarget:75,qtrActual:52,col:C.teal},
    {id:"P002",name:"RespiClear",   monthTarget:15,monthActual:14,qtrTarget:45,qtrActual:38,col:"#5B6EF5"},
    {id:"P003",name:"GlucoBalance", monthTarget:12,monthActual:7, qtrTarget:36,qtrActual:21,col:"#F5A623"},
    {id:"P004",name:"NeuroCalm XR", monthTarget:8, monthActual:2, qtrTarget:24,qtrActual:9, col:"#8B5CF6"},
  ],
  coverage:{target:90,actual:75,doctorsTotal:8,doctorsVisited:6},
  callAvg:{target:8,actual:6.8,daysWorked:18},
  jointWork:{target:2,actual:1,label:"Joint field days this month"},
};



/* ═══════════════════════════════════════════════════
   PHASE 5 DATA — KPI Dashboard · Territory Management
═══════════════════════════════════════════════════ */
const KPI_WEEKLY_TREND=[
  {week:"Wk 1", calls:28,callsTarget:32, revenue:154000,revenueTarget:176000, coverage:62},
  {week:"Wk 2", calls:35,callsTarget:32, revenue:192500,revenueTarget:176000, coverage:65},
  {week:"Wk 3", calls:30,callsTarget:32, revenue:165000,revenueTarget:176000, coverage:64},
  {week:"Wk 4", calls:38,callsTarget:32, revenue:209000,revenueTarget:176000, coverage:68},
  {week:"Wk 5", calls:32,callsTarget:32, revenue:176000,revenueTarget:176000, coverage:69},
  {week:"Wk 6", calls:40,callsTarget:32, revenue:220000,revenueTarget:176000, coverage:72},
  {week:"Wk 7", calls:36,callsTarget:32, revenue:198000,revenueTarget:176000, coverage:74},
  {week:"Wk 8", calls:38,callsTarget:32, revenue:209000,revenueTarget:176000, coverage:75},
  {week:"Wk 9", calls:42,callsTarget:32, revenue:231000,revenueTarget:176000, coverage:77},
  {week:"Wk 10",calls:35,callsTarget:32, revenue:192500,revenueTarget:176000, coverage:76},
  {week:"Wk 11",calls:44,callsTarget:32, revenue:242000,revenueTarget:176000, coverage:80},
  {week:"Wk 12",calls:39,callsTarget:32, revenue:214500,revenueTarget:176000, coverage:82},
];

// Territories sit under Maharashtra Region (RSM Kavitha Reddy). "Pune Area" (ASM Suresh Patel)
// covers Pune Central + Pune East. Achievement % intentionally matches the existing
// RSM dashboard's Territory Achievement chart for narrative consistency.
const TERRITORIES_DB=[
  {id:"T001",name:"Pune Central",region:"Maharashtra Region",areaGroup:"Pune Area",
   asmName:"Suresh Patel",reps:6,lat:18.5204,lng:73.8567,
   callsTarget:320,callsActual:342,
   revenueTarget:2400000,revenueActual:2592000,
   doctorsTotal:48,doctorsCovered:44,
   chemistsTotal:22,chemistsCovered:20,
   hospitalsTotal:8,hospitalsCovered:8,
   complianceRate:96,topProduct:"CardioMax 10mg"},
  {id:"T002",name:"Pune East",region:"Maharashtra Region",areaGroup:"Pune Area",
   asmName:"Suresh Patel",reps:5,lat:18.5532,lng:73.9320,
   callsTarget:300,callsActual:261,
   revenueTarget:2100000,revenueActual:1722000,
   doctorsTotal:40,doctorsCovered:31,
   chemistsTotal:18,chemistsCovered:14,
   hospitalsTotal:6,hospitalsCovered:5,
   complianceRate:84,topProduct:"GlucoBalance 50mg"},
  {id:"T003",name:"Nashik",region:"Maharashtra Region",areaGroup:"Nashik Area",
   asmName:"Anjali Deshmukh",reps:7,lat:19.9975,lng:73.7898,
   callsTarget:336,callsActual:318,
   revenueTarget:2520000,revenueActual:2419200,
   doctorsTotal:52,doctorsCovered:46,
   chemistsTotal:24,chemistsCovered:21,
   hospitalsTotal:9,hospitalsCovered:8,
   complianceRate:91,topProduct:"RespiClear 5mg"},
  {id:"T004",name:"Aurangabad",region:"Maharashtra Region",areaGroup:"Aurangabad Area",
   asmName:"Vikram Joshi",reps:6,lat:19.8762,lng:75.3433,
   callsTarget:312,callsActual:287,
   revenueTarget:2280000,revenueActual:2074800,
   doctorsTotal:44,doctorsCovered:37,
   chemistsTotal:20,chemistsCovered:16,
   hospitalsTotal:7,hospitalsCovered:6,
   complianceRate:88,topProduct:"CardioMax 10mg"},
];

// Sample reps spread across territories for leaderboard/ranking views.
// Ramesh Sharma (U001) is the real logged-in demo rep; others are illustrative teammates.
const REPS_LEADERBOARD=[
  {id:"U001",name:"Ramesh Sharma",territory:"Pune Central",callsTarget:160,callsActual:147,
   revenueTarget:850000,revenueActual:726000,complianceRate:92},
  {id:"U101",name:"Anita Verma",territory:"Pune Central",callsTarget:160,callsActual:172,
   revenueTarget:820000,revenueActual:910000,complianceRate:98},
  {id:"U102",name:"Vikas Pillai",territory:"Pune Central",callsTarget:150,callsActual:151,
   revenueTarget:780000,revenueActual:795000,complianceRate:94},
  {id:"U103",name:"Karan Mehta",territory:"Pune East",callsTarget:150,callsActual:118,
   revenueTarget:760000,revenueActual:588000,complianceRate:79},
  {id:"U104",name:"Sneha Joshi",territory:"Pune East",callsTarget:140,callsActual:135,
   revenueTarget:700000,revenueActual:672000,complianceRate:88},
  {id:"U105",name:"Pooja Iyer",territory:"Nashik",callsTarget:155,callsActual:168,
   revenueTarget:790000,revenueActual:861000,complianceRate:97},
  {id:"U106",name:"Rohit Malhotra",territory:"Nashik",callsTarget:145,callsActual:131,
   revenueTarget:730000,revenueActual:664000,complianceRate:86},
  {id:"U107",name:"Deepak Rao",territory:"Aurangabad",callsTarget:150,callsActual:142,
   revenueTarget:760000,revenueActual:705000,complianceRate:90},
  {id:"U108",name:"Meera Nair",territory:"Aurangabad",callsTarget:140,callsActual:101,
   revenueTarget:700000,revenueActual:512000,complianceRate:73},
];


/* ═══════════════════════════════════════════════════
   PHASE 5 — KPI DASHBOARD
═══════════════════════════════════════════════════ */
function KPIDashboard({user}){
  const [period,setPeriod]=useState("12w");
  const isManager=isManagerRole(user.role);

  const sliceLen=period==="4w"?4:period==="8w"?8:12;
  const trend=KPI_WEEKLY_TREND.slice(-sliceLen);

  // Scope reps/territories visible to this user
  const scopedReps=user.role==="rep"
    ? REPS_LEADERBOARD.filter(r=>r.id===user.id||r.name===user.name)
    : user.role==="area_manager"
      ? REPS_LEADERBOARD.filter(r=>r.territory==="Pune Central"||r.territory==="Pune East")
      : REPS_LEADERBOARD; // RSM + Admin see everyone

  const totalCallsActual=trend.reduce((s,w)=>s+w.calls,0);
  const totalCallsTarget=trend.reduce((s,w)=>s+w.callsTarget,0);
  const totalRevActual=trend.reduce((s,w)=>s+w.revenue,0);
  const totalRevTarget=trend.reduce((s,w)=>s+w.revenueTarget,0);
  const callsPct=Math.round((totalCallsActual/totalCallsTarget)*100);
  const revPct=Math.round((totalRevActual/totalRevTarget)*100);
  const latestCoverage=trend[trend.length-1]?.coverage||0;

  const gpsVerified=GPS_AUDIT_INIT.filter(g=>g.status==="verified").length;
  const gpsTotal=GPS_AUDIT_INIT.length;
  const gpsCompliance=Math.round((gpsVerified/gpsTotal)*100);

  const avgEngagement=Math.round(DOCTORS_DB_INIT.reduce((s,d)=>s+d.score,0)/DOCTORS_DB_INIT.length);

  const ranked=[...scopedReps].map(r=>({...r,achievement:Math.round((r.revenueActual/r.revenueTarget)*100)}))
    .sort((a,b)=>b.achievement-a.achievement);

  const myRank=user.role==="rep"?REPS_LEADERBOARD
    .map(r=>({...r,achievement:Math.round((r.revenueActual/r.revenueTarget)*100)}))
    .sort((a,b)=>b.achievement-a.achievement)
    .findIndex(r=>r.id===user.id||r.name===user.name)+1:null;

  const scopeLabel=user.role==="rep"?"Your Performance":
    user.role==="area_manager"?"Pune Area — Your Team":
    user.role==="regional_manager"?"Maharashtra Region":"All Territories";

  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:10}}>
        <div>
          <div style={{fontSize:F.lg,fontWeight:800,color:C.text}}>{scopeLabel}</div>
          <div style={{fontSize:F.sm,color:C.muted}}>Performance analytics & trends</div>
        </div>
        <div style={{display:"flex",gap:0,background:C.white,borderRadius:R.xl,border:`1px solid ${C.border}`,overflow:"hidden"}}>
          {[["4w","4 Weeks"],["8w","8 Weeks"],["12w","12 Weeks"]].map(([k,l])=>(
            <button key={k} onClick={()=>setPeriod(k)} style={{padding:"8px 16px",border:"none",cursor:"pointer",
              fontFamily:"inherit",fontSize:F.sm,fontWeight:700,
              background:period===k?C.navy:"transparent",color:period===k?"white":C.muted}}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* KPI cards */}
      <div style={{display:"flex",gap:12,marginBottom:16,flexWrap:"wrap"}}>
        <MetricCard label="Total Calls" value={totalCallsActual} icon={Phone} iconColor={C.teal}
          trend={`${callsPct}% of target`} trendDir={callsPct>=100?"up":callsPct>=85?"up":"down"}
          sub={`target ${totalCallsTarget}`}/>
        <MetricCard label="Revenue Achievement" value={revPct+"%"} icon={DollarSign} iconColor={C.success}
          trend={`₹${(totalRevActual/100000).toFixed(1)}L of ₹${(totalRevTarget/100000).toFixed(1)}L`}
          trendDir={revPct>=100?"up":revPct>=85?"up":"down"}/>
        <MetricCard label="Territory Coverage" value={latestCoverage+"%"} icon={Map} iconColor={C.info}
          trend="latest week" trendDir="up" sub="doctors visited"/>
        <MetricCard label="GPS Compliance" value={gpsCompliance+"%"} icon={Shield}
          iconColor={gpsCompliance>=90?C.success:gpsCompliance>=75?C.warning:C.danger}
          trend={`${gpsVerified}/${gpsTotal} verified`} trendDir={gpsCompliance>=90?"up":"down"}/>
        <MetricCard label="Avg. Doctor Engagement" value={avgEngagement} icon={Star} iconColor={C.purple||"#8B5CF6"}
          trend="engagement score" trendDir="up" sub="out of 100"/>
      </div>

      {/* Trend charts */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:16,marginBottom:16}}>
        <SectionCard title={`Call Volume Trend — Last ${sliceLen} Weeks`}
          action={<Badge type={callsPct>=100?"success":callsPct>=85?"warn":"danger"}>{callsPct}% achieved</Badge>}>
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={trend} margin={{top:5,right:10,left:-20,bottom:0}}>
              <defs>
                <linearGradient id="gKpiCalls" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.teal} stopOpacity={0.18}/>
                  <stop offset="95%" stopColor={C.teal} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false}/>
              <XAxis dataKey="week" tick={{fontSize:10,fill:C.muted}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:10,fill:C.muted}} axisLine={false} tickLine={false}/>
              <Tooltip content={({active,payload,label})=>active&&payload?.length?(
                <div style={{background:C.white,borderRadius:R.md,padding:"8px 12px",border:`1px solid ${C.border}`,fontSize:F.xs}}>
                  <div style={{fontWeight:700,marginBottom:4}}>{label}</div>
                  {payload.map(p=><div key={p.name} style={{color:p.color}}>{p.name}: {p.value}</div>)}
                </div>
              ):null}/>
              <Area type="monotone" dataKey="callsTarget" stroke={C.border} strokeWidth={2}
                fill="none" strokeDasharray="4 4" name="Target"/>
              <Area type="monotone" dataKey="calls" stroke={C.teal} strokeWidth={2.5}
                fill="url(#gKpiCalls)" name="Actual Calls"/>
            </AreaChart>
          </ResponsiveContainer>
        </SectionCard>
        <SectionCard title={`Revenue Trend — Last ${sliceLen} Weeks`}
          action={<Badge type={revPct>=100?"success":revPct>=85?"warn":"danger"}>{revPct}% achieved</Badge>}>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={trend} margin={{top:5,right:10,left:-20,bottom:0}} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false}/>
              <XAxis dataKey="week" tick={{fontSize:10,fill:C.muted}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:10,fill:C.muted}} axisLine={false} tickLine={false}
                tickFormatter={v=>`${(v/1000).toFixed(0)}K`}/>
              <Tooltip content={({active,payload,label})=>active&&payload?.length?(
                <div style={{background:C.white,borderRadius:R.md,padding:"8px 12px",border:`1px solid ${C.border}`,fontSize:F.xs}}>
                  <div style={{fontWeight:700,marginBottom:4}}>{label}</div>
                  {payload.map(p=><div key={p.name} style={{color:p.color}}>{p.name}: ₹{p.value.toLocaleString()}</div>)}
                </div>
              ):null}/>
              <Bar dataKey="revenueTarget" fill={C.border} radius={[4,4,0,0]} name="Target"/>
              <Bar dataKey="revenue" fill={C.success} radius={[4,4,0,0]} name="Actual Revenue"/>
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      {/* Rep view: personal rank card */}
      {user.role==="rep"&&myRank&&(
        <SectionCard title="Your Standing">
          <div style={{display:"flex",alignItems:"center",gap:16}}>
            <div style={{width:64,height:64,borderRadius:R.full,background:C.tealBg,
              display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <Award size={28} color={C.teal}/>
            </div>
            <div>
              <div style={{fontSize:F.xl2,fontWeight:800,color:C.text}}>#{myRank} of {REPS_LEADERBOARD.length}</div>
              <div style={{fontSize:F.sm,color:C.muted}}>across Maharashtra Region, ranked by revenue achievement</div>
            </div>
          </div>
        </SectionCard>
      )}

      {/* Manager view: leaderboard */}
      {isManager&&(
        <SectionCard title="Performance Leaderboard"
          action={<span style={{fontSize:F.xs,color:C.muted}}>{ranked.length} reps in scope</span>}>
          <div style={{overflowX:"auto",WebkitOverflowScrolling:"touch"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:F.sm}}>
            <thead><tr>{["Rank","Rep","Territory","Calls","Revenue","Compliance","Achievement"].map((h,i)=>(
              <th key={i} style={{padding:"8px 10px",textAlign:i===0?"center":"left",fontWeight:700,
                color:C.muted,borderBottom:`2px solid ${C.teal}`,fontSize:F.xs,
                textTransform:"uppercase",letterSpacing:"0.5px"}}>{h}</th>
            ))}</tr></thead>
            <tbody>{ranked.map((r,i)=>(
              <tr key={r.id} style={{background:i%2===0?C.white:C.bg}}>
                <td style={{padding:"10px",textAlign:"center"}}>
                  {i===0?<Award size={16} color="#F5A623" style={{display:"inline"}}/>:
                   i===1?<Award size={16} color="#A8A8A8" style={{display:"inline"}}/>:
                   i===2?<Award size={16} color="#C47D0D" style={{display:"inline"}}/>:
                   <span style={{color:C.muted,fontWeight:700}}>{i+1}</span>}
                </td>
                <td style={{padding:"10px",fontWeight:700,color:C.text}}>{r.name}</td>
                <td style={{padding:"10px",color:C.muted}}>{r.territory}</td>
                <td style={{padding:"10px",color:C.text}}>{r.callsActual}/{r.callsTarget}</td>
                <td style={{padding:"10px",color:C.text}}>₹{(r.revenueActual/1000).toFixed(0)}K</td>
                <td style={{padding:"10px"}}>
                  <span style={{fontWeight:700,color:r.complianceRate>=90?C.success:r.complianceRate>=80?C.warning:C.danger}}>
                    {r.complianceRate}%
                  </span>
                </td>
                <td style={{padding:"10px"}}>
                  <span style={{fontWeight:800,padding:"2px 9px",borderRadius:R.full,fontSize:F.xs,
                    background:r.achievement>=100?C.successBg:r.achievement>=85?C.tealBg:C.warningBg,
                    color:r.achievement>=100?C.success:r.achievement>=85?C.tealDark:C.warning}}>
                    {r.achievement}%
                  </span>
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
        </SectionCard>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   PHASE 5 — TERRITORY MAP (multi-marker Leaflet)
═══════════════════════════════════════════════════ */
function TerritoryMap({territories,selectedId,onSelect}){
  const mapRef=useRef(null);
  const inst=useRef(null);
  const markersRef=useRef({});
  const L=useLeaflet();

  useEffect(()=>{
    if(!L||!mapRef.current)return;
    if(inst.current){inst.current.remove();inst.current=null;}
    const map=L.map(mapRef.current,{zoomControl:true,attributionControl:true,scrollWheelZoom:false});
    addTileLayer(L,map); /* 3.3 SPF: primary=OSM, fallback=CARTO on tileerror */
    const bounds=territories.map(t=>[t.lat,t.lng]);
    map.fitBounds(bounds,{padding:[40,40]});
    territories.forEach(t=>{
      const pct=Math.round((t.revenueActual/t.revenueTarget)*100);
      const col=pct>=100?"#22C990":pct>=85?"#0BC5A9":pct>=75?"#F5A623":"#E84040";
      const icon=L.divIcon({
        html:`<div style="width:22px;height:22px;border-radius:50%;background:${col};border:3px solid white;
          box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;
          color:white;font-size:9px;font-weight:800;">${pct}</div>`,
        iconSize:[22,22],iconAnchor:[11,11],className:""
      });
      const m=L.marker([t.lat,t.lng],{icon}).bindPopup(
        `<b>${t.name}</b><br/>${t.reps} reps · ${pct}% achievement<br/>ASM: ${t.asmName}`
      ).addTo(map);
      m.on("click",()=>onSelect&&onSelect(t.id));
      markersRef.current[t.id]=m;
    });
    inst.current=map;
    return()=>{if(inst.current){inst.current.remove();inst.current=null;}};
  },[L]);

  useEffect(()=>{
    /* S-13: no external resource is created here — no-op cleanup satisfies the
       exhaustive-deps ESLint rule and makes the pattern consistent across all effects */
    if(!inst.current||!selectedId)return()=>{};
    const m=markersRef.current[selectedId];
    if(m) m.openPopup();
    return()=>{};
  },[selectedId]);

  if(!L) return(
    <div style={{height:260,background:C.bg,borderRadius:R.lg,display:"flex",alignItems:"center",
      justifyContent:"center",flexDirection:"column",gap:8,border:`1px solid ${C.border}`}}>
      <RefreshCw size={22} color={C.muted} style={{animation:"spin 1s linear infinite"}}/>
      <span style={{fontSize:F.sm,color:C.muted}}>Loading map…</span>
    </div>
  );
  return(
    <div style={{borderRadius:R.lg,overflow:"hidden",border:`1px solid ${C.border}`}}>
      <div ref={mapRef} style={{height:260}}/>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   PHASE 5 — TERRITORY MANAGEMENT
═══════════════════════════════════════════════════ */
function TerritoryManagement({user}){
  const [selId,setSelId]=useState(null);
  const canView=["regional_manager","admin"].includes(user.role);

  if(!canView) return(
    <div style={{textAlign:"center",padding:"60px 0",color:C.muted}}>
      <Shield size={40} color={C.border} style={{display:"block",margin:"0 auto 12px"}}/>
      <div style={{fontSize:F.md,fontWeight:700}}>Regional Manager Access Only</div>
      <div style={{fontSize:F.sm,marginTop:4}}>Territory Management is visible to RSM and Admin roles.</div>
    </div>
  );

  const sel=TERRITORIES_DB.find(t=>t.id===selId);
  const totalReps=TERRITORIES_DB.reduce((s,t)=>s+t.reps,0);
  const totalRevActual=TERRITORIES_DB.reduce((s,t)=>s+t.revenueActual,0);
  const totalRevTarget=TERRITORIES_DB.reduce((s,t)=>s+t.revenueTarget,0);
  const regionPct=Math.round((totalRevActual/totalRevTarget)*100);

  if(sel){
    const pct=Math.round((sel.revenueActual/sel.revenueTarget)*100);
    const callsPct=Math.round((sel.callsActual/sel.callsTarget)*100);
    const teamReps=REPS_LEADERBOARD.filter(r=>r.territory===sel.name)
      .map(r=>({...r,achievement:Math.round((r.revenueActual/r.revenueTarget)*100)}))
      .sort((a,b)=>b.achievement-a.achievement);

    return(
      <div>
        <button onClick={()=>setSelId(null)} style={{display:"flex",alignItems:"center",gap:6,
          background:"none",border:"none",cursor:"pointer",color:C.teal,fontSize:F.base,
          fontWeight:700,fontFamily:"inherit",padding:0,marginBottom:16}}>
          <ChevronLeft size={18}/>Back to All Territories
        </button>

        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:10}}>
          <div>
            <div style={{fontSize:F.xl,fontWeight:800,color:C.text}}>{sel.name}</div>
            <div style={{fontSize:F.sm,color:C.muted}}>{sel.areaGroup} · ASM {sel.asmName} · {sel.reps} reps</div>
          </div>
          <span style={{padding:"4px 14px",borderRadius:R.full,fontSize:F.sm,fontWeight:800,
            background:pct>=100?C.successBg:pct>=85?C.tealBg:C.warningBg,
            color:pct>=100?C.success:pct>=85?C.tealDark:C.warning}}>
            {pct}% Revenue Achievement
          </span>
        </div>

        <div style={{display:"flex",gap:12,marginBottom:16,flexWrap:"wrap"}}>
          <MetricCard label="Calls" value={sel.callsActual} icon={Phone} iconColor={C.teal}
            trend={`${callsPct}% of target`} trendDir={callsPct>=100?"up":"down"} sub={`target ${sel.callsTarget}`}/>
          <MetricCard label="Revenue" value={`₹${(sel.revenueActual/100000).toFixed(1)}L`} icon={DollarSign} iconColor={C.success}
            trend={`of ₹${(sel.revenueTarget/100000).toFixed(1)}L target`} trendDir={pct>=100?"up":"down"}/>
          <MetricCard label="Doctor Coverage" value={`${sel.doctorsCovered}/${sel.doctorsTotal}`} icon={Users} iconColor={C.info}
            trend={`${Math.round(sel.doctorsCovered/sel.doctorsTotal*100)}% covered`} trendDir="up"/>
          <MetricCard label="GPS Compliance" value={sel.complianceRate+"%"} icon={Shield}
            iconColor={sel.complianceRate>=90?C.success:sel.complianceRate>=80?C.warning:C.danger}
            trend={sel.complianceRate>=90?"Excellent":sel.complianceRate>=80?"Acceptable":"Needs attention"}
            trendDir={sel.complianceRate>=90?"up":"down"}/>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:16,marginBottom:16}}>
          <SectionCard title="Channel Coverage">
            {[["Doctors",sel.doctorsCovered,sel.doctorsTotal,C.teal],
              ["Chemists",sel.chemistsCovered,sel.chemistsTotal,C.info],
              ["Hospitals",sel.hospitalsCovered,sel.hospitalsTotal,"#8B5CF6"]].map(([l,cov,total,col])=>{
              const p=Math.round((cov/total)*100);
              return(
                <div key={l} style={{marginBottom:12}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                    <span style={{fontSize:F.sm,fontWeight:600,color:C.text}}>{l}</span>
                    <span style={{fontSize:F.sm,color:C.muted}}>{cov} / {total} ({p}%)</span>
                  </div>
                  <div style={{height:7,background:C.bg,borderRadius:99,overflow:"hidden"}}>
                    <div style={{height:"100%",width:p+"%",background:col,borderRadius:99,transition:"width 0.5s"}}/>
                  </div>
                </div>
              );
            })}
            <div style={{marginTop:8,fontSize:F.sm,color:C.muted}}>
              Top performing product: <b style={{color:C.text}}>{sel.topProduct}</b>
            </div>
          </SectionCard>
          <SectionCard title="Location">
            <TerritoryMap territories={[sel]} selectedId={sel.id}/>
          </SectionCard>
        </div>

        <SectionCard title={`Reps in ${sel.name}`}>
          <div style={{overflowX:"auto",WebkitOverflowScrolling:"touch"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:F.sm}}>
            <thead><tr>{["Rep","Calls","Revenue","Compliance","Achievement"].map((h,i)=>(
              <th key={i} style={{padding:"8px 10px",textAlign:"left",fontWeight:700,color:C.muted,
                borderBottom:`2px solid ${C.teal}`,fontSize:F.xs,textTransform:"uppercase",letterSpacing:"0.5px"}}>{h}</th>
            ))}</tr></thead>
            <tbody>{teamReps.map((r,i)=>(
              <tr key={r.id} style={{background:i%2===0?C.white:C.bg}}>
                <td style={{padding:"10px",fontWeight:700,color:C.text}}>{r.name}</td>
                <td style={{padding:"10px",color:C.text}}>{r.callsActual}/{r.callsTarget}</td>
                <td style={{padding:"10px",color:C.text}}>₹{(r.revenueActual/1000).toFixed(0)}K</td>
                <td style={{padding:"10px"}}>
                  <span style={{fontWeight:700,color:r.complianceRate>=90?C.success:r.complianceRate>=80?C.warning:C.danger}}>{r.complianceRate}%</span>
                </td>
                <td style={{padding:"10px"}}>
                  <span style={{fontWeight:800,padding:"2px 9px",borderRadius:R.full,fontSize:F.xs,
                    background:r.achievement>=100?C.successBg:r.achievement>=85?C.tealBg:C.warningBg,
                    color:r.achievement>=100?C.success:r.achievement>=85?C.tealDark:C.warning}}>{r.achievement}%</span>
                </td>
              </tr>
            ))}
            {teamReps.length===0&&(
              <tr><td colSpan={5} style={{padding:"16px",textAlign:"center",color:C.muted}}>No rep-level data available for this territory yet.</td></tr>
            )}
            </tbody>
          </table>
        </div>
        </SectionCard>
      </div>
    );
  }

  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:10}}>
        <div>
          <div style={{fontSize:F.lg,fontWeight:800,color:C.text}}>Maharashtra Region</div>
          <div style={{fontSize:F.sm,color:C.muted}}>{TERRITORIES_DB.length} territories · {totalReps} reps</div>
        </div>
        <span style={{padding:"4px 14px",borderRadius:R.full,fontSize:F.sm,fontWeight:800,
          background:regionPct>=100?C.successBg:regionPct>=85?C.tealBg:C.warningBg,
          color:regionPct>=100?C.success:regionPct>=85?C.tealDark:C.warning}}>
          {regionPct}% Region Achievement
        </span>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))",gap:16,marginBottom:16}}>
        <SectionCard title="Territory Map"
          action={<span style={{fontSize:F.xs,color:C.muted}}>Click a pin to drill in</span>}>
          <TerritoryMap territories={TERRITORIES_DB} onSelect={setSelId}/>
        </SectionCard>
        <SectionCard title="Achievement by Territory">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={TERRITORIES_DB.map(t=>({name:t.name,achievement:Math.round(t.revenueActual/t.revenueTarget*100)}))}
              layout="vertical" margin={{top:0,right:20,left:10,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} horizontal={false}/>
              <XAxis type="number" tick={{fontSize:10,fill:C.muted}} axisLine={false} tickLine={false} domain={[0,130]}/>
              <YAxis type="category" dataKey="name" tick={{fontSize:11,fill:C.muted}} axisLine={false} tickLine={false} width={90}/>
              <Tooltip content={({active,payload,label})=>active&&payload?.length?(
                <div style={{background:C.white,borderRadius:R.md,padding:"8px 12px",border:`1px solid ${C.border}`,fontSize:F.xs}}>
                  <div style={{fontWeight:700}}>{label}: {payload[0].value}%</div>
                </div>
              ):null}/>
              <Bar dataKey="achievement" radius={[0,4,4,0]} maxBarSize={22}>
                {TERRITORIES_DB.map((t,i)=>{
                  const a=Math.round(t.revenueActual/t.revenueTarget*100);
                  return <Cell key={i} fill={a>=100?C.success:a>=85?C.teal:a>=75?C.warning:C.danger}/>;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {TERRITORIES_DB.map(t=>{
          const pct=Math.round((t.revenueActual/t.revenueTarget)*100);
          const docPct=Math.round((t.doctorsCovered/t.doctorsTotal)*100);
          return(
            <div key={t.id} onClick={()=>setSelId(t.id)} style={{background:C.white,borderRadius:R.xl,padding:16,
              border:`1px solid ${C.border}`,cursor:"pointer",
              borderLeft:`4px solid ${pct>=100?C.success:pct>=85?C.teal:pct>=75?C.warning:C.danger}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                <div>
                  <div style={{fontSize:F.md,fontWeight:700,color:C.text}}>{t.name}</div>
                  <div style={{fontSize:F.sm,color:C.muted}}>{t.areaGroup} · ASM {t.asmName} · {t.reps} reps</div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{padding:"3px 11px",borderRadius:R.full,fontSize:F.sm,fontWeight:800,
                    background:pct>=100?C.successBg:pct>=85?C.tealBg:C.warningBg,
                    color:pct>=100?C.success:pct>=85?C.tealDark:C.warning}}>{pct}%</span>
                  <ChevronRight size={16} color={C.muted}/>
                </div>
              </div>
              <div style={{display:"flex",gap:20}}>
                <div><div style={{fontSize:F.xs,color:C.muted}}>Calls</div>
                  <div style={{fontSize:F.sm,fontWeight:700,color:C.text}}>{t.callsActual}/{t.callsTarget}</div></div>
                <div><div style={{fontSize:F.xs,color:C.muted}}>Revenue</div>
                  <div style={{fontSize:F.sm,fontWeight:700,color:C.text}}>₹{(t.revenueActual/100000).toFixed(1)}L</div></div>
                <div><div style={{fontSize:F.xs,color:C.muted}}>Doctor Coverage</div>
                  <div style={{fontSize:F.sm,fontWeight:700,color:C.text}}>{docPct}%</div></div>
                <div><div style={{fontSize:F.xs,color:C.muted}}>GPS Compliance</div>
                  <div style={{fontSize:F.sm,fontWeight:700,color:t.complianceRate>=90?C.success:t.complianceRate>=80?C.warning:C.danger}}>{t.complianceRate}%</div></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}



/* ═══════════════════════════════════════════════════
   PHASE 6 DATA — User Management · Audit Logs · System Config
═══════════════════════════════════════════════════ */
const ROLE_META={
  rep:{label:"Medical Representative",color:C.teal,bg:C.tealBg},
  area_manager:{label:"Area Sales Manager",color:C.navyMed,bg:"#E8EDFA"},
  regional_manager:{label:"Regional Sales Manager",color:C.info,bg:C.infoBg},
  admin:{label:"System Administrator",color:C.purple,bg:C.purpleBg},
};
// Single source of truth for "can this role approve things" — previously duplicated
// as inline ["area_manager","regional_manager","admin"].includes(...) in 5 places.
const MANAGER_ROLES=["area_manager","regional_manager","admin"];
const isManagerRole=(role)=>MANAGER_ROLES.includes(role);

/* ── DEV-MODE DETECTION ──────────────────────────────────────────────────────
   Replaces import.meta.env.DEV, which is Vite-only and throws
   "Cannot use import.meta outside a module" in environments that render JSX
   without a bundler such as the Claude artifact preview.
   True on localhost, the Claude preview, and any non-Vercel host.
   False on your production Vercel or custom domain. ─────────────────────── */
const __IS_DEV__=(function(){
  if(typeof window==="undefined")return false;
  var h=window.location.hostname;
  if(h===""||h==="localhost"||h==="127.0.0.1")return true;
  if(h.endsWith(".claude.ai")||h.endsWith(".local"))return true;
  return false; // production Vercel or custom domain
}());

/* ── PRODUCTION AUTH MODULE ──────────────────────────────────────────────────
   Two modes:
   • Demo mode  (window.SUNAV_API_URL not set — artifact preview, offline demo):
     credentials checked client-side against DEMO_USERS, no network calls.
   • Production mode (window.SUNAV_API_URL set in index.html):
     credentials sent to the Express backend, JWT access token stored in
     module-level memory (never localStorage — prevents XSS theft), refresh
     token held in HttpOnly cookie managed by the backend.

   To enable production mode, add to index.html before the app bundle:
     <script>window.SUNAV_API_URL = 'https://your-backend.railway.app';</script>
   ─────────────────────────────────────────────────────────────────────────── */
const SUNAV_API=(typeof window!=="undefined"&&window.SUNAV_API_URL)||"";
const USE_REAL_AUTH=Boolean(SUNAV_API);

// ── In-memory token storage ──────────────────────────────────────────────────
// NOT React state: avoids spurious re-renders on refresh, keeps sensitive data
// out of component state snapshots (React DevTools, error reports, etc.).
var _accessToken=null;
var _refreshTimer=null;
var _onSessionExpiredCb=null; // set by AppRoot to trigger automatic logout

function _scheduleTokenRefresh(){
  if(_refreshTimer)clearTimeout(_refreshTimer);
  // Access token TTL = 15 min; refresh 60 s before expiry.
  _refreshTimer=setTimeout(function(){
    _apiCall("POST","/api/auth/refresh",null).then(function(d){
      _accessToken=d.accessToken;
      _scheduleTokenRefresh();
    }).catch(function(){
      _accessToken=null;
      if(_onSessionExpiredCb)_onSessionExpiredCb();
    });
  },14*60*1000);
}

// ── Authenticated fetch wrapper ──────────────────────────────────────────────
async function _apiCall(method,path,body){
  const headers={"Content-Type":"application/json"};
  if(_accessToken)headers["Authorization"]="Bearer "+_accessToken;
  const resp=await fetch(SUNAV_API+path,{
    method,
    headers,
    credentials:"include", // required for HttpOnly refresh cookie exchange
    body:body!=null?JSON.stringify(body):undefined,
  });
  if(!resp.ok){
    const data=await resp.json().catch(()=>({error:"Request failed"}));
    const err=new Error(data.error||"Request failed");
    err.code=data.code;
    err.status=resp.status;
    throw err;
  }
  return resp.json();
}

// ── Normalise API user object → app's expected shape ────────────────────────
// NOTE: References ROLE_META defined later in the file — safe because this
// function is only called after module initialisation is complete.
function _normUser(apiUser){
  const LABELS={
    rep:"Medical Representative",
    area_manager:"Area Sales Manager",
    regional_manager:"Regional Sales Manager",
    admin:"System Administrator",
  };
  const n=(apiUser.name||"?").trim();
  const initials=n.split(/\s+/).map(function(w){return w[0];}).join("").toUpperCase().slice(0,2);
  return{
    id:apiUser.id,
    name:n,
    email:apiUser.email||"",
    role:apiUser.role,
    roleLabel:LABELS[apiUser.role]||apiUser.role,
    territory:apiUser.territory||"—",
    employeeId:apiUser.employeeId||apiUser.employee_id||"—",
    initials,
    // Managers get a numeric teamSize in the dashboard metric cards
    teamSize:["area_manager","regional_manager","admin"].includes(apiUser.role)?0:null,
  };
}


/* ─── MAP TILE PROVIDERS WITH FAILOVER (3.3 SPF) ────────────────────────────
   Root cause: the app loaded tiles from a single CDN (openstreetmap.org).
   If that CDN is unreachable, every map screen silently breaks — the user
   sees a grey grid and no error message.

   Fix: a helper that adds the primary tile layer and automatically swaps to
   a backup provider (CARTO Voyager — free, no API key) on the first tile error.
   CARTO is added to the CSP img-src / connect-src in vercel.json and nginx.conf.
   ─────────────────────────────────────────────────────────────────────────── */
const TILE_PRIMARY={
  url:"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  opts:{
    attribution:'© <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
    maxZoom:19,
  },
};
const TILE_FALLBACK={
  url:"https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
  opts:{
    attribution:'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors · © <a href="https://carto.com">CARTO</a>',
    maxZoom:19,
    subdomains:"abcd",
  },
};

/** Attach a tile layer to a Leaflet map with automatic CDN failover. */
function addTileLayer(L,map){
  let failedOver=false;
  const layer=L.tileLayer(TILE_PRIMARY.url,TILE_PRIMARY.opts);
  layer.on("tileerror",function(){
    if(!failedOver){
      failedOver=true;
      map.removeLayer(layer);
      L.tileLayer(TILE_FALLBACK.url,TILE_FALLBACK.opts).addTo(map);
    }
  });
  layer.addTo(map);
  return layer;
}

/* ─── AUDIT LOG SESSIONSTORAGE PERSISTENCE (3.3 / 3.4) ──────────────────────
   Root cause: the in-app audit log lives only in React useState. Any page
   refresh destroys the entire log for that session permanently.

   Fix: every audit entry is also appended to sessionStorage
   (same-tab persistence, cleared when the tab/browser closes — intentional,
   since audit logs for a session should not persist to unrelated tabs).
   The log is reloaded from sessionStorage on mount so a refresh does not
   lose prior entries from the same session.

   sessionStorage is deliberately chosen over localStorage:
   • localStorage is shared across tabs (audit for session A visible in B)
   • sessionStorage is tab-scoped (matches the expected audit boundary)
   ─────────────────────────────────────────────────────────────────────────── */
const AUDIT_SESSION_KEY="sunav_audit_log";
const AUDIT_MAX_ENTRIES=500; // cap to keep sessionStorage under ~1 MB

function _auditPersist(entry){
  try{
    if(typeof sessionStorage==="undefined")return;
    const existing=JSON.parse(sessionStorage.getItem(AUDIT_SESSION_KEY)||"[]");
    const updated=[...existing,entry].slice(-AUDIT_MAX_ENTRIES);
    sessionStorage.setItem(AUDIT_SESSION_KEY,JSON.stringify(updated));
  }catch{
    // sessionStorage blocked (private mode quota) or quota exceeded — non-fatal
  }
}

function _auditRestore(){
  try{
    if(typeof sessionStorage==="undefined")return[];
    return JSON.parse(sessionStorage.getItem(AUDIT_SESSION_KEY)||"[]");
  }catch{
    return[];
  }
}

/* ─── INPUT SANITISATION HELPERS ─────────────────────────────────────────────
   S-08 remediation.
   Root cause: form values enter React state as raw strings. When a backend API
   is connected, unsanitised values sent to the server could enable stored-XSS
   or injection. React's JSX renderer already escapes at render time, but values
   must be clean at the point of submission, not just at display time.

   sanitise()     — normalises a string before it is stored or transmitted.
   sanitiseObj()  — applies sanitise() to all string values in a plain object.
   validateForm() — returns {valid, errors} for a field-rules map.
   Applied at form submit, not on every keystroke (avoids cursor-position bugs). */
const sanitise=(val)=>{
  if(typeof val!=="string")return val;
  return val
    .replace(/\x00/g,"")                           // null bytes — corrupt Postgres text columns
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,"") // embedded script tags
    .replace(/javascript\s*:/gi,"")                // JS protocol in href/src attributes
    .replace(/on\w+\s*=/gi,"")                     // inline event handler attributes
    .trim()
    .slice(0,2000);                                 // hard cap — no field needs >2 000 chars
};
const sanitiseObj=(obj)=>{
  const out={};
  for(const[k,v]of Object.entries(obj))out[k]=typeof v==="string"?sanitise(v):v;
  return out;
};
const validateForm=(fields)=>{
  /* fields: {name:{value,required?,minLen?,maxLen?,pattern?,patternMsg?,label?}} */
  const errors={};
  for(const[name,rule]of Object.entries(fields)){
    const val=(rule.value??"").toString().trim();
    if(rule.required&&!val)errors[name]=`${rule.label||name} is required.`;
    else if(rule.minLen&&val.length<rule.minLen)errors[name]=`${rule.label||name} must be at least ${rule.minLen} characters.`;
    else if(rule.maxLen&&val.length>rule.maxLen)errors[name]=`${rule.label||name} must be at most ${rule.maxLen} characters.`;
    else if(rule.pattern&&!rule.pattern.test(val))errors[name]=rule.patternMsg||`${rule.label||name} format is invalid.`;
  }
  return{valid:Object.keys(errors).length===0,errors};
};


// Curated directory sample. Admin dashboard shows 1,247 total active users across
// the org (1,082 reps / 108 ASMs / 48 RSMs / 9 admins) — this is a representative
// slice of that population, cross-referencing the same people seen in Territory
// Management and the KPI leaderboard.
const USERS_DB=[
  {id:"U001",name:"Ramesh Sharma",email:"ramesh.sharma@sunavpulse.com",role:"rep",
   territory:"Pune Central",employeeId:"MR-2401",status:"active",
   joinedDate:"2023-03-14",lastLogin:"2026-06-19 08:32 AM"},
  {id:"U101",name:"Anita Verma",email:"anita.verma@sunavpulse.com",role:"rep",
   territory:"Pune Central",employeeId:"MR-2402",status:"active",
   joinedDate:"2023-05-02",lastLogin:"2026-06-18 09:10 AM"},
  {id:"U102",name:"Vikas Pillai",email:"vikas.pillai@sunavpulse.com",role:"rep",
   territory:"Pune Central",employeeId:"MR-2403",status:"active",
   joinedDate:"2022-11-20",lastLogin:"2026-06-19 08:05 AM"},
  {id:"U103",name:"Karan Mehta",email:"karan.mehta@sunavpulse.com",role:"rep",
   territory:"Pune East",employeeId:"MR-2404",status:"active",
   joinedDate:"2024-01-08",lastLogin:"2026-06-17 06:48 PM"},
  {id:"U104",name:"Sneha Joshi",email:"sneha.joshi@sunavpulse.com",role:"rep",
   territory:"Pune East",employeeId:"MR-2405",status:"active",
   joinedDate:"2023-08-19",lastLogin:"2026-06-18 11:22 AM"},
  {id:"U105",name:"Pooja Iyer",email:"pooja.iyer@sunavpulse.com",role:"rep",
   territory:"Nashik",employeeId:"MR-2406",status:"active",
   joinedDate:"2022-06-30",lastLogin:"2026-06-19 07:55 AM"},
  {id:"U106",name:"Rohit Malhotra",email:"rohit.malhotra@sunavpulse.com",role:"rep",
   territory:"Nashik",employeeId:"MR-2407",status:"active",
   joinedDate:"2024-02-14",lastLogin:"2026-06-16 04:30 PM"},
  {id:"U107",name:"Deepak Rao",email:"deepak.rao@sunavpulse.com",role:"rep",
   territory:"Aurangabad",employeeId:"MR-2408",status:"active",
   joinedDate:"2023-09-25",lastLogin:"2026-06-18 10:14 AM"},
  {id:"U109",name:"Farhan Sheikh",email:"farhan.sheikh@sunavpulse.com",role:"rep",
   territory:"Aurangabad",employeeId:"MR-2409",status:"inactive",
   joinedDate:"2021-04-11",lastLogin:"2026-04-02 09:00 AM"},
  {id:"U002",name:"Suresh Patel",email:"suresh.patel@sunavpulse.com",role:"area_manager",
   territory:"Pune Area",employeeId:"AM-1201",status:"active",
   joinedDate:"2020-07-01",lastLogin:"2026-06-19 08:00 AM"},
  {id:"U201",name:"Anjali Deshmukh",email:"anjali.deshmukh@sunavpulse.com",role:"area_manager",
   territory:"Nashik Area",employeeId:"AM-1202",status:"active",
   joinedDate:"2021-02-15",lastLogin:"2026-06-18 05:40 PM"},
  {id:"U202",name:"Vikram Joshi",email:"vikram.joshi@sunavpulse.com",role:"area_manager",
   territory:"Aurangabad Area",employeeId:"AM-1203",status:"active",
   joinedDate:"2021-09-08",lastLogin:"2026-06-17 02:18 PM"},
  {id:"U003",name:"Kavitha Reddy",email:"kavitha.reddy@sunavpulse.com",role:"regional_manager",
   territory:"Maharashtra Region",employeeId:"RM-0401",status:"active",
   joinedDate:"2019-01-20",lastLogin:"2026-06-19 07:45 AM"},
  {id:"U004",name:"Dev Kumar",email:"dev.kumar@sunavpulse.com",role:"admin",
   territory:"All Territories",employeeId:"AD-0001",status:"active",
   joinedDate:"2018-06-01",lastLogin:"2026-06-19 09:00 AM"},
  {id:"U005",name:"Lakshmi Narayan",email:"lakshmi.narayan@sunavpulse.com",role:"admin",
   territory:"All Territories",employeeId:"AD-0002",status:"active",
   joinedDate:"2019-11-12",lastLogin:"2026-06-15 01:20 PM"},
];

const AUDIT_LOG_INIT=[
  {id:"AL001",timestamp:"2026-06-19 08:32 AM",actor:"Ramesh Sharma",actorRole:"rep",
   category:"Auth",severity:"info",action:"Logged in",
   details:"Session started · Chrome on Windows · IP 103.214.x.x"},
  {id:"AL002",timestamp:"2026-06-18 04:00 PM",actor:"Suresh Patel",actorRole:"area_manager",
   category:"Approval",severity:"info",action:"Approved Chemist Visit CVR001",
   details:"Apollo Pharmacy — MG Road · order value ₹42,500"},
  {id:"AL003",timestamp:"2026-06-17 06:00 PM",actor:"Kavitha Reddy",actorRole:"regional_manager",
   category:"Approval",severity:"info",action:"Approved Route Plan RP001 (RSM stage)",
   details:"Week 3 — Pune Central Circuit · forwarded to ASM for final sign-off"},
  {id:"AL004",timestamp:"2026-06-17 11:05 AM",actor:"Ramesh Sharma",actorRole:"rep",
   category:"GPS",severity:"warning",action:"GPS override used",
   details:"Pharmacity — Phu Nhuan · 198m from registered location · reason: temporary relocation during renovation"},
  {id:"AL005",timestamp:"2026-06-16 09:15 AM",actor:"Dev Kumar",actorRole:"admin",
   category:"Admin",severity:"info",action:"Created user account",
   details:"New account provisioned for Farhan Sheikh (MR-2409), territory: Aurangabad"},
  {id:"AL006",timestamp:"2026-06-15 02:30 PM",actor:"System",actorRole:"admin",
   category:"System",severity:"info",action:"Scheduled offline sync completed",
   details:"23 queued records synced · 0 conflicts · duration 4.2s"},
  {id:"AL007",timestamp:"2026-06-15 10:30 AM",actor:"Suresh Patel",actorRole:"area_manager",
   category:"Approval",severity:"info",action:"Approved Chemist Visit CVR003",
   details:"MedPlus — District 3 · order value ₹28,000"},
  {id:"AL008",timestamp:"2026-06-14 03:45 PM",actor:"Kavitha Reddy",actorRole:"regional_manager",
   category:"Data",severity:"warning",action:"Rejected Leave Request",
   details:"Casual leave request for U108 Meera Nair · reason: insufficient coverage during territory review week"},
  {id:"AL009",timestamp:"2026-06-13 09:00 AM",actor:"Dev Kumar",actorRole:"admin",
   category:"Admin",severity:"critical",action:"Deactivated user account",
   details:"Account MR-2409 (Farhan Sheikh) marked inactive pending HR review"},
  {id:"AL010",timestamp:"2026-06-12 11:35 AM",actor:"Ramesh Sharma",actorRole:"rep",
   category:"GPS",severity:"warning",action:"GPS override used",
   details:"St. Mary's Medical Centre · 342m from registered location · reason: met contact in lobby cafeteria"},
  {id:"AL011",timestamp:"2026-06-10 09:02 AM",actor:"Suresh Patel",actorRole:"area_manager",
   category:"Approval",severity:"info",action:"Approved Hospital Visit HVR002",
   details:"Central Hospital · Dr. Preet Singh · supply value ₹82,500"},
  {id:"AL012",timestamp:"2026-06-08 08:15 PM",actor:"System",actorRole:"admin",
   category:"System",severity:"critical",action:"Elevated API error rate detected",
   details:"Error rate spiked to 0.18% for 6 minutes · auto-resolved · root cause: third-party maps tile provider timeout"},
  {id:"AL013",timestamp:"2026-06-05 01:00 PM",actor:"Dev Kumar",actorRole:"admin",
   category:"Admin",severity:"info",action:"Updated system configuration",
   details:"GPS geofence radius changed from 150m to 100m · approval workflow: staged RSM→ASM enabled"},
  {id:"AL014",timestamp:"2026-06-01 09:00 AM",actor:"Suresh Patel",actorRole:"area_manager",
   category:"Approval",severity:"info",action:"Approved Expense Claim EXP003",
   details:"May 2026 field expenses · ₹5,480 · Ramesh Sharma"},
  {id:"AL015",timestamp:"2026-05-28 03:10 PM",actor:"Kavitha Reddy",actorRole:"regional_manager",
   category:"Data",severity:"info",action:"Exported quarterly performance report",
   details:"Maharashtra Region · Q2 2026 · PDF · 4 territories included"},
];

const SYSTEM_CONFIG_INIT={
  geofenceRadius:100,
  autoCheckoutMinutes:30,
  offlineSyncIntervalMinutes:15,
  requireGpsForCallReport:true,
  stagedRouteApproval:true,
  autoEscalateDays:3,
  leaveResetPolicy:"calendar_year",
  emailDigest:true,
  smsAlerts:false,
  pushNotifications:true,
  sessionTimeoutMinutes:60,
  passwordExpiryDays:90,
  require2FA:false,
};


/* ═══════════════════════════════════════════════════
   PHASE 6 — SHARED TOGGLE SWITCH
═══════════════════════════════════════════════════ */
function Toggle({on,onChange,disabled}){
  return(
    <button onClick={()=>!disabled&&onChange(!on)} disabled={disabled}
      style={{width:42,height:24,borderRadius:99,border:"none",
        cursor:disabled?"not-allowed":"pointer",background:on?C.teal:C.border,
        position:"relative",transition:"background 0.2s",opacity:disabled?0.5:1,flexShrink:0}}>
      <div style={{width:18,height:18,borderRadius:99,background:"white",position:"absolute",
        top:3,left:on?21:3,transition:"left 0.2s",boxShadow:"0 1px 3px rgba(0,0,0,0.3)"}}/>
    </button>
  );
}

/* ═══════════════════════════════════════════════════
   PHASE 6 — USER MANAGEMENT
═══════════════════════════════════════════════════ */
function UserForm({editUser,onSave,onCancel}){
  const [f,setF]=useState(editUser||{name:"",email:"",role:"rep",territory:"",employeeId:""});
  const [errors,setErrors]=useState({});

  const submit=()=>{
    const e={};
    if(!f.name.trim()) e.name="Required";
    if(!f.email.trim()||!f.email.includes("@")) e.email="Valid email required";
    if(!f.territory.trim()) e.territory="Required";
    if(Object.keys(e).length){setErrors(e);return;}
    onSave(f);
  };

  return(
    <div style={{background:C.white,borderRadius:R.xl,padding:20,marginBottom:16,
      border:`1.5px solid ${C.teal}`,boxShadow:`0 0 0 3px ${C.tealBg}`}}>
      <div style={{fontSize:F.md,fontWeight:700,color:C.text,marginBottom:14}}>
        {editUser?"Edit User":"Add New User"}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:12,marginBottom:12}}>
        <div>
          <label style={{fontSize:F.xs,fontWeight:700,color:C.muted,display:"block",marginBottom:5}}>Full Name *</label>
          <input value={f.name} onChange={e=>{setF(p=>({...p,name:e.target.value}));setErrors(v=>({...v,name:""}));}}
            placeholder="e.g. Priya Nair"
            style={{width:"100%",padding:"9px 11px",border:`1.5px solid ${errors.name?C.danger:C.border}`,borderRadius:R.md,fontSize:F.base,color:C.text,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
          {errors.name&&<div style={{fontSize:F.xs,color:C.danger,marginTop:3}}>{errors.name}</div>}
        </div>
        <div>
          <label style={{fontSize:F.xs,fontWeight:700,color:C.muted,display:"block",marginBottom:5}}>Email *</label>
          <input value={f.email} onChange={e=>{setF(p=>({...p,email:e.target.value}));setErrors(v=>({...v,email:""}));}}
            placeholder="name@sunavpulse.com"
            style={{width:"100%",padding:"9px 11px",border:`1.5px solid ${errors.email?C.danger:C.border}`,borderRadius:R.md,fontSize:F.base,color:C.text,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
          {errors.email&&<div style={{fontSize:F.xs,color:C.danger,marginTop:3}}>{errors.email}</div>}
        </div>
        <div>
          <label style={{fontSize:F.xs,fontWeight:700,color:C.muted,display:"block",marginBottom:5}}>Role</label>
          <select value={f.role} onChange={e=>setF(p=>({...p,role:e.target.value}))}
            style={{width:"100%",padding:"9px 11px",border:`1.5px solid ${C.border}`,borderRadius:R.md,fontSize:F.base,color:C.text,outline:"none",fontFamily:"inherit",background:C.white}}>
            {Object.entries(ROLE_META).map(([k,m])=><option key={k} value={k}>{m.label}</option>)}
          </select>
        </div>
        <div>
          <label style={{fontSize:F.xs,fontWeight:700,color:C.muted,display:"block",marginBottom:5}}>Territory *</label>
          <input value={f.territory} onChange={e=>{setF(p=>({...p,territory:e.target.value}));setErrors(v=>({...v,territory:""}));}}
            placeholder="e.g. Pune Central"
            style={{width:"100%",padding:"9px 11px",border:`1.5px solid ${errors.territory?C.danger:C.border}`,borderRadius:R.md,fontSize:F.base,color:C.text,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
          {errors.territory&&<div style={{fontSize:F.xs,color:C.danger,marginTop:3}}>{errors.territory}</div>}
        </div>
      </div>
      {!editUser&&(
        <div style={{background:C.tealBg,borderRadius:R.md,padding:"10px 12px",marginBottom:12,
          display:"flex",gap:8,border:`1px solid ${C.teal}30`}}>
          <Zap size={13} color={C.tealDark} style={{flexShrink:0,marginTop:1}}/>
          <span style={{fontSize:F.xs,color:C.navyMed,lineHeight:1.5}}>
            Demo login credentials will be generated automatically (based on the name above) so this account
            can be signed into and tested right away, separate from the live employee directory.
          </span>
        </div>
      )}
      <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
        <Btn variant="secondary" onClick={onCancel} small>Cancel</Btn>
        <Btn variant="primary" icon={Save} onClick={submit} small>{editUser?"Save Changes":"Create User"}</Btn>
      </div>
    </div>
  );
}

function UserManagement({user,users,setUsers,onAudit,setExtraLogins,extraLogins,loginAs}){
  const [view,setView]=useState("list");
  const [editTarget,setEditTarget]=useState(null);
  const [search,setSearch]=useState("");
  const [roleF,setRoleF]=useState("all");
  const [newCreds,setNewCreds]=useState(null);
  const [copied,setCopied]=useState("");

  if(user.role!=="admin") return(
    <div style={{textAlign:"center",padding:"60px 0",color:C.muted}}>
      <Shield size={40} color={C.border} style={{display:"block",margin:"0 auto 12px"}}/>
      <div style={{fontSize:F.md,fontWeight:700}}>Administrator Access Only</div>
      <div style={{fontSize:F.sm,marginTop:4}}>User Management is visible to System Administrators.</div>
    </div>
  );

  const norm=s=>s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
  const filtered=users.filter(u=>{
    const q=norm(search);
    const matchS=!q||norm(u.name).includes(q)||norm(u.email).includes(q)||norm(u.territory).includes(q);
    const matchR=roleF==="all"||u.role===roleF;
    return matchS&&matchR;
  });

  const activeCount=users.filter(u=>u.status==="active").length;
  const roleCounts=Object.keys(ROLE_META).map(k=>({role:k,count:users.filter(u=>u.role===k).length}));

  const slugify=(name)=>name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")
    .replace(/[^a-z\s]/g,"").trim().split(/\s+/).filter(Boolean).join(".");

  const saveUser=(f)=>{ f=sanitiseObj(f);
    if(editTarget){
      setUsers(p=>p.map(u=>u.id===editTarget.id?{...u,...f}:u));
      onAudit&&onAudit(user.name,user.role,"Admin","critical","Updated user account",`${f.name} (${editTarget.employeeId}) · role: ${ROLE_META[f.role].label}, territory: ${f.territory}`);
      setView("list");setEditTarget(null);
    }else{
      const allLoginIds=new Set([...Object.keys(DEMO_USERS),...Object.keys(extraLogins||{})]);
      let base=slugify(f.name)||"user"+Math.floor(Math.random()*1000);
      let loginId=base+".demo", n=2;
      while(allLoginIds.has(loginId)){loginId=base+n+".demo";n++;}
      const initials=f.name.trim().split(/\s+/).map(w=>w[0]).join("").toUpperCase().slice(0,2)||"NU";
      const empId="NEW-"+Math.floor(1000+Math.random()*9000);
      const nu={...f,id:"U"+Date.now(),employeeId:empId,
        status:"active",joinedDate:new Date().toISOString().split("T")[0],lastLogin:"Never (not yet tested)",loginId};
      setUsers(p=>[nu,...p]);
      const loginUser={id:nu.id,name:f.name,initials,role:f.role,roleLabel:ROLE_META[f.role].label,
        territory:f.territory,employeeId:empId,teamSize:f.role==="rep"?null:0,email:f.email};
      setExtraLogins&&setExtraLogins(p=>({...p,[loginId]:loginUser}));
      onAudit&&onAudit(user.name,user.role,"Admin","info","Created user account",`New account provisioned for ${f.name}, territory: ${f.territory} · demo login: ${loginId}`);
      setView("list");setEditTarget(null);
      setNewCreds({loginId,password:"Demo@2024",name:f.name,roleLabel:ROLE_META[f.role].label,loginUser});
    }
  };

  const toggleStatus=(u)=>{
    const next=u.status==="active"?"inactive":"active";
    setUsers(p=>p.map(x=>x.id===u.id?{...x,status:next}:x));
    onAudit&&onAudit(user.name,user.role,"Admin",next==="inactive"?"critical":"info",
      next==="inactive"?"Deactivated user account":"Reactivated user account",
      `${u.name} (${u.employeeId})`);
  };

  const copyText=(text,label)=>{
    if(navigator.clipboard&&navigator.clipboard.writeText) navigator.clipboard.writeText(text).catch(()=>{});
    setCopied(label);setTimeout(()=>setCopied(""),1500);
  };

  return(
    <div>
      {newCreds&&(
        <div style={{background:C.successBg,border:`1.5px solid ${C.success}`,borderRadius:R.xl,
          padding:18,marginBottom:16}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
            <CheckCircle size={18} color={C.success}/>
            <div style={{fontSize:F.md,fontWeight:800,color:C.text}}>Account created — ready to test</div>
          </div>
          <div style={{fontSize:F.sm,color:C.text,marginBottom:12}}>
            <b>{newCreds.name}</b> ({newCreds.roleLabel}) can now sign in to this demo using the credentials below,
            or you can jump straight in without leaving this screen.
          </div>
          <div style={{display:"flex",gap:24,marginBottom:14,flexWrap:"wrap"}}>
            <div>
              <div style={{fontSize:F.xs,color:C.muted,textTransform:"uppercase",fontWeight:700,letterSpacing:"0.5px"}}>Employee ID</div>
              <div style={{display:"flex",alignItems:"center",gap:8,marginTop:2}}>
                <span style={{fontSize:F.lg,fontWeight:800,color:C.navy,fontFamily:"monospace"}}>{newCreds.loginId}</span>
                <button onClick={()=>copyText(newCreds.loginId,"id")} title="Copy"
                  style={{border:"none",background:"none",cursor:"pointer",padding:2,display:"flex"}}>
                  <Copy size={13} color={C.muted}/>
                </button>
                {copied==="id"&&<span style={{fontSize:F.xs,color:C.success,fontWeight:700}}>Copied!</span>}
              </div>
            </div>
            <div>
              <div style={{fontSize:F.xs,color:C.muted,textTransform:"uppercase",fontWeight:700,letterSpacing:"0.5px"}}>Password</div>
              <div style={{display:"flex",alignItems:"center",gap:8,marginTop:2}}>
                <span style={{fontSize:F.lg,fontWeight:800,color:C.navy,fontFamily:"monospace"}}>{newCreds.password}</span>
                <button onClick={()=>copyText(newCreds.password,"pwd")} title="Copy"
                  style={{border:"none",background:"none",cursor:"pointer",padding:2,display:"flex"}}>
                  <Copy size={13} color={C.muted}/>
                </button>
                {copied==="pwd"&&<span style={{fontSize:F.xs,color:C.success,fontWeight:700}}>Copied!</span>}
              </div>
            </div>
          </div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {loginAs&&<Btn variant="primary" icon={LogIn} small
              onClick={()=>{const lu=newCreds.loginUser;setNewCreds(null);loginAs(lu);}}>
              Login as {newCreds.name.split(" ")[0]} Now
            </Btn>}
            <Btn variant="secondary" small onClick={()=>setNewCreds(null)}>Dismiss</Btn>
          </div>
          <div style={{fontSize:F.xs,color:C.muted,marginTop:10,lineHeight:1.5}}>
            These credentials also work from the main login screen — useful for testing in another browser tab
            or signing back in as this user later. You'll return to your admin session via the banner shown while testing.
          </div>
        </div>
      )}

      {/* Summary cards */}
      <div style={{display:"flex",gap:12,marginBottom:16,flexWrap:"wrap"}}>
        <MetricCard label="Total Users (sample)" value={users.length} icon={Users} iconColor={C.teal}
          sub="of 1,247 org-wide"/>
        <MetricCard label="Active" value={activeCount} icon={CheckCircle} iconColor={C.success}
          trend={`${users.length-activeCount} inactive`} trendDir="up"/>
        {roleCounts.map(rc=>(
          <MetricCard key={rc.role} label={ROLE_META[rc.role].label.split(" ")[0]+"s"} value={rc.count}
            icon={UserCheck} iconColor={ROLE_META[rc.role].color}/>
        ))}
      </div>

      {view==="form"&&(
        <UserForm editUser={editTarget} onSave={saveUser} onCancel={()=>{setView("list");setEditTarget(null);}}/>
      )}

      <div style={{display:"flex",gap:10,marginBottom:14,alignItems:"center",flexWrap:"wrap"}}>
        <div style={{flex:1,minWidth:200,display:"flex",alignItems:"center",gap:8,background:C.white,
          borderRadius:R.lg,padding:"9px 13px",border:`1px solid ${C.border}`}}>
          <Search size={16} color={C.muted}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name, email, territory…"
            style={{border:"none",background:"none",flex:1,fontSize:F.base,color:C.text,outline:"none",fontFamily:"inherit"}}/>
        </div>
        <select value={roleF} onChange={e=>setRoleF(e.target.value)}
          style={{padding:"9px 13px",border:`1px solid ${C.border}`,borderRadius:R.lg,fontSize:F.sm,
            color:C.text,fontFamily:"inherit",background:C.white,outline:"none"}}>
          <option value="all">All Roles</option>
          {Object.entries(ROLE_META).map(([k,m])=><option key={k} value={k}>{m.label}</option>)}
        </select>
        <Btn variant="primary" icon={Plus} onClick={()=>{setEditTarget(null);setView("form");}}>Add User</Btn>
      </div>

      <SectionCard title={`Directory (${filtered.length})`}>
        <div style={{overflowX:"auto",WebkitOverflowScrolling:"touch"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:F.sm}}>
          <thead><tr>{["Name","Role","Territory","Status","Last Login",""].map((h,i)=>(
            <th key={i} style={{padding:"8px 10px",textAlign:"left",fontWeight:700,color:C.muted,
              borderBottom:`2px solid ${C.teal}`,fontSize:F.xs,textTransform:"uppercase",letterSpacing:"0.5px"}}>{h}</th>
          ))}</tr></thead>
          <tbody>{filtered.map((u,i)=>{
            const rm=ROLE_META[u.role]||ROLE_META.rep;
            return(
              <tr key={u.id} style={{background:i%2===0?C.white:C.bg}}>
                <td style={{padding:"10px"}}>
                  <div style={{fontWeight:700,color:C.text}}>{u.name}</div>
                  <div style={{fontSize:F.xs,color:C.muted,display:"flex",alignItems:"center",gap:6}}>
                    {u.email}
                    {u.loginId&&<span style={{padding:"1px 7px",borderRadius:R.full,fontSize:9,fontWeight:700,
                      background:C.tealBg,color:C.tealDark,textTransform:"uppercase",letterSpacing:"0.3px"}}>Test Account</span>}
                  </div>
                </td>
                <td style={{padding:"10px"}}>
                  <span style={{padding:"2px 9px",borderRadius:R.full,fontSize:F.xs,fontWeight:700,
                    background:rm.bg,color:rm.color}}>{rm.label}</span>
                </td>
                <td style={{padding:"10px",color:C.text}}>{u.territory}</td>
                <td style={{padding:"10px"}}>
                  <span style={{padding:"2px 9px",borderRadius:R.full,fontSize:F.xs,fontWeight:700,
                    background:u.status==="active"?C.successBg:C.dangerBg,
                    color:u.status==="active"?C.success:C.danger}}>
                    {u.status==="active"?"Active":"Inactive"}
                  </span>
                </td>
                <td style={{padding:"10px",color:C.muted,fontSize:F.xs}}>{u.lastLogin}</td>
                <td style={{padding:"10px"}}>
                  <div style={{display:"flex",gap:6,justifyContent:"flex-end"}}>
                    {u.loginId&&loginAs&&extraLogins&&extraLogins[u.loginId]&&(
                      <button onClick={()=>loginAs(extraLogins[u.loginId])} title={`Login as ${u.name} (testing)`}
                        style={{width:36,height:36,border:`1px solid ${C.teal}`,borderRadius:R.md,
                          background:C.tealBg,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                        <LogIn size={13} color={C.tealDark}/>
                      </button>
                    )}
                    <button onClick={()=>{setEditTarget(u);setView("form");}} title="Edit"
                      style={{width:36,height:36,border:`1px solid ${C.border}`,borderRadius:R.md,
                        background:C.white,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                      <Edit2 size={13} color={C.muted}/>
                    </button>
                    <button onClick={()=>toggleStatus(u)} title={u.status==="active"?"Deactivate":"Reactivate"}
                      style={{width:36,height:36,border:`1px solid ${u.status==="active"?C.danger:C.success}30`,
                        borderRadius:R.md,background:u.status==="active"?C.dangerBg:C.successBg,cursor:"pointer",
                        display:"flex",alignItems:"center",justifyContent:"center"}}>
                      {u.status==="active"?<XCircle size={13} color={C.danger}/>:<CheckCircle size={13} color={C.success}/>}
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
          {filtered.length===0&&(
            <tr><td colSpan={6} style={{padding:"24px",textAlign:"center",color:C.muted}}>No users match your search.</td></tr>
          )}
          </tbody>
        </table>
        </div>
      </SectionCard>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   PHASE 6 — AUDIT LOGS
═══════════════════════════════════════════════════ */
const AUDIT_CATEGORY_META={
  Auth:{icon:Lock,color:C.info},
  Approval:{icon:CheckCircle,color:C.success},
  GPS:{icon:MapPin,color:C.warning},
  Data:{icon:Database,color:C.navyMed},
  Admin:{icon:UserCheck,color:C.purple},
  System:{icon:Globe,color:C.muted},
};

function AuditLogs({user,auditLog}){
  const [catF,setCatF]=useState("all");
  const [sevF,setSevF]=useState("all");
  const [search,setSearch]=useState("");

  const canView=["regional_manager","admin"].includes(user.role);
  if(!canView) return(
    <div style={{textAlign:"center",padding:"60px 0",color:C.muted}}>
      <Shield size={40} color={C.border} style={{display:"block",margin:"0 auto 12px"}}/>
      <div style={{fontSize:F.md,fontWeight:700}}>Regional Manager Access Only</div>
      <div style={{fontSize:F.sm,marginTop:4}}>Audit Logs are visible to RSM and Admin roles.</div>
    </div>
  );

  const norm=s=>s.toLowerCase();
  const filtered=auditLog.filter(a=>
    (catF==="all"||a.category===catF)&&
    (sevF==="all"||a.severity===sevF)&&
    (!search||norm(a.actor).includes(norm(search))||norm(a.action).includes(norm(search))||norm(a.details).includes(norm(search)))
  );

  const counts={
    total:auditLog.length,
    critical:auditLog.filter(a=>a.severity==="critical").length,
    warning:auditLog.filter(a=>a.severity==="warning").length,
    approvals:auditLog.filter(a=>a.category==="Approval").length,
    gpsOverrides:auditLog.filter(a=>a.category==="GPS").length,
  };

  return(
    <div>
      <div style={{display:"flex",gap:12,marginBottom:16,flexWrap:"wrap"}}>
        <MetricCard label="Total Events" value={counts.total} icon={Database} iconColor={C.navyMed}/>
        <MetricCard label="Critical" value={counts.critical} icon={AlertTriangle} iconColor={C.danger}/>
        <MetricCard label="Warnings" value={counts.warning} icon={AlertTriangle} iconColor={C.warning}/>
        <MetricCard label="Approvals Logged" value={counts.approvals} icon={CheckCircle} iconColor={C.success}/>
        <MetricCard label="GPS Overrides" value={counts.gpsOverrides} icon={MapPin} iconColor={C.warning}/>
      </div>

      <div style={{display:"flex",gap:10,marginBottom:14,alignItems:"center",flexWrap:"wrap"}}>
        <div style={{flex:1,minWidth:200,display:"flex",alignItems:"center",gap:8,background:C.white,
          borderRadius:R.lg,padding:"9px 13px",border:`1px solid ${C.border}`}}>
          <Search size={16} color={C.muted}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by actor, action, or details…"
            style={{border:"none",background:"none",flex:1,fontSize:F.base,color:C.text,outline:"none",fontFamily:"inherit"}}/>
        </div>
        <select value={catF} onChange={e=>setCatF(e.target.value)}
          style={{padding:"9px 13px",border:`1px solid ${C.border}`,borderRadius:R.lg,fontSize:F.sm,
            color:C.text,fontFamily:"inherit",background:C.white,outline:"none"}}>
          <option value="all">All Categories</option>
          {Object.keys(AUDIT_CATEGORY_META).map(k=><option key={k} value={k}>{k}</option>)}
        </select>
        <div style={{display:"flex",gap:6}}>
          {["all","info","warning","critical"].map(s=>(
            <button key={s} onClick={()=>setSevF(s)} style={{padding:"7px 13px",borderRadius:R.full,
              border:`1.5px solid ${sevF===s?C.teal:C.border}`,background:sevF===s?C.tealBg:C.white,
              color:sevF===s?C.tealDark:C.muted,fontSize:F.sm,fontWeight:sevF===s?700:500,
              cursor:"pointer",fontFamily:"inherit",textTransform:"capitalize"}}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        {filtered.map(a=>{
          const cm=AUDIT_CATEGORY_META[a.category]||AUDIT_CATEGORY_META.System;
          const Icon=cm.icon;
          const sevColor=a.severity==="critical"?C.danger:a.severity==="warning"?C.warning:C.muted;
          return(
            <div key={a.id} style={{display:"flex",gap:12,background:C.white,borderRadius:R.lg,padding:"12px 14px",
              border:`1px solid ${C.border}`,borderLeft:`3px solid ${sevColor}`}}>
              <div style={{width:32,height:32,borderRadius:R.lg,background:cm.color+"18",flexShrink:0,
                display:"flex",alignItems:"center",justifyContent:"center"}}>
                <Icon size={15} color={cm.color}/>
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8,marginBottom:2}}>
                  <div style={{display:"flex",alignItems:"center",gap:7,flexWrap:"wrap"}}>
                    <span style={{fontSize:F.base,fontWeight:700,color:C.text}}>{a.action}</span>
                    <span style={{fontSize:F.xs,padding:"1px 7px",borderRadius:R.full,fontWeight:700,
                      background:cm.color+"18",color:cm.color}}>{a.category}</span>
                    {a.severity!=="info"&&<span style={{fontSize:F.xs,padding:"1px 7px",borderRadius:R.full,fontWeight:700,
                      background:a.severity==="critical"?C.dangerBg:C.warningBg,
                      color:a.severity==="critical"?C.danger:C.warning,textTransform:"capitalize"}}>{a.severity}</span>}
                  </div>
                  <span style={{fontSize:F.xs,color:C.muted,whiteSpace:"nowrap",flexShrink:0}}>{a.timestamp}</span>
                </div>
                <div style={{fontSize:F.sm,color:C.muted,marginBottom:2}}>by <b style={{color:C.text}}>{a.actor}</b></div>
                <div style={{fontSize:F.sm,color:C.text,lineHeight:1.5}}>{a.details}</div>
              </div>
            </div>
          );
        })}
        {filtered.length===0&&(
          <div style={{textAlign:"center",padding:"40px 0",color:C.muted}}>
            <Database size={36} color={C.border} style={{display:"block",margin:"0 auto 10px"}}/>
            <div style={{fontSize:F.md,fontWeight:700}}>No events match your filters</div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   PHASE 6 — SYSTEM CONFIG
═══════════════════════════════════════════════════ */
function SystemConfig({user,config,setConfig}){
  const [draft,setDraft]=useState(config);
  const [saved,setSaved]=useState(false);
  const dirty=JSON.stringify(draft)!==JSON.stringify(config);

  if(user.role!=="admin") return(
    <div style={{textAlign:"center",padding:"60px 0",color:C.muted}}>
      <Shield size={40} color={C.border} style={{display:"block",margin:"0 auto 12px"}}/>
      <div style={{fontSize:F.md,fontWeight:700}}>Administrator Access Only</div>
      <div style={{fontSize:F.sm,marginTop:4}}>System Configuration is visible to System Administrators.</div>
    </div>
  );

  const set=(k,v)=>setDraft(p=>({...p,[k]:v}));
  const save=()=>{
    setConfig(draft);
    setSaved(true);
    setTimeout(()=>setSaved(false),2500);
  };
  const reset=()=>setDraft(config);

  const Row=({label,desc,children})=>(
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:16,
      padding:"12px 0",borderBottom:`0.5px solid ${C.border}`}}>
      <div style={{flex:1}}>
        <div style={{fontSize:F.base,fontWeight:600,color:C.text}}>{label}</div>
        {desc&&<div style={{fontSize:F.xs,color:C.muted,marginTop:2}}>{desc}</div>}
      </div>
      <div style={{flexShrink:0}}>{children}</div>
    </div>
  );
  const NumInput=({value,onChange,suffix,width=70})=>(
    <div style={{display:"flex",alignItems:"center",gap:6}}>
      <input type="number" value={value} onChange={e=>onChange(Number(e.target.value))}
        style={{width,padding:"7px 9px",border:`1.5px solid ${C.border}`,borderRadius:R.md,
          fontSize:F.sm,color:C.text,outline:"none",fontFamily:"inherit",textAlign:"center"}}/>
      {suffix&&<span style={{fontSize:F.xs,color:C.muted}}>{suffix}</span>}
    </div>
  );

  return(
    <div style={{maxWidth:780}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div>
          <div style={{fontSize:F.lg,fontWeight:800,color:C.text}}>System Configuration</div>
          <div style={{fontSize:F.sm,color:C.muted}}>Platform-wide settings for SunaV Pulse</div>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          {saved&&<Badge type="success">Saved ✓</Badge>}
          {dirty&&!saved&&<Btn variant="secondary" small onClick={reset}>Discard</Btn>}
          <Btn variant="primary" icon={Save} onClick={save} disabled={!dirty} small>Save Changes</Btn>
        </div>
      </div>

      <div style={{background:C.infoBg,borderRadius:R.lg,padding:"10px 14px",marginBottom:16,
        display:"flex",gap:8,border:`1px solid ${C.info}30`}}>
        <Zap size={14} color={C.info} style={{flexShrink:0,marginTop:1}}/>
        <span style={{fontSize:F.xs,color:C.navyMed,lineHeight:1.5}}>
          The GPS Geofence Radius below is live-wired: it directly controls the verification
          distance used in Call Reports → GPS Check-In. Other settings here are recorded
          and reflected on this screen but are illustrative for this demo build.
        </span>
      </div>

      <SectionCard title="Field Operations">
        <Row label="GPS Geofence Radius" desc="Maximum distance from a doctor's registered location to count as a verified check-in. Live-wired to Call Reports.">
          <NumInput value={draft.geofenceRadius} onChange={v=>set("geofenceRadius",v)} suffix="meters"/>
        </Row>
        <Row label="Auto-Checkout Timer" desc="Automatically close an unfinished visit after this many minutes of inactivity.">
          <NumInput value={draft.autoCheckoutMinutes} onChange={v=>set("autoCheckoutMinutes",v)} suffix="min"/>
        </Row>
        <Row label="Offline Sync Interval" desc="How often the app attempts to sync queued offline records when connectivity returns.">
          <NumInput value={draft.offlineSyncIntervalMinutes} onChange={v=>set("offlineSyncIntervalMinutes",v)} suffix="min"/>
        </Row>
        <Row label="Require GPS for Call Reports" desc="Reps must complete GPS check-in (or a justified override) before submitting a call report.">
          <Toggle on={draft.requireGpsForCallReport} onChange={v=>set("requireGpsForCallReport",v)}/>
        </Row>
      </SectionCard>

      <SectionCard title="Approvals & Workflow" style={{marginTop:16}}>
        <Row label="Staged Route Plan Approval" desc="Require RSM approval before a route plan becomes eligible for ASM sign-off.">
          <Toggle on={draft.stagedRouteApproval} onChange={v=>set("stagedRouteApproval",v)}/>
        </Row>
        <Row label="Auto-Escalate Pending Approvals" desc="Notify the next-level manager if an approval sits pending longer than this.">
          <NumInput value={draft.autoEscalateDays} onChange={v=>set("autoEscalateDays",v)} suffix="days"/>
        </Row>
        <Row label="Leave Balance Reset Policy" desc="When annual leave balances reset for all employees.">
          <select value={draft.leaveResetPolicy} onChange={e=>set("leaveResetPolicy",e.target.value)}
            style={{padding:"7px 11px",border:`1.5px solid ${C.border}`,borderRadius:R.md,fontSize:F.sm,
              color:C.text,fontFamily:"inherit",background:C.white,outline:"none"}}>
            <option value="calendar_year">Calendar Year (Jan 1)</option>
            <option value="fiscal_year">Fiscal Year (Apr 1)</option>
            <option value="anniversary">Employee Anniversary</option>
          </select>
        </Row>
      </SectionCard>

      <SectionCard title="Notifications" style={{marginTop:16}}>
        <Row label="Daily Email Digest" desc="Send managers a daily summary of pending approvals and team activity.">
          <Toggle on={draft.emailDigest} onChange={v=>set("emailDigest",v)}/>
        </Row>
        <Row label="SMS Alerts" desc="Send SMS for critical events such as GPS overrides or rejected submissions.">
          <Toggle on={draft.smsAlerts} onChange={v=>set("smsAlerts",v)}/>
        </Row>
        <Row label="Push Notifications" desc="Mobile push notifications for approvals, reminders, and schedule changes.">
          <Toggle on={draft.pushNotifications} onChange={v=>set("pushNotifications",v)}/>
        </Row>
      </SectionCard>

      <SectionCard title="Security" style={{marginTop:16}}>
        <Row label="Session Timeout" desc="Automatically log out inactive sessions after this duration.">
          <NumInput value={draft.sessionTimeoutMinutes} onChange={v=>set("sessionTimeoutMinutes",v)} suffix="min"/>
        </Row>
        <Row label="Password Expiry" desc="Force a password reset after this many days.">
          <NumInput value={draft.passwordExpiryDays} onChange={v=>set("passwordExpiryDays",v)} suffix="days"/>
        </Row>
        <Row label="Require Two-Factor Authentication" desc="Mandate 2FA for all Area Manager, Regional Manager, and Admin accounts.">
          <Toggle on={draft.require2FA} onChange={v=>set("require2FA",v)}/>
        </Row>
      </SectionCard>
    </div>
  );
}


/* ═══════════════════════════════════════════════════
   ROUTE PLANNING COMPONENTS
═══════════════════════════════════════════════════ */
function RoutePlanCard({plan,onClick}){
  const sm=RP_STATUS_CFG[plan.status]||RP_STATUS_CFG.draft;
  const accentMap={draft:C.border,submitted:C.warning,rsm_approved:C.info,
    asm_approved:C.success,rsm_rejected:C.danger,asm_rejected:C.danger};
  return(
    <div onClick={()=>onClick(plan)} style={{background:C.white,borderRadius:R.xl,padding:16,
      border:`1px solid ${C.border}`,cursor:"pointer",
      borderLeft:`4px solid ${accentMap[plan.status]||C.border}`}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:F.md,fontWeight:700,color:C.text,marginBottom:2}}>{plan.title}</div>
          <div style={{fontSize:F.sm,color:C.muted}}>
            {plan.repName} · {plan.territory} · 📅 {plan.planDate}
          </div>
        </div>
        <span style={{padding:"3px 10px",borderRadius:R.full,fontSize:F.xs,fontWeight:700,
          background:sm.bg,color:sm.c,flexShrink:0,marginLeft:10}}>{sm.label}</span>
      </div>
      <div style={{display:"flex",gap:16,marginBottom:12}}>
        {[["Stops",plan.stops.length],["Est. km",plan.estimatedKm+" km"],["Submitted",plan.submittedAt]].map(([l,v])=>(
          <div key={l}>
            <div style={{fontSize:F.xs,color:C.muted}}>{l}</div>
            <div style={{fontSize:F.sm,fontWeight:700,color:C.text,marginTop:1}}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
        {plan.stops.map((s,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:4,background:C.bg,
            borderRadius:R.full,padding:"3px 9px",border:`1px solid ${C.border}`}}>
            <div style={{width:16,height:16,borderRadius:99,background:C.navyMed,
              display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:9,fontWeight:800,color:"white"}}>{s.order}</div>
            <span style={{fontSize:F.xs,color:C.text}}>{s.time}</span>
            <span style={{fontSize:F.xs,color:C.muted}}>·</span>
            <span style={{fontSize:F.xs,color:C.text}}>{s.docName.split(" ").slice(-1)[0]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StopRow({stop,index,onRemove,canEdit}){
  return(
    <div style={{display:"flex",gap:10,alignItems:"flex-start",padding:"10px 0",
      borderBottom:`0.5px solid ${C.border}`}}>
      <div style={{width:24,height:24,borderRadius:99,background:C.navyMed,
        display:"flex",alignItems:"center",justifyContent:"center",
        fontSize:F.xs,fontWeight:800,color:"white",flexShrink:0,marginTop:2}}>{index+1}</div>
      <div style={{flex:1}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div>
            <div style={{fontSize:F.base,fontWeight:700,color:C.text}}>{stop.docName}</div>
            <div style={{fontSize:F.sm,color:C.muted}}>{stop.spec} · {stop.hosp}</div>
          </div>
          <span style={{fontSize:F.sm,fontWeight:700,color:C.navyMed,marginLeft:8}}>{stop.time}</span>
        </div>
        {stop.purpose&&<div style={{fontSize:F.sm,color:C.muted,marginTop:4,display:"flex",gap:4,alignItems:"flex-start"}}>
          <ChevronRight size={13} color={C.teal} style={{flexShrink:0,marginTop:1}}/>
          {stop.purpose}
        </div>}
        {stop.products.length>0&&<div style={{display:"flex",gap:5,marginTop:5,flexWrap:"wrap"}}>
          {stop.products.map(pid=>{const p=PRODUCTS_DB.find(x=>x.id===pid);return p?(
            <span key={pid} style={{fontSize:F.xs,padding:"2px 7px",borderRadius:R.full,
              background:p.col+"18",color:p.col,fontWeight:600}}>{p.name}</span>):null;})}
        </div>}
      </div>
      {canEdit&&<button onClick={()=>onRemove(stop.sid)} style={{background:C.dangerBg,border:"none",
        borderRadius:R.md,padding:"4px 8px",cursor:"pointer",color:C.danger,fontSize:F.xs,fontWeight:700,flexShrink:0}}>
        Remove
      </button>}
    </div>
  );
}

function RoutePlanForm({onSubmit,onCancel,isOnline,queueForSync}){
  const [title,setTitle]=useState("");
  const [planDate,setPlanDate]=useState("");
  const [notes,setNotes]=useState("");
  const [estKm,setEstKm]=useState("");
  const [stops,setStops]=useState([]);
  const [errors,setErrors]=useState({});
  const [addingStop,setAddingStop]=useState(false);
  const [sf,setSf]=useState({docId:"",time:"",products:[],purpose:""});
  const [submitting,setSubmitting]=useState(false);

  const toggleSfProd=(pid)=>setSf(p=>({...p,products:p.products.includes(pid)?p.products.filter(x=>x!==pid):[...p.products,pid]}));

  const addStop=()=>{
    if(!sf.docId||!sf.time)return;
    const doc=DOCTORS_DB_INIT.find(d=>d.id===sf.docId);
    if(!doc)return;
    const ns={sid:"S"+(Date.now()),order:stops.length+1,time:sf.time,
      docId:sf.docId,docName:doc.name,spec:doc.spec,hosp:doc.hosp,
      products:sf.products,purpose:sf.purpose};
    setStops(p=>[...p,ns]);
    setSf({docId:"",time:"",products:[],purpose:""});
    setAddingStop(false);
    setErrors(e=>({...e,stops:""}));
  };

  const removeStop=(sid)=>setStops(p=>p.filter(s=>s.sid!==sid).map((s,i)=>({...s,order:i+1})));

  const submit=async()=>{
    const e={};
    if(!title.trim()) e.title="Plan title is required";
    if(!planDate) e.planDate="Plan date is required";
    if(stops.length===0) e.stops="Add at least one stop";
    if(Object.keys(e).length){setErrors(e);return;}
    setSubmitting(true);
    await new Promise(r=>setTimeout(r,800));
    const rpStatus=(isOnline===false)?"queued":"submitted";
    const rpObj={id:"RP"+Date.now(),title,planDate,notes,
      estimatedKm:parseInt(estKm)||stops.length*7,stops,
      status:rpStatus,submittedAt:new Date().toISOString().split("T")[0],
      repId:"U001",repName:"Ramesh Sharma",territory:"Pune Central",
      rsmNote:"",asmNote:"",
      rsmApprovedBy:null,rsmApprovedAt:null,
      asmApprovedBy:null,asmApprovedAt:null};
    onSubmit(rpObj);
    if(isOnline===false&&queueForSync) queueForSync("route_plan","Route · "+title+" · "+planDate,rpObj);
    setSubmitting(false);
  };

  return(
    <div style={{maxWidth:660,margin:"0 auto",display:"flex",flexDirection:"column",gap:14}}>
      {/* Plan details */}
      <SectionCard title="Plan Details">
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div>
            <label style={{fontSize:F.xs,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:"0.5px",display:"block",marginBottom:5}}>Plan Title *</label>
            <input value={title} onChange={e=>{setTitle(e.target.value);setErrors(v=>({...v,title:""}));}}
              placeholder="e.g. Week 3 — Pune Central Circuit"
              style={{width:"100%",padding:"9px 11px",border:`1.5px solid ${errors.title?C.danger:C.border}`,borderRadius:R.md,fontSize:F.base,color:C.text,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
            {errors.title&&<div style={{fontSize:F.xs,color:C.danger,marginTop:3}}>{errors.title}</div>}
          </div>
          <div style={{display:"flex",gap:12}}>
            <div style={{flex:1}}>
              <label style={{fontSize:F.xs,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:"0.5px",display:"block",marginBottom:5}}>Plan Date *</label>
              <input type="date" value={planDate} onChange={e=>{setPlanDate(e.target.value);setErrors(v=>({...v,planDate:""}));}}
                style={{width:"100%",padding:"9px 11px",border:`1.5px solid ${errors.planDate?C.danger:C.border}`,borderRadius:R.md,fontSize:F.base,color:C.text,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
              {errors.planDate&&<div style={{fontSize:F.xs,color:C.danger,marginTop:3}}>{errors.planDate}</div>}
            </div>
            <div style={{flex:1}}>
              <label style={{fontSize:F.xs,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:"0.5px",display:"block",marginBottom:5}}>Estimated Distance (km)</label>
              <input type="number" value={estKm} onChange={e=>setEstKm(e.target.value)} placeholder="Auto-calculated if blank"
                style={{width:"100%",padding:"9px 11px",border:`1.5px solid ${C.border}`,borderRadius:R.md,fontSize:F.base,color:C.text,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
            </div>
          </div>
          <div>
            <label style={{fontSize:F.xs,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:"0.5px",display:"block",marginBottom:5}}>Notes</label>
            <textarea value={notes} onChange={e=>setNotes(e.target.value)}
              placeholder="Key objectives, items to carry, special instructions…"
              style={{width:"100%",padding:"9px 11px",border:`1.5px solid ${C.border}`,borderRadius:R.md,fontSize:F.base,color:C.text,resize:"none",height:64,fontFamily:"inherit",outline:"none",boxSizing:"border-box"}}/>
          </div>
        </div>
      </SectionCard>

      {/* Stops */}
      <SectionCard title={`Route Stops (${stops.length})`}
        action={<Btn variant="primary" icon={Plus} small onClick={()=>setAddingStop(true)}>Add Stop</Btn>}>
        {errors.stops&&<div style={{fontSize:F.sm,color:C.danger,marginBottom:8,display:"flex",gap:5,alignItems:"center"}}>
          <XCircle size={13}/>{errors.stops}</div>}
        {stops.length===0&&!addingStop&&(
          <div style={{textAlign:"center",padding:"28px 0",color:C.muted}}>
            <MapPin size={32} color={C.border} style={{display:"block",margin:"0 auto 8px"}}/>
            <div style={{fontSize:F.base,fontWeight:600}}>No stops added yet</div>
            <div style={{fontSize:F.sm,marginTop:3}}>Click "Add Stop" to build your route</div>
          </div>
        )}
        {stops.map((s,i)=><StopRow key={s.sid} stop={s} index={i} onRemove={removeStop} canEdit={true}/>)}

        {/* Add Stop inline form */}
        {addingStop&&(
          <div style={{background:C.bg,borderRadius:R.lg,padding:14,marginTop:12,border:`1.5px solid ${C.teal}`}}>
            <div style={{fontSize:F.sm,fontWeight:700,color:C.navyMed,marginBottom:10}}>New Stop</div>
            <div style={{display:"flex",gap:10,marginBottom:10}}>
              <div style={{flex:2}}>
                <label style={{fontSize:F.xs,fontWeight:700,color:C.muted,display:"block",marginBottom:4}}>Doctor *</label>
                <select value={sf.docId} onChange={e=>setSf(p=>({...p,docId:e.target.value}))}
                  style={{width:"100%",padding:"8px 10px",border:`1.5px solid ${C.border}`,borderRadius:R.md,fontSize:F.base,color:sf.docId?C.text:C.muted,outline:"none",fontFamily:"inherit",background:C.white}}>
                  <option value="">Select doctor…</option>
                  {DOCTORS_DB_INIT.map(d=><option key={d.id} value={d.id}>{d.name} — {d.spec}</option>)}
                </select>
              </div>
              <div style={{flex:1}}>
                <label style={{fontSize:F.xs,fontWeight:700,color:C.muted,display:"block",marginBottom:4}}>Time *</label>
                <input type="time" value={sf.time} onChange={e=>setSf(p=>({...p,time:e.target.value}))}
                  style={{width:"100%",padding:"8px 10px",border:`1.5px solid ${C.border}`,borderRadius:R.md,fontSize:F.base,color:C.text,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
              </div>
            </div>
            <div style={{marginBottom:10}}>
              <label style={{fontSize:F.xs,fontWeight:700,color:C.muted,display:"block",marginBottom:6}}>Products to Detail</label>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {PRODUCTS_DB.map(p=>(
                  <button key={p.id} onClick={()=>toggleSfProd(p.id)}
                    style={{padding:"4px 10px",borderRadius:R.full,fontSize:F.xs,fontWeight:600,
                      border:`1.5px solid ${sf.products.includes(p.id)?p.col:C.border}`,
                      background:sf.products.includes(p.id)?p.col+"18":C.white,
                      color:sf.products.includes(p.id)?p.col:C.muted,cursor:"pointer",fontFamily:"inherit"}}>{p.name}
                  </button>
                ))}
              </div>
            </div>
            <div style={{marginBottom:10}}>
              <label style={{fontSize:F.xs,fontWeight:700,color:C.muted,display:"block",marginBottom:4}}>Call Purpose</label>
              <input value={sf.purpose} onChange={e=>setSf(p=>({...p,purpose:e.target.value}))}
                placeholder="e.g. Follow-up on CardioMax prescription"
                style={{width:"100%",padding:"8px 10px",border:`1.5px solid ${C.border}`,borderRadius:R.md,fontSize:F.base,color:C.text,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
            </div>
            <div style={{display:"flex",gap:8}}>
              <Btn variant="secondary" small onClick={()=>{setAddingStop(false);setSf({docId:"",time:"",products:[],purpose:""});}}>Cancel</Btn>
              <Btn variant="primary" icon={Plus} small onClick={addStop} disabled={!sf.docId||!sf.time}>Add Stop</Btn>
            </div>
          </div>
        )}
      </SectionCard>

      <div style={{display:"flex",gap:10}}>
        <Btn variant="secondary" onClick={onCancel} style={{flex:1}}>Cancel</Btn>
        <Btn variant="primary" icon={Send} onClick={submit} disabled={submitting} style={{flex:2}}>
          {submitting?"Submitting…":"Submit for RSM Approval"}
        </Btn>
      </div>
    </div>
  );
}

function ApprovalTimeline({plan}){
  const steps=[
    {label:"MR Submitted",icon:User,
     done:!!plan.submittedAt,by:plan.repName,at:plan.submittedAt,note:null,rejected:false},
    {label:"RSM Approval",icon:Award,
     done:!!plan.rsmApprovedBy,by:plan.rsmApprovedBy,at:plan.rsmApprovedAt,
     note:plan.rsmNote,rejected:plan.status==="rsm_rejected"},
    {label:"ASM Approval",icon:CheckCircle,
     done:!!plan.asmApprovedBy,by:plan.asmApprovedBy,at:plan.asmApprovedAt,
     note:plan.asmNote,rejected:plan.status==="asm_rejected"},
  ];
  return(
    <div style={{display:"flex",flexDirection:"column",gap:0}}>
      {steps.map((s,i)=>(
        <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start"}}>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",flexShrink:0}}>
            <div style={{width:32,height:32,borderRadius:R.full,border:`2px solid ${s.rejected?C.danger:s.done?C.success:C.border}`,
              background:s.rejected?C.dangerBg:s.done?C.successBg:C.white,
              display:"flex",alignItems:"center",justifyContent:"center"}}>
              {s.rejected?<XCircle size={16} color={C.danger}/>
               :s.done?<CheckCircle size={16} color={C.success}/>
               :<s.icon size={15} color={C.muted}/>}
            </div>
            {i<2&&<div style={{width:2,height:32,background:s.done?C.success:C.border,margin:"2px 0"}}/>}
          </div>
          <div style={{flex:1,paddingBottom:14}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <span style={{fontSize:F.base,fontWeight:700,color:s.rejected?C.danger:s.done?C.success:C.muted}}>
                {s.label}
              </span>
              {s.at&&<span style={{fontSize:F.xs,color:C.muted}}>{s.at}</span>}
            </div>
            {s.by&&<div style={{fontSize:F.sm,color:C.muted,marginTop:1}}>{s.by}</div>}
            {s.note&&<div style={{fontSize:F.sm,color:C.text,background:C.bg,borderRadius:R.md,
              padding:"6px 10px",marginTop:6,borderLeft:`3px solid ${s.rejected?C.danger:C.success}`,
              fontStyle:"italic"}}>"{s.note}"</div>}
            {!s.done&&!s.rejected&&i>0&&(
              <div style={{fontSize:F.xs,color:C.muted,marginTop:3,
                background:C.bg,borderRadius:R.md,padding:"4px 8px",display:"inline-flex",alignItems:"center",gap:4}}>
                <Clock size={11}/> Pending
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function RoutePlanDetail({plan,user,onBack,onUpdate,onAudit,isMobile}){
  const [rejectNote,setRejectNote]=useState("");
  const [showReject,setShowReject]=useState(false);
  const [actionLoading,setActionLoading]=useState(false);

  const isRSM=user.role==="regional_manager";
  const isASM=user.role==="area_manager";
  const canRSMApprove=isRSM&&plan.status==="submitted";
  const canASMApprove=isASM&&plan.status==="rsm_approved";
  const asmBlockedMsg=isASM&&plan.status==="submitted"?"Awaiting RSM approval — you can approve once RSM has reviewed first.":null;

  const sm=RP_STATUS_CFG[plan.status]||RP_STATUS_CFG.draft;

  const doApprove=async()=>{
    setActionLoading(true);
    await new Promise(r=>setTimeout(r,700));
    const now=new Date().toLocaleString([],{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"});
    if(canRSMApprove){
      onUpdate({...plan,status:"rsm_approved",
        rsmApprovedBy:user.name,rsmApprovedAt:now,rsmNote:rejectNote||"Approved."});
      onAudit&&onAudit(user.name,user.role,"Approval","info",`Approved Route Plan ${plan.id} (RSM stage)`,`${plan.title} · forwarded to ASM for final sign-off`);
    }else if(canASMApprove){
      onUpdate({...plan,status:"asm_approved",
        asmApprovedBy:user.name,asmApprovedAt:now,asmNote:rejectNote||"Approved."});
      onAudit&&onAudit(user.name,user.role,"Approval","info",`Approved Route Plan ${plan.id} (ASM stage)`,`${plan.title} · final sign-off complete`);
    }
    setActionLoading(false);setShowReject(false);
  };

  const doReject=async()=>{
    if(rejectNote.trim().length<10)return;
    setActionLoading(true);
    await new Promise(r=>setTimeout(r,700));
    const now=new Date().toLocaleString([],{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"});
    if(isRSM){
      onUpdate({...plan,status:"rsm_rejected",rsmApprovedBy:user.name,rsmApprovedAt:now,rsmNote:rejectNote});
      onAudit&&onAudit(user.name,user.role,"Approval","warning",`Rejected Route Plan ${plan.id} (RSM stage)`,`${plan.title} · reason: ${rejectNote}`);
    }else if(isASM){
      onUpdate({...plan,status:"asm_rejected",asmApprovedBy:user.name,asmApprovedAt:now,asmNote:rejectNote});
      onAudit&&onAudit(user.name,user.role,"Approval","warning",`Rejected Route Plan ${plan.id} (ASM stage)`,`${plan.title} · reason: ${rejectNote}`);
    }
    setActionLoading(false);setShowReject(false);
  };

  return(
    <div>
      {/* Back nav */}
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
        <button onClick={onBack} style={{display:"flex",alignItems:"center",gap:6,background:"none",
          border:"none",cursor:"pointer",color:C.teal,fontSize:F.base,fontWeight:700,fontFamily:"inherit",padding:0}}>
          <ChevronLeft size={18}/>Back to Route Plans
        </button>
        <div style={{marginLeft:"auto",display:"flex",gap:8,alignItems:"center"}}>
          <span style={{padding:"3px 12px",borderRadius:R.full,fontSize:F.sm,fontWeight:700,background:sm.bg,color:sm.c}}>{sm.label}</span>
        </div>
      </div>

      {/* ASM blocked message */}
      {asmBlockedMsg&&(
        <div style={{background:C.infoBg,borderRadius:R.lg,padding:"12px 16px",marginBottom:16,
          display:"flex",gap:10,alignItems:"flex-start",border:`1px solid ${C.info}30`}}>
          <Clock size={16} color={C.info} style={{flexShrink:0,marginTop:1}}/>
          <div>
            <div style={{fontSize:F.base,fontWeight:700,color:C.info}}>Awaiting RSM Approval First</div>
            <div style={{fontSize:F.sm,color:C.navyMed,marginTop:2}}>{asmBlockedMsg}</div>
          </div>
        </div>
      )}

      {/* Approve / Reject actions */}
      {(canRSMApprove||canASMApprove)&&!showReject&&(
        <div style={{background:C.white,borderRadius:R.xl,padding:16,marginBottom:16,
          border:`1px solid ${C.border}`}}>
          <div style={{fontSize:F.base,fontWeight:700,color:C.text,marginBottom:4}}>
            {canRSMApprove?"RSM Review Required":"ASM Review Required"}
          </div>
          <div style={{fontSize:F.sm,color:C.muted,marginBottom:12}}>
            {canRSMApprove?"Review the planned route. Your approval enables the ASM to give final sign-off.":"RSM has approved this route. Your approval is the final step before the MR can execute."}
          </div>
          <div style={{display:"flex",gap:10}}>
            <Btn variant="primary" icon={CheckCircle} onClick={doApprove} disabled={actionLoading} style={{flex:1}}>
              {actionLoading?"Approving…":"Approve Route Plan"}
            </Btn>
            <Btn variant="danger" icon={XCircle} onClick={()=>setShowReject(true)} style={{flex:1}}>
              Reject
            </Btn>
          </div>
        </div>
      )}

      {/* Reject form */}
      {showReject&&(
        <div style={{background:C.dangerBg,borderRadius:R.lg,padding:14,marginBottom:16,border:`1px solid ${C.danger}30`}}>
          <div style={{fontSize:F.base,fontWeight:700,color:C.danger,marginBottom:8}}>Rejection Reason (required)</div>
          <textarea value={rejectNote} onChange={e=>setRejectNote(e.target.value)}
            placeholder="Explain what needs to be changed before this plan can be approved…"
            style={{width:"100%",padding:"9px",border:`1px solid ${C.danger}60`,borderRadius:R.md,
              fontSize:F.base,color:C.text,resize:"none",height:72,fontFamily:"inherit",outline:"none",boxSizing:"border-box"}}/>
          <div style={{display:"flex",gap:8,marginTop:8}}>
            <Btn variant="secondary" small onClick={()=>setShowReject(false)} style={{flex:1}}>Cancel</Btn>
            <Btn variant="danger" icon={XCircle} small disabled={rejectNote.trim().length<10||actionLoading}
              onClick={doReject} style={{flex:2}}>
              {rejectNote.trim().length<10?"Min 10 characters":actionLoading?"Rejecting…":"Confirm Rejection"}
            </Btn>
          </div>
        </div>
      )}

      <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1.4fr 1fr",gap:16}}>
        {/* Stops */}
        <SectionCard title={`Route Stops (${plan.stops.length})`}
          action={<div style={{fontSize:F.sm,color:C.muted}}>{plan.estimatedKm} km est.</div>}>
          {plan.stops.map((s,i)=><StopRow key={s.sid} stop={s} index={i} onRemove={()=>{}} canEdit={false}/>)}
          {plan.notes&&(
            <div style={{marginTop:12,background:C.bg,borderRadius:R.md,padding:"10px 12px",
              fontSize:F.sm,color:C.muted,display:"flex",gap:8}}>
              <Star size={13} color={C.teal} style={{flexShrink:0,marginTop:1}}/>
              <span>{plan.notes}</span>
            </div>
          )}
        </SectionCard>

        {/* Approval timeline */}
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <SectionCard title="Approval Status">
            <ApprovalTimeline plan={plan}/>
          </SectionCard>
          <SectionCard title="Plan Details">
            {[["Territory",plan.territory],["Plan Date",plan.planDate],
              ["Submitted by",plan.repName],["Submitted on",plan.submittedAt],
              ["Total Stops",plan.stops.length],["Est. Distance",plan.estimatedKm+" km"]].map(([l,v])=>(
              <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",
                borderBottom:`0.5px solid ${C.border}`}}>
                <span style={{fontSize:F.sm,color:C.muted}}>{l}</span>
                <span style={{fontSize:F.sm,fontWeight:600,color:C.text}}>{v}</span>
              </div>
            ))}
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

function RoutePlanning({user,isOnline,queueForSync,plans,setPlans,onAudit,isMobile}){
  const [view,setView]=useState("list");
  const [sel,setSel]=useState(null);
  const [statusF,setStatusF]=useState("all");
  const isRep=user.role==="rep";

  const counts={
    all:plans.length,
    submitted:plans.filter(p=>p.status==="submitted").length,
    rsm_approved:plans.filter(p=>p.status==="rsm_approved").length,
    asm_approved:plans.filter(p=>p.status==="asm_approved").length,
  };

  const filtered=statusF==="all"?plans:plans.filter(p=>p.status===statusF);

  const updatePlan=(updated)=>{
    setPlans(ps=>ps.map(p=>p.id===updated.id?updated:p));
    setSel(updated);
  };

  if(view==="new") return(
    <div>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
        <button onClick={()=>setView("list")} style={{display:"flex",alignItems:"center",gap:6,
          background:"none",border:"none",cursor:"pointer",color:C.teal,fontSize:F.base,
          fontWeight:700,fontFamily:"inherit",padding:0}}>
          <ChevronLeft size={18}/>Back to Route Plans
        </button>
        <span style={{fontSize:F.lg,fontWeight:800,color:C.text}}>New Route Plan</span>
      </div>
      <RoutePlanForm
        onSubmit={p=>{setPlans(ps=>[p,...ps]);setView("list");}}
        onCancel={()=>setView("list")}
        isOnline={isOnline} queueForSync={queueForSync}/>
    </div>
  );

  if(view==="detail"&&sel) return(
    <RoutePlanDetail
      plan={plans.find(p=>p.id===sel.id)||sel}
      user={user}
      onBack={()=>{setView("list");setSel(null);}}
      onUpdate={updatePlan}
      onAudit={onAudit}
      isMobile={isMobile}/>
  );

  const filterTabs=[
    {k:"all",l:"All Plans"},
    {k:"submitted",l:"Awaiting RSM"},
    {k:"rsm_approved",l:"Awaiting ASM"},
    {k:"asm_approved",l:"Approved"},
  ];

  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:10}}>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {filterTabs.map(({k,l})=>(
            <button key={k} onClick={()=>setStatusF(k)} style={{padding:"7px 14px",borderRadius:R.full,
              border:`1.5px solid ${statusF===k?C.teal:C.border}`,
              background:statusF===k?C.tealBg:C.white,
              color:statusF===k?C.tealDark:C.muted,
              fontSize:F.sm,fontWeight:statusF===k?700:500,
              cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:5}}>
              {l}
              {counts[k]>0&&<span style={{background:statusF===k?C.teal+"30":C.bg,borderRadius:99,
                padding:"1px 6px",fontSize:F.xs,fontWeight:700,color:statusF===k?C.tealDark:C.muted}}>
                {counts[k]}
              </span>}
            </button>
          ))}
        </div>
        {isRep&&<Btn variant="primary" icon={Plus} onClick={()=>setView("new")}>New Route Plan</Btn>}
      </div>

      {/* Approval rule notice for managers */}
      {user.role==="area_manager"&&(
        <div style={{background:C.infoBg,borderRadius:R.lg,padding:"10px 14px",marginBottom:14,
          display:"flex",gap:8,alignItems:"center",border:`1px solid ${C.info}30`}}>
          <Shield size={15} color={C.info} style={{flexShrink:0}}/>
          <span style={{fontSize:F.sm,color:C.navyMed}}>
            <b>Approval rule:</b> RSM must approve before you can approve a route plan. Plans showing "Awaiting ASM" are ready for your review.
          </span>
        </div>
      )}
      {user.role==="regional_manager"&&(
        <div style={{background:C.warningBg,borderRadius:R.lg,padding:"10px 14px",marginBottom:14,
          display:"flex",gap:8,alignItems:"center",border:`1px solid ${C.warning}30`}}>
          <Award size={15} color={C.warning} style={{flexShrink:0}}/>
          <span style={{fontSize:F.sm,color:C.text}}>
            <b>Your role:</b> First-level approver for route plans. Your approval unlocks ASM review.
          </span>
        </div>
      )}

      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {filtered.map(p=><RoutePlanCard key={p.id} plan={p} onClick={p=>{setSel(p);setView("detail");}}/>)}
        {filtered.length===0&&(
          <div style={{textAlign:"center",padding:"48px 0",color:C.muted}}>
            <Map size={40} color={C.border} style={{display:"block",margin:"0 auto 12px"}}/>
            <div style={{fontSize:F.md,fontWeight:700}}>No route plans found</div>
            <div style={{fontSize:F.sm,marginTop:4}}>
              {isRep?"Click 'New Route Plan' to get started":"No plans match the selected filter"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



/* ═══════════════════════════════════════════════════
   CHEMIST REPORTS MODULE
═══════════════════════════════════════════════════ */
function ChemistCard({ch,lastVisit,onClick}){
  const tc={A:{bg:"#EAF4FF",c:"#1A6FBF"},B:{bg:C.tealBg,c:C.tealDark},C:{bg:C.bg,c:C.muted}};
  const t=tc[ch.tier]||tc.C;
  const totalStock=Object.values(ch.stock).reduce((a,b)=>a+b,0);
  return(
    <div onClick={()=>onClick(ch)} style={{background:C.white,borderRadius:R.xl,padding:16,
      border:`1px solid ${C.border}`,cursor:"pointer",
      borderLeft:`4px solid ${ch.tier==="A"?C.teal:ch.tier==="B"?C.info:C.border}`}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
        <div style={{flex:1}}>
          <div style={{fontSize:F.md,fontWeight:700,color:C.text}}>{ch.name}</div>
          <div style={{fontSize:F.sm,color:C.muted,marginTop:1}}>{ch.owner} · {ch.addr}</div>
        </div>
        <span style={{padding:"3px 9px",borderRadius:R.full,fontSize:F.xs,fontWeight:700,
          background:t.bg,color:t.c,marginLeft:8}}>Tier {ch.tier}</span>
      </div>
      <div style={{display:"flex",gap:16}}>
        {[["Avg Orders",`₹${(ch.avgMonthlyOrders/1000).toFixed(0)}K/mo`],
          ["Total Stock",totalStock+" units"],
          ["Last Visit",ch.lastVisit]].map(([l,v])=>(
          <div key={l}>
            <div style={{fontSize:F.xs,color:C.muted}}>{l}</div>
            <div style={{fontSize:F.sm,fontWeight:700,color:C.text,marginTop:1}}>{v}</div>
          </div>
        ))}
        <div style={{marginLeft:"auto",display:"flex",gap:5,alignItems:"center",flexWrap:"wrap"}}>
          {PRODUCTS_DB.map(p=>(
            <div key={p.id} style={{display:"flex",alignItems:"center",gap:3,
              background:p.col+"15",borderRadius:R.full,padding:"2px 7px"}}>
              <span style={{fontSize:F.xs,fontWeight:600,color:p.col}}>{p.name.split(" ")[0]}</span>
              <span style={{fontSize:F.xs,color:C.muted}}>{ch.stock[p.id]||0}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ChemistVisitForm({chemist,onSubmit,onCancel,isOnline,queueForSync}){
  const [purpose,setPurpose]=useState("");
  const [orderCollected,setOrderCollected]=useState({});
  const [competitorActivity,setCompetitorActivity]=useState("");
  const [promotional,setPromotional]=useState("");
  const [notes,setNotes]=useState("");
  const [submitting,setSubmitting]=useState(false);
  const [errors,setErrors]=useState({});

  const adjOrder=(pid,d)=>setOrderCollected(p=>({...p,[pid]:Math.max(0,(p[pid]||0)+d)}));

  const submit=async()=>{
    if(!purpose.trim()){setErrors({purpose:"Required"});return;}
    setSubmitting(true);
    await new Promise(r=>setTimeout(r,700));
    const totalValue=PRODUCTS_DB.reduce((sum,p)=>{
      const u=orderCollected[p.id]||0;
      const prices={P001:850,P002:550,P003:680,P004:1200};
      return sum+(u*(prices[p.id]||700));
    },0);
    const visit={id:"CVR"+Date.now(),chemistId:chemist.id,chemistName:chemist.name,
      date:new Date().toISOString().split("T")[0],
      time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),
      repName:"Ramesh Sharma",repId:"U001",purpose,
      stockChecked:chemist.stock,orderCollected,orderValue:totalValue,
      rxDemand:chemist.rxDemand,competitorActivity,promotional,notes,
      status:(isOnline===false)?"queued":"submitted",approver:null,approvedAt:null};
    onSubmit(visit);
    if(isOnline===false&&queueForSync) queueForSync("call_report","Chemist · "+chemist.name,visit);
    setSubmitting(false);
  };

  return(
    <div style={{maxWidth:620,margin:"0 auto",display:"flex",flexDirection:"column",gap:14}}>
      <SectionCard title={`Log Visit — ${chemist.name}`}>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div>
            <label style={{fontSize:F.xs,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:"0.5px",display:"block",marginBottom:5}}>Purpose of Visit *</label>
            <input value={purpose} onChange={e=>{setPurpose(e.target.value);setErrors({});}}
              placeholder="e.g. Stock check & order collection, Relationship visit…"
              style={{width:"100%",padding:"9px 11px",border:`1.5px solid ${errors.purpose?C.danger:C.border}`,borderRadius:R.md,fontSize:F.base,color:C.text,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
            {errors.purpose&&<div style={{fontSize:F.xs,color:C.danger,marginTop:3}}>{errors.purpose}</div>}
          </div>
          <div>
            <label style={{fontSize:F.xs,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:"0.5px",display:"block",marginBottom:8}}>Order Collection (units)</label>
            {PRODUCTS_DB.map(p=>(
              <div key={p.id} style={{display:"flex",alignItems:"center",gap:12,marginBottom:8,
                padding:"10px 12px",background:C.bg,borderRadius:R.lg,
                border:`1px solid ${C.border}`}}>
                <div style={{width:10,height:10,borderRadius:99,background:p.col,flexShrink:0}}/>
                <span style={{flex:1,fontSize:F.base,fontWeight:600,color:C.text}}>{p.name}</span>
                <span style={{fontSize:F.xs,color:C.muted}}>Current stock: {chemist.stock[p.id]||0}</span>
                <div style={{display:"flex",alignItems:"center",gap:0}}>
                  <button onClick={()=>adjOrder(p.id,-1)} style={{width:36,height:36,border:`1px solid ${C.border}`,borderRadius:"7px 0 0 7px",background:C.white,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>−</button>
                  <div style={{width:40,height:36,borderTop:`1px solid ${C.border}`,borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:F.sm,fontWeight:700,color:C.text}}>{orderCollected[p.id]||0}</div>
                  <button onClick={()=>adjOrder(p.id,1)} style={{width:36,height:36,border:`1px solid ${C.border}`,borderRadius:"0 7px 7px 0",background:C.white,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
                </div>
              </div>
            ))}
          </div>
          {[["Competitor Activity",competitorActivity,setCompetitorActivity,"e.g. Competing brand stocked prominently, rep visit mentioned…"],
            ["Promotional Activity",promotional,setPromotional,"e.g. Counter cards placed, patient leaflets distributed…"],
            ["Notes",notes,setNotes,"Any additional observations or follow-up items…"]
          ].map(([label,val,setter,ph])=>(
            <div key={label}>
              <label style={{fontSize:F.xs,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:"0.5px",display:"block",marginBottom:5}}>{label}</label>
              <textarea value={val} onChange={e=>setter(e.target.value)} placeholder={ph}
                style={{width:"100%",padding:"9px 11px",border:`1.5px solid ${C.border}`,borderRadius:R.md,fontSize:F.base,color:C.text,resize:"none",height:56,fontFamily:"inherit",outline:"none",boxSizing:"border-box"}}/>
            </div>
          ))}
        </div>
      </SectionCard>
      <div style={{display:"flex",gap:10}}>
        <Btn variant="secondary" onClick={onCancel} style={{flex:1}}>Cancel</Btn>
        <Btn variant="primary" icon={Send} onClick={submit} disabled={submitting} style={{flex:2}}>
          {submitting?"Submitting…":isOnline===false?"Save Offline":"Submit Visit Report"}
        </Btn>
      </div>
    </div>
  );
}

function ChemistReports({user,isOnline,queueForSync}){
  const [visits,setVisits]=useState(CHEMIST_VISITS_INIT);
  const [view,setView]=useState("list");
  const [selChemist,setSelChemist]=useState(null);
  const [selVisit,setSelVisit]=useState(null);
  const [tab,setTab]=useState("chemists");
  const [search,setSearch]=useState("");
  const norm=s=>s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/đ/g,"d");
  const isRep=user.role==="rep";
  const filteredChemists=CHEMISTS_DB.filter(ch=>!search||norm(ch.name).includes(norm(search))||norm(ch.owner).includes(norm(search)));
  const STATUS_C={submitted:{bg:C.warningBg,c:C.warning,l:"Pending"},approved:{bg:C.successBg,c:C.success,l:"Approved"},queued:{bg:"#FEF3E2",c:"#C47D0D",l:"Queued"}};

  if(view==="newvisit"&&selChemist) return(
    <ChemistVisitForm chemist={selChemist} isOnline={isOnline} queueForSync={queueForSync}
      onSubmit={v=>{setVisits(p=>[v,...p]);setView("list");setTab("visits");}}
      onCancel={()=>setView("list")}/>
  );

  return(
    <div>
      <div style={{display:"flex",gap:0,marginBottom:16,background:C.white,borderRadius:R.xl,
        border:`1px solid ${C.border}`,overflow:"hidden",alignSelf:"flex-start",width:"fit-content"}}>
        {[["chemists","Chemist Directory"],["visits","Visit Reports"]].map(([k,l])=>(
          <button key={k} onClick={()=>setTab(k)} style={{padding:"9px 18px",border:"none",cursor:"pointer",
            fontFamily:"inherit",fontSize:F.sm,fontWeight:700,
            background:tab===k?C.navy:"transparent",color:tab===k?"white":C.muted}}>
            {l}
          </button>
        ))}
      </div>
      {tab==="chemists"&&(
        <div>
          <div style={{display:"flex",gap:10,marginBottom:14,alignItems:"center"}}>
            <div style={{flex:1,display:"flex",alignItems:"center",gap:8,background:C.white,
              borderRadius:R.lg,padding:"8px 12px",border:`1px solid ${C.border}`}}>
              <Search size={15} color={C.muted}/>
              <input value={search} onChange={e=>setSearch(e.target.value)}
                placeholder="Search chemist by name or owner…"
                style={{border:"none",background:"none",flex:1,fontSize:F.base,color:C.text,outline:"none",fontFamily:"inherit"}}/>
            </div>
            <span style={{fontSize:F.sm,color:C.muted}}>{filteredChemists.length} chemists</span>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {filteredChemists.map(ch=>(
              <ChemistCard key={ch.id} ch={ch}
                lastVisit={visits.find(v=>v.chemistId===ch.id)}
                onClick={()=>{
                  if(isRep){setSelChemist(ch);setView("newvisit");}
                }}/>
            ))}
          </div>
        </div>
      )}
      {tab==="visits"&&(
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {isRep&&<div style={{marginBottom:4}}>
            <Btn variant="primary" icon={Plus} onClick={()=>{setSelChemist(CHEMISTS_DB[0]);setView("newvisit");}}>Log New Chemist Visit</Btn>
          </div>}
          {visits.map(v=>{
            const sm=STATUS_C[v.status]||STATUS_C.submitted;
            const totalOrder=Object.values(v.orderCollected).reduce((a,b)=>a+b,0);
            return(
              <div key={v.id} style={{background:C.white,borderRadius:R.xl,padding:16,
                border:`1px solid ${C.border}`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                  <div>
                    <div style={{fontSize:F.md,fontWeight:700,color:C.text}}>{v.chemistName}</div>
                    <div style={{fontSize:F.sm,color:C.muted}}>{v.date} · {v.time} · {v.repName}</div>
                  </div>
                  <span style={{padding:"3px 9px",borderRadius:R.full,fontSize:F.xs,fontWeight:700,
                    background:sm.bg,color:sm.c}}>{sm.l}</span>
                </div>
                <div style={{fontSize:F.sm,color:C.muted,marginBottom:8}}>{v.purpose}</div>
                <div style={{display:"flex",gap:16}}>
                  <div><div style={{fontSize:F.xs,color:C.muted}}>Order Value</div>
                    <div style={{fontSize:F.sm,fontWeight:700,color:C.text}}>₹{(v.orderValue/1000).toFixed(1)}K</div></div>
                  <div><div style={{fontSize:F.xs,color:C.muted}}>Units Collected</div>
                    <div style={{fontSize:F.sm,fontWeight:700,color:C.text}}>{totalOrder} units</div></div>
                  {v.competitorActivity&&<div style={{flex:1}}>
                    <div style={{fontSize:F.xs,color:C.muted}}>Competitor</div>
                    <div style={{fontSize:F.xs,color:C.text,marginTop:1}}>{v.competitorActivity.substring(0,60)}…</div>
                  </div>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   HOSPITAL REPORTS MODULE
═══════════════════════════════════════════════════ */
function HospitalCard({hosp,onClick}){
  const typeColor={Government:"#1A6FBF",Private:C.tealDark,Teaching:"#8B5CF6"};
  const tierLeft={A:C.teal,B:C.info,C:C.border};
  const totalSupply=Object.values(hosp.monthlySupply).reduce((a,b)=>a+b,0);
  const achievement=Math.round((Object.values(hosp.monthlySupply).reduce((a,b)=>a+b,0)*750/hosp.monthlyTarget)*100);
  return(
    <div onClick={()=>onClick(hosp)} style={{background:C.white,borderRadius:R.xl,padding:16,
      border:`1px solid ${C.border}`,cursor:"pointer",
      borderLeft:`4px solid ${tierLeft[hosp.tier]||C.border}`}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
        <div style={{flex:1}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2}}>
            <div style={{fontSize:F.md,fontWeight:700,color:C.text}}>{hosp.name}</div>
            <span style={{fontSize:F.xs,padding:"1px 7px",borderRadius:R.full,fontWeight:700,
              background:(typeColor[hosp.type]||C.muted)+"18",color:typeColor[hosp.type]||C.muted}}>
              {hosp.type}
            </span>
          </div>
          <div style={{fontSize:F.sm,color:C.muted}}>{hosp.beds} beds · {hosp.addr}</div>
        </div>
        <span style={{fontSize:F.xs,fontWeight:700,padding:"3px 9px",borderRadius:R.full,
          background:achievement>=100?C.successBg:achievement>=80?C.tealBg:C.warningBg,
          color:achievement>=100?C.success:achievement>=80?C.tealDark:C.warning}}>
          {achievement}% Target
        </span>
      </div>
      <div style={{display:"flex",gap:14,marginBottom:10}}>
        {[["Contacts",hosp.contacts.length],["Monthly Target",`₹${(hosp.monthlyTarget/1000).toFixed(0)}K`],["Last Visit",hosp.lastVisit]].map(([l,v])=>(
          <div key={l}><div style={{fontSize:F.xs,color:C.muted}}>{l}</div>
            <div style={{fontSize:F.sm,fontWeight:700,color:C.text,marginTop:1}}>{v}</div></div>
        ))}
      </div>
      <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
        {hosp.contacts.map((ct,i)=>(
          <div key={i} style={{fontSize:F.xs,background:C.bg,borderRadius:R.full,
            padding:"2px 9px",color:C.muted,border:`1px solid ${C.border}`}}>
            {ct.role}
          </div>
        ))}
      </div>
    </div>
  );
}

function HospitalVisitForm({hospital,onSubmit,onCancel,isOnline,queueForSync}){
  const [contactMet,setContactMet]=useState("");
  const [visitType,setVisitType]=useState("Ward Round");
  const [products,setProducts]=useState([]);
  const [qtyReq,setQtyReq]=useState({});
  const [tenderStatus,setTenderStatus]=useState("");
  const [notes,setNotes]=useState("");
  const [followUp,setFollowUp]=useState("");
  const [submitting,setSubmitting]=useState(false);
  const [errors,setErrors]=useState({});

  const toggleProd=(pid)=>setProducts(p=>p.includes(pid)?p.filter(x=>x!==pid):[...p,pid]);
  const adjQty=(pid,d)=>setQtyReq(p=>({...p,[pid]:Math.max(0,(p[pid]||0)+d)}));

  const submit=async()=>{
    const e={};
    if(!contactMet) e.contact="Required";
    if(products.length===0) e.products="Select at least one product";
    if(Object.keys(e).length){setErrors(e);return;}
    setSubmitting(true);
    await new Promise(r=>setTimeout(r,700));
    const prices={P001:850,P002:550,P003:680,P004:1200};
    const supplyValue=products.reduce((s,pid)=>s+(qtyReq[pid]||0)*(prices[pid]||700),0);
    const visit={id:"HVR"+Date.now(),hospitalId:hospital.id,hospitalName:hospital.name,
      contactMet,contactRole:hospital.contacts.find(c=>c.name===contactMet)?.role||"",
      date:new Date().toISOString().split("T")[0],
      time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),
      visitType,products,qtyRequested:qtyReq,supplyValue,tenderStatus,notes,followUp,
      status:(isOnline===false)?"queued":"submitted",approver:null,approvedAt:null};
    onSubmit(visit);
    if(isOnline===false&&queueForSync) queueForSync("call_report","Hospital · "+hospital.name,visit);
    setSubmitting(false);
  };

  const VISIT_TYPES=["Ward Round","Procurement Discussion","KOL Engagement","CME/Event","New Product Introduction","Follow-up"];

  return(
    <div style={{maxWidth:640,margin:"0 auto",display:"flex",flexDirection:"column",gap:14}}>
      <SectionCard title={`Log Hospital Visit — ${hospital.name}`}>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div>
            <label style={{fontSize:F.xs,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:"0.5px",display:"block",marginBottom:5}}>Contact Met *</label>
            <select value={contactMet} onChange={e=>{setContactMet(e.target.value);setErrors(v=>({...v,contact:""}));}}
              style={{width:"100%",padding:"9px 11px",border:`1.5px solid ${errors.contact?C.danger:C.border}`,borderRadius:R.md,fontSize:F.base,color:contactMet?C.text:C.muted,outline:"none",fontFamily:"inherit",background:C.white}}>
              <option value="">Select contact…</option>
              {hospital.contacts.map((ct,i)=><option key={i} value={ct.name}>{ct.name} — {ct.role}</option>)}
            </select>
            {errors.contact&&<div style={{fontSize:F.xs,color:C.danger,marginTop:3}}>{errors.contact}</div>}
          </div>
          <div>
            <label style={{fontSize:F.xs,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:"0.5px",display:"block",marginBottom:6}}>Visit Type</label>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {VISIT_TYPES.map(vt=>(
                <button key={vt} onClick={()=>setVisitType(vt)}
                  style={{padding:"5px 12px",borderRadius:R.full,fontSize:F.xs,fontWeight:600,cursor:"pointer",fontFamily:"inherit",
                    border:`1.5px solid ${visitType===vt?C.teal:C.border}`,
                    background:visitType===vt?C.tealBg:C.white,color:visitType===vt?C.tealDark:C.muted}}>
                  {vt}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={{fontSize:F.xs,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:"0.5px",display:"block",marginBottom:6}}>Products & Quantities Requested *</label>
            {errors.products&&<div style={{fontSize:F.xs,color:C.danger,marginBottom:6}}>{errors.products}</div>}
            {PRODUCTS_DB.map(p=>(
              <div key={p.id} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8,
                padding:"10px 12px",background:products.includes(p.id)?p.col+"0A":C.bg,
                borderRadius:R.lg,border:`1.5px solid ${products.includes(p.id)?p.col:C.border}`,
                cursor:"pointer"}} onClick={()=>{toggleProd(p.id);setErrors(v=>({...v,products:""}));}}>
                <input type="checkbox" checked={products.includes(p.id)} onChange={()=>{}} readOnly
                  style={{width:16,height:16,accentColor:p.col,flexShrink:0}}/>
                <div style={{flex:1}}>
                  <div style={{fontSize:F.base,fontWeight:700,color:C.text}}>{p.name}</div>
                  <div style={{fontSize:F.xs,color:C.muted}}>Current supply: {hospital.monthlySupply[p.id]||0} units/mo</div>
                </div>
                {products.includes(p.id)&&(
                  <div style={{display:"flex",alignItems:"center",gap:0}} onClick={e=>e.stopPropagation()}>
                    <button onClick={()=>adjQty(p.id,-10)} style={{width:36,height:36,border:`1px solid ${C.border}`,borderRadius:"7px 0 0 7px",background:C.white,cursor:"pointer",fontSize:F.base,display:"flex",alignItems:"center",justifyContent:"center"}}>−</button>
                    <div style={{width:52,height:36,borderTop:`1px solid ${C.border}`,borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:F.sm,fontWeight:700,color:C.text}}>{qtyReq[p.id]||0}</div>
                    <button onClick={()=>adjQty(p.id,10)} style={{width:36,height:36,border:`1px solid ${C.border}`,borderRadius:"0 7px 7px 0",background:C.white,cursor:"pointer",fontSize:F.base,display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
                  </div>
                )}
              </div>
            ))}
          </div>
          {[["Tender / Supply Status",tenderStatus,setTenderStatus,"e.g. On hospital formulary, tender valid till…"],
            ["Visit Notes",notes,setNotes,"Discussion summary, commitments, objections addressed…"],
            ["Follow-up Action",followUp,setFollowUp,"e.g. Send clinical data, schedule CME, loop in Medical Affairs…"]
          ].map(([label,val,setter,ph])=>(
            <div key={label}>
              <label style={{fontSize:F.xs,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:"0.5px",display:"block",marginBottom:5}}>{label}</label>
              <textarea value={val} onChange={e=>setter(e.target.value)} placeholder={ph}
                style={{width:"100%",padding:"9px 11px",border:`1.5px solid ${C.border}`,borderRadius:R.md,fontSize:F.base,color:C.text,resize:"none",height:56,fontFamily:"inherit",outline:"none",boxSizing:"border-box"}}/>
            </div>
          ))}
        </div>
      </SectionCard>
      <div style={{display:"flex",gap:10}}>
        <Btn variant="secondary" onClick={onCancel} style={{flex:1}}>Cancel</Btn>
        <Btn variant="primary" icon={Send} onClick={submit} disabled={submitting} style={{flex:2}}>
          {submitting?"Submitting…":isOnline===false?"Save Offline":"Submit Hospital Report"}
        </Btn>
      </div>
    </div>
  );
}

function HospitalReports({user,isOnline,queueForSync}){
  const [visits,setVisits]=useState(HOSPITAL_VISITS_INIT);
  const [view,setView]=useState("list");
  const [selHosp,setSelHosp]=useState(null);
  const [tab,setTab]=useState("hospitals");
  const isRep=user.role==="rep";
  const STATUS_H={submitted:{bg:C.warningBg,c:C.warning,l:"Pending"},approved:{bg:C.successBg,c:C.success,l:"Approved"},queued:{bg:"#FEF3E2",c:"#C47D0D",l:"Queued"}};

  if(view==="newvisit"&&selHosp) return(
    <HospitalVisitForm hospital={selHosp} isOnline={isOnline} queueForSync={queueForSync}
      onSubmit={v=>{setVisits(p=>[v,...p]);setView("list");setTab("visits");}}
      onCancel={()=>setView("list")}/>
  );

  return(
    <div>
      <div style={{display:"flex",gap:0,marginBottom:16,background:C.white,borderRadius:R.xl,
        border:`1px solid ${C.border}`,overflow:"hidden",width:"fit-content"}}>
        {[["hospitals","Hospital Directory"],["visits","Visit Reports"]].map(([k,l])=>(
          <button key={k} onClick={()=>setTab(k)} style={{padding:"9px 18px",border:"none",cursor:"pointer",
            fontFamily:"inherit",fontSize:F.sm,fontWeight:700,
            background:tab===k?C.navy:"transparent",color:tab===k?"white":C.muted}}>
            {l}
          </button>
        ))}
      </div>
      {tab==="hospitals"&&(
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {HOSPITALS_DB.map(h=>(
            <HospitalCard key={h.id} hosp={h}
              onClick={h=>{if(isRep){setSelHosp(h);setView("newvisit");}}}/>
          ))}
        </div>
      )}
      {tab==="visits"&&(
        <div>
          {isRep&&<div style={{marginBottom:12}}>
            <Btn variant="primary" icon={Plus} onClick={()=>{setSelHosp(HOSPITALS_DB[0]);setView("newvisit");}}>Log New Hospital Visit</Btn>
          </div>}
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {visits.map(v=>{
              const sm=STATUS_H[v.status]||STATUS_H.submitted;
              const totalQty=Object.values(v.qtyRequested).reduce((a,b)=>a+b,0);
              return(
                <div key={v.id} style={{background:C.white,borderRadius:R.xl,padding:16,border:`1px solid ${C.border}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                    <div>
                      <div style={{fontSize:F.md,fontWeight:700,color:C.text}}>{v.hospitalName}</div>
                      <div style={{fontSize:F.sm,color:C.muted}}>{v.date} · {v.visitType} · {v.contactMet}</div>
                    </div>
                    <span style={{padding:"3px 9px",borderRadius:R.full,fontSize:F.xs,fontWeight:700,background:sm.bg,color:sm.c}}>{sm.l}</span>
                  </div>
                  <div style={{display:"flex",gap:16,marginBottom:v.notes?8:0}}>
                    <div><div style={{fontSize:F.xs,color:C.muted}}>Supply Value</div>
                      <div style={{fontSize:F.sm,fontWeight:700,color:C.text}}>₹{(v.supplyValue/1000).toFixed(1)}K</div></div>
                    <div><div style={{fontSize:F.xs,color:C.muted}}>Qty Requested</div>
                      <div style={{fontSize:F.sm,fontWeight:700,color:C.text}}>{totalQty} units</div></div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:F.xs,color:C.muted}}>Products</div>
                      <div style={{display:"flex",gap:4,marginTop:2,flexWrap:"wrap"}}>
                        {v.products.map(pid=>{const p=PRODUCTS_DB.find(x=>x.id===pid);return p?<span key={pid} style={{fontSize:F.xs,padding:"1px 7px",borderRadius:R.full,background:p.col+"18",color:p.col,fontWeight:600}}>{p.name}</span>:null;})}
                      </div>
                    </div>
                  </div>
                  {v.followUp&&<div style={{fontSize:F.xs,color:C.muted,marginTop:6,display:"flex",gap:5,alignItems:"flex-start"}}>
                    <ChevronRight size={12} color={C.teal} style={{flexShrink:0,marginTop:1}}/><span>{v.followUp}</span>
                  </div>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   GPS VERIFICATION MODULE
═══════════════════════════════════════════════════ */
function GpsVerification({user}){
  const [audit,setAudit]=useState(GPS_AUDIT_INIT);
  const [statusF,setStatusF]=useState("all");
  const [typeF,setTypeF]=useState("all");
  const [selEntry,setSelEntry]=useState(null);

  const filtered=audit.filter(a=>
    (statusF==="all"||a.status===statusF)&&
    (typeF==="all"||a.visitType===typeF)
  );

  const stats={
    total:audit.length,
    verified:audit.filter(a=>a.status==="verified").length,
    overrides:audit.filter(a=>a.status==="override").length,
    avgDist:Math.round(audit.reduce((s,a)=>s+a.distanceM,0)/audit.length),
  };
  const complianceRate=Math.round((stats.verified/stats.total)*100);

  return(
    <div>
      {/* Summary Cards */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:12,marginBottom:20}}>
        {[
          ["Total Check-ins",stats.total,Activity,C.teal,C.tealBg],
          ["Verified",stats.verified,CheckCircle,C.success,C.successBg],
          ["Overrides Used",stats.overrides,AlertTriangle,C.warning,C.warningBg],
          ["Compliance Rate",complianceRate+"%",Shield,complianceRate>=90?C.success:complianceRate>=75?C.warning:C.danger,complianceRate>=90?C.successBg:complianceRate>=75?C.warningBg:C.dangerBg],
        ].map(([l,v,Icon,col,bg])=>(
          <div key={l} style={{background:C.white,borderRadius:R.xl,padding:"14px 16px",border:`1px solid ${C.border}`}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
              <div style={{width:32,height:32,borderRadius:R.lg,background:bg,display:"flex",alignItems:"center",justifyContent:"center"}}>
                <Icon size={16} color={col}/>
              </div>
              <span style={{fontSize:F.sm,color:C.muted,fontWeight:500}}>{l}</span>
            </div>
            <div style={{fontSize:F.xl2,fontWeight:800,color:C.text}}>{v}</div>
          </div>
        ))}
      </div>

      {/* Avg distance KPI */}
      <div style={{background:C.white,borderRadius:R.xl,padding:"12px 16px",marginBottom:16,
        border:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:12}}>
        <MapPin size={18} color={C.teal}/>
        <div style={{flex:1}}>
          <div style={{fontSize:F.sm,fontWeight:700,color:C.text}}>Average GPS distance from target</div>
          <div style={{fontSize:F.xs,color:C.muted}}>Average distance between recorded check-in location and registered target address</div>
        </div>
        <div style={{fontSize:F.xl,fontWeight:800,color:C.teal}}>{stats.avgDist}m</div>
        <div style={{width:56,height:8,background:C.bg,borderRadius:99,overflow:"hidden"}}>
          <div style={{height:"100%",borderRadius:99,width:Math.min(100,100-(stats.avgDist/3))+"%",
            background:stats.avgDist<50?C.success:stats.avgDist<100?C.warning:C.danger,transition:"width 0.5s"}}/>
        </div>
      </div>

      {/* Filters */}
      <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
        {[["all","All"],["verified","Verified"],["override","Override"]].map(([k,l])=>(
          <button key={k} onClick={()=>setStatusF(k)} style={{padding:"6px 14px",borderRadius:R.full,
            border:`1.5px solid ${statusF===k?C.teal:C.border}`,
            background:statusF===k?C.tealBg:C.white,color:statusF===k?C.tealDark:C.muted,
            fontSize:F.sm,fontWeight:statusF===k?700:500,cursor:"pointer",fontFamily:"inherit"}}>
            {l}
          </button>
        ))}
        <div style={{width:1,background:C.border,margin:"0 4px"}}/>
        {["all","Doctor","Chemist","Hospital"].map(k=>(
          <button key={k} onClick={()=>setTypeF(k)} style={{padding:"6px 14px",borderRadius:R.full,
            border:`1.5px solid ${typeF===k?C.info:C.border}`,
            background:typeF===k?C.infoBg:C.white,color:typeF===k?C.info:C.muted,
            fontSize:F.sm,fontWeight:typeF===k?700:500,cursor:"pointer",fontFamily:"inherit"}}>
            {k==="all"?"All Types":k}
          </button>
        ))}
        <span style={{fontSize:F.sm,color:C.muted,padding:"6px 0",marginLeft:"auto"}}>
          {filtered.length} records
        </span>
      </div>

      {/* Audit list */}
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {filtered.map(entry=>{
          const isVerified=entry.status==="verified";
          const isOverride=entry.status==="override";
          const typeColor={Doctor:C.teal,Chemist:C.info,Hospital:C.purple};
          return(
            <div key={entry.id} style={{background:C.white,borderRadius:R.xl,padding:16,
              border:`1px solid ${C.border}`,
              borderLeft:`4px solid ${isVerified?C.success:isOverride?C.warning:C.danger}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                    <span style={{fontSize:F.xs,padding:"1px 7px",borderRadius:R.full,fontWeight:700,
                      background:(typeColor[entry.visitType]||C.muted)+"18",
                      color:typeColor[entry.visitType]||C.muted}}>{entry.visitType}</span>
                    <span style={{fontSize:F.md,fontWeight:700,color:C.text}}>{entry.targetName}</span>
                  </div>
                  <div style={{fontSize:F.sm,color:C.muted}}>
                    {entry.repName} · {entry.date} at {entry.time}
                  </div>
                </div>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:F.xl,fontWeight:800,
                      color:entry.distanceM<=100?C.success:entry.distanceM<=300?C.warning:C.danger}}>
                      {entry.distanceM}m
                    </div>
                    <div style={{fontSize:F.xs,color:C.muted}}>from target</div>
                  </div>
                  <div style={{width:36,height:36,borderRadius:R.full,
                    background:isVerified?C.successBg:isOverride?C.warningBg:C.dangerBg,
                    display:"flex",alignItems:"center",justifyContent:"center"}}>
                    {isVerified?<CheckCircle size={18} color={C.success}/>
                     :isOverride?<AlertTriangle size={18} color={C.warning}/>
                     :<XCircle size={18} color={C.danger}/>}
                  </div>
                </div>
              </div>
              {/* Coordinates row */}
              <div style={{display:"flex",gap:10,marginTop:10,flexWrap:"wrap"}}>
                <div style={{display:"flex",gap:8,background:C.bg,borderRadius:R.lg,
                  padding:"6px 10px",fontSize:F.xs,color:C.muted}}>
                  <span>📍 Actual: <b style={{color:C.text}}>{entry.actualLat.toFixed(5)}°N, {entry.actualLng.toFixed(5)}°E</b></span>
                  <span>·</span>
                  <span>🎯 Target: <b style={{color:C.text}}>{entry.targetLat.toFixed(5)}°N, {entry.targetLng.toFixed(5)}°E</b></span>
                  <span>·</span>
                  <span>Accuracy: ±{entry.accuracy}m</span>
                </div>
              </div>
              {isOverride&&entry.overrideReason&&(
                <div style={{marginTop:10,background:C.warningBg,borderRadius:R.md,
                  padding:"8px 12px",display:"flex",gap:8,
                  border:`1px solid ${C.warning}30`}}>
                  <AlertTriangle size={13} color={C.warning} style={{flexShrink:0,marginTop:1}}/>
                  <div>
                    <div style={{fontSize:F.xs,fontWeight:700,color:C.warning,marginBottom:2}}>Override Justification</div>
                    <div style={{fontSize:F.sm,color:C.text,lineHeight:1.5}}>{entry.overrideReason}</div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {filtered.length===0&&(
          <div style={{textAlign:"center",padding:"40px 0",color:C.muted}}>
            <MapPin size={36} color={C.border} style={{display:"block",margin:"0 auto 10px"}}/>
            <div style={{fontSize:F.md,fontWeight:700}}>No GPS records match</div>
          </div>
        )}
      </div>
    </div>
  );
}



/* ═══════════════════════════════════════════════════
   PHASE 4 — EXPENSE CLAIMS
═══════════════════════════════════════════════════ */
function ExpenseClaimRow({cl,canApprove,onApprove,onReject}){
  const [showRej,setShowRej]=useState(false);
  const [rejNote,setRejNote]=useState("");
  const SM={submitted:{bg:C.warningBg,c:C.warning,l:"Pending"},approved:{bg:C.successBg,c:C.success,l:"Approved"},
    rejected:{bg:C.dangerBg,c:C.danger,l:"Rejected"},queued:{bg:"#FEF3E2",c:"#C47D0D",l:"Queued"}};
  const sm=SM[cl.status]||SM.submitted;
  const ec=EXP_CATS.find(e=>e.id===cl.category);
  return(
    <div style={{background:C.white,borderRadius:R.xl,padding:16,border:`1px solid ${C.border}`}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
        <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
          {ec&&<div style={{width:36,height:36,borderRadius:R.lg,background:ec.color+"18",
            display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <ec.icon size={16} color={ec.color}/>
          </div>}
          <div>
            <div style={{fontSize:F.base,fontWeight:700,color:C.text}}>{cl.description}</div>
            <div style={{fontSize:F.sm,color:C.muted}}>{cl.date} · {cl.repName} · Receipt: {cl.receiptNo}</div>
          </div>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center",flexShrink:0}}>
          <span style={{fontSize:F.lg,fontWeight:800,color:C.text}}>₹{cl.amount.toLocaleString()}</span>
          <span style={{padding:"3px 9px",borderRadius:R.full,fontSize:F.xs,fontWeight:700,background:sm.bg,color:sm.c}}>{sm.l}</span>
        </div>
      </div>
      {cl.rejReason&&<div style={{fontSize:F.sm,color:C.danger,background:C.dangerBg,borderRadius:R.md,padding:"6px 10px",marginTop:6}}>{cl.rejReason}</div>}
      {canApprove&&cl.status==="submitted"&&!showRej&&(
        <div style={{display:"flex",gap:8,marginTop:10}}>
          <Btn variant="primary" icon={CheckCircle} small onClick={()=>onApprove(cl)} style={{flex:1}}>Approve</Btn>
          <Btn variant="danger" icon={XCircle} small onClick={()=>setShowRej(true)} style={{flex:1}}>Reject</Btn>
        </div>
      )}
      {showRej&&(
        <div style={{marginTop:10,background:C.dangerBg,borderRadius:R.lg,padding:12,border:`1px solid ${C.danger}30`}}>
          <textarea value={rejNote} onChange={e=>setRejNote(e.target.value)} placeholder="Reason for rejection (required)…"
            style={{width:"100%",padding:"8px",border:`1px solid ${C.danger}60`,borderRadius:R.md,fontSize:F.sm,resize:"none",height:56,fontFamily:"inherit",outline:"none",boxSizing:"border-box",background:"white"}}/>
          <div style={{display:"flex",gap:8,marginTop:8}}>
            <Btn variant="secondary" small onClick={()=>setShowRej(false)} style={{flex:1}}>Cancel</Btn>
            <Btn variant="danger" small icon={XCircle} disabled={rejNote.trim().length<5}
              onClick={()=>{onReject(cl,rejNote);setShowRej(false);setRejNote("");}} style={{flex:2}}>
              {rejNote.trim().length<5?"Min 5 chars":"Confirm Rejection"}
            </Btn>
          </div>
        </div>
      )}
    </div>
  );
}

function ExpenseClaims({user,isOnline,queueForSync,claims,setClaims,onAudit}){
  const [view,setView]=useState("list");
  const [tab,setTab]=useState("mine");
  const [cat,setCat]=useState("all");
  const [form,setForm]=useState({date:"",category:"travel",description:"",amount:"",receiptNo:""});
  const [ferr,setFerr]=useState({});
  const [submitting,setSubmitting]=useState(false);
  const isRep=user.role==="rep";
  const canApprove=isManagerRole(user.role);

  const SM={submitted:{bg:C.warningBg,c:C.warning,l:"Pending"},approved:{bg:C.successBg,c:C.success,l:"Approved"},
    rejected:{bg:C.dangerBg,c:C.danger,l:"Rejected"},queued:{bg:"#FEF3E2",c:"#C47D0D",l:"Queued"}};

  const monthTotal=claims.filter(e=>e.status!=="rejected"&&e.repId==="U001").reduce((s,e)=>s+e.amount,0);
  const monthLimit=EXP_CATS.reduce((s,c)=>s+c.limit,0);
  const filtered=claims.filter(e=>(cat==="all"||e.category===cat));

  const submitClaim=async()=>{
    const e={};
    if(!form.date) e.date="Required";
    if(!form.description.trim()) e.description="Required";
    if(!form.amount||isNaN(form.amount)||Number(form.amount)<=0) e.amount="Enter valid amount";
    if(Object.keys(e).length){setFerr(e);return;}
    setSubmitting(true);
    await new Promise(r=>setTimeout(r,700));
    const nc={id:"EX"+Date.now(),repId:"U001",repName:"Ramesh Sharma",
      date:form.date,category:form.category,description:form.description,
      amount:Number(form.amount),receiptNo:form.receiptNo||"—",
      status:isOnline===false?"queued":"submitted",
      approver:null,approvedAt:null,rejReason:null};
    setClaims(p=>[nc,...p]);
    if(isOnline===false&&queueForSync) queueForSync("call_report","Expense · ₹"+nc.amount+" · "+nc.date,nc);
    setForm({date:"",category:"travel",description:"",amount:"",receiptNo:""});
    setView("list");setSubmitting(false);
  };

  const approveClaim=(cl)=>{
    setClaims(p=>p.map(x=>x.id===cl.id?{...x,status:"approved",
    approver:user.name,approvedAt:new Date().toLocaleString()}:x));
    onAudit&&onAudit(user.name,user.role,"Approval","info","Approved Expense Claim "+cl.id,`${cl.description} · ₹${cl.amount.toLocaleString()} · ${cl.repName}`);
  };
  const rejectClaim=(cl,reason)=>{
    setClaims(p=>p.map(x=>x.id===cl.id?{...x,status:"rejected",
    approver:user.name,approvedAt:new Date().toLocaleString(),rejReason:reason}:x));
    onAudit&&onAudit(user.name,user.role,"Approval","warning","Rejected Expense Claim "+cl.id,`${cl.description} · ₹${cl.amount.toLocaleString()} · reason: ${reason}`);
  };

  if(view==="new") return(
    <div style={{maxWidth:520,margin:"0 auto"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
        <button onClick={()=>setView("list")} style={{display:"flex",alignItems:"center",gap:6,
          background:"none",border:"none",cursor:"pointer",color:C.teal,fontSize:F.base,fontWeight:700,fontFamily:"inherit",padding:0}}>
          <ChevronLeft size={18}/>Back
        </button>
        <span style={{fontSize:F.lg,fontWeight:800,color:C.text}}>New Expense Claim</span>
      </div>
      <div style={{background:C.white,borderRadius:R.xl,padding:22,border:`1px solid ${C.border}`,display:"flex",flexDirection:"column",gap:14}}>
        <div style={{display:"flex",gap:12}}>
          <div style={{flex:1}}>
            <label style={{fontSize:F.xs,fontWeight:700,color:C.muted,display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:"0.5px"}}>Date *</label>
            <input type="date" value={form.date} onChange={e=>{setForm(p=>({...p,date:e.target.value}));setFerr(v=>({...v,date:""}));}}
              style={{width:"100%",padding:"9px 11px",border:`1.5px solid ${ferr.date?C.danger:C.border}`,borderRadius:R.md,fontSize:F.base,color:C.text,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
            {ferr.date&&<div style={{fontSize:F.xs,color:C.danger,marginTop:3}}>{ferr.date}</div>}
          </div>
          <div style={{flex:1}}>
            <label style={{fontSize:F.xs,fontWeight:700,color:C.muted,display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:"0.5px"}}>Receipt No.</label>
            <input value={form.receiptNo} onChange={e=>setForm(p=>({...p,receiptNo:e.target.value}))} placeholder="e.g. REC-006"
              style={{width:"100%",padding:"9px 11px",border:`1.5px solid ${C.border}`,borderRadius:R.md,fontSize:F.base,color:C.text,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
          </div>
        </div>
        <div>
          <label style={{fontSize:F.xs,fontWeight:700,color:C.muted,display:"block",marginBottom:8,textTransform:"uppercase",letterSpacing:"0.5px"}}>Category</label>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:6}}>
            {EXP_CATS.map(cat=>(
              <button key={cat.id} onClick={()=>setForm(p=>({...p,category:cat.id}))}
                style={{padding:"8px 6px",borderRadius:R.lg,border:`2px solid ${form.category===cat.id?cat.color:C.border}`,
                  background:form.category===cat.id?cat.color+"15":C.white,cursor:"pointer",fontFamily:"inherit",
                  fontSize:F.xs,fontWeight:700,color:form.category===cat.id?cat.color:C.muted,
                  display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                <cat.icon size={15} color={form.category===cat.id?cat.color:C.muted}/>
                {cat.label.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label style={{fontSize:F.xs,fontWeight:700,color:C.muted,display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:"0.5px"}}>Description *</label>
          <textarea value={form.description} onChange={e=>{setForm(p=>({...p,description:e.target.value}));setFerr(v=>({...v,description:""}));}}
            placeholder="Describe the expense — include location, purpose, distance if travel…"
            style={{width:"100%",padding:"9px 11px",border:`1.5px solid ${ferr.description?C.danger:C.border}`,borderRadius:R.md,fontSize:F.base,color:C.text,resize:"none",height:72,fontFamily:"inherit",outline:"none",boxSizing:"border-box"}}/>
          {ferr.description&&<div style={{fontSize:F.xs,color:C.danger,marginTop:3}}>{ferr.description}</div>}
        </div>
        <div>
          <label style={{fontSize:F.xs,fontWeight:700,color:C.muted,display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:"0.5px"}}>Amount (₹) *</label>
          <input type="number" value={form.amount} onChange={e=>{setForm(p=>({...p,amount:e.target.value}));setFerr(v=>({...v,amount:""}));}} placeholder="0"
            style={{width:"100%",padding:"9px 11px",border:`1.5px solid ${ferr.amount?C.danger:C.border}`,borderRadius:R.md,fontSize:F.base,color:C.text,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
          {ferr.amount&&<div style={{fontSize:F.xs,color:C.danger,marginTop:3}}>{ferr.amount}</div>}
        </div>
        <div style={{display:"flex",gap:10}}>
          <Btn variant="secondary" onClick={()=>setView("list")} style={{flex:1}}>Cancel</Btn>
          <Btn variant="primary" icon={Send} onClick={submitClaim} disabled={submitting} style={{flex:2}}>
            {submitting?"Submitting…":isOnline===false?"Save Offline":"Submit Claim"}
          </Btn>
        </div>
      </div>
    </div>
  );

  return(
    <div>
      {/* Month budget bar */}
      <div style={{background:C.white,borderRadius:R.xl,padding:16,marginBottom:16,border:`1px solid ${C.border}`}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
          <span style={{fontSize:F.base,fontWeight:700,color:C.text}}>Monthly Expense Budget</span>
          <span style={{fontSize:F.base,fontWeight:800,color:monthTotal>monthLimit?C.danger:C.text}}>
            ₹{monthTotal.toLocaleString()} / ₹{monthLimit.toLocaleString()}
          </span>
        </div>
        <div style={{height:8,background:C.bg,borderRadius:99,overflow:"hidden"}}>
          <div style={{height:"100%",borderRadius:99,transition:"width 0.5s",
            width:Math.min(100,(monthTotal/monthLimit)*100)+"%",
            background:monthTotal/monthLimit>0.9?C.danger:monthTotal/monthLimit>0.7?C.warning:C.teal}}/>
        </div>
        <div style={{display:"flex",gap:12,marginTop:10}}>
          {EXP_CATS.map(ec=>{
            const spent=claims.filter(x=>x.category===ec.id&&x.status!=="rejected").reduce((s,x)=>s+x.amount,0);
            return(
              <div key={ec.id} style={{display:"flex",alignItems:"center",gap:5}}>
                <div style={{width:8,height:8,borderRadius:99,background:ec.color}}/>
                <span style={{fontSize:F.xs,color:C.muted}}>{ec.label.split(" ")[0]}</span>
                <span style={{fontSize:F.xs,fontWeight:700,color:spent>ec.limit?C.danger:C.text}}>₹{spent.toLocaleString()}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:10}}>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {[["all","All"],["travel","Travel"],["meals","Meals"],["lodging","Lodging"],["samples","Samples"],["misc","Misc"]].map(([k,l])=>(
            <button key={k} onClick={()=>setCat(k)} style={{padding:"6px 13px",borderRadius:R.full,
              border:`1.5px solid ${cat===k?C.teal:C.border}`,background:cat===k?C.tealBg:C.white,
              color:cat===k?C.tealDark:C.muted,fontSize:F.sm,fontWeight:cat===k?700:500,cursor:"pointer",fontFamily:"inherit"}}>
              {l}
            </button>
          ))}
        </div>
        {isRep&&<Btn variant="primary" icon={Plus} onClick={()=>setView("new")}>Add Expense</Btn>}
      </div>

      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {filtered.map(cl=>(
          <ExpenseClaimRow key={cl.id} cl={cl} canApprove={canApprove}
            onApprove={approveClaim} onReject={rejectClaim}/>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   PHASE 4 — LEAVE MANAGEMENT
═══════════════════════════════════════════════════ */
function LeaveAppRow({a,canApprove,onApprove,onReject}){
  const [showRej,setShowRej]=useState(false);
  const [rejNote,setRejNote]=useState("");
  const SM={submitted:{bg:C.warningBg,c:C.warning,l:"Pending"},
    approved:{bg:C.successBg,c:C.success,l:"Approved"},rejected:{bg:C.dangerBg,c:C.danger,l:"Rejected"}};
  const lt=LEAVE_TYPES[a.type];
  const sm=SM[a.status]||SM.submitted;
  return(
    <div style={{background:C.white,borderRadius:R.xl,padding:16,border:`1px solid ${C.border}`}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
        <div>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2}}>
            <span style={{fontSize:F.xs,padding:"2px 8px",borderRadius:R.full,fontWeight:700,
              background:(lt?.color||C.teal)+"18",color:lt?.color||C.teal}}>{a.type}</span>
            <span style={{fontSize:F.base,fontWeight:700,color:C.text}}>{a.from} → {a.to}</span>
            <span style={{fontSize:F.sm,color:C.muted}}>({a.days} day{a.days!==1?"s":""})</span>
          </div>
          <div style={{fontSize:F.sm,color:C.muted}}>{a.repName} · Applied for: {lt?.label}</div>
          <div style={{fontSize:F.sm,color:C.text,marginTop:4}}>{a.reason}</div>
        </div>
        <span style={{padding:"3px 9px",borderRadius:R.full,fontSize:F.xs,fontWeight:700,background:sm.bg,color:sm.c,flexShrink:0,marginLeft:8}}>{sm.l}</span>
      </div>
      {a.approver&&<div style={{fontSize:F.xs,color:C.muted}}>By {a.approver} · {a.approvedAt}</div>}
      {a.rejReason&&<div style={{fontSize:F.sm,color:C.danger,background:C.dangerBg,borderRadius:R.md,padding:"6px 10px",marginTop:6}}>{a.rejReason}</div>}
      {canApprove&&a.status==="submitted"&&!showRej&&(
        <div style={{display:"flex",gap:8,marginTop:10}}>
          <Btn variant="primary" icon={CheckCircle} small onClick={()=>onApprove(a)} style={{flex:1}}>Approve</Btn>
          <Btn variant="danger" icon={XCircle} small onClick={()=>setShowRej(true)} style={{flex:1}}>Reject</Btn>
        </div>
      )}
      {showRej&&(
        <div style={{marginTop:10,background:C.dangerBg,borderRadius:R.lg,padding:12,border:`1px solid ${C.danger}30`}}>
          <textarea value={rejNote} onChange={e=>setRejNote(e.target.value)} placeholder="Reason for rejection…"
            style={{width:"100%",padding:"8px",border:`1px solid ${C.danger}60`,borderRadius:R.md,fontSize:F.sm,resize:"none",height:56,fontFamily:"inherit",outline:"none",boxSizing:"border-box",background:"white"}}/>
          <div style={{display:"flex",gap:8,marginTop:8}}>
            <Btn variant="secondary" small onClick={()=>setShowRej(false)} style={{flex:1}}>Cancel</Btn>
            <Btn variant="danger" small icon={XCircle} disabled={rejNote.trim().length<5}
              onClick={()=>{onReject(a,rejNote);setShowRej(false);setRejNote("");}} style={{flex:2}}>
              {rejNote.trim().length<5?"Min 5 chars":"Confirm Rejection"}
            </Btn>
          </div>
        </div>
      )}
    </div>
  );
}

function LeaveManagement({user,apps,setApps,balance,setBalance,onAudit}){
  const [view,setView]=useState("list");
  const [form,setForm]=useState({type:"CL",from:"",to:"",reason:""});
  const [ferr,setFerr]=useState({});
  const [submitting,setSubmitting]=useState(false);
  const isRep=user.role==="rep";
  const canApprove=isManagerRole(user.role);
  const SM={submitted:{bg:C.warningBg,c:C.warning,l:"Pending"},
    approved:{bg:C.successBg,c:C.success,l:"Approved"},rejected:{bg:C.dangerBg,c:C.danger,l:"Rejected"}};

  const calcDays=(from,to)=>{if(!from||!to)return 0;const d=new Date(to)-new Date(from);return Math.max(1,Math.round(d/(1000*60*60*24))+1);};

  const submitApp=async()=>{
    const e={};
    if(!form.from) e.from="Required";
    if(!form.to) e.to="Required";
    if(!form.reason.trim()) e.reason="Required";
    if(Object.keys(e).length){setFerr(e);return;}
    setSubmitting(true);
    await new Promise(r=>setTimeout(r,700));
    const days=calcDays(form.from,form.to);
    const na={id:"LV"+Date.now(),repId:"U001",repName:"Ramesh Sharma",type:form.type,
      from:form.from,to:form.to,days,reason:form.reason,
      status:"submitted",approver:null,approvedAt:null,rejReason:null};
    setApps(p=>[na,...p]);
    setBalance(b=>({...b,[form.type]:{...b[form.type],pending:(b[form.type].pending||0)+1}}));
    setForm({type:"CL",from:"",to:"",reason:""});
    setView("list");setSubmitting(false);
  };

    const approveApp=(a)=>{
    setApps(p=>p.map(x=>x.id===a.id?{...x,status:"approved",approver:user.name,approvedAt:new Date().toLocaleString()}:x));
    setBalance(b=>({...b,[a.type]:{...b[a.type],used:(b[a.type].used||0)+a.days,pending:Math.max(0,(b[a.type].pending||0)-1)}}));
    onAudit&&onAudit(user.name,user.role,"Approval","info","Approved Leave Request "+a.id,`${a.repName} · ${a.type} · ${a.from} to ${a.to} (${a.days}d)`);
  };
  const rejectApp=(a,reason)=>{
    setApps(p=>p.map(x=>x.id===a.id?{...x,status:"rejected",approver:user.name,approvedAt:new Date().toLocaleString(),rejReason:reason}:x));
    setBalance(b=>({...b,[a.type]:{...b[a.type],pending:Math.max(0,(b[a.type].pending||0)-1)}}));
    onAudit&&onAudit(user.name,user.role,"Approval","warning","Rejected Leave Request "+a.id,`${a.repName} · ${a.type} · reason: ${reason}`);
  };

  if(view==="apply") return(
    <div style={{maxWidth:500,margin:"0 auto"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
        <button onClick={()=>setView("list")} style={{display:"flex",alignItems:"center",gap:6,
          background:"none",border:"none",cursor:"pointer",color:C.teal,fontSize:F.base,fontWeight:700,fontFamily:"inherit",padding:0}}>
          <ChevronLeft size={18}/>Back
        </button>
        <span style={{fontSize:F.lg,fontWeight:800,color:C.text}}>Apply for Leave</span>
      </div>
      <div style={{background:C.white,borderRadius:R.xl,padding:22,border:`1px solid ${C.border}`,display:"flex",flexDirection:"column",gap:14}}>
        <div>
          <label style={{fontSize:F.xs,fontWeight:700,color:C.muted,display:"block",marginBottom:8,textTransform:"uppercase",letterSpacing:"0.5px"}}>Leave Type</label>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:8}}>
            {Object.entries(LEAVE_TYPES).map(([k,lt])=>{
              const bal=balance[k]||{used:0,pending:0};
              const avail=lt.total-bal.used-bal.pending;
              return(
                <button key={k} onClick={()=>setForm(p=>({...p,type:k}))}
                  style={{padding:"10px 12px",borderRadius:R.lg,border:`2px solid ${form.type===k?lt.color:C.border}`,
                    background:form.type===k?lt.color+"15":C.white,cursor:"pointer",fontFamily:"inherit",textAlign:"left"}}>
                  <div style={{fontSize:F.sm,fontWeight:700,color:form.type===k?lt.color:C.text}}>{k} — {lt.label}</div>
                  <div style={{fontSize:F.xs,color:C.muted,marginTop:2}}>{avail} days available</div>
                </button>
              );
            })}
          </div>
        </div>
        <div style={{display:"flex",gap:12}}>
          {[["From *","from",ferr.from],["To *","to",ferr.to]].map(([label,key,err])=>(
            <div key={key} style={{flex:1}}>
              <label style={{fontSize:F.xs,fontWeight:700,color:C.muted,display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:"0.5px"}}>{label}</label>
              <input type="date" value={form[key]} onChange={e=>{setForm(p=>({...p,[key]:e.target.value}));setFerr(v=>({...v,[key]:""}));}}
                style={{width:"100%",padding:"9px 11px",border:`1.5px solid ${err?C.danger:C.border}`,borderRadius:R.md,fontSize:F.base,color:C.text,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
              {err&&<div style={{fontSize:F.xs,color:C.danger,marginTop:3}}>{err}</div>}
            </div>
          ))}
        </div>
        {form.from&&form.to&&<div style={{background:C.tealBg,borderRadius:R.lg,padding:"8px 12px",fontSize:F.sm,color:C.tealDark,fontWeight:600}}>
          Duration: {calcDays(form.from,form.to)} day{calcDays(form.from,form.to)!==1?"s":""}
        </div>}
        <div>
          <label style={{fontSize:F.xs,fontWeight:700,color:C.muted,display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:"0.5px"}}>Reason *</label>
          <textarea value={form.reason} onChange={e=>{setForm(p=>({...p,reason:e.target.value}));setFerr(v=>({...v,reason:""}));}}
            placeholder="Briefly describe the reason for leave…"
            style={{width:"100%",padding:"9px 11px",border:`1.5px solid ${ferr.reason?C.danger:C.border}`,borderRadius:R.md,fontSize:F.base,color:C.text,resize:"none",height:72,fontFamily:"inherit",outline:"none",boxSizing:"border-box"}}/>
          {ferr.reason&&<div style={{fontSize:F.xs,color:C.danger,marginTop:3}}>{ferr.reason}</div>}
        </div>
        <div style={{display:"flex",gap:10}}>
          <Btn variant="secondary" onClick={()=>setView("list")} style={{flex:1}}>Cancel</Btn>
          <Btn variant="primary" icon={Send} onClick={submitApp} disabled={submitting} style={{flex:2}}>
            {submitting?"Submitting…":"Submit Leave Application"}
          </Btn>
        </div>
      </div>
    </div>
  );

  return(
    <div>
      {/* Balance cards */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:10,marginBottom:20}}>
        {Object.entries(LEAVE_TYPES).map(([k,lt])=>{
          const bal=balance[k]||{used:0,pending:0};
          const avail=lt.total-bal.used-bal.pending;
          return(
            <div key={k} style={{background:C.white,borderRadius:R.xl,padding:14,border:`2px solid ${lt.color}20`}}>
              <div style={{fontSize:F.xs,fontWeight:700,color:lt.color,textTransform:"uppercase",marginBottom:6}}>{k}</div>
              <div style={{fontSize:F.xl2,fontWeight:800,color:C.text}}>{avail}</div>
              <div style={{fontSize:F.xs,color:C.muted,marginTop:2}}>of {lt.total} days available</div>
              <div style={{height:4,background:C.bg,borderRadius:99,marginTop:8,overflow:"hidden"}}>
                <div style={{height:"100%",borderRadius:99,background:lt.color,width:Math.max(0,(bal.used/lt.total)*100)+"%"}}/>
              </div>
              <div style={{fontSize:F.xs,color:C.muted,marginTop:4}}>{bal.used} used · {bal.pending||0} pending</div>
            </div>
          );
        })}
      </div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <span style={{fontSize:F.md,fontWeight:700,color:C.text}}>Leave Applications</span>
        {isRep&&<Btn variant="primary" icon={Plus} onClick={()=>setView("apply")}>Apply for Leave</Btn>}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {apps.map(a=>(
          <LeaveAppRow key={a.id} a={a} canApprove={canApprove}
            onApprove={approveApp} onReject={rejectApp}/>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   PHASE 4 — TARGET TRACKING
═══════════════════════════════════════════════════ */
function TargetTracking({user}){
  const [period,setPeriod]=useState("month");
  const T=TARGETS_DATA;
  const pData=period==="month"?T.products.map(p=>({...p,target:p.monthTarget,actual:p.monthActual})):T.products.map(p=>({...p,target:p.qtrTarget,actual:p.qtrActual}));
  const totalTarget=pData.reduce((s,p)=>s+p.target,0);
  const totalActual=pData.reduce((s,p)=>s+p.actual,0);
  const overallPct=Math.round((totalActual/totalTarget)*100);

  return(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      {/* Period toggle */}
      <div style={{display:"flex",gap:6,alignSelf:"flex-start",background:C.white,borderRadius:R.xl,padding:4,border:`1px solid ${C.border}`}}>
        {[["month","This Month"],["qtr","This Quarter"]].map(([k,l])=>(
          <button key={k} onClick={()=>setPeriod(k)}
            style={{padding:"7px 18px",borderRadius:R.lg,border:"none",cursor:"pointer",
              fontFamily:"inherit",fontSize:F.sm,fontWeight:700,
              background:period===k?C.navy:"transparent",color:period===k?"white":C.muted}}>
            {l}
          </button>
        ))}
      </div>

      {/* Overall achievement card */}
      <div style={{background:C.white,borderRadius:R.xl,padding:20,border:`1px solid ${C.border}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
          <div>
            <div style={{fontSize:F.sm,color:C.muted,fontWeight:600}}>Overall Prescription Achievement</div>
            <div style={{fontSize:F.xl4,fontWeight:900,color:overallPct>=100?C.success:overallPct>=80?C.warning:C.danger,lineHeight:1.1}}>
              {overallPct}%
            </div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:F.sm,color:C.muted}}>Actual vs Target</div>
            <div style={{fontSize:F.xl,fontWeight:800,color:C.text}}>{totalActual} / {totalTarget} Rx</div>
          </div>
        </div>
        <div style={{height:10,background:C.bg,borderRadius:99,overflow:"hidden"}}>
          <div style={{height:"100%",borderRadius:99,transition:"width 0.6s",
            width:Math.min(100,overallPct)+"%",
            background:overallPct>=100?C.success:overallPct>=80?C.warning:C.danger}}/>
        </div>
      </div>

      {/* Per-product breakdown */}
      <SectionCard title="Product-wise Achievement">
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {pData.map(p=>{
            const pct=Math.round((p.actual/p.target)*100);
            const gap=p.actual-p.target;
            return(
              <div key={p.id}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{width:10,height:10,borderRadius:99,background:p.col}}/>
                    <span style={{fontSize:F.base,fontWeight:700,color:C.text}}>{p.name}</span>
                  </div>
                  <div style={{display:"flex",gap:12,alignItems:"center"}}>
                    <span style={{fontSize:F.sm,color:C.muted}}>{p.actual}/{p.target} Rx</span>
                    <span style={{fontSize:F.sm,fontWeight:800,padding:"2px 9px",borderRadius:R.full,
                      background:pct>=100?C.successBg:pct>=75?C.tealBg:pct>=50?C.warningBg:C.dangerBg,
                      color:pct>=100?C.success:pct>=75?C.tealDark:pct>=50?C.warning:C.danger}}>
                      {pct}%
                    </span>
                    <span style={{fontSize:F.xs,color:gap>=0?C.success:C.danger}}>
                      {gap>=0?"▲":"▼"} {Math.abs(gap)} Rx
                    </span>
                  </div>
                </div>
                <div style={{height:8,background:C.bg,borderRadius:99,overflow:"hidden",position:"relative"}}>
                  <div style={{height:"100%",borderRadius:99,transition:"width 0.5s",
                    width:Math.min(100,pct)+"%",
                    background:pct>=100?C.success:pct>=75?C.teal:pct>=50?C.warning:C.danger}}/>
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* KPI metrics */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:12}}>
        {[
          {label:"Doctor Coverage",icon:Users,
           value:T.coverage.actual+"%",target:T.coverage.target+"%",
           sub:`${T.coverage.doctorsVisited}/${T.coverage.doctorsTotal} doctors visited`,
           ok:T.coverage.actual>=T.coverage.target},
          {label:"Call Average",icon:Phone,
           value:T.callAvg.actual,target:T.callAvg.target+" calls/day",
           sub:`Over ${T.callAvg.daysWorked} working days`,
           ok:T.callAvg.actual>=T.callAvg.target},
          {label:"Joint Field Days",icon:UserCheck,
           value:T.jointWork.actual,target:T.jointWork.target+" required",
           sub:T.jointWork.label,
           ok:T.jointWork.actual>=T.jointWork.target},
        ].map(({label,icon:Icon,value,target,sub,ok})=>(
          <div key={label} style={{background:C.white,borderRadius:R.xl,padding:16,border:`1px solid ${C.border}`}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
              <div style={{width:32,height:32,borderRadius:R.lg,background:ok?C.successBg:C.dangerBg,
                display:"flex",alignItems:"center",justifyContent:"center"}}>
                <Icon size={16} color={ok?C.success:C.danger}/>
              </div>
              <span style={{fontSize:F.sm,color:C.muted,fontWeight:600}}>{label}</span>
            </div>
            <div style={{fontSize:F.xl2,fontWeight:900,color:ok?C.success:C.danger}}>{value}</div>
            <div style={{fontSize:F.xs,color:C.muted,marginTop:3}}>Target: {target}</div>
            <div style={{fontSize:F.xs,color:C.muted,marginTop:1}}>{sub}</div>
          </div>
        ))}
      </div>

      {/* recharts column chart */}
      <SectionCard title="Rx Trend vs Target">
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={pData} margin={{top:4,right:0,left:-20,bottom:0}} barSize={20} barGap={4}>
            <XAxis dataKey="name" tick={{fontSize:10,fill:C.muted}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fontSize:10,fill:C.muted}} axisLine={false} tickLine={false}/>
            <Tooltip content={({active,payload,label})=>active&&payload?.length?(
              <div style={{background:C.white,borderRadius:R.md,padding:"8px 12px",border:`1px solid ${C.border}`,fontSize:F.xs}}>
                <div style={{fontWeight:700,marginBottom:4}}>{label}</div>
                {payload.map(p=><div key={p.name} style={{color:p.color}}>{p.name}: {p.value}</div>)}
              </div>
            ):null}/>
            <Bar dataKey="target" name="Target" fill={C.border} radius={[4,4,0,0]}/>
            <Bar dataKey="actual" name="Actual" fill={C.teal} radius={[4,4,0,0]}>
              {pData.map((p,i)=><Cell key={i} fill={p.actual>=p.target?C.success:p.actual/p.target>=0.75?C.teal:p.actual/p.target>=0.5?C.warning:C.danger}/>)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </SectionCard>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   PHASE 4 — APPROVALS HUB
═══════════════════════════════════════════════════ */
function ApprovalsHub({user,routePlans,setRoutePlans,callReports,setCallReports,expenseClaims,setExpenseClaims,leaveApps,setLeaveApps,leaveBalance,setLeaveBalance,onAudit}){
  const [tab,setTab]=useState("all");

  const canApprove=isManagerRole(user.role);
  if(!canApprove) return(
    <div style={{textAlign:"center",padding:"60px 0",color:C.muted}}>
      <Shield size={40} color={C.border} style={{display:"block",margin:"0 auto 12px"}}/>
      <div style={{fontSize:F.md,fontWeight:700}}>Manager Access Only</div>
      <div style={{fontSize:F.sm,marginTop:4}}>Approvals are visible to ASM, RSM and Admin roles.</div>
    </div>
  );

  // Route plans pending THIS approver's stage: RSM reviews "submitted",
  // ASM (and Admin) review "rsm_approved" — mirrors the two-stage rule in Route Planning.
  const pendingRoutes=routePlans.filter(r=>
    r.status==="submitted"||(["area_manager","admin"].includes(user.role)&&r.status==="rsm_approved"));
  const pendingCalls=callReports.filter(r=>r.status==="submitted");
  const pendingExpenses=expenseClaims.filter(e=>e.status==="submitted");
  const pendingLeaves=leaveApps.filter(l=>l.status==="submitted");

  const allPending=[
    ...pendingCalls.map(r=>({...r,_type:"Call Report",_color:C.teal})),
    ...pendingRoutes.map(r=>({...r,_type:"Route Plan",_color:C.info})),
    ...pendingExpenses.map(e=>({...e,_type:"Expense",_color:"#F5A623"})),
    ...pendingLeaves.map(l=>({...l,_type:"Leave",_color:"#8B5CF6"})),
  ];

  const tabs=[["all","All",allPending.length],["calls","Calls",pendingCalls.length],
    ["routes","Routes",pendingRoutes.length],["expenses","Expenses",pendingExpenses.length],
    ["leaves","Leave",pendingLeaves.length]];

  const shown=tab==="all"?allPending:tab==="calls"?pendingCalls.map(r=>({...r,_type:"Call Report",_color:C.teal})):
    tab==="routes"?pendingRoutes.map(r=>({...r,_type:"Route Plan",_color:C.info})):
    tab==="expenses"?pendingExpenses.map(e=>({...e,_type:"Expense",_color:"#F5A623"})):
    pendingLeaves.map(l=>({...l,_type:"Leave",_color:"#8B5CF6"}));

  const approveItem=(item)=>{
    const now=new Date().toLocaleString([],{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"});
    if(item._type==="Call Report"){
      setCallReports(p=>p.map(r=>r.id===item.id?{...r,status:"approved",approver:user.name,approvedAt:now}:r));
      onAudit&&onAudit(user.name,user.role,"Approval","info","Approved Call Report "+item.id,`${item.docName} · ${item.date} · via Approvals Hub`);
    }
    if(item._type==="Route Plan"){
      const stage=item.status==="submitted"?"RSM":"ASM";
      setRoutePlans(p=>p.map(r=>{
        if(r.id!==item.id) return r;
        if(r.status==="submitted") return {...r,status:"rsm_approved",rsmApprovedBy:user.name,rsmApprovedAt:now,rsmNote:r.rsmNote||"Approved via Approvals Hub."};
        if(r.status==="rsm_approved") return {...r,status:"asm_approved",asmApprovedBy:user.name,asmApprovedAt:now,asmNote:r.asmNote||"Approved via Approvals Hub."};
        return r;
      }));
      onAudit&&onAudit(user.name,user.role,"Approval","info",`Approved Route Plan ${item.id} (${stage} stage)`,`${item.title} · via Approvals Hub`);
    }
    if(item._type==="Expense"){
      setExpenseClaims(p=>p.map(e=>e.id===item.id?{...e,status:"approved",approver:user.name,approvedAt:now}:e));
      onAudit&&onAudit(user.name,user.role,"Approval","info","Approved Expense Claim "+item.id,`${item.description} · ₹${item.amount.toLocaleString()} · via Approvals Hub`);
    }
    if(item._type==="Leave"){
      setLeaveApps(p=>p.map(l=>l.id===item.id?{...l,status:"approved",approver:user.name,approvedAt:now}:l));
      setLeaveBalance(b=>({...b,[item.type]:{...b[item.type],
        used:(b[item.type]?.used||0)+item.days,
        pending:Math.max(0,(b[item.type]?.pending||0)-1)}}));
      onAudit&&onAudit(user.name,user.role,"Approval","info","Approved Leave Request "+item.id,`${item.repName} · ${item.type} · via Approvals Hub`);
    }
  };

  return(
    <div>
      <div style={{display:"flex",gap:6,marginBottom:16,flexWrap:"wrap"}}>
        {tabs.map(([k,l,n])=>(
          <button key={k} onClick={()=>setTab(k)} style={{padding:"7px 14px",borderRadius:R.full,
            border:`1.5px solid ${tab===k?C.teal:C.border}`,background:tab===k?C.tealBg:C.white,
            color:tab===k?C.tealDark:C.muted,fontSize:F.sm,fontWeight:tab===k?700:500,cursor:"pointer",fontFamily:"inherit",
            display:"flex",alignItems:"center",gap:5}}>
            {l}
            {n>0&&<span style={{background:tab===k?C.teal+"30":C.bg,borderRadius:99,padding:"1px 6px",fontSize:F.xs,fontWeight:700,color:tab===k?C.tealDark:C.muted}}>{n}</span>}
          </button>
        ))}
      </div>
      {shown.length===0&&(
        <div style={{textAlign:"center",padding:"48px 0",color:C.muted}}>
          <CheckCircle size={40} color={C.success} style={{display:"block",margin:"0 auto 12px"}}/>
          <div style={{fontSize:F.md,fontWeight:700,color:C.success}}>All caught up!</div>
          <div style={{fontSize:F.sm,marginTop:4}}>No pending approvals in this category.</div>
        </div>
      )}
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {shown.map(item=>(
          <div key={item.id} style={{background:C.white,borderRadius:R.xl,padding:16,
            border:`1px solid ${C.border}`,borderLeft:`4px solid ${item._color}`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
              <div>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2}}>
                  <span style={{fontSize:F.xs,padding:"2px 8px",borderRadius:R.full,fontWeight:700,
                    background:item._color+"18",color:item._color}}>{item._type}</span>
                  <span style={{fontSize:F.base,fontWeight:700,color:C.text}}>
                    {item.docName||item.title||item.description||`${item.type} Leave`}
                  </span>
                </div>
                <div style={{fontSize:F.sm,color:C.muted}}>
                  {item.repName||item.repName||"Ramesh Sharma"} · {item.date||item.planDate||item.from}
                  {item._type==="Route Plan"&&(
                    <span style={{marginLeft:6,fontWeight:700,color:item.status==="submitted"?C.warning:C.info}}>
                      · {item.status==="submitted"?"Awaiting RSM":"Awaiting ASM"}
                    </span>
                  )}
                </div>
              </div>
              {item.amount&&<span style={{fontSize:F.base,fontWeight:800,color:C.text}}>₹{item.amount.toLocaleString()}</span>}
              {item.days&&<span style={{fontSize:F.base,fontWeight:800,color:C.text}}>{item.days}d leave</span>}
            </div>
            <div style={{display:"flex",gap:8,marginTop:4}}>
              <Btn variant="primary" icon={CheckCircle} small onClick={()=>approveItem(item)} style={{flex:1}}>
                {item._type==="Route Plan"?(item.status==="submitted"?"Approve as RSM":"Approve as ASM"):"Approve"}
              </Btn>
              <Btn variant="secondary" small style={{flex:1}}>View Details</Btn>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}



/* ═══════════════════════════════════════════════════
   PHASE 4 — EXPENSE CLAIMS
═══════════════════════════════════════════════════ */

function SyncStatusBadge({isOnline,syncQueue,syncStatus,lastSyncAt,onClick}){
  const pending=(syncQueue||[]).filter(i=>i.status==="pending").length;
  const base={display:"flex",alignItems:"center",gap:6,padding:"5px 11px",
    borderRadius:R.full,cursor:"pointer",fontFamily:"inherit",border:"1px solid",fontSize:F.xs,fontWeight:700};
  if(syncStatus==="syncing") return(
    <button onClick={onClick} style={{...base,borderColor:C.teal,background:C.tealBg,color:C.tealDark}}>
      <RefreshCw size={13} color={C.teal} style={{animation:"spin 0.8s linear infinite"}}/>
      Syncing…
    </button>);
  if(syncStatus==="synced") return(
    <button onClick={onClick} style={{...base,borderColor:C.success,background:C.successBg,color:C.success}}>
      <CheckCircle size={13} color={C.success}/>
      Synced {lastSyncAt||""}
    </button>);
  if(!isOnline) return(
    <button onClick={onClick} style={{...base,borderColor:C.warning,background:C.warningBg,color:C.warning}}>
      <WifiOff size={13} color={C.warning}/>
      Offline{pending>0?` · ${pending} pending`:""}
    </button>);
  return(
    <button onClick={onClick} style={{...base,borderColor:C.border,background:C.bg,color:C.muted}}>
      <div style={{width:7,height:7,borderRadius:99,background:C.success,flexShrink:0}}/>
      Live{lastSyncAt?<span style={{color:C.border,marginLeft:4}}>· {lastSyncAt}</span>:null}
    </button>);
}

function NetworkToggle({isOnline,onToggle}){
  return(
    <button onClick={onToggle} title="Demo — toggle network"
      style={{display:"flex",alignItems:"center",gap:5,padding:"5px 11px",borderRadius:R.full,
        cursor:"pointer",fontFamily:"inherit",fontSize:F.xs,fontWeight:700,
        border:`1px solid ${isOnline?"#22C990":"#E84040"}`,
        background:isOnline?"#E5FAF3":"#FDE8E8",color:isOnline?"#089B85":"#C03030"}}>
      {isOnline?<Wifi size={12}/>:<WifiOff size={12}/>}
      {isOnline?"Online":"Offline"}
    </button>);
}

function SyncItemDot({s}){
  if(s==="syncing") return <RefreshCw size={13} color={C.teal} style={{animation:"spin 0.8s linear infinite",flexShrink:0}}/>;
  if(s==="synced")  return <CheckCircle size={13} color={C.success} style={{flexShrink:0}}/>;
  return <Clock size={13} color={C.warning} style={{flexShrink:0}}/>;
}

function SyncQueuePanel({syncQueue,isOnline,syncStatus,onClose,onSyncNow}){
  const pending=(syncQueue||[]).filter(i=>i.status==="pending").length;
  const tColor={call_report:C.teal,route_plan:C.info};
  const tLabel={call_report:"Call Report",route_plan:"Route Plan"};
  /* StatusDot extracted to module level */
  return(
    <div style={{position:"absolute",top:62,right:16,width:340,background:C.white,
      borderRadius:R.xl,boxShadow:"0 8px 32px rgba(0,0,0,0.16)",
      border:`1px solid ${C.border}`,zIndex:300,overflow:"hidden"}}>
      <div style={{padding:"12px 16px",background:C.navy,
        display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <Database size={15} color="white"/>
          <span style={{fontSize:F.base,fontWeight:700,color:"white"}}>Sync Queue</span>
          {pending>0&&<span style={{background:C.warning,color:"white",borderRadius:99,
            padding:"1px 7px",fontSize:F.xs,fontWeight:800}}>{pending}</span>}
        </div>
        <button onClick={onClose} style={{background:"rgba(255,255,255,0.15)",border:"none",
          borderRadius:R.full,width:26,height:26,cursor:"pointer",
          display:"flex",alignItems:"center",justifyContent:"center"}}>
          <X size={13} color="white"/>
        </button>
      </div>
      <div style={{maxHeight:300,overflowY:"auto"}}>
        {(!syncQueue||syncQueue.length===0)?(
          <div style={{padding:"28px 16px",textAlign:"center"}}>
            <CheckCircle size={28} color={C.success} style={{display:"block",margin:"0 auto 8px"}}/>
            <div style={{fontSize:F.sm,fontWeight:700,color:C.success}}>All synced</div>
            <div style={{fontSize:F.xs,color:C.muted,marginTop:2}}>No items pending upload</div>
          </div>
        ):syncQueue.map(item=>(
          <div key={item.id} style={{padding:"10px 16px",borderBottom:`1px solid ${C.border}`,
            display:"flex",gap:10,alignItems:"center",
            background:item.status==="syncing"?"#F0FDFB":item.status==="synced"?"#F5FDF9":"white",
            transition:"background 0.4s"}}>
            <SyncItemDot s={item.status}/>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:F.sm,fontWeight:600,color:C.text,
                overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.label}</div>
              <div style={{display:"flex",gap:6,marginTop:2}}>
                <span style={{fontSize:F.xs,padding:"1px 6px",borderRadius:R.full,fontWeight:600,
                  background:(tColor[item.type]||C.muted)+"20",color:tColor[item.type]||C.muted}}>
                  {tLabel[item.type]||item.type}
                </span>
                <span style={{fontSize:F.xs,color:C.muted}}>{item.queuedAt}</span>
              </div>
            </div>
            <span style={{fontSize:F.xs,fontWeight:700,
              color:item.status==="synced"?C.success:item.status==="syncing"?C.teal:C.warning}}>
              {item.status==="pending"?"Queued":item.status==="syncing"?"Syncing":item.status==="synced"?"Done":""}
            </span>
          </div>
        ))}
      </div>
      {pending>0&&isOnline&&syncStatus==="idle"&&(
        <div style={{padding:"12px 16px",borderTop:`1px solid ${C.border}`}}>
          <Btn variant="primary" icon={RefreshCw} onClick={onSyncNow} style={{width:"100%"}}>
            Upload {pending} Pending Item{pending>1?"s":""}
          </Btn>
        </div>
      )}
      {!isOnline&&syncQueue&&syncQueue.length>0&&(
        <div style={{padding:"9px 16px",borderTop:`1px solid ${C.border}`,
          background:C.warningBg,display:"flex",gap:7,alignItems:"center"}}>
          <WifiOff size={13} color={C.warning} style={{flexShrink:0}}/>
          <span style={{fontSize:F.xs,color:"#8B5E08",fontWeight:500}}>
            Items auto-sync on reconnect
          </span>
        </div>
      )}
      {syncStatus==="syncing"&&(
        <div style={{padding:"9px 16px",borderTop:`1px solid ${C.border}`,
          background:C.tealBg,display:"flex",gap:7,alignItems:"center"}}>
          <RefreshCw size={13} color={C.teal} style={{animation:"spin 0.8s linear infinite",flexShrink:0}}/>
          <span style={{fontSize:F.xs,color:C.tealDark,fontWeight:600}}>Sync in progress…</span>
        </div>
      )}
    </div>
  );
}

function OfflineBanner({syncQueue}){
  const pending=(syncQueue||[]).filter(i=>i.status==="pending").length;
  return(
    <div style={{background:"#FEF3E2",padding:"9px 24px",flexShrink:0,
      display:"flex",alignItems:"center",gap:10,
      borderBottom:"1px solid rgba(245,201,120,0.4)"}}>
      <WifiOff size={14} color={C.warning} style={{flexShrink:0}}/>
      <span style={{fontSize:F.sm,color:C.text}}>
        <b>Working offline.</b>{" "}
        {pending>0
          ?`${pending} item${pending>1?"s":""} saved locally — will auto-sync when reconnected.`
          :"Changes are saved locally and will sync automatically on reconnect."}
      </span>
    </div>
  );
}

/* ── MFA VERIFICATION SCREEN ─────────────────────────────────────────────────
   Rendered as a step within LoginScreen after password auth succeeds when the
   user's account has TOTP enabled. Uses the challenge token issued by the
   backend's POST /api/auth/login endpoint.
   ─────────────────────────────────────────────────────────────────────────── */
function MfaScreen({onVerify,onBack,code,setCode,useRecovery,setUseRecovery,loading,error}){
  return(
    <div style={{padding:"32px 32px 28px"}}>
      <div style={{textAlign:"center",marginBottom:24}}>
        <div style={{width:56,height:56,borderRadius:R.full,background:C.tealBg,
          display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px"}}>
          <Shield size={26} color={C.teal}/>
        </div>
        <div style={{fontSize:F.lg,fontWeight:800,color:C.text,marginBottom:4}}>
          Two-Factor Verification
        </div>
        <div style={{fontSize:F.sm,color:C.muted,lineHeight:1.5}}>
          {useRecovery
            ?"Enter one of the recovery codes from your backup list."
            :"Open your authenticator app and enter the 6-digit code."}
        </div>
      </div>

      {error&&(
        <div style={{background:C.dangerBg,border:`1px solid ${C.danger}30`,borderRadius:R.md,
          padding:"10px 12px",marginBottom:16,display:"flex",gap:8,alignItems:"flex-start"}}>
          <XCircle size={14} color={C.danger} style={{flexShrink:0,marginTop:1}}/>
          <span style={{fontSize:F.sm,color:C.danger}}>{error}</span>
        </div>
      )}

      <div style={{marginBottom:16}}>
        <label style={{fontSize:F.sm,fontWeight:700,color:C.text,display:"block",marginBottom:6}}>
          {useRecovery?"Recovery Code":"Authenticator Code"}
        </label>
        <input
          value={code}
          onChange={e=>setCode(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&!loading&&onVerify()}
          placeholder={useRecovery?"XXXX-XXXX":"000 000"}
          maxLength={useRecovery?9:7}
          autoFocus
          style={{width:"100%",padding:"13px 14px",border:`1.5px solid ${C.border}`,
            borderRadius:R.lg,fontSize:F.xl2,fontWeight:700,letterSpacing:"0.18em",
            textAlign:"center",color:C.text,outline:"none",fontFamily:"monospace",
            boxSizing:"border-box",background:C.white}}
        />
      </div>

      <button onClick={onVerify} disabled={loading} style={{
        width:"100%",padding:"12px",borderRadius:R.lg,border:"none",
        background:loading?C.border:C.teal,color:"white",
        fontSize:F.md,fontWeight:800,cursor:loading?"not-allowed":"pointer",
        fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:8,
        marginBottom:12}}>
        {loading
          ?<><RefreshCw size={16} style={{animation:"spin 1s linear infinite"}}/>Verifying…</>
          :<><CheckCircle size={16}/>Verify & Sign In</>}
      </button>

      <div style={{display:"flex",flexDirection:"column",gap:4,alignItems:"center"}}>
        <button onClick={()=>{setUseRecovery(v=>!v);setCode("");}}
          style={{background:"none",border:"none",cursor:"pointer",
            color:C.teal,fontSize:F.sm,fontWeight:600,padding:"4px 8px",fontFamily:"inherit"}}>
          {useRecovery?"Use authenticator app instead ↑":"Lost access? Use a recovery code ↓"}
        </button>
        <button onClick={onBack}
          style={{background:"none",border:"none",cursor:"pointer",
            color:C.muted,fontSize:F.xs,padding:"3px 8px",fontFamily:"inherit"}}>
          ← Back to sign in
        </button>
      </div>
    </div>
  );
}

const LoginScreen=({onLogin,extraLogins})=>{
  // ── Credential step ──────────────────────────────────────────────────────
  const [emp,setEmp]=useState("");
  const [pwd,setPwd]=useState("");
  const [showPwd,setShowPwd]=useState(false);
  const [errors,setErrors]=useState({});
  const [loginErr,setLoginErr]=useState("");
  const [loading,setLoading]=useState(false);
  // Demo-mode only: client-side lockout counter (server enforces real lockout)
  const [attempts,setAttempts]=useState(0);
  const locked=!USE_REAL_AUTH&&attempts>=5;

  // ── MFA step ─────────────────────────────────────────────────────────────
  const [authStep,setAuthStep]=useState("credentials"); // "credentials" | "mfa"
  const [mfaChallenge,setMfaChallenge]=useState("");
  const [mfaCode,setMfaCode]=useState("");
  const [useRecovery,setUseRecovery]=useState(false);
  const [mfaLoading,setMfaLoading]=useState(false);
  const [mfaErr,setMfaErr]=useState("");

  const validate=()=>{
    const e={};
    if(!emp.trim()) e.emp="Employee ID is required";
    if(!pwd) e.pwd="Password is required";
    return e;
  };

  const handleLogin=async()=>{
    const e=validate();
    if(Object.keys(e).length){setErrors(e);return;}
    setErrors({});setLoginErr("");setLoading(true);

    if(USE_REAL_AUTH){
      // ── Production path: call the Express backend ────────────────────────
      try{
        const data=await _apiCall("POST","/api/auth/login",{
          employee_id:sanitise(emp.trim().toLowerCase()),
          password:pwd,
        });
        if(data.requiresMfa){
          // Password correct but MFA required — advance to TOTP step
          setMfaChallenge(data.challengeToken);
          setAuthStep("mfa");
        }else{
          // No MFA — session created, tokens issued
          _accessToken=data.accessToken;
          _scheduleTokenRefresh();
          onLogin(_normUser(data.user));
        }
      }catch(err){
        setLoginErr(err.message||"Sign-in failed. Please try again.");
      }
    }else{
      // ── Demo path: client-side credential check (unchanged) ──────────────
      await new Promise(r=>setTimeout(r,900));
      const allLogins={...DEMO_USERS,...(extraLogins||{})};
      const user=allLogins[emp.trim().toLowerCase()];
      if(user&&pwd==="Demo@2024"){
        onLogin(user);
      }else{
        const na=attempts+1;
        setAttempts(na);
        if(na>=5) setLoginErr("Account locked for 15 minutes after 5 failed attempts.");
        else setLoginErr(`Invalid credentials. ${5-na} attempt${5-na===1?"":"s"} remaining.`);
      }
    }
    setLoading(false);
  };

  const handleMfaVerify=async()=>{
    if(!mfaCode.trim()){setMfaErr("Please enter your authenticator code.");return;}
    setMfaErr("");setMfaLoading(true);
    try{
      const body={challengeToken:mfaChallenge};
      if(useRecovery) body.recoveryCode=mfaCode.replace(/\s/g,"").toUpperCase();
      else            body.totpCode=mfaCode.replace(/\s/g,"");
      const data=await _apiCall("POST","/api/auth/mfa/verify",body);
      _accessToken=data.accessToken;
      _scheduleTokenRefresh();
      onLogin(_normUser(data.user));
    }catch(err){
      setMfaErr(err.message||"Verification failed. Please try again.");
    }
    setMfaLoading(false);
  };

  const handleKey=e=>{if(e.key==="Enter"&&!locked&&!loading) handleLogin();};

  // ── Render: MFA step ─────────────────────────────────────────────────────
  if(authStep==="mfa") return(
    <div style={{minHeight:"100vh",background:`linear-gradient(135deg, ${C.navy} 0%, ${C.navyMed} 100%)`,
      display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px"}}>
      <div style={{position:"fixed",inset:0,opacity:0.04,backgroundImage:
        "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
        backgroundSize:"60px 60px",pointerEvents:"none"}}/>
      <div style={{width:"100%",maxWidth:440,background:C.white,borderRadius:R.xl*1.5,
        overflow:"hidden",boxShadow:"0 24px 80px rgba(0,0,0,0.4)",position:"relative",zIndex:1}}>
        <div style={{background:C.navy,padding:"20px 32px",textAlign:"center",
          display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>
          <div style={{width:32,height:32,borderRadius:R.lg,background:C.teal,
            display:"flex",alignItems:"center",justifyContent:"center"}}>
            <Activity size={18} color="white"/>
          </div>
          <span style={{fontSize:F.lg,fontWeight:800,color:"white"}}>SunaV Pulse</span>
        </div>
        <MfaScreen
          onVerify={handleMfaVerify}
          onBack={()=>{setAuthStep("credentials");setMfaChallenge("");setMfaCode("");setMfaErr("");setLoginErr("");}}
          code={mfaCode} setCode={setMfaCode}
          useRecovery={useRecovery} setUseRecovery={setUseRecovery}
          loading={mfaLoading} error={mfaErr}/>
      </div>
    </div>
  );

  return(
    <div style={{minHeight:"100vh",background:`linear-gradient(135deg, ${C.navy} 0%, ${C.navyMed} 100%)`,
      display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px"}}>
      
      {/* Background pattern */}
      <div style={{position:"fixed",inset:0,opacity:0.04,backgroundImage:
        "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
        backgroundSize:"60px 60px",pointerEvents:"none"}}/>

      {/* Card */}
      <div style={{width:"100%",maxWidth:440,background:C.white,borderRadius:R.xl*1.5,
        overflow:"hidden",boxShadow:"0 24px 80px rgba(0,0,0,0.4)",position:"relative",zIndex:1}}>
        
        {/* Brand header */}
        <div style={{background:C.navy,padding:"28px 32px 24px",textAlign:"center"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,marginBottom:8}}>
            <div style={{width:40,height:40,borderRadius:R.lg,background:C.teal,
              display:"flex",alignItems:"center",justifyContent:"center"}}>
              <Activity size={22} color="white"/>
            </div>
            <span style={{fontSize:F.xl2,fontWeight:800,color:"white",letterSpacing:"-0.3px"}}>SunaV Pulse</span>
          </div>
          <div style={{fontSize:F.sm,color:"rgba(255,255,255,0.85)"}}>Enterprise Field Force Management Platform</div>
        </div>

        {/* Form */}
        <div style={{padding:"28px 32px"}}>
          <div style={{fontSize:F.lg,fontWeight:800,color:C.text,marginBottom:4}}>Welcome back</div>
          <div style={{fontSize:F.sm,color:C.muted,marginBottom:24}}>Sign in to your account to continue</div>

          {/* Lockout — demo mode only; server-side lockout is handled by the backend in prod */}
          {!USE_REAL_AUTH&&locked&&(
            <div style={{background:C.dangerBg,borderRadius:R.lg,padding:"12px 14px",
              marginBottom:16,display:"flex",gap:10,alignItems:"flex-start",
              border:`1px solid ${C.danger}30`}}>
              <Lock size={16} color={C.danger} style={{marginTop:1,flexShrink:0}}/>
              <span style={{fontSize:F.sm,color:C.danger,lineHeight:1.5}}>
                Account temporarily locked due to multiple failed attempts. Please try again after 15 minutes or contact your administrator.
              </span>
            </div>
          )}

          {/* Global error */}
          {loginErr&&!locked&&(
            <div style={{background:C.dangerBg,borderRadius:R.lg,padding:"10px 14px",
              marginBottom:16,display:"flex",gap:8,alignItems:"center",
              border:`1px solid ${C.danger}30`}}>
              <XCircle size={15} color={C.danger} style={{flexShrink:0}}/>
              <span style={{fontSize:F.sm,color:C.danger}}>{loginErr}</span>
            </div>
          )}

          {/* Employee ID */}
          <div style={{marginBottom:16}}>
            <label style={{fontSize:F.sm,fontWeight:700,color:C.text,display:"block",marginBottom:6}}>Employee ID</label>
            <div style={{position:"relative"}}>
              <div style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}}>
                <User size={16} color={errors.emp?C.danger:C.muted}/>
              </div>
              <input value={emp} onChange={e=>{setEmp(e.target.value);setErrors(v=>({...v,emp:""}));setLoginErr("");}}
                onKeyDown={handleKey} disabled={locked||loading}
                placeholder="e.g. rep.demo" style={{width:"100%",padding:"11px 12px 11px 38px",
                  borderRadius:R.lg,border:`1.5px solid ${errors.emp?C.danger:C.border}`,
                  fontSize:F.base,color:C.text,outline:"none",fontFamily:"inherit",
                  background:locked?C.bg:C.white,boxSizing:"border-box"}}/>
            </div>
            {errors.emp&&<div style={{fontSize:F.xs,color:C.danger,marginTop:4,display:"flex",gap:4,alignItems:"center"}}>
              <XCircle size={11}/>{errors.emp}</div>}
          </div>

          {/* Password */}
          <div style={{marginBottom:20}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
              <label style={{fontSize:F.sm,fontWeight:700,color:C.text}}>Password</label>
              <button style={{fontSize:F.sm,color:C.teal,background:"none",border:"none",
                cursor:"pointer",fontFamily:"inherit",fontWeight:600}}>Forgot password?</button>
            </div>
            <div style={{position:"relative"}}>
              <div style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}}>
                <Lock size={16} color={errors.pwd?C.danger:C.muted}/>
              </div>
              <input type={showPwd?"text":"password"} value={pwd}
                onChange={e=>{setPwd(e.target.value);setErrors(v=>({...v,pwd:""}));setLoginErr("");}}
                onKeyDown={handleKey} disabled={locked||loading}
                placeholder="Enter your password" style={{width:"100%",padding:"11px 40px 11px 38px",
                  borderRadius:R.lg,border:`1.5px solid ${errors.pwd?C.danger:C.border}`,
                  fontSize:F.base,color:C.text,outline:"none",fontFamily:"inherit",
                  background:locked?C.bg:C.white,boxSizing:"border-box"}}/>
              <button onClick={()=>setShowPwd(v=>!v)} disabled={locked}
                style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",
                  background:"none",border:"none",cursor:"pointer",padding:2}}>
                {showPwd?<EyeOff size={16} color={C.muted}/>:<Eye size={16} color={C.muted}/>}
              </button>
            </div>
            {errors.pwd&&<div style={{fontSize:F.xs,color:C.danger,marginTop:4,display:"flex",gap:4,alignItems:"center"}}>
              <XCircle size={11}/>{errors.pwd}</div>}
          </div>

          {/* Submit */}
          <button onClick={handleLogin} disabled={locked||loading} style={{
            width:"100%",padding:"12px",borderRadius:R.lg,border:"none",
            background:locked?C.border:C.teal,color:locked?C.muted:"white",
            fontSize:F.md,fontWeight:800,cursor:locked?"not-allowed":"pointer",
            fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            {loading?<><RefreshCw size={17} style={{animation:"spin 1s linear infinite"}}/> Signing in...</>
              :<><Activity size={17}/>Sign In</>}
          </button>

          {/* Demo credentials — only shown when backend is not configured */}
          {!USE_REAL_AUTH&&(
          <div style={{marginTop:20,background:C.bg,borderRadius:R.lg,padding:"12px 14px",
            border:`1px solid ${C.border}`}}>
            <div style={{fontSize:F.xs,fontWeight:700,color:C.muted,textTransform:"uppercase",
              letterSpacing:"0.7px",marginBottom:8}}>Demo Credentials (Password: Demo@2024)</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:"4px 12px"}}>
              {Object.entries(DEMO_USERS).map(([id,u])=>(
                <button key={id} onClick={()=>{setEmp(id);setPwd("Demo@2024");setLoginErr("");setErrors({});}}
                  style={{display:"flex",flexDirection:"column",alignItems:"flex-start",padding:"6px 8px",
                    borderRadius:R.md,border:`1px solid ${C.border}`,background:emp===id?C.tealBg:C.white,
                    cursor:"pointer",fontFamily:"inherit",textAlign:"left"}}>
                  <span style={{fontSize:F.xs,fontWeight:700,color:emp===id?C.tealDark:C.text}}>{id}</span>
                  <span style={{fontSize:F.xs,color:C.muted}}>{u.roleLabel.split(" ").slice(-1)[0]}</span>
                </button>
              ))}
            </div>
          </div>
          )}
        </div>
      </div>

      <div style={{marginTop:20,padding:"0 16px",display:"flex",justifyContent:"space-between",
        alignItems:"center",flexWrap:"wrap",gap:12}}>
        <span style={{fontSize:F.sm,color:"rgba(255,255,255,0.75)"}}>
          © 2026 SunaV Pulse · Enterprise Edition · v1.0.0
        </span>
        <div style={{display:"flex",alignItems:"center",gap:10,background:"rgba(0,0,0,0.25)",
          borderRadius:R.lg,padding:"6px 12px",border:"1px solid rgba(255,255,255,0.1)"}}>
          <span style={{fontSize:F.xs,color:"rgba(255,255,255,0.7)",whiteSpace:"nowrap"}}>
            powered by
          </span>
          <img src="data:image/jpeg;base64,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"
            alt="Alleviare Life Sciences"
            style={{height:28,width:"auto",mixBlendMode:"screen",
              filter:"brightness(1.05) contrast(1.1)"}}/>
        </div>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
};

/* ─── DASHBOARD CONTENT ──────────────────────────────────────────────────── */

/* ─── Phase 3 Demo helper rendered on dashboard ───────────────────────── */
function P3DemoWidget({isOnline,syncQueue,syncStatus,lastSyncAt,onToggle}){
  const pending=(syncQueue||[]).filter(i=>i.status==="pending").length;
  const steps=[
    {n:1,title:"Go Offline",done:!isOnline,hint:"Click the Online button in the top bar"},
    {n:2,title:"Submit a Call Report or Route Plan",done:pending>0||(!isOnline&&syncQueue&&syncQueue.length>0),hint:"Submit while offline — it queues locally"},
    {n:3,title:"Watch the Sync Badge",done:syncStatus==="syncing"||syncStatus==="synced",hint:"Click the sync badge to see the queue panel"},
    {n:4,title:"Go Back Online",done:syncStatus==="synced",hint:"Network auto-triggers sync on reconnect"},
  ];
  return(
    <div style={{background:C.white,borderRadius:R.xl,padding:20,border:`1px solid ${C.border}`,marginBottom:20}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
            <div style={{width:8,height:8,borderRadius:99,background:C.info}}/>
            <span style={{fontSize:F.xs,fontWeight:700,color:C.info,textTransform:"uppercase",letterSpacing:"0.6px"}}>Phase 3 — Offline & Sync</span>
          </div>
          <div style={{fontSize:F.lg,fontWeight:800,color:C.text}}>Demo Walkthrough</div>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          {syncStatus==="synced"&&<div style={{display:"flex",alignItems:"center",gap:5,
            background:C.successBg,borderRadius:R.full,padding:"4px 10px"}}>
            <CheckCircle size={13} color={C.success}/>
            <span style={{fontSize:F.xs,fontWeight:700,color:C.success}}>Synced {lastSyncAt}</span>
          </div>}
          <button onClick={onToggle} style={{display:"flex",alignItems:"center",gap:6,
            padding:"7px 14px",borderRadius:R.full,cursor:"pointer",fontFamily:"inherit",
            border:`2px solid ${isOnline?"#22C990":"#E84040"}`,
            background:isOnline?"#E5FAF3":"#FDE8E8",
            color:isOnline?"#089B85":"#C03030",
            fontSize:F.sm,fontWeight:800}}>
            {isOnline?<Wifi size={14}/>:<WifiOff size={14}/>}
            {isOnline?"Simulate Going Offline":"Simulate Going Online"}
          </button>
        </div>
      </div>
      {!isOnline&&(
        <div style={{background:C.warningBg,borderRadius:R.lg,padding:"10px 14px",marginBottom:14,
          display:"flex",gap:8,alignItems:"center",border:`1px solid ${C.warning}30`}}>
          <WifiOff size={14} color={C.warning} style={{flexShrink:0}}/>
          <span style={{fontSize:F.sm,color:C.text}}>
            <b>Offline mode active.</b> Go to Call Reports or Route Planning and submit — it'll be saved to the local queue below.
          </span>
        </div>
      )}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:10,marginBottom:16}}>
        {steps.map(s=>(
          <div key={s.n} style={{background:s.done?C.successBg:C.bg,borderRadius:R.lg,padding:12,
            border:`1.5px solid ${s.done?C.success:C.border}`,transition:"all 0.3s"}}>
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:5}}>
              <div style={{width:22,height:22,borderRadius:R.full,flexShrink:0,
                background:s.done?C.success:C.border,
                display:"flex",alignItems:"center",justifyContent:"center"}}>
                {s.done?<CheckCircle size={13} color="white"/>
                  :<span style={{fontSize:F.xs,fontWeight:800,color:"white"}}>{s.n}</span>}
              </div>
              <span style={{fontSize:F.sm,fontWeight:700,color:s.done?C.success:C.text}}>{s.title}</span>
            </div>
            <div style={{fontSize:F.xs,color:C.muted,lineHeight:1.4}}>{s.hint}</div>
          </div>
        ))}
      </div>
      {/* Live sync queue */}
      <div style={{background:C.bg,borderRadius:R.lg,padding:12}}>
        <div style={{fontSize:F.sm,fontWeight:700,color:C.text,marginBottom:pending>0?10:0}}>
          Sync Queue {pending>0&&<span style={{background:C.warning,color:"white",borderRadius:99,
            padding:"1px 7px",fontSize:F.xs,fontWeight:800,marginLeft:4}}>{pending} pending</span>}
        </div>
        {(!syncQueue||syncQueue.length===0)&&(
          <div style={{fontSize:F.xs,color:C.muted,marginTop:4}}>
            Queue empty — submit items while offline to see them here
          </div>
        )}
        {(syncQueue||[]).map(item=>(
          <div key={item.id} style={{display:"flex",gap:8,alignItems:"center",marginTop:6,
            background:item.status==="syncing"?"#F0FDFB":item.status==="synced"?"#F5FDF9":"white",
            borderRadius:R.md,padding:"7px 10px",border:`1px solid ${C.border}`,transition:"background 0.4s"}}>
            <SyncItemDot s={item.status}/>
            <span style={{flex:1,fontSize:F.sm,color:C.text,fontWeight:500}}>{item.label}</span>
            <span style={{fontSize:F.xs,padding:"2px 8px",borderRadius:R.full,fontWeight:700,
              background:item.status==="pending"?C.warningBg:item.status==="syncing"?C.tealBg:C.successBg,
              color:item.status==="pending"?C.warning:item.status==="syncing"?C.teal:C.success}}>
              {item.status==="pending"?"Queued":item.status==="syncing"?"Syncing…":"Synced ✓"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const RepDashboard=({user})=>(
  <div>
    <div style={{display:"flex",gap:12,marginBottom:20,flexWrap:"wrap"}}>
      <MetricCard label="Today's Calls" value="8" trend="+2 vs yesterday" trendDir="up" icon={Phone} iconColor={C.teal} sub="target 8" />
      <MetricCard label="MTD Calls" value="147" trend="91.9% of target" trendDir="up" icon={Activity} iconColor={C.info} sub="target 160" />
      <MetricCard label="Doctor Coverage" value="74.3%" trend="+5.1% this week" trendDir="up" icon={Users} iconColor={C.navyMed} sub="52 of 70 doctors" />
      <MetricCard label="Quota Achievement" value="92%" trend="+8% vs last month" trendDir="up" icon={Target} iconColor={C.warning} sub="target 100%" />
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:16,marginBottom:16}}>
      <SectionCard title="Visit Trend — Last 12 Weeks"
        action={<Badge type="success">On Track</Badge>}>
        <VisitTrendChart/>
      </SectionCard>
      <SectionCard title="Product Rx Breakdown (MTD)"
        action={<Badge type="warn">2 Below Target</Badge>}>
        <ProductMixChart/>
      </SectionCard>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:16}}>
      <SectionCard title="Today's Schedule">
        {[
          {time:"10:30 AM",doc:"Dr. Phạm Thị Hoa",spec:"Endocrinologist",status:"current"},
          {time:"2:15 PM",doc:"Dr. Hoàng Đức Nam",spec:"Neurologist",status:"upcoming"},
          {time:"3:30 PM",doc:"Dr. Vũ Thị Mai",spec:"Cardiologist",status:"upcoming"},
        ].map((v,i)=>(
          <div key={i} style={{display:"flex",gap:12,padding:"10px 0",
            borderBottom:i<2?`0.5px solid ${C.border}`:undefined}}>
            <div style={{fontSize:F.sm,fontWeight:700,color:v.status==="current"?C.teal:C.muted,
              minWidth:70}}>{v.time}</div>
            <div style={{width:8,height:8,borderRadius:99,marginTop:4,flexShrink:0,
              background:v.status==="current"?C.teal:C.border,
              boxShadow:v.status==="current"?`0 0 0 3px ${C.tealBg}`:undefined}}/>
            <div>
              <div style={{fontSize:F.base,fontWeight:700,color:C.text}}>{v.doc}</div>
              <div style={{fontSize:F.sm,color:C.muted}}>{v.spec}</div>
            </div>
            {v.status==="current"&&<Badge type="success">In Progress</Badge>}
          </div>
        ))}
      </SectionCard>
      <SectionCard title="Pending Items">
        {[
          {label:"Call reports awaiting approval",count:2,icon:Clock,color:C.warning},
          {label:"Expense claims pending",count:1,icon:DollarSign,color:C.info},
          {label:"Offline reports to sync",count:2,icon:RefreshCw,color:C.teal},
        ].map((item,i)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",
            alignItems:"center",padding:"10px 0",
            borderBottom:i<2?`0.5px solid ${C.border}`:undefined}}>
            <div style={{display:"flex",gap:10,alignItems:"center"}}>
              <div style={{width:32,height:32,borderRadius:R.md,background:item.color+"18",
                display:"flex",alignItems:"center",justifyContent:"center"}}>
                <item.icon size={15} color={item.color}/>
              </div>
              <span style={{fontSize:F.base,color:C.text}}>{item.label}</span>
            </div>
            <span style={{fontSize:F.xl,fontWeight:800,color:item.color}}>{item.count}</span>
          </div>
        ))}
      </SectionCard>
    </div>
  </div>
);

const ASMDashboard=({user,isMobile})=>(
  <div>
    <div style={{display:"flex",gap:12,marginBottom:20,flexWrap:"wrap"}}>
      <MetricCard label="Team Calls MTD" value="1,340" trend="+12% vs last month" trendDir="up" icon={Phone} iconColor={C.teal} sub="12 reps · target 1,920" />
      <MetricCard label="Pending Approvals" value="34" trend="-8 since yesterday" trendDir="up" icon={Clock} iconColor={C.warning} sub="SLA: 4 overdue" />
      <MetricCard label="Team Coverage" value="74%" trend="+3% this week" trendDir="up" icon={Users} iconColor={C.navyMed} sub="avg across team" />
      <MetricCard label="Team Quota" value="88%" trend="+6% vs last month" trendDir="up" icon={Award} iconColor={C.info} sub="area target 100%" />
    </div>
    <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1.4fr 1fr",gap:16,marginBottom:16}}>
      <SectionCard title="Team Performance (MTD)"
        action={<Btn variant="ghost" icon={Download} small>Export</Btn>}>
        <div style={{overflowX:"auto",WebkitOverflowScrolling:"touch"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:F.sm}}>
            <thead><tr>{["Rep","Calls","Target","Achievement","Status"].map((h,i)=>(
              <th key={i} style={{padding:"8px 10px",textAlign:"left",fontWeight:700,
                color:C.muted,borderBottom:`2px solid ${C.teal}`,whiteSpace:"nowrap",
                fontSize:F.xs,textTransform:"uppercase",letterSpacing:"0.5px"}}>{h}</th>
            ))}</tr></thead>
            <tbody>{TEAM_PERF.map((r,i)=>(
              <tr key={i} style={{background:i%2===0?C.white:C.bg}}>
                <td style={{padding:"9px 10px",fontWeight:600,color:C.text}}>{r.name}</td>
                <td style={{padding:"9px 10px",color:C.text}}>{r.calls}</td>
                <td style={{padding:"9px 10px",color:C.muted}}>{r.target}</td>
                <td style={{padding:"9px 10px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{width:60,height:5,borderRadius:99,background:C.border,overflow:"hidden"}}>
                      <div style={{width:`${Math.min(r.achievement,100)}%`,height:"100%",borderRadius:99,
                        background:r.achievement>=100?C.success:r.achievement>=85?C.teal:r.achievement>=70?C.warning:C.danger}}/>
                    </div>
                    <span style={{fontWeight:700,color:r.achievement>=100?C.success:r.achievement>=85?C.teal:r.achievement>=70?C.warning:C.danger}}>
                      {r.achievement}%
                    </span>
                  </div>
                </td>
                <td style={{padding:"9px 10px"}}>
                  <Badge type={r.status==="above"?"success":r.status==="on"?"info":"warn"} small>
                    {r.status==="above"?"Above":"On Track"===r.status||r.status==="on"?"On Track":"Below"}
                  </Badge>
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </SectionCard>
      <SectionCard title="Approval Queue" action={<Badge type="warn">34 Pending</Badge>}>
        {[{type:"Call Report",from:"Ramesh Sharma",age:"Just now",tag:"warn"},
          {type:"Expense Claim",from:"Priya Mehta",age:"45 min ago",tag:"info"},
          {type:"Call Report",from:"Vikram Nair",age:"2 hrs ago",tag:"warn"},
          {type:"Leave Request",from:"Sunita Rao",age:"4 hrs ago",tag:"warn"},
        ].map((a,i)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",
            alignItems:"flex-start",padding:"9px 0",
            borderBottom:i<3?`0.5px solid ${C.border}`:undefined}}>
            <div>
              <div style={{fontSize:F.base,fontWeight:600,color:C.text}}>{a.from}</div>
              <div style={{fontSize:F.sm,color:C.muted,marginTop:1}}>{a.type} · {a.age}</div>
            </div>
            <div style={{display:"flex",gap:6}}>
              <button style={{width:36,height:36,borderRadius:R.md,border:"none",
                background:C.successBg,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <CheckCircle size={14} color={C.tealDark}/>
              </button>
              <button style={{width:36,height:36,borderRadius:R.md,border:"none",
                background:C.dangerBg,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <XCircle size={14} color={C.danger}/>
              </button>
            </div>
          </div>
        ))}
        <Btn variant="ghost" style={{marginTop:8,fontSize:F.sm,padding:"6px 0"}}>View all 34 →</Btn>
      </SectionCard>
    </div>
    <SectionCard title="Team Visit Trend — Last 12 Weeks" action={<Badge>Area: Pune</Badge>}>
      <VisitTrendChart/>
    </SectionCard>
  </div>
);

const RSMDashboard=({user})=>(
  <div>
    <div style={{display:"flex",gap:12,marginBottom:20,flexWrap:"wrap"}}>
      <MetricCard label="Region Calls MTD" value="5,840" trend="+9% vs last month" trendDir="up" icon={Phone} iconColor={C.teal} sub="48 reps · 4 areas" />
      <MetricCard label="Areas Above Target" value="3 / 4" trend="1 area below 85%" trendDir="up" icon={Map} iconColor={C.navyMed} sub="Pune East at 82%" />
      <MetricCard label="Region Quota" value="94%" trend="+4% vs last month" trendDir="up" icon={Target} iconColor={C.success} sub="target ₹16.8 Cr" />
      <MetricCard label="Expense Ratio" value="4.2%" trend="-0.3% vs last month" trendDir="up" icon={DollarSign} iconColor={C.warning} sub="budget ceiling 5%" />
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:16,marginBottom:16}}>
      <SectionCard title="Territory Achievement (%)" action={<Btn variant="ghost" icon={Download} small>PDF</Btn>}>
        <TerritoryChart/>
        <div style={{display:"flex",gap:12,marginTop:10,flexWrap:"wrap"}}>
          {[{c:C.success,l:"≥100%"},{c:C.teal,l:"85–99%"},{c:C.warning,l:"75–84%"},{c:C.danger,l:"<75%"}].map(x=>(
            <div key={x.l} style={{display:"flex",alignItems:"center",gap:5}}>
              <div style={{width:10,height:10,borderRadius:2,background:x.c}}/>
              <span style={{fontSize:F.xs,color:C.muted}}>{x.l}</span>
            </div>
          ))}
        </div>
      </SectionCard>
      <SectionCard title="Product Mix by Area" action={<Badge type="info">MTD</Badge>}>
        <ProductMixChart/>
      </SectionCard>
    </div>
    <SectionCard title="Area-Wise KPI Summary">
      <div style={{overflowX:"auto",WebkitOverflowScrolling:"touch"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:F.sm}}>
        <thead><tr>{["Area","Reps","Calls","Achievement","Coverage","SLA %"].map((h,i)=>(
          <th key={i} style={{padding:"8px 12px",textAlign:"left",fontWeight:700,
            color:C.muted,borderBottom:`2px solid ${C.teal}`,fontSize:F.xs,
            textTransform:"uppercase",letterSpacing:"0.5px"}}>{h}</th>
        ))}</tr></thead>
        <tbody>{TERRITORY_PERF.map((r,i)=>(
          <tr key={i} style={{background:i%2===0?C.white:C.bg}}>
            <td style={{padding:"10px 12px",fontWeight:700,color:C.text}}>{r.area}</td>
            <td style={{padding:"10px 12px",color:C.muted}}>{r.reps}</td>
            <td style={{padding:"10px 12px",color:C.text}}>{r.calls}</td>
            <td style={{padding:"10px 12px"}}>
              <span style={{fontWeight:700,color:r.achievement>=100?C.success:r.achievement>=85?C.teal:C.warning}}>
                {r.achievement}%
              </span>
            </td>
            <td style={{padding:"10px 12px",color:C.text}}>
              {[78,71,82,76][i]}%
            </td>
            <td style={{padding:"10px 12px"}}>
              <Badge type={[100,82,96,91][i]>=90?"success":[100,82,96,91][i]>=75?"info":"warn"} small>
                {[98,87,95,92][i]}%
              </Badge>
            </td>
          </tr>
        ))}</tbody>
      </table>
        </div>
    </SectionCard>
  </div>
);

const AdminDashboard=({user,isMobile})=>(
  <div>
    <div style={{display:"flex",gap:12,marginBottom:20,flexWrap:"wrap"}}>
      <MetricCard label="Active Users" value="1,247" trend="+23 this month" trendDir="up" icon={Users} iconColor={C.teal} sub="across all roles" />
      <MetricCard label="Active Territories" value="48" trend="3 pending setup" trendDir="up" icon={Map} iconColor={C.navyMed} sub="4 regions" />
      <MetricCard label="Pending Approvals" value="156" trend="34 overdue >48h" trendDir="down" icon={Clock} iconColor={C.warning} sub="platform-wide" />
      <MetricCard label="System Uptime" value="99.9%" trend="Last 30 days" trendDir="up" icon={Activity} iconColor={C.success} sub="SLA: 99.5%" />
    </div>
    <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1.3fr 1fr",gap:16,marginBottom:16}}>
      <SectionCard title="Platform Activity — Last 7 Days" action={<Badge type="success">System Healthy</Badge>}>
        <AdminActivityChart/>
      </SectionCard>
      <SectionCard title="System Health">
        {[
          {label:"API Response (p95)",value:"187ms",target:"<300ms",ok:true},
          {label:"DB Query Time (avg)",value:"24ms",target:"<100ms",ok:true},
          {label:"Redis Hit Rate",value:"94.2%",target:">90%",ok:true},
          {label:"Offline Sync Queue",value:"23 pending",target:"<50",ok:true},
          {label:"Storage Used",value:"2.4 TB",target:"<5 TB",ok:true},
          {label:"Error Rate (1h)",value:"0.02%",target:"<0.1%",ok:true},
        ].map((m,i)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",
            alignItems:"center",padding:"9px 0",
            borderBottom:i<5?`0.5px solid ${C.border}`:undefined}}>
            <span style={{fontSize:F.base,color:C.text}}>{m.label}</span>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <span style={{fontSize:F.base,fontWeight:700,color:m.ok?C.success:C.danger}}>{m.value}</span>
              <span style={{fontSize:F.xs,color:C.muted}}>{m.target}</span>
              {m.ok?<CheckCircle size={13} color={C.success}/>:<XCircle size={13} color={C.danger}/>}
            </div>
          </div>
        ))}
      </SectionCard>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:16}}>
      <SectionCard title="User Distribution by Role">
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {[{role:"Medical Representatives",count:1082,pct:87,color:C.teal},
            {role:"Area Sales Managers",count:108,pct:9,color:C.navyMed},
            {role:"Regional Sales Managers",count:48,pct:4,color:C.info},
            {role:"Administrators",count:9,pct:0.7,color:C.purple}].map((r,i)=>(
            <div key={i}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                <span style={{fontSize:F.sm,color:C.text}}>{r.role}</span>
                <span style={{fontSize:F.sm,fontWeight:700,color:r.color}}>{r.count.toLocaleString()}</span>
              </div>
              <div style={{background:C.border,borderRadius:99,height:6}}>
                <div style={{width:`${r.pct}%`,height:"100%",borderRadius:99,background:r.color}}/>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
      <SectionCard title="Recent Audit Events">
        {[
          {action:"USER_CREATE",desc:"New MR added: Arjun Singh · Pune Central","time":"12 min ago",type:"info"},
          {action:"CONFIG_CHANGE",desc:"Geofence radius updated: Nashik → 150m","time":"1 hr ago",type:"warn"},
          {action:"VISIT_APPROVE",desc:"Bulk 18 call reports approved (ASM: SP)","time":"2 hrs ago",type:"success"},
          {action:"LOGIN_FAILURE",desc:"5 failed attempts: emp.unknown · IP: 192.168.x","time":"3 hrs ago",type:"danger"},
        ].map((e,i)=>(
          <div key={i} style={{display:"flex",gap:10,padding:"9px 0",
            borderBottom:i<3?`0.5px solid ${C.border}`:undefined}}>
            <Badge type={e.type} small>{e.action}</Badge>
            <div style={{flex:1}}>
              <div style={{fontSize:F.sm,color:C.text,lineHeight:1.4}}>{e.desc}</div>
              <div style={{fontSize:F.xs,color:C.muted,marginTop:2}}>{e.time}</div>
            </div>
          </div>
        ))}
      </SectionCard>
    </div>
  </div>
);

const DashboardContent=({user,isOnline,syncQueue,syncStatus,lastSyncAt,onToggle,isMobile})=>{
  const map={rep:<RepDashboard user={user}/>, area_manager:<ASMDashboard user={user} isMobile={isMobile}/>,
    regional_manager:<RSMDashboard user={user}/>, admin:<AdminDashboard user={user} isMobile={isMobile}/>};
  return(
    <div style={{display:"flex",flexDirection:"column",gap:0,height:"100%",overflow:"auto"}}>
      <div style={{padding:isMobile?"14px 12px 0":"20px 24px 0"}}>
        <P3DemoWidget isOnline={isOnline} syncQueue={syncQueue||[]} syncStatus={syncStatus}
          lastSyncAt={lastSyncAt} onToggle={onToggle}/>
      </div>
      {map[user.role]||null}
    </div>
  );
};

/* ─── PLACEHOLDER SCREEN ─────────────────────────────────────────────────── */
const Placeholder=({id,label,icon:Icon,phase})=>(
  <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
    height:"60vh",textAlign:"center",padding:40}}>
    <div style={{width:72,height:72,borderRadius:R.xl,background:C.bg,border:`2px dashed ${C.border}`,
      display:"flex",alignItems:"center",justifyContent:"center",marginBottom:20}}>
      <Icon size={32} color={C.muted}/>
    </div>
    <div style={{fontSize:F.xl,fontWeight:800,color:C.text,marginBottom:8}}>{label}</div>
    <div style={{fontSize:F.base,color:C.muted,marginBottom:20,maxWidth:360,lineHeight:1.6}}>
      This module is scheduled for <strong>{PHASE_LABELS[phase]}</strong> of development.
      All data models, API endpoints, and UI designs for this screen have been documented
      and approved in the specification.
    </div>
    <div style={{display:"flex",gap:8,flexWrap:"wrap",justifyContent:"center"}}>
      <Badge type="info">Specification Complete</Badge>
      <Badge type="warn">Development: {PHASE_LABELS[phase]}</Badge>
    </div>
  </div>
);

/* ─── NOTIFICATION PANEL ─────────────────────────────────────────────────── */
const NotifPanel=({onClose})=>(
  <div style={{position:"absolute",top:60,right:16,width:360,background:C.white,
    borderRadius:R.xl,boxShadow:"0 8px 40px rgba(0,0,0,0.16)",zIndex:200,
    border:`1px solid ${C.border}`,overflow:"hidden"}}>
    <div style={{padding:"14px 18px",display:"flex",justifyContent:"space-between",
      alignItems:"center",borderBottom:`1px solid ${C.border}`}}>
      <span style={{fontSize:F.md,fontWeight:800,color:C.text}}>Notifications</span>
      <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",
        fontSize:F.sm,fontWeight:600,color:C.muted}}>Clear all</button>
    </div>
    {NOTIFICATIONS.map((n,i)=>(
      <div key={n.id} onClick={onClose} style={{padding:"12px 18px",display:"flex",gap:12,
        alignItems:"flex-start",borderBottom:i<NOTIFICATIONS.length-1?`0.5px solid ${C.border}`:undefined,
        cursor:"pointer",background:n.unread?n.bg+"40":C.white}}>
        <div style={{width:36,height:36,borderRadius:R.full,background:n.bg,
          display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <n.icon size={17} color={n.color}/>
        </div>
        <div style={{flex:1}}>
          <div style={{fontSize:F.base,fontWeight:n.unread?700:500,color:C.text}}>{n.title}</div>
          <div style={{fontSize:F.sm,color:C.muted,marginTop:2,lineHeight:1.4}}>{n.body}</div>
          <div style={{fontSize:F.xs,color:C.muted,marginTop:4}}>{n.time}</div>
        </div>
        {n.unread&&<div style={{width:8,height:8,borderRadius:99,background:C.teal,flexShrink:0,marginTop:4}}/>}
      </div>
    ))}
  </div>
);

/* ─── SIDEBAR ────────────────────────────────────────────────────────────── */
const Sidebar=({user,activeScreen,setScreen,collapsed,setCollapsed,isMobile,mobileOpen,onCloseMobile})=>{
  const isVisible=(roles)=>roles.includes(user.role);
  const roleColors={rep:C.teal,area_manager:C.warning,regional_manager:C.info,admin:C.purple};
  const roleColor=roleColors[user.role]||C.teal;
  // On mobile the sidebar is always "expanded" (full labels) since it's a
  // temporary overlay drawer, not a persistent rail — the collapse toggle
  // only makes sense on desktop.
  const eff_collapsed=isMobile?false:collapsed;
  const navigate=(id)=>{setScreen(id);if(isMobile&&onCloseMobile)onCloseMobile();};

  return(
    <>
      {isMobile&&mobileOpen&&(
        <div onClick={onCloseMobile} style={{position:"fixed",inset:0,background:"rgba(13,43,78,0.45)",
          zIndex:90,animation:"fadeIn 0.2s ease"}}/>
      )}
      <div style={{width:isMobile?280:(eff_collapsed?64:240),minHeight:"100vh",background:C.navy,
        display:"flex",flexDirection:"column",transition:isMobile?"transform 0.25s ease":"width 0.2s ease",
        flexShrink:0,borderRight:`1px solid rgba(255,255,255,0.06)`,
        ...(isMobile?{position:"fixed",top:0,left:0,height:"100vh",zIndex:95,
          transform:mobileOpen?"translateX(0)":"translateX(-100%)",
          boxShadow:mobileOpen?"4px 0 24px rgba(0,0,0,0.25)":"none"}:{})}}>

      {/* Logo */}
      <div style={{padding:eff_collapsed?"16px 0":"16px 18px",display:"flex",alignItems:"center",
        gap:10,borderBottom:"1px solid rgba(255,255,255,0.08)",height:64,
        justifyContent:eff_collapsed?"center":"flex-start"}}>
        <div style={{width:32,height:32,borderRadius:R.md,background:C.teal,
          display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <Activity size={18} color="white"/>
        </div>
        {!eff_collapsed&&<div style={{flex:1}}>
          <div style={{fontSize:F.md,fontWeight:800,color:"white",lineHeight:1}}>SunaV Pulse</div>
          <div style={{fontSize:F.xs,color:"rgba(255,255,255,0.4)",marginTop:1}}>Field Force Platform</div>
        </div>}
        {isMobile&&<button onClick={onCloseMobile} style={{width:36,height:36,border:"none",
          background:"rgba(255,255,255,0.08)",borderRadius:R.md,display:"flex",alignItems:"center",
          justifyContent:"center",cursor:"pointer",flexShrink:0}}>
          <X size={18} color="white"/>
        </button>}
      </div>

      {/* Nav */}
      <div style={{flex:1,overflowY:"auto",padding:"12px 0"}}>
        {NAV_GROUPS.map(group=>(
          <div key={group.label} style={{marginBottom:4}}>
            {!eff_collapsed&&<div style={{fontSize:F.xs,fontWeight:700,color:"rgba(255,255,255,0.25)",
              textTransform:"uppercase",letterSpacing:"0.8px",padding:"8px 18px 4px"}}>{group.label}</div>}
            {group.items.filter(item=>isVisible(item.roles)).map(item=>{
              const active=activeScreen===item.id;
              const isLive=item.phase===1;
              return(
                <button key={item.id} onClick={()=>navigate(item.id)}
                  title={eff_collapsed?item.label:undefined}
                  style={{width:"100%",padding:eff_collapsed?"12px":(isMobile?"13px 18px":"10px 18px"),
                    display:"flex",alignItems:"center",gap:10,background:"none",border:"none",
                    cursor:"pointer",color:active?"white":isLive?"rgba(255,255,255,0.7)":"rgba(255,255,255,0.35)",
                    fontFamily:"inherit",textAlign:"left",position:"relative",minHeight:isMobile?48:undefined,
                    borderLeft:`3px solid ${active?C.teal:"transparent"}`,
                    background:active?"rgba(11,197,169,0.12)":"none",
                    justifyContent:eff_collapsed?"center":"flex-start"}}>
                  <item.icon size={18} style={{flexShrink:0}}/>
                  {!eff_collapsed&&<>
                    <span style={{fontSize:isMobile?F.base:F.sm,fontWeight:active?700:500,flex:1}}>{item.label}</span>
                    {!isLive&&<span style={{fontSize:9,padding:"1px 5px",borderRadius:3,
                      background:"rgba(255,255,255,0.08)",color:"rgba(255,255,255,0.3)",
                      whiteSpace:"nowrap"}}>P{item.phase}</span>}
                    {active&&isLive&&<ChevronRight size={14}/>}
                  </>}
                  {!isLive&&!eff_collapsed&&<span style={{position:"absolute",left:3,top:"50%",
                    transform:"translateY(-50%)",width:3,height:"40%",borderRadius:99,
                    background:"rgba(255,255,255,0.1)"}}/>}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* User section */}
      <div style={{borderTop:"1px solid rgba(255,255,255,0.08)",padding:eff_collapsed?"12px 0":"14px 18px",
        display:"flex",alignItems:"center",gap:10,justifyContent:eff_collapsed?"center":"flex-start"}}>
        <div style={{width:34,height:34,borderRadius:R.full,background:roleColor,
          display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,
          fontSize:F.sm,fontWeight:800,color:"white"}}>{user.initials}</div>
        {!eff_collapsed&&<div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:F.sm,fontWeight:700,color:"white",
            overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.name}</div>
          <div style={{fontSize:F.xs,color:"rgba(255,255,255,0.4)"}}>{user.employeeId}</div>
        </div>}
      </div>

      {/* Collapse toggle — desktop only; mobile dismisses via backdrop/X/nav-tap */}
      {!isMobile&&<button onClick={()=>setCollapsed(v=>!v)} style={{padding:"10px",
        borderTop:"1px solid rgba(255,255,255,0.06)",background:"none",border:"none",
        cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",
        color:"rgba(255,255,255,0.3)"}}>
        {collapsed?<ChevronRight size={16}/>:<ChevronLeft size={16}/>}
      </button>}
      </div>
    </>
  );
};

/* ─── TOP BAR ────────────────────────────────────────────────────────────── */
const TopBar=({user,activeScreen,showNotif,setShowNotif,onLogout,isOnline,syncQueue,syncStatus,lastSyncAt,onToggle,showSyncPanel,onSyncPanel,onSyncNow,isMobile,onMenuClick})=>{
  const label=NAV_GROUPS.flatMap(g=>g.items).find(i=>i.id===activeScreen)?.label||"Dashboard";
  const unread=NOTIFICATIONS.filter(n=>n.unread).length;
  const rbc={rep:"info",area_manager:"warn",regional_manager:"info",admin:"danger"};

  if(isMobile) return(
    <div style={{height:56,background:C.white,borderBottom:`1px solid ${C.border}`,
      display:"flex",alignItems:"center",padding:"0 12px",gap:10,position:"relative",flexShrink:0}}>
      <button onClick={onMenuClick} style={{width:40,height:40,border:"none",background:"none",
        display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0}}>
        <Menu size={22} color={C.text}/>
      </button>
      <span style={{fontSize:F.base,fontWeight:700,color:C.text,flex:1,overflow:"hidden",
        textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{label}</span>
      <NetworkToggle isOnline={isOnline} onToggle={onToggle}/>
      <div style={{position:"relative"}}>
        <button onClick={()=>setShowNotif(v=>!v)} style={{width:40,height:40,borderRadius:R.full,
          background:showNotif?C.navyMed:C.bg,border:`1px solid ${C.border}`,
          display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0}}>
          <Bell size={17} color={showNotif?"white":C.muted}/>
          {unread>0&&<div style={{position:"absolute",top:4,right:4,width:8,height:8,
            borderRadius:99,background:C.danger,border:`2px solid white`}}/>}
        </button>
        {showNotif&&<NotifPanel onClose={()=>setShowNotif(false)}/>}
      </div>
      {showSyncPanel&&<SyncQueuePanel syncQueue={syncQueue||[]} isOnline={isOnline}
        syncStatus={syncStatus} onClose={onSyncPanel}
        onSyncNow={()=>{onSyncNow();onSyncPanel();}}/>}
      <button onClick={onLogout} style={{width:36,height:36,borderRadius:R.full,
        background:{rep:C.teal,area_manager:C.warning,regional_manager:C.info,admin:C.purple}[user.role],
        border:"none",display:"flex",alignItems:"center",justifyContent:"center",fontSize:F.xs,
        fontWeight:800,color:"white",cursor:"pointer",flexShrink:0}} title={`Log out (${user.name})`}>
        {user.initials}
      </button>
    </div>
  );

  return(
    <div style={{height:60,background:C.white,borderBottom:`1px solid ${C.border}`,
      display:"flex",alignItems:"center",padding:"0 24px",gap:16,position:"relative",flexShrink:0}}>
      
      {/* Breadcrumb */}
      <div style={{flex:1,display:"flex",alignItems:"center",gap:6}}>
        <span style={{fontSize:F.sm,color:C.muted}}>Home</span>
        <ChevronRight size={14} color={C.muted}/>
        <span style={{fontSize:F.sm,fontWeight:700,color:C.text}}>{label}</span>
      </div>

      {/* Search */}
      <div style={{display:"flex",alignItems:"center",gap:8,background:C.bg,
        borderRadius:R.lg,padding:"7px 12px",border:`1px solid ${C.border}`,
        width:220}}>
        <Search size={15} color={C.muted}/>
        <input placeholder="Search..." style={{border:"none",background:"none",
          fontSize:F.sm,color:C.text,outline:"none",fontFamily:"inherit",width:"100%"}}/>
      </div>

      {/* Date filter */}
      <div style={{display:"flex",alignItems:"center",gap:6,background:C.bg,
        borderRadius:R.lg,padding:"7px 12px",border:`1px solid ${C.border}`,
        fontSize:F.sm,color:C.muted,cursor:"pointer"}}>
        <Calendar size={14}/>
        <span>June 2026</span>
        <ChevronDown size={13}/>
      </div>

      {/* Export */}
      <Btn variant="secondary" icon={Download} small>Export</Btn>

      {/* Phase 3 — Sync status + Network toggle */}
      <SyncStatusBadge isOnline={isOnline} syncQueue={syncQueue||[]} syncStatus={syncStatus}
        lastSyncAt={lastSyncAt} onClick={onSyncPanel}/>
      <NetworkToggle isOnline={isOnline} onToggle={onToggle}/>

      {/* Notifications */}
      <div style={{position:"relative"}}>
        <button onClick={()=>setShowNotif(v=>!v)} style={{width:36,height:36,borderRadius:R.full,
          background:showNotif?C.navyMed:C.bg,border:`1px solid ${C.border}`,
          display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
          <Bell size={17} color={showNotif?"white":C.muted}/>
          {unread>0&&<div style={{position:"absolute",top:4,right:4,width:8,height:8,
            borderRadius:99,background:C.danger,border:`2px solid white`}}/>}
        </button>
        {showNotif&&<NotifPanel onClose={()=>setShowNotif(false)}/>}
      </div>
      {showSyncPanel&&<SyncQueuePanel syncQueue={syncQueue||[]} isOnline={isOnline}
        syncStatus={syncStatus} onClose={onSyncPanel}
        onSyncNow={()=>{onSyncNow();onSyncPanel();}}/>}

      {/* User */}
      <div style={{display:"flex",alignItems:"center",gap:10,padding:"6px 10px",
        borderRadius:R.lg,border:`1px solid ${C.border}`,background:C.bg}}>
        <div style={{width:36,height:36,borderRadius:R.full,
          background:{rep:C.teal,area_manager:C.warning,regional_manager:C.info,admin:C.purple}[user.role],
          display:"flex",alignItems:"center",justifyContent:"center",fontSize:F.xs,fontWeight:800,color:"white"}}>
          {user.initials}
        </div>
        <div>
          <div style={{fontSize:F.xs,fontWeight:700,color:C.text,lineHeight:1.1}}>{user.name.split(" ")[0]}</div>
          <div style={{fontSize:F.xs,color:C.muted}}>{user.employeeId}</div>
        </div>
        <Badge type={rbc[user.role]||"info"} small>{user.roleLabel.split(" ")[0]}</Badge>
        <button onClick={onLogout} style={{background:"none",border:"none",cursor:"pointer",
          padding:2,display:"flex",alignItems:"center"}}>
          <LogOut size={15} color={C.muted}/>
        </button>
      </div>
    </div>
  );
};

/* ─── MAIN APP ───────────────────────────────────────────────────────────── */

function AppRoot(){
  const [user,setUser]=useState(null);
  const [screen,setScreen]=useState("dashboard");
  // ── Session expiry handler ───────────────────────────────────────────────
  // When the background token refresh fails (session revoked, server down,
  // etc.) this callback fires, and the app returns to the login screen.
  useEffect(()=>{
    _onSessionExpiredCb=()=>{
      setUser(null);
      setScreen("dashboard");
    };
    return()=>{_onSessionExpiredCb=null;};
  },[]);

  const [collapsed,setCollapsed]=useState(false);
  const [isMobile,setIsMobile]=useState(typeof window!=="undefined"?window.innerWidth<=768:false);
  const [mobileNavOpen,setMobileNavOpen]=useState(false);
  useEffect(()=>{
    const onResize=()=>setIsMobile(window.innerWidth<=768);
    window.addEventListener("resize",onResize);
    return()=>window.removeEventListener("resize",onResize);
  },[]);
  const [showNotif,setShowNotif]=useState(false);
  const [logVisitFor,setLogVisitFor]=useState(null);
  const [isOnline,setIsOnline]=useState(true);
  const [syncQueue,setSyncQueue]=useState([]);
  const [syncStatus,setSyncStatus]=useState("idle");
  const [lastSyncAt,setLastSyncAt]=useState(null);
  const [showSyncPanel,setShowSyncPanel]=useState(false);
  const [routePlans,setRoutePlans]=useState(ROUTE_PLANS_INIT);
  const [callReports,setCallReports]=useState(REPORTS_INIT);
  const [expenseClaims,setExpenseClaims]=useState(EXPENSE_INIT);
  const [leaveApps,setLeaveApps]=useState(LEAVE_APPS_INIT);
  const [leaveBalance,setLeaveBalance]=useState(LEAVE_BALANCE);
  const [users,setUsers]=useState(USERS_DB);
  // 3.4: restore persisted audit entries from sessionStorage, then append the
  // seed data so historical demo entries are still visible on first load.
  const [auditLog,setAuditLog]=useState(()=>{
    const persisted=_auditRestore();
    const seedIds=new Set(AUDIT_LOG_INIT.map(e=>e.id));
    const merged=[...persisted.filter(e=>!seedIds.has(e.id)),...AUDIT_LOG_INIT];
    return merged;
  });
  const [sysConfig,setSysConfig]=useState(SYSTEM_CONFIG_INIT);
  const [extraLogins,setExtraLogins]=useState({});
  const [impersonatorOf,setImpersonatorOf]=useState(null);

  const loginAs=(targetUser)=>{
    setImpersonatorOf(user);
    setUser(targetUser);
    setScreen("dashboard");
    logAudit(user.name,user.role,"Admin","info","Started test session as user",
      `Logged in as ${targetUser.name} (${targetUser.roleLabel}) for demo testing`);
  };
  const returnToAdmin=()=>{
    if(!impersonatorOf)return;
    logAudit(impersonatorOf.name,impersonatorOf.role,"Admin","info","Ended test session",
      `Returned to admin from testing as ${user.name}`);
    setUser(impersonatorOf);
    setImpersonatorOf(null);
    setScreen("users");
  };

  const logAudit=(actor,actorRole,category,severity,action,details)=>{
    const entry={id:"AL"+Date.now(),
      timestamp:new Date().toLocaleString([],{year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"}).replace(",",""),
      actor,actorRole,category,severity,action,details};
    setAuditLog(p=>[entry,...p]);
    // 3.4: persist to sessionStorage so the log survives page refresh within the same tab
    _auditPersist(entry);
  };

  const handleLogout=async()=>{
    if(USE_REAL_AUTH&&_accessToken){
      try{ await _apiCall("POST","/api/auth/logout"); }
      catch{/* best-effort — session will expire server-side regardless */}
      _accessToken=null;
      if(_refreshTimer){clearTimeout(_refreshTimer);_refreshTimer=null;}
    }
    setUser(null);setScreen("dashboard");
    logAudit("system","system","Auth","info","Logged out","Session ended");
  };

  const queueForSync=(type,label,data)=>{
    setSyncQueue(p=>[...p,{id:"sq_"+Date.now(),type,label,data,
      queuedAt:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),
      status:"pending"}]);
  };

  const doTriggerSync=async(queueSnap)=>{
    const q=queueSnap||[];
    if(q.length===0)return;
    setSyncStatus("syncing");
    for(let i=0;i<q.length;i++){
      setSyncQueue(p=>p.map((it,ix)=>ix===i?{...it,status:"syncing"}:it));
      await new Promise(r=>setTimeout(r,700));
      setSyncQueue(p=>p.map((it,ix)=>ix===i?{...it,status:"synced"}:it));
    }
    await new Promise(r=>setTimeout(r,350));
    const now=new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});
    setSyncQueue([]);
    setSyncStatus("synced");
    setLastSyncAt(now);
    setTimeout(()=>setSyncStatus("idle"),3000);
  };

  const toggleOnline=()=>{
    if(isOnline){
      setIsOnline(false);
      setSyncStatus("idle");
    }else{
      setIsOnline(true);
      if(syncQueue.length>0) doTriggerSync(syncQueue);
    }
  };

  if(!user) return <LoginScreen extraLogins={extraLogins} onLogin={u=>{setUser(u);setScreen("dashboard");
    logAudit(u.name,u.role,"Auth","info","Logged in",`Session started · ${u.roleLabel} · ${u.territory}`);}}/>;

  const navItem=NAV_GROUPS.flatMap(g=>g.items).find(i=>i.id===screen);

  const screenContent=(()=>{
    if(screen==="dashboard") return <DashboardContent user={user} isOnline={isOnline} syncQueue={syncQueue} syncStatus={syncStatus} lastSyncAt={lastSyncAt} onToggle={toggleOnline} isMobile={isMobile}/>;
    if(screen==="doctors")   return <DoctorManagement user={user} onLogVisitFor={d=>{setLogVisitFor(d);setScreen("calls");}}/>;
    if(screen==="calls")     return <CallReports user={user} prefillDoctor={logVisitFor} onPrefillUsed={()=>setLogVisitFor(null)} isOnline={isOnline} queueForSync={queueForSync} reports={callReports} setReports={setCallReports} geofenceRadius={sysConfig.geofenceRadius} onAudit={logAudit}/>;
    if(screen==="products")  return <ProductDetailing user={user}/>;
    if(screen==="routeplan") return <RoutePlanning user={user} isOnline={isOnline} queueForSync={queueForSync} plans={routePlans} setPlans={setRoutePlans} onAudit={logAudit} isMobile={isMobile}/>;
    if(screen==="chemist")   return <ChemistReports user={user} isOnline={isOnline} queueForSync={queueForSync}/>;
    if(screen==="hospital")  return <HospitalReports user={user} isOnline={isOnline} queueForSync={queueForSync}/>;
    if(screen==="gps")       return <GpsVerification user={user}/>;
    if(screen==="expenses")   return <ExpenseClaims user={user} isOnline={isOnline} queueForSync={queueForSync} claims={expenseClaims} setClaims={setExpenseClaims} onAudit={logAudit}/>;
    if(screen==="leave")      return <LeaveManagement user={user} apps={leaveApps} setApps={setLeaveApps} balance={leaveBalance} setBalance={setLeaveBalance} onAudit={logAudit}/>;
    if(screen==="targets")    return <TargetTracking user={user}/>;
    if(screen==="kpi")        return <KPIDashboard user={user}/>;
    if(screen==="territory")  return <TerritoryManagement user={user}/>;
    if(screen==="approvals")  return <ApprovalsHub user={user} routePlans={routePlans} setRoutePlans={setRoutePlans}
      callReports={callReports} setCallReports={setCallReports}
      expenseClaims={expenseClaims} setExpenseClaims={setExpenseClaims}
      leaveApps={leaveApps} setLeaveApps={setLeaveApps}
      leaveBalance={leaveBalance} setLeaveBalance={setLeaveBalance} onAudit={logAudit}/>;
    if(screen==="users")      return <UserManagement user={user} users={users} setUsers={setUsers} onAudit={logAudit} setExtraLogins={setExtraLogins} extraLogins={extraLogins} loginAs={loginAs}/>;
    if(screen==="audit")      return <AuditLogs user={user} auditLog={auditLog}/>;
    if(screen==="config")     return <SystemConfig user={user} config={sysConfig} setConfig={v=>{setSysConfig(v);
      logAudit(user.name,user.role,"Admin","info","Updated system configuration",
        `GPS geofence: ${v.geofenceRadius}m · staged route approval: ${v.stagedRouteApproval?"on":"off"} · 2FA required: ${v.require2FA?"on":"off"}`);}}/>;
    const navItem2=NAV_GROUPS.flatMap(g=>g.items).find(i=>i.id===screen);
    return navItem2?<Placeholder id={screen} label={navItem2.label} icon={navItem2.icon} phase={navItem2.phase}/>:<DashboardContent user={user}/>;
  })();

  return(
    <div style={{display:"flex",height:"100vh",fontFamily:"-apple-system,BlinkMacSystemFont,system-ui,sans-serif",
      overflow:"hidden",background:C.bg}}>
      
      <Sidebar user={user} activeScreen={screen} setScreen={s=>{setScreen(s);setShowNotif(false);}}
        collapsed={collapsed} setCollapsed={setCollapsed}
        isMobile={isMobile} mobileOpen={mobileNavOpen} onCloseMobile={()=>setMobileNavOpen(false)}/>

      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",minWidth:0}}>
        <TopBar user={user} activeScreen={screen} showNotif={showNotif}
          setShowNotif={setShowNotif} onLogout={handleLogout}
          isOnline={isOnline} syncQueue={syncQueue} syncStatus={syncStatus}
          lastSyncAt={lastSyncAt} onToggle={toggleOnline}
          showSyncPanel={showSyncPanel} onSyncPanel={()=>setShowSyncPanel(v=>!v)}
          onSyncNow={()=>doTriggerSync(syncQueue)}
          isMobile={isMobile} onMenuClick={()=>setMobileNavOpen(v=>!v)}/>
        
        {!isOnline&&<OfflineBanner syncQueue={syncQueue}/>}
        {impersonatorOf&&(
          <div style={{background:C.purple,padding:"9px 24px",display:"flex",alignItems:"center",
            gap:10,flexShrink:0}}>
            <Eye size={15} color="white"/>
            <span style={{fontSize:F.sm,color:"white",fontWeight:600,flex:1}}>
              Testing mode — viewing as <b>{user.name}</b> ({user.roleLabel}). Changes made here affect demo data.
            </span>
            <button onClick={returnToAdmin} style={{display:"flex",alignItems:"center",gap:6,
              background:"rgba(255,255,255,0.18)",border:"none",borderRadius:R.full,
              padding:"5px 14px",cursor:"pointer",fontFamily:"inherit",fontSize:F.sm,
              fontWeight:700,color:"white"}}>
              <LogOut size={13}/>Return to Admin
            </button>
          </div>
        )}
        {/* Welcome banner */}
        {screen==="dashboard"&&(
          <div style={{background:C.navy,padding:"14px 24px 16px",
            display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
            <div>
              <div style={{fontSize:F.sm,color:"rgba(255,255,255,0.45)"}}>
                {new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"})}
              </div>
              <div style={{fontSize:F.xl,fontWeight:800,color:"white",marginTop:2}}>
                Good morning, {user.name.split(" ")[0]} 👋
              </div>
              <div style={{fontSize:F.sm,color:"rgba(255,255,255,0.5)",marginTop:2}}>
                {user.roleLabel} · {user.territory}
              </div>
            </div>
            <div style={{display:"flex",gap:8}}>
              <Btn variant="ghost" icon={RefreshCw} small style={{color:"rgba(255,255,255,0.6)",
                border:"1px solid rgba(255,255,255,0.15)"}}>Refresh</Btn>
              <Btn variant="secondary" icon={Download} small
                style={{background:"rgba(255,255,255,0.1)",color:"white",border:"none"}}>
                Export Report
              </Btn>
            </div>
          </div>
        )}

        {/* Page header for non-dashboard */}
        {screen!=="dashboard"&&navItem&&(
          <div style={{background:C.white,padding:"16px 24px",borderBottom:`1px solid ${C.border}`,
            display:"flex",alignItems:"center",gap:12,flexShrink:0}}>
            <div style={{width:36,height:36,borderRadius:R.lg,background:C.tealBg,
              display:"flex",alignItems:"center",justifyContent:"center"}}>
              <navItem.icon size={18} color={C.teal}/>
            </div>
            <div>
              <div style={{fontSize:F.lg,fontWeight:800,color:C.text}}>{navItem.label}</div>
              <div style={{fontSize:F.sm,color:C.muted}}>
                {navItem.phase===1?"Phase 1 — Live":`Scheduled for ${PHASE_LABELS[navItem.phase]}`}
              </div>
            </div>
            {navItem.phase===1&&<Badge type="success">Live</Badge>}
          </div>
        )}

        {/* Main content */}
        <div style={{flex:1,overflowY:"auto",padding:isMobile?"14px 12px":"20px 24px"}}>
          {screenContent}
        </div>
      </div>


    </div>
  );
}

export default function App(){
  return(
    <>
      <style>{`
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @media (max-width: 768px){
          input, select, textarea { font-size: 16px !important; }
        }
      `}</style>
      <ErrorBoundary><AppRoot/></ErrorBoundary>
    </>
  );
}
