import { useState, useEffect } from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";

// ─── BRAND TOKENS ─────────────────────────────────────────────────────────────
const FW_GREEN      = "#00A14B";
const FW_GREEN_D    = "#007A38";
const FW_GREEN_L    = "#E6F7EE";
const FW_BLUE       = "#1677FF";
const FW_NAVY       = "#1A2332";
const G50           = "#F8F9FB";
const G100          = "#F1F3F6";
const G200          = "#E4E7ED";
const G400          = "#9CA3AF";
const G600          = "#4B5563";
const G800          = "#1F2937";
const WHITE         = "#FFFFFF";

// ─── DATA ─────────────────────────────────────────────────────────────────────
const CATS = [
  { id:"discovery", label:"Asset Discovery",       icon:"🔍", color:"#00A14B", light:"#E6F7EE",
    questions:[
      { text:"How do you currently discover and track hardware assets across your environment?", options:[{score:1,label:"Spreadsheets / fully manual process"},{score:2,label:"Basic inventory tool, manually updated"},{score:3,label:"Automated discovery for most systems"},{score:4,label:"Continuous, agentless discovery across physical, virtual & cloud"}] },
      { text:"How current is your asset inventory at any given time?", options:[{score:1,label:"Updated monthly or less — often out of date"},{score:2,label:"Updated weekly with manual effort"},{score:3,label:"Updated daily with partial automation"},{score:4,label:"Real-time — continuously synced"}] },
      { text:"What percentage of your IT estate do you have full visibility into?", options:[{score:1,label:"Less than 50%"},{score:2,label:"50–70%"},{score:3,label:"70–90%"},{score:4,label:"90–100% including cloud and remote assets"}] },
    ]},
  { id:"cmdb", label:"CMDB & Data Quality",        icon:"🗂️", color:"#1677FF", light:"#EBF3FF",
    questions:[
      { text:"How confident are you in the accuracy of your CMDB today?", options:[{score:1,label:"Low — it's frequently outdated or inaccurate"},{score:2,label:"Moderate — some data is reliable, some is not"},{score:3,label:"High — most CIs are accurate"},{score:4,label:"Very high — auto-synced and regularly audited"}] },
      { text:"How are Configuration Item (CI) relationships and dependencies captured?", options:[{score:1,label:"Not captured or very limited"},{score:2,label:"Manually documented for critical systems only"},{score:3,label:"Partially automated dependency mapping"},{score:4,label:"Full automated mapping across all infrastructure layers"}] },
      { text:"How do you validate and maintain CMDB data quality over time?", options:[{score:1,label:"No formal validation process exists"},{score:2,label:"Ad hoc reviews when issues arise"},{score:3,label:"Regular scheduled audits"},{score:4,label:"Continuous automated reconciliation with live discovery data"}] },
    ]},
  { id:"change", label:"Change Management",         icon:"🔄", color:"#F59E0B", light:"#FFFBEB",
    questions:[
      { text:"Before making infrastructure changes, how do you assess the downstream impact?", options:[{score:1,label:"Tribal knowledge / experience only"},{score:2,label:"Manually review documentation or diagrams"},{score:3,label:"Use impact analysis tools for major changes"},{score:4,label:"Automated CI relationship analysis before every change"}] },
      { text:"How often do unplanned outages result directly from infrastructure changes?", options:[{score:1,label:"Frequently — changes regularly cause incidents"},{score:2,label:"Occasionally — a few times per quarter"},{score:3,label:"Rarely — strong CAB process minimises risk"},{score:4,label:"Almost never — automated analysis prevents surprises"}] },
    ]},
  { id:"licences", label:"Licence & Cost Mgmt",    icon:"📄", color:"#8B5CF6", light:"#F5F3FF",
    questions:[
      { text:"How do you track software licences across your environment?", options:[{score:1,label:"Spreadsheets or no formal process"},{score:2,label:"Basic tool, manually updated"},{score:3,label:"Automated discovery with some reconciliation"},{score:4,label:"Full SAM — automated discovery, allocation & optimisation"}] },
      { text:"Can you identify unused or under-utilised software licences?", options:[{score:1,label:"No visibility at all"},{score:2,label:"Limited — only for major products"},{score:3,label:"For most software with manual review"},{score:4,label:"Full real-time utilisation tracking with automated reclamation"}] },
      { text:"How do you manage software compliance and audit risk?", options:[{score:1,label:"Reactive — we find out during external audits"},{score:2,label:"Periodic manual reviews"},{score:3,label:"Regular automated licence reconciliation"},{score:4,label:"Continuous compliance monitoring with proactive alerts"}] },
    ]},
  { id:"lifecycle", label:"Lifecycle & Compliance", icon:"🔁", color:"#EC4899", light:"#FDF2F8",
    questions:[
      { text:"How do you track hardware End-of-Life (EOL) and End-of-Support (EOS) dates?", options:[{score:1,label:"We're often surprised when assets reach EOL"},{score:2,label:"Manual tracking in spreadsheets"},{score:3,label:"Automated alerts for some asset categories"},{score:4,label:"Automated EOL/EOS tracking and renewal alerts for all assets"}] },
      { text:"How audit-ready is your asset data right now?", options:[{score:1,label:"Audits are stressful — data prep takes weeks"},{score:2,label:"Data is mostly available but needs significant cleanup"},{score:3,label:"We can produce audit reports relatively quickly"},{score:4,label:"Always audit-ready — accurate and reportable on demand"}] },
    ]},
  { id:"operations", label:"IT Operations",         icon:"⚡", color:"#0EA5E9", light:"#F0F9FF",
    questions:[
      { text:"When an incident occurs, how quickly can you identify all affected CIs?", options:[{score:1,label:"Hours — requires significant manual investigation"},{score:2,label:"30–60 minutes with some tooling"},{score:3,label:"Under 30 minutes with automated alerts"},{score:4,label:"Near-instant via automated impact analysis"}] },
      { text:"How mature is your IT operations monitoring and alerting?", options:[{score:1,label:"Reactive — we find out when users complain"},{score:2,label:"Basic monitoring for critical systems only"},{score:3,label:"Proactive monitoring across most infrastructure"},{score:4,label:"AIOps — predictive alerts, noise reduction, automated remediation"}] },
    ]},
];

const LEVELS = [
  { min:1.00, max:1.74, label:"Reactive",           tag:"Ad-hoc & Manual",          color:"#EF4444", light:"#FEF2F2", border:"#FECACA",
    desc:"Your IT asset management is largely manual and firefighting-driven. Visibility gaps create significant operational risk, compliance exposure, and wasted spend.",
    caps:["No centralised asset repository","Spreadsheets or shared drives for inventory","No automated discovery in place","Licences tracked informally or not at all"],
    procs:["No formal ITAM policy exists","Asset requests handled ad hoc","No onboarding/offboarding asset workflows","Audits are stressful and reactive"], next:"Structured" },
  { min:1.75, max:2.49, label:"Structured",          tag:"Documented & Repeatable",  color:"#F59E0B", light:"#FFFBEB", border:"#FDE68A",
    desc:"You have foundational tools and some defined processes, but coverage is inconsistent and significant manual effort is still required to keep data accurate.",
    caps:["Basic CMDB or asset database in place","Some scheduled discovery scans running","Licence tracking for major vendors","EOL/EOS tracked for critical hardware"],
    procs:["Formal ITAM policy drafted","Asset intake process defined","Periodic audits scheduled","Change approval process in place (CAB)"], next:"Unified" },
  { min:2.50, max:3.24, label:"Unified",             tag:"Integrated & Automated",   color:"#1677FF", light:"#EBF3FF", border:"#BFDBFE",
    desc:"Your ITAM capabilities are well-integrated across ITSM processes. Discovery is automated, data quality is high, and IT decisions are increasingly data-driven.",
    caps:["Agentless auto-discovery across hybrid infrastructure","Accurately, continuously synced CMDB","Full software licence reconciliation","Dependency mapping for incident & change workflows"],
    procs:["ITAM integrated into ITSM (incidents, changes, requests)","SAM programme active","Regular automated CMDB reconciliation","Asset lifecycle workflows automated end-to-end"], next:"Value Acceleration" },
  { min:3.25, max:4.00, label:"Value Acceleration",  tag:"Strategic & Optimising",   color:"#00A14B", light:"#E6F7EE", border:"#A7F3D0",
    desc:"You are operating at the leading edge of ITAM maturity. Infrastructure intelligence actively drives business value — from cost optimisation to risk reduction and strategic planning.",
    caps:["AIOps and predictive analytics across the estate","Real-time cost attribution and cloud optimisation","Automated licence reclamation and right-sizing","Proactive EOL/EOS risk management with board reporting"],
    procs:["ITAM embedded in financial planning (TBM/FinOps)","Continuous compliance posture with automated evidence","IT asset data feeds security and risk frameworks","ITAM KPIs reported at CIO/board level"], next:null },
];

