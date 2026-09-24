/* =========================================================
   SkillBridge v2 — single-file SPA (REFINED)
   Ocean Blue theme · 4 roles · shared cross-role state
   - Adaptive assessment engine
   - AI project analysis
   - Computed match scoring
   - Skill Passport
========================================================= */
'use strict';

/* ---------------- State ---------------- */
const state = {
  role: null,
  currentUser: null,
  applications: [
    {id:1, company:'TCS',   role:'Software Engineering Intern', loc:'Mumbai',   stipend:'₹25,000/mo', status:'interview',  skills:['Python','SQL','Problem Solving']},
    {id:2, company:'Infosys',role:'Software Development Intern',loc:'Bengaluru',stipend:'₹30,000/mo', status:'shortlisted',skills:['Python','JavaScript','SQL']},
    {id:3, company:'Zoho',  role:'Backend Development Intern', loc:'Chennai',  stipend:'₹28,000/mo', status:'applied',    skills:['Python','SQL','APIs']},
  ],
  mentors: [
    {id:1, name:'Arjun Mehta', company:'TCS', skills:['Python','SQL','System Design'], exp:'6 years', avail:'2 slots/week', status:'none',
     endorsements: 24, rating: 4.8, bio:'Backend engineer at TCS. Love teaching Python fundamentals and system design.'},
    {id:2, name:'Sneha Kulkarni', company:'Zoho', skills:['JavaScript','Full-Stack','APIs'], exp:'5 years', avail:'1 slot/week', status:'none',
     endorsements: 18, rating: 4.9, bio:'Full-stack developer at Zoho. React + Node specialist.'},
    {id:3, name:'Vikram Reddy', company:'Infosys', skills:['Data Analytics','Python','SQL'], exp:'8 years', avail:'2 slots/week', status:'none',
     endorsements: 31, rating: 4.7, bio:'Data analytics lead. Mentoring students on real-world data projects.'},
  ],
  notifications: {
    student: [
      {ico:'💼', text:'TCS moved your application to Interview.', time:'2h ago', unread:true},
      {ico:'✅', text:'Your Python skill has been verified.', time:'1d ago', unread:true},
      {ico:'🤝', text:'Your mentor request was accepted.', time:'2d ago', unread:false},
    ],
    industry: [
      {ico:'🎓', text:'Priya Sharma requested mentorship.', time:'3h ago', unread:true},
      {ico:'🏛️', text:'ABC University sent an MOU request.', time:'1d ago', unread:true},
    ],
    academician: [
      {ico:'📜', text:'Infosys invited you to an FDP.', time:'5h ago', unread:true},
      {ico:'🔬', text:'Your research collaboration was viewed.', time:'1d ago', unread:false},
    ],
    institution: [
      {ico:'⚠️', text:'Wipro partnership renewal due in 30 days.', time:'4h ago', unread:true},
      {ico:'📉', text:'JavaScript skill gap increased by 8%.', time:'1d ago', unread:true},
    ],
  },
  enrolled: false,
  guestReq: 'none',
  assessment: null,
  lastAnalysis: null,
  lastAssessment: null,
  skillProfile: {
    Python:         { score: 8.5, verified: true,  assessedOn: '2026-09-15', percentile: 92, evidence: ['assessment','project','challenges'] },
    SQL:            { score: 6.4, verified: false, assessedOn: '2026-08-20', percentile: 58, evidence: ['challenges'] },
    JavaScript:     { score: 4.8, verified: false, assessedOn: null, percentile: 32, evidence: [] },
    Communication:  { score: 6.1, verified: false, assessedOn: null, percentile: 54, evidence: [] },
    'Problem Solving': { score: 7.2, verified: false, assessedOn: '2026-09-01', percentile: 71, evidence: ['assessment'] },
  },
  studentProfile: {
    name: 'Priya Sharma', cgpa: 8.6, branch: 'CSE', gradYear: 2027,
    university: 'ABC University', preferredLocation: 'Mumbai',
  },
  // Peers for AI team formation (replaces old talentPool)
  peers: [
    {id:3912, name:'Rahul Deshmukh', branch:'IT', cgpa:8.2,
     skills:{Python:8.2, SQL:7.1, JavaScript:6.8, Communication:7.4}, verified:['Python','SQL']},
    {id:4521, name:'Ananya Rao', branch:'Data Science', cgpa:8.9,
     skills:{Python:8.8, SQL:8.2, JavaScript:5.1, Communication:7.9}, verified:['Python','SQL']},
    {id:5108, name:'Karthik Nair', branch:'ECE', cgpa:7.8,
     skills:{Python:7.1, SQL:5.4, JavaScript:6.2, Communication:6.8}, verified:['Python']},
    {id:6234, name:'Meera Iyer', branch:'CSE', cgpa:8.4,
     skills:{Python:7.9, SQL:7.8, JavaScript:7.5, Communication:8.1}, verified:['Python','SQL','JavaScript']},
  ],
};

/* ---------------- Helpers ---------------- */
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const seal = (lg=false) => `<span class="seal ${lg?'seal-lg':''}">✓</span>`;
const sealText = t => `<span class="seal-text">${seal()} ${t}</span>`;
const matchBadge = m => `<span class="match-badge num">${m}% Match</span>`;
const tag = t => `<span class="tag">${t}</span>`;
const badge = (s,label) => `<span class="badge ${s}">${label||s}</span>`;
const bar = (pct, cls='') => `<div class="bar ${cls}"><div style="width:${pct}%"></div></div>`;
const shuffle = a => a.map(x=>[Math.random(),x]).sort((a,b)=>a[0]-b[0]).map(x=>x[1]);
const skillRow = (name, val, max=10, gap) => {
  const cls = gap==='large'?'red':gap==='moderate'?'amber':(val>=max?'green':'');
  return `<div class="skill-row"><span class="sname">${name}</span>${bar(val/max*100,cls)}<span class="sval num">${val}</span></div>`;
};
const appState = id => state.applications.find(a=>a.id===id)?.status;

/* ---------------- Computed Match Scoring ---------------- */
const WEIGHTS = { skillMatch: 0.50, verifiedBonus: 0.20, cgpa: 0.15, location: 0.10, recency: 0.05 };

function computeMatch(studentProfile, skillProfile, opportunity) {
  const requiredSkills = opportunity.skillRequirements || {};
  const skillNames = opportunity.skills;
  let skillScore = 0;
  let verifiedCount = 0;
  const breakdown = [];
  skillNames.forEach(skill => {
    const studentLevel = skillProfile[skill]?.score || 0;
    const requiredLevel = requiredSkills[skill] || 7;
    const ratio = Math.min(studentLevel / requiredLevel, 1.2);
    skillScore += ratio;
    if (skillProfile[skill]?.verified) verifiedCount++;
    breakdown.push({
      skill, studentLevel, requiredLevel,
      meets: studentLevel >= requiredLevel,
      verified: skillProfile[skill]?.verified || false,
      gap: Math.max(0, requiredLevel - studentLevel)
    });
  });
  skillScore = (skillScore / skillNames.length) * 100;
  const verifiedBonus = (verifiedCount / skillNames.length) * 100;
  const cgpaScore = Math.min(studentProfile.cgpa / 10, 1) * 100;
  const locationScore = studentProfile.preferredLocation === opportunity.loc ? 100 : 50;
  const avgAge = skillNames.reduce((sum, s) => {
    const d = skillProfile[s]?.assessedOn;
    if (!d) return sum + 365;
    return sum + Math.min(365, (Date.now() - new Date(d).getTime()) / 86400000);
  }, 0) / skillNames.length;
  const recencyScore = Math.max(0, 100 - (avgAge / 365) * 100);
  const total = Math.round(
    skillScore * WEIGHTS.skillMatch +
    verifiedBonus * WEIGHTS.verifiedBonus +
    cgpaScore * WEIGHTS.cgpa +
    locationScore * WEIGHTS.location +
    recencyScore * WEIGHTS.recency
  );
  return {
    score: total,
    breakdown: {
      skillMatch: Math.round(skillScore),
      verifiedBonus: Math.round(verifiedBonus),
      cgpa: Math.round(cgpaScore),
      location: locationScore,
      recency: Math.round(recencyScore),
    },
    skillBreakdown: breakdown,
    reasons: breakdown.filter(b => b.meets).map(b => `✅ ${b.skill}: ${b.studentLevel}/10 meets ${b.requiredLevel} requirement`),
    gaps: breakdown.filter(b => !b.meets).map(b => `⚠️ ${b.skill}: ${b.studentLevel}/10 (need ${b.requiredLevel})`),
  };
}

/* ---------------- Opportunities pool ---------------- */
const OPPS = [
  {id:1, company:'TCS',    role:'Software Engineering Intern', loc:'Mumbai',    stipend:'₹25,000/mo', skills:['Python','SQL','Problem Solving'], type:'Internship',
   skillRequirements:{Python:8, SQL:7, 'Problem Solving':6}},
  {id:2, company:'Infosys',role:'Software Development Intern', loc:'Bengaluru', stipend:'₹30,000/mo', skills:['Python','JavaScript','SQL'], type:'Internship',
   skillRequirements:{Python:8, JavaScript:7, SQL:7}},
  {id:3, company:'Zoho',   role:'Backend Development Intern',  loc:'Chennai',   stipend:'₹28,000/mo', skills:['Python','SQL','APIs'], type:'Internship',
   skillRequirements:{Python:7, SQL:6, APIs:6}},
  {id:4, company:'Wipro',  role:'Data Analyst Intern',         loc:'Hyderabad', stipend:'₹22,000/mo', skills:['Python','Data Analytics','SQL'], type:'Internship',
   skillRequirements:{Python:7, 'Data Analytics':7, SQL:6}},
  {id:5, company:'TCS',    role:'Graduate Engineer Trainee',   loc:'Pune',      stipend:'₹3.6 LPA',   skills:['Python','Communication','Git & GitHub'], type:'Placement',
   skillRequirements:{Python:7, Communication:6, 'Git & GitHub':5}},
  {id:6, company:'Zoho',   role:'Full-Stack Developer',        loc:'Chennai',   stipend:'₹4.2 LPA',   skills:['JavaScript','SQL','Python'], type:'Placement',
   skillRequirements:{JavaScript:7, SQL:7, Python:7}},
];

function oppWithMatch(o) {
  const m = computeMatch(state.studentProfile, state.skillProfile, o);
  return { ...o, match: m.score, matchDetails: m };
}

/* ---- oppCard + readiness helpers ---- */
const oppCard = (o, applied) => {
  const m = o.matchDetails || computeMatch(state.studentProfile, state.skillProfile, o);
  const gaps = (m.skillBreakdown || []).filter(b => !b.meets);
  const unverified = (m.skillBreakdown || []).filter(b => !b.verified);
  const actionSkills = gaps.length > 0 ? gaps : unverified;
  return `
<div class="card hoverable opp-card">
  <div class="row"><div class="opp-logo">${o.company[0]}</div>
    <div><h3>${o.company}</h3><div class="muted">${o.role}</div></div></div>
  <div class="row wrap">${o.skills.map(tag).join('')}</div>
  <div class="row between">
    <div class="muted">${o.loc} · ${o.stipend}</div>${matchBadge(m.score)}</div>
  <button class="btn ${applied?'btn-secondary':'btn-primary'}" ${applied?'disabled':''}
    onclick="applyTo(${o.id},this)">${applied?'Applied ✓':'Apply'}</button>
  <button class="btn btn-ghost btn-sm" onclick="showMatchBreakdown(${o.id})">Why this match?</button>
  ${!applied && actionSkills.length > 0 ? `
    <div style="border-top:1px dashed var(--border);margin-top:6px;padding-top:10px">
      <div class="muted" style="font-size:11.5px;margin-bottom:7px">
        ${gaps.length > 0
          ? `⚡ Close ${gaps.length} gap${gaps.length>1?'s':''} to boost your match:`
          : `⚡ Verify to strengthen your application:`}
      </div>
      <div class="row wrap" style="gap:6px">
        ${actionSkills.slice(0, 3).map(b => `
          <button class="btn btn-secondary btn-sm" style="font-size:12px" onclick="startAssessment('${b.skill}')">
            ✓ Verify ${b.skill}
          </button>
        `).join('')}
      </div>
    </div>
  ` : ''}
</div>`;
};

function readinessRing(pct, size=120){
  const r=(size/2)-10, c=2*Math.PI*r, off=c*(1-pct/100);
  return `<svg class="ring" width="${size}" height="${size}">
    <circle class="bgc" cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke-width="12"/>
    <circle class="fgc" cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke-width="12"
      stroke-dasharray="${c}" stroke-dashoffset="${off}"/></svg>`;
}

function computeReadiness() {
  const skills = Object.values(state.skillProfile);
  const avg = skills.reduce((s, x) => s + x.score, 0) / skills.length;
  const verifiedShare = skills.filter(s => s.verified).length / skills.length;
  return Math.round(avg * 10 * (0.7 + 0.3 * verifiedShare));
}

const evidenceChain = (skill='Python', pendingLast=false) => {
  const sp = state.skillProfile[skill];
  return `
<div class="chain">
  ${['Learned','Practiced','Built','Assessed'].map(s=>`<div class="chain-step"><span class="chain-dot">✓</span><div><strong>${s}</strong><div class="muted">${skill} · completed</div></div></div>`).join('')}
  <div class="chain-step ${pendingLast || !sp?.verified?'pending':''}"><span class="chain-dot">${sp?.verified?'✓':'○'}</span><div><strong>Verified</strong><div class="muted">${sp?.verified?'Skill verified · '+sp.assessedOn:'Pending assessment'}</div></div></div>
</div>`;
};

function radarChart(series,labels){
  const cx=130,cy=115,R=88,n=labels.length;
  function pt(i,v){const a=-Math.PI/2+i*2*Math.PI/n;return [cx+R*v*Math.cos(a),cy+R*v*Math.sin(a)];}
  let grid='';for(let g=1;g<=4;g++){const pts=labels.map(function(_,i){return pt(i,g/4).join(',');}).join(' ');grid+='<polygon points="'+pts+'" fill="none" stroke="#E2E8F0"/>';}
  let axes='',labs='';labels.forEach(function(l,i){var p=pt(i,1.22),p1=pt(i,1);axes+='<line x1="'+cx+'" y1="'+cy+'" x2="'+p1[0]+'" y2="'+p1[1]+'" stroke="#E2E8F0"/>';labs+='<text x="'+p[0]+'" y="'+p[1]+'" text-anchor="middle" font-size="10.5" fill="#475569" font-family="Inter">'+l+'</text>';});
  let polys=series.map(function(s){const pts=s.map(function(v,i){return pt(i,v/100).join(',');}).join(' ');return '<polygon points="'+pts+'" fill="rgba(14,165,233,.28)" stroke="#0EA5E9" stroke-width="2"/>';}).join('');
  return '<svg viewBox="0 0 260 230" style="width:100%">'+grid+axes+polys+labs+'</svg>';
}

/* ---------------- Toast / modal ---------------- */
function toast(msg, ok=true){
  const t = document.createElement('div');
  t.className='toast';
  t.innerHTML = (ok?`<span class="seal" style="width:22px;height:22px;font-size:12px;box-shadow:none">✓</span>`:'ℹ️')+`<span>${msg}</span>`;
  $('#toast-root').appendChild(t);
  setTimeout(()=>{t.style.opacity='0';t.style.transition='opacity .3s';setTimeout(()=>t.remove(),320)},2800);
}
function modal(html){
  $('#modal-root').innerHTML = `<div class="modal-back" onclick="if(event.target===this)closeModal()"><div class="modal">${html}</div></div>`;
}
function closeModal(){ $('#modal-root').innerHTML=''; }

/* ---------------- Router ---------------- */
const routes = {};
function route(path, fn){ routes[path]=fn; }
function nav(path){
  const target = '#' + path;
  if (location.hash === target) {
    render();  // Force re-render on same-hash navigation
  } else {
    location.hash = target;
  }
}
function render(){
  const hash = location.hash.slice(1) || '/login';
  const [path, query] = hash.split('?');
  const fn = routes[path] || routes['/login'];
  window.scrollTo(0,0);
  fn(query ? Object.fromEntries(new URLSearchParams(query)) : {});
}
window.addEventListener('hashchange', render);

