import catalogue from './catalog.js';
export const catalog = catalogue;
export const fields = { id: 'Task / record ID', name: 'Task name', area: 'Area', discipline: 'Discipline', contractor: 'Contractor', status: 'Status', progress: 'Actual progress (%)', plannedProgress: 'Planned progress (%)', plannedStart: 'Planned start', plannedFinish: 'Planned finish', actualFinish: 'Actual finish', budget: 'Budget', actualCost: 'Actual cost', plannedHours: 'Planned hours', actualHours: 'Actual hours', weight: 'Progress weight', date: 'Record date' };
const aliases = { id: ['id', 'taskid', 'activityid', 'workorder', 'recordid'], name: ['name', 'task', 'taskname', 'activity', 'activityname', 'description', 'jobdescription'], area: ['area', 'zone', 'location', 'unit'], discipline: ['discipline', 'trade'], contractor: ['contractor', 'company', 'subcontractor'], status: ['status', 'taskstatus', 'activitystatus'], progress: ['progress', 'percentcomplete', 'complete', 'actualprogress', 'physicalcomplete', 'completion'], plannedProgress: ['plannedprogress', 'plannedcomplete', 'targetprogress'], plannedStart: ['plannedstart', 'start', 'startdate', 'baselinestart'], plannedFinish: ['plannedfinish', 'finish', 'finishdate', 'baselinefinish', 'duedate'], actualFinish: ['actualfinish', 'actualfinishdate', 'completeddate'], budget: ['budget', 'budgetedcost', 'approvedbudget', 'plannedcost'], actualCost: ['actualcost', 'cost', 'amount', 'spend'], plannedHours: ['plannedhours', 'budgetedhours'], actualHours: ['actualhours', 'hours', 'labourhours'], weight: ['weight', 'progressweight'], date: ['date', 'recorddate', 'reportdate', 'asof'] };
export const clean = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
export function autoMap(headers) { const m = {}; for (const [field, list] of Object.entries(aliases)) {
    const match = headers.find(h => list.includes(clean(h)));
    if (match)
        m[field] = match;
} return m; }
export function number(v) { if (v === null || v === undefined || String(v).trim() === '')
    return null; const raw = String(v).trim().replace(/[R$£€,%\s]/g, '').replace(/^\((.*)\)$/, '-$1'); const n = Number(raw); return Number.isFinite(n) ? n : null; }
export function date(v) { if (!v)
    return ''; const s = String(v).trim(); if (/^\d{4}-\d{2}-\d{2}/.test(s) && !Number.isNaN(Date.parse(s.slice(0,10))) && new Date(s.slice(0,10)+'T00:00:00Z').toISOString().slice(0,10)===s.slice(0,10))
    return s.slice(0, 10); return ''; }
export function latest(project, id) { return project.datasets.filter(d => d.catalogId === id && d.asOf <= project.cutoff).sort((a, b) => b.asOf.localeCompare(a.asOf) || b.importedAt.localeCompare(a.importedAt))[0]; }
export function tasks(project) {
 const ds=latest(project,11);if(!ds)return [];
 const joins={};
 for(const [datasetId,key] of [[51,'budget'],[52,'actualCost'],[43,'actualHours'],[24,'weight']]){
  const d=latest(project,datasetId);if(!d?.mapping.id||!d.mapping[key])continue;
  const sums=new Map();for(const r of d.rows){const id=String(r[d.mapping.id]??'');const when=date(r[d.mapping.date]);if(when&&when>project.cutoff)continue;const n=number(r[d.mapping[key]]);if(n!==null)sums.set(id,(sums.get(id)??0)+n);}
  joins[key]={sums,name:d.name};
 }
 return ds.rows.map((r,i)=>{const val=key=>r[ds.mapping[key]||key];const n=key=>number(val(key));const id=String(val('id')||`ROW-${i+1}`);const financial=key=>joins[key]?.sums.has(id)?joins[key].sums.get(id):n(key);return {id,name:String(val('name')||`Record ${i+1}`),area:String(val('area')||'Unassigned'),discipline:String(val('discipline')||'Unassigned'),contractor:String(val('contractor')||'Unassigned'),status:String(val('status')||'Not recorded'),progress:n('progress')===null?null:Math.max(0,Math.min(100,n('progress'))),plannedProgress:n('plannedProgress'),plannedStart:date(val('plannedStart')),plannedFinish:date(val('plannedFinish')),actualFinish:date(val('actualFinish')),budget:financial('budget'),actualCost:financial('actualCost'),plannedHours:n('plannedHours'),actualHours:financial('actualHours'),weight:financial('weight'),source:ds.name,row:i+2,calculationSources:[ds.name,...Object.values(joins).filter(j=>j.sums.has(id)).map(j=>j.name)].join('; ')};});
}
export const completed = (t) => t.progress === 100 || /^(complete|completed|accepted|closed)$/i.test(t.status);
export const overdue = (t, cutoff) => !!t.plannedFinish && t.plannedFinish < cutoff && !completed(t) && !/cancel|defer/i.test(t.status);
export function filterTasks(ts, o) { return ts.filter(t => (!o.scope || o.scope === 'All' || [t.area, t.discipline, t.contractor].includes(o.scope)) && (!o.from || !!t.plannedFinish && t.plannedFinish >= o.from) && (!o.to || !!t.plannedFinish && t.plannedFinish <= o.to)); }
export function metrics(ts, cutoff) { const avg = (key) => { const valid = ts.filter(t => t[key] !== null); const weighted = ts.length > 0 && ts.every(t => t.weight !== null && t.weight > 0); const w = (t) => weighted ? t.weight : 1; const divisor = valid.reduce((s, t) => s + w(t), 0); return divisor ? valid.reduce((s, t) => s + t[key] * w(t), 0) / divisor : null; }; const sum = (key) => { const valid = ts.filter(t => t[key] !== null); return valid.length ? valid.reduce((s, t) => s + t[key], 0) : null; }; return { total: ts.length, completed: ts.filter(completed).length, overdue: ts.filter(t => overdue(t, cutoff)).length, progress: avg('progress'), planned: avg('plannedProgress'), budget: sum('budget'), actualCost: sum('actualCost'), plannedHours: sum('plannedHours'), actualHours: sum('actualHours'), missingProgress: ts.filter(t => t.progress === null).length, weighted: ts.length > 0 && ts.every(t => t.weight !== null && t.weight > 0) }; }
export function grouped(ts, key) { return [...new Set(ts.map(t => t[key]))].map(name => { const group = ts.filter(t => t[key] === name); return { name, ...metrics(group, '9999-12-31') }; }); }
export function trend(project) { const ds = latest(project, 21); if (!ds)
    return []; const m = ds.mapping; return ds.rows.map(r => ({ date: date(r[m.date || 'date']), actual: number(r[m.progress || 'progress']), planned: number(r[m.plannedProgress || 'plannedProgress']) })).filter(r => r.date && r.date <= project.cutoff).sort((a, b) => a.date.localeCompare(b.date)); }
