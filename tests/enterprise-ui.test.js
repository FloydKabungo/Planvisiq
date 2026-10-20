import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {indexedDB} from 'fake-indexeddb';
import {readFileSync} from 'node:fs';
import {loadWorkspace} from '../js/storage.js';

const dom=new JSDOM(readFileSync(new URL('../workspace.html',import.meta.url),'utf8'),{url:'https://planvisiq.test/workspace.html'});
Object.assign(globalThis,{window:dom.window,document:dom.window.document,indexedDB,FormData:dom.window.FormData,FileReader:dom.window.FileReader});
dom.window.scrollTo=()=>{};dom.window.HTMLElement.prototype.scrollTo=()=>{};dom.window.HTMLDialogElement.prototype.showModal=function(){this.open=true;};dom.window.HTMLDialogElement.prototype.close=function(){this.open=false;};
const $=s=>document.querySelector(s),all=s=>[...document.querySelectorAll(s)],wait=ms=>new Promise(r=>setTimeout(r,ms||65));
async function click(s){assert.ok($(s),s);$(s).click();await wait();}
function set(s,v,event='input'){assert.ok($(s),s);$(s).value=v;$(s).dispatchEvent(new window.Event(event,{bubbles:true}));}
async function submit(s,values={}){const form=$(s);assert.ok(form,s);for(const [k,v]of Object.entries(values))form.elements.namedItem(k).value=v;form.dispatchEvent(new window.Event('submit',{bubbles:true,cancelable:true}));await wait(90);}
await import('../js/app.js');await wait(120);

test('saved reports preserve source revisions, compare updates and retain review notes',async()=>{
 await click('[data-action="new-report"]');await click('[data-action="quick-report"][data-id="121"]');set('#report-form [name="title"]','Weekly client report');await click('[data-action="save-report"]');await click('[data-action="close-modal"]');
 await click('[data-action="nav"][data-page="reports"]');assert.equal(all('.saved-report-list article').length,1);
 await click('[data-report-action="open"]');assert.match($('.saved-report-summary').textContent,/32 \/ 48/);await click('[data-action="close-modal"]');
 await click('[data-action="nav"][data-page="tasks"]');set('#task-search','SD-033');await wait(240);await click('[data-action="edit-task"][data-id="SD-033"]');await submit('#edit-task-form',{progress:'100',status:'Completed',actualFinish:'2026-10-10'});
 await click('[data-action="nav"][data-page="reports"]');await click('[data-report-action="open"]');await click('[data-report-action="latest"]');await click('[data-action="save-report"]');await click('[data-action="close-modal"]');await click('[data-report-action="open"]');
 assert.equal(all('#report-version-picker option').length,2);assert.match($('.saved-report-summary').textContent,/33 \/ 48/);
 await click('[data-report-action="compare"]');assert.match($('#dialog').textContent,/Completed activities/);assert.match($('#dialog').textContent,/\+1/);await click('[data-report-action="return"]');
 set('#report-version-picker',$('#report-version-picker option').value,'change');assert.match($('.saved-report-summary').textContent,/32 \/ 48/);
 await submit('#report-comment-form',{comment:'Check <handover> & client records.'});assert.match($('.report-comments').textContent,/Check <handover>/);assert.equal($('.report-comments handover'),null);
 set('#report-review-status','In review','change');await wait();await click('[data-action="close-modal"]');assert.match($('.saved-report-list').textContent,/In review/);
 const saved=await loadWorkspace(),r=saved.projects[0].savedReports[0];assert.equal(r.versions.length,2);assert.equal(r.versions[0].metrics.completed,32);assert.equal(r.versions[1].metrics.completed,33);assert.equal(r.comments.length,1);
});
test('a batch imports ready files, retains errors and retries without adding duplicate datasets',async()=>{
 await click('[data-action="new-project"]');await submit('#new-project-form',{name:'Batch test',cutoff:'2026-10-17'});await click('[data-action="nav"][data-page="data"]');
 let attempts=0;const csv='Activity ID,Activity name,Progress,Planned finish\nA1,Inspect vessel,30,2026-10-15';
 const files=[{name:'schedule.csv',size:100,text:async()=>csv},{name:'history.csv',size:80,text:async()=>'Date,Progress\n2026-10-15,25\n2026-10-17,30'},{name:'retry.csv',size:100,text:async()=>{if(!attempts++)throw new Error('Temporary read failure');return csv.replace('30','45');}}];
 const event=new window.Event('drop',{bubbles:true,cancelable:true});Object.defineProperty(event,'dataTransfer',{value:{files}});$('[data-dropzone]').dispatchEvent(event);await wait(120);
 assert.match($('.queue-list').textContent,/Temporary read failure/);assert.match($('[data-queue-action="add-ready"]').textContent,/2/);
 await click('[data-queue-action="add-ready"]');assert.equal(all('.queue-list article').filter(a=>a.textContent.includes('Added')).length,2);
 await click('[data-queue-action="retry"]');assert.equal(all('[data-queue-action="retry"]').length,0);await click('[data-queue-action="add-ready"]');assert.match($('.queue-summary').textContent,/3 datasets added/);
 await click('[data-queue-action="clear"]');const saved=await loadWorkspace(),p=saved.projects.find(p=>p.name==='Batch test');assert.equal(p.datasets.length,3);assert.equal(p.datasets.filter(d=>d.name==='retry.csv').length,1);
});
test('company branding and reusable styles populate reports and fresh slide decks',async()=>{
 await click('[data-action="nav"][data-page="settings"]');await submit('#company-brand-form',{company:'Harbour Planning',color:'#215577',coverLabel:'CLIENT PROJECT UPDATE',footer:'Prepared by Harbour Planning',theme:'navy'});
 await click('[data-action="new-report"]');await click('[data-action="quick-report"][data-id="121"]');assert.match($('.paper-brand').textContent,/Harbour Planning/);
 set('#report-form [name="commentary"]','Private commentary must not become a template.');await click('[data-template-action="save-report"]');await submit('#company-style-form',{name:'Weekly company update'});
 await click('[data-action="nav"][data-page="slides"]');await click('[data-slide-action="create"][data-kind="progress"]');assert.match($('#slide-canvas').textContent,/CLIENT PROJECT UPDATE/);assert.equal($('[data-deck-field="theme"]').value,'navy');
 await click('[data-slide-action="company-style"]');await submit('#company-style-form',{name:'Client meeting style'});await click('[data-slide-action="back"]');assert.equal(all('.company-style-grid article').length,1);await click('[data-template-action="use-slides"]');
 const saved=await loadWorkspace();assert.equal(saved.companyTemplates.length,2);assert.ok(!JSON.stringify(saved.companyTemplates).includes('Private commentary'));assert.equal(saved.projects.find(p=>p.name==='Batch test').presentations.length,2);
});
test('the contextual assistant explains source data and applies a summary only on request',async()=>{
 await click('[data-action="nav"][data-page="overview"]');await click('[data-assistant-open][data-assistant-chart="trend"]');await click('[data-assistant-prompt="Explain this chart"]');assert.match($('.assistant-conversation').textContent,/project-level progress snapshots/);assert.ok($('[data-assistant-source]'));await click('[data-assistant-close]');
 await click('[data-action="new-report"]');await click('[data-action="quick-report"][data-id="121"]');await click('#dialog [data-assistant-open]');assert.ok($('#dialog #context-assistant'));await click('[data-assistant-prompt="Draft a progress summary"]');assert.equal($('#report-form [name="commentary"]').value,'');await click('[data-assistant-apply]');assert.ok($('#report-form [name="commentary"]').value.length>20);assert.equal($('#context-assistant'),null);
});
