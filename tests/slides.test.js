import test from 'node:test';
import assert from 'node:assert/strict';
import {createDeck,newSlide,normalizeDeck,slideScene,sceneSvg,deckWarnings} from '../js/slides-model.js';
import {sampleProject} from '../js/sample.js';

test('generated project decks reconcile to the source and preserve missing measurements',()=>{
 const p=sampleProject(),deck=createDeck(p,'closeout');
 assert.equal(deck.slides.find(s=>s.layout==='metrics').metrics[1].value,'32 / 48');
 assert.equal(deck.slides.find(s=>s.layout==='metrics').metrics[0].value,'76.3%');
 assert.ok(deck.slides.some(s=>s.title==='The handover evidence'));
 assert.deepEqual(deckWarnings(deck),[]);assert.ok(deck.sources.length>1);
 const noSchedule=createDeck({...p,datasets:[]});assert.equal(noSchedule.slides.length,2);assert.equal(noSchedule.slides.some(s=>s.layout==='metrics'),false);
 const slide=newSlide('chart',{chart:{labels:['Recorded','Missing'],values:[0,null],unit:'%'}});
 assert.match(sceneSvg({...deck,slides:[slide]},slide),/No data/);assert.deepEqual(slide.chart.values,[0,null]);
});
test('presentation snapshots survive project updates and restored content is constrained safely',()=>{
 const p=sampleProject(),deck=createDeck(p),snapshot=JSON.stringify(deck);p.cutoff='2026-11-20';p.datasets=[];assert.equal(JSON.stringify(deck),snapshot);
 const malicious=normalizeDeck({...deck,theme:'url(javascript:bad)',slides:[{id:'a',layout:'evil',title:'<img src=x onerror=alert(1)>',image:'javascript:alert(1)'},{id:'a',layout:'photo',image:'data:image/svg+xml;base64,PHN2Zz4='}]});
 assert.equal(malicious.theme,'forest');assert.equal(malicious.slides[0].layout,'bullets');assert.equal(malicious.slides[1].image,'');assert.notEqual(malicious.slides[0].id,malicious.slides[1].id);
 assert.doesNotMatch(sceneSvg(malicious,malicious.slides[0]),/<img/);
 const long=newSlide('columns',{leftBody:'A separate line.\n'.repeat(38)});assert.ok(slideScene({...deck,slides:[long]},long).warnings.length);
});
