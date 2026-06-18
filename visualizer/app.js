// ============================================================
// AEAI — Narrative Journey Application Logic
// ============================================================

// ── State ─────────────────────────────────────────────────────
let currentStep = 0;
let prevScreenId = 'screen-hero';
let mapTab = 'flow';
let expandedNodeId = null;

// ── Init ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initBgCanvas();
  populateHero();
});

// ═══════════════════════════════════════════════════════════════
// SCREEN NAVIGATION (visibility-based, no display toggle)
// ═══════════════════════════════════════════════════════════════
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => {
    s.classList.remove('screen-active');
  });
  const target = document.getElementById(id);
  if (target) {
    // Small tick lets CSS transition fire properly
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        target.classList.add('screen-active');
        target.scrollTop = 0;
      });
    });
  }
}

// ═══════════════════════════════════════════════════════════════
// HERO SCREEN
// ═══════════════════════════════════════════════════════════════
function populateHero() {
  // Set claim text
  const claimEl = document.getElementById('heroClaimText');
  if (claimEl) claimEl.textContent = EXAMPLE_CLAIM;

  // Build layer stack (first 7 + "and more")
  const stack = document.getElementById('heroLayerStack');
  if (!stack) return;

  LAYERS.slice(0, 8).forEach((layer, i) => {
    const item = document.createElement('div');
    item.className = 'layer-stack-item';
    item.style.borderLeftColor = layer.color;
    item.style.animationDelay = `${i * 0.1}s`;
    item.innerHTML = `
      <span class="lsi-icon">${layer.icon}</span>
      <span class="lsi-id" style="color:${layer.color}">${layer.id}</span>
      <span class="lsi-name">${layer.name}</span>
      <span class="lsi-dot" style="background:${layer.color}"></span>
    `;
    stack.appendChild(item);
  });

  const more = document.createElement('div');
  more.className = 'layer-stack-more';
  more.textContent = '+ 6 more layers';
  stack.appendChild(more);
}

function startJourney() {
  currentStep = 0;
  prevScreenId = 'screen-hero';
  renderWalkStep(currentStep);
  showScreen('screen-walk');
}

function restartJourney() {
  currentStep = 0;
  renderWalkStep(currentStep);
  showScreen('screen-hero');
}

// ═══════════════════════════════════════════════════════════════
// WALKTHROUGH SCREEN
// ═══════════════════════════════════════════════════════════════
function renderWalkStep(index) {
  const state = CLAIM_STATES[index];
  const layer = LAYERS.find(l => l.id === state.layerId);

  // ── Progress Rail ──
  buildProgressRail(index);
  document.getElementById('progressLayerLabel').textContent =
    `${layer.icon} ${layer.id} — ${layer.name}`;
  document.getElementById('progressCount').textContent =
    `${index + 1} / ${CLAIM_STATES.length}`;
  const pct = ((index + 1) / CLAIM_STATES.length) * 100;
  document.getElementById('progressFill').style.width = `${pct}%`;

  // ── Left panel ──
  const pill = document.getElementById('walkLayerId');
  pill.textContent = `${layer.id} — ${layer.tier}`;
  pill.style.color = layer.color;
  pill.style.borderColor = layer.color + '55';
  pill.style.background = layer.color + '18';

  document.getElementById('walkLayerName').textContent = layer.name;
  document.getElementById('walkLayerTagline').textContent = layer.tagline;
  document.getElementById('walkLayerDesc').textContent = layer.desc;

  const factsEl = document.getElementById('walkLayerFacts');
  factsEl.innerHTML = '';
  layer.facts.forEach((fact, i) => {
    const item = document.createElement('div');
    item.className = 'fact-item';
    item.style.animationDelay = `${i * 0.08}s`;
    item.innerHTML = `
      <span class="fact-dot" style="background:${layer.color}"></span>
      <span>${fact}</span>
    `;
    factsEl.appendChild(item);
  });

  // ── Right panel ──
  const badge = document.getElementById('walkStageBadge');
  badge.textContent = state.stage;
  badge.style.background = state.stageColor + '20';
  badge.style.color = state.stageColor;
  badge.style.borderColor = state.stageColor + '50';
  document.getElementById('walkClaimStateTitle').textContent = state.what;

  renderClaimCard(state, layer);

  // ── Nav buttons ──
  document.getElementById('btnPrev').disabled = index === 0;
  const nextBtn = document.getElementById('btnNext');
  if (index >= CLAIM_STATES.length - 1) {
    nextBtn.innerHTML = `
      See Verdict
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
    `;
  } else {
    nextBtn.innerHTML = `
      Next
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
    `;
  }
}

