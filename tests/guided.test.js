import test from 'node:test';
import assert from 'node:assert/strict';
import {importSuggestion,headerSignature,reviewData} from '../js/guided.js';
import {createReport} from '../js/exports.js';
import {sampleProject} from '../js/sample.js';

test('file suggestions recognise schedule columns and remember confirmed mappings without guessing unknown data',()=>{
 const sheet={name:'Data',rows:[{'Activity ID':'A1','Activity name':'Inspect vessel','Progress':80,'Finish':'2026-10-16'}]};
 const suggestion=importSuggestion(sheet,'weekly.csv');assert.equal(suggestion.catalogId,11);assert.equal(suggestion.mapping.progress,'Progress');
 const preferences=[{signature:headerSignature(Object.keys(sheet.rows[0])),catalogId:11,mapping:{id:'Activity ID',name:'Activity name',progress:'Progress',area:'Activity name'}}];
 const repeated=importSuggestion(sheet,'weekly-next.csv',preferences);assert.equal(repeated.remembered,true);assert.equal(repeated.mapping.area,'Activity name');
 const changed={name:'Data',rows:[{Code:'A1',Result:'Pass'}]};assert.equal(importSuggestion(changed,'unfamiliar.csv',preferences).catalogId,null);assert.equal(importSuggestion(changed,'unfamiliar.csv',preferences).remembered,false);
 assert.equal(importSuggestion({name:'Data',rows:[{Date:'2026-10-16',Progress:80}]},'history.csv').catalogId,21);
});
test('data review identifies absent values, conflicts and the source row without treating missing progress as zero',()=>{
 const p={cutoff:'2026-10-16',datasets:[{id:'schedule',catalogId:11,asOf:'2026-10-16',importedAt:'2026-10-16',name:'schedule.csv',mapping:{id:'ID',name:'Task',progress:'Progress',status:'Status',plannedStart:'Start',plannedFinish:'Finish'},rows:[{ID:'1',Task:'Inspect',Progress:'',Status:'In progress',Start:'2026-10-14',Finish:''},{ID:'2',Task:'Repair',Progress:60,Status:'Completed',Start:'2026-10-15',Finish:'2026-10-13'}]}]};
 const result=reviewData(p);assert.equal(result.total,2);assert.deepEqual(result.checks.find(c=>c.key==='progress').rows,[0]);assert.deepEqual(result.checks.find(c=>c.key==='status').rows,[1]);assert.deepEqual(result.checks.find(c=>c.key==='order').rows,[1]);assert.equal(p.datasets[0].rows[0].Progress,'');
 const future={...p,cutoff:'2026-10-10'};assert.equal(reviewData(future).dataset,null);assert.equal(reviewData(future).future,1);
});
test('quick progress update needs the activity schedule while the full executive report keeps its original requirements',()=>{
 const p=sampleProject();p.datasets=p.datasets.filter(d=>d.catalogId===11);
 const options={scope:'All',groupBy:'discipline',includeCharts:true,includeTables:true,includeSources:true,detail:'Executive summary',audience:'Client stakeholders'};
 const full=createReport(p,121,options),quick=createReport(p,121,{...options,quickSummary:true,title:'Project progress update'});
 assert.ok(full.missing.length>0);assert.equal(quick.missing.length,0);assert.equal(quick.review,false);assert.equal(quick.metrics.total,48);assert.equal(quick.sources.length,1);assert.equal(quick.template,'Project progress summary');
 const empty=createReport({...p,datasets:[]},121,{...options,quickSummary:true});assert.equal(empty.review,true);assert.ok(empty.missing.includes('Activity schedule'));
});