/* ---------------- Shell ---------------- */
const NAVS = {
  student: [
    ['dashboard','🏠','Home'], ['learn','📚','My Learning'], ['journey','🧭','Skill Journey'],
    ['project','🛠️','Projects'], ['assessment','✓','Verify Skills'],
    ['opportunities','💼','Opportunities'], ['applications','📋','Applications'],
    ['portfolio','🎓','Passport'],
    ['grow','🌱','Grow'], ['notifications','🔔','Notifications'],
  ],
  industry: [
    ['dash','🏠','Dashboard'], ['post','➕','Opportunities'], ['applicants','👥','Applicants'],
    ['programs','📜','Learning Programs'],
    ['engage','🤝','Engage Talent'], ['notifications','🔔','Notifications'],
  ],
  academician: [
    ['home','🏠','Home'], ['fdp','📜','FDPs'], ['research','🔬','Research'],
    ['notifications','🔔','Notifications'],
  ],
  institution: [
    ['overview','🏠','Overview'],
    ['skillhealth','📊','Skill Health'],
    ['roi','💰','Intervention ROI'],
    ['partnerships','🤝','Partnerships'],
    ['notifications','🔔','Notifications'],
  ],
};
const ROLE_NAMES = {student:'Priya Sharma', industry:'TCS Talent Team', academician:'Dr. Lakshmi Iyer', institution:'ABC University'};
const ROLE_AV = {student:'PS', industry:'T', academician:'LI', institution:'AU'};

function shell(role, active, title, subtitle, inner){
  const navItems = NAVS[role].map(([p,ico,label])=>{
    const href = `/${role}/${p}`;
    const isActive = active===p || (active===p+'s');
    return `<a href="#${href}" class="${isActive?'active':''}"><span class="ico">${ico}</span>${label}</a>`;
  }).join('');
  const unread = state.notifications[role]?.some(n=>n.unread);
  return `
  <div class="app">
    <aside class="sidebar">
      <div class="wordmark"><span class="mark">✓</span>SkillBridge</div>
      <nav class="nav">${navItems}</nav>
      <div style="margin-top:auto;padding:14px 16px;border-top:1px solid var(--border)">
        <a href="#/login" class="row" style="gap:10px;color:var(--text2);font-size:13px">
          <span class="avatar" style="width:30px;height:30px;font-size:11px">${ROLE_AV[role]}</span>
          <span style="font-weight:600;color:var(--text)">${ROLE_NAMES[role]}</span></a>
      </div>
    </aside>
    <div class="main">
      <div class="topbar">
        <span class="crumb">${title}</span><span class="spacer"></span>
        <a class="icon-btn" href="#/${role}/notifications">🔔${unread?'<span class="dot-unread"></span>':''}</a>
        <span class="avatar">${ROLE_AV[role]}</span>
      </div>
      <div class="content">
        ${subtitle?`<div class="page-head"><div><h1>${title}</h1><p>${subtitle}</p></div></div>`:''}
        ${inner}
      </div>
    </div>
  </div>`;
}
function mount(html){ $('#app').innerHTML = html; }

/* ---------------- LOGIN ---------------- */
let selectedRole='student';
let testimonialTimer = null;
document.addEventListener('click', e=>{
  const card = e.target.closest('.role-card');
  if(card){
    selectedRole = card.dataset.role;
    document.querySelectorAll('.role-card').forEach(c => c.classList.toggle('active', c === card));
  }
});

let testimonialIndex = 0;
const TESTIMONIALS = [
  {quote:'I walked into my TCS interview with a verified Python passport and a portfolio recruiters could actually check. Got the offer in two weeks.', name:'Priya Sharma', detail:'Placed at TCS · B.Tech CSE 2026'},
  {quote:'SkillBridge showed me exactly which skills I was missing for backend roles — then helped me prove I had them.', name:'Rahul Deshmukh', detail:'Placed at Infosys · B.Tech IT 2026'},
  {quote:'As a recruiter, seeing verified evidence beats reading 100 resumes. We shortlist 3x faster now.', name:'Ananya Rao', detail:'Talent Lead · Zoho'},
];

function rotateTestimonial(){
  testimonialIndex = (testimonialIndex + 1) % TESTIMONIALS.length;
  const t = TESTIMONIALS[testimonialIndex];
  const q = document.getElementById('testimonialQuote');
  const n = document.getElementById('testimonialName');
  const d = document.getElementById('testimonialDetail');
  const dots = document.querySelectorAll('.testimonial-dot');
  if(q && n && d){
    q.style.opacity='0'; n.style.opacity='0'; d.style.opacity='0';
    setTimeout(()=>{
      q.textContent = t.quote;
      n.textContent = t.name;
      d.textContent = t.detail;
      q.style.opacity='1'; n.style.opacity='1'; d.style.opacity='1';
      dots.forEach((dot,i)=>dot.classList.toggle('active', i===testimonialIndex));
    }, 220);
  }
}
window.rotateTestimonial = rotateTestimonial;

route('/login', ()=>{
  if (testimonialTimer) { clearInterval(testimonialTimer); testimonialTimer = null; }
  mount(`
  <div class="login-v3">
    <aside class="login-left-v3">
      <div class="left-glow glow-1"></div>
      <div class="left-glow glow-2"></div>
      <div class="left-inner">
        <div class="brand-v3">
          <span class="brand-mark">✓</span>
          <span class="brand-name">SkillBridge</span>
          <span class="brand-chip">Demo</span>
        </div>
        <div class="left-hero">
          <h1 class="left-headline">Turn skills<br>into offers.</h1>
          <p class="left-sub">The verified skill-to-opportunity platform connecting students, industry, academicians, and institutions.</p>
          <div class="left-stats">
            <div class="stat"><div class="stat-num">12,400+</div><div class="stat-label">Students</div></div>
            <div class="stat"><div class="stat-num">340</div><div class="stat-label">Partner companies</div></div>
            <div class="stat"><div class="stat-num">28</div><div class="stat-label">Universities</div></div>
          </div>
          <div class="left-features">
            <div class="feature"><span class="feature-ico">🎯</span><div><strong>Verified, not claimed</strong><span>Adaptive assessments and AI-analyzed projects prove real skills.</span></div></div>
            <div class="feature"><span class="feature-ico">🤝</span><div><strong>Matched, not spammed</strong><span>Opportunities find you based on demonstrated evidence.</span></div></div>
            <div class="feature"><span class="feature-ico">📊</span><div><strong>Measured, not guessed</strong><span>Institutions see gaps, interventions, and ROI in real numbers.</span></div></div>
          </div>
        </div>
        <div class="left-testimonial">
          <div class="testimonial-mark">"</div>
          <div class="testimonial-body">
            <p class="testimonial-quote" id="testimonialQuote">${TESTIMONIALS[0].quote}</p>
            <div class="testimonial-meta">
              <div class="testimonial-avatar">${TESTIMONIALS[0].name.split(' ').map(x=>x[0]).join('')}</div>
              <div>
                <div class="testimonial-name" id="testimonialName">${TESTIMONIALS[0].name}</div>
                <div class="testimonial-detail" id="testimonialDetail">${TESTIMONIALS[0].detail}</div>
              </div>
            </div>
            <div class="testimonial-dots">
              ${TESTIMONIALS.map((_,i)=>`<span class="testimonial-dot ${i===0?'active':''}" onclick="testimonialIndex=${i-1};rotateTestimonial()"></span>`).join('')}
            </div>
          </div>
        </div>
      </div>
    </aside>
    <main class="login-right-v3">
      <div class="right-inner">
        <div class="form-header">
          <h2 class="form-headline">Welcome back</h2>
          <p class="form-sub">Sign in to continue to your dashboard.</p>
        </div>
        <div class="role-section">
          <div class="role-section-label">Sign in as</div>
          <div class="role-cards">
            <button class="role-card active" data-role="student"><span class="role-ico">🎓</span><span class="role-name">Student</span><span class="role-desc">Learn, build, get hired</span></button>
            <button class="role-card" data-role="industry"><span class="role-ico">🏢</span><span class="role-name">Industry</span><span class="role-desc">Find verified talent</span></button>
            <button class="role-card" data-role="academician"><span class="role-ico">📚</span><span class="role-name">Academician</span><span class="role-desc">FDPs, research</span></button>
            <button class="role-card" data-role="institution"><span class="role-ico">🏛️</span><span class="role-name">Institution</span><span class="role-desc">Track outcomes</span></button>
          </div>
        </div>
        <div class="demo-strip">
          <div class="demo-strip-label">⚡ Skip login — jump straight in as:</div>
          <div class="demo-chips">
            <button class="demo-chip" data-role="student" onclick="loginAs('student')">Student</button>
            <button class="demo-chip" data-role="industry" onclick="loginAs('industry')">Industry</button>
            <button class="demo-chip" data-role="academician" onclick="loginAs('academician')">Academician</button>
            <button class="demo-chip" data-role="institution" onclick="loginAs('institution')">Institution</button>
          </div>
        </div>
        <div class="or-divider"><span>or sign in with email</span></div>
        <div class="field">
          <label>Email</label>
          <input type="email" id="loginEmail" placeholder="you@example.com" value="priya.sharma@student.edu" autocomplete="email">
        </div>
        <div class="field">
          <label>Password</label>
          <input type="password" id="loginPassword" placeholder="••••••••" value="password123" autocomplete="current-password" onkeydown="if(event.key==='Enter') login()">
        </div>
        <div class="login-row">
          <label class="check"><input type="checkbox" checked>Remember me</label>
          <a href="#/login" onclick="event.preventDefault();toast('Reset link sent to your email')">Forgot password?</a>
        </div>
        <button class="btn-login" onclick="login()">Sign in <span class="btn-arrow">→</span></button>
        <div class="login-footer">
          <span class="muted">New to SkillBridge?</span>
          <a href="#/login" onclick="event.preventDefault();toast('Signup flow coming in the next demo')">Create an account</a>
        </div>
        <div class="trust-line">
          <span>🔒 Verified by SkillBridge</span>
          <span>·</span>
          <span>Used by 12,400+ students</span>
        </div>
      </div>
    </main>
  </div>
  `);
  testimonialTimer = setInterval(rotateTestimonial, 7000);
});

function loginAs(role){
  selectedRole = role;
  state.role = role;
  toast(`Demo mode: logged in as ${role.charAt(0).toUpperCase()+role.slice(1)}`);
  nav(roleToHome(role));
}
window.loginAs = loginAs;

function login(){
  state.role = selectedRole;
  const roleLabel = selectedRole.charAt(0).toUpperCase()+selectedRole.slice(1);
  toast(`Welcome back — signed in as ${roleLabel}`);
  nav(roleToHome(selectedRole));
}

function roleToHome(role){
  const map = {
    student: '/student/dashboard',
    industry: '/industry/dash',
    academician: '/academician/home',
    institution: '/institution/overview'
  };
  return map[role] || '/login';
}

/* ---------------- Cross-role actions ---------------- */
function applyTo(id, btn){
  const o = OPPS.find(x=>x.id===id);
  if(state.applications.some(a=>a.id===id)) return;
  const m = computeMatch(state.studentProfile, state.skillProfile, o);
  state.applications.unshift({
    id:o.id, company:o.company, role:o.role, loc:o.loc, stipend:o.stipend,
    status:'applied', skills:o.skills, match:m.score, matchDetails:m
  });
  toast('Application submitted successfully.');
  setTimeout(()=>nav('/student/applications'), 900);
}

function showMatchBreakdown(id) {
  const o = OPPS.find(x=>x.id===id);
  const m = computeMatch(state.studentProfile, state.skillProfile, o);
  modal(`
    <h2>Match Breakdown</h2>
    <p class="muted">${o.company} · ${o.role}</p>
    <div class="match-score-big">${m.score}%</div>
    <div class="divider"></div>
    <h3>Score Composition</h3>
    ${Object.entries(m.breakdown).map(([k,v])=>`
      <div class="skill-row">
        <span class="sname" style="width:130px;text-transform:capitalize">${k.replace(/([A-Z])/g,' $1')}</span>
        ${bar(v, v>=80?'sea':v>=60?'':'amber')}
        <span class="sval num">${v}%</span>
      </div>`).join('')}
    <div class="divider"></div>
    <h3>Skill Requirements</h3>
    ${m.skillBreakdown.map(b=>`
      <div class="row between" style="padding:7px 0;border-bottom:1px solid var(--border)">
        <div><strong>${b.skill}</strong>${b.verified?' <span class="seal" style="width:18px;height:18px;font-size:10px;box-shadow:none">✓</span>':''}</div>
        <div class="muted num" style="font-size:12.5px">You: ${b.studentLevel} · Need: ${b.requiredLevel}</div>
        <div>${b.meets?badge('on-track','Meets'):badge('moderate','−'+b.gap)}</div>
      </div>`).join('')}
    ${m.gaps.length?`<div class="alert-strip mt16">💡 <div><strong>Close ${m.gaps.length} gap${m.gaps.length>1?'s':''} to improve your match.</strong><div class="muted" style="font-size:12.5px">Focus on: ${m.skillBreakdown.filter(b=>!b.meets).map(b=>b.skill).join(', ')}</div></div></div>`:''}
    <div class="row mt16" style="justify-content:flex-end">
      <button class="btn btn-secondary" onclick="closeModal()">Close</button>
    </div>
  `);
}

/* ================= STUDENT ROUTES ================= */

/* ---- Dashboard ---- */
route('/student/dashboard', ()=>{
  const readiness = computeReadiness();
  const rec = OPPS.slice(0,3).map(oppWithMatch);
  mount(shell('student','dashboard','Home','', `
    <div class="card"><div class="ring-wrap">
      <div style="position:relative">${readinessRing(readiness)}<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center"><span class="kpi-v num">${readiness}%</span><span class="muted" style="font-size:11px">Ready</span></div></div>
      <div><h1 style="font-size:22px">Good morning, Priya 👋</h1>
        <p class="muted">Your career readiness is <strong>${readiness}%</strong> — computed from 5 skills, ${Object.values(state.skillProfile).filter(s=>s.verified).length} verified.</p>
        <div class="row mt8">${badge('verified','Python ✓ Verified')} ${badge('shortlisted','Infosys · Shortlisted')}</div>
      </div></div></div>

    <div class="grid g3 mt24">
      <div class="card hoverable"><div class="eyebrow">Continue Learning</div><h3>SQL for Developers</h3>
        <div class="row between mt8"><span class="muted num">72% · 9/12 lessons</span><span class="chip">SQL</span></div>
        ${bar(72)}<button class="btn btn-primary mt16" style="width:100%" onclick="nav('/student/learn')">Continue</button></div>
      <div class="card hoverable"><div class="eyebrow">Verify Next</div><h3>SQL Skill Verification</h3>
        <div class="muted">Adaptive · 6 questions · ~3 min · becomes verified evidence</div>
        <div class="row mt8 wrap">${tag('SQL')}${tag('Practical')}</div>
        <button class="btn btn-primary mt16" style="width:100%" onclick="startAssessment('SQL')">✓ Verify SQL</button></div>
      <div class="card"><div class="eyebrow">Your Skill DNA</div>
        ${Object.entries(state.skillProfile).map(([k,v])=>skillRow(k, v.score, 10, v.score<5?'large':v.score<7?'moderate':'')).join('')}
        <a href="#/student/journey" style="font-size:13px;font-weight:600">View full journey →</a></div>
    </div>

    <div class="section-title"><h2>Recommended For You</h2><a href="#/student/opportunities" style="font-weight:600;font-size:13px">Browse all →</a></div>
    <div class="opp-scroll">${rec.map(o=>oppCard(o, appState(o.id))).join('')}</div>

    <div class="section-title"><h2>Applications In Progress</h2><a href="#/student/applications" style="font-weight:600;font-size:13px">View tracker →</a></div>
    <div class="grid g3">${state.applications.map(a=>`
      <div class="card hoverable row" style="justify-content:space-between" onclick="nav('/student/applications')">
        <div class="row"><div class="opp-logo">${a.company[0]}</div><div><h3>${a.company}</h3><div class="muted">${a.role}</div></div></div>
        ${badge(a.status)}</div>`).join('')}</div>

    <div class="section-title"><h2>Learning Programs For Your Gaps</h2></div>
    <div class="grid g3">
      ${[['Communication Workshop','4 weeks · Live sessions','Communication'],['SQL Advanced Practice','Self-paced · 20 challenges','SQL'],['JavaScript Full-Stack Bootcamp','6 weeks · Industry-led','JavaScript']].map(p=>`
      <div class="card hoverable"><div class="row between"><h3>${p[0]}</h3><span class="match-badge" style="font-size:12px;padding:4px 10px">Gap fit</span></div>
        <div class="muted mt8">${p[1]}</div><div class="mt8">${tag(p[2])}</div>
        <button class="btn btn-secondary mt16" onclick="toast('Enrolled in ${p[0]}')">Enroll</button></div>`).join('')}
    </div>
    <div class="mt24" style="text-align:center"><a href="#/mobile" class="btn btn-ghost">📱 Preview mobile experience</a></div>
  `));
});

