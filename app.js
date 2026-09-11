/* =========================================================
   SkillBridge Prototype — single-file SPA
   Ocean Blue theme · 4 roles · shared cross-role state
========================================================= */
'use strict';

/* ---------------- State ---------------- */
const state = {
  role: null,
  applications: [
    {id:1, company:'TCS',   role:'Software Engineering Intern', loc:'Mumbai',   stipend:'₹25,000/mo', match:94, status:'interview',  skills:['Python','SQL','Problem Solving']},
    {id:2, company:'Infosys',role:'Software Development Intern',loc:'Bengaluru',stipend:'₹30,000/mo', match:89, status:'shortlisted',skills:['Python','JavaScript','SQL']},
    {id:3, company:'Zoho',  role:'Backend Development Intern', loc:'Chennai',  stipend:'₹28,000/mo', match:86, status:'applied',    skills:['Python','SQL','APIs']},
  ],
  mentors: [
    {id:1, name:'Arjun Mehta', company:'TCS', skills:['Python','SQL','System Design'], exp:'6 years', avail:'2 slots/week', status:'none'},
    {id:2, name:'Sneha Kulkarni', company:'Zoho', skills:['JavaScript','Full-Stack','APIs'], exp:'5 years', avail:'1 slot/week', status:'none'},
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
  guestReq: 'none', // none | pending
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
const skillRow = (name, val, max=10, gap) => {
  const cls = gap==='large'?'red':gap==='moderate'?'amber':(val>=max?'green':'');
  return `<div class="skill-row"><span class="sname">${name}</span>${bar(val/max*100,cls)}<span class="sval num">${val}</span></div>`;
};
const oppCard = (o, applied) => `
<div class="card hoverable opp-card">
  <div class="row"><div class="opp-logo">${o.company[0]}</div>
    <div><h3>${o.company}</h3><div class="muted">${o.role}</div></div></div>
  <div class="row wrap">${o.skills.map(tag).join('')}</div>
  <div class="row between">
    <div class="muted">${o.loc} · ${o.stipend}</div>${matchBadge(o.match)}</div>
  <button class="btn ${applied?'btn-secondary':'btn-primary'}" ${applied?'disabled':''}
    onclick="applyTo(${o.id},this)">${applied?'Applied ✓':'Apply'}</button>
</div>`;

const appState = id => state.applications.find(a=>a.id===id)?.status;

/* opportunities pool */
const OPPS = [
  {id:1, company:'TCS',    role:'Software Engineering Intern', loc:'Mumbai',    stipend:'₹25,000/mo', match:94, skills:['Python','SQL','Problem Solving'], type:'Internship'},
  {id:2, company:'Infosys',role:'Software Development Intern', loc:'Bengaluru', stipend:'₹30,000/mo', match:89, skills:['Python','JavaScript','SQL'], type:'Internship'},
  {id:3, company:'Zoho',   role:'Backend Development Intern',  loc:'Chennai',   stipend:'₹28,000/mo', match:86, skills:['Python','SQL','APIs'], type:'Internship'},
  {id:4, company:'Wipro',  role:'Data Analyst Intern',         loc:'Hyderabad', stipend:'₹22,000/mo', match:81, skills:['Python','Data Analytics','SQL'], type:'Internship'},
  {id:5, company:'TCS',    role:'Graduate Engineer Trainee',   loc:'Pune',      stipend:'₹3.6 LPA',   match:78, skills:['Python','Communication','Git & GitHub'], type:'Placement'},
  {id:6, company:'Zoho',   role:'Full-Stack Developer',        loc:'Chennai',   stipend:'₹4.2 LPA',   match:74, skills:['JavaScript','SQL','Python'], type:'Placement'},
];

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
function nav(path){ location.hash = '#'+path; }
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
    ['project','🛠️','Projects'], ['opportunities','💼','Opportunities'], ['applications','📋','Applications'],
    ['portfolio','🎓','Portfolio'], ['grow','🌱','Grow'], ['notifications','🔔','Notifications'],
  ],
  industry: [
    ['dash','🏠','Dashboard'], ['post','➕','Opportunities'], ['applicants','👥','Applicants'],
    ['programs','📜','Learning Programs'], ['engage','🤝','Engage Talent'], ['notifications','🔔','Notifications'],
  ],
  academician: [
    ['home','🏠','Home'], ['fdp','📜','FDPs'], ['research','🔬','Research'],
    ['research','💼','Consultancy'], ['research','🎤','Faculty Opportunities'], ['notifications','🔔','Notifications'],
  ],
  institution: [
    ['overview','🏠','Overview'], ['overview','🎓','Students'], ['skillhealth','📊','Skill Health'],
    ['overview','📜','Programs'], ['overview','🎯','Placements'], ['partnerships','🤝','Industry Partners'],
    ['partnerships','📈','Partnerships'], ['notifications','🔔','Notifications'],
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
route('/login', ()=>{
  mount(`
  <div class="login-wrap">
    <div class="login-left">
      <div class="wordmark"><span class="mark">✓</span>SkillBridge</div>
      <div class="login-tag">Where Learning Becomes Opportunity</div>
      <div class="login-copy">Learn. Build. Prove. Connect.</div>
      <div style="margin-top:40px;display:flex;gap:10px;flex-wrap:wrap">
        ${sealText('Verified Skills')} ${sealText('Evidence-based')} ${sealText('Industry Matched')}
      </div>
    </div>
    <div class="login-right"><div class="login-card">
      <h1>Welcome back</h1>
      <p class="muted">Select your role and sign in to your ecosystem.</p>
      <div class="role-pills" id="rolePills">
        ${['Student','Industry','Academician','Institution'].map((r,i)=>`<button class="role-pill ${i===0?'active':''}" data-role="${r.toLowerCase()}">${r}</button>`).join('')}
      </div>
      <div class="field"><label>Email</label><input type="email" value="priya.sharma@student.edu"></div>
      <div class="field"><label>Password</label><input type="password" value="password123"></div>
      <div class="login-foot">
        <label class="check"><input type="checkbox" checked>Remember me</label>
        <a href="#/login" onclick="toast('Reset link sent to your email')">Forgot password?</a>
      </div>
      <button class="btn btn-primary" style="width:100%" onclick="login()">Login</button>
      <p class="muted" style="margin-top:16px;font-size:12px;text-align:center">Demo prototype — click Login to enter the selected role's experience.</p>
    </div></div>
  </div>`);
  document.querySelectorAll('.role-pill').forEach(p=>p.onclick=()=>{
    document.querySelectorAll('.role-pill').forEach(x=>x.classList.remove('active'));
    p.classList.add('active');
  });
});
let selectedRole='student';
document.addEventListener('click', e=>{
  const p = e.target.closest('.role-pill');
  if(p) selectedRole = p.dataset.role;
});
function login(){
  state.role = selectedRole;
  toast(`Logged in as ${selectedRole.charAt(0).toUpperCase()+selectedRole.slice(1)}`);
  nav('/'+selectedRole+(selectedRole==='student'?'/dashboard':selectedRole==='industry'?'/dash':selectedRole==='academician'?'/home':'/overview'));
}

/* ---------------- Cross-role actions ---------------- */
function applyTo(id, btn){
  const o = OPPS.find(x=>x.id===id);
  if(state.applications.some(a=>a.id===id)) return;
  state.applications.unshift({id:o.id, company:o.company, role:o.role, loc:o.loc, stipend:o.stipend, match:o.match, status:'applied', skills:o.skills});
  toast('Application submitted successfully.');
  setTimeout(()=>nav('/student/applications'), 900);
}
window.applyTo = applyTo;
window.login = login;
window.toast = toast; window.closeModal = closeModal;

/* ================= STUDENT ================= */
function readinessRing(pct, size=120){
  const r=(size/2)-10, c=2*Math.PI*r, off=c*(1-pct/100);
  return `<svg class="ring" width="${size}" height="${size}">
    <circle class="bgc" cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke-width="12"/>
    <circle class="fgc" cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke-width="12"
      stroke-dasharray="${c}" stroke-dashoffset="${off}"/></svg>`;
}
const evidenceChain = (pendingLast=false) => `
<div class="chain">
  ${['Learned','Practiced','Built','Assessed'].map(s=>`<div class="chain-step"><span class="chain-dot">✓</span><div><strong>${s}</strong><div class="muted">Python · completed</div></div></div>`).join('')}
  <div class="chain-step ${pendingLast?'pending':''}"><span class="chain-dot">${pendingLast?'○':'✓'}</span><div><strong>Verified</strong><div class="muted">${pendingLast?'Pending assessment':'Skill verified'}</div></div></div>
</div>`;

/* ---- 07 Dashboard ---- */
route('/student/dashboard', ()=>{
  const rec = OPPS.slice(0,3);
  mount(shell('student','dashboard','Home','', `
    <div class="card"><div class="ring-wrap">
      <div style="position:relative">${readinessRing(82)}<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center"><span class="kpi-v num">82%</span><span class="muted" style="font-size:11px">Ready</span></div></div>
      <div><h1 style="font-size:22px">Good morning, Priya 👋</h1>
        <p class="muted">Your career readiness is <strong>82%</strong> — 2 skills away from your Software Development goal.</p>
        <div class="row mt8">${badge('verified','Python ✓ Verified')} ${badge('shortlisted','Infosys · Shortlisted')}</div>
      </div></div></div>

    <div class="grid g3 mt24">
      <div class="card hoverable"><div class="eyebrow">Continue Learning</div><h3>SQL for Developers</h3>
        <div class="row between mt8"><span class="muted num">72% · 9/12 lessons</span><span class="chip">SQL</span></div>
        ${bar(72)}<button class="btn btn-primary mt16" style="width:100%" onclick="nav('/student/learn')">Continue</button></div>
      <div class="card hoverable"><div class="eyebrow">Build Next</div><h3>Campus Placement Tracker</h3>
        <div class="muted">Python + SQL · 4/6 milestones</div>
        <div class="row mt8 wrap">${tag('Python')}${tag('SQL')}</div>
        <button class="btn btn-secondary mt16" style="width:100%" onclick="nav('/student/project')">Continue Project</button></div>
      <div class="card"><div class="eyebrow">Your Skill Journey</div>
        ${skillRow('Python',8.5,10)}
        ${skillRow('SQL',6.4,10,'moderate')}
        ${skillRow('JavaScript',4.8,10,'large')}
        ${skillRow('Communication',6.1,10,'moderate')}
        <a href="#/student/journey" style="font-size:13px;font-weight:600">View full journey →</a></div>
    </div>

    <div class="section-title"><h2>Recommended For You</h2><a href="#/student/opportunities" style="font-weight:600;font-size:13px">Browse all →</a></div>
    <div class="opp-scroll">${rec.map(o=>oppCard(o, appState(o.id))).join('')}</div>

    <div class="section-title"><h2>Applications In Progress</h2><a href="#/student/applications" style="font-weight:600;font-size:13px">View tracker →</a></div>
    <div class="grid g3">${state.applications.map(a=>`
      <div class="card hoverable row" style="justify-content:space-between">
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

/* ---- 02 Learning Roadmap ---- */
route('/student/learn', ()=>{
  const mods=[
    ['Python Foundations',78,'12/15 lessons','8/10 challenges','done'],
    ['SQL for Developers',72,'9/12 lessons','6/8 challenges','active'],
    ['Data Structures & Algorithms',30,'4/14 lessons','2/6 challenges','active'],
    ['Git & GitHub',0,'0/6 lessons','0/4 challenges','locked'],
    ['Full-Stack Project',0,'Not started','—','locked'],
    ['Skill Verification',0,'Locked until build complete','—','locked'],
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
          <span class="muted" style="font-size:12px">Skill outcome: ${['Python','SQL','DSA','Git','Full-Stack','Verification'][i]}</span>
          <button class="btn ${m[4]==='locked'?'btn-ghost':m[4]==='done'?'btn-secondary':'btn-primary'} btn-sm"
            ${m[4]==='locked'?'disabled':''} onclick="nav('/student/${i===0?'challenge':'challenge'}')">${m[4]==='done'?'Review':m[4]==='active'?'Continue Learning':'Locked'}</button>
        </div></div>`).join('')}</div>
  `));
});

/* ---- 03 Practice Challenge ---- */
route('/student/challenge', ()=>{
  mount(shell('student','learn','Practice Challenge','', `
    <div class="grid" style="grid-template-columns:1.4fr 1fr;align-items:start">
      <div class="card">
        <div class="row between"><div><div class="eyebrow">Python Challenge · Difficulty: Intermediate</div><h1 style="font-size:22px">Build a Student Expense Tracker</h1></div>
          <span class="timer-chip">⏱ Est. 2 hours</span></div>
        <div class="row wrap mt16">${tag('Python')}${tag('File I/O')}${tag('Data Structures')}</div>
        <div class="divider"></div>
        <h3>Requirements</h3>
        <div class="col mt8" style="gap:8px">
          ${['Accept and validate transactions','Categorize expenses (food, travel, study, other)','Calculate category totals and monthly summary','Store records persistently','Generate a printed summary report'].map((r,i)=>`
          <label class="row" style="gap:10px"><input type="checkbox" class="req-check" style="accent-color:#2DD4BF;width:17px;height:17px" onchange="updateChallenge()"><span>${r}</span></label>`).join('')}
        </div>
        <div class="divider"></div>
        <div class="row between"><div><h3>Progress</h3><div class="muted" id="chProgressText">0 / 5 requirements</div></div>
          <div style="width:220px">${bar(0,'sea')}<div id="chBar" style="margin-top:-8px">${bar(0,'sea')}</div></div></div>
        <div class="row mt16"><button class="btn btn-ghost" onclick="toast('Hint: use a dict of lists per category')">💡 Hint</button>
          <button class="btn btn-primary" id="submitCh" disabled onclick="completeChallenge()">Submit Challenge</button></div>
      </div>
      <div class="card"><div class="eyebrow">Completion Criteria</div>
        <div class="col" style="gap:10px;font-size:13.5px">
          ${['All 5 requirements implemented','Code runs without errors','Summary output matches spec'].map(c=>`<div class="row" style="gap:8px">✅ <span>${c}</span></div>`).join('')}
        </div>
        <div class="divider"></div>
        <div class="eyebrow">Skills Tested</div>${['Python','Problem Solving','Practical Application'].map(tag).join('')}
        <div class="divider"></div>
        <div class="muted">This challenge becomes <strong>practice evidence</strong> on your Skill Passport.</div>
      </div>
    </div>
`));
});

/* ---- 04 Project Build ---- */
route('/student/project', ()=>{
  const ms=[['Planning',1],['Database Design',1],['Backend',1],['Frontend',1],['Testing',0],['Submission',0]];
  mount(shell('student','project','Projects','', `
    <div class="page-head"><div><h1>Build & Prove — Campus Placement Tracker</h1><p>Python + SQL + Database Design + Data Visualization</p></div>
      <button class="btn btn-primary" onclick="toast('Project submitted — evidence added to Skill Passport ✓');setTimeout(()=>nav('/student/assessment'),900)">Submit Project</button></div>
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
        <h3>Submission Checklist</h3>
        <div class="col mt8" style="gap:8px">
          ${['GitHub repository link','README with setup instructions','Demo screenshots'].map(c=>`<label class="row" style="gap:10px"><input type="checkbox" style="accent-color:#0369A1;width:17px;height:17px"><span>${c}</span></label>`).join('')}
        </div>
        <div class="field mt16"><label>GitHub / Project Link</label><input value="https://github.com/priyasharma/campus-placement-tracker"></div>
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

/* ---- 05 Assessment ---- */
let assessQ = 0;
const QUESTIONS = [
  {cat:'Knowledge', q:'Which data structure is best for LIFO behaviour?', opts:['Queue','Stack','Linked List','Heap'], a:1},
  {cat:'Problem Solving', q:'A function must run in O(1) extra space. Which approach fits?', opts:['Recursion with memo','In-place two pointers','Hash map of seen values','Sorting a copy'], a:1},
  {cat:'Practical Application', q:'Your expense tracker crashes on empty input. Best fix?', opts:['Wrap input in try/except only','Validate input before processing','Ignore empty files','Restart the program'], a:1},
  {cat:'Project Understanding', q:'In your placement tracker, why index the applications table?', opts:['To save disk space','Faster lookups by student/company','Required by SQL standard','Automatic backups'], a:1},
];
route('/student/assessment', ()=>{
  assessQ = 0; renderQuestion();
});
function renderQuestion(){
  const q = QUESTIONS[assessQ];
  mount(shell('student','journey','Final Skill Verification','', `
    <div style="max-width:640px;margin:0 auto">
      <div class="card" style="text-align:center;padding:32px">
        <div class="row between"><span class="chip">Python · ${q.cat}</span><span class="timer-chip">⏱ 14:${String(59-assessQ*7).padStart(2,'0')}</span></div>
        <div class="mt16">${bar(((assessQ)/QUESTIONS.length)*100)}</div>
        <div class="muted num" style="margin-top:6px;font-size:12px">Question ${assessQ+1} of ${QUESTIONS.length}</div>
        <h2 style="margin:22px 0 20px">${q.q}</h2>
        <div style="text-align:left">${q.opts.map((o,i)=>`
          <button class="assess-opt" onclick="answerQ(${i})"><span class="letter">${'ABCD'[i]}</span>${o}</button>`).join('')}</div>
      </div></div>
`));
}

/* ---- 06 Skill Journey / Result ---- */
route('/student/journey', (q)=>{
  const verified = q.verified==='1';
  if(verified) setTimeout(()=>toast('Your Python skill has been verified ✓'), 400);
  mount(shell('student','journey','Skill Journey','', `
    ${verified?`<div class="alert-strip" style="background:#f0fdfa;border-color:#99f6e4;margin-bottom:18px">${seal()}<div><strong>Your learning journey is complete. Your skill is now verified.</strong><div class="muted">Industry can see your full evidence trail.</div></div></div>`:''}
    <div class="grid" style="grid-template-columns:1.2fr 1fr;align-items:start">
      <div>
        <div class="card" style="background:linear-gradient(135deg,#0369A1,#075985);color:#fff;border:none">
          <div class="row between">
            <div><div style="opacity:.8;font-size:12px;letter-spacing:.08em;text-transform:uppercase">Python</div>
              <div style="font-family:Poppins;font-size:42px;font-weight:700" class="num">8.5 / 10</div>
              <div style="color:#2DD4BF;font-weight:600">✓ VERIFIED</div></div>
            ${seal(true)}
          </div></div>
        <div class="card mt16"><div class="eyebrow">Skill Evidence Chain</div>${evidenceChain(false)}</div>
        <div class="card mt16"><div class="eyebrow">Gap Analysis</div>
          <table class="tbl"><thead><tr><th>Skill</th><th>Required</th><th>Your Level</th><th>Gap</th><th></th></tr></thead><tbody>
            ${[['Python',8,8.5,'on'],['SQL',7,6.4,'moderate'],['Communication',7,6.1,'moderate'],['JavaScript',7,4.8,'large']].map(g=>`
            <tr><td><strong>${g[0]}</strong></td><td class="num">${g[1]}</td><td class="num">${g[2]}</td>
              <td>${badge(g[3]==='on'?'on-track':g[3], g[3]==='on'?'On Track':g[3]==='moderate'?'Moderate':'Large')}</td>
              <td>${g[3]==='on'?'—':`<button class="btn btn-secondary btn-sm" onclick="toast('Starting recommended learning: ${g[0]}')">Start Learning</button>`}</td></tr>`).join('')}
          </tbody></table></div>
      </div>
      <div class="card"><div class="eyebrow">Skill Radar</div>
        ${radarChart([[90,60,45,58,75]],['Python','SQL','JS','Comm.','DSA'])}
        <div class="radar-legend mt8">
          <div class="row" style="gap:8px"><span style="width:12px;height:12px;border-radius:3px;background:#0EA5E9"></span>You</div>
          <div class="row" style="gap:8px"><span style="width:12px;height:12px;border-radius:3px;background:#E2E8F0"></span>Industry requirement</div>
        </div>
        <div class="divider"></div>
        <p class="muted" style="font-size:13px">Closing your <strong style="color:var(--gap-red)">JavaScript gap</strong> would raise your overall readiness to ~91% and unlock Full-Stack matches.</p>
        <button class="btn btn-primary mt8" style="width:100%" onclick="nav('/student/learn')">Start Recommended Learning</button>
      </div>
    </div>
`));
});

/* ---- 08 Opportunity Browsing ---- */
route('/student/opportunities', ()=>{
  mount(shell('student','opportunities','Opportunities','', `
    <div class="grid" style="grid-template-columns:250px 1fr;align-items:start">
      <div class="card" style="position:sticky;top:80px">
        <div class="filter-group"><h4>Opportunity Type</h4>
          ${['Internship','Placement','Hackathon'].map(t=>`<label class="filter-opt"><input type="checkbox" checked>${t}</label>`).join('')}</div>
        <div class="filter-group"><h4>Location</h4>
          ${['Mumbai','Bengaluru','Chennai','Pune','Hyderabad'].map(t=>`<label class="filter-opt"><input type="checkbox">${t}</label>`).join('')}</div>
        <div class="filter-group"><h4>Required Skills</h4>
          ${['Python','SQL','JavaScript','Data Analytics'].map(t=>`<label class="filter-opt"><input type="checkbox">${t}</label>`).join('')}</div>
        <div class="filter-group"><h4>Minimum Match</h4><input type="range" min="50" max="100" value="70" oninput="this.nextElementSibling.textContent=this.value+'%+'"><div class="num muted" style="margin-top:4px">70%+</div></div>
        <button class="btn btn-primary btn-sm" style="width:100%" onclick="toast('Filters applied')">Apply Filters</button>
      </div>
      <div class="grid g2">${OPPS.map(o=>oppCard(o, appState(o.id))).join('')}</div>
    </div>
  `));
});

/* ---- 09 Application Tracker ---- */
const KCOLS = [['applied','Applied'],['shortlisted','Shortlisted'],['interview','Interview'],['offered','Offered']];
route('/student/applications', ()=>{
  mount(shell('student','applications','Application Tracker','', `
    <div class="kanban">${KCOLS.map(([k,label])=>`
      <div class="kcol"><div class="kcol-head">${label} <span class="chip num" style="margin-left:auto">${state.applications.filter(a=>a.status===k).length}</span></div>
        ${state.applications.filter(a=>a.status===k).map(a=>`
          <div class="kcard ${k}">
            <div class="row between"><strong>${a.company}</strong>${matchBadge(a.match)}</div>
            <div class="muted" style="margin:4px 0 8px">${a.role}</div>
            <div class="row between">${k==='offered'?sealText('Offer Received'):badge(k)}
              <span class="muted" style="font-size:12px">${a.loc}</span></div>
          </div>`).join('')||'<div class="muted" style="text-align:center;padding:20px 0;font-size:12px">No applications yet</div>'}
      </div>`).join('')}</div>
    <p class="muted mt16" style="font-size:12.5px">↔ Industry status changes update this board in real time. Try switching to the <a href="#/industry/applicants"><strong>Industry role</strong></a> and changing Priya's status.</p>
  `));
});

/* ---- 10 Portfolio / Skill Passport ---- */
route('/student/portfolio', ()=>{
  mount(shell('student','portfolio','Portfolio','', `
    <div class="card" style="background:linear-gradient(135deg,#0369A1,#0EA5E9);color:#fff;border:none">
      <div class="row"><span class="avatar" style="width:56px;height:56px;font-size:18px;background:rgba(255,255,255,.2)">PS</span>
        <div><h1 style="color:#fff;font-size:24px">Priya Sharma</h1><div style="opacity:.9">Aspiring Software Developer · CGPA 8.6 · ABC University</div></div>
        <div style="margin-left:auto">${sealText('2 skills verified')}</div></div></div>
    <div class="tabs" style="margin-top:20px">
      ${['Skill Passport','Projects','Certifications','Internships','Achievements'].map((t,i)=>`<button class="tab ${i===0?'active':''}" onclick="switchTab(this,${i})">${t}</button>`).join('')}
    </div>
    <div id="ptab-0">
      <div class="grid g2">
        <div class="card"><div class="row between"><h2>PYTHON</h2><span class="kpi-v num">8.5/10</span></div>
          <div class="mt8">${sealText('VERIFIED')}</div>
          <div class="divider"></div>
          ${['Python Foundations (78% module)','12 Practice Challenges completed','Campus Placement Tracker project','Final Assessment — 8.5/10','Skill Verification — passed'].map(e=>`
            <div class="row" style="gap:9px;padding:5px 0"><span class="seal" style="width:20px;height:20px;font-size:10px;box-shadow:none">✓</span>${e}</div>`).join('')}
        </div>
        <div class="card"><div class="row between"><h2>SQL</h2><span class="kpi-v num">6.4/10</span></div>
          <div class="mt8">${badge('shortlisted','Verification Pending')}</div>
          <div class="divider"></div>
          ${['SQL for Developers (72%)','6 Practice Challenges'].map(e=>`<div class="row" style="gap:9px;padding:5px 0"><span class="seal" style="width:20px;height:20px;font-size:10px;box-shadow:none;background:#cbd5e1">✓</span>${e}</div>`).join('')}
          ${['Assessment not yet attempted','No verified project'].map(e=>`<div class="row" style="gap:9px;padding:5px 0;color:var(--text2)"><span style="width:20px;height:20px;border-radius:50%;border:2px solid #cbd5e1;display:inline-flex"></span>${e}</div>`).join('')}
          <button class="btn btn-primary mt8" onclick="nav('/student/assessment')">Complete Verification</button>
        </div>
      </div>
    </div>
    <div id="ptab-1" style="display:none">
      <div class="grid g3">
        <div class="card hoverable"><div class="row between"><h3>Campus Placement Tracker</h3>${seal()}</div>
          <p class="muted mt8">Full-stack tracker for campus drives with coordinator dashboard. 4/6 milestones.</p>
          <div class="row wrap mt8">${tag('Python')}${tag('SQL')}${tag('Data Viz')}</div>
          <div class="mt8">${sealText('Verified Project')}</div></div>
        <div class="card hoverable"><div class="row between"><h3>Expense Tracker CLI</h3>${seal()}</div>
          <p class="muted mt8">Practice challenge build — categorized expenses with persistent storage and reports.</p>
          <div class="row wrap mt8">${tag('Python')}</div>
          <div class="mt8">${sealText('Practice Evidence')}</div></div>
        <div class="card hoverable empty" style="justify-content:center"><div class="big">＋</div><strong>Start your next project</strong><p style="font-size:12.5px">Projects become verified evidence on your passport.</p><button class="btn btn-secondary" onclick="nav('/student/project')">New Project</button></div>
      </div>
    </div>
    <div id="ptab-2" style="display:none"><div class="grid g3">
      <div class="card"><div class="row between"><h3>Python Foundations</h3>${seal()}</div><div class="muted mt8">SkillBridge Verified · Sep 2026</div></div>
      <div class="card"><div class="row between"><h3>Git & GitHub Essentials</h3>${seal()}</div><div class="muted mt8">SkillBridge Verified · Aug 2026</div></div>
      <div class="card empty"><div class="big">📜</div><p>Complete assessments to earn verified certificates.</p></div>
    </div></div>
    <div id="ptab-3" style="display:none"><div class="card"><div class="tl">
      <div class="tl-item done"><strong>Offer Received — TCS</strong><div class="muted">Software Engineering Intern · Starts Jan 2027</div></div>
      <div class="tl-item done"><strong>Interview cleared</strong><div class="muted">TCS · Sep 2026</div></div>
      <div class="tl-item"><strong>Applications submitted</strong><div class="muted">TCS, Infosys, Zoho · Aug 2026</div></div>
    </div></div></div>
    <div id="ptab-4" style="display:none"><div class="grid g3">
      <div class="card"><div style="font-size:28px">🏆</div><h3 class="mt8">Top 5% — Python Assessment</h3><div class="muted">National cohort, Sep 2026</div></div>
      <div class="card"><div style="font-size:28px">🥇</div><h3 class="mt8">Build for Bharat — Finalist</h3><div class="muted">Team of 3 · Oct 2026</div></div>
      <div class="card empty"><div class="big">🎯</div><p>Join challenges in the Grow hub to earn achievements.</p></div>
    </div></div>
`));
});

/* ---- 17 Grow Hub (Student) ---- */
route('/student/grow', ()=>{
  mount(shell('student','grow','Grow','', `
    <div class="grow-grid">
      <div class="card" style="background:linear-gradient(135deg,#0EA5E9,#0369A1);color:#fff;border:none;grid-column:1/-1">
        <div class="row between wrap" style="gap:14px">
          <div><div style="opacity:.85;font-size:12px;letter-spacing:.08em;text-transform:uppercase">Innovation Challenge</div>
            <h1 style="color:#fff;font-size:26px">Build for Bharat 🇮🇳</h1>
            <div style="opacity:.9;margin-top:4px">Team of 3 · Prize ₹1,00,000 · ${tag('Python')} ${tag('AI')} ${tag('Data Analytics')}</div></div>
          <div style="text-align:center"><div class="num" style="font-family:Poppins;font-size:30px;font-weight:700" id="countdown">12d : 08h : 42m</div>
            <button class="btn btn-sea mt8" onclick="toast('Joined Build for Bharat! Team invite sent 🚀')">Join Challenge</button></div>
        </div></div>
      <div class="card"><div class="eyebrow">Mentorship Matches</div>
        ${state.mentors.map(m=>`
        <div class="row between" style="padding:10px 0;border-bottom:1px solid var(--border)">
          <div class="row"><span class="avatar" style="width:38px;height:38px">${m.name.split(' ').map(x=>x[0]).join('')}</span>
            <div><strong>${m.name}</strong><div class="muted" style="font-size:12px">${m.company} · ${m.exp} · ${m.avail}</div>
            <div class="row wrap mt8">${m.skills.map(tag).join('')}</div></div></div>
          ${m.status==='none'?`<button class="btn btn-primary btn-sm" onclick="requestMentor(${m.id})">Request Mentorship</button>`
            :m.status==='pending'?badge('shortlisted','Pending'):sealText('Mentorship Confirmed')}
        </div>`).join('')}
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

/* ---- 22 Mobile preview ---- */
route('/mobile', ()=>{
  mount(`
  <div style="min-height:100vh;padding:30px 16px">
    <div style="max-width:900px;margin:0 auto">
      <div class="row between" style="margin-bottom:20px"><div><h1>Mobile Experience</h1><p class="muted">True 375px responsive layout — not a shrunk desktop.</p></div>
      <a href="#/student/dashboard" class="btn btn-secondary">← Back to desktop</a></div>
      <div class="mobile-frame">
        <div class="phone">
          <div class="phone-body">
            <div class="row between"><div><div class="muted" style="font-size:12px">Good morning,</div><strong>Priya 👋</strong></div><span class="avatar" style="width:32px;height:32px;font-size:12px">PS</span></div>
            <div class="p-card row" style="gap:14px">
              <div style="position:relative">${readinessRing(82,74)}<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center" class="num"><strong>82%</strong></div></div>
              <div><strong>Career Readiness</strong><div class="muted" style="font-size:12px">2 skills from your goal</div></div></div>
            <div class="p-card"><div class="eyebrow">Continue Learning</div><strong>SQL for Developers</strong><div class="row between mt8"><span class="muted num" style="font-size:12px">72%</span></div>${bar(72)}</div>
            <div class="p-card"><div class="eyebrow">Your Skills</div>
              ${['Python 8.5 ✓','SQL 6.4','JavaScript 4.8'].map(s=>`<div class="row between" style="padding:5px 0;font-size:13px"><span>${s.split(' ')[0]}</span><span class="num">${s.split(' ')[1]}</span></div>`).join('')}</div>
            <div class="eyebrow" style="margin:4px 2px">Recommended</div>
            <div class="hscroll">
              <div class="p-card" style="min-width:220px;margin:0"><strong>TCS</strong><div class="muted" style="font-size:12px">Software Engineering Intern</div><div class="row between mt8">${matchBadge(94)}</div><button class="btn btn-primary btn-sm mt8" style="width:100%" onclick="applyTo(1,this)">Apply</button></div>
              <div class="p-card" style="min-width:220px;margin:0"><strong>Infosys</strong><div class="muted" style="font-size:12px">Software Development Intern</div><div class="row between mt8">${matchBadge(89)}</div><button class="btn btn-primary btn-sm mt8" style="width:100%" onclick="applyTo(2,this)">Apply</button></div>
            </div>
            <div class="p-card"><div class="eyebrow">Applications</div>
              ${state.applications.slice(0,3).map(a=>`<div class="row between" style="padding:5px 0;font-size:13px"><span>${a.company}</span>${badge(a.status)}</div>`).join('')}</div>
          </div>
          <div class="bottom-nav">
            ${[['🏠','Home','#/mobile'],['📚','Learn','#/student/learn'],['💼','Opportunities','#/student/opportunities'],['📋','Applications','#/student/applications'],['👤','Profile','#/student/portfolio']].map((b,i)=>`<a href="${b[2]}" class="${i===0?'active':''}"><span class="ico">${b[0]}</span>${b[1]}</a>`).join('')}
          </div>
        </div>
      </div>
    </div>
  </div>`);
});

/* ================= INDUSTRY ================= */
const APPLICANTS = [
  {name:'Priya Sharma', match:94, cgpa:'8.6', skills:[['Python',1],['SQL',1],['Communication',1]], status:'interview'},
  {name:'Rahul Deshmukh', match:88, cgpa:'8.2', skills:[['Python',1],['SQL',1],['Communication',0]], status:'shortlisted'},
  {name:'Ananya Rao', match:83, cgpa:'8.9', skills:[['Python',1],['SQL',0],['Communication',1]], status:'applied'},
  {name:'Karthik Nair', match:76, cgpa:'7.8', skills:[['Python',1],['SQL',0],['Communication',0]], status:'applied'},
];
route('/industry/dash', ()=>{
  mount(shell('industry','dash','Dashboard','', `
    <div class="grid g4">
      ${[['Total Applicants','142','+12 this week'],['Average Match %','81%','+3% vs last drive'],['Shortlisted','18','4 interviews booked'],['Offers Extended','5','Seafoam = success']].map(k=>`
      <div class="card hoverable"><div class="muted" style="font-size:12.5px">${k[0]}</div><div class="kpi-v num">${k[1]}</div><div class="kpi-d">${k[2]}</div></div>`).join('')}
    </div>
    <div class="section-title"><h2>Live Opportunity — Software Engineering Intern</h2><a href="#/industry/applicants" class="btn btn-primary btn-sm">Review Applicants →</a></div>
    <div class="card"><div class="row wrap">${tag('Python · min 8/10')}${tag('SQL · min 7/10')}${tag('Communication · min 6/10')}</div>
      <p class="muted mt8">Matching against demonstrated & verified student skills only.</p>
      <div class="funnel mt16">${[['Applied',142,100],['Shortlisted',18,52],['Interview',9,38],['Offered',5,28],['Placed',3,20]].map(f=>`
        <div class="fstage num" style="width:${f[2]}%">${f[0]} — ${f[1]}</div>`).join('')}</div></div>
  `));
});

/* ---- 11 Post Opportunity ---- */
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
          <button class="btn btn-ghost">Save Draft</button>
          <button class="btn btn-primary" onclick="toast('Opportunity published — students can now apply 🎉')">Publish Opportunity</button></div>
      </div>
    </div>
  `));
});

/* ---- 12 Applicant Management ---- */
route('/industry/applicants', ()=>{
  mount(shell('industry','applicants','Applicants','', `
    <div class="grid g4">
      ${[['Total Applicants','142'],['Average Match %','81%'],['Shortlisted','18'],['Interviews','9']].map(k=>`
      <div class="card"><div class="muted" style="font-size:12.5px">${k[0]}</div><div class="kpi-v num">${k[1]}</div></div>`).join('')}
    </div>
    <div class="card mt16" style="padding:0;overflow:hidden">
      <table class="tbl"><thead><tr><th>Applicant</th><th>Match</th><th>CGPA</th><th>Verified Skills</th><th>Skill Compatibility</th><th>Status</th></tr></thead><tbody>
      ${APPLICANTS.map((a,i)=>`
        <tr><td><div class="row"><span class="avatar" style="width:32px;height:32px;font-size:11px">${a.name.split(' ').map(x=>x[0]).join('')}</span><div><strong>${a.name}</strong><div class="muted" style="font-size:11.5px">ABC University · 2027</div></div></div></td>
        <td>${matchBadge(a.match)}</td><td class="num">${a.cgpa}</td>
        <td>${a.skills.map(s=>`<span class="row" style="gap:4px;display:inline-flex;margin-right:10px;font-size:12.5px">${s[1]?'<span style="color:#0f766e">✓</span>':'<span style="color:#94a3b8">○</span>'}${s[0]}</span>`).join('')}</td>
        <td style="min-width:130px">${bar(a.match,a.match>85?'sea':a.match>80?'':'amber')}</td>
        <td><select class="status-select" onchange="setApplicantStatus(${i}, this.value)">
          ${KCOLS.map(([k,l])=>`<option value="${k}" ${a.status===k?'selected':''}>${l}</option>`).join('')}
          <option value="rejected" ${a.status==='rejected'?'selected':''}>Rejected</option></select></td></tr>`).join('')}
      </tbody></table></div>
    <p class="muted mt16" style="font-size:12.5px">↔ Changing a status instantly updates the student's Application Tracker and sends a notification.</p>
  `));
});
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

/* ---- 13 Learning Programs ---- */
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
        <div class="field"><label>Description</label><textarea>Hands-on bootcamp covering modern JavaScript, React basics, and API integration. Capstone project with mentor review.</textarea></div>
        <button class="btn btn-primary" style="width:100%" onclick="toast('Program published — institutions can now assign it to students')">Publish Program</button>
      </div>
      <div class="grid g2">
        ${[['JavaScript & Full-Stack Bootcamp','Workshop · 4 weeks',['JavaScript','Full-Stack','APIs'],'120 interested'],['Python for Data Roles','Certification · 6 weeks',['Python','Data Analytics'],'86 interested'],['System Design Mentorship','Mentorship · 8 weeks',['System Design','SQL'],'34 interested']].map(p=>`
        <div class="card hoverable"><div class="row between"><h3>${p[0]}</h3><span class="chip num">${p[3].split(' ')[0]}</span></div>
          <div class="muted mt8">${p[1]}</div><div class="row wrap mt8">${p[2].map(tag).join('')}</div></div>`).join('')}
      </div>
    </div>
  `));
});

/* ---- 18 Engage Talent Hub (Industry) ---- */
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
            <div class="muted">Faculty eligibility: Assistant Prof & above, CS/IT/ECE</div>
            <div class="muted mt8">Industry partner: Infosys</div>
            <div class="muted mt8">Certificate: Jointly issued, verifiable on SkillBridge</div>
            <div class="muted mt8">Seats: 40 · Mode: Hybrid</div></div>
        </div>
        <div class="row mt16" style="justify-content:flex-end;gap:10px">
          <button class="btn btn-ghost" onclick="toast('Saved to your FDP list')">Save</button>
          <button class="btn btn-primary" onclick="toast('FDP application submitted ✓');setTimeout(()=>nav('/academician/research'),800)">Apply for FDP</button></div>
      </div>
      <div class="card"><div class="eyebrow">FDP Calendar</div>
        ${[['30 Sep','Apply-by · Advanced ML for Healthcare','IIT Madras'],['04 Oct','Zoho Full-Stack Workshop (guest faculty)','Chennai'],['02 Nov','Wipro FDP · Data Engineering','Apply by 20 Oct']].map(e=>`
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
        <p class="muted mt8">Build interpretable clinical prediction models on anonymized hospital data. Industry co-supervision, publication and IP support included.</p>
        <div class="row mt16" style="gap:10px">
          <button class="btn btn-primary" onclick="toast('Interest expressed — Infosys research team notified 🔬');state.notifications.industry.unshift({ico:'🔬',text:'Dr. Lakshmi Iyer expressed interest in a research collaboration.',time:'just now',unread:true})">Express Interest</button>
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
        <div class="alert-strip mt16" style="background:#f0fdfa;border-color:#99f6e4">${seal()}<span><strong>Industry readiness +31%</strong> — SkillBridge identifies, solves, and measures.</span></div>
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
      <button class="btn btn-primary" onclick="closeModal();toast('Intervention launched — 184 students assigned 📣');setTimeout(()=>nav('/institution/skillhealth'),900)">Confirm Launch</button></div></div>`);
}

route('/institution/skillhealth', ()=>{
  mount(shell('institution','skillhealth','Skill Health','', `
    ${state.enrolled?`<div class="alert-strip" style="background:#f0fdfa;border-color:#99f6e4;margin-bottom:18px">${seal()}<div><strong>JavaScript Bootcamp intervention is live.</strong><div class="muted">184 students assigned · completion and verification will appear here.</div></div></div>`:''}
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
      <p class="muted" style="font-size:12.5px">The gap is closing after interventions — demand line converging with supply.</p></div>
  `));
});

/* ---- 20 Partnerships Hub (Institution) — directory + timeline split ---- */
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
          ${[['18 Sep','Infosys Guest Lecture','done'],['25 Sep','TCS Recruitment Drive','done'],['04 Oct','Zoho Full-Stack Workshop',''],['18 Oct','Campus AI Challenge — TCS · 300 students · Python · AI · Data Analytics',''],['02 Nov','Wipro FDP','']].map(e=>`
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

/* ================= NOTIFICATIONS (shared) ================= */
route('/:role/notifications'.replace(':role','student'), ()=>renderNotifs('student'));
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
      :`<div class="empty"><div class="big">🔔</div><strong>All caught up</strong><p>New notifications about applications, verifications, and partnerships will appear here.</p></div>`}
    </div>
    <div class="row mt24" style="justify-content:center;gap:10px">
      <span class="muted">Switch role to see cross-role updates:</span>
      ${['student','industry','academician','institution'].map(r=>`<a class="btn btn-secondary btn-sm" href="#/${r}/${r==='student'?'dashboard':r==='industry'?'dash':r==='academician'?'home':'overview'}">${r[0].toUpperCase()+r.slice(1)}</a>`).join('')}
    </div>
  `));
  setTimeout(()=>{ const d=document.querySelector('.topbar .dot-unread'); if(d) d.remove(); }, 100);
}


/* ------- Global helpers for inline handlers (innerHTML-safe) ------- */
function updateChallenge(){
  const c=document.querySelectorAll('.req-check:checked').length;
  const t=document.getElementById('chProgressText'); if(t) t.textContent=c+' / 5 requirements';
  const inner=document.querySelector('#chBar .bar div'); if(inner) inner.style.width=(c/5*100)+'%';
  const b=document.getElementById('submitCh'); if(b) b.disabled=c<5;
}
function completeChallenge(){ toast('Challenge completed — practice evidence added ✓'); setTimeout(()=>nav('/student/project'),900); }
function answerQ(i){
  const q=QUESTIONS[assessQ];
  const opts=document.querySelectorAll('.assess-opt');
  if(opts[i]) opts[i].classList.add('sel');
  setTimeout(()=>{ assessQ++; if(assessQ<QUESTIONS.length){ renderQuestion(); } else { nav('/student/journey?verified=1'); } },450);
}
function radarChart(series,labels){
  const cx=130,cy=115,R=88,n=labels.length;
  function pt(i,v){const a=-Math.PI/2+i*2*Math.PI/n;return [cx+R*v*Math.cos(a),cy+R*v*Math.sin(a)];}
  let grid='';for(let g=1;g<=4;g++){const pts=labels.map(function(_,i){return pt(i,g/4).join(',');}).join(' ');grid+='<polygon points="'+pts+'" fill="none" stroke="#E2E8F0"/>';}
  let axes='',labs='';labels.forEach(function(l,i){var p=pt(i,1.22),p1=pt(i,1);axes+='<line x1="'+cx+'" y1="'+cy+'" x2="'+p1[0]+'" y2="'+p1[1]+'" stroke="#E2E8F0"/>';labs+='<text x="'+p[0]+'" y="'+p[1]+'" text-anchor="middle" font-size="10.5" fill="#475569" font-family="Inter">'+l+'</text>';});
  let polys=series.map(function(s){const pts=s.map(function(v,i){return pt(i,v/100).join(',');}).join(' ');return '<polygon points="'+pts+'" fill="rgba(14,165,233,.28)" stroke="#0EA5E9" stroke-width="2"/>';}).join('');
  return '<svg viewBox="0 0 260 230" style="width:100%">'+grid+axes+polys+labs+'</svg>';
}
function switchTab(el,i){
  document.querySelectorAll('.tab').forEach(function(t){t.classList.remove('active');}); el.classList.add('active');
  for(let j=0;j<5;j++){const p=document.getElementById('ptab-'+j); if(p) p.style.display=j===i?'block':'none';}
}

/* ---------------- INIT ---------------- */
render();
