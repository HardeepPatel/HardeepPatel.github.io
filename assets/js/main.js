const button = document.querySelector(".menu-button");
const navigation = document.querySelector("#navigation");
function closeMenu() {
  navigation.classList.remove("is-open");
  button.setAttribute("aria-expanded", "false");
  button.setAttribute("aria-label", "Open menu");
}
button.addEventListener("click", () => {
  const open = button.getAttribute("aria-expanded") !== "true";
  navigation.classList.toggle("is-open", open);
  button.setAttribute("aria-expanded", String(open));
  button.setAttribute("aria-label", open ? "Close menu" : "Open menu");
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && button.getAttribute("aria-expanded") === "true") {
    closeMenu();
    button.focus();
  }
});
navigation.addEventListener("click", (e) => {
  if (e.target.closest("a")) closeMenu();
});
matchMedia("(min-width:641px)").addEventListener("change", (e) => {
  if (e.matches) closeMenu();
});
document
  .querySelectorAll("[data-year]")
  .forEach((el) => (el.textContent = new Date().getFullYear()));
const tabs = [...document.querySelectorAll(".workspace-tabs [role=tab]")];
function activateTab(tab) {
  tabs.forEach((t) => {
    const active = t === tab;
    t.setAttribute("aria-selected", String(active));
    t.tabIndex = active ? 0 : -1;
    document.getElementById(t.getAttribute("aria-controls")).hidden = !active;
  });
}
tabs.forEach((tab, i) => {
  tab.addEventListener("click", () => activateTab(tab));
  tab.addEventListener("keydown", (e) => {
    let next;
    if (e.key === "ArrowRight") next = tabs[(i + 1) % tabs.length];
    if (e.key === "ArrowLeft") next = tabs[(i + tabs.length - 1) % tabs.length];
    if (e.key === "Home") next = tabs[0];
    if (e.key === "End") next = tabs.at(-1);
    if (next) {
      e.preventDefault();
      activateTab(next);
      next.focus();
    }
  });
});
const slides = [...document.querySelectorAll(".banking-use-case-slide")];
slides.forEach((slide) => {
  function activate() {
    if (matchMedia("(min-width:641px)").matches) {
      slides.forEach((s) => s.classList.toggle("is-active", s === slide));
      slide.parentElement.classList.add("has-focus");
    }
  }
  slide.addEventListener("mouseenter", activate);
  slide.addEventListener("focusin", activate);
});
document
  .querySelector(".banking-use-case-track")
  ?.addEventListener("mouseleave", () => {
    slides.forEach((s) => s.classList.remove("is-active"));
    document
      .querySelector(".banking-use-case-track")
      .classList.remove("has-focus");
  });
const workSlides = [...document.querySelectorAll(".progress-slide")];
function selectWork(slide) {
  workSlides.forEach((s) => {
    const active = s === slide;
    s.classList.toggle("is-active", active);
    s.querySelector(".progress-rail").setAttribute(
      "aria-expanded",
      String(active),
    );
    s.querySelector(".progress-card").inert = !active;
  });
}
workSlides.forEach((slide) => {
  slide
    .querySelector(".progress-rail")
    .addEventListener("click", () => selectWork(slide));
  slide.querySelector(".progress-rail").addEventListener("keydown", (e) => {
    const i = workSlides.indexOf(slide);
    let next;
    if (["ArrowRight", "ArrowDown"].includes(e.key))
      next = workSlides[(i + 1) % workSlides.length];
    if (["ArrowLeft", "ArrowUp"].includes(e.key))
      next = workSlides[(i + workSlides.length - 1) % workSlides.length];
    if (next) {
      e.preventDefault();
      selectWork(next);
      next.querySelector(".progress-rail").focus();
    }
  });
});

// Original banking-page icon reveal, with no image desaturation or size overrides.
const skillSection = document.querySelector(".banking-ecosystem-capability");
const skillCloud = skillSection?.querySelector(".banking-application-cloud");
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
if (skillSection && skillCloud) {
  const icons = [...skillSection.querySelectorAll(".banking-application")];
  icons.forEach((icon, i) =>
    icon.style.setProperty("--banking-reveal-row", String(Math.floor(i / 8))),
  );
  // Match the banking reference: replay when 35% of the grid enters view,
  // reverse when it leaves, in either scroll direction.
  skillSection.classList.add("banking-reveal-ready");
  const reveal = new IntersectionObserver(([entry]) => {
    skillSection.classList.toggle("is-revealed", reducedMotion.matches || Boolean(entry?.isIntersecting && entry.intersectionRatio >= 0.35));
  }, { threshold: [0, 0.35] });
  reveal.observe(skillCloud);
  reducedMotion.addEventListener("change", () => {
    if(reducedMotion.matches) skillSection.classList.add("is-revealed");
    else {reveal.unobserve(skillCloud);reveal.observe(skillCloud);}
  });
  if(reducedMotion.matches) skillSection.classList.add("is-revealed");
}

// User-requested two-second rotation. Pointer interaction does not pause playback.
// Keep keyboard navigation stable, and stop only while hidden, offscreen, or keyboard-focused.
const carousel = document.querySelector('.portfolio-carousel');
if(carousel && workSlides.length){
  const counter=carousel.querySelector('[data-work-count]');
  let visible=false, keyboardMode=false, keyboardFocus=false, timer=null;
  const activeIndex=()=>workSlides.findIndex(s=>s.classList.contains('is-active'));
  function draw(){
    counter.textContent=`${String(activeIndex()+1).padStart(2,'0')} / ${String(workSlides.length).padStart(2,'0')}`;
  }
  function schedule(){
    clearTimeout(timer);
    if(visible&&!keyboardFocus&&!document.hidden) timer=setTimeout(()=>{
      selectWork(workSlides[(activeIndex()+1)%workSlides.length]);draw();schedule();
    },2000);
  }
  document.addEventListener('keydown',e=>{if(e.key==='Tab')keyboardMode=true;});
  document.addEventListener('pointerdown',()=>{keyboardMode=false;if(keyboardFocus){keyboardFocus=false;schedule();}},{passive:true});
  carousel.addEventListener('focusin',e=>{keyboardFocus=keyboardMode;schedule();});
  carousel.addEventListener('focusout',()=>requestAnimationFrame(()=>{
    keyboardFocus=keyboardMode&&carousel.contains(document.activeElement);schedule();
  }));
  workSlides.forEach(slide=>{
    slide.querySelector('.progress-rail').addEventListener('click',()=>{draw();schedule();});
    slide.querySelector('.progress-rail').addEventListener('keydown',()=>requestAnimationFrame(draw));
  });
  new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;schedule();},{threshold:0}).observe(carousel.querySelector('.progress-viewport'));
  document.addEventListener('visibilitychange',schedule);
  draw();
}