function buildProgressRail(currentIdx) {
  const rail = document.getElementById('progressRail');
  rail.innerHTML = '';
  CLAIM_STATES.forEach((s, i) => {
    const dot = document.createElement('div');
    dot.className = 'pr-dot' + (i === currentIdx ? ' pr-active' : i < currentIdx ? ' pr-done' : '');
    dot.title = LAYERS.find(l => l.id === s.layerId)?.name || '';
    dot.setAttribute('aria-label', `Layer ${i + 1}: ${dot.title}`);
    dot.onclick = () => jumpToStep(i);
    rail.appendChild(dot);
  });
}

function jumpToStep(i) {
  currentStep = i;
  renderWalkStep(i);
  document.getElementById('screen-walk').scrollTop = 0;
}

function nextLayer() {
  if (currentStep >= CLAIM_STATES.length - 1) {
    showVerdictScreen();
    return;
  }
  currentStep++;
  renderWalkStep(currentStep);
  document.getElementById('screen-walk').scrollTop = 0;
}

function prevLayer() {
  if (currentStep <= 0) return;
  currentStep--;
  renderWalkStep(currentStep);
  document.getElementById('screen-walk').scrollTop = 0;
}

// ── Claim Card renderer ──────────────────────────────────────
function renderClaimCard(state, layer) {
  // Use a wrapper div that always keeps id="claimStateCard"
  // so subsequent calls can always find it
  let wrapper = document.getElementById('claimStateCard');
  if (!wrapper) return;

  wrapper.innerHTML = ''; // clear for re-animation
  wrapper.style.borderTop = `3px solid ${layer.color}`;
  wrapper.classList.remove('claim-state-card');
  void wrapper.offsetWidth; // reflow trigger
  wrapper.classList.add('claim-state-card');

  const header = document.createElement('div');
  header.className = 'csc-header';
  header.textContent = state.claimCard.label;
  wrapper.appendChild(header);

  const body = document.createElement('div');

  if (state.claimCard.treeMode) {
    body.className = 'csc-tree';
    state.claimCard.tree.forEach(node => {
      const row = document.createElement('div');
      row.className = 'tree-node';
      const branch = '  '.repeat(node.depth) + (node.depth === 0 ? '' : node.depth === 1 ? '├─ ' : '│  ├─ ');
      row.innerHTML = `
        <span class="tree-branch">${branch || ''}</span>
        <span class="${node.depth === 0 ? 'tree-root' : ''}">${node.label}</span>
      `;
      body.appendChild(row);
    });

  } else if (state.claimCard.queueMode) {
    body.className = 'csc-queue';
    state.claimCard.items.forEach(item => {
      const row = document.createElement('div');
      row.className = 'queue-row';
      const rankHtml = item.rank
        ? `<div class="queue-rank">${item.rank}</div>`
        : `<div class="queue-rank" style="background:rgba(124,58,237,0.08);color:var(--txt-3)">—</div>`;
      row.innerHTML = `
        ${rankHtml}
        <span class="queue-label">${item.label}</span>
        <div class="queue-meta">
          <span>${item.reuse}</span>
          <span>${item.priority}</span>
        </div>
      `;
      body.appendChild(row);
    });

  } else if (state.claimCard.avcMode) {
    body.className = 'csc-avc';

    const pDiv = document.createElement('div');
    pDiv.className = 'avc-agent avc-prosecutor';
    pDiv.innerHTML = `<div class="avc-label">⚔ PROSECUTOR</div>${state.claimCard.prosecutor}`;
    body.appendChild(pDiv);

    const dDiv = document.createElement('div');
    dDiv.className = 'avc-agent avc-defender';
    dDiv.innerHTML = `<div class="avc-label">🛡 DEFENDER</div>${state.claimCard.defender}`;
    body.appendChild(dDiv);

    const adj = state.claimCard.adjudicator;
    const aDiv = document.createElement('div');
    aDiv.className = 'avc-adjudicator';
    aDiv.innerHTML = `
      <div>
        <div class="adj-label">⚖ ADJUDICATOR SCORE</div>
        <div class="adj-score">${adj.score}</div>
      </div>
      <div class="adj-note">${adj.label}</div>
    `;
    body.appendChild(aDiv);

  } else if (state.claimCard.formulaMode) {
    body.className = 'csc-formula';
    state.claimCard.steps.forEach(step => {
      const row = document.createElement('div');
      row.className = 'formula-row' + (step.highlight ? ' highlight' : '');
      const valHtml = step.badge
        ? `<span class="csc-badge badge-${step.badge}">${step.val}</span>`
        : `<span class="formula-val">${step.val}</span>`;
      row.innerHTML = `<span class="formula-label">${step.label}</span>${valHtml}`;
      body.appendChild(row);
    });

  } else {
    // Default: field rows
    state.claimCard.fields.forEach(field => {
      const row = document.createElement('div');
      row.className = 'csc-field';
      let valHtml;
      if (field.badge) {
        valHtml = `<span class="csc-badge badge-${field.badge}">${field.val}</span>`;
      } else {
        valHtml = `<span class="csc-val${field.mono ? ' mono' : ''}">${field.val}</span>`;
      }
      row.innerHTML = `<span class="csc-key">${field.key}</span>${valHtml}`;
      body.appendChild(row);
    });
  }

  wrapper.appendChild(body);
}