/* ---- Learning ---- */
route('/student/learn', ()=>{
  const mods=[
    ['Python Foundations',78,'12/15 lessons','8/10 challenges','done','Python'],
    ['SQL for Developers',72,'9/12 lessons','6/8 challenges','active','SQL'],
    ['Data Structures & Algorithms',30,'4/14 lessons','2/6 challenges','active','DSA'],
    ['Git & GitHub',0,'0/6 lessons','0/4 challenges','locked','Git'],
    ['Full-Stack Project',0,'Not started','—','locked','Python'],
    ['Skill Verification',0,'Complete a module first','—','locked','Python'],
  ];
  mount(shell('student','learn','My Learning','', `
    <div class="page-head"><div><h1>Build Your Career Path</h1><p>Career goal: <strong>Software Development</strong> · Recommended roadmap based on industry demand</p></div></div>
    <div class="grid g2">${mods.map((m,i)=>`
      <div class="card hoverable" style="${m[4]==='done'?'border-color:#99f6e4':''}">
        <div class="row between"><div class="row"><span class="chip num">${String(i+1).padStart(2,'0')}</span><h3>${m[0]}</h3></div>
          ${m[4]==='done'?sealText('Completed'):m[4]==='active'?badge('interview','In Progress'):badge('applied','Locked')}</div>
        <div class="row between mt8"><span class="muted num">${m[2]} · ${m[3]}</span><span class="num" style="font-weight:700">${m[1]}%</span></div>
        ${bar(m[1], m[4]==='done'?'sea':'')}
        <div class="row between mt16">
          <span class="muted" style="font-size:12px">Skill outcome: ${m[5]}</span>
          <div class="row" style="gap:8px">
            ${m[4]==='done' ? `
              <button class="btn btn-secondary btn-sm" onclick="nav('/student/challenge')">Review</button>
              <button class="btn btn-primary btn-sm" onclick="startAssessment('${m[5]}')">✓ Verify ${m[5]}</button>
            ` : `
              <button class="btn ${m[4]==='locked'?'btn-ghost':'btn-primary'} btn-sm"
                ${m[4]==='locked'?'disabled':''} onclick="nav('/student/challenge')">
                ${m[4]==='active'?'Continue Learning':'Locked'}
              </button>
            `}
          </div>
        </div></div>`).join('')}</div>
  `));
});

/* ---- Challenge ---- */
const CHALLENGE = {
  title: 'Build a Student Expense Tracker',
  difficulty: 'Intermediate',
  skill: 'Python',
  description: 'Write a function that adds an expense and returns the updated transaction list.',
  starter: `def add_expense(transactions, amount, category):
    """
    Add an expense to the transactions list.
    """
    # TODO: implement
    pass`,
  testCases: [
    {name:'Adds valid expense', call:`add_expense([], 500, 'food')`, expected:`[{'amount': 500, 'category': 'food'}]`},
    {name:'Appends to existing', call:`add_expense([{'amount':100,'category':'food'}], 200, 'travel')`, expected:`2 items`},
    {name:'Rejects zero amount', call:`add_expense([], 0, 'food')`, expected:`ValueError`},
    {name:'Rejects negative amount', call:`add_expense([], -50, 'travel')`, expected:`ValueError`},
    {name:'Rejects empty category', call:`add_expense([], 500, '')`, expected:`ValueError`},
  ],
};

route('/student/challenge', ()=>{
  mount(shell('student','learn','Practice Challenge','', `
    <div class="grid" style="grid-template-columns:1.4fr 1fr;align-items:start">
      <div class="card">
        <div class="row between"><div><div class="eyebrow">${CHALLENGE.skill} Challenge · ${CHALLENGE.difficulty}</div><h1 style="font-size:22px">${CHALLENGE.title}</h1></div>
          <span class="timer-chip">⏱ Est. 30 min</span></div>
        <div class="row wrap mt16">${tag('Python')}${tag('Functions')}${tag('Error Handling')}</div>
        <div class="divider"></div>
        <p class="muted">${CHALLENGE.description}</p>
        <div class="divider"></div>
        <h3>Your Solution</h3>
        <textarea id="codeEditor" class="code-editor" spellcheck="false">${esc(CHALLENGE.starter)}</textarea>
        <div class="row mt16">
          <button class="btn btn-secondary" onclick="runTests()">▶ Run Tests</button>
          <button class="btn btn-primary" id="submitCh" disabled onclick="completeChallenge()">Submit Challenge</button>
        </div>
      </div>
      <div class="card"><div class="eyebrow">Test Cases</div>
        <div id="testResults">
          ${CHALLENGE.testCases.map((t,i)=>`
            <div class="test-case" id="test-${i}">
              <div class="row between"><strong style="font-size:13px">${t.name}</strong><span class="test-status">○ Pending</span></div>
              <div class="muted num" style="font-size:11.5px;margin-top:4px">${esc(t.call)} → ${esc(t.expected)}</div>
            </div>`).join('')}
        </div>
        <div class="divider"></div>
        <div class="eyebrow">Completion Criteria</div>
        <div class="col" style="gap:8px;font-size:13px">
          <div class="row" style="gap:8px">• All test cases pass</div>
          <div class="row" style="gap:8px">• Code runs without errors</div>
          <div class="row" style="gap:8px">• AI review scores ≥ 7/10</div>
        </div>
        <div class="divider"></div>
        <div class="muted">This challenge becomes <strong>practice evidence</strong> on your Skill Passport.</div>
      </div>
    </div>
`));
});

function runTests(){
  const results = CHALLENGE.testCases.map((t,i)=>{
    const el = document.getElementById('test-'+i);
    if(!el) return false;
    const passed = i < 4;
    const status = el.querySelector('.test-status');
    status.textContent = passed ? '✓ Pass' : '✗ Fail';
    status.style.color = passed ? '#0f766e' : '#DC2626';
    el.style.background = passed ? '#f0fdfa' : '#fef2f2';
    el.style.borderLeft = `3px solid ${passed?'#2DD4BF':'#DC2626'}`;
    return passed;
  });
  const passedCount = results.filter(Boolean).length;
  toast(`Tests complete: ${passedCount}/${CHALLENGE.testCases.length} passed`);
  if(passedCount === CHALLENGE.testCases.length){
    document.getElementById('submitCh').disabled = false;
  } else {
    toast('Fix failing tests to enable submission', false);
  }
}

function completeChallenge(){
  toast('AI reviewing your code...', true);
  setTimeout(()=>{
    modal(`
      <h2>AI Code Review</h2>
      <div class="row between"><span>Correctness</span><span class="num" style="font-weight:700;color:#0f766e">9/10</span></div>
      ${bar(90,'sea')}
      <div class="row between mt16"><span>Readability</span><span class="num" style="font-weight:700;color:#0f766e">8/10</span></div>
      ${bar(80,'sea')}
      <div class="row between mt16"><span>Edge cases</span><span class="num" style="font-weight:700;color:#D97706">7/10</span></div>
      ${bar(70)}
      <div class="row between mt16"><span>Efficiency</span><span class="num" style="font-weight:700;color:#0f766e">9/10</span></div>
      ${bar(90,'sea')}
      <div class="divider"></div>
      <p class="muted"><strong>AI feedback:</strong> Clean implementation with proper error handling. Consider adding type hints and a docstring example for the ValueError case.</p>
      <div class="alert-strip mt16" style="background:#f0fdfa;border-color:#99f6e4">
        ${seal()} <div><strong>Practice evidence added to your Skill Passport</strong><div class="muted" style="font-size:12.5px">Python · +1 evidence · +0.1 skill score</div></div>
      </div>
      <div class="row mt16" style="justify-content:flex-end">
        <button class="btn btn-primary" onclick="closeModal();toast('Progress saved');nav('/student/project')">Continue to Project</button>
      </div>
    `);
  }, 800);
}

/* ---- Project with AI Analysis ---- */
route('/student/project', ()=>{
  const ms=[['Planning',1],['Database Design',1],['Backend',1],['Frontend',1],['Testing',0],['Submission',0]];
  mount(shell('student','project','Projects','', `
    <div class="page-head"><div><h1>Build & Prove — Campus Placement Tracker</h1><p>Python + SQL + Database Design + Data Visualization</p></div>
      <div class="row" style="gap:8px;flex-wrap:wrap">
        <button class="btn btn-secondary" onclick="startAssessment('Python')">✓ Verify Python</button>
        <button class="btn btn-secondary" onclick="startAssessment('SQL')">✓ Verify SQL</button>
        <button class="btn btn-primary" onclick="analyzeProject()">🔍 Analyze Project with AI</button>
      </div>
    </div>
    <div class="grid" style="grid-template-columns:1.4fr 1fr;align-items:start">
      <div class="card">
        <div class="eyebrow">Project Brief</div>
        <p class="muted">Build a tracker for campus placement drives: companies, packages, eligibility, student applications, and status — with a dashboard for coordinators.</p>
        <div class="row wrap mt8">${tag('Python')}${tag('SQL')}${tag('Database Design')}${tag('Data Visualization')}</div>
        <div class="divider"></div>
        <h3>Milestones</h3>
        <div class="col mt8" style="gap:8px">${ms.map(m=>`
          <div class="row" style="gap:10px">${m[1]?'<span class="seal" style="width:22px;height:22px;font-size:11px;box-shadow:none">✓</span>':'<span style="width:22px;height:22px;border-radius:50%;border:2px solid #cbd5e1;display:inline-flex"></span>'}<span style="${m[1]?'':'color:var(--text2)'}">${m[0]}</span></div>`).join('')}</div>
        <div class="divider"></div>
        <h3>Submission</h3>
        <div class="field mt8"><label>GitHub / Project Link</label><input id="repoUrl" value="https://github.com/priyasharma/campus-placement-tracker"></div>
        <div class="field"><label>Live Demo URL (optional)</label><input value="https://campus-tracker-priya.vercel.app"></div>
        <div class="alert-strip mt8">💡 <span>Paste a GitHub URL and click <strong>Analyze Project with AI</strong> to extract verified skills from your code.</span></div>
      </div>
      <div class="col">
        <div class="card"><div class="eyebrow">Mentor Feedback</div>
          <div class="row" style="gap:10px"><span class="avatar" style="width:32px;height:32px;font-size:12px">AM</span><div><strong>Arjun Mehta</strong><div class="muted" style="font-size:12px">TCS · Mentor</div></div></div>
          <p class="muted mt8" style="font-style:italic">"Solid schema design. Add indexes on the applications table and normalize the companies lookup before submission."</p></div>
        <div class="card"><div class="eyebrow">Why this matters</div>
          <p class="muted">Your completed project becomes <strong>build evidence</strong> — visible to industry on your Skill Passport and used in match scoring.</p>
          <div class="mt8">${sealText('Evidence counts toward verification')}</div></div>
      </div>
    </div>
  `));
});

async function analyzeProject() {
  const repoUrl = document.getElementById('repoUrl')?.value || 'https://github.com/priyasharma/campus-placement-tracker';
  modal(`
    <div style="text-align:center;padding:20px 0">
      <div class="spinner"></div>
      <h2 class="mt16">Analyzing Your Repository</h2>
      <p class="muted">AI is reviewing ${esc(repoUrl.split('/').slice(-2).join('/'))}</p>
      <div id="analysisSteps" class="col mt16" style="gap:8px;text-align:left;max-width:340px;margin:16px auto 0">
        <div class="analysis-step" data-step="0">📁 Fetching repository contents...</div>
        <div class="analysis-step" data-step="1" style="opacity:.4">🔍 Analyzing code structure...</div>
        <div class="analysis-step" data-step="2" style="opacity:.4">🧠 Extracting skills from code...</div>
        <div class="analysis-step" data-step="3" style="opacity:.4">📊 Generating quality report...</div>
      </div>
    </div>
  `);
  const steps = document.querySelectorAll('.analysis-step');
  for (let i = 0; i < steps.length; i++) {
    await new Promise(r => setTimeout(r, 600));
    if (steps[i]) { steps[i].style.opacity = '1'; steps[i].innerHTML = '✓ ' + steps[i].textContent.slice(2); }
  }
  await new Promise(r => setTimeout(r, 500));
  const analysis = {
    skills: [
      { name: 'Python', confidence: 0.95, evidence: ['app.py', 'utils/db.py', 'models/'] },
      { name: 'SQL', confidence: 0.88, evidence: ['schema.sql', 'queries/analytics.sql'] },
      { name: 'Flask', confidence: 0.82, evidence: ['app.py', 'routes/'] },
      { name: 'Database Design', confidence: 0.79, evidence: ['schema.sql (7 tables, 4 FKs)'] },
      { name: 'Testing', confidence: 0.45, evidence: ['tests/ (3 files, 42% coverage)'] },
    ],
    complexity: 'Intermediate',
    qualitySignals: { hasTests: true, testCoverage: '42%', hasReadme: true, commitCount: 47, fileCount: 23, linesOfCode: 1840 },
    feedback: 'Strong schema design with proper normalization. Your Flask routes are clean and RESTful. The analytics queries are efficient but could benefit from additional indexes on foreign key columns.',
    suggestions: [
      'Add indexes on foreign keys in the applications table',
      'Increase test coverage from 42% to 60%+ before submission',
      'Add input validation middleware for API endpoints',
      'Consider adding a /health endpoint for monitoring',
    ],
  };
  state.lastAnalysis = analysis;
  modal(`
    <div style="display:flex;flex-direction:column;max-height:80vh">
      <div style="flex:none">
        <div class="row between">
          <h2 style="margin:0">🔍 AI Project Analysis</h2>
          <button class="btn btn-ghost btn-sm" onclick="closeModal()" style="font-size:20px;padding:0 8px;min-height:32px">✕</button>
        </div>
        <div class="alert-strip" style="background:#f0fdfa;border-color:#99f6e4;margin-top:12px;margin-bottom:0">
          ${seal()} <div><strong>Project analyzed successfully!</strong><div class="muted" style="font-size:12.5px">${analysis.qualitySignals.fileCount} files · ${analysis.qualitySignals.linesOfCode} lines · ${analysis.qualitySignals.commitCount} commits</div></div>
        </div>
      </div>
      <div style="flex:1;overflow-y:auto;margin:16px -8px;padding:0 8px">
        <h3>Skills Detected</h3>
        <div class="mt8">
        ${analysis.skills.map(s => `
          <div class="skill-row">
            <span class="sname">${s.name}</span>
            ${bar(s.confidence * 100, s.confidence >= 0.8 ? 'sea' : s.confidence >= 0.5 ? '' : 'amber')}
            <span class="sval num">${Math.round(s.confidence * 100)}%</span>
          </div>
          <div class="muted" style="font-size:11px;margin:-4px 0 8px 0;padding-left:122px">Evidence: ${s.evidence.join(' · ')}</div>
        `).join('')}
        </div>
        <h3 class="mt16">Complexity: ${analysis.complexity}</h3>
        <h3 class="mt16">AI Feedback</h3>
        <div class="card" style="background:var(--bg);padding:14px">
          <p style="font-size:13.5px">${analysis.feedback}</p>
          <div class="mt8">
            <strong style="font-size:13px">Suggested improvements:</strong>
            <ul style="margin-left:16px;margin-top:6px;font-size:13px">
              ${analysis.suggestions.map(s => `<li style="margin-bottom:4px">${s}</li>`).join('')}
            </ul>
          </div>
        </div>
      </div>
      <div style="flex:none;border-top:1px solid var(--border);padding-top:14px;display:flex;justify-content:flex-end;gap:10px">
        <button class="btn btn-secondary" onclick="closeModal()">Close</button>
        <button class="btn btn-primary" onclick="addAnalysisToPortfolio()">Add Evidence to Passport</button>
      </div>
    </div>
  `);
}

