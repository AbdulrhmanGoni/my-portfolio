(function(){const i=document.createElement("link").relList;if(i&&i.supports&&i.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))n(e);new MutationObserver(e=>{for(const t of e)if(t.type==="childList")for(const r of t.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&n(r)}).observe(document,{childList:!0,subtree:!0});function o(e){const t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?t.credentials="include":e.crossOrigin==="anonymous"?t.credentials="omit":t.credentials="same-origin",t}function n(e){if(e.ep)return;e.ep=!0;const t=o(e);fetch(e.href,t)}})();const p=document.querySelector("#nav-menu-icon"),u=document.querySelector("#navbar");p.addEventListener("click",()=>{p.classList.toggle("open")?u.classList.add("mobile-navbar"):u.classList.remove("mobile-navbar")});const f=document.querySelector("header");window.onscroll=function(){this.scrollY>=100?f.classList.add("active"):f.classList.remove("active")};const m=document.querySelectorAll(".skill");if(m){const s={position:"fixed",transition:".3s",padding:"5px",animation:"tooltip-appearing .3s ease-in",backgroundColor:"black",textWrap:"nowrap",zIndex:"1000",borderRadius:"5px",boxShadow:"0 0 7px -4px var(--primary-color)"},i=document.createElement("p");i.className="tooltip",Object.assign(i.style,s),m.forEach(o=>{o.addEventListener("mouseenter",()=>{var n;if(!o.querySelector(".tooltip")){const e=o.getBoundingClientRect();let t=e.x+e.width/2,r=e.y+e.height/2;const c=(n=o.querySelector("img"))==null?void 0:n.getAttribute("alt");if(c){i.textContent=c,o.appendChild(i);const l=i.getBoundingClientRect(),y=l.width,g=l.height,a=r-g/2,d=t-y/2;i.style.top=`${a<0?0:a}px`,i.style.left=`${d<0?0:d}px`}}}),o.addEventListener("mouseleave",()=>{const n=o.querySelector(".tooltip");n&&o.removeChild(n)}),document.addEventListener("scroll",()=>{const n=o.querySelector(".tooltip");n&&o.removeChild(n)})})}
