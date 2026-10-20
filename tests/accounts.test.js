import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {JSDOM} from 'jsdom';
import {indexedDB} from 'fake-indexeddb';
import {ORGANISATIONS_KEY,SESSION_KEY,createOrganisation,startPreview,currentAccount,findOrganisation,validateInvite,updateOrganisation} from '../js/account-store.js';
const origin='https://planvisiq.test/project/';
let revision=0;
async function openPage(file,{saved,session,query=''}={}){
  const dom=new JSDOM(readFileSync(new URL('../'+file,import.meta.url),'utf8'),{url:origin+file+query});
  Object.assign(globalThis,{window:dom.window,document:dom.window.document,FormData:dom.window.FormData,indexedDB});
  dom.window.HTMLDialogElement.prototype.showModal=function(){this.open=true;};dom.window.HTMLDialogElement.prototype.close=function(){this.open=false;};
  if(saved)window.localStorage.setItem(ORGANISATIONS_KEY,saved);
  if(session)window.sessionStorage.setItem(SESSION_KEY,session);
  await import('../js/account.js?test='+revision++);
  return dom;
}
const $=selector=>document.querySelector(selector);
const click=selector=>$(selector).click();
function submit(id,values={}){const form=$(id);for(const [key,value]of Object.entries(values)){const input=form.elements.namedItem(key);if(input.type==='checkbox')input.checked=value;else input.value=value;}form.dispatchEvent(new window.Event('submit',{bubbles:true,cancelable:true}));}
test('company onboarding, plan choice, invitation drafts and editing form a complete local flow',async()=>{
  const dom=await openPage('create-organisation.html');
  const name=$('[name="name"]');name.value='Harbour Engineering';name.dispatchEvent(new window.Event('input',{bubbles:true}));assert.equal($('[name="slug"]').value,'harbour-engineering');
  submit('#company-form',{industry:'Civil engineering',size:'11–50 people'});assert.ok($('#owner-form'));
  submit('#owner-form',{name:'Taylor Smith',email:'taylor@example.com',understand:true});assert.ok($('#plan-form'));
  submit('#plan-form',{plan:'team'});assert.ok($('#invite-form'));
  submit('#invite-form',{email:'planner@example.com',role:'Planner'});assert.equal(document.querySelectorAll('.invite-list li').length,1);assert.match($('.invite-list').textContent,/Draft, not sent/);
  submit('#invite-form',{email:'planner@example.com',role:'Viewer'});assert.match($('#form-error').textContent,/already has an invitation draft/);
  $('#invite-form').reset();click('[data-account="complete-setup"]');assert.match(rootText(),/Your preview is ready/);
  const saved=window.localStorage.getItem(ORGANISATIONS_KEY),session=window.sessionStorage.getItem(SESSION_KEY);
  const org=JSON.parse(saved)[0];assert.equal(org.name,'Harbour Engineering');assert.equal(org.invites.length,1);assert.ok(!/password|token|cardNumber/.test(saved));assert.equal(currentAccount().organisation.id,org.id);dom.window.close();
  const management=await openPage('organisation.html',{saved,session});assert.match(rootText(),/Harbour Engineering/);assert.match(rootText(),/no live accounts, emails, payments or enforced permissions/);
  click('[data-org-action="tab"][data-tab="billing"]');submit('#org-billing-form',{plan:'enterprise'});assert.equal(currentAccount().organisation.plan,'enterprise');
  click('[data-org-action="tab"][data-tab="people"]');click('[data-org-action="invite"]');submit('#org-invite-form',{email:'viewer@example.com',role:'Viewer'});assert.equal(currentAccount().organisation.invites.length,2);
  click('[data-org-action="revoke"]');click('[data-org-action="confirm-revoke"]');assert.equal(currentAccount().organisation.invites.length,1);click('[data-org-action="tab"][data-tab="overview"]');
  click('[data-account="edit-company"]');submit('#edit-company-form',{name:'Harbour Civil'});assert.equal(currentAccount().organisation.name,'Harbour Civil');
  click('[data-account="signout"]');assert.equal(currentAccount(),null);assert.ok(window.localStorage.getItem(ORGANISATIONS_KEY));assert.match(rootText(),/Find your organisation/);management.window.close();
});
test('workspace discovery, sign-in preview, password discard and recovery state',async()=>{
  const dom=await openPage('signin.html');
  submit('#workspace-form',{workspace:'unknown-company'});assert.match($('#form-error').textContent,/No saved preview/);
  submit('#workspace-form',{workspace:'nextgen-planning'});assert.ok($('#signin-form'));
  $('#signin-password').value='not-a-real-password';click('[data-account="toggle-password"]');assert.equal($('#signin-password').type,'text');
  submit('#signin-form',{email:'alex@example.com'});assert.match(rootText(),/You’re in the preview/);assert.equal(currentAccount().organisation.id,'demo');assert.ok(!window.sessionStorage.getItem(SESSION_KEY).includes('not-a-real-password'));assert.equal(window.localStorage.length,0);
  click('[data-account="change-org"]');click('[data-account="find-workspace"]');submit('#find-form',{email:'alex@example.com'});assert.ok($('.workspace-result'));click('.workspace-result');click('[data-account="reset-password"]');submit('#reset-form',{email:'alex@example.com'});assert.match(rootText(),/No email has been sent/);dom.window.close();
});
test('company addresses are unique, invitations deduplicate and local project namespaces remain separate',async()=>{
  const dom=new JSDOM('',{url:origin});globalThis.window=dom.window;globalThis.indexedDB=indexedDB;
  const data={name:'Test Company',slug:'test-company',industry:'Construction',country:'South Africa',size:'1–10 people',owner:{name:'Test Owner',email:'owner@example.com'},plan:'team',password:'MUST NOT BE SAVED',invites:[]};
  const org=createOrganisation(data);assert.throws(()=>createOrganisation(data),/already used/);
  assert.throws(()=>validateInvite('owner@example.com','Planner',org.owner.email,[]),/owner is already included/);
  assert.throws(()=>validateInvite('a@example.com','Owner',org.owner.email,[]),/Choose Admin/);
  const invite=validateInvite('a@example.com','Planner',org.owner.email,[]);updateOrganisation(org.id,{invites:[invite]});assert.equal(findOrganisation('test-company').invites.length,1);
  assert.ok(!window.localStorage.getItem(ORGANISATIONS_KEY).includes('MUST NOT BE SAVED'));
  startPreview(org);assert.equal(currentAccount().organisation.slug,'test-company');
  const {loadWorkspace,saveWorkspace}=await import('../js/storage.js');
  await saveWorkspace({projects:[{id:'demo-project'}]});await saveWorkspace({projects:[{id:'company-project'}]},'org:'+org.id);
  assert.equal((await loadWorkspace()).projects[0].id,'demo-project');assert.equal((await loadWorkspace('org:'+org.id)).projects[0].id,'company-project');dom.window.close();
});
test('homepage and account-page links resolve under a GitHub Pages subpath',()=>{
  for(const file of ['index.html','signin.html','create-organisation.html','organisation.html','workspace.html']){
    const dom=new JSDOM(readFileSync(new URL('../'+file,import.meta.url),'utf8'),{url:origin+file});
    for(const node of dom.window.document.querySelectorAll('[href],[src]')){
      const link=node.getAttribute('href')||node.getAttribute('src');if(!link||link.startsWith('#')||/^https?:/.test(link))continue;
      const target=new URL(link,new URL('../'+file,import.meta.url));target.search='';target.hash='';assert.ok(existsSync(target),`${file}: ${link}`);
    }
    assert.equal(dom.window.document.querySelectorAll('main').length,file==='workspace.html'?0:1);dom.window.close();
  }
});
function rootText(){return $('#account-root').textContent;}