function addAnalysisToPortfolio() {
  const a = state.lastAnalysis;
  if (!a) return;
  state.skillProfile.Python.score = Math.min(10, state.skillProfile.Python.score + 0.2);
  state.skillProfile.SQL.score = Math.min(10, state.skillProfile.SQL.score + 0.1);
  closeModal();
  toast('Evidence added to Skill Passport ✓');
  setTimeout(()=>nav('/student/journey'), 900);
}

/* ---- Adaptive Assessment ---- */
const ASSESSMENT_POOL = {
  SQL: [
    {id:1, difficulty:1, cat:'Knowledge', q:'Which SQL clause filters rows?', opts:['SELECT','WHERE','GROUP BY','ORDER BY'], a:1},
    {id:2, difficulty:1, cat:'Knowledge', q:'Which JOIN returns only matching rows?', opts:['LEFT JOIN','INNER JOIN','RIGHT JOIN','FULL JOIN'], a:1},
    {id:3, difficulty:2, cat:'Knowledge', q:'What does GROUP BY do?', opts:['Sorts rows','Aggregates rows by column','Filters rows','Joins tables'], a:1},
    {id:4, difficulty:2, cat:'Problem Solving', q:'Find the 2nd highest salary. Best approach?', opts:['ORDER BY + LIMIT 1 OFFSET 1','MAX() twice','SELECT DISTINCT','WHERE salary > (SELECT MAX...)'], a:0},
    {id:5, difficulty:3, cat:'Knowledge', q:'Which index type is best for range queries?', opts:['Hash','B-Tree','Bitmap','Full-text'], a:1},
    {id:6, difficulty:3, cat:'Problem Solving', q:'A query is slow on a 10M-row table filtering by date. Best first step?', opts:['Add index on date column','Add more RAM','Rewrite in Python','Denormalize'], a:0},
    {id:7, difficulty:4, cat:'Knowledge', q:'What does OVER (PARTITION BY x) do?', opts:['Groups and collapses rows','Computes across partition without collapsing','Joins partitions','Creates a view'], a:1},
    {id:8, difficulty:4, cat:'Problem Solving', q:'Detect duplicate emails efficiently. Best approach?', opts:['GROUP BY email HAVING COUNT(*) > 1','SELECT DISTINCT','Self-join','Cursor loop'], a:0},
    {id:9, difficulty:5, cat:'Practical', q:'A transaction deadlocks under load. Most robust fix?', opts:['Retry with exponential backoff','Increase timeout','Disable locks','Use READ UNCOMMITTED'], a:0},
    {id:10, difficulty:5, cat:'Practical', q:'Design a schema for multi-tenant SaaS. Best approach?', opts:['Shared schema with tenant_id + RLS','Database per tenant','Table per tenant','Schema per tenant'], a:0},
  ],
  Python: [
    {id:101, difficulty:1, cat:'Knowledge', q:'Which type is immutable in Python?', opts:['List','Tuple','Set','Dict'], a:1},
    {id:102, difficulty:1, cat:'Knowledge', q:'What does len([1,2,3]) return?', opts:['3','2','1','Error'], a:0},
    {id:103, difficulty:2, cat:'Knowledge', q:'What is the output of 2 ** 3?', opts:['6','8','9','23'], a:1},
    {id:104, difficulty:2, cat:'Problem Solving', q:'Best way to check if a key exists in a dict?', opts:["'key' in d",'d.has("key")','d.contains("key")','d.find("key")'], a:0},
    {id:105, difficulty:3, cat:'Knowledge', q:'What is a decorator?', opts:['A comment','A function that wraps another function','A class','An import'], a:1},
    {id:106, difficulty:3, cat:'Problem Solving', q:'Time complexity of list.append()?', opts:['O(n)','O(log n)','O(1) amortized','O(n²)'], a:2},
    {id:107, difficulty:4, cat:'Knowledge', q:'What is a generator?', opts:['A list comprehension','A function using yield','A class method','A module'], a:1},
    {id:108, difficulty:4, cat:'Problem Solving', q:'Fix: default mutable argument bug. Best approach?', opts:['Use None default','Use [] default','Use class attr','Ignore'], a:0},
    {id:109, difficulty:5, cat:'Practical', q:'Fastest way to dedupe a large list?', opts:['set(list)','Nested loops','list.count()','Sort + unique'], a:0},
    {id:110, difficulty:5, cat:'Practical', q:'GIL limits which workload?', opts:['CPU-bound threads','I/O-bound threads','Multiprocessing','Async'], a:0},
  ],
  JavaScript: [
    {id:201, difficulty:1, cat:'Knowledge', q:'Which keyword declares a block-scoped variable?', opts:['var','let','both','none'], a:1},
    {id:202, difficulty:1, cat:'Knowledge', q:'What does === do?', opts:['Assigns','Compares value only','Compares value and type','Throws'], a:2},
    {id:203, difficulty:2, cat:'Knowledge', q:'What does a Promise represent?', opts:['A loop','An eventual value','A function','An array'], a:1},
    {id:204, difficulty:2, cat:'Problem Solving', q:'Best way to handle async errors?', opts:['try/catch with await','Ignoring','setTimeout','Promise.resolve'], a:0},
    {id:205, difficulty:3, cat:'Knowledge', q:'What is a closure?', opts:['A loop','A function with its lexical scope','An object','An array method'], a:1},
    {id:206, difficulty:3, cat:'Problem Solving', q:'Avoid callback hell — best pattern?', opts:['Nested callbacks','async/await','setInterval','String concat'], a:1},
    {id:207, difficulty:4, cat:'Knowledge', q:'What is event delegation?', opts:['Binding to parent','Removing listeners','Adding many listeners','Using jQuery'], a:0},
    {id:208, difficulty:4, cat:'Problem Solving', q:'Debouncing is used for?', opts:['Delay execution until idle','Speed up loop','Cancel fetch','Cache data'], a:0},
    {id:209, difficulty:5, cat:'Practical', q:'Reduce reflows — best approach?', opts:['Batch DOM updates','Update in loop','Use innerHTML repeatedly','Animate style props'], a:0},
    {id:210, difficulty:5, cat:'Practical', q:'Avoid memory leaks in SPAs. Most common cause?', opts:['Un-removed listeners','Using const','Async functions','Importing'], a:0},
  ],
  Communication: [
    {id:301, difficulty:1, cat:'Knowledge', q:'Best way to start an interview answer?', opts:['Dive straight in','Restate the question briefly','Apologize','Say "I don\'t know"'], a:1},
    {id:302, difficulty:1, cat:'Knowledge', q:'Active listening means?', opts:['Interrupting','Nodding only','Confirming understanding','Taking notes silently'], a:2},
    {id:303, difficulty:2, cat:'Knowledge', q:'STAR method stands for?', opts:['Situation-Task-Action-Result','Start-Talk-Ask-Repeat','Story-Tell-Act-React','Simple-True-Action-Review'], a:0},
    {id:304, difficulty:2, cat:'Problem Solving', q:'Handling disagreement with a teammate?', opts:['Escalate to manager','Listen, find common ground, propose compromise','Ignore them','Agree to avoid conflict'], a:1},
    {id:305, difficulty:3, cat:'Knowledge', q:'Best structure for a 5-min technical explanation?', opts:['Bottom-line up front','Chronological','Random access','Alphabetical'], a:0},
    {id:306, difficulty:3, cat:'Problem Solving', q:'You made a mistake affecting the team. Best response?', opts:['Hide it','Blame tools','Own it, explain fix, prevent recurrence','Apologize quietly'], a:2},
    {id:307, difficulty:4, cat:'Knowledge', q:'Pyramid principle in communication?', opts:['Build context first','Conclusion first, then support','Oldest first','Reverse order'], a:1},
    {id:308, difficulty:4, cat:'Problem Solving', q:'Difficult stakeholder keeps interrupting. Best move?', opts:['Raise voice','Pause, acknowledge, ask to finish','End meeting','Escalate'], a:1},
    {id:309, difficulty:5, cat:'Practical', q:'Delivering bad news to leadership?', opts:['Wait for end of quarter','Direct, data-backed, with proposed fix','Blame others','Slide it in casually'], a:1},
    {id:310, difficulty:5, cat:'Practical', q:'Cross-cultural team — best communication habit?', opts:['Assume shared norms','Be explicit, confirm understanding, avoid idioms','Speak louder','Use only email'], a:1},
  ],
  'Problem Solving': [
    {id:401, difficulty:1, cat:'Knowledge', q:'First step when facing an unfamiliar problem?', opts:['Code immediately','Clarify constraints','Ask for answer','Guess'], a:1},
    {id:402, difficulty:1, cat:'Knowledge', q:'What is a brute-force approach?', opts:['Fastest','Try all possibilities','Randomized','Parallel'], a:1},
    {id:403, difficulty:2, cat:'Knowledge', q:'Binary search requires?', opts:['Sorted input','Unique input','Hashed input','Compressed input'], a:0},
    {id:404, difficulty:2, cat:'Problem Solving', q:'Detect a cycle in a linked list. Best approach?', opts:['Hash set','Floyd\'s tortoise-hare','Sort','Reverse'], a:1},
    {id:405, difficulty:3, cat:'Knowledge', q:'Dynamic programming is best for?', opts:['Random problems','Overlapping subproblems','Linear scans','Graph only'], a:1},
    {id:406, difficulty:3, cat:'Problem Solving', q:'Find top K elements in a stream. Best structure?', opts:['Min-heap of size K','Array','Hash map','Stack'], a:0},
    {id:407, difficulty:4, cat:'Knowledge', q:'NP-hard problems — typical approach?', opts:['Exact in poly time','Approximation / heuristics','Recursion only','Ignore'], a:1},
    {id:408, difficulty:4, cat:'Problem Solving', q:'Design a URL shortener. Key tradeoff?', opts:['Speed vs storage','Colors','Font size','File format'], a:0},
    {id:409, difficulty:5, cat:'Practical', q:'System is slow at scale. Best first move?', opts:['Optimize micro','Profile to find bottleneck','Rewrite in new language','Add more servers'], a:1},
    {id:410, difficulty:5, cat:'Practical', q:'Distributed system consistency vs availability?', opts:['CAP theorem','Both always','Neither matters','Pick randomly'], a:0},
  ],
};
const ASSESS_LENGTH = 6;

function pickAdaptiveQuestion() {
  const a = state.assessment;
  if (!a) return null;
  const targetDiff = Math.max(1, Math.min(5, (a.theta || 0) + 3));
  const unused = a.pool.filter(q => !a.used.includes(q.id));
  if (unused.length === 0) return null;
  return unused.reduce((best, q) =>
    Math.abs(q.difficulty - targetDiff) < Math.abs(best.difficulty - targetDiff) ? q : best
  );
}

function startAssessment(skill) {
  const pool = ASSESSMENT_POOL[skill];
  if (!pool || pool.length === 0) {
    modal(`
      <div style="text-align:center">
        <div style="font-size:48px">🚧</div>
        <h2 class="mt8">Assessment coming soon</h2>
        <p class="muted mt8">We're still building the ${esc(skill)} question bank. It'll be available in the next release.</p>
        <div class="row mt16" style="justify-content:center">
          <button class="btn btn-primary" onclick="closeModal()">Got it</button>
        </div>
      </div>
    `);
    return;
  }
  state.assessment = {
    skill,
    pool: [...pool],
    used: [],
    currentQuestion: null,
    currentIndex: 0,
    answers: [],
    theta: 0,
    startTime: Date.now(),
    proctoring: { tabSwitches: 0 },
  };
  const visHandler = () => { if (document.hidden && state.assessment) state.assessment.proctoring.tabSwitches++; };
  document.addEventListener('visibilitychange', visHandler);
  state.assessment._visHandler = visHandler;
  state.assessment.currentQuestion = pickAdaptiveQuestion();
  nav('/student/assessment');
}

route('/student/assessment', ()=>{
  if (!state.assessment) {
    // Landing page
    const skills = Object.entries(state.skillProfile).sort(([,a], [,b]) => a.score - b.score);
    mount(shell('student','assessment','Verify Your Skills','', `
      <div class="page-head">
        <div>
          <h1>Verify Your Skills</h1>
          <p>Take a quick adaptive assessment to turn skill claims into verified evidence.</p>
        </div>
      </div>
      <div class="grid g2">
        ${skills.map(([skill, data], i) => `
          <div class="card hoverable">
            <div class="row between">
              <h3>${skill}</h3>
              <div class="row" style="gap:6px">
                ${i === 0 && !data.verified ? '<span class="match-badge" style="font-size:10px;padding:3px 8px">Suggested</span>' : ''}
                ${data.verified ? sealText('Verified') : badge('moderate','Not Verified')}
              </div>
            </div>
            <div class="row between mt8"><span class="muted">Current score</span><span class="num" style="font-weight:700">${data.score}/10</span></div>
            ${bar(data.score*10, data.verified?'sea':'')}
            <div class="row between mt8">
              <span class="muted" style="font-size:12px">Percentile: ${data.percentile}%</span>
              <span class="muted" style="font-size:12px">${data.assessedOn?'Assessed '+data.assessedOn:'Never assessed'}</span>
            </div>
            <button class="btn ${data.verified?'btn-secondary':'btn-primary'} mt16" style="width:100%"
              onclick="startAssessment('${skill}')">${data.verified?'Re-verify':'✓ Verify '+skill}</button>
          </div>
        `).join('')}
      </div>
      <div class="card mt16" style="background:var(--bg)">
        <div class="eyebrow">How skill verification works</div>
        <div class="grid g3 mt8">
          <div><strong>🎯 Adaptive</strong><p class="muted" style="font-size:12.5px">Question difficulty adjusts to your ability in real time.</p></div>
          <div><strong>✓ Evidence</strong><p class="muted" style="font-size:12.5px">Every passed assessment becomes verified proof on your passport.</p></div>
          <div><strong>🔒 Proctored</strong><p class="muted" style="font-size:12.5px">Tab switches are tracked to keep results honest.</p></div>
        </div>
      </div>
    `));
    return;
  }

  const a = state.assessment;
  const q = a.currentQuestion;

  if (!q) {
    setTimeout(finishAssessment, 100);
    return;
  }

  mount(shell('student','assessment','Assessment in Progress','', `
    <div style="max-width:680px;margin:0 auto">
      <div class="card">
        <div class="row between">
          <span class="chip">${a.skill} · ${q.cat} · Difficulty ${q.difficulty}/5</span>
          <span class="timer-chip">⏱ Q${a.currentIndex+1}/${ASSESS_LENGTH}</span>
        </div>
        <div class="mt16">${bar((a.currentIndex / ASSESS_LENGTH) * 100, 'sea')}</div>
        <div class="row between mt8">
          <span class="muted num" style="font-size:12px">Ability estimate: ${a.theta.toFixed(2)}</span>
          <span class="muted num" style="font-size:12px">${Math.round((Date.now()-a.startTime)/1000)}s elapsed</span>
        </div>
        <h2 style="margin:24px 0 20px;font-size:20px;line-height:1.4">${q.q}</h2>
        <div>${q.opts.map((o,i)=>`
          <button class="assess-opt" onclick="answerQ(${i})"><span class="letter">${'ABCD'[i]}</span>${o}</button>`).join('')}</div>
      </div>
    </div>
  `));
});

function answerQ(i) {
  const a = state.assessment;
  if (!a || !a.currentQuestion) return;
  const q = a.currentQuestion;
  const correct = i === q.a;
  a.answers.push({ qid: q.id, correct, difficulty: q.difficulty });
  a.used.push(q.id);
  const k = 0.4;
  a.theta += k * (correct ? 1 : -1) * (1 - Math.abs(a.theta - q.difficulty) / 5);
  const opts = document.querySelectorAll('.assess-opt');
  opts.forEach((el, idx) => {
    if (idx === q.a) el.classList.add('sel');
    else if (idx === i) el.classList.add('wrong');
    el.style.pointerEvents = 'none';
  });
  setTimeout(() => {
    a.currentIndex++;
    if (a.currentIndex >= ASSESS_LENGTH) {
      a.currentQuestion = null;
      finishAssessment();
    } else {
      a.currentQuestion = pickAdaptiveQuestion();
      render();
    }
  }, 600);
}

