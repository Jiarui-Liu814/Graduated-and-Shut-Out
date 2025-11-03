const KEY = 'intlJourneyState';
function getState(){
  try{ return JSON.parse(localStorage.getItem(KEY)) || { nationality:null, major:null, internship:null }; }
  catch(e){ return { nationality:null, major:null, internship:null }; }
}
function setState(patch){
  const s = getState();
  const next = {...s, ...patch};
  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

function renderProgress(idx){
  const pb = document.querySelector('.progress-bar');
  if(!pb) return;
  const total = 3;
  const width = pb.getBoundingClientRect().width;
  const fraction = document.querySelector('.fraction');
  if(fraction) fraction.textContent = `${idx} / ${total}`;
  const line = pb.querySelector('.indicator-line');
  const pos = (idx/total) * width;
  line.style.left = (pos - 1) + 'px';
}


function attachChoices(onSelect){
  document.querySelectorAll(`.choices [data-value]`).forEach(btn=>{
    btn.addEventListener('click', e=>{
      const val = e.currentTarget.dataset.value;
      e.currentTarget.closest('.choices').querySelectorAll('[data-value]').forEach(b=>b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      onSelect(val);
    });
  });
}


const visaDetails = {
  "Canada": `
    <h3>Primary pathway: <strong>TN (USMCA)</strong></h3>
    <ul>
      <li><strong>Lottery:</strong> None. Not subject to H-1B lottery or the 85,000 cap.</li>
      <li><strong>How it works:</strong> Employer offer in a listed profession + proof of qualifications. Canadians can apply at the border; renewals are common.</li>
      <li><strong>Employer signal:</strong> Faster onboarding & lower sponsorship risk than H-1B; many firms are more open to new grads.</li>
    </ul>`,
  "Mexico": `
    <h3>Primary pathway: <strong>TN (USMCA)</strong></h3>
    <ul>
      <li><strong>Lottery:</strong> None. Not subject to H-1B lottery/cap.</li>
      <li><strong>How it works:</strong> Employer letter + profession on the USMCA list; consular visa required before entry.</li>
      <li><strong>Employer signal:</strong> Lower risk than H-1B. F-1 OPT can bridge you into TN.</li>
    </ul>`,
  "Australia": `
    <h3>Primary pathway: <strong>E-3</strong> (specialty occupation)</h3>
    <ul>
      <li><strong>Lottery:</strong> None. Separate annual quota (~10,500 principals) historically under-subscribed.</li>
      <li><strong>How it works:</strong> Similar to H-1B (LCA + job offer) but processed as E-3; renewables, spouse work eligibility (E-3D).</li>
      <li><strong>Employer signal:</strong> Less uncertainty than H-1B, often easier sell for entry-level hiring.</li>
    </ul>`,
  "India": `
    <h3>Typical path: <strong>F-1 OPT → H-1B</strong></h3>
    <ul>
      <li><strong>Lottery:</strong> Yes. Competes in the H-1B lottery (85,000 total: 65k regular + 20k U.S. master’s).</li>
      <li><strong>Runway:</strong> OPT time matters—STEM grads can reach up to 36 months (more lottery shots) vs. 12 months for non-STEM.</li>
      <li><strong>Notes:</strong> Cap-exempt employers (universities/nonprofits) bypass the cap; alternatives like O-1/L-1 exist but are less common for new grads.</li>
    </ul>`,
  "China": `
    <h3>Typical path: <strong>F-1 OPT → H-1B</strong></h3>
    <ul>
      <li><strong>Lottery:</strong> Yes. Subject to the same 85,000 H-1B cap and random selection.</li>
      <li><strong>Employer view:</strong> Smaller firms may avoid lottery risk or timing costs; targeting sponsors early is key.</li>
      <li><strong>Notes:</strong> O-1 (extraordinary ability) or L-1 (after time with a multinational) are possible but niche for first jobs.</li>
    </ul>`,
  "Korea": `
    <h3>Typical path: <strong>F-1 OPT → H-1B</strong></h3>
    <ul>
      <li><strong>Lottery:</strong> Yes (H-1B cap + lottery).</li>
      <li><strong>Strategy:</strong> Secure offers early in OPT and prioritize companies with recent sponsorship history.</li>
    </ul>`,
  "Japan": `
    <h3>Typical path: <strong>F-1 OPT → H-1B</strong></h3>
    <ul>
      <li><strong>Lottery:</strong> Yes (H-1B cap + lottery).</li>
      <li><strong>Strategy:</strong> Employer education and timelines matter; consider cap-exempt roles where relevant.</li>
    </ul>`,
  "Others": `
    <h3>Typical path: <strong>F-1 OPT → H-1B</strong></h3>
    <ul>
      <li><strong>Lottery:</strong> Yes for most nationalities; the H-1B is capped/lottery-based.</li>
      <li><strong>Alternatives:</strong> O-1 (extraordinary ability) or L-1 (intra-company transfer) in specific situations.</li>
    </ul>`
};


function computeScore(){
  const s = getState();
  let score = 5;
  if(['Australia','Canada','Mexico'].includes(s.nationality)) score -= 2;
  else if(['India','China'].includes(s.nationality)) score += 2;
  if(s.major === 'STEM') score -= 2;
  if(s.major === 'Non-STEM') score += 2;
  if(s.internship === 'Yes') score -= 1;
  if(s.internship === 'No') score += 1;
  return Math.min(10, Math.max(1, score));
}

window.addEventListener('load', ()=>{
  const page = document.body.dataset.page;

  if(page === 'landing'){
    renderProgress(0);
    document.getElementById('startBtn').addEventListener('click', ()=>{
      localStorage.setItem(KEY, JSON.stringify({nationality:null, major:null, internship:null}));
      window.location.href = 'nationality.html';
    });
    return;
  }

  if(page === 'nationality'){
    renderProgress(1);
    const info = document.getElementById('visaInfo');
    attachChoices(val=>{
      setState({nationality: val});
      const detail = visaDetails[val] || '';
      info.innerHTML = detail;
      document.querySelector('[data-nav="next"]').disabled = false;
    });
  }

  if(page === 'major'){
    renderProgress(2);
    const info = document.getElementById('majorInfo');
    attachChoices(val=>{
      setState({major: val});
      const text = val === 'STEM'
        ? `<strong>36-month OPT</strong> runway and up to three H-1B attempts; stronger conversion when paired with internships.  If they have already interned at a company during their degree, they may be offered a full-time role and begin work immediately using their OPT. With three years of work authorization, they have up to three chances to be selected in the H-1B lottery.`
        : `<strong>12-month OPT</strong> window and typically one H-1B attempt; sponsorship rates are lower in many non-technical sectors.  If a non-STEM student graduates without a job offer, they have 90 days to find one before losing legal status. Even if they manage to land a job quickly, they’ll likely only have one shot at the H-1B lottery. If they aren’t selected, and many aren’t, given the program’s 25% success rate. They must leave the country, often within weeks. Additionally, engineering graduates show the highest employment rates (35%), followed by Finance (20%), Media (15%), Healthcare (12%), and other fields (18%), which means that "non-STEM students exhibit transition rates not significantly different from zero".`;
      info.innerHTML = text;
      document.querySelector('[data-nav="next"]').disabled = false;
    });
  }

  if(page === 'internship'){
    renderProgress(3);
    const info = document.getElementById('internInfo');
    attachChoices(val=>{
      setState({internship: val});
      const text = val === 'Yes'
        ? `Internships build internal advocates and reduce perceived sponsorship risk; many convert to full-time on OPT. However, internship-to-job conversion rate for International students is about 30% less. International students are less likely to receive job offers from their internship employers compared to domestic students.`
        : `Without internships, grads face fewer referrals and less time before OPT runs; target firms with sponsorship history.`;
      info.innerHTML = text;
      document.querySelector('[data-nav="result"]').disabled = false;
    });
  }

  if(page === 'result'){
    const s = getState();
    const score = computeScore();
    document.getElementById('scoreBadge').textContent = `${score} / 10`;
    const meter = document.getElementById('meterFill');
    if(meter) meter.style.width = `${(score/10)*100}%`;

    const parts = [];
    parts.push(`<span class="pill">Base: 5</span>`);
    if(['Australia','Canada','Mexico'].includes(s.nationality)) parts.push(`<span class="pill">Nationality (${s.nationality}): −2</span>`);
    else if(['India','China'].includes(s.nationality)) parts.push(`<span class="pill">Nationality (${s.nationality}): +2</span>`);
    else parts.push(`<span class="pill">Nationality (${s.nationality||'—'}): ±0</span>`);
    if(s.major==='STEM') parts.push(`<span class="pill">Major (STEM): −2</span>`);
    if(s.major==='Non-STEM') parts.push(`<span class="pill">Major (Non-STEM): +2</span>`);
    if(s.internship==='Yes') parts.push(`<span class="pill">Internships: −1</span>`);
    if(s.internship==='No') parts.push(`<span class="pill">Internships: +1</span>`);

    const explain = document.getElementById('scoreExplain');
    if(explain){
      explain.innerHTML = `<p>Your selections suggest a <strong>${score}/10</strong> difficulty in securing a first U.S. role with sponsorship.</p>
                           <p>${parts.join(' ')}</p>`;
    }

    const restart = document.getElementById('restartBtn');
    if(restart){
      restart.addEventListener('click', ()=>{
        localStorage.setItem(KEY, JSON.stringify({nationality:null, major:null, internship:null}));
        window.location.href = 'index.html';
      });
    }
  }

  document.querySelectorAll('[data-link]').forEach(el=>{
    el.addEventListener('click', (e)=>{
      const href = e.currentTarget.getAttribute('data-link');
      window.location.href = href;
    });
  });
});
