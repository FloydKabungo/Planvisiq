import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';
import {quote,recommendedPlan,licenceUsage,userReference,licenceReference} from '../js/pricing.js';
import {createOrganisation,updateOrganisation,startPreview,currentAccount} from '../js/account-store.js';

test('company plus per-user fees reconcile in integer cents, including annual payment',()=>{
 assert.equal(quote().amountCents,64800);
 const q=quote({fullUsers:10,viewerUsers:5});assert.equal(q.plan,'team');assert.equal(q.monthlyCents,323400);assert.equal(q.baseCents+q.fullCents+q.viewerCents,q.amountCents);
 const annual=quote({fullUsers:10,viewerUsers:5,cycle:'Annual'});assert.equal(annual.amountCents,3492720);assert.equal(annual.amountCents+annual.annualDiscountCents,q.amountCents*12);
 assert.deepEqual([10,11,50,51,200,201].map(recommendedPlan),['essentials','team','team','enterprise','enterprise',null]);
});
test('invalid quantities and undersized company plans cannot produce a payable estimate',()=>{
 for(const input of [{fullUsers:0},{fullUsers:1.5},{viewerUsers:-1},{viewerUsers:NaN},{viewerUsers:200},{plan:'essentials',fullUsers:11},{cycle:'Weekly'}])assert.throws(()=>quote(input));
});
test('active licences include the owner, exclude drafts and inactive members, and preserve user identity across role changes',()=>{
 const org={id:'company-id',invites:[{role:'Planner'}],members:[{id:'person-a',role:'Planner',status:'Active'},{id:'person-b',role:'Viewer',status:'Active'},{id:'person-c',role:'Planner',status:'Deactivated'}]};
 assert.deepEqual(licenceUsage(org),{fullUsers:2,viewerUsers:1,users:3,inactive:1});
 const member=org.members[0],id=userReference(org,member);assert.match(licenceReference(org,member),/^PV-PLN-/);member.role='Admin';assert.equal(userReference(org,member),id);assert.match(licenceReference(org,member),/^PV-ADM-/);assert.notEqual(userReference(org),id);
});
test('homepage calculator updates totals, applies capacity rules and carries a valid selection into setup',async()=>{
 const dom=new JSDOM(readFileSync(new URL('../index.html',import.meta.url),'utf8'),{url:'https://planvisiq.test/'});Object.assign(globalThis,{window:dom.window,document:dom.window.document});await import('../js/website.js');
 const form=document.querySelector('[data-calculator]'),set=(name,value)=>{form.elements.namedItem(name).value=value;form.elements.namedItem(name).dispatchEvent(new window.Event('input',{bubbles:true}));};
 set('fullUsers',10);set('viewerUsers',5);assert.match(form.querySelector('[data-price-output]').textContent.replace(/[\s,]/g,''),/R3234/);assert.match(form.querySelector('[data-price-start]').href,/plan=team/);
 set('plan','essentials');assert.match(form.textContent,/Choose Team/);assert.equal(form.querySelector('[data-price-start]').getAttribute('href'),null);
 set('plan','auto');set('cycle','Annual');assert.match(form.querySelector('[data-price-start]').href,/cycle=Annual/);assert.match(form.textContent,/Annual payment upfront/);dom.window.close();
});
test('billing preferences reject insufficient licence counts and plan downgrades without changing saved data',()=>{
 const dom=new JSDOM('',{url:'https://planvisiq.test/'});globalThis.window=dom.window;
 const org=createOrganisation({name:'Pricing Trial',slug:'pricing-trial',industry:'Construction',country:'South Africa',size:'11–50 people',owner:{name:'Owner',email:'owner@example.com'},plan:'team',invites:[],billingPreferences:{fullUsers:10,viewerUsers:5,cycle:'Annual'}});startPreview(org);
 const members=Array.from({length:10},(_,i)=>({id:'member-'+i,name:'Member '+i,email:`member${i}@example.com`,role:i===0?'Viewer':'Planner',status:'Active',projectAccess:'All'}));updateOrganisation(org.id,{members});
 assert.throws(()=>updateOrganisation(org.id,{plan:'essentials'}),/supports up to 10/);assert.equal(currentAccount().organisation.plan,'team');
 assert.throws(()=>updateOrganisation(org.id,{billingPreferences:{fullUsers:10,viewerUsers:0}}),/must cover/);assert.equal(currentAccount().organisation.billingPreferences.viewerUsers,5);
 updateOrganisation(org.id,{billingPreferences:{fullUsers:10,viewerUsers:1,cycle:'Monthly'}});assert.equal(currentAccount().organisation.billingPreferences.requestedSeats,11);dom.window.close();
});