test('employee invitation, verification, reset and owner-managed access complete without saving passwords',async()=>{
 let dom=await openPage('create-organisation.html');
 const org=createOrganisation({name:'Harbour Projects',slug:'harbour-projects',industry:'Construction',country:'South Africa',size:'11–50 people',owner:{name:'Owner',email:'owner@harbour.test'},plan:'team',invites:[{email:'planner@harbour.test',role:'Planner'}]});
 const invite=org.invites[0];updateOrganisation(org.id,{plan:'enterprise',invites:org.invites});assert.equal(findOrganisation(org.slug).invites[0].id,invite.id);
 let saved=window.localStorage.getItem(ORGANISATIONS_KEY);dom.window.close();
 dom=await openPage('signin.html',{saved,query:`?flow=invite&org=${org.id}&invite=${invite.id}`});
 submit('#accept-invitation-form',{name:'Project Planner',password:'sample-pass-123',confirm:'sample-pass-123'});assert.match(rootText(),/member preview is ready/);assert.equal(currentAccount().role,'Planner');
 const memberId=currentAccount().memberId;let session=window.sessionStorage.getItem(SESSION_KEY);saved=window.localStorage.getItem(ORGANISATIONS_KEY);assert.ok(!saved.includes('sample-pass-123'));dom.window.close();
 dom=await openPage('signin.html',{saved,session,query:`?flow=verify&org=${org.id}`});click('[data-flow-verify]');assert.match(rootText(),/has not verified an email/);assert.equal(currentAccount().organisation.members[0].emailVerifiedPreview,true);
 saved=window.localStorage.getItem(ORGANISATIONS_KEY);dom.window.close();
 dom=await openPage('organisation.html',{saved,session});assert.equal($('[data-tab="billing"]'),null);click('[data-org-action="tab"][data-tab="people"]');assert.equal($('[data-org-action="member"]'),null);dom.window.close();
 dom=await openPage('signin.html',{saved,session,query:`?flow=reset&org=${org.id}&state=expired`});assert.match(rootText(),/link has expired/);click('[data-flow-state="pending"]');submit('#complete-reset-form',{password:'sample-reset-123',confirm:'different-pass'});assert.match($('#form-error').textContent,/matching sample passwords/);assert.equal($('[name="password"]').value,'');submit('#complete-reset-form',{password:'sample-reset-123',confirm:'sample-reset-123'});assert.match(rootText(),/No password was stored or changed/);assert.ok(!window.localStorage.getItem(ORGANISATIONS_KEY).includes('sample-reset-123'));dom.window.close();
 const {saveWorkspace}=await import('../js/storage.js');await saveWorkspace({projects:[{id:'project-1',name:'Shutdown'}]},'org:'+org.id);
 session=JSON.stringify({organisationId:org.id,memberId:null,preview:true});dom=await openPage('organisation.html',{saved,session});await new Promise(r=>setTimeout(r,40));click('[data-org-action="tab"][data-tab="people"]');click('[data-org-action="member"]');$('[name="project"]').checked=true;submit('#org-member-form',{role:'Viewer',status:'Active',access:'selected'});assert.deepEqual(currentAccount().organisation.members[0].projectAccess,['project-1']);assert.equal(currentAccount().organisation.members[0].role,'Viewer');
 click('[data-org-action="member"]');submit('#org-member-form',{status:'Deactivated'});startPreview(org,memberId);assert.equal(currentAccount(),null);dom.window.close();
});