// ═══════════════════════════════════════════════════════════════
// VERDICT SCREEN
// ═══════════════════════════════════════════════════════════════
function showVerdictScreen() {
  prevScreenId = 'screen-walk';
  const v = FINAL_VERDICT;

  // Icon
  document.getElementById('verdictIcon').textContent =
    v.state === 'VERIFIED' ? '✅' : v.state === 'DISPUTED' ? '⚠️' : '❌';

  // State
  const stateEl = document.getElementById('verdictState');
  stateEl.textContent = v.state;
  stateEl.className = `verdict-state verdict-${v.state.toLowerCase()}`;

  // Confidence
  document.getElementById('verdictConfidence').textContent =
    `Confidence Score: ${v.confidence} / 1.00`;

  // Claim echo
  document.getElementById('verdictClaimText').textContent = EXAMPLE_CLAIM;

  // Ceiling
  document.getElementById('verdictCeiling').textContent = `${v.ceiling} (${v.tier})`;

  // Breakdown
  const list = document.getElementById('breakdownList');
  list.innerHTML = '';
  v.key_layers.forEach(kl => {
    const layer = LAYERS.find(l => l.id === kl.id);
    const item = document.createElement('div');
    item.className = 'breakdown-item';
    item.innerHTML = `
      <span class="bd-id" style="color:${layer.color}">${layer.id}</span>
      <div>
        <div style="font-size:13px;font-weight:600;color:var(--txt-1);margin-bottom:3px">${layer.name}</div>
        <div class="bd-note">${kl.note}</div>
      </div>
    `;
    list.appendChild(item);
  });

  showScreen('screen-verdict');
}

// ═══════════════════════════════════════════════════════════════
// FULL MAP SCREEN
// ═══════════════════════════════════════════════════════════════
function showFullMap() {
  prevScreenId = document.querySelector('.screen-active')?.id || 'screen-hero';
  buildFlowchart();
  buildGrid();
  showScreen('screen-map');
}

