import {autoMap,latest,number,date} from './engine.js';
import {validateRows} from './imports.js';

export const quickReports=[
  {id:121,title:'Progress update',description:'A clear summary of progress, completed work and recorded costs.',icon:'chart',quick:true},
  {id:123,title:'Weekly report',description:'Progress history, activity status and recorded issues.',icon:'calendar'},
  {id:240,title:'Project close-out',description:'The finished work, outstanding items and handover evidence.',icon:'check'}
];
export const headerSignature=headers=>JSON.stringify([...headers].sort());
export function importSuggestion(sheet,filename,preferences=[]){
  const headers=Object.keys(sheet.rows[0]||{}),signature=headerSignature(headers);
  const saved=preferences.find(p=>p.signature===signature);
  if(saved)return {catalogId:saved.catalogId,mapping:Object.fromEntries(Object.entries(saved.mapping).filter(([,h])=>headers.includes(h))),remembered:true};
  const mapping=autoMap(headers),hint=(filename+' '+sheet.name).toLowerCase();
  let catalogId=null;
  for(const [pattern,id]of [[/punch[ -]?list/,115],[/acceptance|sign[ -]?off/,117],[/lessons[ -]?learn/,120],[/risk[ _-]?register/,71],[/issue[ _-]?register/,72],[/shutdown[ _-]?scope/,101]])if(pattern.test(hint)){catalogId=id;break;}
  if(!catalogId){
    if(mapping.id&&mapping.name&&(mapping.progress||mapping.plannedStart||mapping.plannedFinish))catalogId=11;
    else if(mapping.date&&mapping.progress&&!mapping.id)catalogId=21;
    else if(mapping.id&&mapping.actualCost&&!mapping.name&&!mapping.budget)catalogId=52;
    else if(mapping.id&&mapping.budget&&!mapping.name&&!mapping.actualCost)catalogId=51;
    else if(mapping.id&&mapping.actualHours&&!mapping.name)catalogId=43;
    else if(mapping.id&&mapping.weight&&!mapping.name)catalogId=24;
  }
  return {catalogId,mapping,remembered:false};
}
export function reviewData(project){
  const dataset=latest(project,11);
  if(!dataset)return {dataset:null,total:0,checks:[{key:'schedule',title:'Add an activity schedule',text:'Upload your activity list to calculate project progress.',rows:[]}],future:project.datasets.filter(d=>d.catalogId===11&&d.asOf>project.cutoff).length};
  const rows=dataset.rows,m=dataset.mapping,checks=[];
  const add=(key,title,text,predicate)=>{const matches=rows.map((r,i)=>predicate(r)?i:-1).filter(i=>i>=0);if(matches.length)checks.push({key,title,text,rows:matches});};
  const structural=validateRows(rows,m,11);
  if(structural.length)checks.push({key:'structure',title:'Check the schedule format',text:structural.join(' '),rows:[]});
  add('name','Activities without a name','Add a short activity description.',r=>!String(r[m.name]??'').trim());
  add('progress','Progress is missing','Missing percentages are excluded from the average. Enter a recorded value; do not assume zero.',r=>number(r[m.progress])===null);
  add('finish','Planned finish dates are missing','These activities cannot be checked for overdue work.',r=>!r[m.plannedFinish]);
  add('order','Finish dates precede start dates','Check the two dates against your source schedule.',r=>date(r[m.plannedFinish])&&date(r[m.plannedStart])&&date(r[m.plannedFinish])<date(r[m.plannedStart]));
  add('status','Status and progress disagree','Check whether the work is complete, then update the recorded status or progress.',r=>{const progress=number(r[m.progress]),status=String(r[m.status]??'');return progress!==null&&((/^(complete|completed|accepted|closed)$/i.test(status)&&progress<100)||(progress===100&&/^(not started|in progress|blocked)$/i.test(status)));});
  return {dataset,total:rows.length,checks,future:0};
}