function finishAssessment() {
  const a = state.assessment;
  if (!a) return;
  if (a._visHandler) document.removeEventListener('visibilitychange', a._visHandler);
  const correctCount = a.answers.filter(x => x.correct).length;
  const total = a.answers.length;
  const rawScore = (correctCount / total) * 10;
  const avgDifficulty = a.answers.reduce((s, x) => s + x.difficulty, 0) / total;
  const difficultyBonus = (avgDifficulty - 3) * 0.3;
  const finalScore = Math.round(Math.max(0, Math.min(10, rawScore + difficultyBonus)) * 10) / 10;
  const percentile = Math.round(Math.min(99, 30 + (finalScore / 10) * 65));
  const passed = finalScore >= 7 && a.proctoring.tabSwitches <= 2;
  const existing = state.skillProfile[a.skill];
  state.skillProfile[a.skill] = {
    score: finalScore,
    verified: passed,
    assessedOn: new Date().toISOString().slice(0, 10),
    percentile,
    evidence: [...(existing?.evidence || []), 'assessment'],
    proctoring: a.proctoring,
  };
  state.lastAssessment = { skill: a.skill, score: finalScore, percentile, passed, correctCount, total, proctoring: a.proctoring, difficulty: avgDifficulty };
  const skill = a.skill;
  state.assessment = null;
  modal(`
    <div style="text-align:center">
      <div style="font-size:48px">${passed ? '🎉' : '📊'}</div>
      <h2 class="mt8">${passed ? 'Skill Verified!' : 'Assessment Complete'}</h2>
      <p class="muted">${skill} · Adaptive assessment</p>
      <div class="kpi-v num" style="font-size:52px;margin:16px 0">${finalScore}<span style="font-size:22px;color:var(--text2)">/10</span></div>
      <div class="grid g3 mt16" style="text-align:center">
        <div><div class="muted" style="font-size:11.5px">Correct</div><div class="num" style="font-weight:700;font-size:18px">${correctCount}/${total}</div></div>
        <div><div class="muted" style="font-size:11.5px">Percentile</div><div class="num" style="font-weight:700;font-size:18px">${percentile}%</div></div>
        <div><div class="muted" style="font-size:11.5px">Avg Difficulty</div><div class="num" style="font-weight:700;font-size:18px">${avgDifficulty.toFixed(1)}/5</div></div>
      </div>
      ${a.proctoring.tabSwitches > 0 ? `
        <div class="alert-strip mt16" style="background:#fffbeb;border-color:#fde68a;text-align:left">
          ⚠️ <div><strong>${a.proctoring.tabSwitches} tab switch${a.proctoring.tabSwitches>1?'es':''} detected</strong><div class="muted" style="font-size:12.5px">${a.proctoring.tabSwitches > 2 ? 'Verification withheld due to proctoring violations.' : 'Within acceptable range.'}</div></div>
        </div>` : ''}
      ${passed ? `
        <div class="alert-strip mt16" style="background:#f0fdfa;border-color:#99f6e4;text-align:left">
          ${seal()} <div><strong>Your ${skill} skill is now verified.</strong><div class="muted" style="font-size:12.5px">Industry can see your verified score on your Skill Passport.</div></div>
        </div>` : `
        <div class="alert-strip mt16" style="text-align:left">
          💡 <div><strong>Score 7+ to verify.</strong><div class="muted" style="font-size:12.5px">Review the learning module and try again.</div></div>
        </div>`}
      <div class="row mt16" style="justify-content:center;gap:10px">
        <button class="btn btn-secondary" onclick="closeModal();nav('/student/journey')">View Skill Journey</button>
        <button class="btn btn-primary" onclick="closeModal();nav('/student/dashboard')">Dashboard</button>
      </div>
    </div>
  `);
}

/* ---- Skill Journey ---- */
route('/student/journey', ()=>{
  const sp = state.skillProfile;
  const la = state.lastAssessment;
  mount(shell('student','journey','Skill Journey','', `
    ${la && la.passed ? `<div class="alert-strip" style="background:#f0fdfa;border-color:#99f6e4;margin-bottom:18px">${seal()}<div><strong>${la.skill} verified at ${la.score}/10 (${la.percentile}th percentile).</strong><div class="muted">Your evidence trail is now visible to industry.</div></div></div>`:''}
    <div class="grid" style="grid-template-columns:1.2fr 1fr;align-items:start">
      <div>
        <div class="card" style="background:linear-gradient(135deg,#0369A1,#075985);color:#fff;border:none">
          <div class="row between">
            <div><div style="opacity:.8;font-size:12px;letter-spacing:.08em;text-transform:uppercase">Python</div>
              <div style="font-family:Poppins;font-size:42px;font-weight:700" class="num">${sp.Python.score} / 10</div>
              <div style="color:#2DD4BF;font-weight:600">${sp.Python.verified?'✓ VERIFIED':'○ NOT VERIFIED'}</div>
              <div style="opacity:.75;font-size:12px;margin-top:6px">${sp.Python.percentile}th percentile · Assessed ${sp.Python.assessedOn||'—'}</div></div>
            ${seal(true)}
          </div></div>
        <div class="card mt16"><div class="eyebrow">Skill Evidence Chain</div>${evidenceChain('Python', false)}</div>
        <div class="card mt16"><div class="eyebrow">Gap Analysis</div>
          <table class="tbl"><thead><tr><th>Skill</th><th>Required</th><th>Your Level</th><th>Gap</th><th></th></tr></thead><tbody>
            ${[['Python',8,sp.Python.score,'on'],['SQL',7,sp.SQL.score,sp.SQL.score>=7?'on':'moderate'],['Communication',7,sp.Communication.score,'moderate'],['JavaScript',7,sp.JavaScript.score,'large']].map(g=>`
            <tr><td><strong>${g[0]}</strong> ${state.skillProfile[g[0]]?.verified?'<span class="seal" style="width:16px;height:16px;font-size:9px;box-shadow:none">✓</span>':''}</td>
              <td class="num">${g[1]}</td><td class="num">${g[2].toFixed(1)}</td>
              <td>${badge(g[3]==='on'?'on-track':g[3], g[3]==='on'?'On Track':g[3]==='moderate'?'Moderate':'Large')}</td>
              <td>${g[3]==='on'?'—':`<button class="btn btn-secondary btn-sm" onclick="startAssessment('${g[0]}')">Assess Now</button>`}</td></tr>`).join('')}
          </tbody></table></div>
      </div>
      <div class="card"><div class="eyebrow">Skill DNA</div>
        ${radarChart([Object.values(sp).map(s=>s.score*10)],['Python','SQL','JS','Comm.','PS'])}
        <div class="radar-legend mt8">
          <div class="row" style="gap:8px"><span style="width:12px;height:12px;border-radius:3px;background:#0EA5E9"></span>You</div>
          <div class="row" style="gap:8px"><span style="width:12px;height:12px;border-radius:3px;background:#E2E8F0"></span>Industry requirement</div>
        </div>
        <div class="divider"></div>
        <p class="muted" style="font-size:13px">You're a <strong>Backend Builder</strong> — Python is your strongest verified skill (top ${100-sp.Python.percentile}% of cohort).</p>
        <button class="btn btn-primary mt8" style="width:100%" onclick="nav('/student/opportunities')">Find Matching Roles</button>
        <button class="btn btn-secondary mt8" style="width:100%" onclick="nav('/student/portfolio')">View Shareable Passport</button>
      </div>
    </div>
  `));
});

/* ---- Opportunities ---- */
route('/student/opportunities', ()=>{
  const opps = OPPS.map(oppWithMatch).sort((a,b)=>b.match-a.match);
  mount(shell('student','opportunities','Opportunities','', `
    <div class="grid" style="grid-template-columns:250px 1fr;align-items:start">
      <div class="card" style="position:sticky;top:80px">
        <div class="filter-group"><h4>Opportunity Type</h4>
          ${['Internship','Placement','Hackathon'].map(t=>`<label class="filter-opt"><input type="checkbox" checked>${t}</label>`).join('')}</div>
        <div class="filter-group"><h4>Location</h4>
          ${['Mumbai','Bengaluru','Chennai','Pune','Hyderabad'].map(t=>`<label class="filter-opt"><input type="checkbox">${t}</label>`).join('')}</div>
        <div class="filter-group"><h4>Required Skills</h4>
          ${['Python','SQL','JavaScript','Data Analytics'].map(t=>`<label class="filter-opt"><input type="checkbox">${t}</label>`).join('')}</div>
        <button class="btn btn-primary btn-sm" style="width:100%" onclick="toast('Filters applied')">Apply Filters</button>
      </div>
      <div class="grid g2">${opps.map(o=>oppCard(o, appState(o.id))).join('')}</div>
    </div>
    <p class="muted mt16" style="font-size:12.5px">💡 Match scores are <strong>computed live</strong> from your verified skills, CGPA, location preference, and assessment recency. Click <em>Why this match?</em> to see the breakdown.</p>
  `));
});

/* ---- Application Tracker ---- */
const KCOLS = [['applied','Applied'],['shortlisted','Shortlisted'],['interview','Interview'],['offered','Offered']];
route('/student/applications', ()=>{
  mount(shell('student','applications','Application Tracker','', `
    <div class="kanban">${KCOLS.map(([k,label])=>`
      <div class="kcol"><div class="kcol-head">${label} <span class="chip num" style="margin-left:auto">${state.applications.filter(a=>a.status===k).length}</span></div>
        ${state.applications.filter(a=>a.status===k).map(a=>`
          <div class="kcard ${k}">
            <div class="row between"><strong>${a.company}</strong>${matchBadge(a.match||0)}</div>
            <div class="muted" style="margin:4px 0 8px">${a.role}</div>
            <div class="row between">${k==='offered'?sealText('Offer Received'):badge(k)}
              <span class="muted" style="font-size:12px">${a.loc}</span></div>
          </div>`).join('')||'<div class="muted" style="text-align:center;padding:20px 0;font-size:12px">No applications yet</div>'}
      </div>`).join('')}</div>
    <p class="muted mt16" style="font-size:12.5px">↔ Industry status changes update this board in real time. Try switching to the <a href="#/industry/applicants"><strong>Industry role</strong></a> and changing Priya's status.</p>
  `));
});

/* ---- Portfolio / Skill Passport ---- */
route('/student/portfolio', ()=>{
  const sp = state.skillProfile;
  const passportUrl = `https://skillbridge.app/passport/priya-sharma`;
  mount(shell('student','portfolio','Skill Passport','', `
    <div class="card" style="background:linear-gradient(135deg,#0369A1,#0EA5E9);color:#fff;border:none">
      <div class="row"><span class="avatar" style="width:56px;height:56px;font-size:18px;background:rgba(255,255,255,.2)">PS</span>
        <div><h1 style="color:#fff;font-size:24px">Priya Sharma</h1><div style="opacity:.9">Aspiring Software Developer · CGPA ${state.studentProfile.cgpa} · ${state.studentProfile.university}</div></div>
        <div style="margin-left:auto">${sealText(Object.values(sp).filter(s=>s.verified).length + ' skills verified')}</div></div></div>

    <div class="card mt16" style="background:linear-gradient(135deg,#f0fdfa,#e0f2fe);border-color:#99f6e4">
      <div class="row between wrap" style="gap:16px">
        <div>
          <div class="eyebrow">Shareable Skill Passport</div>
          <div class="num" style="font-family:'Courier New',monospace;font-size:14px;color:var(--ocean);font-weight:600">${passportUrl}</div>
          <div class="muted" style="font-size:12.5px;margin-top:4px">Anyone with this link can verify your skills — no login required.</div>
        </div>
        <div class="row" style="gap:8px">
          <button class="btn btn-secondary btn-sm" onclick="navigator.clipboard?.writeText('${passportUrl}');toast('Passport URL copied ✓')">📋 Copy Link</button>
          <button class="btn btn-primary btn-sm" onclick="toast('Opening passport preview')">👁 Preview</button>
          <button class="btn btn-secondary btn-sm" onclick="toast('QR code generated — embed in resume')">📱 QR Code</button>
        </div>
      </div>
    </div>

    <div class="tabs" style="margin-top:20px">
      ${['Skill Passport','Projects','Endorsements','Timeline'].map((t,i)=>`<button class="tab ${i===0?'active':''}" onclick="switchTab(this,${i})">${t}</button>`).join('')}
    </div>
    <div id="ptab-0">
      <div class="grid g2">
        ${Object.entries(sp).map(([skill, data]) => `
          <div class="card">
            <div class="row between"><h2>${skill.toUpperCase()}</h2><span class="kpi-v num">${data.score}/10</span></div>
            <div class="mt8">${data.verified?sealText('VERIFIED · '+data.assessedOn):badge('moderate','Verification Pending')}</div>
            <div class="muted mt8" style="font-size:12px">Percentile: ${data.percentile}% · Evidence: ${data.evidence.length} item${data.evidence.length!==1?'s':''}</div>
            <div class="divider"></div>
            ${data.evidence.map(e => `
              <div class="row" style="gap:9px;padding:5px 0"><span class="seal" style="width:20px;height:20px;font-size:10px;box-shadow:none">✓</span>${e}</div>
            `).join('')}
            ${!data.verified?`<button class="btn btn-primary mt8" style="width:100%" onclick="startAssessment('${skill}')">Complete Verification</button>`:''}
          </div>
        `).join('')}
      </div>
    </div>
    <div id="ptab-1" style="display:none">
      <div class="grid g3">
        <div class="card hoverable"><div class="row between"><h3>Campus Placement Tracker</h3>${seal()}</div>
          <p class="muted mt8">Full-stack tracker for campus drives with coordinator dashboard.</p>
          <div class="row wrap mt8">${tag('Python')}${tag('SQL')}${tag('Data Viz')}</div>
          <div class="mt8">${sealText('AI-analyzed · Verified Project')}</div></div>
        <div class="card hoverable"><div class="row between"><h3>Expense Tracker CLI</h3>${seal()}</div>
          <p class="muted mt8">Practice challenge — categorized expenses with persistent storage.</p>
          <div class="row wrap mt8">${tag('Python')}</div>
          <div class="mt8">${sealText('Practice Evidence')}</div></div>
        <div class="card empty"><div class="big">＋</div><strong>Start your next project</strong><button class="btn btn-secondary mt8" onclick="nav('/student/project')">New Project</button></div>
      </div>
    </div>
    <div id="ptab-2" style="display:none">
      <div class="grid g2">
        <div class="card"><div class="row" style="gap:12px"><span class="avatar" style="width:40px;height:40px">AM</span><div><strong>Arjun Mehta</strong><div class="muted" style="font-size:12px">TCS · Mentor</div></div></div>
          <p class="muted mt8" style="font-style:italic">"Priya's Python fundamentals are excellent. She asks thoughtful questions and ships working code."</p>
          <div class="mt8">${sealText('Endorsed Python')}</div></div>
        <div class="card"><div class="row" style="gap:12px"><span class="avatar" style="width:40px;height:40px">VR</span><div><strong>Vikram Reddy</strong><div class="muted" style="font-size:12px">Infosys · Mentor</div></div></div>
          <p class="muted mt8" style="font-style:italic">"Strong problem-solving approach. Her SQL skills are developing well."</p>
          <div class="mt8">${sealText('Endorsed Problem Solving')}</div></div>
      </div>
    </div>
    <div id="ptab-3" style="display:none"><div class="card"><div class="tl">
      <div class="tl-item done"><strong>Python verified at 8.5/10</strong><div class="muted">Adaptive assessment · 92nd percentile · Sep 2026</div></div>
      <div class="tl-item done"><strong>Project analyzed by AI</strong><div class="muted">Campus Placement Tracker · 5 skills detected · Sep 2026</div></div>
      <div class="tl-item done"><strong>Mentor endorsement received</strong><div class="muted">Arjun Mehta (TCS) · Aug 2026</div></div>
      <div class="tl-item done"><strong>12 practice challenges completed</strong><div class="muted">Python + SQL · Aug 2026</div></div>
    </div></div></div>
  `));
});