function goBackFromMap() {
  showScreen(prevScreenId || 'screen-hero');
}

function switchMapTab(tab) {
  mapTab = tab;
  document.getElementById('tab-flow').className = 'map-tab' + (tab === 'flow' ? ' map-tab-active' : '');
  document.getElementById('tab-grid').className = 'map-tab' + (tab === 'grid' ? ' map-tab-active' : '');
  document.getElementById('map-flow-view').style.display = tab === 'flow' ? 'block' : 'none';
  document.getElementById('map-grid-view').style.display = tab === 'grid' ? 'block' : 'none';
}

// ── FLOWCHART ────────────────────────────────────────────────
function buildFlowchart() {
  const wrap = document.querySelector('.flowchart-wrap');
  const svgEl = document.getElementById('flowchartSVG');
  const nodesEl = document.getElementById('flowchartNodes');
  if (!wrap || !svgEl || !nodesEl) return;

  // Clear
  svgEl.innerHTML = '';
  nodesEl.innerHTML = '';

  // Compute wrap size
  const W = Math.max(wrap.offsetWidth, 900);
  const H = 960;
  svgEl.setAttribute('viewBox', `0 0 ${W} ${H}`);
  wrap.style.height = H + 'px';

  // Scale node positions to fit
  const scaleX = W / 900;
  const scaleY = H / 900;

  // Build node positions map
  const pos = {};
  LAYERS.forEach(l => {
    pos[l.id] = { x: l.x * scaleX, y: l.y * scaleY };
  });

  // Draw connections first (behind nodes)
  CONNECTIONS.forEach(conn => {
    const from = pos[conn.from];
    const to = pos[conn.to];
    if (!from || !to) return;

    const layerFrom = LAYERS.find(l => l.id === conn.from);
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const mx = from.x + dx * 0.5;
    const my = from.y + dy * 0.5;

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const d = `M ${from.x} ${from.y} C ${mx} ${from.y}, ${mx} ${to.y}, ${to.x} ${to.y}`;
    path.setAttribute('d', d);
    path.setAttribute('class', `fc-path ${conn.dashed ? 'fc-path-dashed' : 'fc-path-solid'}`);
    path.setAttribute('stroke', layerFrom?.color || '#7c3aed');
    svgEl.appendChild(path);

    // Arrow head
    if (!conn.dashed) {
      const angle = Math.atan2(to.y - (from.y + dy * 0.8), to.x - (from.x + dx * 0.8));
      const ax = to.x - 30 * Math.cos(angle);
      const ay = to.y - 30 * Math.sin(angle);
      const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      arrow.setAttribute('d', `M ${to.x} ${to.y} L ${ax - 6 * Math.sin(angle)} ${ay + 6 * Math.cos(angle)} L ${ax + 6 * Math.sin(angle)} ${ay - 6 * Math.cos(angle)} Z`);
      arrow.setAttribute('fill', layerFrom?.color || '#7c3aed');
      arrow.setAttribute('opacity', '0.45');
      svgEl.appendChild(arrow);
    }
  });

  // Draw nodes
  LAYERS.forEach(layer => {
    const p = pos[layer.id];
    if (!p) return;

    const node = document.createElement('div');
    node.className = 'fc-node';
    node.id = `fcnode-${layer.id}`;
    node.style.left = `${p.x}px`;
    node.style.top = `${p.y}px`;
    node.setAttribute('tabindex', '0');
    node.setAttribute('role', 'button');
    node.setAttribute('aria-label', `${layer.id}: ${layer.name} — click to expand`);

    node.innerHTML = `
      <div class="fc-circle" style="border-color:${layer.color};background:${layer.color}18;color:${layer.color}">
        <span class="fc-circle-icon">${layer.icon}</span>
        <span class="fc-id">${layer.id}</span>
      </div>
      <div class="fc-name">${layer.name}</div>
    `;

    node.onclick = () => expandFlowNode(layer.id);
    node.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') expandFlowNode(layer.id); };
    nodesEl.appendChild(node);
  });
}

