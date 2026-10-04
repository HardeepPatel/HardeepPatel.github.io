// Reference banking choreography and durations, with portfolio-specific content.
// Pause offscreen and expose playback controls without changing the paper-panel sequence.
const projectMotion = matchMedia('(prefers-reduced-motion: reduce)');
document.querySelectorAll('[data-financial-demo]').forEach(demo => {
  const execution = demo.dataset.financialDemo === 'execution';
  const durations = execution
    ? [900,1500,1800,2200,2600,3000,3000,3200,3200,3200]
    : [1000,2400,1700,2600,2200,2200,2200,3000];
  const captions = execution
    ? ['Retrieve','Retrieve','Generate','Implement','Experiment context','Candidate policy','Evaluate','Compare results','Retain evidence','Next iteration']
    : ['Request','Transfer received','Transaction plan','Replicate','Prepare','Await both votes','Commit decision','Consistent balances'];
  const controls=demo.nextElementSibling;
  const name=execution?'caching':'banking';
  const panels=[...demo.querySelector('.financial-poetic-stage').children];
  const visiblePanels=execution
    ? [[0],[0],[0],[0],[0,1],[0,2],[0,3],[0,4],[0,5],[0,5,6]]
    : [[0],[0,1],[1,2],[2],[2,3],[2,3],[2,3,4],[2,3,4,5]];
  let phase=projectMotion.matches?durations.length-1:0, paused=projectMotion.matches, visible=false, timer;
  function draw(){
    demo.dataset.phase=String(phase);
    controls.querySelector('[data-animation-caption]').textContent=captions[phase];
    panels.forEach((panel,index)=>{
      const active=visiblePanels[phase].includes(index);
      panel.setAttribute('aria-hidden',String(!active));
      panel.inert=!active;
    });
  }
  function schedule(){
    clearTimeout(timer);
    if(!paused&&visible&&!document.hidden)timer=setTimeout(()=>{phase=(phase+1)%durations.length;draw();schedule();},durations[phase]);
  }
  controls.querySelector('[data-animation-replay]').addEventListener('click',()=>{phase=0;paused=false;draw();schedule();});
  controls.querySelector('[data-animation-next]').addEventListener('click',()=>{phase=(phase+1)%durations.length;paused=true;draw();schedule();});
  demo.querySelector('[data-scene-next]')?.addEventListener('click',()=>{phase=2;paused=false;controls.querySelector('[data-animation-next]').focus({preventScroll:true});draw();schedule();});
  new IntersectionObserver(([entry])=>{visible=entry.isIntersecting; schedule();},{threshold:0.18}).observe(demo);
  document.addEventListener('visibilitychange',schedule);
  projectMotion.addEventListener('change',e=>{if(e.matches){paused=true;phase=durations.length-1;}draw();schedule();});
  draw();
});