export function issues(project) { return latest(project, 72)?.rows || []; }
export function percent(n) { return n === null ? '—' : `${Math.round(n * 10) / 10}%`; }
export function money(n) { if (n === null)
    return '—'; return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', maximumFractionDigits: 0 }).format(n); }
export function csvCell(v) { let s = String(v ?? ''); if (/^[=+@\t\r]/.test(s.trimStart()) || /^-[^\d]/.test(s.trimStart()))
    s = "'" + s; return '"' + s.replace(/"/g, '""') + '"'; }
export function toCSV(rows) { if (!rows.length)
    return ''; const headers = [...new Set(rows.flatMap(r => Object.keys(r)))]; return '\uFEFF' + [headers.map(csvCell).join(','), ...rows.map(r => headers.map(h => csvCell(r[h])).join(','))].join('\r\n'); }
export function parseCSV(text) { text = text.replace(/^\uFEFF/, ''); const first = text.split(/\r?\n/)[0], delimiter = [';', ',', '\t'].sort((a, b) => first.split(b).length - first.split(a).length)[0]; const records = []; let row = [], cell = '', quoted = false; for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
        if (quoted && text[i + 1] === '"') {
            cell += '"';
            i++;
        }
        else
            quoted = !quoted;
    }
    else if (c === delimiter && !quoted) {
        row.push(cell);
        cell = '';
    }
    else if ((c === '\n' || c === '\r') && !quoted) {
        if (c === '\r' && text[i + 1] === '\n')
            i++;
        row.push(cell);
        if (row.some(v => v.trim()))
            records.push(row);
        row = [];
        cell = '';
    }
    else
        cell += c;
} if (quoted)
    throw new Error('An opening quotation mark has no closing quotation mark. Please check the CSV.'); row.push(cell); if (row.some(v => v.trim()))
    records.push(row); if (records.length < 2)
    throw new Error('The file needs a header row and at least one data row.'); const seen = new Map(); const headers = records.shift().map((h, i) => { h = h.trim() || `Column ${i + 1}`; const n = (seen.get(h) || 0) + 1; seen.set(h, n); return n > 1 ? `${h} (${n})` : h; }); if (records.some(r => r.length > headers.length))
    throw new Error('Some rows have more values than the header row. Check the delimiter or quotation marks.'); return records.map(r => Object.fromEntries(headers.map((h, i) => [h, r[i]?.trim() ?? '']))); }
const needs = [
    [11, 51, 52, 71, 72], [11], [11, 21, 72], [11, 21, 52], [11, 117], [71, 72, 76], [1, 11], [3, 11], [11, 10], [76],
    [11, 14], [16], [11, 12, 9, 19], [11, 19], [11, 14], [11], [11, 20, 28], [11, 12, 13, 9], [11, 15], [11, 12, 9, 20],
    [21], [26], [11, 14, 21], [21, 24], [22, 23], [11, 21], [11, 21], [25], [29, 80], [30],
    [101, 11], [103], [102], [104], [101, 19], [107], [101, 74, 107], [108], [109], [110, 117],
    [33], [33, 34], [36, 37], [33, 35], [40], [38], [39, 40], [31, 52], [35, 37], [31, 33],
    [41, 42], [43, 18], [45, 47], [44], [22, 43], [22, 42, 43], [17, 18, 41], [46], [48, 50], [50],
    [51, 52, 53], [51, 52, 54], [58, 60], [24, 51, 52, 60], [52, 55], [53], [59], [57], [58], [56, 52, 54],
    [64, 65], [63, 67, 69], [63, 69], [65, 67], [67], [66, 67, 85], [69], [63, 70], [63, 69], [68, 69, 70],
    [71], [71, 73], [72], [74], [75], [28], [80], [78], [77], [7, 11, 85],
    [81], [82], [83], [84, 85], [85], [86], [87], [88], [89], [90],
    [91, 93], [91, 92], [93, 94], [94], [95], [96], [97], [98], [99], [100],
    [111, 112], [113], [114], [115], [111, 115, 116, 117], [116], [117], [119], [120], [101, 11, 52, 115, 117, 120]
];
export const implemented = new Set([121, 123, 125, 136, 141, 143, 146, 147, 151, 162, 201, 203, 209, 234, 237, 239, 240]);
export function requirements(id) { return needs[id - 121] || []; }
export function reportStatus(project, id) { const missing = requirements(id).filter(n => !latest(project, n)); return { missing, implemented: implemented.has(id), ready: implemented.has(id) && missing.length === 0 }; }
export function insights(project, ts = tasks(project)) { const m = metrics(ts, project.cutoff); const notes = []; if (m.overdue)
    notes.push({ title: `${m.overdue} tasks need a date review`, text: 'Their planned finish has passed and completion is not recorded. Confirm the remaining work with the responsible teams.', level: 'warning', ids: ts.filter(t => overdue(t, project.cutoff)).map(t => t.id) }); if (m.planned !== null && m.progress !== null)
    notes.push({ title: `${Math.abs(m.progress - m.planned).toFixed(1)} percentage points ${m.progress < m.planned ? 'behind' : 'ahead of'} plan`, text: `Recorded progress is ${percent(m.progress)} against ${percent(m.planned)} planned. This does not by itself establish a project finish delay.`, level: m.progress < m.planned ? 'warning' : 'good', ids: [] }); if (m.budget !== null && m.actualCost !== null)
    notes.push({ title: `${money(m.actualCost)} actual costs recorded`, text: `${money(m.budget - m.actualCost)} of the activity budget remains before commitments and forecast-to-complete are considered.`, level: 'info', ids: [] }); if (m.missingProgress)
    notes.push({ title: `${m.missingProgress} tasks have no progress value`, text: 'These records are excluded from the progress average. Add the missing measurements before issuing a final report.', level: 'warning', ids: ts.filter(t => t.progress === null).map(t => t.id) }); if (!ts.length)
    notes.push({ title: 'Start with your activity schedule', text: 'Upload a spreadsheet and confirm its columns to see progress, upcoming work and attention items.', level: 'info', ids: [] }); return notes; }
export function taskRows(ts) { return ts.map(t => ({ 'Task ID': t.id, Task: t.name, Area: t.area, Discipline: t.discipline, Contractor: t.contractor, Status: t.status, 'Progress (%)': t.progress, 'Planned progress (%)': t.plannedProgress, 'Planned finish': t.plannedFinish, 'Actual finish': t.actualFinish, 'Budget (ZAR)': t.budget, 'Actual cost (ZAR)': t.actualCost, 'Source file': t.source, 'Source row': t.row, 'Calculation sources':t.calculationSources||t.source })); }
export function reportRows(project, id, options) { let ts = filterTasks(tasks(project), options); if (id === 136)
    ts = ts.filter(t => !completed(t)); if ([121, 122, 123, 125, 129, 135, 136, 143, 146, 147, 148, 151, 172, 181, 185, 240].includes(id))
    return taskRows(ts); return requirements(id).flatMap(n => { const d = latest(project, n); return (d?.rows || []).map(r => ({ ...r, 'Dataset': catalog.find(c => c.id === n)?.name || '', 'Source': d?.name || '' })); }); }
export function narrative(project, options) { const m = metrics(filterTasks(tasks(project), options), project.cutoff); if (!m.total)
    return 'No activity schedule is available for the selected scope. Review the supporting records and complete any missing inputs before issue.'; return `${m.completed} of ${m.total} activities are recorded complete as of ${project.cutoff}. Recorded progress is ${percent(m.progress)}${m.planned !== null ? ` against ${percent(m.planned)} planned` : ''}. ${m.overdue} activities are past their planned finish and remain incomplete. ${m.weighted ? 'The progress calculation uses supplied weights.' : 'Progress is an unweighted average of available activity percentages.'} Completion is reported status; client acceptance requires a separate sign-off record.`; }
