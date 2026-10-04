const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'chrome'});
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.url())});
 const base=process.env.PORTFOLIO_URL||'http://localhost:8000';
 for(const width of [1440,390,320]){
  await page.setViewportSize({width,height:900});
  for(const name of ['works','expertise','about']){
   await page.goto(`${base}/html/${name}.html`);await page.evaluate(()=>document.fonts.ready);
   await page.locator('img').evaluateAll(async imgs=>{await Promise.all(imgs.map(i=>{i.loading='eager';return i.decode()}))});
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${name}: overflow at ${width}`);
   assert.equal(await page.locator('h1').count(),1);
   if(width===390)await page.screenshot({path:`/tmp/${name}-mobile.png`,fullPage:true});
  }
 }
 await page.setViewportSize({width:1440,height:1000});await page.goto(base+'/html/expertise.html');
 const grid=page.locator('.banking-application-cloud');
 await grid.evaluate(e=>e.scrollIntoView({behavior:'instant',block:'center'}));
 await page.waitForFunction(()=>document.querySelector('.skills-visual').classList.contains('is-revealed'));
 await page.waitForTimeout(1600);assert.equal(await page.locator('.banking-application').count(),24);
 await page.screenshot({path:'/tmp/skills-reveal.png'});
 await page.evaluate(()=>scrollTo({top:document.body.scrollHeight,behavior:'instant'}));
 await page.waitForFunction(()=>!document.querySelector('.skills-visual').classList.contains('is-revealed'));
 await grid.evaluate(e=>e.scrollIntoView({behavior:'instant',block:'center'}));
 await page.waitForFunction(()=>document.querySelector('.skills-visual').classList.contains('is-revealed'));
 await page.getByRole('link',{name:'Explore the banking system'}).click();await page.waitForURL('**/works.html#projects');
 const bank=page.locator('[data-financial-demo="procedure"]');
 await bank.evaluate(e=>e.scrollIntoView({behavior:'instant',block:'center'}));
 const first=await bank.getAttribute('data-phase');await page.waitForFunction(p=>document.querySelector('[data-financial-demo="procedure"]').dataset.phase!==p,first);
 await page.getByRole('button',{name:'Replay banking animation'}).click();await page.getByRole('button',{name:'Next banking scene'}).click();
 const boxes=await page.locator('.financial-poetic-demo').evaluateAll(els=>els.map(e=>({x:e.getBoundingClientRect().x,y:e.getBoundingClientRect().y})));
 assert(Math.abs(boxes[0].y-boxes[1].y)<2&&boxes[1].x>boxes[0].x,'Desktop demos side by side');
 await page.screenshot({path:'/tmp/work-projects.png'});
 for(const anchor of ['context','toya','infibeam','isro','iit'])assert.equal(await page.locator('#'+anchor).count(),1);
 assert.equal(await page.getByRole('button',{name:/\bplay\b|\bpause\b/i}).count(),0);
 await page.goto(base+'/html/about.html');assert((await page.locator('main').innerText()).includes('My long-term goal is to become a founder.'));
 assert.deepEqual(errors,[]);await browser.close();console.log('PASS: Work, Skills, About at desktop/mobile; images load; skills reveal reverses and replays; work links, project autoplay and controls; no overflow or browser errors.');
})().catch(e=>{console.error(e);process.exit(1)});
