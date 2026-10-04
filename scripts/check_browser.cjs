// Run with Playwright available through NODE_PATH; the site itself has no dependencies.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
(async () => {
 const browser = await chromium.launch({headless:true, channel:process.env.BROWSER_CHANNEL || "chrome"});
 const page = await browser.newPage();
 const errors=[];
 page.on('pageerror', e => errors.push(e.message));
 page.on('response', r => {if(r.status()>=400) errors.push(`${r.status()} ${r.url()}`)});
 const base=process.env.PORTFOLIO_URL || 'http://localhost:8000';
 for (const width of [1440,768,390,320]) {
  await page.setViewportSize({width,height:900});
  for (const path of ['/', '/html/works.html','/html/about.html','/html/expertise.html','/html/contacts.html']) {
   await page.goto(base+path); await page.evaluate(()=>document.fonts.ready);
   assert.equal(await page.locator('h1').count(),1);
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Horizontal overflow at ${width}: ${path}`);
   for (const img of await page.locator('img').all()) { if(await img.isVisible()) {await img.scrollIntoViewIfNeeded(); await img.evaluate(el => el.decode());} }
  }
 }
 await page.goto(base);
 await page.getByRole('tab',{name:'Projects',exact:true}).click();
 assert(await page.getByRole('tabpanel',{name:'Projects'}).getByRole('heading',{name:'Distributed Banking System'}).isVisible());
 await page.getByRole('tab',{name:'Education',exact:true}).click();
 assert(await page.getByRole('tabpanel',{name:'Education'}).getByRole('heading',{name:'Arizona State University'}).isVisible());
 await page.getByRole('tab',{name:'Education',exact:true}).press('Home');
 assert.equal(await page.getByRole('tab',{name:'Experience',exact:true}).getAttribute('aria-selected'),'true');
 await page.getByRole('button',{name:'ISRO',exact:true}).click();
 assert.equal(await page.getByRole('button',{name:'ISRO',exact:true}).getAttribute('aria-expanded'),'true');
 assert.equal(await page.locator('#work-isro').evaluate(el=>el.inert),false);
 assert.equal(await page.locator('.banking-application').count(),24);
 await page.getByRole('button',{name:'Open menu'}).click();
 await page.getByRole('navigation',{name:'Main navigation',exact:true}).getByRole('link',{name:'Work',exact:true}).click();
 await page.waitForURL('**/html/works.html');
 assert(await page.getByRole('heading',{name:'Distributed Banking System'}).isVisible());
 await page.getByRole('button',{name:'Open menu'}).click();
 await page.keyboard.press('Escape');
 assert.equal(await page.getByRole('button',{name:'Open menu'}).getAttribute('aria-expanded'),'false');
 await page.goto(base+'/html/contacts.html');
 assert((await page.locator('a[href="mailto:hardeep.s.patel@gmail.com"]').count())>=2);
 const [download] = await Promise.all([page.waitForEvent('download'),page.getByRole('link',{name:'RÉSUMÉ Download résumé'}).click()]);
 assert.equal(download.suggestedFilename(),'Hardeep-Patel-Resume.pdf');
 await page.goto(base+'/html/expertise1.html');
 await page.waitForURL('**/html/expertise.html');
 await page.setViewportSize({width:1440,height:1000});
 await page.goto(base);
 // Original skills reveal must replay when scrolling down and back up.
 const skills=page.locator('.banking-application-cloud');
 const icon=page.locator('.banking-application').first();
 const cloudTop=await skills.evaluate(el=>el.getBoundingClientRect().top+scrollY);
 await page.evaluate(y=>scrollTo({top:y-280,behavior:'instant'}),cloudTop);
 await page.waitForFunction(()=>getComputedStyle(document.querySelector('.banking-application')).opacity==='1');
 await page.evaluate(y=>scrollTo({top:y+700,behavior:'instant'}),cloudTop);
 await page.waitForFunction(()=>getComputedStyle(document.querySelector('.banking-application')).opacity==='0');
 await page.evaluate(y=>scrollTo({top:y-280,behavior:'instant'}),cloudTop);
 await page.waitForFunction(()=>getComputedStyle(document.querySelector('.banking-application')).opacity==='1');
 // Visitors can watch the work rotate without hovering, without playback buttons.
 const carousel=page.locator('.portfolio-carousel');
 await carousel.scrollIntoViewIfNeeded();await page.mouse.move(0,0);
 await page.waitForTimeout(250);
 let active=await page.locator('.progress-slide.is-active .progress-rail').innerText();
 for(let i=0;i<5;i++){
  const started=Date.now();
  await page.waitForFunction(previous=>document.querySelector('.progress-slide.is-active .progress-rail').innerText!==previous,active,{timeout:2700});
  assert(Date.now()-started<=2700,'Carousel must advance in roughly two seconds');
  active=await page.locator('.progress-slide.is-active .progress-rail').innerText();
 }
 // Pointer selection must not accidentally pause the carousel (the reported bug).
 await page.getByRole('button',{name:'Infibeam Avenues',exact:true}).click();
 await page.waitForFunction(()=>document.querySelector('.progress-slide.is-active .progress-rail').innerText.trim()==='ISRO',null,{timeout:2700});
 // The reference animation should run on arrival without requiring a click.
 const bank=page.locator('[data-financial-demo="procedure"]');
 const cache=page.locator('[data-financial-demo="execution"]');
 await bank.evaluate(el=>el.scrollIntoView({block:'center',behavior:'instant'}));
 await page.waitForFunction(()=>Number(document.querySelector('[data-financial-demo="procedure"]').dataset.phase)>0,null,{timeout:3000});
 // Exercise every authored scene through the visible controls.
 for(const [name,demo,last] of [['banking',bank,7],['caching',cache,9]]){
   await page.getByRole('button',{name:`Replay ${name} animation`}).click();
   for(let phase=1;phase<=last;phase++){
     await page.getByRole('button',{name:`Next ${name} scene`}).click();
     await page.waitForTimeout(950);
     const frontPanels=await demo.locator('.financial-poetic-stage > :not([aria-hidden="true"])').all();
     assert(frontPanels.length>0,'Each scene must show a meaningful panel');
     if(phase===3&&name==='banking'){
       var fullWidth=await demo.locator('.financial-runbook-editor').evaluate(el=>el.getBoundingClientRect().width);
     }
     if(phase===4&&name==='banking'){
       const splitWidth=await demo.locator('.financial-runbook-editor').evaluate(el=>el.getBoundingClientRect().width);
       assert(splitWidth<fullWidth*.65,'Transaction plan should shrink beside its execution panel');
       assert(await demo.locator('.financial-runbook-preview').evaluate(el=>getComputedStyle(el).opacity==='1'));
     }
   }
 }
 assert.equal(await bank.locator('.financial-poetic-ready').evaluate(el=>getComputedStyle(el).opacity),'1');
 assert((await bank.locator('.financial-poetic-ready').innerText()).includes('Sender: $150.00 · Receiver: $150.00 · Total: $300.00'));
 assert.equal(await cache.locator('.financial-execution-complete').evaluate(el=>getComputedStyle(el).opacity),'1');
 await page.getByRole('button',{name:'Replay banking animation'}).click();
 await page.waitForFunction(()=>document.querySelector('[data-financial-demo="procedure"]').dataset.phase==='7',null,{timeout:18000});
 await page.waitForFunction(()=>document.querySelector('[data-financial-demo="procedure"]').dataset.phase==='0',null,{timeout:4500});
 // Small-screen flow and movement preferences retain useful controls and content.
 for(const width of [1440,768,390,320]){
  await page.setViewportSize({width,height:900});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Page overflow at '+width);
  const boxes=await page.locator('.financial-poetic-demo').evaluateAll(els=>els.map(e=>({x:e.getBoundingClientRect().x,y:e.getBoundingClientRect().y,w:e.clientWidth,h:e.clientHeight})));
  if(width===1440)assert(Math.abs(boxes[0].y-boxes[1].y)<2&&boxes[1].x>boxes[0].x+boxes[0].w,'Projects must remain side by side');
 }
 await page.setViewportSize({width:390,height:844});
 await page.getByRole('button',{name:'Toya Agrisolutions',exact:true}).click();
 await page.waitForFunction(()=>document.querySelector('.progress-slide.is-active .progress-rail').innerText.trim()==='Infibeam Avenues',null,{timeout:2700});
 await page.emulateMedia({reducedMotion:'reduce'});await page.reload();
 assert.equal(await bank.getAttribute('data-phase'),'7');
 assert.equal(await cache.getAttribute('data-phase'),'9');
 await page.getByRole('button',{name:'Next banking scene'}).click();
 assert.equal(await bank.getAttribute('data-phase'),'0');
 assert.deepEqual(errors,[]);
 await browser.close();
 console.log('PASS: 5 pages at 4 screen widths; portfolio tabs, keyboard navigation, work carousel, 24 skill tiles, mobile navigation, Escape, contact destination, résumé download, legacy redirect; two-second carousel autoplay, pointer selection autoplay on desktop/mobile, exact reference panel transitions, all project scenes, automatic replay, reduced motion; no browser or HTTP errors.');
})().catch(e=>{console.error(e);process.exit(1)});
