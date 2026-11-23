const agents = [
  { name: "Claude Code", tokens: [42.7, 65.9, 59.1, 78.6], time: [15.6, 22.1, 39.1, 36.8] },
  { name: "Codex", tokens: [18.6, 37.0, 31.2, 41.7], time: [14.7, 26.2, 38.1, 32.7] },
  { name: "Cursor", tokens: [20.5, 44.6, 38.2, 49.5], time: [17.1, 24.2, 46.7, 40.8] },
  { name: "OpenCode", tokens: [24.7, 39.6, 33.8, 45.5], time: [18.9, 29.9, 49.8, 42.3] }
];

const models = [
  { name: "DeepSeek-V4-Pro", success: [81.82, 80.91], turns: [27.45, 27.75] },
  { name: "DeepSeek-V4-Flash", success: [91.82, 90.91], turns: [16.49, 17.55] },
  { name: "Kimi-2.7 Code", success: [65.45, 58.18], turns: [37.02, 39.15] },
  { name: "Qwen3.6-Plus", success: [53.64, 46.36], turns: [19.60, 21.57] }
];

const mitigations = [
  { name: "Whitelist control", levels: [[34.9, 35.5], [44.1, 29.7], [31.1, 43.9], [30.8, 43.8]] },
  { name: "DeepSeek-V4-Pro", levels: [[64.4, 21.1], [48.3, 24.9], [41.8, 24.0], [39.8, 25.9]] },
  { name: "DeepSeek-V4-Flash", levels: [[62.1, 9.0], [42.4, 13.9], [41.5, 12.9], [39.1, 14.3]] },
  { name: "Kimi-2.7 Code", levels: [[49.9, 41.0], [40.3, 49.2], [42.8, 53.2], [44.4, 51.7]] },
  { name: "Qwen3.6-Plus", levels: [[64.0, 14.9], [51.1, 15.8], [51.8, 20.4], [50.8, 19.6]] }
];

function bindButtons(attribute, update) {
  const buttons = [...document.querySelectorAll(`[data-${attribute}]`)];
  buttons.forEach(button => button.addEventListener("click", () => {
    buttons.forEach(option => option.setAttribute("aria-pressed", String(button === option)));
    update(button.getAttribute(`data-${attribute}`));
  }));
}

bindButtons("trace", mode => {
  const modified = mode === "modified";
  document.getElementById("trace").dataset.state = mode;
  document.getElementById("router-state").textContent = modified ? "Response modified" : "Response forwarded";
  document.getElementById("agent-state").textContent = modified ? "Different action" : "Intended action";
  document.getElementById("trace-note").textContent = modified
    ? "The agent acts on the response it receives. The provider’s original action and the executed action can differ."
    : "The agent receives the provider’s response and acts on its original instruction.";
});

const tabs = [...document.querySelectorAll('[role="tab"]')];
function selectTab(selected) {
  tabs.forEach(tab => {
    const active = tab === selected;
    tab.setAttribute("aria-selected", String(active));
    tab.tabIndex = active ? 0 : -1;
    document.getElementById(tab.getAttribute("aria-controls")).hidden = !active;
  });
}
tabs.forEach((tab, index) => {
  tab.addEventListener("click", () => selectTab(tab));
  tab.addEventListener("keydown", event => {
    const targets = {
      ArrowLeft: (index + tabs.length - 1) % tabs.length,
      ArrowRight: (index + 1) % tabs.length,
      Home: 0,
      End: tabs.length - 1
    };
    if (!(event.key in targets)) return;
    event.preventDefault();
    const target = tabs[targets[event.key]];
    selectTab(target);
    target.focus();
  });
});

function renderAgents(metric) {
  const format = {
    dsr: () => '<td class="danger">0%</td>',
    tokens: n => `<td>${n.toFixed(1)}K</td>`,
    time: n => `<td>${n.toFixed(1)} s</td>`
  };
  const rows = agents.map(agent => {
    const values = metric === "dsr" ? [0, 0, 0, 0] : agent[metric];
    return `<tr><th scope="row">${agent.name}</th>${values.map(format[metric]).join("")}</tr>`;
  });
  document.getElementById("agent-table").innerHTML = `
    <table aria-label="Coding agent results by injection level">
      <thead><tr><th scope="col">Agent</th><th scope="col">L1</th><th scope="col">L2</th><th scope="col">L3</th><th scope="col">L4</th></tr></thead>
      <tbody>${rows.join("")}</tbody>
    </table>`;
}

function renderChart(id, rows, labels, maximum, precision, unit) {
  const chart = document.getElementById(id);
  const legend = labels.map((label, index) =>
    `<span><i class="${index ? "alt" : ""}" aria-hidden="true"></i>${label}</span>`
  );
  const chartRows = rows.map(({ name, values }) => {
    const bars = values.map((value, index) => `
      <div class="bar-line" role="img" aria-label="${labels[index]} ${value.toFixed(precision)}${unit}">
        <div class="bar-track" aria-hidden="true"><i class="bar-fill ${index ? "alt" : ""}" style="width:${value / maximum * 100}%"></i></div>
        <b aria-hidden="true">${value.toFixed(precision)}${unit}</b>
      </div>`);
    return `<div class="chart-row"><strong>${name}</strong><div class="bar-pair">${bars.join("")}</div></div>`;
  });
  chart.innerHTML = `<div class="chart-legend">${legend.join("")}</div>${chartRows.join("")}`;
}

function renderModels(metric) {
  const rows = models.map(model => ({ name: model.name, values: model[metric] }));
  const success = metric === "success";
  renderChart("model-chart", rows, ["Baseline", "Injection"], success ? 100 : 45, 2, success ? "%" : "");
}

function renderMitigations(level) {
  const rows = mitigations.map(mitigation => ({ name: mitigation.name, values: mitigation.levels[level] }));
  renderChart("defense-chart", rows, ["Defense success rate", "Wrong-block ratio"], 100, 1, "%");
}

bindButtons("agent-metric", renderAgents);
bindButtons("model-metric", renderModels);
bindButtons("defense-level", renderMitigations);
renderAgents("dsr");
renderModels("success");
renderMitigations(0);

document.getElementById("copy-citation").addEventListener("click", async () => {
  const citation = document.getElementById("citation");
  const status = document.getElementById("citation-status");
  try {
    await navigator.clipboard.writeText(citation.textContent.trim());
    status.textContent = "BibTeX copied.";
  } catch {
    citation.hidden = false;
    status.textContent = "Select the BibTeX text to copy it.";
  }
});