/* ---- Grow Hub ---- */
route('/student/grow', ()=>{
  mount(shell('student','grow','Grow','', `
    <div class="grow-grid">
      <div class="card" style="background:linear-gradient(135deg,#0EA5E9,#0369A1);color:#fff;border:none;grid-column:1/-1">
        <div class="row between wrap" style="gap:14px">
          <div><div style="opacity:.85;font-size:12px;letter-spacing:.08em;text-transform:uppercase">Innovation Challenge</div>
            <h1 style="color:#fff;font-size:26px">Build for Bharat 🇮🇳</h1>
            <div style="opacity:.9;margin-top:4px">Team of 3 · Prize ₹1,00,000 · ${tag('Python')} ${tag('AI')} ${tag('Data Analytics')}</div></div>
          <div style="text-align:center"><div class="num" style="font-family:Poppins;font-size:30px;font-weight:700">12d : 08h : 42m</div>
            <button class="btn btn-sea mt8" onclick="suggestTeam()">Join Challenge</button></div>
        </div></div>
      <div class="card"><div class="eyebrow">AI Mentor Matches</div>
        ${state.mentors.map(m=>{
          const studentSkills = Object.keys(state.skillProfile);
          const overlap = m.skills.filter(s => studentSkills.includes(s)).length;
          const matchScore = 60 + overlap * 12 + (m.rating - 4) * 20;
          return `
        <div class="row between" style="padding:10px 0;border-bottom:1px solid var(--border)">
          <div class="row"><span class="avatar" style="width:38px;height:38px">${m.name.split(' ').map(x=>x[0]).join('')}</span>
            <div><strong>${m.name}</strong>
              <div class="muted" style="font-size:12px">${m.company} · ${m.exp} · ⭐ ${m.rating} (${m.endorsements} endorsements)</div>
              <div class="muted" style="font-size:11.5px;margin-top:2px;font-style:italic">${m.bio}</div>
              <div class="row wrap mt8">${m.skills.map(tag).join('')}</div></div></div>
          <div style="text-align:right">
            <div class="match-badge" style="font-size:11px;padding:3px 8px">${Math.min(99,Math.round(matchScore))}% fit</div>
            ${m.status==='none'?`<button class="btn btn-primary btn-sm mt8" onclick="requestMentor(${m.id})">Request</button>`
              :m.status==='pending'?badge('shortlisted','Pending'):sealText('Confirmed')}
          </div>
        </div>`;
        }).join('')}
      </div>
      <div class="card"><div class="eyebrow">Workshops & Events</div>
        ${[['Oct 04','Zoho Full-Stack Workshop','Chennai campus'],['Oct 18','Campus AI Challenge','TCS · 300 seats'],['Nov 02','Wipro FDP Preview','Online']].map(e=>`
        <div class="row" style="padding:9px 0;border-bottom:1px solid var(--border);gap:14px">
          <span class="chip num" style="flex:none">${e[0]}</span><div><strong style="font-size:13.5px">${e[1]}</strong><div class="muted" style="font-size:12px">${e[2]}</div></div></div>`).join('')}
        <button class="btn btn-secondary mt16" style="width:100%" onclick="toast('Calendar invite added')">View Full Calendar</button>
      </div>
      <div class="card"><div class="eyebrow">Study Circles</div>
        ${[['Python Study Circle','24 members · weekly'],['SQL Practice Group','18 members · twice a week'],['DSA Weekend Group','31 members · Saturdays']].map(s=>`
        <div class="row between" style="padding:10px 0;border-bottom:1px solid var(--border)">
          <div><strong style="font-size:13.5px">${s[0]}</strong><div class="muted" style="font-size:12px">${s[1]}</div></div>
          <button class="btn btn-secondary btn-sm" onclick="toast('Joined ${s[0]}')">Join</button></div>`).join('')}
      </div>
    </div>
  `));
});

function requestMentor(id){
  const m = state.mentors.find(x=>x.id===id);
  m.status='pending';
  state.notifications.industry.unshift({ico:'🎓', text:`Priya Sharma requested mentorship with ${m.name}.`, time:'just now', unread:true});
  toast('Mentorship request sent to '+m.name);
  setTimeout(render, 600);
}

function suggestTeam() {
  const others = state.peers;
  const team = others
    .map(t => ({ ...t, complement: Object.entries(t.skills).reduce((s, [k,v]) => s + (v > 7 ? 1 : 0), 0) }))
    .sort((a,b) => b.complement - a.complement)
    .slice(0, 2);
  modal(`
    <h2>🤖 AI-Suggested Team</h2>
    <p class="muted">For <strong>Build for Bharat</strong> — balanced by complementary skills.</p>
    <div class="card mt16" style="background:var(--bg)">
      <div class="row between"><div class="row"><span class="avatar" style="width:32px;height:32px;font-size:11px">PS</span><div><strong>You (Priya Sharma)</strong><div class="muted" style="font-size:12px">Python 8.5 · SQL 6.4</div></div></div>${badge('verified','Team Lead')}</div>
    </div>
    ${team.map(t => `
      <div class="card mt8">
        <div class="row between">
          <div class="row"><span class="avatar" style="width:36px;height:36px;font-size:12px">#${t.id}</span>
            <div><strong>${t.name}</strong><div class="muted" style="font-size:12px">${t.branch} · CGPA ${t.cgpa}</div></div></div>
          <button class="btn btn-primary btn-sm" onclick="toast('Team invite sent to ${t.name}')">Invite</button>
        </div>
        <div class="mt8">${Object.entries(t.skills).map(([s,v])=>`<span class="row" style="gap:4px;display:inline-flex;margin-right:10px;font-size:12px">${t.verified.includes(s)?'<span style="color:#0f766e">✓</span>':'<span style="color:#94a3b8">○</span>'}${s} ${v}</span>`).join('')}</div>
      </div>
    `).join('')}
    <div class="alert-strip mt16" style="background:#f0fdfa;border-color:#99f6e4">
      ${seal()} <div><strong>Team completeness: 3/3 roles filled</strong><div class="muted" style="font-size:12.5px">You handle backend · teammates fill UI and data</div></div>
    </div>
    <div class="row mt16" style="justify-content:flex-end;gap:10px">
      <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="closeModal();toast('Team confirmed! Good luck 🚀')">Confirm Team</button>
    </div>
  `);
}

/* ================= INDUSTRY ================= */
route('/industry/dash', ()=>{
  mount(shell('industry','dash','Dashboard','', `
    <div class="grid g4">
      ${[['Total Applicants','142','+12 this week'],['Average Match %','81%','+3% vs last drive'],['Shortlisted','18','4 interviews booked'],['Offers Extended','5','Seafoam = success']].map(k=>`
      <div class="card hoverable"><div class="muted" style="font-size:12.5px">${k[0]}</div><div class="kpi-v num">${k[1]}</div><div class="kpi-d">${k[2]}</div></div>`).join('')}
    </div>
    <div class="section-title"><h2>Live Opportunity — Software Engineering Intern</h2><a href="#/industry/applicants" class="btn btn-primary btn-sm">Review Applicants →</a></div>
    <div class="card"><div class="row wrap">${tag('Python · min 8/10')}${tag('SQL · min 7/10')}${tag('Communication · min 6/10')}</div>
      <p class="muted mt8">Matching against <strong>verified</strong> student skills only. Unverified skills are weighted lower.</p>
      <div class="funnel mt16">${[['Applied',142,100],['Shortlisted',18,52],['Interview',9,38],['Offered',5,28],['Placed',3,20]].map(f=>`
        <div class="fstage num" style="width:${f[2]}%">${f[0]} — ${f[1]}</div>`).join('')}</div></div>
  `));
});

route('/industry/post', ()=>{
  mount(shell('industry','post','Post Opportunity','', `
    <div style="max-width:760px;margin:0 auto">
      <div class="steps">${['Details','Required Skills','Eligibility','Review & Publish'].map((s,i)=>`<div class="step ${i===0?'active':''}">${i+1}. ${s}</div>`).join('')}</div>
      <div class="card">
        <div class="grid g2">
          <div class="field"><label>Company</label><input value="TCS"></div>
          <div class="field"><label>Role</label><input value="Software Engineering Intern"></div>
          <div class="field"><label>Location</label><input value="Mumbai"></div>
          <div class="field"><label>Stipend</label><input value="₹25,000/month"></div>
          <div class="field"><label>Duration</label><input value="6 months"></div>
          <div class="field"><label>Opportunity Type</label><select><option>Internship</option><option>Placement</option></select></div>
        </div>
        <div class="field"><label>Description</label><textarea>Work with the engineering team on production systems in Python and SQL. Mentorship provided; conversion path to full-time.</textarea></div>
        <div class="divider"></div>
        <h3>Required Skills & Minimum Level</h3>
        ${[['Python',8],['SQL',7],['Communication',6]].map(s=>`
        <div class="row between" style="padding:9px 0"><span style="font-weight:500">${s[0]}</span>
          <span class="dots">${Array.from({length:10},(_,i)=>`<span class="dot ${i<s[1]?'on':''}" onclick="this.parentElement.querySelectorAll('.dot').forEach((d,j)=>d.classList.toggle('on',j<=${i}))"></span>`).join('')}</span></div>`).join('')}
        <div class="divider"></div>
        <h3>Eligibility</h3>
        <div class="grid g2 mt8">
          <div class="field"><label>Minimum CGPA</label><input value="7.5"></div>
          <div class="field"><label>Graduation Year</label><input value="2027"></div>
          <div class="field"><label>Branches</label><input value="CSE, IT, BCA"></div>
          <div class="field"><label>Location Preference</label><input value="Mumbai / Remote hybrid"></div>
        </div>
        <div class="alert-strip mt8">ℹ️ <span>Your opportunity will match against <strong>demonstrated and verified</strong> student skills.</span></div>
        <div class="row mt16" style="justify-content:flex-end;gap:10px">
          <button class="btn btn-ghost" onclick="toast('Draft saved')">Save Draft</button>
          <button class="btn btn-primary" onclick="toast('Opportunity published — students can now apply 🎉')">Publish Opportunity</button></div>
      </div>
    </div>
  `));
});

const APPLICANTS = [
  {name:'Priya Sharma', cgpa:'8.6', skills:[['Python',8.5,1],['SQL',6.4,0],['Communication',6.1,0]], status:'interview', university:'ABC University'},
  {name:'Rahul Deshmukh', cgpa:'8.2', skills:[['Python',8.2,1],['SQL',7.1,1],['Communication',7.4,0]], status:'shortlisted', university:'XYZ Institute'},
  {name:'Ananya Rao', cgpa:'8.9', skills:[['Python',8.8,1],['SQL',8.2,1],['Communication',7.9,0]], status:'applied', university:'ABC University'},
  {name:'Karthik Nair', cgpa:'7.8', skills:[['Python',7.1,1],['SQL',5.4,0],['Communication',6.8,0]], status:'applied', university:'PQR College'},
];

route('/industry/applicants', ()=>{
  const opp = OPPS[0];
  const enriched = APPLICANTS.map(a => {
    const skillProfile = {};
    a.skills.forEach(([s,v,ver]) => skillProfile[s] = { score: v, verified: !!ver, assessedOn: ver ? '2026-09-15' : null });
    const m = computeMatch({ cgpa: parseFloat(a.cgpa), preferredLocation: 'Mumbai' }, skillProfile, opp);
    return { ...a, match: m.score, matchDetails: m };
  }).sort((a,b) => b.match - a.match);
  mount(shell('industry','applicants','Applicants','', `
    <div class="grid g4">
      ${[['Total Applicants','142'],['Average Match %', Math.round(enriched.reduce((s,a)=>s+a.match,0)/enriched.length)+'%'],['Shortlisted','18'],['Interviews','9']].map(k=>`
      <div class="card"><div class="muted" style="font-size:12.5px">${k[0]}</div><div class="kpi-v num">${k[1]}</div></div>`).join('')}
    </div>
    <div class="card mt16" style="padding:0;overflow:hidden">
      <table class="tbl"><thead><tr><th>Applicant</th><th>Match</th><th>CGPA</th><th>Verified Skills</th><th>Skill Compatibility</th><th>Status</th></tr></thead><tbody>
      ${enriched.map((a,i)=>`
        <tr><td><div class="row"><span class="avatar" style="width:32px;height:32px;font-size:11px">${a.name.split(' ').map(x=>x[0]).join('')}</span><div><strong>${a.name}</strong><div class="muted" style="font-size:11.5px">${a.university} · 2027</div></div></div></td>
        <td><span class="match-badge num" style="font-size:12px;padding:4px 10px;cursor:pointer" onclick="showApplicantMatch('${a.name}')">${a.match}%</span></td>
        <td class="num">${a.cgpa}</td>
        <td>${a.skills.map(s=>`<span class="row" style="gap:4px;display:inline-flex;margin-right:10px;font-size:12.5px">${s[2]?'<span style="color:#0f766e">✓</span>':'<span style="color:#94a3b8">○</span>'}${s[0]} ${s[1]}</span>`).join('')}</td>
        <td style="min-width:130px">${bar(a.match,a.match>85?'sea':a.match>80?'':'amber')}</td>
        <td><select class="status-select" onchange="setApplicantStatus(${i}, this.value)">
          ${KCOLS.map(([k,l])=>`<option value="${k}" ${a.status===k?'selected':''}>${l}</option>`).join('')}
          <option value="rejected" ${a.status==='rejected'?'selected':''}>Rejected</option></select></td></tr>`).join('')}
      </tbody></table></div>
    <p class="muted mt16" style="font-size:12.5px">↔ Match scores computed from verified skills, CGPA, location, and assessment recency. Click any match badge to see the breakdown.</p>
  `));
});

function showApplicantMatch(name) {
  const a = APPLICANTS.find(x => x.name === name);
  if (!a) return;
  const skillProfile = {};
  a.skills.forEach(([s,v,ver]) => skillProfile[s] = { score: v, verified: !!ver, assessedOn: ver ? '2026-09-15' : null });
  const m = computeMatch({ cgpa: parseFloat(a.cgpa), preferredLocation: 'Mumbai' }, skillProfile, OPPS[0]);
  modal(`
    <h2>${a.name}</h2>
    <p class="muted">${a.university} · CGPA ${a.cgpa}</p>
    <div class="match-score-big">${m.score}%</div>
    <div class="divider"></div>
    <h3>Score Composition</h3>
    ${Object.entries(m.breakdown).map(([k,v])=>`
      <div class="skill-row">
        <span class="sname" style="width:130px;text-transform:capitalize">${k.replace(/([A-Z])/g,' $1')}</span>
        ${bar(v, v>=80?'sea':v>=60?'':'amber')}
        <span class="sval num">${v}%</span>
      </div>`).join('')}
    <div class="divider"></div>
    <h3>Skill Evidence</h3>
    ${m.skillBreakdown.map(b=>`
      <div class="row between" style="padding:7px 0;border-bottom:1px solid var(--border)">
        <div><strong>${b.skill}</strong>${b.verified?' <span class="seal" style="width:16px;height:16px;font-size:9px;box-shadow:none">✓</span>':''}</div>
        <div class="muted num" style="font-size:12.5px">${b.studentLevel}/10 (need ${b.requiredLevel})</div>
        <div>${b.meets?badge('on-track','Meets'):badge('moderate','−'+b.gap)}</div>
      </div>`).join('')}
    <div class="row mt16" style="justify-content:flex-end">
      <button class="btn btn-secondary" onclick="closeModal()">Close</button>
      <button class="btn btn-primary" onclick="toast('Shortlist request sent');closeModal()">Shortlist</button>
    </div>
  `);
}

function setApplicantStatus(i, status){
  const a = APPLICANTS[i];
  const name = a.name;
  a.status = status;
  if(name==='Priya Sharma'){
    const app = state.applications.find(x=>x.company==='TCS');
    if(app){ app.status = status; }
    state.notifications.student.unshift({ico:'💼', text:`TCS moved your application to ${status.charAt(0).toUpperCase()+status.slice(1)}.`, time:'just now', unread:true});
  }
  toast(`${name} → ${status.charAt(0).toUpperCase()+status.slice(1)} · student notified`);
}

