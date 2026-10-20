// Frontend configuration only. These records are not accounts or access controls.
// Never add passwords, reset tokens, payment data or API secrets to this store.
// Established storage keys preserve existing local organisation profiles after rebranding.
export const ORGANISATIONS_KEY = 'clarity.organisations.preview.v1';
export const SESSION_KEY = 'clarity.session.preview.v1';
import {plans,quote,licenceUsage,budgetCounts} from './pricing.js';
export {plans} from './pricing.js';
export const roles = ['Admin','Planner','Viewer'];
export const demoOrganisation = {
  id:'demo', name:'NextGen Planning', slug:'nextgen-planning', industry:'Construction',
  country:'South Africa', size:'11–50 people', plan:'team', demo:true,
  owner:{name:'Alex Morgan',email:'alex@example.com'}, invites:[]
};
export const emailValid = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value));
export const slugify = value => String(value).normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,48).replace(/-$/,'');
export const initials = value => String(value).trim().split(/\s+/).slice(0,2).map(v=>v[0]||'').join('').toUpperCase();
function read(key, session=false) {
  try {return JSON.parse((session?window.sessionStorage:window.localStorage).getItem(key)||'null');}
  catch {return null;}
}
function write(key, value, session=false) {
  try {(session?window.sessionStorage:window.localStorage).setItem(key,JSON.stringify(value));}
  catch {throw new Error('Browser storage is unavailable or full. Allow storage for this site, then try again.');}
}
function savedOrganisations() {
  const value=read(ORGANISATIONS_KEY);
  return Array.isArray(value)?value.filter(o=>o&&typeof o.id==='string'&&o.id!=='demo'&&typeof o.name==='string'&&typeof o.slug==='string'&&o.owner&&typeof o.owner.name==='string'&&emailValid(o.owner.email)&&plans[o.plan]&&Array.isArray(o.invites)):[];
}
export const organisations=()=>[demoOrganisation,...savedOrganisations()];
export const findOrganisation=slug=>organisations().find(o=>o.slug===String(slug).trim().toLowerCase());
export function currentAccount() {
  const session=read(SESSION_KEY,true);
  const organisation=organisations().find(o=>o.id===session?.organisationId);
  if(!organisation)return null;const member=session.memberId?(organisation.members||[]).find(m=>m.id===session.memberId&&m.status==='Active'):null;if(session.memberId&&!member)return null;return {organisation,name:member?.name||organisation.owner.name,email:member?.email||organisation.owner.email,role:member?.role||'Owner',memberId:member?.id||null};
}
export function startPreview(organisation,memberId=null) {
  write(SESSION_KEY,{organisationId:organisation.id,memberId,preview:true},true);
  return organisation;
}
export function signOutPreview() {
  try {window.sessionStorage.removeItem(SESSION_KEY);} catch {throw new Error('This browser could not clear the preview session.');}
}
export function validateCompany(data,exceptId='') {
  if(!String(data.name||'').trim()||data.name.length>80)throw new Error('Enter a company name of up to 80 characters.');
  if(!/^[a-z0-9](?:[a-z0-9-]{1,46}[a-z0-9])$/.test(data.slug||''))throw new Error('Use a workspace address of 3–48 lowercase letters, numbers or hyphens.');
  if(organisations().some(o=>o.id!==exceptId&&o.slug===data.slug))throw new Error('That workspace address is already used in this preview. Choose a different address.');
  if(!data.industry||!data.country||!data.size)throw new Error('Choose your industry, country and company size.');
}
export function validateInvite(email,role,ownerEmail,invites) {
  email=String(email).trim().toLowerCase();
  if(!emailValid(email)||email.length>254)throw new Error('Enter a valid work email address.');
  if(!roles.includes(role))throw new Error('Choose Admin, Planner or Viewer.');
  if(email===ownerEmail.toLowerCase())throw new Error('The owner is already included. Use a different email for a teammate.');
  if(invites.some(i=>i.email.toLowerCase()===email))throw new Error('That email already has an invitation draft.');
  if(invites.length>=50)throw new Error('This preview supports up to 50 invitation drafts.');
  return {id:crypto.randomUUID(),email,role,status:'Draft',createdAt:new Date().toISOString(),expiresAt:new Date(Date.now()+7*86400000).toISOString()};
}
export function createOrganisation(data) {
  validateCompany(data);
  if(!data.owner?.name?.trim()||data.owner.name.length>80||!emailValid(data.owner.email))throw new Error('Enter your name and a valid work email.');
  if(!plans[data.plan])throw new Error('Choose a plan to preview.');
  // Explicit fields keep sensitive form values out of persisted data.
  const org={id:crypto.randomUUID(),name:data.name.trim(),slug:data.slug,industry:data.industry,country:data.country,size:data.size,plan:data.plan,owner:{name:data.owner.name.trim(),email:data.owner.email.trim().toLowerCase()},invites:[],createdAt:new Date().toISOString()};
  for(const invite of data.invites||[])org.invites.push(validateInvite(invite.email,invite.role,org.owner.email,org.invites));
  if(data.billingPreferences)org.billingPreferences=billingSettings(org,data.billingPreferences);
  write(ORGANISATIONS_KEY,[...savedOrganisations(),org]);
  return org;
}
export function updateOrganisation(id,changes) {
  if(id==='demo')throw new Error('Create your own organisation preview to save team and plan changes.');
  const saved=savedOrganisations(),index=saved.findIndex(o=>o.id===id);
  if(index<0)throw new Error('This organisation preview is no longer saved. Please create it again.');
  const org={...saved[index]};
  if(changes.plan){if(!plans[changes.plan])throw new Error('Choose a valid plan.');org.plan=changes.plan;}
  if(Object.hasOwn(changes,'name')){const next={...org,...changes};validateCompany(next,id);for(const key of ['name','industry','country','size'])org[key]=next[key];}
  if(changes.invites){const invites=[];for(const invite of changes.invites){const checked=validateInvite(invite.email,invite.role,org.owner.email,invites),prior=(org.invites||[]).find(i=>i.email.toLowerCase()===checked.email);invites.push({...checked,id:prior?.id||checked.id,status:['Draft','Accepted preview','Revoked'].includes(invite.status)?invite.status:'Draft',createdAt:prior?.createdAt||checked.createdAt,expiresAt:Number.isFinite(Date.parse(invite.expiresAt))?invite.expiresAt:prior?.expiresAt||checked.expiresAt,projectAccess:invite.projectAccess==='All'?'All':Array.isArray(invite.projectAccess)?invite.projectAccess.filter(v=>typeof v==='string').slice(0,100):'All'});}org.invites=invites;}
  if(changes.members){if(!Array.isArray(changes.members)||changes.members.length>199)throw new Error('Use up to 199 members plus the owner in this preview.');const emails=new Set([org.owner.email.toLowerCase()]);org.members=changes.members.map(m=>{const email=String(m.email||'').trim().toLowerCase();if(!emailValid(email)||emails.has(email)||!roles.includes(m.role)||!String(m.name||'').trim())throw new Error('Use unique member emails, names and valid roles.');emails.add(email);return {id:typeof m.id==='string'?m.id:crypto.randomUUID(),name:String(m.name).trim().slice(0,80),email,role:m.role,status:m.status==='Deactivated'?'Deactivated':'Active',projectAccess:m.projectAccess==='All'?'All':Array.isArray(m.projectAccess)?m.projectAccess.filter(v=>typeof v==='string').slice(0,100):[],joinedAt:m.joinedAt||new Date().toISOString(),emailVerifiedPreview:!!m.emailVerifiedPreview};});}
  if(changes.billingPreferences)org.billingPreferences=billingSettings(org,changes.billingPreferences);
  if(changes.plan||changes.members)quote({plan:org.plan,...licenceUsage(org)});
  if(Object.hasOwn(changes,'emailVerifiedPreview'))org.emailVerifiedPreview=!!changes.emailVerifiedPreview;
  saved[index]=org;write(ORGANISATIONS_KEY,saved);return org;
}

function billingSettings(org,b){
 const used=licenceUsage(org),counts=budgetCounts(org),fullUsers=Number(b.fullUsers??counts.fullUsers),viewerUsers=Number(b.viewerUsers??counts.viewerUsers),cycle=b.cycle==='Annual'?'Annual':'Monthly';
 quote({plan:org.plan,fullUsers,viewerUsers,cycle});
 if(fullUsers<used.fullUsers||viewerUsers<used.viewerUsers)throw new Error('Planned licences must cover your active full users and viewers.');
 return {email:emailValid(b.email)?b.email:org.owner.email,companyReference:String(b.companyReference||'').slice(0,100),cycle,fullUsers,viewerUsers,requestedSeats:fullUsers+viewerUsers,cancellationRequested:!!b.cancellationRequested};
}
