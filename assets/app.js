/* assets/app.js */
/* global fetch */
(function () {
    const QS = (s) => document.querySelector(s);
    const acid = getComputedStyle(document.documentElement).getPropertyValue('--acid') || '#39ff14';

    // --- Dates & helpers ---
    function parseAt(s) { return s ? new Date(s.replace(/-/g, '/').replace(' ', 'T') + (s.length <= 10 ? 'T00:00:00' : '')) : null; }
    function futureDeadlines(f) {
        const now = new Date();
        return (f.deadlines || [])
            .map(d => ({ ...d, atDate: parseAt(d.at) }))
            .filter(d => d.atDate && d.atDate > now)
            .sort((a, b) => a.atDate - b.atDate);
    }
    function nextDeadline(f) { const fut = futureDeadlines(f); return fut[0] || null; }
    function allDeadlinesSorted(f) {
        return (f.deadlines || [])
            .map(d => ({ ...d, atDate: parseAt(d.at) }))
            .filter(d => d.atDate)
            .sort((a, b) => a.atDate - b.atDate);
    }
    function daysLeft(t) { const ms = t - new Date(); if (ms <= 0) return 'now'; const d = Math.floor(ms / 86400000), h = Math.floor((ms % 86400000) / 3600000); return `${d}d ${h}h`; }
    function formatDeadline(d, tz) { try { return `${d.label} — ${d.atDate.toLocaleString(undefined, tz ? { timeZone: tz } : undefined)}`; } catch { return `${d.label} — ${d.atDate.toLocaleString()}`; } }

    // --- ICS helpers ---
    function icsEscape(s) { return (s || '').toString().replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;'); }
    function dtstamp(d) { const p = n => String(n).padStart(2, '0'); return d.getUTCFullYear() + p(d.getUTCMonth() + 1) + p(d.getUTCDate()) + 'T' + p(d.getUTCHours()) + p(d.getUTCMinutes()) + p(d.getUTCSeconds()) + 'Z'; }
    function eventICS(f, d) {
        const start = d.atDate, end = new Date(start.getTime() + 3600000);
        const uid = `${(f.id || f.title)}-${d.type}-${dtstamp(start)}@technodeadlines`;
        const summary = `${f.title} — ${d.label}`, loc = f.place || '', url = f.link || '';
        const desc = `Type: ${d.type}${url ? "\\n" + url : ""}`;
        return ['BEGIN:VEVENT', `UID:${uid}`, `DTSTAMP:${dtstamp(new Date())}`, `DTSTART:${dtstamp(start)}`, `DTEND:${dtstamp(end)}`, `SUMMARY:${icsEscape(summary)}`, `LOCATION:${icsEscape(loc)}`, `DESCRIPTION:${icsEscape(desc)}`, 'END:VEVENT'].join('\n');
    }
    function buildICS(events) { return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Techno Deadlines//EN', 'CALSCALE:GREGORIAN', events.join('\n'), 'END:VCALENDAR'].join('\n'); }
    function downloadBlob(text, filename) {
        const blob = new Blob([text], { type: 'text/calendar;charset=utf-8' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename; document.body.appendChild(a); a.click(); a.remove();
    }
    function downloadFestivalICS(f) {
        const events = allDeadlinesSorted(f).map(d => eventICS(f, d));
        const slug = (f.id || f.title || 'festival').toString().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        downloadBlob(buildICS(events), `${slug}.ics`);
    }

    // state
    let DATA = [];

    // --- Filters/rendering wired after data loads ---
    function initFilters() {
        const month = QS('#month'), country = QS('#country');
        const months = new Set(), countries = new Set();
        DATA.forEach(f => {
            if (f.start) months.add(new Date(f.start.replace(/-/g, '/')).toLocaleString(undefined, { month: 'long' }));
            const m = /,\s*([A-Z]{2})$/.exec(f.place || ''); if (m) countries.add(m[1]);
        });
        [...months].sort((a, b) => new Date(`${a} 1, 2000`) - new Date(`${b} 1, 2000`)).forEach(m => { const o = document.createElement('option'); o.textContent = m; o.value = m; month.appendChild(o); });
        [...countries].sort().forEach(c => { const o = document.createElement('option'); o.textContent = c; o.value = c; country.appendChild(o); });
    }

    function filteredItems() {
        const q = (QS('#q').value || '').toLowerCase();
        const typ = QS('#type').value;
        const mon = QS('#month').value;
        const ctry = QS('#country').value;

        return DATA.map(f => {
            const fut = futureDeadlines(f);
            const nd = fut[0] || null;
            return { f, nd, fut };
        })
            .filter(({ f, nd, fut }) => (
                (!q || (f.title || '').toLowerCase().includes(q) || (f.place || '').toLowerCase().includes(q)) &&
                (!typ || fut.some(d => d.type === typ)) &&
                (!mon || (f.start && new Date(f.start.replace(/-/g, '/')).toLocaleString(undefined, { month: 'long' }) === mon)) &&
                (!ctry || ((/,[\s]*([A-Z]{2})$/.exec(f.place || '') || [])[1] === ctry))
            ))
            .sort((a, b) => {
                if (a.nd && b.nd) return a.nd.atDate - b.nd.atDate;
                if (a.nd && !b.nd) return -1; if (!a.nd && b.nd) return 1;
                const as = a.f.start ? new Date(a.f.start.replace(/-/g, '/')) : new Date(8640000000000000);
                const bs = b.f.start ? new Date(b.f.start.replace(/-/g, '/')) : new Date(8640000000000000);
                return as - bs;
            });
    }

    function renderList() {
        const tbody = QS('#list'); if (!tbody) return;
        tbody.innerHTML = '';
        filteredItems().forEach(({ f, nd, fut }) => {
            const tr = document.createElement('tr');

            const tdFest = document.createElement('td'); tdFest.setAttribute('data-label', 'Festival');
            const name = f.link ? `<a class="fest-link" href="${f.link}" target="_blank" rel="noopener">${f.title}</a>` : `<span class="fest-link">${f.title}</span>`;
            tdFest.innerHTML = name; tr.appendChild(tdFest);

            const tdPlace = document.createElement('td'); tdPlace.setAttribute('data-label', 'Place');
            tdPlace.innerHTML = f.place ? `<span>${f.place}</span>` : '<span class="muted">—</span>'; tr.appendChild(tdPlace);

            const tdDates = document.createElement('td'); tdDates.setAttribute('data-label', 'Festival dates');
            tdDates.innerHTML = f.date ? `<span>${f.date}</span>` : '<span class="muted">—</span>'; tr.appendChild(tdDates);

            const tdLabel = document.createElement('td'); tdLabel.setAttribute('data-label', 'Next deadline');
            tdLabel.innerHTML = nd ? `<span class="badge">${nd.label}</span>` : '<span class="muted">—</span>'; tr.appendChild(tdLabel);

            const tdWhen = document.createElement('td'); tdWhen.setAttribute('data-label', 'When');
            tdWhen.textContent = nd ? nd.atDate.toLocaleString() : '—'; tr.appendChild(tdWhen);

            const tdCountdown = document.createElement('td'); tdCountdown.setAttribute('data-label', 'Countdown');
            tdCountdown.innerHTML = nd ? `<span class="count">${daysLeft(nd.atDate)}</span>` : '—'; tr.appendChild(tdCountdown);

            const tdICS = document.createElement('td'); tdICS.setAttribute('data-label', 'Download');
            const btn = document.createElement('button'); btn.className = 'btn'; btn.type = 'button'; btn.textContent = 'Download .ics';
            btn.addEventListener('click', () => downloadFestivalICS(f));
            tdICS.appendChild(btn); tr.appendChild(tdICS);

            tbody.appendChild(tr);

            if (fut.length) {
                const tr2 = document.createElement('tr');
                const tdAll = document.createElement('td');
                tdAll.colSpan = 7;
                tdAll.className = 'all-deadlines';
                tdAll.innerHTML = fut.map(d => `<span class="chip">${formatDeadline(d, f.timezone)}</span>`).join(' ');
                tr2.appendChild(tdAll);
                tbody.appendChild(tr2);
            }
        });
    }

    function renderBoard() {
        const grid = QS('#grid'); if (!grid) return;
        grid.innerHTML = '';
        filteredItems().forEach(({ f, nd, fut }) => {
            const card = document.createElement('div'); card.className = 'card';

            const top = document.createElement('div'); top.className = 'row';
            const left = document.createElement('div');
            const name = f.link ? `<a class="fest-link" href="${f.link}" target="_blank" rel="noopener">${f.title}</a>` : `<span class="fest-link">${f.title}</span>`;
            left.innerHTML = `${name}<div class="subtitle">${f.place || ''} · ${f.date || ''}</div>`;
            const right = document.createElement('div'); right.className = 'actions';
            const btn = document.createElement('button'); btn.className = 'btn'; btn.type = 'button'; btn.textContent = 'Download .ics';
            btn.addEventListener('click', () => downloadFestivalICS(f));
            right.appendChild(btn);
            top.appendChild(left); top.appendChild(right);
            card.appendChild(top);

            if (nd) {
                const row = document.createElement('div'); row.className = 'row';
                row.innerHTML = `<div style="color:${acid};font-weight:600">${nd.label}</div><div class="count">${daysLeft(nd.atDate)}</div>`;
                card.appendChild(row);
                const sub = document.createElement('div'); sub.className = 'subtitle';
                sub.textContent = `Due: ${nd.atDate.toLocaleString()} (${nd.type})`;
                card.appendChild(sub);
            } else {
                const sub = document.createElement('div'); sub.className = 'subtitle';
                sub.textContent = 'No upcoming deadlines yet'; card.appendChild(sub);
            }

            if (fut.length) {
                const wrap = document.createElement('div'); wrap.className = 'chips';
                wrap.innerHTML = fut.map(d => `<span class="chip">${formatDeadline(d, f.timezone)}</span>`).join(' ');
                card.appendChild(wrap);
            }

            grid.appendChild(card);
        });
    }

    function render() {
        const isList = QS('#view-list')?.classList.contains('active');
        QS('#list-wrap').style.display = isList ? 'block' : 'none';
        QS('#board-wrap').style.display = isList ? 'none' : 'block';
        (isList ? renderList : renderBoard)();
    }

    // wire up after data fetch
    function wireUp() {
        ['#q', '#type', '#month', '#country'].forEach(s => QS(s).addEventListener('input', render));
        QS('#dlics')?.addEventListener('click', () => {
            const items = filteredItems();
            const all = []; items.forEach(({ f }) => allDeadlinesSorted(f).forEach(d => all.push(eventICS(f, d))));
            const blobText = buildICS(all);
            const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([blobText], { type: 'text/calendar' })); a.download = 'techno-deadlines.ics'; a.click();
        });

        QS('#view-list')?.addEventListener('click', () => {
            QS('#view-list').classList.add('active'); QS('#view-list').setAttribute('aria-pressed', 'true');
            QS('#view-board').classList.remove('active'); QS('#view-board').setAttribute('aria-pressed', 'false');
            render();
        });
        QS('#view-board')?.addEventListener('click', () => {
            QS('#view-board').classList.add('active'); QS('#view-board').setAttribute('aria-pressed', 'true');
            QS('#view-list').classList.remove('active'); QS('#view-list').setAttribute('aria-pressed', 'false');
            render();
        });
    }

    // boot
    (function boot() {
        const url =
            (document.body && document.body.dataset && document.body.dataset.festUrl) ||
            './assets/festivals.json';

        fetch(url, { cache: 'no-store' })
            .then(async (r) => {
                if (!r.ok) {
                    const txt = await r.text().catch(() => '');
                    throw new Error(`HTTP ${r.status} fetching ${url}. First bytes: ${txt.slice(0, 120)}`);
                }
                const text = await r.text();
                try {
                    return JSON.parse(text);
                } catch (e) {
                    throw new Error(
                        `Bad JSON from ${url}. First bytes: ${text.slice(0, 120).replace(/\n/g, ' ')}`
                    );
                }
            })
            .then((json) => {
                DATA = Array.isArray(json) ? json : [];
                initFilters();
                wireUp();
                render();
            })
            .catch((err) => {
                console.error(err);
                // Optional: show a friendly message in the UI
                const tbody = document.querySelector('#list');
                if (tbody) {
                    tbody.innerHTML =
                        '<tr><td colspan="7">Failed to load festival data. Check the browser console for details.</td></tr>';
                }
            });
    })();
})();