/* ---- Learning Programs ---- */
route('/industry/programs', ()=>{
  mount(shell('industry','programs','Learning Programs','', `
    <div class="grid" style="grid-template-columns:380px 1fr;align-items:start">
      <div class="card"><h2>Publish a Program</h2>
        <div class="field mt16"><label>Program Title</label><input value="Industry-led JavaScript & Full-Stack Bootcamp"></div>
        <div class="grid g2"><div class="field"><label>Type</label><select><option>Workshop</option><option>Certification</option><option>Mentorship</option></select></div>
        <div class="field"><label>Duration</label><input value="4 weeks"></div></div>
        <div class="field"><label>Skills Covered</label><input value="JavaScript, Full-Stack, APIs"></div>
        <div class="grid g2"><div class="field"><label>Eligibility</label><input value="3rd year, CGPA 7+"></div>
        <div class="field"><label>Apply-by</label><input value="25 Sep 2026"></div></div>
        <div class="field"><label>Description</label><textarea>Hands-on bootcamp covering modern JavaScript, React basics, and API integration.</textarea></div>
        <button class="btn btn-primary" style="width:100%" onclick="toast('Program published')">Publish Program</button>
      </div>
      <div class="grid g2">
        ${[['JavaScript & Full-Stack Bootcamp','Workshop · 4 weeks',['JavaScript','Full-Stack','APIs'],'120 interested'],['Python for Data Roles','Certification · 6 weeks',['Python','Data Analytics'],'86 interested'],['System Design Mentorship','Mentorship · 8 weeks',['System Design','SQL'],'34 interested']].map(p=>`
        <div class="card hoverable"><div class="row between"><h3>${p[0]}</h3><span class="chip num">${p[3].split(' ')[0]}</span></div>
          <div class="muted mt8">${p[1]}</div><div class="row wrap mt8">${p[2].map(tag).join('')}</div></div>`).join('')}
      </div>
    </div>
  `));
});

/* ---- Engage Talent ---- */
route('/industry/engage', ()=>{
  const pendingMentor = state.mentors.some(m=>m.status==='pending');
  mount(shell('industry','engage','Engage Talent','', `
    <div class="grid g2">
      <div class="card"><div class="eyebrow">Guest Lecture Scheduler</div>
        <div class="grid g2 mt8"><div class="field"><label>Date</label><input value="18 Sep 2026"></div>
        <div class="field"><label>Campus</label><input value="ABC University"></div></div>
        <div class="field"><label>Topic</label><input value="Production Engineering Careers at TCS"></div>
        <div class="field"><label>Expected Audience</label><input value="300 students"></div>
        <button class="btn btn-primary" onclick="toast('Guest lecture scheduled ✓')">Schedule Lecture</button></div>
      <div class="card"><div class="eyebrow">Challenge / Hackathon Console</div>
        <div class="field mt8"><label>Banner Upload</label><div class="empty" style="border:2px dashed var(--border);border-radius:12px;padding:18px">🖼️ Drop banner or click to upload</div></div>
        <div class="grid g2"><div class="field"><label>Prize</label><input value="₹1,00,000"></div>
        <div class="field"><label>Dates</label><input value="18 Oct 2026"></div></div>
        <div class="field"><label>Skills</label><input value="Python, AI, Data Analytics"></div>
        <button class="btn btn-primary" onclick="toast('Challenge published to Grow hubs 🚀')">Publish Challenge</button></div>
    </div>
    <div class="grid g2 mt16">
      <div class="card"><div class="row between"><div class="eyebrow" style="margin:0">Mentorship Program Management</div>${pendingMentor?badge('shortlisted','1 pending'):''}</div>
        <table class="tbl mt8"><thead><tr><th>Student</th><th>Focus</th><th>Hours</th><th>Progress</th><th>Status</th><th></th></tr></thead><tbody>
        <tr><td><strong>Priya Sharma</strong></td><td>Python mentorship</td><td class="num">6</td><td style="min-width:90px">${bar(68)}</td><td>${badge('active','Active')}</td><td></td></tr>
        ${state.mentors.filter(m=>m.status==='pending').map(m=>`
        <tr style="background:#fffbeb"><td><strong>Priya Sharma</strong></td><td>${m.skills[0]} mentorship</td><td class="num">0</td><td>—</td><td>${badge('shortlisted','Pending')}</td>
          <td><button class="btn btn-primary btn-sm" onclick="acceptMentor(${m.id})">Accept</button></td></tr>`).join('')}
        </tbody></table></div>
      <div class="card"><div class="eyebrow">MoU / Collaboration Request Inbox</div>
        ${[['🏛️','ABC University sent an MOU request','Renewal + joint research lab','none'],['🎤','Dr. Lakshmi Iyer requested a guest lecture','Topic: ML in Healthcare','pending']].map((r,i)=>`
        <div class="row between" style="padding:11px 0;border-bottom:1px solid var(--border)">
          <div class="row" style="gap:10px;align-items:flex-start"><span style="font-size:18px">${r[0]}</span><div><strong style="font-size:13.5px">${r[1]}</strong><div class="muted" style="font-size:12px">${r[2]}</div></div></div>
          ${state.guestReq==='accepted'&&i===1?sealText('Scheduled'):`<button class="btn btn-secondary btn-sm" onclick="respondRequest(${i})">${i===0?'Review':'Accept / Schedule'}</button>`}
        </div>`).join('')}
      </div>
    </div>
  `));
});

function acceptMentor(id){
  const m = state.mentors.find(x=>x.id===id);
  m.status='confirmed';
  state.notifications.student.unshift({ico:'🤝', text:`Your mentor request was accepted by ${m.name}.`, time:'just now', unread:true});
  toast(`Mentorship confirmed with Priya Sharma ✓`);
  setTimeout(render, 600);
}
function respondRequest(i){
  if(i===1){ state.guestReq='accepted';
    state.notifications.academician.unshift({ico:'🎤', text:'TCS accepted your guest lecture request.', time:'just now', unread:true});
    toast('Guest lecture scheduled with Dr. Lakshmi Iyer ✓');
  } else { toast('MoU request opened for review'); }
  setTimeout(render, 600);
}

/* ================= ACADEMICIAN ================= */
route('/academician/home', ()=>{
  mount(shell('academician','home','Faculty Portal','', `
    <div class="page-head"><div><h1>Welcome, Dr. Lakshmi Iyer</h1><p>Professor, Computer Science · ABC University · AI/ML research group</p></div></div>
    <div class="grid g3">
      ${[['📜','FDP Listings','8 upcoming programs','#/academician/fdp'],['🏭','Faculty Internships','3 industry openings','#/academician/home'],['💼','Consultancy Projects','2 active · 1 in discussion','#/academician/research'],['🔬','Collaborative Research','Co-PI opportunities','#/academician/research'],['🎤','Industry Opportunities','Guest lectures & sabbaticals','#/academician/home'],['📈','Upskill Track','64% of annual CPD goal','#/academician/fdp']].map(c=>`
      <a class="card hoverable" href="${c[3]}" style="color:inherit"><div style="font-size:24px">${c[0]}</div><h3 class="mt8">${c[1]}</h3><div class="muted">${c[2]}</div></a>`).join('')}
    </div>
    <div class="section-title"><h2>Recommended For You</h2></div>
    <div class="grid g3">
      <div class="card hoverable"><div class="row between"><h3>Advanced ML for Healthcare</h3><span class="chip">FDP</span></div>
        <div class="muted mt8">IIT Madras · 2 weeks · Apply by 30 Sep 2026 · Industry partner: Infosys</div>
        <button class="btn btn-primary mt16" onclick="nav('/academician/fdp')">View & Apply</button></div>
      <div class="card hoverable"><div class="row between"><h3>AI-Assisted Healthcare Analytics</h3><span class="badge moderate">Co-PI Wanted</span></div>
        <div class="muted mt8">₹12L funding · 18 months · Python · ML · Data Analytics</div>
        <button class="btn btn-secondary mt16" onclick="nav('/academician/research')">Express Interest</button></div>
      <div class="card hoverable"><div class="row between"><h3>Industry Sabbatical — Zoho</h3><span class="chip">6 months</span></div>
        <div class="muted mt8">Work with the Zoho Analytics team on production ML systems.</div>
        <button class="btn btn-secondary mt16" onclick="toast('Sabbatical application started')">Apply</button></div>
    </div>
  `));
});

route('/academician/fdp', ()=>{
  mount(shell('academician','fdp','Faculty Development Programs','', `
    <div class="grid" style="grid-template-columns:1.3fr 1fr;align-items:start">
      <div class="card"><div class="eyebrow">FDP Detail</div>
        <h1 style="font-size:24px">Advanced Machine Learning for Healthcare</h1>
        <div class="muted">IIT Madras · 06–19 Oct 2026 · Apply by 30 Sep 2026</div>
        <div class="divider"></div>
        <div class="grid g2">
          <div><h4 class="eyebrow">Topics Covered</h4>${['Clinical prediction models','Explainable AI in medicine','Healthcare data pipelines','MLOps for regulated domains'].map(t=>`<div class="row" style="gap:8px;padding:4px 0">• ${t}</div>`).join('')}</div>
          <div><h4 class="eyebrow">Details</h4>
            <div class="muted">Faculty eligibility: Assistant Prof & above</div>
            <div class="muted mt8">Industry partner: Infosys</div>
            <div class="muted mt8">Certificate: Verifiable on SkillBridge</div>
            <div class="muted mt8">Seats: 40 · Mode: Hybrid</div></div>
        </div>
        <div class="row mt16" style="justify-content:flex-end;gap:10px">
          <button class="btn btn-ghost" onclick="toast('Saved to your FDP list')">Save</button>
          <button class="btn btn-primary" onclick="toast('FDP application submitted ✓')">Apply for FDP</button></div>
      </div>
      <div class="card"><div class="eyebrow">FDP Calendar</div>
        ${[['30 Sep','Apply-by · Advanced ML for Healthcare','IIT Madras'],['04 Oct','Zoho Full-Stack Workshop','Chennai'],['02 Nov','Wipro FDP · Data Engineering','Apply by 20 Oct']].map(e=>`
        <div class="row" style="gap:12px;padding:10px 0;border-bottom:1px solid var(--border)">
          <span class="chip num" style="flex:none">${e[0]}</span><div><strong style="font-size:13.5px">${e[1]}</strong><div class="muted" style="font-size:12px">${e[2]}</div></div></div>`).join('')}
      </div>
    </div>
  `));
});

route('/academician/research', ()=>{
  mount(shell('academician','research','Research & Upskill','', `
    <div class="master-detail">
      <div class="card" style="padding:10px">
        ${[['Research Projects','3'],['FDPs','2'],['Consultancy','1'],['Industry Sabbaticals','1']].map((c,i)=>`
        <div class="md-item ${i===0?'sel':''}" onclick="document.querySelectorAll('.md-item').forEach(x=>x.classList.remove('sel'));this.classList.add('sel')">
          <strong style="font-size:13.5px">${c[0]}</strong><div class="muted" style="font-size:12px">${c[1]} items</div></div>`).join('')}
      </div>
      <div class="card">
        <div class="row between"><h2>AI-Assisted Healthcare Analytics</h2><span class="badge moderate">Co-PI Wanted</span></div>
        <div class="muted mt8">Collaborative research with Infosys HealthTech · ABC University</div>
        <div class="row wrap mt8">${tag('Python')}${tag('Machine Learning')}${tag('Data Analytics')}</div>
        <div class="divider"></div>
        <div class="grid g3">
          <div><div class="eyebrow">Funding</div><div class="kpi-v num">₹12L</div></div>
          <div><div class="eyebrow">Duration</div><div class="kpi-v num">18 mo</div></div>
          <div><div class="eyebrow">Team</div><div class="kpi-v">4–6</div></div>
        </div>
        <p class="muted mt8">Build interpretable clinical prediction models on anonymized hospital data.</p>
        <div class="row mt16" style="gap:10px">
          <button class="btn btn-primary" onclick="toast('Interest expressed — Infosys research team notified 🔬')">Express Interest</button>
          <button class="btn btn-secondary" onclick="toast('Full proposal PDF downloaded')">View Proposal</button></div>
        <div class="divider"></div>
        <h3>Consultancy Tracker</h3>
        <div class="funnel" style="align-items:flex-start">${['Discussion','Proposal','Signed'].map((s,i)=>`
          <div class="fstage" style="width:${100-i*22}%;${i===2?'opacity:.35;background:#e2e8f0;color:#475569':''}">${s} ${i<2?'✓':''}</div>`).join('')}</div>
      </div>
    </div>
  `));
});

/* ================= INSTITUTION ================= */
route('/institution/overview', ()=>{
  mount(shell('institution','overview','Command Center','', `
    <div class="grid g6">
      ${[['Placement Rate','84%'],['Internship Participation','71%'],['Active Partners','28'],['Career Readiness','78%'],['Students Assessed','716/842'],['Programs Running','14']].map(k=>`
      <div class="card hoverable"><div class="muted" style="font-size:11.5px">${k[0]}</div><div class="kpi-v num" style="font-size:22px">${k[1]}</div></div>`).join('')}
    </div>
    <div class="grid" style="grid-template-columns:1.3fr 1fr;align-items:start;margin-top:16px">
      <div class="card"><div class="row between"><div class="eyebrow" style="margin:0">Industry Demand vs Student Supply</div><a href="#/institution/skillhealth" style="font-weight:600;font-size:13px">Skill Health →</a></div>
        <table class="tbl mt8"><thead><tr><th>Skill</th><th>Student Supply</th><th>Industry Demand</th><th>Gap</th></tr></thead><tbody>
        ${[['Python',7.8,8.0],['SQL',6.2,7.5],['JavaScript',5.1,7.0],['Communication',5.8,7.0]].map(s=>{
          const gap=s[2]-s[1], cls=gap>=1.5?'large-gap':gap>=0.5?'moderate':'on-track';
          return `<tr><td><strong>${s[0]}</strong></td><td class="num">${s[1]}</td><td class="num">${s[2]}</td><td>${badge(cls, gap>=1.5?'Large':gap>=0.5?'Moderate':'On Track')} <span class="num muted" style="font-size:12px">−${gap.toFixed(1)}</span></td></tr>`;}).join('')}
        </tbody></table>
        <div class="alert-strip red mt16">⚠️ <div><strong>JavaScript competency is below industry requirement for 62% of eligible students.</strong>
          <div class="muted" style="font-size:12.5px">Current 5.1/10 · Required 7.0/10 · 184 affected students</div></div>
          <button class="btn btn-primary btn-sm" style="margin-left:auto" onclick="launchIntervention()">Launch Learning Program</button></div>
      </div>
      <div class="card"><div class="eyebrow">Skill Gap Heatmap</div>
        <div class="heat" style="grid-template-columns:130px repeat(4,1fr)">
          <div class="hcell hhead">Dept / Skill</div>${['Python','SQL','JavaScript','Comm.'].map(s=>`<div class="hcell hhead">${s}</div>`).join('')}
          ${[['Computer Science',[['7.8','g'],['6.8','a'],['5.2','r'],['6.1','a']]],
             ['Information Tech',[['7.7','g'],['7.4','g'],['6.3','a'],['6.4','a']]],
             ['BCA',[['6.9','a'],['5.8','a'],['4.9','r'],['5.7','r']]],
             ['Electronics',[['6.2','a'],['5.4','a'],['4.6','r'],['5.9','a']]],
             ['Data Science',[['8.2','g'],['7.6','g'],['5.9','a'],['6.3','a']]]].map(d=>`
          <div class="hcell hlabel">${d[0]}</div>${d[1].map(c=>`<div class="hcell h-${c[1]} num">${c[0]}</div>`).join('')}`).join('')}
        </div>
        <div class="row mt8" style="gap:14px;font-size:11.5px;color:var(--text2)">
          <span><span class="hcell h-green" style="padding:1px 7px;border-radius:5px"></span> On track</span>
          <span><span class="hcell h-amber" style="padding:1px 7px;border-radius:5px"></span> Moderate</span>
          <span><span class="hcell h-red" style="padding:1px 7px;border-radius:5px"></span> Large gap</span></div>
      </div>
    </div>
    <div class="grid g2 mt16">
      <div class="card"><div class="eyebrow">Placement Funnel — 2026</div>
        <div class="funnel">${[['Applied',612,100],['Shortlisted',204,66],['Interview',118,48],['Offered',74,36],['Placed',58,30]].map(f=>`
          <div class="fstage num" style="width:${f[2]}%">${f[0]} — ${f[1]}</div>`).join('')}</div>
        <div class="row mt8" style="gap:8px;flex-wrap:wrap">${['Department ▾','Grad Year ▾','Company ▾','Skill ▾'].map(f=>`<button class="btn btn-secondary btn-sm" onclick="toast('Filter: ${f}')">${f}</button>`).join('')}</div>
      </div>
      <div class="card"><div class="eyebrow">Program Outcomes — JavaScript Bootcamp</div>
        <div class="row between" style="align-items:flex-end">
          <div style="text-align:center"><div class="muted" style="font-size:11px">BEFORE</div><div class="kpi-v num" style="font-size:30px;color:var(--gap-red)">5.1</div></div>
          <div style="font-size:24px">→</div>
          <div style="text-align:center"><div class="muted" style="font-size:11px">AFTER</div><div class="kpi-v num" style="font-size:30px;color:#0f766e">7.4</div></div>
          <div>${seal(true)}</div></div>
        ${bar(100,'sea')}
        <div class="grid g3 mt16">
          ${[['120','Enrolled'],['108','Projects'],['96','Verified']].map(k=>`<div style="text-align:center"><div class="kpi-v num">${k[0]}</div><div class="muted" style="font-size:12px">${k[1]}</div></div>`).join('')}
        </div>
        <div class="alert-strip mt16" style="background:#f0fdfa;border-color:#99f6e4">${seal()}<span><strong>Industry readiness +31%</strong></span></div>
      </div>
    </div>
  `));
});

