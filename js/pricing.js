// Proposed launch pricing only. Authoritative entitlements and charges belong on the server.
export const plans={
 essentials:{name:'Essentials',description:'A focused workspace for a small planning team.',monthly:499,maxUsers:10},
 team:{name:'Team',description:'More room for growing project teams.',monthly:1499,maxUsers:50},
 enterprise:{name:'Enterprise',description:'A company-wide workspace for larger teams.',monthly:3999,maxUsers:200}
};
export const licenceRates={full:149,viewer:49};
export const roleCodes={Owner:'OWN',Admin:'ADM',Planner:'PLN',Viewer:'VWR'};
export const rand=cents=>'R'+(cents/100).toLocaleString('en-ZA',{minimumFractionDigits:cents%100?2:0,maximumFractionDigits:2});
export function recommendedPlan(users){return Object.keys(plans).find(key=>users<=plans[key].maxUsers)||null;}
export function quote({plan='auto',fullUsers=1,viewerUsers=0,cycle='Monthly'}={}){
 fullUsers=Number(fullUsers);viewerUsers=Number(viewerUsers);
 if(!Number.isSafeInteger(fullUsers)||fullUsers<1||!Number.isSafeInteger(viewerUsers)||viewerUsers<0||fullUsers+viewerUsers>10000)throw new Error('Enter whole user counts: at least one full user (the owner), and zero or more viewers.');
 if(!['Monthly','Annual'].includes(cycle))throw new Error('Choose monthly or annual billing.');
 const users=fullUsers+viewerUsers,recommended=recommendedPlan(users),key=plan==='auto'?recommended:plan;
 if(!recommended)throw new Error('More than 200 users needs a custom quote. No automatic price is offered.');
 if(!plans[key])throw new Error('Choose a valid company plan.');
 if(users>plans[key].maxUsers)throw new Error(`${plans[key].name} supports up to ${plans[key].maxUsers} active users. Choose ${plans[recommended].name} or a larger plan.`);
 const baseCents=plans[key].monthly*100,fullCents=fullUsers*licenceRates.full*100,viewerCents=viewerUsers*licenceRates.viewer*100;
 const monthlyCents=baseCents+fullCents+viewerCents,annualDiscountCents=Math.round(monthlyCents*12*0.10),annualCents=monthlyCents*12-annualDiscountCents;
 return {plan:key,users,fullUsers,viewerUsers,cycle,baseCents,fullCents,viewerCents,monthlyCents,annualDiscountCents,annualCents,amountCents:cycle==='Annual'?annualCents:monthlyCents};
}
export function licenceUsage(org){const members=(org.members||[]).filter(m=>m.status==='Active'),viewerUsers=members.filter(m=>m.role==='Viewer').length;return {fullUsers:1+members.length-viewerUsers,viewerUsers,users:1+members.length,inactive:(org.members||[]).length-members.length};}
// Stable identity is independent of role. Licence references reflect the current role.
export function userReference(org,member){return member?`PV-U-${member.id}`:`PV-U-${org.id}-OWNER`;}
export function licenceReference(org,member){const role=member?.role||'Owner';return `PV-${roleCodes[role]||'PLN'}-${member?.id||org.id}`;}
export function budgetCounts(org){const used=licenceUsage(org),b=org.billingPreferences||{};return {fullUsers:Math.max(used.fullUsers,Number.isSafeInteger(b.fullUsers)?b.fullUsers:used.fullUsers),viewerUsers:Math.max(used.viewerUsers,Number.isSafeInteger(b.viewerUsers)?b.viewerUsers:used.viewerUsers)};}
