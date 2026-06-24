/* BostonAI.io — squad form & open parties */
(function () {
  "use strict";

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const SQUAD_EMAIL = "AaronGrace978@gmail.com";

  const form = $("#squadForm");
  const partyGrid = $("#partyGrid");
  const hackathonSelect = $("#squadHackathon");
  const partySelectWrap = $("#partySelectWrap");
  const partySelect = $("#squadParty");
  const modeRadios = $$('input[name="squadMode"]');
  if (!form && !partyGrid) return;

  let events = [];
  let parties = [];

  const fmtDate = (d) => {
    if (!d || d === "ongoing") return "Ongoing";
    const dt = new Date(d + "T12:00:00");
    if (Number.isNaN(dt.getTime())) return d;
    return dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const isPast = (e) => {
    if (!e?.date || e.date === "ongoing") return false;
    const end = e.endDate || e.date;
    return new Date(end + "T23:59:59") < new Date();
  };

  const eventById = (id) => events.find((e) => e.id === id);

  const openSlots = (p) => Math.max(0, (p.slots || 0) - (p.filled || 0));

  const joinMailto = (party, event) => {
    const subject = encodeURIComponent(`Join ${party.name} — ${event?.title || "hackathon"}`);
    const body = encodeURIComponent(
      `Aaron — I want to join ${party.name} for ${event?.title || party.hackathonId}.\n\n` +
        `Party leader: ${party.leader}\n` +
        `Looking for: ${(party.lookingFor || []).join(", ")}\n\n` +
        `My name:\n\nMy stack:\n\nWhat I bring:\n\nLet's win.`
    );
    return `mailto:${SQUAD_EMAIL}?subject=${subject}&body=${body}`;
  };

  const renderPartyCard = (party) => {
    const event = eventById(party.hackathonId);
    const slots = openSlots(party);
    const full = slots === 0;
    return `
      <article class="party-card reveal${full ? " party-card--full" : ""}">
        <div class="party-card__top">
          <span class="party-card__event">${event ? event.title : party.hackathonId}</span>
          <span class="party-card__slots${full ? " party-card__slots--full" : ""}">${full ? "FULL" : `${slots} slot${slots === 1 ? "" : "s"} open`}</span>
        </div>
        <h3 class="party-card__name">${party.name}</h3>
        <p class="party-card__leader">Led by ${party.leader}${event ? ` · ${fmtDate(event.date)}` : ""}</p>
        <p class="party-card__blurb">${party.blurb}</p>
        <p class="party-card__stack"><span>Stack:</span> ${party.stack}</p>
        <div class="party-card__tags">${(party.lookingFor || []).map((r) => `<span class="party-tag">${r}</span>`).join("")}</div>
        <div class="party-card__foot">
          ${full
            ? '<span class="party-card__waitlist">Party full — start your own below</span>'
            : `<a class="btn btn--ghost btn--sm" href="${joinMailto(party, event)}">Request to join →</a>`
          }
          <button type="button" class="party-card__prefill btn btn--ghost btn--sm" data-party="${party.id}" ${full ? "disabled" : ""}>Use in form</button>
        </div>
      </article>`;
  };

  const renderParties = () => {
    if (!partyGrid) return;
    const open = parties.filter((p) => {
      const ev = eventById(p.hackathonId);
      return !ev || !isPast(ev);
    });
    if (!open.length) {
      partyGrid.innerHTML = `<p class="party__empty">No open parties yet. Be first — start one below.</p>`;
      return;
    }
    partyGrid.innerHTML = open.map(renderPartyCard).join("");
    $$(".party-card__prefill", partyGrid).forEach((btn) => {
      btn.addEventListener("click", () => {
        const party = parties.find((p) => p.id === btn.dataset.party);
        if (!party) return;
        setMode("join");
        if (hackathonSelect) hackathonSelect.value = party.hackathonId;
        updatePartySelect();
        if (partySelect) partySelect.value = party.id;
        form?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  };

  const populateHackathons = () => {
    if (!hackathonSelect) return;
    const upcoming = events.filter((e) => !isPast(e));
    hackathonSelect.innerHTML =
      '<option value="">Pick a hackathon…</option>' +
      upcoming.map((e) => `<option value="${e.id}">${e.title} (${fmtDate(e.date)})</option>`).join("");
  };

  const updatePartySelect = () => {
    if (!partySelect || !partySelectWrap) return;
    const hackId = hackathonSelect?.value;
    const matches = parties.filter((p) => p.hackathonId === hackId && openSlots(p) > 0);
    partySelect.innerHTML =
      '<option value="">Pick an open party…</option>' +
      matches.map((p) => `<option value="${p.id}">${p.name} (${openSlots(p)} open)</option>`).join("");
    partySelectWrap.hidden = getMode() !== "join" || !hackId || !matches.length;
  };

  const getMode = () => ($('input[name="squadMode"]:checked') || {}).value || "start";

  const setMode = (mode) => {
    const radio = $(`input[name="squadMode"][value="${mode}"]`);
    if (radio) radio.checked = true;
    updatePartySelect();
  };

  const buildSubmitMailto = (data) => {
    const event = eventById(data.hackathon);
    const party = parties.find((p) => p.id === data.party);
    const mode = data.mode === "join" ? "join an open party" : "start a new party";
    const subject = encodeURIComponent(
      data.mode === "join" && party
        ? `Join ${party.name} — ${event?.title || "hackathon"}`
        : `New squad — ${event?.title || "hackathon"}`
    );
    const lines = [
      `Aaron — I want to ${mode} for ${event?.title || data.hackathon}.`,
      "",
      `Name: ${data.name}`,
      `Email: ${data.email}`,
      `Role: ${data.role}`,
      `Stack: ${data.stack}`,
    ];
    if (data.mode === "join" && party) {
      lines.push("", `Party: ${party.name} (led by ${party.leader})`);
    } else if (data.mode === "start") {
      lines.push("", `Party name: ${data.partyName || "(TBD)"}`, `Slots needed: ${data.slots || "?"}`);
    }
    if (data.notes) lines.push("", `Notes: ${data.notes}`);
    lines.push("", "Let's win.");
    return `mailto:${SQUAD_EMAIL}?subject=${subject}&body=${encodeURIComponent(lines.join("\n"))}`;
  };

  const applyQueryParams = () => {
    const hash = window.location.hash || "";
    const qIdx = hash.indexOf("?");
    const params = qIdx === -1 ? new URLSearchParams() : new URLSearchParams(hash.slice(qIdx + 1));
    const hackId = params.get("hackathon");
    const mode = params.get("mode");
    if (hackId && hackathonSelect) {
      hackathonSelect.value = hackId;
      updatePartySelect();
    }
    if (mode === "join" || mode === "start") setMode(mode);
    const partyId = params.get("party");
    if (partyId && partySelect) partySelect.value = partyId;
  };

  const load = async () => {
    try {
      const [hackRes, squadRes] = await Promise.all([
        fetch("data/hackathons.json", { cache: "no-store" }),
        fetch("data/squads.json", { cache: "no-store" }),
      ]);
      if (hackRes.ok) {
        const hackData = await hackRes.json();
        events = hackData.events || [];
      }
      if (squadRes.ok) {
        const squadData = await squadRes.json();
        parties = squadData.parties || [];
      }
      populateHackathons();
      renderParties();
      applyQueryParams();
    } catch {
      if (partyGrid) {
        partyGrid.innerHTML = `<p class="party__empty">Couldn't load parties. <a href="mailto:${SQUAD_EMAIL}">Email Aaron</a> to squad up.</p>`;
      }
    }
  };

  if (hackathonSelect) hackathonSelect.addEventListener("change", updatePartySelect);
  modeRadios.forEach((r) => r.addEventListener("change", updatePartySelect));

  if (form) {
    form.addEventListener("submit", (ev) => {
      ev.preventDefault();
      const fd = new FormData(form);
      const data = {
        mode: fd.get("squadMode"),
        hackathon: fd.get("hackathon"),
        party: fd.get("party"),
        name: (fd.get("name") || "").toString().trim(),
        email: (fd.get("email") || "").toString().trim(),
        role: (fd.get("role") || "").toString().trim(),
        stack: (fd.get("stack") || "").toString().trim(),
        partyName: (fd.get("partyName") || "").toString().trim(),
        slots: (fd.get("slots") || "").toString().trim(),
        notes: (fd.get("notes") || "").toString().trim(),
      };
      if (!data.hackathon || !data.name || !data.email || !data.role) {
        form.reportValidity();
        return;
      }
      window.location.href = buildSubmitMailto(data);
    });
  }

  load();
  window.addEventListener("hashchange", applyQueryParams);
})();