function expandFlowNode(layerId) {
  const layer = LAYERS.find(l => l.id === layerId);
  if (!layer) return;

  const panel = document.getElementById('flowDetailPanel');

  // Deselect all
  document.querySelectorAll('.fc-node').forEach(n => n.classList.remove('fc-active'));

  if (expandedNodeId === layerId) {
    // Collapse
    panel.style.display = 'none';
    expandedNodeId = null;
    return;
  }

  expandedNodeId = layerId;
  document.getElementById(`fcnode-${layerId}`)?.classList.add('fc-active');

  panel.style.display = 'block';
  panel.innerHTML = `
    <button class="fdp-close" onclick="expandFlowNode('${layerId}')" aria-label="Close detail panel">×</button>
    <div class="fdp-header">
      <span class="fdp-icon">${layer.icon}</span>
      <div>
        <div class="fdp-id" style="color:${layer.color}">${layer.id} — ${layer.tier}</div>
        <div class="fdp-name">${layer.name}</div>
      </div>
    </div>
    <div class="fdp-tagline">${layer.tagline}</div>
    <div class="fdp-desc">${layer.desc}</div>
    <div class="fdp-facts">
      ${layer.facts.map(f => `
        <div class="fdp-fact">
          <span class="fdp-fact-dot" style="background:${layer.color}"></span>
          <span>${f}</span>
        </div>
      `).join('')}
    </div>
  `;
  panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ── GRID ─────────────────────────────────────────────────────
function buildGrid() {
  const grid = document.getElementById('layerGrid');
  if (!grid || grid.children.length > 0) return; // already built

  LAYERS.forEach((layer, i) => {
    const card = document.createElement('div');
    card.className = 'layer-grid-card';
    card.style.borderLeftColor = layer.color;
    card.style.transitionDelay = `${i * 0.04}s`;

    card.innerHTML = `
      <div class="lgc-head" style="border-bottom:1px solid ${layer.color}22">
        <span class="lgc-icon">${layer.icon}</span>
        <span class="lgc-id" style="color:${layer.color}">${layer.id}</span>
        <span class="lgc-name">${layer.name}</span>
        <span class="lgc-tier">${layer.tier}</span>
      </div>
      <div class="lgc-tagline">${layer.tagline}</div>
      <div class="lgc-desc">${layer.shortDesc || layer.desc.substring(0, 120) + '…'}</div>
    `;
    grid.appendChild(card);

    setTimeout(() => card.classList.add('card-vis'), i * 40);
  });
}

// ═══════════════════════════════════════════════════════════════
// BACKGROUND PARTICLE CANVAS
// ═══════════════════════════════════════════════════════════════
function initBgCanvas() {
  const canvas = document.getElementById('bgCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [], raf;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function mkParticle() {
    return {
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.4 + 0.3,
      dx: (Math.random() - 0.5) * 0.2, dy: (Math.random() - 0.5) * 0.2,
      op: Math.random() * 0.35 + 0.05,
      col: Math.random() > 0.6 ? '124,58,237' : Math.random() > 0.5 ? '37,99,235' : '8,145,178'
    };
  }

  function init() {
    resize();
    particles = Array.from({ length: 110 }, mkParticle);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Draw connection lines
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 85) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(124,58,237,${0.04 * (1 - d / 85)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    // Draw particles
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.col},${p.op})`;
      ctx.fill();
      p.x += p.dx; p.y += p.dy;
      if (p.x < 0 || p.x > W) p.dx *= -1;
      if (p.y < 0 || p.y > H) p.dy *= -1;
    });

    raf = requestAnimationFrame(draw);
  }

  // Pause when tab is hidden (performance)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(raf);
    else draw();
  });

  window.addEventListener('resize', () => { resize(); });
  init();
  draw();
}
