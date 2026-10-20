import {pricingSection,bindPricingForms} from './pricing-ui.js';
import {demoOrganisation,startPreview} from './account-store.js';
document.querySelector('[data-menu]')?.addEventListener('click',event=>{
  const button=event.currentTarget,open=button.getAttribute('aria-expanded')!=='true';
  button.setAttribute('aria-expanded',String(open));document.querySelector('#site-nav').classList.toggle('open',open);
});
document.querySelectorAll('#site-nav a').forEach(link=>link.addEventListener('click',()=>{
  document.querySelector('#site-nav').classList.remove('open');document.querySelector('[data-menu]').setAttribute('aria-expanded','false');
}));
document.querySelectorAll('[data-demo]').forEach(link=>link.addEventListener('click',()=>{
  try {startPreview(demoOrganisation);} catch { /* The planning workspace also opens without a session. */ }
}));

const pricing=document.querySelector('#plans');if(pricing){pricing.innerHTML=pricingSection();bindPricingForms();}
