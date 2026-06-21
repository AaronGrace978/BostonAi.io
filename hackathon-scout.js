/* BostonAI.io — hackathon scout */
(function () {
  "use strict";

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const grid = $("#scoutGrid");
  const search = $("#scoutSearch");
  const filters = $("#scoutFilters");
  const status = $("#scoutStatus");
  const updated = $("#scoutUpdated");
  if (!grid) return;

  let events = [];
  let activeFilter = "all";

  const fmtDate = (d) => {
    if (!d || d === "ongoing") return "Ongoing";
    const dt = new Date(d + "T12:00:00");
    if (Number.isNaN(dt.getTime())) return d;
    return dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const isPast = (e) => {
    if (!e.date || e.date === "ongoing") return false;
    const end = e.endDate || e.date;
    const dt = new Date(end + "T23:59:59");
    return dt < new Date();
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
      if (a.date === "ongoing" && b.date !== "ongoing") return 1;
      if (b.date === "ongoing" && a.date !== "ongoing") return -1;
      if (a.date === "ongoing" && b.date === "ongoing") return a.title.localeCompare(b.title);
      return a.date.localeCompare(b.date);
    });

  const render = () => {
    const q = search ? search.value.trim() : "";
    const filtered = sortEvents(
      events.filter((e) => !isPast(e) && matchesFilter(e, activeFilter) && matchesSearch(e, q))
    );

    if (!filtered.length) {
      grid.innerHTML = `<p class="scout__empty">No matches. Try another filter or <a href="mailto:AaronGrace978@gmail.com?subject=Hackathon%20tip%20for%20BostonAI.io">send Aaron a tip</a>.</p>`;
      return;
    }

    grid.innerHTML = filtered
      .map(
        (e) => `
      <article class="scout-card reveal in-view">
        <div class="scout-card__top">
          <span class="scout-card__date">${fmtDate(e.date)}</span>
          <span class="scout-card__format scout-card__format--${e.format}">${e.format}</span>
        </div>
        <h3 class="scout-card__title">${e.title}</h3>
        <p class="scout-card__org">${e.org} · ${e.location}</p>
        <p class="scout-card__blurb">${e.blurb}</p>
        <div class="scout-card__foot">
          <div class="scout-card__tags">${(e.tags || [])
            .map((t) => `<span class="scout-tag">#${t}</span>`)
            .join("")}</div>
          <a class="scout-card__link" href="${e.url}" target="_blank" rel="noopener">Scout it →</a>
        </div>
      </article>`
      )
      .join("");
  };

  const setStatus = (msg) => {
    if (status) status.textContent = msg;
  };

  const load = async () => {
    setStatus("Scanning the field…");
    try {
      const res = await fetch("data/hackathons.json", { cache: "no-store" });
      if (!res.ok) throw new Error("feed unavailable");
      const data = await res.json();
      events = data.events || [];
      if (updated && data.updated) {
        updated.textContent = `Feed updated ${data.updated}. Know one we missed? Email Aaron.`;
      }
      setStatus(`${events.filter((e) => !isPast(e)).length} targets on the board`);
      render();
    } catch {
      setStatus("Scout feed offline — check back soon.");
      grid.innerHTML = `<p class="scout__empty">Couldn't load the scout feed. <a href="mailto:AaronGrace978@gmail.com?subject=Hackathon%20scout%20issue">Ping Aaron</a>.</p>`;
    }
  };

  if (filters) {
    filters.addEventListener("click", (ev) => {
      const btn = ev.target.closest("[data-filter]");
      if (!btn) return;
      activeFilter = btn.dataset.filter;
      $$("[data-filter]", filters).forEach((b) => b.classList.toggle("is-active", b === btn));
      render();
    });
  }

  if (search) search.addEventListener("input", render);

  load();
})();