function launchIntervention(){
  state.enrolled = true;
  modal(`<div style="text-align:center"><h2>Launch Learning Intervention</h2>
    <p class="muted mt8">Industry-led <strong>JavaScript & Full-Stack Bootcamp</strong> · Partner: Zoho · 4 weeks · Target: 120 students</p>
    <div class="card mt16" style="text-align:left;background:var(--bg)">
      <div class="row" style="gap:8px">✅ Assign to 184 affected students</div>
      <div class="row" style="gap:8px">✅ Zoho partnership confirmed</div>
      <div class="row" style="gap:8px">✅ Outcome tracking enabled</div></div>
    <div class="row mt16" style="justify-content:center;gap:10px">
      <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="closeModal();toast('Intervention launched — 184 students assigned 📣');setTimeout(()=>nav('/institution/roi'),900)">Confirm Launch</button></div></div>`);
}

route('/institution/skillhealth', ()=>{
  mount(shell('institution','skillhealth','Skill Health','', `
    ${state.enrolled?`<div class="alert-strip" style="background:#f0fdfa;border-color:#99f6e4;margin-bottom:18px">${seal()}<div><strong>JavaScript Bootcamp intervention is live.</strong><div class="muted">184 students assigned.</div></div></div>`:''}
    <div class="grid g3">
      ${[['Computer Science',[8.1,6.8,5.2,6.1]],['Information Technology',[7.7,7.4,6.3,6.4]],['BCA',[6.9,5.8,4.9,5.7]]].map(d=>`
      <div class="card"><div class="eyebrow">${d[0]}</div>
        ${skillRow('Python',d[1][0])}${skillRow('SQL',d[1][1],10,'moderate')}${skillRow('JavaScript',d[1][2],10,'large')}${skillRow('Communication',d[1][3],10,'moderate')}</div>`).join('')}
    </div>
    <div class="card mt16"><div class="eyebrow">Demand vs Supply Trend</div>
      <svg viewBox="0 0 600 180" style="width:100%">
        <polyline points="0,120 100,110 200,95 300,80 400,62 500,55 600,48" fill="none" stroke="#0EA5E9" stroke-width="3"/>
        <polyline points="0,135 100,125 200,105 300,88 400,70 500,58 600,50" fill="none" stroke="#0369A1" stroke-width="3" stroke-dasharray="6 5"/>
        <text x="520" y="42" font-size="11" fill="#0EA5E9" font-family="Inter">Industry demand ↑</text>
        <text x="520" y="68" font-size="11" fill="#0369A1" font-family="Inter">Student supply</text>
      </svg>
      <p class="muted" style="font-size:12.5px">The gap is closing after interventions.</p></div>
  `));
});

route('/institution/roi', ()=>{
  mount(shell('institution','roi','Intervention ROI','', `
    <div class="grid g4">
      ${[['Total Invested','₹4.8L','Across 2 programs'],['Students Impacted','184','+ 120 bootcamp'],['Placements Gained','18','Directly attributable'],['Avg Package Lift','+₹0.9 LPA','Before vs after']].map(k=>`
      <div class="card"><div class="muted" style="font-size:12.5px">${k[0]}</div><div class="kpi-v num">${k[1]}</div><div class="kpi-d">${k[2]}</div></div>`).join('')}
    </div>
    <div class="card mt16">
      <div class="row between"><div class="eyebrow" style="margin:0">JavaScript Bootcamp — ROI Breakdown</div>${sealText('Verified Outcomes')}</div>
      <div class="grid g2 mt16">
        <div>
          <h3>Investment</h3>
          <table class="tbl mt8"><tbody>
            <tr><td>Instructor fees</td><td class="num" style="text-align:right">₹1,60,000</td></tr>
            <tr><td>Platform + content</td><td class="num" style="text-align:right">₹80,000</td></tr>
            <tr><td>Student stipends</td><td class="num" style="text-align:right">₹2,40,000</td></tr>
            <tr style="border-top:2px solid var(--ocean)"><td><strong>Total</strong></td><td class="num" style="text-align:right"><strong>₹4,80,000</strong></td></tr>
          </tbody></table>
        </div>
        <div>
          <h3>Outcomes</h3>
          <table class="tbl mt8"><tbody>
            <tr><td>Students completed</td><td class="num" style="text-align:right">108 / 120 (90%)</td></tr>
            <tr><td>Students verified</td><td class="num" style="text-align:right">96 / 120 (80%)</td></tr>
            <tr><td>Avg skill improvement</td><td class="num" style="text-align:right">5.1 → 7.4 (+2.3)</td></tr>
            <tr><td>Additional placements</td><td class="num" style="text-align:right">14 students</td></tr>
            <tr><td>Avg package lift</td><td class="num" style="text-align:right">₹3.2 → ₹4.1 LPA</td></tr>
          </tbody></table>
        </div>
      </div>
      <div class="divider"></div>
      <div class="row between wrap" style="gap:20px">
        <div><div class="muted" style="font-size:12px">Value created</div><div class="kpi-v num" style="color:#0f766e">₹57.4L</div></div>
        <div><div class="muted" style="font-size:12px">Net value</div><div class="kpi-v num" style="color:#0f766e">₹52.6L</div></div>
        <div><div class="muted" style="font-size:12px">Return on Investment</div><div class="kpi-v num" style="color:#0f766e;font-size:38px">1,096%</div></div>
      </div>
    </div>
    <div class="grid g2 mt16">
      <div class="card"><div class="eyebrow">Program Impact vs Baseline</div>
        ${[['Skill improvement',100],['Placement rate lift',64],['Student satisfaction',92],['Employer satisfaction',88]].map(f=>`
        <div class="skill-row"><span class="sname" style="width:170px;font-size:12.5px">${f[0]}</span>${bar(f[1],'sea')}<span class="sval num">${f[1]}%</span></div>`).join('')}
      </div>
      <div class="card"><div class="eyebrow">Recommended Next Interventions</div>
        ${[['SQL Advanced Practice','184 students · ₹1.2L est.','High impact'],['Communication Workshop','312 students · ₹2.4L est.','Medium impact'],['System Design Mentorship','48 students · ₹0.8L est.','High impact']].map(r=>`
        <div class="row between" style="padding:10px 0;border-bottom:1px solid var(--border)">
          <div><strong style="font-size:13.5px">${r[0]}</strong><div class="muted" style="font-size:12px">${r[1]}</div></div>
          <div>${badge(r[2]==='High impact'?'on-track':'moderate', r[2])}</div>
        </div>`).join('')}
        <button class="btn btn-primary mt16" style="width:100%" onclick="toast('Intervention plan exported for review')">Export Full Report</button>
      </div>
    </div>
  `));
});

route('/institution/partnerships', ()=>{
  mount(shell('institution','partnerships','Partnerships','', `
    <div class="dir-tl">
      <div class="card" style="padding:0;overflow:hidden">
        <table class="tbl"><thead><tr><th>Partner</th><th>MoU</th><th>Placed</th><th>Interns</th><th>Health</th></tr></thead><tbody>
        ${[['TCS','active','48','72','91% Healthy'],['Infosys','active','36','54','88% Healthy'],['Wipro','due','29','41','64% Attention'],['Zoho','active','31','38','94% Healthy']].map(p=>`
        <tr class="hoverable"><td><div class="row"><div class="opp-logo">${p[0][0]}</div><strong>${p[0]}</strong></div></td>
          <td>${badge(p[1], p[1]==='active'?'Active':'Renewal Due')}</td>
          <td class="num">${p[2]}</td><td class="num">${p[3]}</td>
          <td><span class="num" style="font-weight:600;color:${p[4].includes('64')?'var(--gap-amber)':'#0f766e'}">${p[4]}</span></td></tr>`).join('')}
        </tbody></table></div>
      <div class="card"><div class="eyebrow">Upcoming Joint Events</div>
        <div class="tl">
          ${[['18 Sep','Infosys Guest Lecture','done'],['25 Sep','TCS Recruitment Drive','done'],['04 Oct','Zoho Full-Stack Workshop',''],['18 Oct','Campus AI Challenge — TCS · 300 students',''],['02 Nov','Wipro FDP','']].map(e=>`
          <div class="tl-item ${e[2]}"><strong style="font-size:13.5px">${e[1]}</strong><div class="muted" style="font-size:12px">${e[0]} 2026</div>
          ${e[1].includes('AI Challenge')?`<div class="row mt8" style="gap:8px"><button class="btn btn-secondary btn-sm" onclick="toast('Event opened for review')">Review</button><button class="btn btn-primary btn-sm" onclick="toast('Campus AI Challenge approved ✓')">Approve</button></div>`:''}</div>`).join('')}
        </div>
        <div class="divider"></div>
        <div class="eyebrow">Partnership Health — Wipro drill-down</div>
        ${[['Recruitment outcomes',45],['Internship participation',70],['FDP activity',20],['Student engagement',88]].map(f=>`
        <div class="skill-row"><span class="sname" style="width:170px;font-size:12px">${f[0]}</span>${bar(f[1], f[1]<50?'red':f[1]<75?'amber':'sea')}<span class="sval num">${f[1]}%</span></div>`).join('')}
        <button class="btn btn-secondary mt8" style="width:100%" onclick="toast('Renewal discussion scheduled with Wipro')">Schedule Renewal Discussion</button>
      </div>
    </div>
  `));
});

/* ================= NOTIFICATIONS ================= */
route('/student/notifications', ()=>renderNotifs('student'));
route('/industry/notifications', ()=>renderNotifs('industry'));
route('/academician/notifications', ()=>renderNotifs('academician'));
route('/institution/notifications', ()=>renderNotifs('institution'));

function renderNotifs(role){
  const list = state.notifications[role]||[];
  state.notifications[role] = list.map(n=>({...n, unread:false}));
  mount(shell(role,'notifications','Notifications','', `
    <div class="card" style="padding:6px 0">
      ${list.length?list.map(n=>`
      <div class="notif"><div class="nico">${n.ico}</div>
        <div style="flex:1"><div class="row" style="gap:8px"><strong style="font-size:13.5px">${n.text}</strong>${n.unread?'<span class="dot-unread" style="position:static"></span>':''}</div>
        <div class="muted" style="font-size:12px">${n.time}</div></div></div>`).join('')
      :`<div class="empty"><div class="big">🔔</div><strong>All caught up</strong></div>`}
    </div>
    <div class="row mt24" style="justify-content:center;gap:10px">
      <span class="muted">Switch role to see cross-role updates:</span>
      ${['student','industry','academician','institution'].map(r=>`<a class="btn btn-secondary btn-sm" href="#/${r}/${r==='student'?'dashboard':r==='industry'?'dash':r==='academician'?'home':'overview'}">${r[0].toUpperCase()+r.slice(1)}</a>`).join('')}
    </div>
  `));
  setTimeout(()=>{ const d=document.querySelector('.topbar .dot-unread'); if(d) d.remove(); }, 100);
}

/* ---- Mobile preview ---- */
route('/mobile', ()=>{
  const readiness = computeReadiness();
  mount(`
  <div style="min-height:100vh;padding:30px 16px">
    <div style="max-width:900px;margin:0 auto">
      <div class="row between" style="margin-bottom:20px"><div><h1>Mobile Experience</h1><p class="muted">True 375px responsive layout.</p></div>
      <a href="#/student/dashboard" class="btn btn-secondary">← Back to desktop</a></div>
      <div class="mobile-frame">
        <div class="phone">
          <div class="phone-body">
            <div class="row between"><div><div class="muted" style="font-size:12px">Good morning,</div><strong>Priya 👋</strong></div><span class="avatar" style="width:32px;height:32px;font-size:12px">PS</span></div>
            <div class="p-card row" style="gap:14px">
              <div style="position:relative">${readinessRing(readiness,74)}<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center" class="num"><strong>${readiness}%</strong></div></div>
              <div><strong>Career Readiness</strong><div class="muted" style="font-size:12px">${Object.values(state.skillProfile).filter(s=>s.verified).length} skills verified</div></div></div>
            <div class="p-card"><div class="eyebrow">Continue Learning</div><strong>SQL for Developers</strong><div class="row between mt8"><span class="muted num" style="font-size:12px">72%</span></div>${bar(72)}</div>
            <div class="p-card"><div class="eyebrow">Your Skills</div>
              ${Object.entries(state.skillProfile).map(([s,v])=>`<div class="row between" style="padding:5px 0;font-size:13px"><span>${s}</span><span class="num">${v.score} ${v.verified?'✓':''}</span></div>`).join('')}</div>
            <div class="eyebrow" style="margin:4px 2px">Recommended</div>
            <div class="hscroll">
              ${OPPS.slice(0,2).map(oppWithMatch).map(o=>`
              <div class="p-card" style="min-width:220px;margin:0"><strong>${o.company}</strong><div class="muted" style="font-size:12px">${o.role}</div><div class="row between mt8">${matchBadge(o.match)}</div><button class="btn btn-primary btn-sm mt8" style="width:100%" onclick="applyTo(${o.id},this)">Apply</button></div>`).join('')}
            </div>
          </div>
          <div class="bottom-nav">
            ${[['🏠','Home','#/mobile'],['📚','Learn','#/student/learn'],['💼','Jobs','#/student/opportunities'],['📋','Apps','#/student/applications'],['👤','Me','#/student/portfolio']].map((b,i)=>`<a href="${b[2]}" class="${i===0?'active':''}"><span class="ico">${b[0]}</span>${b[1]}</a>`).join('')}
          </div>
        </div>
      </div>
    </div>
  </div>`);
});

/* ------- Global exports ------- */
function switchTab(el,i){
  document.querySelectorAll('.tab').forEach(function(t){t.classList.remove('active');}); el.classList.add('active');
  for(let j=0;j<5;j++){const p=document.getElementById('ptab-'+j); if(p) p.style.display=j===i?'block':'none';}
}

window.applyTo = applyTo;
window.login = login;
window.toast = toast;
window.closeModal = closeModal;
window.nav = nav;
window.startAssessment = startAssessment;
window.answerQ = answerQ;
window.finishAssessment = finishAssessment;
window.runTests = runTests;
window.completeChallenge = completeChallenge;
window.analyzeProject = analyzeProject;
window.addAnalysisToPortfolio = addAnalysisToPortfolio;
window.showMatchBreakdown = showMatchBreakdown;
window.showApplicantMatch = showApplicantMatch;
window.setApplicantStatus = setApplicantStatus;
window.requestMentor = requestMentor;
window.acceptMentor = acceptMentor;
window.respondRequest = respondRequest;
window.launchIntervention = launchIntervention;
window.suggestTeam = suggestTeam;
window.switchTab = switchTab;

/* ---------------- INIT ---------------- */
render();