const KEY = 'intlJourneyState';

function getState() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : { nationality: null, major: null, internship: null };
  } catch (e) {
    return { nationality: null, major: null, internship: null };
  }
}

function setState(patch) {
  const current = getState();
  const next = { ...current, ...patch };
  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

function renderProgress(stepIndex) {
  const bar = document.querySelector('.progress-bar');
  if (!bar) return;

  const total = 3;
  const fraction = bar.querySelector('.fraction');
  if (fraction) {
    fraction.textContent = `${stepIndex} / ${total}`;
  }

  const line = bar.querySelector('.indicator-line');
  if (line) {
    const width = bar.getBoundingClientRect().width || 0;
    const pos = (stepIndex / total) * width;
    line.style.left = `${Math.max(0, pos - 1)}px`;
  }
}

function attachChoiceHandlers(root, onSelect) {
  const container = root.querySelector('.choices');
  if (!container) return;

  container.querySelectorAll('[data-value]').forEach(btn => {
    btn.addEventListener('click', e => {
      const value = e.currentTarget.dataset.value;
      container.querySelectorAll('[data-value]').forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      if (typeof onSelect === 'function') onSelect(value);
    });
  });
}

const visaDetails = {
  Canada: `
    <h3>Primary pathway: <strong>TN (USMCA)</strong></h3>
    <ul>
      <li><strong>Lottery:</strong> No H-1B lottery for TN-eligible professions.</li>
      <li><strong>Stability:</strong> Renewable status as long as you stay in a qualifying role.</li>
      <li><strong>Still tricky:</strong> You still need a job offer in a listed profession and an employer who understands the paperwork.</li>
    </ul>
  `,
  Mexico: `
    <h3>Primary pathway: <strong>TN (USMCA)</strong></h3>
    <ul>
      <li><strong>Lottery:</strong> Similar TN structure to Canada; not subject to the H-1B cap.</li>
      <li><strong>Paperwork:</strong> Title, duties and degree have to match the treaty list.</li>
      <li><strong>Job search:</strong> Recruiters may still default to “we only do H-1B” unless you push for TN.</li>
    </ul>
  `,
  Australia: `
    <h3>Primary pathway: <strong>E-3</strong> specialty occupation</h3>
    <ul>
      <li><strong>Lottery:</strong> Separate E-3 category, historically underused compared with H-1B.</li>
      <li><strong>Benefits:</strong> Renewable in two-year chunks; spouses can usually work.</li>
      <li><strong>Signal:</strong> For employers, E-3 can feel less risky than competing in the H-1B lottery.</li>
    </ul>
  `,
  India: `
    <h3>Typical path: <strong>F-1 → OPT → H-1B</strong></h3>
    <ul>
      <li><strong>Lottery:</strong> Competes in the H-1B cap, where demand often far exceeds supply.</li>
      <li><strong>Timing:</strong> STEM grads usually get up to 36 months of OPT; others often get 12.</li>
      <li><strong>Reality:</strong> Many strong candidates lose purely because their number never comes up in the lottery.</li>
    </ul>
  `,
  China: `
    <h3>Typical path: <strong>F-1 → OPT → H-1B</strong></h3>
    <ul>
      <li><strong>Lottery:</strong> Same H-1B cap constraints as Indian students.</li>
      <li><strong>Risk:</strong> If OPT time runs out without a sponsor, you may have to leave even after doing everything “right.”</li>
      <li><strong>Alternatives:</strong> A small fraction qualify later for O-1 or employer-backed green cards.</li>
    </ul>
  `,
  Korea: `
    <h3>Typical path: <strong>F-1 → OPT → H-1B or other work visas</strong></h3>
    <ul>
      <li><strong>No dedicated work visa:</strong> No TN-style category; H-1B is often the default target.</li>
      <li><strong>Strategy:</strong> Internships and early offers matter more because of the limited OPT window.</li>
      <li><strong>Advocacy:</strong> Many grads have to educate employers about sponsorship instead of the other way around.</li>
    </ul>
  `,
  Japan: `
    <h3>Typical path: <strong>F-1 → OPT → H-1B or transfers within multinationals</strong></h3>
    <ul>
      <li><strong>Corporate paths:</strong> Some students aim for U.S. roles at companies with offices in Japan and the U.S.</li>
      <li><strong>Timing:</strong> Like other F-1 students, the OPT clock is unforgiving.</li>
      <li><strong>Plan B:</strong> Returning home and re-entering later via intra-company transfers is a common story arc.</li>
    </ul>
  `,
  Other: `
    <h3>General path: <strong>F-1 → OPT → H-1B (or other niche visas)</strong></h3>
    <ul>
      <li><strong>Patchwork:</strong> Your options depend heavily on your country’s treaties and your field.</li>
      <li><strong>Most common:</strong> F-1 OPT followed by an H-1B attempt remains the default for many students.</li>
      <li><strong>Important:</strong> Always check the latest official guidance or an immigration attorney for specifics.</li>
    </ul>
  `
};

function computeScore() {
  const s = getState();
  let score = 5;

  if (['Australia', 'Canada', 'Mexico'].includes(s.nationality)) score -= 2;
  else if (['India', 'China'].includes(s.nationality)) score += 2;

  if (s.major === 'STEM') score -= 2;
  if (s.major === 'Non-STEM') score += 2;

  if (s.internship === 'Yes') score -= 1;
  if (s.internship === 'No') score += 1;

  return Math.min(10, Math.max(1, score));
}

document.addEventListener('DOMContentLoaded', () => {
  renderProgress(0);

  function revealSection(id, stepIndex) {
    const section = document.getElementById(id);
    if (section) {
      section.classList.add('is-visible');
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    if (typeof stepIndex === 'number') {
      renderProgress(stepIndex);
    }
  }


  const startBtn = document.getElementById('startBtn');
  if (startBtn) {
    startBtn.addEventListener('click', () => {
      localStorage.removeItem(KEY);
      revealSection('step1', 1);
    });
  }

  const jumpStoryBtn = document.getElementById('jumpStoryBtn');
  if (jumpStoryBtn) {
    jumpStoryBtn.addEventListener('click', () => {
      const section = document.getElementById('storySection');
      if (section) {
        section.classList.add('is-visible');
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }


  const step1 = document.getElementById('step1');
  if (step1) {
    const info = document.getElementById('visaInfo');

    attachChoiceHandlers(step1, nationality => {
      setState({ nationality });
      if (info) {
        info.innerHTML = visaDetails[nationality] || `<p>We’re still adding details for this nationality.</p>`;
      }
      const next = document.getElementById('step1Next');
      if (next) next.disabled = false;
    });

    const back = document.getElementById('step1Back');
    if (back) {
      back.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        renderProgress(0);
      });
    }

    const next = document.getElementById('step1Next');
    if (next) {
      next.addEventListener('click', () => revealSection('step2', 2));
    }
  }


  const step2 = document.getElementById('step2');
  if (step2) {
    const majorInfo = document.getElementById('majorInfo');

    attachChoiceHandlers(step2, major => {
      setState({ major });
      let text;
      if (major === 'STEM') {
        text = `
          <p><strong>STEM degrees usually get up to 36 months of OPT</strong>, which means multiple chances to enter the H-1B lottery.</p>
          <p>That extra runway doesn’t guarantee a job, but it gives you more cycles to network, interview and try again if a lottery entry fails.</p>
        `;
      } else {
        text = `
          <p><strong>Non-STEM degrees typically get about 12 months of OPT</strong>, which often means just one realistic H-1B attempt.</p>
          <p>That compresses your job search into a shorter window and leaves less room for bad timing or hiring freezes.</p>
        `;
      }
      if (majorInfo) majorInfo.innerHTML = text;

      const next = document.getElementById('step2Next');
      if (next) next.disabled = false;
    });

    const back = document.getElementById('step2Back');
    if (back) {
      back.addEventListener('click', () => revealSection('step1', 1));
    }

    const next = document.getElementById('step2Next');
    if (next) {
      next.addEventListener('click', () => revealSection('step3', 3));
    }
  }


  const step3 = document.getElementById('step3');
  if (step3) {
    const internInfo = document.getElementById('internInfo');

    attachChoiceHandlers(step3, internship => {
      setState({ internship });
      let text;
      if (internship === 'Yes') {
        text = `
          <p>Internships create <strong>referrals, internal champions and concrete U.S. work samples</strong>.</p>
          <p>Managers can picture you in the role because they’ve already seen you handle projects, deadlines and team dynamics.</p>
        `;
      } else {
        text = `
          <p>Without internships, you’re competing mostly on resumes and cold applications.</p>
          <p>It doesn’t mean you can’t succeed, but you’ll need to lean harder on networking, portfolios and clear communication about sponsorship.</p>
        `;
      }
      if (internInfo) internInfo.innerHTML = text;

      const resultBtn = document.getElementById('showResult');
      if (resultBtn) resultBtn.disabled = false;
    });

    const back = document.getElementById('step3Back');
    if (back) {
      back.addEventListener('click', () => revealSection('step2', 2));
    }

    const resultBtn = document.getElementById('showResult');
    if (resultBtn) {
      resultBtn.addEventListener('click', () => {
        const score = computeScore();
        const s = getState();

        const badge = document.getElementById('scoreBadge');
        if (badge) badge.textContent = `${score} / 10`;

        const meter = document.getElementById('meterFill');
        if (meter) meter.style.width = `${(score / 10) * 100}%`;

        const parts = [];
        parts.push(`<span class="pill">Base: 5</span>`);

        if (['Australia', 'Canada', 'Mexico'].includes(s.nationality)) {
          parts.push(`<span class="pill">Nationality (${s.nationality}): −2</span>`);
        } else if (['India', 'China'].includes(s.nationality)) {
          parts.push(`<span class="pill">Nationality (${s.nationality}): +2</span>`);
        } else {
          parts.push(`<span class="pill">Nationality (${s.nationality || '—'}): ±0</span>`);
        }

        if (s.major === 'STEM') parts.push(`<span class="pill">Major (STEM): −2</span>`);
        if (s.major === 'Non-STEM') parts.push(`<span class="pill">Major (Non-STEM): +2</span>`);

        if (s.internship === 'Yes') parts.push(`<span class="pill">Internships: −1</span>`);
        if (s.internship === 'No') parts.push(`<span class="pill">Internships: +1</span>`);

        const explain = document.getElementById('scoreExplain');
        if (explain) {
          explain.innerHTML = `
            <p>Your selections suggest a <strong>${score}/10</strong> difficulty in securing a first U.S. role with sponsorship.</p>
            <p>${parts.join(' ')}</p>
          `;
        }

        revealSection('resultSection', 3);
      });
    }
  }


  const restart = document.getElementById('restartBtn');
  if (restart) {
    restart.addEventListener('click', () => {
      localStorage.removeItem(KEY);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      renderProgress(0);
    });
  }

  const toStory = document.getElementById('toStoryBtn');
  if (toStory) {
    toStory.addEventListener('click', () => {
      revealSection('storySection', 3);
    });
  }
});
