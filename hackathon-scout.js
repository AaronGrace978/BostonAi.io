/* BostonAI.io — hackathon scout */
(function () {
  "use strict";

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const SQUAD_EMAIL = "AaronGrace978@gmail.com";

  const grid = $("#scoutGrid");
  const search = $("#scoutSearch");
  const filters = $("#scoutFilters");
  const status = $("#scoutStatus");
  const updated = $("#scoutUpdated");
  const heroTarget = $("#heroTarget");
  if (!grid) return;

  let events = [];
  let featuredId = null;
  let activeFilter = "all";

  const squadMailto = (e) => {
    const subject = encodeURIComponent(`Squad up for ${e.title}`);
    const body = encodeURIComponent(
      `Aaron — I want in on ${e.title} (${e.date}).\n\nMy stack:\n\nWhat I bring:\n\nLet's win.`
    );
    return `mailto:${SQUAD_EMAIL}?subject=${subject}&body=${body}`;
  };

  const fmtDate = (d) => {
    if (!d || d === "ongoing") return "Ongoing";
    const dt = new Date(d + "T12:00:00");
    if (Number.isNaN(dt.getTime())) return d;
    return dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const isPast = (e) => {
    if (!e.date || e.date === "ongoing") return false;
    const end = e.endDate || e.date;
    return new Date(end + "T23:59:59") < new Date();
  };

  const matchesFilter = (e, f) => {
    if (f === "all") return true;
    if (f === "boston") return e.tags.includes("boston");
    if (f === "ai") return e.tags.includes("ai");
    if (f === "online") return e.format === "online" || e.tags.includes("online");
    return true;
  };

  const matchesSearch = (e, q) => {
    if (!q) return true;
    const hay = [e.title, e.org, e.location, e.blurb, ...(e.tags || [])].join(" ").toLowerCase();
    return hay.includes(q.toLowerCase());
  };

  const sortEvents = (list) =>
    [...list].sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (b.featured && !a.featured) return 1;
      if (a.date === "ongoing" && b.date !== "ongoing") return 1;
      if (b.date === "ongoing" && a.date !== "ongoing") return -1;
      if (a.date === "ongoing" && b.date === "ongoing") return a.title.localeCompare(b.title);
      return a.date.localeCompare(b.date);
    });

  const renderCard = (e) => {
    const feat = e.featured || e.id === featuredId;
    return `
      <article class="scout-card reveal in-view${feat ? " scout-card--featured" : ""}">
        ${feat ? '<span class="scout-card__locked">TARGET LOCKED</span>' : ""}
        <div class="scout-card__top">
          <span class="scout-card__date">${fmtDate(e.date)}</span>
          <span class="scout-card__format scout-card__format--${e.format}">${e.format}</span>
        </div>
        <h3 class="scout-card__title">${e.title}</h3>
        <p class="scout-card__org">${e.org} · ${e.location}</p>
        <p class="scout-card__blurb">${e.blurb}</p>
        <div class="scout-card__foot">
          <div class="scout-card__tags">${(e.tags || []).map((t) => `<span class="scout-tag">#${t}</span>`).join("")}</div>
          <div class="scout-card__actions">
            <a class="scout-card__link" href="${e.url}" target="_blank" rel="noopener">Scout it →</a>
            <a class="btn btn--ghost btn--sm scout-card__squad" href="${squadMailto(e)}">Form a squad →</a>
          </div>
        </div>
      </article>`;
  };

  const render = () => {
    const q = search ? search.value.trim() : "";
    const filtered = sortEvents(
      events.filter((e) => !isPast(e) && matchesFilter(e, activeFilter) && matchesSearch(e, q))
    );

    if (!filtered.length) {
      grid.innerHTML = `<p class="scout__empty">No matches. <a href="mailto:${SQUAD_EMAIL}?subject=Hackathon%20tip">Send Aaron a tip</a>.</p>`;
      return;
    }
    grid.innerHTML = filtered.map(renderCard).join("");
  };

  const setHeroTarget = () => {
    if (!heroTarget) return;
    const feat = events.find((e) => e.id === featuredId || e.featured) || events.find((e) => !isPast(e) && e.date !== "ongoing");
    if (!feat) return;
    heroTarget.innerHTML = `<strong>${feat.title}</strong> · ${fmtDate(feat.date)} · ${feat.location}`;
    heroTarget.href = squadMailto(feat);
  };

  const setStatus = (msg) => { if (status) status.textContent = msg; };

  const load = async () => {
    setStatus("Scanning the field…");
    try {
      const res = await fetch("data/hackathons.json", { cache: "no-store" });
      if (!res.ok) throw new Error("feed unavailable");
      const data = await res.json();
      events = data.events || [];
      featuredId = data.featured || null;
      if (updated && data.updated) updated.textContent = `Feed updated ${data.updated}. Squad forming — email Aaron to lock in.`;
      setStatus(`${events.filter((e) => !isPast(e)).length} targets on the board · squad forming now`);
      setHeroTarget();
      render();
    } catch {
      setStatus("Scout feed offline.");
      grid.innerHTML = `<p class="scout__empty">Couldn't load scout feed. <a href="mailto:${SQUAD_EMAIL}">Ping Aaron</a>.</p>`;
    }
  };

  if (filters) {
    filters.addEventListener("click", (ev) => {
      const btn = ev.target.closest("[data-filter]");
      if (!btn) return;
      activeFilter = btn.dataset.filter;
      $$("[data-filter]", filters).forEach((b) => {
        b.classList.toggle("is-active", b === btn);
        b.setAttribute("aria-selected", String(b === btn));
      });
      render();
    });
  }

  if (search) search.addEventListener("input", render);
  load();
})();