const getLevel = (s) => LEVELS.find(l => s >= l.min && s <= l.max) || LEVELS[0];
const getCatLevel = (s) => {
  if (s < 1.75) return { label:"Reactive", color:"#EF4444" };
  if (s < 2.50) return { label:"Structured", color:"#F59E0B" };
  if (s < 3.25) return { label:"Unified", color:"#1677FF" };
  return { label:"Value Acceleration", color:"#00A14B" };
};
const computeScores = (answers) => {
  const cs = {}; let total=0, count=0;
  CATS.forEach(c => { const ans=answers[c.id]||[]; if(!ans.length) return; const avg=ans.reduce((s,a)=>s+a,0)/ans.length; cs[c.id]=avg; total+=avg; count++; });
  return { catScores:cs, overall: count>0 ? total/count : 0 };
};

async function fetchReco(catScores, overall, level) {
  const catSummary = CATS.map(c => { const s=catScores[c.id]||0; const m=getCatLevel(s); return `${c.label}: ${s.toFixed(1)}/4.0 (${m.label})`; }).join(" | ");
  const sorted = CATS.map(c=>({label:c.label,score:catScores[c.id]||0})).sort((a,b)=>a.score-b.score);
  const weakest = sorted.slice(0,3).map(c=>c.label).join(", ");
  const strongest = sorted.slice(-2).map(c=>c.label).join(", ");
  const prompt = `You are a senior ITAM consultant at Freshworks. Customer scored ${overall.toFixed(2)}/4.0 — level: "${level.label}" (${level.tag}). Scores: ${catSummary}. Weakest: ${weakest}. Strongest: ${strongest}. ${level.next ? "Next target: "+level.next : "Leading edge — sustain and scale."}

DEVICE42 CAPABILITIES (reference by name):
- Infrastructure Discovery: Most advanced agentless hybrid IT discovery — physical, VMs, network, storage, cloud (AWS/Azure), containers, legacy mainframes. Orgs resolve outages 10x faster, 4.8x ROI.
- CMDB: Near real-time automated CMDB, continuously reconciled against live discovery. Next-generation CI data with actionable insights.
- Application Dependency Mapping (ADM): Built-in native ADM for clarity, faster MTTR, migrations, modernisation. Visualises all relationships.
- Software License Management: Auto-discovers licences, compares discovered vs purchased count, identifies unused licences. Saves thousands in software spend.
- Cloud Discovery: Complete AWS and Azure inventory, deep resource discovery, supports cloud migration and right-sizing.
- Insights+ & InsightsAI: Natural language to SQL queries, real-time dashboards, 85% audit time reduction, 30% incident response improvement, 60% IT efficiency improvement.
- EnrichAI: AI + third-party sources to standardise, normalise, enrich CI data.
- SSL Certificate Management: Built-in certificate discovery to prevent outages from expired certs.
- IPAM: Centralised IP address management for visibility and security.
- Compliance & Audit: Continuously updated asset view with connectivity context. ISO27001 and other frameworks. 85% compliance prep reduction.
- IT Operations (ITOM): 60%+ efficiency improvement. Powered by discovery and dependency data.
- Transformation/Migration: Affinity Groups for move planning, cloud migration support.
- Sustainability & Power: 30%+ cost reduction and CO2 footprint reduction.
- ITSM Integration: Native Freshservice integration — automated discovery and dependency mapping in ITSM workflows.
- 30+ Integrations: Jira, ServiceNow, Splunk, PagerDuty, Intune, PowerBI, CyberArk, Ansible and more.

PROCESS AREAS: ITAM policy and ownership, asset intake/offboarding workflows, SAM programme, CAB/change management integration, CMDB reconciliation cadence, audit readiness, FinOps/TBM, KPI reporting to CIO/board.

Respond ONLY with valid JSON (no markdown, no preamble):
{"summary":"2-sentence personalised summary of where they stand and biggest opportunity","sections":[{"title":"Section title","icon":"emoji","color":"green|blue|amber|purple|pink|teal","items":[{"title":"5-8 word recommendation title","detail":"One concrete sentence referencing a specific Device42 feature or ITAM process and what outcome it unlocks."}]}]}

Produce exactly 4 sections: "Capability Recommendations" (4-5 items on weakest areas, specific Device42 features), "Process Improvements" (3-4 items, specific ITAM processes for their level), "Quick Wins" (2-3 immediate actions with Device42), "Path to Improvement" (2-3 next level actions). Total 12-15 items. Every item must reference a specific Device42 capability or named ITAM process. Address weakest categories directly.`;

  const r = await fetch("https://api.anthropic.com/v1/messages", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1800, messages:[{role:"user",content:prompt}] }) });
  const d = await r.json();
  const raw = d.content?.map(b=>b.text||"").join("") || "{}";
  try { return JSON.parse(raw.replace(/```json|```/g,"").trim()); } catch { return null; }
}

// ─── SHARED UI ────────────────────────────────────────────────────────────────
const Card = ({children,style={}}) => <div style={{background:WHITE,borderRadius:12,border:`1px solid ${G200}`,boxShadow:"0 1px 4px rgba(0,0,0,0.06)",padding:24,...style}}>{children}</div>;
const SLabel = ({children,color=FW_GREEN}) => (
  <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color,marginBottom:14,display:"flex",alignItems:"center",gap:6}}>
    <div style={{width:14,height:2,background:color,borderRadius:2}}/>{children}
  </div>
);
const Logo = () => (
  <div style={{display:"flex",alignItems:"center",gap:10}}>
    <div style={{width:28,height:28,borderRadius:8,background:FW_GREEN,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <span style={{color:WHITE,fontSize:14,fontWeight:800}}>f</span>
    </div>
    <span style={{fontWeight:700,fontSize:14,color:FW_NAVY}}>Freshservice</span>
    <span style={{color:G400,fontSize:13}}>×</span>
    <span style={{fontWeight:600,fontSize:13,color:G600}}>Device42</span>
  </div>
);
const Nav = ({right,customerName,company}) => (
  <div style={{background:WHITE,borderBottom:`1px solid ${G200}`,padding:"0 28px",height:56,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:10}}>
    <div style={{display:"flex",alignItems:"center",gap:14}}>
      <Logo/>
      {customerName && <>
        <span style={{color:G200}}>|</span>
        <div style={{display:"flex",alignItems:"center",gap:7}}>
          <div style={{width:26,height:26,borderRadius:"50%",background:FW_GREEN_L,border:`1.5px solid #A7F3D0`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,color:FW_GREEN}}>
            {customerName.charAt(0).toUpperCase()}
          </div>
          <span style={{fontSize:13,fontWeight:600,color:G600}}>{customerName}</span>
          {company && <span style={{fontSize:12,color:G400}}>· {company}</span>}
        </div>
      </>}
    </div>
    {right}
  </div>
);

// ─── WELCOME ──────────────────────────────────────────────────────────────────
function Welcome({onStart, onDashboard, shareUrl, copied, onCopy}) {
  const [subCount, setSubCount] = useState(0);
  useEffect(() => {
    window.storage.list("submission:", true)
      .then(r => setSubCount(r?.keys?.length || 0))
      .catch(() => {});
  }, []);
  return (
    <div style={{minHeight:"100vh",background:G50,display:"flex",flexDirection:"column",fontFamily:"'DM Sans',system-ui,sans-serif"}}>
      <Nav right={
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          {subCount > 0 && (
            <button onClick={onDashboard} style={{display:"flex",alignItems:"center",gap:7,background:FW_NAVY,color:WHITE,border:"none",borderRadius:8,padding:"7px 14px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
              View Results <span style={{background:"rgba(255,255,255,0.2)",borderRadius:100,padding:"1px 7px",fontSize:11}}>{subCount}</span>
            </button>
          )}
          <div style={{fontSize:12,color:G400,fontWeight:500}}>ITAM Maturity Assessment</div>
        </div>
      }/>
      <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:"48px 24px"}}>
        <div style={{maxWidth:980,width:"100%"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 420px",gap:48,alignItems:"start"}}>
            <div>
              <div style={{display:"inline-flex",alignItems:"center",gap:6,background:FW_GREEN_L,border:`1px solid #A7F3D0`,borderRadius:100,padding:"5px 14px",marginBottom:24,fontSize:12,fontWeight:600,color:FW_GREEN_D}}>
                <div style={{width:6,height:6,borderRadius:"50%",background:FW_GREEN}}/> Powered by Freshservice ITIM
              </div>
              <h1 style={{fontSize:44,fontWeight:800,lineHeight:1.15,color:FW_NAVY,marginBottom:16}}>
                IT Asset Management<br/><span style={{color:FW_GREEN}}>Maturity Assessment</span>
              </h1>
              <p style={{fontSize:16,color:G600,lineHeight:1.7,marginBottom:32,maxWidth:480}}>
                Answer 16 questions across 6 dimensions and receive a personalised AI-powered roadmap to help your organisation achieve operational excellence.
              </p>
              <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:36}}>
                {[["📋","16 Questions"],["⏱","~5 Minutes"],["🤖","AI Report"],["🔒","Confidential"]].map(([icon,label])=>(
                  <div key={label} style={{display:"flex",alignItems:"center",gap:6,background:WHITE,border:`1px solid ${G200}`,borderRadius:8,padding:"8px 14px",fontSize:13,color:G800,fontWeight:500,boxShadow:"0 1px 2px rgba(0,0,0,0.04)"}}>
                    {icon} {label}
                  </div>
                ))}
              </div>
              <button onClick={onStart} style={{background:FW_GREEN,color:WHITE,border:"none",borderRadius:10,padding:"15px 40px",fontSize:15,fontWeight:700,cursor:"pointer",boxShadow:`0 4px 16px ${FW_GREEN}40`,fontFamily:"inherit"}}>
                Get Started →
              </button>
              <div style={{marginTop:48}}>
                <div style={{fontSize:12,fontWeight:600,color:G400,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:14}}>The Maturity Journey</div>
                <div style={{display:"flex",alignItems:"center"}}>
                  {LEVELS.map((lvl,i)=>(
                    <div key={lvl.label} style={{display:"flex",alignItems:"center",flex:1}}>
                      <div style={{flex:1,background:lvl.light,border:`1px solid ${lvl.border}`,borderRadius:8,padding:"10px 12px",textAlign:"center"}}>
                        <div style={{fontSize:11,fontWeight:800,color:lvl.color,marginBottom:2}}>{lvl.label}</div>
                        <div style={{fontSize:10,color:G400}}>{lvl.tag}</div>
                      </div>
                      {i<LEVELS.length-1 && <div style={{width:14,height:1,background:G200,flexShrink:0}}/>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:16}}>
              <Card>
                <SLabel>6 Assessment Dimensions</SLabel>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {CATS.map(cat=>(
                    <div key={cat.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",background:cat.light,borderRadius:8,border:`1px solid ${cat.color}20`}}>
                      <span style={{fontSize:16}}>{cat.icon}</span>
                      <span style={{fontSize:13,fontWeight:600,color:G800}}>{cat.label}</span>
                      <span style={{marginLeft:"auto",fontSize:11,color:G400}}>{cat.questions.length} questions</span>
                    </div>
                  ))}
                </div>
              </Card>
              <Card style={{padding:20}}>
                <SLabel>Share This Assessment</SLabel>
                <div style={{display:"flex",gap:14,alignItems:"center"}}>
                  <div style={{background:WHITE,border:`1px solid ${G200}`,borderRadius:10,padding:8,flexShrink:0}}>
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(shareUrl)}&bgcolor=ffffff&color=1A2332&margin=6`} alt="QR" style={{width:80,height:80,display:"block"}}/>
                  </div>
                  <div>
                    <div style={{fontSize:13,fontWeight:600,color:FW_NAVY,marginBottom:4}}>Scan or share the link</div>
                    <div style={{fontSize:12,color:G400,marginBottom:8}}>Invite customers or colleagues</div>
                    <div onClick={onCopy} style={{display:"inline-flex",alignItems:"center",gap:6,background:G50,border:`1px solid ${G200}`,borderRadius:6,padding:"6px 10px",cursor:"pointer",fontSize:11,color:FW_BLUE,fontFamily:"monospace"}}>
                      🔗 {shareUrl.length>28?shareUrl.slice(0,28)+"…":shareUrl}
                      {copied && <span style={{background:FW_GREEN,color:WHITE,borderRadius:4,padding:"1px 6px",fontSize:10,fontWeight:700}}>Copied!</span>}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── CUSTOMER DETAILS (BEFORE assessment) ─────────────────────────────────────
function CustomerDetails({onSubmit, onBack}) {
  const [form, setForm] = useState({name:"",email:"",company:""});
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const fields = [
    {key:"name",    label:"Full Name",    placeholder:"e.g. Sarah Johnson",    icon:"👤", type:"text"},
    {key:"email",   label:"Work Email",   placeholder:"e.g. sarah@company.com", icon:"✉️", type:"email"},
    {key:"company", label:"Company Name", placeholder:"e.g. Acme Corporation",  icon:"🏢", type:"text"},
  ];
  const validate = f => {
    const e={};
    if(!f.name.trim())    e.name="Please enter your full name";
    if(!f.email.trim())   e.email="Please enter your work email";
    else if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email="Please enter a valid email address";
    if(!f.company.trim()) e.company="Please enter your company name";
    return e;
  };
  const change=(key,val)=>{ const u={...form,[key]:val}; setForm(u); if(touched[key]) setErrors(validate(u)); };
  const blur=(key)=>{ setTouched(t=>({...t,[key]:true})); setErrors(validate(form)); };
  const submit=()=>{ setTouched({name:true,email:true,company:true}); const e=validate(form); setErrors(e); if(!Object.keys(e).length) onSubmit(form); };
  const isValid=!Object.keys(validate(form)).length;
  const firstName=form.name.trim().split(" ")[0];

  return (
    <div style={{minHeight:"100vh",background:G50,display:"flex",flexDirection:"column",fontFamily:"'DM Sans',system-ui,sans-serif"}}>
      <Nav right={<div style={{fontSize:12,color:G400}}>Step 1 of 2 — Your Details</div>}/>
      <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:"40px 24px"}}>
        <div style={{maxWidth:960,width:"100%",display:"grid",gridTemplateColumns:"1fr 440px",gap:48,alignItems:"center"}}>
          {/* Info panel */}
          <div>
            <div style={{display:"inline-flex",alignItems:"center",gap:6,background:FW_GREEN_L,border:`1px solid #A7F3D0`,borderRadius:100,padding:"5px 14px",marginBottom:24,fontSize:12,fontWeight:600,color:FW_GREEN_D}}>
              <div style={{width:6,height:6,borderRadius:"50%",background:FW_GREEN}}/> Step 1 of 2
            </div>
            <h1 style={{fontSize:38,fontWeight:800,lineHeight:1.2,color:FW_NAVY,marginBottom:16}}>
              Let's personalise<br/><span style={{color:FW_GREEN}}>your assessment</span>
            </h1>
            <p style={{fontSize:15,color:G600,lineHeight:1.7,marginBottom:32,maxWidth:400}}>
              Your details personalise your AI-powered roadmap and ensure recommendations address your organisation's specific ITAM gaps.
            </p>
            {[{icon:"🎯",title:"Personalised report",desc:"Results addressed directly to you and your organisation"},{icon:"🤖",title:"AI-powered roadmap",desc:"Device42 recommendations matched to your specific gaps"},{icon:"📊",title:"Maturity benchmark",desc:"See where you sit across 4 levels and 6 dimensions"}].map(item=>(
              <div key={item.title} style={{display:"flex",alignItems:"flex-start",gap:12,marginBottom:16}}>
                <div style={{width:36,height:36,borderRadius:10,background:FW_GREEN_L,border:`1px solid #A7F3D0`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{item.icon}</div>
                <div>
                  <div style={{fontSize:13,fontWeight:700,color:FW_NAVY,marginBottom:2}}>{item.title}</div>
                  <div style={{fontSize:12,color:G400,lineHeight:1.5}}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
          {/* Form card */}
          <div style={{background:WHITE,borderRadius:16,border:`1px solid ${G200}`,boxShadow:"0 8px 32px rgba(0,0,0,0.08)",padding:"36px 32px 32px"}}>
            <h2 style={{fontSize:20,fontWeight:800,color:FW_NAVY,marginBottom:6}}>Your Details</h2>
            <p style={{fontSize:13,color:G400,marginBottom:24,lineHeight:1.5}}>All fields required to generate your personalised report.</p>
            <div style={{display:"flex",flexDirection:"column",gap:16,marginBottom:20}}>
              {fields.map(f=>(
                <div key={f.key}>
                  <label style={{display:"block",fontSize:12,fontWeight:700,color:G800,marginBottom:6,textTransform:"uppercase",letterSpacing:"0.04em"}}>{f.label} <span style={{color:"#EF4444"}}>*</span></label>
                  <div style={{position:"relative"}}>
                    <input type={f.type} value={form[f.key]} onChange={e=>change(f.key,e.target.value)} onBlur={()=>blur(f.key)} placeholder={f.placeholder} style={{width:"100%",boxSizing:"border-box",border:`1.5px solid ${touched[f.key]&&errors[f.key]?"#EF4444":form[f.key]?FW_GREEN:G200}`,borderRadius:10,padding:"11px 14px 11px 40px",fontSize:14,color:FW_NAVY,background:touched[f.key]&&errors[f.key]?"#FEF2F2":form[f.key]?FW_GREEN_L:WHITE,outline:"none",fontFamily:"inherit",transition:"all 0.15s"}}/>
                    <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontSize:15}}>{f.icon}</span>
                  </div>
                  {touched[f.key]&&errors[f.key] && <div style={{fontSize:11,color:"#EF4444",marginTop:4}}>⚠ {errors[f.key]}</div>}
                </div>
              ))}
            </div>
            {firstName && (
              <div style={{background:FW_GREEN_L,border:`1px solid #A7F3D0`,borderRadius:8,padding:"10px 14px",marginBottom:14,fontSize:13,color:FW_GREEN_D,display:"flex",alignItems:"center",gap:8}}>
                <span>👋</span> Hi <strong>{firstName}</strong>! Ready to discover your ITAM maturity level?
              </div>
            )}
            <div style={{background:G50,border:`1px solid ${G200}`,borderRadius:8,padding:"9px 12px",marginBottom:20,display:"flex",gap:7}}>
              <span style={{fontSize:13,flexShrink:0}}>🔒</span>
              <span style={{fontSize:11,color:G400,lineHeight:1.5}}>Used only to personalise your report. We won't share your details.</span>
            </div>
            <div style={{display:"flex",gap:10}}>
              <button onClick={onBack} style={{background:"transparent",border:`1px solid ${G200}`,borderRadius:10,padding:"12px 18px",fontSize:13,fontWeight:600,color:G400,cursor:"pointer",fontFamily:"inherit"}}>← Back</button>
              <button onClick={submit} style={{flex:1,background:isValid?FW_GREEN:G200,border:"none",borderRadius:10,padding:"12px 20px",fontSize:14,fontWeight:700,color:isValid?WHITE:G400,cursor:isValid?"pointer":"not-allowed",fontFamily:"inherit",boxShadow:isValid?`0 4px 14px ${FW_GREEN}40`:"none",transition:"all 0.15s"}}>
                {isValid?`Let's go, ${firstName}! →`:"Start Assessment →"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ASSESSMENT ───────────────────────────────────────────────────────────────
function Assessment({catIdx,qIdx,selected,onSelect,onNext,onBack,customer}) {
  const cat=CATS[catIdx], q=cat.questions[qIdx];
  const totalQ=CATS.reduce((s,c)=>s+c.questions.length,0);
  const doneQ=CATS.slice(0,catIdx).reduce((s,c)=>s+c.questions.length,0)+qIdx;
  const pct=Math.round((doneQ/totalQ)*100);
  const isLast=catIdx===CATS.length-1&&qIdx===cat.questions.length-1;
  const firstName=customer?.name?.trim().split(" ")[0]||"";

  return (
    <div style={{minHeight:"100vh",background:G50,display:"flex",flexDirection:"column",fontFamily:"'DM Sans',system-ui,sans-serif"}}>
      {/* Nav with customer name + progress */}
      <div style={{background:WHITE,borderBottom:`1px solid ${G200}`,padding:"0 28px",height:56,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:10}}>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          <Logo/>
          {firstName && <>
            <span style={{color:G200}}>|</span>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:28,height:28,borderRadius:"50%",background:FW_GREEN_L,border:`2px solid #A7F3D0`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,color:FW_GREEN}}>{firstName.charAt(0).toUpperCase()}</div>
              <div>
                <div style={{fontSize:13,fontWeight:700,color:FW_NAVY,lineHeight:1}}>{customer.name}</div>
                {customer.company && <div style={{fontSize:11,color:G400,lineHeight:1}}>{customer.company}</div>}
              </div>
            </div>
          </>}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:160,height:6,background:G100,borderRadius:100,overflow:"hidden"}}>
            <div style={{width:`${pct}%`,height:"100%",background:FW_GREEN,borderRadius:100,transition:"width 0.4s ease"}}/>
          </div>
          <span style={{fontSize:12,color:G400,fontWeight:600,minWidth:32}}>{pct}%</span>
        </div>
      </div>
      {/* Category tabs */}
      <div style={{background:WHITE,borderBottom:`1px solid ${G200}`,overflowX:"auto"}}>
        <div style={{display:"flex",maxWidth:960,margin:"0 auto",padding:"0 16px"}}>
          {CATS.map((c,i)=>{const done=i<catIdx,active=i===catIdx; return(
            <div key={c.id} style={{display:"flex",alignItems:"center",gap:5,padding:"10px 14px",borderBottom:active?`2px solid ${c.color}`:"2px solid transparent",fontSize:12,fontWeight:active?700:500,color:active?c.color:done?FW_GREEN:G400,whiteSpace:"nowrap"}}>
              {done?<span style={{color:FW_GREEN}}>✓</span>:<span>{c.icon}</span>} {c.label}
            </div>
          );})}
        </div>
      </div>
      {/* Question */}
      <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:"40px 24px"}}>
        <div style={{maxWidth:640,width:"100%"}} key={`${catIdx}-${qIdx}`}>
          <div style={{display:"inline-flex",alignItems:"center",gap:6,background:cat.light,border:`1px solid ${cat.color}30`,borderRadius:100,padding:"5px 14px",marginBottom:16,fontSize:12,fontWeight:600,color:cat.color}}>
            {cat.icon} {cat.label}
          </div>
          <div style={{fontSize:12,color:G400,marginBottom:8,fontWeight:600}}>
            {firstName?`${firstName}'s Assessment · `:""} Question {doneQ+1} of {totalQ}
          </div>
          <h2 style={{fontSize:24,fontWeight:700,color:FW_NAVY,lineHeight:1.35,marginBottom:28}}>{q.text}</h2>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {q.options.map(opt=>{const isSel=selected===opt.score; return(
              <button key={opt.score} onClick={()=>onSelect(opt.score)} style={{width:"100%",textAlign:"left",cursor:"pointer",background:isSel?cat.light:WHITE,border:`1.5px solid ${isSel?cat.color:G200}`,borderRadius:10,padding:"14px 18px",display:"flex",alignItems:"center",gap:14,fontFamily:"inherit",boxShadow:isSel?`0 0 0 3px ${cat.color}18`:"0 1px 3px rgba(0,0,0,0.04)",transition:"all 0.12s"}}>
                <div style={{width:30,height:30,borderRadius:"50%",flexShrink:0,background:isSel?cat.color:G100,border:`1.5px solid ${isSel?cat.color:G200}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:isSel?WHITE:G400,transition:"all 0.12s"}}>
                  {isSel?"✓":opt.score}
                </div>
                <span style={{fontSize:14,color:isSel?FW_NAVY:G800,fontWeight:isSel?600:400,lineHeight:1.4}}>{opt.label}</span>
              </button>
            );})}
          </div>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:28}}>
            <button onClick={onBack} style={{background:"transparent",border:`1px solid ${G200}`,borderRadius:8,padding:"10px 20px",fontSize:13,fontWeight:600,color:G400,cursor:"pointer",fontFamily:"inherit"}}>← Back</button>
            <button onClick={onNext} disabled={selected===null} style={{background:selected!==null?FW_GREEN:G200,border:"none",borderRadius:8,padding:"10px 28px",fontSize:13,fontWeight:700,color:selected!==null?WHITE:G400,cursor:selected!==null?"pointer":"not-allowed",fontFamily:"inherit",boxShadow:selected!==null?`0 3px 12px ${FW_GREEN}40`:"none",transition:"all 0.12s"}}>
              {isLast?`See ${firstName?""+firstName+"'s ":""}Results →`:"Next →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── RESULTS ─────────────────────────────────────────────────────────────────
const CMAP = { green:{bg:"#E6F7EE",border:"#A7F3D0",accent:"#00A14B",dot:"#00A14B"}, blue:{bg:"#EBF3FF",border:"#BFDBFE",accent:"#1677FF",dot:"#1677FF"}, amber:{bg:"#FFFBEB",border:"#FDE68A",accent:"#D97706",dot:"#F59E0B"}, purple:{bg:"#F5F3FF",border:"#DDD6FE",accent:"#7C3AED",dot:"#8B5CF6"}, pink:{bg:"#FDF2F8",border:"#FBCFE8",accent:"#BE185D",dot:"#EC4899"}, teal:{bg:"#F0FDFA",border:"#99F6E4",accent:"#0D9488",dot:"#14B8A6"} };

function Results({answers,customer,recommendation,recoLoading,onRestart,onDashboard,shareUrl,copied,onCopy}) {
  const {catScores,overall} = computeScores(answers);
  const lvl = getLevel(overall);
  const firstName = customer?.name?.trim().split(" ")[0] || "there";
  const dateStr = new Date().toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"});
  const sorted = CATS.map(c=>({...c,score:catScores[c.id]||0})).sort((a,b)=>a.score-b.score);
  const weakest = sorted.slice(0,2), strongest = sorted.slice(-2).reverse();
  const radarData = CATS.map(c=>({category:c.label.replace(" & ","\n& ").replace(" Mgmt",""),score:catScores[c.id]?Math.round((catScores[c.id]/4)*100):0,fullMark:100}));

  return (
    <div style={{minHeight:"100vh",background:G50,fontFamily:"'DM Sans',system-ui,sans-serif"}}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <Nav customerName={customer?.name} company={customer?.company} right={
        <div style={{display:"flex",gap:8}}>
          <button onClick={onDashboard} style={{background:FW_NAVY,color:WHITE,border:"none",borderRadius:7,padding:"6px 14px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>📊 All Results</button>
          <button onClick={onRestart} style={{background:"transparent",border:`1px solid ${G200}`,borderRadius:7,padding:"6px 16px",fontSize:12,fontWeight:600,color:G600,cursor:"pointer",fontFamily:"inherit"}}>↩ Retake</button>
        </div>
      }/>

      <div style={{maxWidth:980,margin:"0 auto",padding:"32px 24px 72px",animation:"fadeUp 0.4s ease"}}>

        {/* ── HERO ── */}
        <div style={{background:`linear-gradient(135deg,${lvl.light} 0%,${WHITE} 60%)`,border:`1.5px solid ${lvl.border}`,borderRadius:20,overflow:"hidden",marginBottom:24,boxShadow:`0 4px 28px ${lvl.color}18`}}>
          <div style={{height:5,background:`linear-gradient(90deg,${lvl.color},${lvl.color}70)`}}/>
          <div style={{padding:"32px 40px"}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:32,alignItems:"center"}}>
              {/* Left */}
              <div>
                {/* Customer identity */}
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:22,padding:"14px 18px",background:WHITE,borderRadius:12,border:`1px solid ${G200}`,boxShadow:"0 1px 4px rgba(0,0,0,0.05)",width:"fit-content"}}>
                  <div style={{width:48,height:48,borderRadius:"50%",background:lvl.light,border:`2.5px solid ${lvl.color}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,fontWeight:900,color:lvl.color,flexShrink:0}}>
                    {firstName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{fontSize:16,fontWeight:800,color:FW_NAVY}}>{customer?.name}'s ITAM Assessment</div>
                    <div style={{display:"flex",gap:14,marginTop:3,flexWrap:"wrap"}}>
                      {customer?.company && <span style={{fontSize:12,color:G400}}>🏢 {customer.company}</span>}
                      {customer?.email && <span style={{fontSize:12,color:G400}}>✉️ {customer.email}</span>}
                      <span style={{fontSize:12,color:G400}}>📅 {dateStr}</span>
                    </div>
                  </div>
                </div>
                {/* Level */}
                <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",color:lvl.color,marginBottom:8}}>ITAM Maturity Level</div>
                <div style={{fontSize:46,fontWeight:900,color:FW_NAVY,lineHeight:1,marginBottom:6}}>{lvl.label}</div>
                <div style={{fontSize:14,color:G400,fontWeight:600,marginBottom:14}}>{lvl.tag}</div>
                <p style={{fontSize:14,color:G600,lineHeight:1.7,maxWidth:520,marginBottom:20}}>{lvl.desc}</p>
                {/* Strength / priority chips */}
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  {strongest.map(c=><div key={c.id} style={{display:"flex",alignItems:"center",gap:5,background:"#E6F7EE",border:"1px solid #A7F3D0",borderRadius:100,padding:"4px 12px",fontSize:12,color:FW_GREEN_D,fontWeight:600}}>✓ Strong: {c.label}</div>)}
                  {weakest.map(c=><div key={c.id} style={{display:"flex",alignItems:"center",gap:5,background:"#FEF2F2",border:"1px solid #FECACA",borderRadius:100,padding:"4px 12px",fontSize:12,color:"#DC2626",fontWeight:600}}>↑ Priority: {c.label}</div>)}
                </div>
              </div>
              {/* Right — score + journey */}
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:16}}>
                <div style={{width:130,height:130,borderRadius:"50%",border:`7px solid ${lvl.color}`,background:WHITE,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",boxShadow:`0 0 0 6px ${lvl.color}18,0 4px 20px rgba(0,0,0,0.08)`}}>
                  <div style={{fontSize:40,fontWeight:900,color:lvl.color,lineHeight:1}}>{overall.toFixed(1)}</div>
                  <div style={{fontSize:12,color:G400,fontWeight:600}}>out of 4.0</div>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:6,width:170}}>
                  {LEVELS.map(l=>{const isMe=overall>=l.min&&overall<=l.max,isPast=overall>l.max; return(
                    <div key={l.label} style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{width:16,height:16,borderRadius:"50%",flexShrink:0,background:isMe?l.color:isPast?l.color+"60":G200,border:`2px solid ${isMe?l.color:isPast?l.color+"40":G200}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                        {(isMe||isPast)&&<div style={{width:6,height:6,borderRadius:"50%",background:WHITE}}/>}
                      </div>
                      <span style={{fontSize:11,fontWeight:isMe?800:500,color:isMe?l.color:isPast?G400:G200}}>{l.label}{isMe&&" ← You"}</span>
                    </div>
                  );})}
                </div>
                {lvl.next && <div style={{background:FW_GREEN_L,border:"1px solid #A7F3D0",borderRadius:8,padding:"8px 12px",fontSize:11,color:FW_GREEN_D,fontWeight:600,textAlign:"center",width:170,boxSizing:"border-box"}}>Next: {lvl.next} →</div>}
              </div>
            </div>
          </div>
        </div>

        {/* ── SCORE CARDS ── */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:20}}>

          <Card>
            <SLabel>Category Breakdown</SLabel>
            {CATS.map(cat=>{const score=catScores[cat.id]||0,m=getCatLevel(score); return(
              <div key={cat.id} style={{marginBottom:14}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                  <div style={{display:"flex",alignItems:"center",gap:7}}><span style={{fontSize:14}}>{cat.icon}</span><span style={{fontSize:12,fontWeight:600,color:G800}}>{cat.label}</span></div>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <span style={{fontSize:10,fontWeight:700,color:m.color,background:m.color+"18",borderRadius:4,padding:"2px 7px"}}>{m.label}</span>
                    <span style={{fontSize:13,fontWeight:800,color:G800}}>{score.toFixed(1)}</span>
                  </div>
                </div>
                <div style={{height:7,background:G100,borderRadius:100,overflow:"hidden"}}>
                  <div style={{width:`${(score/4)*100}%`,height:"100%",background:`linear-gradient(90deg,${cat.color}99,${cat.color})`,borderRadius:100}}/>
                </div>
              </div>
            );})}
          </Card>

          <Card>
            <SLabel>Where {firstName} Sits</SLabel>
            {LEVELS.map(l=>{const isActive=overall>=l.min&&overall<=l.max; return(
              <div key={l.label} style={{borderRadius:10,padding:"12px 14px",marginBottom:8,background:isActive?l.light:G50,border:`1.5px solid ${isActive?l.color:G200}`}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:10,height:10,borderRadius:"50%",background:l.color,flexShrink:0}}/>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:700,color:isActive?l.color:G800}}>{l.label}</div>
                    <div style={{fontSize:11,color:G400}}>{l.tag} · {l.min.toFixed(2)}–{l.max.toFixed(2)}</div>
                  </div>
                  {isActive && <div style={{background:l.color,color:WHITE,borderRadius:5,padding:"3px 10px",fontSize:10,fontWeight:800}}>{firstName.toUpperCase()}</div>}
                </div>
                {isActive && <div style={{fontSize:11,color:G600,lineHeight:1.55,marginTop:8,paddingLeft:20}}>{l.desc}</div>}
              </div>
            );})}
          </Card>

          <Card style={{gridColumn:"span 2"}}>
            <SLabel>{firstName}'s Capability Radar</SLabel>
            <ResponsiveContainer width="100%" height={270}>
              <RadarChart data={radarData} margin={{top:10,right:48,bottom:10,left:48}}>
                <PolarGrid stroke={G200}/>
                <PolarAngleAxis dataKey="category" tick={{fill:G600,fontSize:11,fontFamily:"DM Sans,sans-serif"}}/>
                <Radar name="Score" dataKey="score" stroke={lvl.color} fill={lvl.color} fillOpacity={0.12} strokeWidth={2.5} dot={{fill:lvl.color,r:3}}/>
              </RadarChart>
            </ResponsiveContainer>
          </Card>

          <Card style={{gridColumn:"span 2"}}>
            <SLabel>What {lvl.label} Looks Like for {firstName}</SLabel>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
              {[["⚙ Capabilities at this level",lvl.caps],["◎ Processes at this level",lvl.procs]].map(([title,items])=>(
                <div key={title} style={{background:G50,borderRadius:10,padding:18,border:`1px solid ${G200}`}}>
                  <div style={{fontSize:11,fontWeight:700,color:lvl.color,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:12}}>{title}</div>
                  {items.map((item,i)=>(
                    <div key={i} style={{display:"flex",gap:8,marginBottom:8,alignItems:"flex-start"}}>
                      <div style={{width:6,height:6,borderRadius:"50%",background:lvl.color,flexShrink:0,marginTop:5}}/>
                      <span style={{fontSize:13,color:G600,lineHeight:1.5}}>{item}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            {lvl.next && (
              <div style={{background:FW_GREEN_L,border:"1px solid #A7F3D0",borderRadius:8,padding:"12px 16px",display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:18,color:FW_GREEN}}>→</span>
                <span style={{fontSize:13,color:FW_GREEN_D,fontWeight:500}}><strong>{firstName}'s next target: {lvl.next}</strong> — the AI roadmap below shows exactly how to get there with Device42.</span>
              </div>
            )}
          </Card>

          {/* ── AI ROADMAP ── */}
          <Card style={{gridColumn:"span 2",borderTop:`3px solid ${lvl.color}`}}>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
              <div style={{width:38,height:38,borderRadius:10,background:lvl.light,border:`1px solid ${lvl.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>✦</div>
              <div>
                <div style={{fontSize:15,fontWeight:800,color:FW_NAVY}}>{firstName}'s Path to Improvement</div>
                <div style={{fontSize:12,color:G400}}>Personalised recommendations based on {customer?.company||"your organisation"}'s results</div>
              </div>
            </div>
            {recoLoading ? (
              <div style={{display:"flex",alignItems:"center",gap:12,padding:"28px 0",color:G400}}>
                <div style={{width:20,height:20,border:`2px solid ${G200}`,borderTopColor:lvl.color,borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
                <span style={{fontSize:14}}>Building {firstName}'s personalised path to improvement…</span>
              </div>
            ) : recommendation&&typeof recommendation==="object" ? (
              <div>
                {recommendation.summary && (
                  <div style={{background:lvl.light,border:`1px solid ${lvl.border}`,borderRadius:10,padding:"14px 18px",marginBottom:24,fontSize:14,color:G800,lineHeight:1.7,fontWeight:500}}>
                    {recommendation.summary}
                  </div>
                )}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
                  {(recommendation.sections||[]).map((sec,si)=>{const c=CMAP[sec.color]||CMAP.green; return(
                    <div key={si} style={{background:G50,border:`1px solid ${G200}`,borderRadius:12,padding:20}}>
                      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14,paddingBottom:12,borderBottom:`1px solid ${G200}`}}>
                        <div style={{width:32,height:32,borderRadius:8,background:c.bg,border:`1px solid ${c.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{sec.icon}</div>
                        <div style={{fontSize:12,fontWeight:700,color:c.accent,textTransform:"uppercase",letterSpacing:"0.06em"}}>{sec.title}</div>
                      </div>
                      <div style={{display:"flex",flexDirection:"column",gap:10}}>
                        {(sec.items||[]).map((item,ii)=>(
                          <div key={ii} style={{display:"flex",gap:10,alignItems:"flex-start",background:WHITE,border:`1px solid ${G200}`,borderRadius:8,padding:"11px 13px"}}>
                            <div style={{width:20,height:20,borderRadius:"50%",background:c.bg,border:`1.5px solid ${c.border}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>
                              <div style={{width:7,height:7,borderRadius:"50%",background:c.dot}}/>
                            </div>
                            <div>
                              <div style={{fontSize:13,fontWeight:700,color:FW_NAVY,marginBottom:3}}>{item.title}</div>
                              <div style={{fontSize:12,color:G600,lineHeight:1.55}}>{item.detail}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );})}
                </div>
              </div>
            ) : (
              <div style={{fontSize:14,color:G400,padding:"16px 0"}}>Unable to generate recommendations. Please speak with a Freshservice consultant.</div>
            )}
          </Card>

          {/* Share */}
          <Card style={{gridColumn:"span 2"}}>
            <SLabel>Share This Assessment</SLabel>
            <div style={{display:"flex",gap:20,alignItems:"center",flexWrap:"wrap"}}>
              <div style={{background:WHITE,border:`1px solid ${G200}`,borderRadius:10,padding:8,flexShrink:0}}>
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(shareUrl)}&bgcolor=ffffff&color=1A2332&margin=6`} alt="QR" style={{width:80,height:80,display:"block"}}/>
              </div>
              <div>
                <div style={{fontSize:14,fontWeight:600,color:FW_NAVY,marginBottom:4}}>Invite colleagues to take the assessment</div>
                <div style={{fontSize:13,color:G400,marginBottom:12}}>Scan the QR code or copy the link</div>
                <div onClick={onCopy} style={{display:"inline-flex",alignItems:"center",gap:8,background:G50,border:`1px solid ${G200}`,borderRadius:8,padding:"8px 14px",cursor:"pointer",fontSize:12,color:FW_BLUE,fontFamily:"monospace"}}>
                  🔗 {shareUrl}
                  {copied&&<span style={{background:FW_GREEN,color:WHITE,borderRadius:4,padding:"1px 7px",fontSize:10,fontWeight:700}}>Copied!</span>}
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div style={{textAlign:"center",fontSize:12,color:G400}}>
          Powered by <strong style={{color:FW_GREEN}}>Freshservice ITIM</strong> × <strong style={{color:G600}}>Device42</strong>
        </div>
      </div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ onClose }) {
  const [entries, setEntries]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter]     = useState("all");
  const [search, setSearch]     = useState("");
  const [clearing, setClearing] = useState(false);

  useEffect(() => { loadEntries(); }, []);

  const loadEntries = async () => {
    setLoading(true);
    try {
      const res = await window.storage.list("submission:", true);
      const keys = res?.keys || [];
      const all = await Promise.all(keys.map(async k => {
        try { const r = await window.storage.get(k, true); return r ? JSON.parse(r.value) : null; } catch { return null; }
      }));
      setEntries(all.filter(Boolean).sort((a,b) => new Date(b.completedAt) - new Date(a.completedAt)));
    } catch { setEntries([]); }
    setLoading(false);
  };

  const deleteEntry = async (entry) => {
    try { await window.storage.delete(`submission:${entry.id}`, true); loadEntries(); if(selected?.id===entry.id) setSelected(null); } catch {}
  };

  const clearAll = async () => {
    if (!clearing) { setClearing(true); return; }
    try {
      const res = await window.storage.list("submission:", true);
      const keys = res?.keys || [];
      await Promise.all(keys.map(k => window.storage.delete(k, true).catch(()=>{})));
      setEntries([]); setSelected(null); setClearing(false);
    } catch { setClearing(false); }
  };

  const filtered = entries.filter(e => {
    const matchFilter = filter === "all" || e.maturityLabel === filter;
    const matchSearch = !search || [e.name,e.company,e.email].some(v => v?.toLowerCase().includes(search.toLowerCase()));
    return matchFilter && matchSearch;
  });

  const levelCounts = LEVELS.reduce((acc, l) => { acc[l.label] = entries.filter(e=>e.maturityLabel===l.label).length; return acc; }, {});
  const avgScore = entries.length ? (entries.reduce((s,e)=>s+e.overall,0)/entries.length).toFixed(2) : "—";

  const exportCSV = () => {
    const header = ["Name","Company","Email","Date","Overall","Level","Discovery","CMDB","Change","Licences","Lifecycle","Operations"];
    const rows = entries.map(e => [e.name,e.company,e.email,new Date(e.completedAt).toLocaleDateString("en-GB"),e.overall.toFixed(2),e.maturityLabel,...CATS.map(c=>e.catScores[c.id]?.toFixed(1)||"")]);
    const csv = [header, ...rows].map(r => r.map(v=>`"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], {type:"text/csv"});
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "itam-assessments.csv"; a.click();
  };

  return (
    <div style={{minHeight:"100vh",background:G50,fontFamily:"'DM Sans',system-ui,sans-serif"}}>
      {/* Nav */}
      <div style={{background:WHITE,borderBottom:`1px solid ${G200}`,padding:"0 28px",height:56,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:10}}>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          <Logo/>
          <span style={{color:G200}}>|</span>
          <span style={{fontSize:13,fontWeight:700,color:FW_NAVY}}>Results Dashboard</span>
          <div style={{background:FW_GREEN_L,border:"1px solid #A7F3D0",borderRadius:100,padding:"2px 10px",fontSize:11,fontWeight:700,color:FW_GREEN}}>{entries.length} submissions</div>
        </div>
        <div style={{display:"flex",gap:8}}>
          {entries.length>0 && (
            <>
              <button onClick={exportCSV} style={{background:FW_BLUE,color:WHITE,border:"none",borderRadius:7,padding:"6px 14px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>⬇ Export CSV</button>
              <button onClick={clearAll} style={{background:clearing?"#EF4444":"transparent",color:clearing?"#fff":G400,border:`1px solid ${clearing?"#EF4444":G200}`,borderRadius:7,padding:"6px 14px",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}} onBlur={()=>setClearing(false)}>
                {clearing?"⚠ Confirm Clear All":"🗑 Clear All"}
              </button>
            </>
          )}
          <button onClick={onClose} style={{background:"transparent",border:`1px solid ${G200}`,borderRadius:7,padding:"6px 16px",fontSize:12,fontWeight:600,color:G600,cursor:"pointer",fontFamily:"inherit"}}>✕ Close</button>
        </div>
      </div>

      <div style={{maxWidth:1200,margin:"0 auto",padding:"28px 24px 64px"}}>
        {loading ? (
          <div style={{display:"flex",alignItems:"center",gap:12,padding:"60px 0",justifyContent:"center",color:G400}}>
            <div style={{width:20,height:20,border:`2px solid ${G200}`,borderTopColor:FW_GREEN,borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/> Loading submissions…
          </div>
        ) : entries.length === 0 ? (
          <div style={{textAlign:"center",padding:"80px 24px"}}>
            <div style={{fontSize:48,marginBottom:16}}>📋</div>
            <div style={{fontSize:18,fontWeight:700,color:FW_NAVY,marginBottom:8}}>No submissions yet</div>
            <div style={{fontSize:14,color:G400}}>Results will appear here as customers complete the assessment.</div>
          </div>
        ) : (
          <>
            {/* Summary stats */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:14,marginBottom:24}}>
              {[
                {label:"Total Submissions", value:entries.length, color:FW_GREEN, light:FW_GREEN_L},
                {label:"Average Score", value:avgScore+"/4.0", color:FW_BLUE, light:"#EBF3FF"},
                ...LEVELS.map(l=>({label:l.label, value:levelCounts[l.label]||0, color:l.color, light:l.light}))
              ].map(stat=>(
                <div key={stat.label} style={{background:WHITE,border:`1px solid ${G200}`,borderRadius:12,padding:"16px 18px",boxShadow:"0 1px 4px rgba(0,0,0,0.05)"}}>
                  <div style={{fontSize:24,fontWeight:900,color:stat.color,lineHeight:1,marginBottom:4}}>{stat.value}</div>
                  <div style={{fontSize:11,color:G400,fontWeight:600,lineHeight:1.3}}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Filters + search */}
            <div style={{display:"flex",gap:10,marginBottom:20,flexWrap:"wrap",alignItems:"center"}}>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name, company or email…" style={{flex:1,minWidth:200,border:`1px solid ${G200}`,borderRadius:8,padding:"9px 14px",fontSize:13,color:FW_NAVY,background:WHITE,outline:"none",fontFamily:"inherit"}}/>
              <div style={{display:"flex",gap:6}}>
                {["all",...LEVELS.map(l=>l.label)].map(f=>(
                  <button key={f} onClick={()=>setFilter(f)} style={{background:filter===f?(f==="all"?FW_NAVY:LEVELS.find(l=>l.label===f)?.color||FW_NAVY):WHITE, color:filter===f?WHITE:G600, border:`1px solid ${filter===f?"transparent":G200}`, borderRadius:7, padding:"7px 14px", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit"}}>
                    {f==="all"?"All":f}
                    {f!=="all" && ` (${levelCounts[f]||0})`}
                  </button>
                ))}
              </div>
            </div>

            {/* Two-panel layout */}
            <div style={{display:"grid",gridTemplateColumns:"380px 1fr",gap:20,alignItems:"start"}}>
              {/* Left — submission list */}
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {filtered.length===0 ? (
                  <div style={{background:WHITE,border:`1px solid ${G200}`,borderRadius:12,padding:32,textAlign:"center",color:G400,fontSize:13}}>No results match your filter.</div>
                ) : filtered.map(entry=>{
                  const lvl=LEVELS.find(l=>l.label===entry.maturityLabel)||LEVELS[0];
                  const isSel=selected?.id===entry.id;
                  return(
                    <div key={entry.id} onClick={()=>setSelected(entry)} style={{background:isSel?lvl.light:WHITE, border:`1.5px solid ${isSel?lvl.color:G200}`, borderRadius:12, padding:"14px 16px", cursor:"pointer", transition:"all 0.15s", boxShadow:isSel?`0 0 0 3px ${lvl.color}18`:"0 1px 3px rgba(0,0,0,0.04)"}}>
                      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                        <div style={{width:34,height:34,borderRadius:"50%",background:lvl.light,border:`2px solid ${lvl.color}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:900,color:lvl.color,flexShrink:0}}>
                          {entry.name.charAt(0).toUpperCase()}
                        </div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:13,fontWeight:700,color:FW_NAVY,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{entry.name}</div>
                          <div style={{fontSize:11,color:G400,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{entry.company}</div>
                        </div>
                        <div style={{textAlign:"right",flexShrink:0}}>
                          <div style={{fontSize:16,fontWeight:900,color:lvl.color}}>{entry.overall.toFixed(1)}</div>
                          <div style={{fontSize:10,color:G400}}>/ 4.0</div>
                        </div>
                      </div>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                        <div style={{background:lvl.color,color:WHITE,borderRadius:5,padding:"2px 8px",fontSize:10,fontWeight:800}}>{entry.maturityLabel}</div>
                        <div style={{fontSize:11,color:G400}}>{new Date(entry.completedAt).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right — detail view */}
              {selected ? (
                <div style={{display:"flex",flexDirection:"column",gap:16}}>
                  {(() => {
                    const lvl=LEVELS.find(l=>l.label===selected.maturityLabel)||LEVELS[0];
                    const firstName=selected.name.split(" ")[0];
                    const sorted=CATS.map(c=>({...c,score:selected.catScores[c.id]||0})).sort((a,b)=>a.score-b.score);
                    return <>
                      {/* Identity + score hero */}
                      <div style={{background:`linear-gradient(135deg,${lvl.light} 0%,${WHITE} 60%)`,border:`1.5px solid ${lvl.border}`,borderRadius:16,overflow:"hidden",boxShadow:`0 2px 16px ${lvl.color}14`}}>
                        <div style={{height:4,background:lvl.color}}/>
                        <div style={{padding:"24px 28px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:20,flexWrap:"wrap"}}>
                          <div style={{display:"flex",alignItems:"center",gap:14}}>
                            <div style={{width:52,height:52,borderRadius:"50%",background:lvl.light,border:`2.5px solid ${lvl.color}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,fontWeight:900,color:lvl.color,flexShrink:0}}>
                              {selected.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div style={{fontSize:18,fontWeight:800,color:FW_NAVY}}>{selected.name}</div>
                              <div style={{display:"flex",gap:12,marginTop:4,flexWrap:"wrap"}}>
                                <span style={{fontSize:12,color:G400}}>🏢 {selected.company}</span>
                                <span style={{fontSize:12,color:G400}}>✉️ {selected.email}</span>
                                <span style={{fontSize:12,color:G400}}>📅 {new Date(selected.completedAt).toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"})}</span>
                              </div>
                            </div>
                          </div>
                          <div style={{display:"flex",alignItems:"center",gap:16}}>
                            <div style={{textAlign:"center"}}>
                              <div style={{width:80,height:80,borderRadius:"50%",border:`5px solid ${lvl.color}`,background:WHITE,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",boxShadow:`0 0 0 4px ${lvl.color}18`}}>
                                <div style={{fontSize:26,fontWeight:900,color:lvl.color,lineHeight:1}}>{selected.overall.toFixed(1)}</div>
                                <div style={{fontSize:10,color:G400,fontWeight:600}}>/ 4.0</div>
                              </div>
                            </div>
                            <div>
                              <div style={{fontSize:22,fontWeight:900,color:FW_NAVY,lineHeight:1,marginBottom:4}}>{lvl.label}</div>
                              <div style={{fontSize:12,color:G400}}>{lvl.tag}</div>
                              {lvl.next && <div style={{marginTop:8,background:FW_GREEN_L,border:"1px solid #A7F3D0",borderRadius:6,padding:"4px 10px",fontSize:11,color:FW_GREEN_D,fontWeight:600,display:"inline-block"}}>Next: {lvl.next} →</div>}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Category bars */}
                      <div style={{background:WHITE,border:`1px solid ${G200}`,borderRadius:12,padding:20,boxShadow:"0 1px 4px rgba(0,0,0,0.05)"}}>
                        <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:FW_GREEN,marginBottom:16,display:"flex",alignItems:"center",gap:6}}>
                          <div style={{width:14,height:2,background:FW_GREEN,borderRadius:2}}/>{firstName}'s Category Scores
                        </div>
                        {CATS.map(cat=>{const score=selected.catScores[cat.id]||0,m=getCatLevel(score); return(
                          <div key={cat.id} style={{marginBottom:12}}>
                            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                              <div style={{display:"flex",alignItems:"center",gap:6}}><span>{cat.icon}</span><span style={{fontSize:12,fontWeight:600,color:G800}}>{cat.label}</span></div>
                              <div style={{display:"flex",alignItems:"center",gap:6}}>
                                <span style={{fontSize:10,fontWeight:700,color:m.color,background:m.color+"18",borderRadius:4,padding:"2px 7px"}}>{m.label}</span>
                                <span style={{fontSize:13,fontWeight:800,color:G800}}>{score.toFixed(1)}</span>
                              </div>
                            </div>
                            <div style={{height:8,background:G100,borderRadius:100,overflow:"hidden"}}>
                              <div style={{width:`${(score/4)*100}%`,height:"100%",background:`linear-gradient(90deg,${cat.color}80,${cat.color})`,borderRadius:100}}/>
                            </div>
                          </div>
                        );})}
                      </div>

                      {/* Strengths & priorities */}
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                        <div style={{background:"#E6F7EE",border:"1px solid #A7F3D0",borderRadius:12,padding:16}}>
                          <div style={{fontSize:11,fontWeight:700,color:FW_GREEN,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10}}>✓ Strongest Areas</div>
                          {sorted.slice(-3).reverse().map(c=>(
                            <div key={c.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                              <span style={{fontSize:12,color:FW_GREEN_D,fontWeight:600}}>{c.icon} {c.label}</span>
                              <span style={{fontSize:12,fontWeight:800,color:FW_GREEN}}>{c.score.toFixed(1)}</span>
                            </div>
                          ))}
                        </div>
                        <div style={{background:"#FEF2F2",border:"1px solid #FECACA",borderRadius:12,padding:16}}>
                          <div style={{fontSize:11,fontWeight:700,color:"#DC2626",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10}}>↑ Priority Areas</div>
                          {sorted.slice(0,3).map(c=>(
                            <div key={c.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                              <span style={{fontSize:12,color:"#DC2626",fontWeight:600}}>{c.icon} {c.label}</span>
                              <span style={{fontSize:12,fontWeight:800,color:"#DC2626"}}>{c.score.toFixed(1)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Delete button */}
                      <div style={{display:"flex",justifyContent:"flex-end"}}>
                        <button onClick={()=>deleteEntry(selected)} style={{background:"transparent",border:`1px solid #FECACA`,borderRadius:8,padding:"8px 16px",fontSize:12,fontWeight:600,color:"#EF4444",cursor:"pointer",fontFamily:"inherit"}}>🗑 Remove this submission</button>
                      </div>
                    </>;
                  })()}
                </div>
              ) : (
                <div style={{background:WHITE,border:`1px solid ${G200}`,borderRadius:12,padding:"48px 32px",textAlign:"center",color:G400}}>
                  <div style={{fontSize:32,marginBottom:12}}>👈</div>
                  <div style={{fontSize:14,fontWeight:600,color:G600}}>Select a submission to see the full breakdown</div>
                  <div style={{fontSize:13,marginTop:6}}>Click any entry from the list on the left</div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [screen,setScreen]      = useState("welcome");
  const [catIdx,setCatIdx]      = useState(0);
  const [qIdx,setQIdx]          = useState(0);
  const [answers,setAnswers]    = useState({});
  const [selected,setSelected]  = useState(null);
  const [customer,setCustomer]  = useState({name:"",email:"",company:""});
  const [reco,setReco]          = useState(null);
  const [recoLoading,setLoading]= useState(false);
  const [copied,setCopied]      = useState(false);

  const shareUrl = typeof window!=="undefined" ? window.location.href : "https://freshservice-itam-assessment.com";
  const onCopy = () => { navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(()=>setCopied(false),2000); };

  const onNext = () => {
    if(selected===null) return;
    const cat=CATS[catIdx], ans=answers[cat.id]||[];
    const updated={...answers,[cat.id]:[...ans.slice(0,qIdx),selected,...ans.slice(qIdx+1)]};
    setAnswers(updated);
    if(qIdx<cat.questions.length-1){ setQIdx(qIdx+1); setSelected(null); }
    else if(catIdx<CATS.length-1){ setCatIdx(catIdx+1); setQIdx(0); setSelected(null); }
    else finish(updated);
  };

  const onBack = () => {
    if(qIdx>0){ setQIdx(qIdx-1); setSelected(answers[CATS[catIdx].id]?.[qIdx-1]??null); }
    else if(catIdx>0){ const prev=CATS[catIdx-1]; setCatIdx(catIdx-1); setQIdx(prev.questions.length-1); setSelected(answers[prev.id]?.[prev.questions.length-1]??null); }
    else setScreen("details");
  };

  const finish = async (finalAnswers) => {
    const {catScores,overall}=computeScores(finalAnswers);
    const lvl=getLevel(overall);
    setScreen("results"); setLoading(true);
    // Save to shared storage
    try {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
      const record = { id, name:customer.name, email:customer.email, company:customer.company, overall, catScores, maturityLabel:lvl.label, completedAt:new Date().toISOString() };
      await window.storage.set(`submission:${id}`, JSON.stringify(record), true);
    } catch(e) { console.warn("Storage save failed", e); }
    try { const r=await fetchReco(catScores,overall,lvl); setReco(r||null); }
    catch { setReco(null); }
    setLoading(false);
  };

  const restart = () => { setScreen("welcome"); setCatIdx(0); setQIdx(0); setAnswers({}); setSelected(null); setReco(null); setCustomer({name:"",email:"",company:""}); };

  if(screen==="dashboard")  return <Dashboard onClose={()=>setScreen("welcome")}/>;
  if(screen==="welcome")    return <Welcome onStart={()=>setScreen("details")} onDashboard={()=>setScreen("dashboard")} shareUrl={shareUrl} copied={copied} onCopy={onCopy}/>;
  if(screen==="details")    return <CustomerDetails onSubmit={(d)=>{setCustomer(d);setScreen("assessment");}} onBack={()=>setScreen("welcome")}/>;
  if(screen==="assessment") return <Assessment catIdx={catIdx} qIdx={qIdx} selected={selected} onSelect={setSelected} onNext={onNext} onBack={onBack} customer={customer}/>;
  return <Results answers={answers} customer={customer} recommendation={reco} recoLoading={recoLoading} onRestart={restart} onDashboard={()=>setScreen("dashboard")} shareUrl={shareUrl} copied={copied} onCopy={onCopy}/>;
}
