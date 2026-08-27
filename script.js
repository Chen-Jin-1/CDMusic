// v1.1.3 (1)
document.getElementById('cdm-host')?.remove();
function h(tn = 'span', props, childs, style, parent, attrs, events) {
    const e = Object.assign(document.createElement(tn), props);
    events?.forEach(i => e.addEventListener(i.e, i.f, i.o));
    childs?.forEach(i => typeof i === "object" ? e.appendChild(i) : e.appendChild(document.createTextNode(i)));
    typeof style === "string" ? e.style.cssText = style : Object.assign(e.style, style);
    for (const i in attrs) e.setAttribute(i, attrs[i]);
    parent?.appendChild(e);
    return e;
}
const host = h("div", { id: 'cdm-host' }),
    shadow = host.attachShadow({ mode: 'open' }),
    ch2styles = new CSSStyleSheet();
ch2styles.replaceSync(`.ccw-stage-wrapper canvas {
    display: none !important;
}

.main-module_drawer_d29af.main-module_show-menu_1700d,
.main-module_close-button_6e9cc {
    background: transparent !important;
}

.main-module_drawer_d29af.main-module_show-menu_1700d {
    border-left: 1px solid #ffffff40 !important;
}

button[title="Paused or Unpaused"] {
    visibility: hidden;
}

.main-module_menu_e828e {
    visibility: hidden;
}

.fullscreen-1pm8G .actions-5IRJg:not(:hover) {
    width: 2rem;
}

:root{--cdmodal-primary:#6366f1;--cdmodal-primary-hover:#4f46e5;--cdmodal-overlay-bg:rgba(0,0,0,0.4);--cdmodal-overlay-blur:0.5rem;--cdmodal-modal-bg:rgba(255,255,255,0.95);--cdmodal-modal-border:rgba(255,255,255,0.3);--cdmodal-border-radius:1.75rem;--cdmodal-title-color:#1e293b;--cdmodal-content-color:#475569;--cdmodal-input-bg:rgba(255,255,255,0.9);--cdmodal-input-border:#e2e8f0;--cdmodal-input-text:#1e293b;--cdmodal-cancel-bg:rgba(255,255,255,0.6);--cdmodal-cancel-border:#e2e8f0;--cdmodal-cancel-text:#64748b;--cdmodal-cancel-hover-bg:#f8fafc;--cdmodal-snackbar-bg:#f1f5f9;--cdmodal-snackbar-text:#1e293b;--cdmodal-snackbar-close-bg:rgba(0,0,0,0.08);--cdmodal-snackbar-close-hover:rgba(0,0,0,0.15);--cdmodal-user-select:none;--cdmodal-arrow-filter:invert(1);--cdmodal-settings-item-hover:rgba(0,0,0,0.1);}:root[data-cdmodal-theme="dark"]{--cdmodal-modal-bg:rgba(30,41,59,0.95);--cdmodal-modal-border:rgba(255,255,255,0.1);--cdmodal-title-color:#f1f5f9;--cdmodal-content-color:#cbd5e1;--cdmodal-input-bg:rgba(51,65,85,0.9);--cdmodal-input-border:#475569;--cdmodal-input-text:#f1f5f9;--cdmodal-cancel-bg:rgba(51,65,85,0.6);--cdmodal-cancel-border:#475569;--cdmodal-cancel-text:#cbd5e1;--cdmodal-cancel-hover-bg:#475569;--cdmodal-snackbar-bg:#1e293b;--cdmodal-snackbar-text:#f1f5f9;--cdmodal-snackbar-close-bg:rgba(255,255,255,0.15);--cdmodal-snackbar-close-hover:rgba(255,255,255,0.25);--cdmodal-arrow-filter:none;--cdmodal-settings-item-hover:rgba(255,255,255,0.1);}.cdmodal-overlay{position:fixed;top:0;left:0;width:100%;height:100%;display:flex;justify-content:center;align-items:center;z-index:10000;font-family:'PingFang',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background-color:var(--cdmodal-overlay-bg);backdrop-filter:blur(var(--cdmodal-overlay-blur));animation:cdmodal-fade-in 0.2s ease;}.cdmodal-container{width:22.5rem;max-width:85%;padding:1.5rem 1.375rem;text-align:center;background:var(--cdmodal-modal-bg);backdrop-filter:blur(1.25rem);border-radius:var(--cdmodal-border-radius);box-shadow:0 1.5625rem 2.8125rem -0.75rem rgba(0,0,0,0.35),0 0.25rem 0.75rem rgba(0,0,0,0.1);border:0.0625rem solid var(--cdmodal-modal-border);animation:cdmodal-container-in 0.25s cubic-bezier(0.21,1.11,0.35,1);white-space:break-spaces;word-break:break-all;user-select:var(--cdmodal-user-select);}.cdmodal-title{margin:0 0 0.625rem 0;font-size:1.35rem;font-weight:600;letter-spacing:-0.01875rem;color:var(--cdmodal-title-color);}.cdmodal-content{margin-bottom:1.5rem;line-height:1.45;font-size:0.9rem;padding:0 0.25rem;color:var(--cdmodal-content-color);}.cdmodal-input{width:92%;padding:0.625rem 0.75rem;margin-bottom:1.375rem;border-radius:0.875rem;font-size:0.8125rem;transition:all 0.2s ease;outline:none;font-family:inherit;box-sizing:border-box;background:var(--cdmodal-input-bg);border:0.09375rem solid var(--cdmodal-input-border);color:var(--cdmodal-input-text);}.cdmodal-input:focus{border-color:var(--cdmodal-primary);box-shadow:0 0 0 0.1875rem rgba(99,102,241,0.2);}.cdmodal-buttons{display:flex;justify-content:center;gap:0.625rem;flex-wrap:wrap;margin-top:0.375rem;}.cdmodal-btn-primary{padding:0.5rem 1.125rem;border:none;border-radius:2.5rem;cursor:pointer;font-size:0.8125rem;font-weight:500;transition:all 0.2s ease;min-width:4.375rem;background:var(--cdmodal-primary);color:white;box-shadow:0 0.125rem 0.375rem rgba(0,0,0,0.2);}.cdmodal-btn-primary:hover{transform:translateY(-0.0625rem);box-shadow:0 0.25rem 0.75rem rgba(0,0,0,0.25);background:var(--cdmodal-primary-hover);}.cdmodal-btn-secondary{padding:0.5rem 1.125rem;border-radius:2.5rem;cursor:pointer;font-size:0.8125rem;font-weight:500;transition:all 0.2s ease;min-width:4.375rem;background:var(--cdmodal-cancel-bg);border:0.0625rem solid var(--cdmodal-cancel-border);color:var(--cdmodal-cancel-text);}.cdmodal-btn-secondary:hover{background:var(--cdmodal-cancel-hover-bg);transform:translateY(-0.0625rem);}.cdmodal-snackbar{display:flex;align-items:center;gap:0.75rem;padding:0.625rem 1rem;border-radius:0.75rem;font-size:0.875rem;backdrop-filter:blur(0.5rem);box-shadow:0 0.25rem 0.75rem rgba(0,0,0,0.15);pointer-events:auto;max-width:18.75rem;word-wrap:break-word;animation:cdmodal-snackbar-in 0.3s ease;background:var(--cdmodal-snackbar-bg);color:var(--cdmodal-snackbar-text);user-select:var(--cdmodal-user-select);}.cdmodal-snackbar-close{background:var(--cdmodal-snackbar-close-bg);border:none;width:1.5rem;height:1.5rem;border-radius:0.75rem;cursor:pointer;font-size:0.875rem;display:flex;align-items:center;justify-content:center;transition:background 0.2s;color:inherit;}.cdmodal-snackbar-close:hover{background:var(--cdmodal-snackbar-close-hover);}.cdmodal-snackbar-container{position:fixed;z-index:10001;display:flex;gap:0.625rem;pointer-events:none;font-family:'PingFang';}.cdmodal-settings{display:flex;flex-direction:column;background:var(--cdmodal-modal-bg);border-radius:var(--cdmodal-border-radius);overflow:hidden;width:680px;max-width:92%;height:480px;max-height:80vh;box-shadow:0 25px 45px -12px rgba(0,0,0,0.35),0 4px 12px rgba(0,0,0,0.1);font-family:'PingFang';user-select:var(--cdmodal-user-select);}.cdmodal-settings-header{display:flex;align-items:center;justify-content:space-between;padding:1rem 1.25rem;border-bottom:1px solid rgba(0,0,0,0.06);flex-shrink:0;}.cdmodal-settings-title{margin:0;font-size:1.15rem;font-weight:600;color:var(--cdmodal-title-color);}.cdmodal-settings-close{background:none;border:none;cursor:pointer;font-size:1.1rem;color:var(--cdmodal-content-color);opacity:0.6;padding:0.25rem 0.5rem;border-radius:0.25rem;transition:all 0.2s;}.cdmodal-settings-close:hover{opacity:1;background:var(--cdmodal-settings-item-hover);}.cdmodal-settings-body{display:flex;flex:1;overflow:hidden;}.cdmodal-settings-left{width:180px;min-width:180px;border-right:1px solid rgba(0,0,0,0.06);overflow-y:auto;padding:0.5rem 0;flex-shrink:0;}.cdmodal-settings-left::-webkit-scrollbar{width:3px;}.cdmodal-settings-left::-webkit-scrollbar-thumb{background:rgba(0,0,0,0.15);border-radius:3px;}.cdmodal-settings-menu-item{display:flex;align-items:center;gap:0.5rem;padding:0.55rem 1rem 0.55rem 0.75rem;cursor:pointer;transition:all 0.15s;border-left:3px solid transparent;font-size:0.88rem;color:var(--cdmodal-title-color);border-radius:0 0.25rem 0.25rem 0;}.cdmodal-settings-menu-item:hover{background:var(--cdmodal-settings-item-hover);}.cdmodal-settings-menu-item.active{background:rgba(99,102,241,0.1);border-left:3px solid var(--cdmodal-primary);}.cdmodal-settings-menu-item .label{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}.cdmodal-settings-menu-item .arrow{font-size:1.2rem;color:var(--cdmodal-content-color);opacity:0.5;filter:var(--cdmodal-arrow-filter);zoom:0.7;transform:rotate(-90deg);}.cdmodal-settings-right{flex:1;overflow-y:auto;padding:1rem 1.25rem;}.cdmodal-settings-right::-webkit-scrollbar{width:4px;}.cdmodal-settings-right::-webkit-scrollbar-thumb{background:rgba(0,0,0,0.12);border-radius:4px;}.cdmodal-settings-group-header{margin-bottom:1rem;padding-bottom:0.5rem;border-bottom:1px solid rgba(0,0,0,0.06);}.cdmodal-settings-group-title{font-size:1.05rem;font-weight:600;color:var(--cdmodal-title-color);}.cdmodal-settings-group-desc{font-size:0.8rem;color:var(--cdmodal-content-color);opacity:0.6;margin-top:0.15rem;}.cdmodal-settings-empty{text-align:center;color:var(--cdmodal-content-color);opacity:0.4;padding:2rem 0;font-size:0.9rem;}.cdmodal-setting-row{display:flex;align-items:center;gap:0.75rem;padding:0.5rem 0.75rem;margin-bottom:0.25rem;border-radius:0.375rem;transition:background 0.15s;min-height:44px;}.cdmodal-setting-row:hover{background:rgba(0,0,0,0.02);}.cdmodal-setting-row .label-wrap{flex:0 0 auto;min-width:100px;}.cdmodal-setting-row .label-wrap .main{font-size:0.88rem;font-weight:500;color:var(--cdmodal-title-color);}.cdmodal-setting-row .label-wrap .desc{font-size:0.7rem;color:var(--cdmodal-content-color);opacity:0.5;margin-top:0.1rem;}.cdmodal-setting-row .control-wrap{flex:1;display:flex;justify-content:flex-end;align-items:center;}.cdmodal-switch{position:relative;display:inline-block;width:2.4rem;height:1.4rem;cursor:pointer;flex-shrink:0;}.cdmodal-switch input{opacity:0;width:0;height:0;}.cdmodal-switch .slider{position:absolute;top:0;left:0;right:0;bottom:0;background-color:#aaa;transition:0.25s;border-radius:1.4rem;}.cdmodal-switch .slider .dot{position:absolute;height:1rem;width:1rem;left:0.2rem;bottom:0.2rem;background-color:white;transition:0.25s;border-radius:50%;}.cdmodal-switch input:checked + .slider{background-color:var(--cdmodal-primary);}.cdmodal-switch input:checked + .slider .dot{transform:translateX(1rem);}.cdmodal-switch input:hover + .slider{box-shadow:0 0 0 2px rgba(99,102,241,0.3);}.cdmodal-custom-select{position:relative;display:inline-block;min-width:120px;cursor:pointer;user-select:none;}.cdmodal-custom-select .select-display{display:flex;align-items:center;justify-content:space-between;padding:0.3rem 0.75rem;border-radius:0.375rem;border:1px solid var(--cdmodal-input-border);background:var(--cdmodal-input-bg);color:var(--cdmodal-input-text);font-size:0.85rem;transition:border-color 0.2s;min-height:32px;gap:0.5rem;}.cdmodal-custom-select .select-display:hover{border-color:var(--cdmodal-primary);}.cdmodal-custom-select .select-display .arrow{font-size:0.6rem;opacity:0.6;transition:transform 0.5s;filter:var(--cdmodal-arrow-filter);zoom:0.7;}.cdmodal-custom-select .select-display .arrow.open{transform:rotateX(180deg);}.cdmodal-custom-select .select-dropdown{position:absolute;top:100%;left:0;right:0;margin-top:0.25rem;border-radius:0.375rem;border:1px solid var(--cdmodal-input-border);background:var(--cdmodal-modal-bg);box-shadow:0 4px 12px rgba(0,0,0,0.15);max-height:200px;overflow-y:auto;z-index:100;opacity:0;transform:scale(0.95) translateY(-8px);transform-origin:top center;transition:opacity 0.2s ease,transform 0.2s ease;pointer-events:none;}.cdmodal-custom-select .select-dropdown.open{opacity:1;transform:scale(1) translateY(0);pointer-events:auto;}.cdmodal-custom-select .select-option{padding:0.4rem 0.75rem;cursor:pointer;font-size:0.85rem;color:var(--cdmodal-input-text);transition:background 0.15s;}.cdmodal-custom-select .select-option:hover{background:rgba(99,102,241,0.08);}.cdmodal-custom-select .select-option.selected{background:rgba(99,102,241,0.15);color:var(--cdmodal-primary);}.cdmodal-custom-range{display:flex;align-items:center;gap:0.75rem;min-width:150px;}.cdmodal-custom-range .track{position:relative;flex:1;height:20px;min-width:80px;cursor:pointer;display:flex;align-items:center;}.cdmodal-custom-range .track::before{content:'';position:absolute;left:0;right:0;height:4px;background:var(--cdmodal-input-border);border-radius:2px;}.cdmodal-custom-range .track .fill{position:absolute;left:0;height:4px;background:var(--cdmodal-primary);border-radius:2px;pointer-events:none;}.cdmodal-custom-range .track .thumb{position:absolute;top:50%;width:12px;height:12px;border-radius:50%;background:var(--cdmodal-primary);transform:translate(-50%,-50%);transition:transform 0.15s;pointer-events:auto;}.cdmodal-custom-range .track .thumb:hover{transform:translate(-50%,-50%) scale(1.1);}.cdmodal-custom-range .track .thumb:active{cursor:grabbing;transform:translate(-50%,-50%) scale(1.2);}.cdmodal-custom-range .value{min-width:2.2rem;text-align:center;font-size:0.8rem;color:var(--cdmodal-title-color);font-weight:500;}.cdmodal-color-wrap{display:flex;align-items:center;gap:0.5rem;}.cdmodal-color-picker{width:2rem;height:2rem;padding:0;border:2px solid var(--cdmodal-input-border);border-radius:0.25rem;cursor:pointer;background:none;flex-shrink:0;transition:border-color 0.2s;}.cdmodal-color-picker:focus{border-color:var(--cdmodal-primary);}.cdmodal-color-text{padding:0.3rem 0.75rem;border-radius:0.375rem;border:1px solid var(--cdmodal-input-border);background:var(--cdmodal-input-bg);color:var(--cdmodal-input-text);font-size:0.85rem;outline:none;font-family:inherit;width:100px;transition:border-color 0.2s;}.cdmodal-color-text:focus{border-color:var(--cdmodal-primary);}.cdmodal-input-custom{padding:0.3rem 0.75rem;border-radius:0.375rem;border:1px solid var(--cdmodal-input-border);background:var(--cdmodal-input-bg);color:var(--cdmodal-input-text);font-size:0.85rem;outline:none;font-family:inherit;width:180px;max-width:100%;transition:border-color 0.2s;}.cdmodal-input-custom:focus{border-color:var(--cdmodal-primary);}.cdmodal-text-display{font-size:1.05rem;font-weight:500;color:var(--cdmodal-title-color);background:rgba(0,0,0,0.02);border-radius:0.25rem;word-break:break-all;max-width:200px;white-space:pre-wrap;}.cdmodal-settings-footer{display:flex;justify-content:flex-end;gap:0.625rem;padding:0.75rem 1.25rem;border-top:1px solid rgba(0,0,0,0.06);flex-shrink:0;}.cdmodal-settings-footer .btn-close{padding:0.4rem 1.5rem;border-radius:2rem;cursor:pointer;font-size:0.85rem;font-weight:500;background:var(--cdmodal-cancel-bg);color:white;border:none;transition:all 0.2s;}.cdmodal-settings-footer .btn-close:hover{background:var(--cdmodal-cancel-hover-bg);}@keyframes cdmodal-fade-in{from{opacity:0;}to{opacity:1;}}@keyframes cdmodal-fade-out{from{opacity:1;}to{opacity:0;}}@keyframes cdmodal-container-in{from{opacity:0;transform:scale(0.92) translateY(-0.5rem);}to{opacity:1;transform:scale(1) translateY(0);}}@keyframes cdmodal-container-out{from{opacity:1;transform:scale(1) translateY(0);}to{opacity:0;transform:scale(0.92) translateY(-0.5rem);}}@keyframes cdmodal-snackbar-in{from{opacity:0;transform:translateY(1.25rem);}to{opacity:1;transform:translateY(0);}}@keyframes cdmodal-snackbar-out{from{opacity:1;transform:translateY(0);}to{opacity:0;transform:translateY(-1.25rem);}}

@font-face{font-family:"PingFang";font-style:normal;font-weight:400;src:url(https://m.ccw.site/community/fonts/PingFang.ttf) format("truetype")}@font-face{font-family:"PingFang";font-style:normal;font-weight:700;src:url(https://m.ccw.site/community/fonts/PingFang-600.ttf) format("truetype")}@font-face{font-family:"PingFang";font-style:normal;font-weight:600;src:url(https://m.ccw.site/community/fonts/PingFang-600.ttf) format("truetype")}@font-face{font-family:"PingFang";font-style:normal;font-weight:500;src:url(https://m.ccw.site/community/fonts/PingFang-500.ttf) format("truetype")}
@font-face{font-family:"Font Awesome 7 Free";font-style:normal;font-weight:900;font-display:block;src:url(//m.ccw.site/works-covers/fa-solid-900.woff2)}.fas{--fa-style:900}.fa-classic,.fas{--fa-family:var(--fa-family-classic)}.fa-solid{--fa-style:900}@font-face{font-family:"Font Awesome 5 Brands";font-display:block;font-weight:400;src:url(//use.fontawesome.com/releases/v7.3.1/webfonts/fa-brands-400.woff2) format("woff2")}@font-face{font-family:"Font Awesome 5 Free";font-display:block;font-weight:900;src:url(//m.ccw.site/works-covers/fa-solid-900.woff2) format("woff2")}@font-face{font-family:"Font Awesome 5 Free";font-display:block;font-weight:400;src:url(//use.fontawesome.com/releases/v7.3.1/webfonts/fa-regular-400.woff2) format("woff2")}@font-face{font-family:"FontAwesome";font-display:block;src:url(//m.ccw.site/works-covers/fa-solid-900.woff2) format("woff2")}@font-face{font-family:"FontAwesome";font-display:block;src:url(//use.fontawesome.com/releases/v7.3.1/webfonts/fa-brands-400.woff2) format("woff2")}@font-face{font-family:"FontAwesome";font-display:block;src:url(//use.fontawesome.com/releases/v7.3.1/webfonts/fa-regular-400.woff2) format("woff2");unicode-range:u+f003,u+f006,u+f014,u+f016-f017,u+f01a-f01b,u+f01d,u+f022,u+f03e,u+f044,u+f046,u+f05c-f05d,u+f06e,u+f070,u+f087-f088,u+f08a,u+f094,u+f096-f097,u+f09d,u+f0a0,u+f0a2,u+f0a4-f0a7,u+f0c5,u+f0c7,u+f0e5-f0e6,u+f0eb,u+f0f6-f0f8,u+f10c,u+f114-f115,u+f118-f11a,u+f11c-f11d,u+f133,u+f147,u+f14e,u+f150-f152,u+f185-f186,u+f18e,u+f190-f192,u+f196,u+f1c1-f1c9,u+f1d9,u+f1db,u+f1e3,u+f1ea,u+f1f7,u+f1f9,u+f20a,u+f247-f248,u+f24a,u+f24d,u+f255-f25b,u+f25d,u+f271-f274,u+f278,u+f27b,u+f28c,u+f28e,u+f29c,u+f2b5,u+f2b7,u+f2ba,u+f2bc,u+f2be,u+f2c0-f2c1,u+f2c3,u+f2d0,u+f2d2,u+f2d4,u+f2dc}@font-face{font-family:"FontAwesome";font-display:block;src:url(//use.fontawesome.com/releases/v7.3.1/webfonts/fa-v4compatibility.woff2) format("woff2");unicode-range:u+f041,u+f047,u+f065-f066,u+f07d-f07e,u+f080,u+f08b,u+f08e,u+f090,u+f09a,u+f0ac,u+f0ae,u+f0b2,u+f0d0,u+f0d6,u+f0e4,u+f0ec,u+f10a-f10b,u+f123,u+f13e,u+f148-f149,u+f14c,u+f156,u+f15e,u+f160-f161,u+f163,u+f175-f178,u+f195,u+f1f8,u+f219,u+f27a}`);
document.adoptedStyleSheets.push(ch2styles);
let cdmodal;{let globalSettings={theme:'light',overlayBlur:8,modalBorderRadius:28,primaryColor:'#6366f1',titleColor:null,contentColor:null,overlayBgColor:'rgba(0, 0, 0, 0.4)',modalBgColor:null,confirmBtnColor:null,cancelBtnColor:null,snackbarBgColor:null,snackbarTextColor:null,closeOnOverlay:true,closeOnEsc:true,enterok:true,};function showModal(a){return new Promise((resolve)=>{const closeOnOverlay=a.closeOnOverlay!==undefined?a.closeOnOverlay:globalSettings.closeOnOverlay;const closeOnEsc=a.closeOnEsc!==undefined?a.closeOnEsc:globalSettings.closeOnEsc;const overlay=document.createElement('div');overlay.className='cdmodal-overlay';const container=document.createElement('div');container.className='cdmodal-container';overlay.appendChild(container);document.body.appendChild(overlay);let isResolved=false;let escHandler=null;const cleanup=()=>{if(isResolved)return;isResolved=true;if(escHandler)document.removeEventListener('keydown',escHandler);overlay.style.animation='cdmodal-fade-out 0.2s ease forwards';container.style.animation='cdmodal-container-out 0.2s ease forwards';setTimeout(()=>overlay.remove(),200)};const finalize=(value)=>{if(isResolved)return;cleanup();resolve(value)};if(a.title){const titleEl=document.createElement('h3');titleEl.textContent=a.title;titleEl.className='cdmodal-title';if(a.titleColor)titleEl.style.color=a.titleColor;container.appendChild(titleEl)}const contentEl=document.createElement('div');contentEl.textContent=a.content||'';contentEl.className='cdmodal-content';if(a.contentColor)contentEl.style.color=a.contentColor;container.appendChild(contentEl);let inputEl=null;if(a.input){inputEl=document.createElement('input');inputEl.type='text';inputEl.placeholder=a.inputPlaceholder||'';inputEl.value=a.value??'';inputEl.className='cdmodal-input';container.appendChild(inputEl);setTimeout(()=>inputEl.focus(),50)}const buttonsDiv=document.createElement('div');buttonsDiv.className='cdmodal-buttons';if(a.choices&&Array.isArray(a.choices)&&a.choices.length>0){a.choices.forEach((choice)=>{const btn=document.createElement('button');btn.textContent=choice.label||choice;btn.className='cdmodal-btn-primary';btn.addEventListener('click',()=>finalize(choice.value!==undefined?choice.value:choice));buttonsDiv.appendChild(btn)})}else{const confirmBtn=document.createElement('button');confirmBtn.textContent=a.confirmText||'确定';confirmBtn.className='cdmodal-btn-primary';let cancelBtn=null;if(a.showCancel){cancelBtn=document.createElement('button');cancelBtn.textContent=a.cancelText||'取消';cancelBtn.className='cdmodal-btn-secondary';cancelBtn.addEventListener('click',()=>finalize(a.input?null:false))}confirmBtn.addEventListener('click',()=>{finalize(a.input?(inputEl?.value||''):true)});buttonsDiv.appendChild(confirmBtn);if(cancelBtn)buttonsDiv.appendChild(cancelBtn);if(inputEl&&(a.enterok??globalSettings.enterok))inputEl.onkeydown=e=>e.key==="Enter"&&confirmBtn.click()||1}container.appendChild(buttonsDiv);if(closeOnOverlay){overlay.addEventListener('click',(e)=>{if(e.target===overlay){finalize(a.input?null:(a.choices?null:false))}})}if(closeOnEsc){escHandler=(e)=>{if(e.key==='Escape'){finalize(a.input?null:(a.choices?null:false))}};document.addEventListener('keydown',escHandler)}})}const snackbarContainers={};function getSnackbarContainer(a){if(!snackbarContainers[a]){const container=document.createElement('div');container.className='cdmodal-snackbar-container';const posMap={'左上角':{top:'1rem',left:'1rem',alignItems:'flex-start'},'顶部居中':{top:'1rem',left:'50%',transform:'translateX(-50%)',alignItems:'center'},'右上角':{top:'1rem',right:'1rem',alignItems:'flex-end'},'左下角':{bottom:'1rem',left:'1rem',alignItems:'flex-start',flexDirection:'column-reverse'},'底部居中':{bottom:'1rem',left:'50%',transform:'translateX(-50%)',alignItems:'center',flexDirection:'column-reverse'},'右下角':{bottom:'1rem',right:'1rem',alignItems:'flex-end',flexDirection:'column-reverse'}};const config=posMap[a]||posMap['底部居中'];Object.assign(container.style,config);document.body.appendChild(container);snackbarContainers[a]=container}return snackbarContainers[a]}function removeSnackbar(a){if(!a.parentNode)return;a.style.animation='cdmodal-snackbar-out 0.3s ease forwards';setTimeout(()=>a.remove(),300)}function showSnackbarInternal(a,c,j,h,f){return new Promise((resolve)=>{const container=getSnackbarContainer(j);let timer=null;let isRemoved=false;const removeAndResolve=()=>{if(isRemoved)return;isRemoved=true;if(timer)clearTimeout(timer);removeSnackbar(snackbar);resolve()};const snackbar=document.createElement('div');snackbar.className='cdmodal-snackbar';if(h){snackbar.style.background=h}else if(globalSettings.snackbarBgColor){snackbar.style.background=globalSettings.snackbarBgColor}if(f){snackbar.style.color=f}else if(globalSettings.snackbarTextColor){snackbar.style.color=globalSettings.snackbarTextColor}const textSpan=document.createElement('span');textSpan.textContent=a;textSpan.style.flex='1';snackbar.appendChild(textSpan);const closeBtn=document.createElement('button');closeBtn.textContent='✕';closeBtn.className='cdmodal-snackbar-close';closeBtn.onclick=()=>removeAndResolve();snackbar.appendChild(closeBtn);container.appendChild(snackbar);if(c>0){timer=setTimeout(()=>removeAndResolve(),c*1000)}})}const settingStore={groups:{},selectedIndex:-1,addGroup(label,items=[]){if(this.groups[label]){console.warn(`分组"${label}"已存在，跳过添加`);return false}this.groups[label]={type:'group',label:label,items:items,description:''};return true},getGroup(label){return this.groups[label]||null},hasGroup(label){return!!this.groups[label]},getAllGroups(){return Object.values(this.groups)},getGroupNames(){return Object.keys(this.groups)},hasSetting(label){for(const group of Object.values(this.groups)){if(group.items){const found=group.items.find(sub=>sub.label===label);if(found)return true}}return false},getSetting(label){for(const group of Object.values(this.groups)){if(group.items){const found=group.items.find(sub=>sub.label===label);if(found)return found}}return null},getValue(label){const item=this.getSetting(label);if(item&&item.type!=='group'){return item.default}return null},setValue(label,value){const item=this.getSetting(label);if(item&&item.type!=='group'){item.default=value;return true}return false},getValues(){const result={};for(const group of Object.values(this.groups)){if(group.items){group.items.forEach(subItem=>{if(subItem.type!=='group'){result[subItem.label]=subItem.default}})}}return result},getSettingsJSON(){return this.groups},importSettings(jsonData){if(!jsonData||typeof jsonData!=='object')return false;this.groups=jsonData;return true},clear(){this.groups={};this.selectedIndex=-1},removeGroup(label){if(!this.groups[label]){console.warn(`分组"${label}"不存在，删除失败`);return false}delete this.groups[label];this.selectedIndex=-1;return true},removeSetting(label){for(const group of Object.values(this.groups)){if(group.items){const index=group.items.findIndex(sub=>sub.label===label);if(index!==-1){group.items.splice(index,1);return true}}}console.warn(`设置项"${label}"不存在，删除失败`);return false},addTextLabel(groupName,label,description=''){const group=this.getGroup(groupName);if(!group){console.warn(`分组"${groupName}"不存在，添加标签失败`);return false}if(this.hasSetting(label)){console.warn(`设置项"${label}"已存在，跳过添加`);return false}group.items.push({type:'text',label:label,description:description||undefined});return true},};function showSettingsUI(n={}){return new Promise((resolve)=>{const{title='设置',onSave=null,onCancel=null,showCancel=true,saveText='保存设置',cancelText='取消'}=n;const overlay=document.createElement('div');overlay.className='cdmodal-overlay';overlay.style.display='flex';overlay.style.justifyContent='center';overlay.style.alignItems='center';overlay.style.padding='1rem';const container=document.createElement('div');container.className='cdmodal-settings';overlay.appendChild(container);document.body.appendChild(overlay);let isResolved=false;const settingsState={};const cleanup=()=>{if(isResolved)return;isResolved=true;overlay.style.animation='cdmodal-fade-out 0.2s ease forwards';container.style.animation='cdmodal-container-out 0.2s ease forwards';setTimeout(()=>overlay.remove(),200)};const finalize=(value)=>{if(isResolved)return;cleanup();resolve(value)};const header=document.createElement('div');header.className='cdmodal-settings-header';const titleEl=document.createElement('span');titleEl.className='cdmodal-settings-title';titleEl.textContent=title;header.appendChild(titleEl);const closeBtn=document.createElement('button');closeBtn.className='cdmodal-settings-close';closeBtn.textContent='✕';closeBtn.onclick=()=>{if(onCancel)onCancel();finalize(null)};header.appendChild(closeBtn);container.appendChild(header);const body=document.createElement('div');body.className='cdmodal-settings-body';const leftPanel=document.createElement('div');leftPanel.className='cdmodal-settings-left';const rightPanel=document.createElement('div');rightPanel.className='cdmodal-settings-right';body.appendChild(leftPanel);body.appendChild(rightPanel);container.appendChild(body);const footer=document.createElement('div');footer.className='cdmodal-settings-footer';const closeBtnFooter=document.createElement('button');closeBtnFooter.className='btn-close';closeBtnFooter.textContent='关闭';closeBtnFooter.onclick=()=>{onSave&&onSave(settingStore.getValues());finalize(settingStore.getValues())};footer.appendChild(closeBtnFooter);container.appendChild(footer);let selectedIndex=settingStore.selectedIndex>=0?settingStore.selectedIndex:0;let currentGroup=null;function o(){leftPanel.innerHTML='';const groups=settingStore.getAllGroups();groups.forEach((group,idx)=>{const menuItem=q(group,idx);leftPanel.appendChild(menuItem)});const children=leftPanel.children;if(selectedIndex>=0&&selectedIndex<children.length){const target=children[selectedIndex];if(target){target.classList.add('active');const group=settingStore.getAllGroups()[selectedIndex];if(group){currentGroup=group;k(selectedIndex)}}}else if(children.length>0){children[0].classList.add('active');const group=settingStore.getAllGroups()[0];if(group){currentGroup=group;k(0)}}}function q(a,c){const div=document.createElement('div');div.className='cdmodal-settings-menu-item';const labelSpan=document.createElement('span');labelSpan.className='label';labelSpan.textContent=a.label;div.appendChild(labelSpan);if(a.type==='group'){const arrow=document.createElement('img');arrow.className='arrow';arrow.src='//m.ccw.site/works-covers/cdm-dropdown.svg';div.appendChild(arrow)}div.onclick=()=>{const children=leftPanel.children;for(let i=0;i<children.length;i++){children[i].classList.remove('active')}div.classList.add('active');selectedIndex=c;settingStore.selectedIndex=c;const groups=settingStore.getAllGroups();const targetGroup=groups[c];if(targetGroup){currentGroup=targetGroup;k(c)}};return div}function k(a){rightPanel.innerHTML='';const groups=settingStore.getAllGroups();const targetGroup=groups[a];if(!targetGroup){const empty=document.createElement('div');empty.className='cdmodal-settings-empty';empty.textContent='请选择一个设置项';rightPanel.appendChild(empty);return}const groupHeader=document.createElement('div');groupHeader.className='cdmodal-settings-group-header';const groupTitle=document.createElement('div');groupTitle.className='cdmodal-settings-group-title';groupTitle.textContent=targetGroup.label;groupHeader.appendChild(groupTitle);if(targetGroup.description){const desc=document.createElement('div');desc.className='cdmodal-settings-group-desc';desc.textContent=targetGroup.description;groupHeader.appendChild(desc)}rightPanel.appendChild(groupHeader);const subItems=targetGroup.items||[];subItems.forEach((item)=>{const wrapper=t(item);rightPanel.appendChild(wrapper)});if(subItems.length===0){const empty=document.createElement('div');empty.className='cdmodal-settings-empty';empty.textContent='此分组暂无设置项';rightPanel.appendChild(empty)}}function t(a){const wrapper=document.createElement('div');wrapper.className='cdmodal-setting-row';const labelWrap=document.createElement('div');labelWrap.className='label-wrap';const main=document.createElement('div');main.className='main';main.textContent=a.label;labelWrap.appendChild(main);if(a.description){const desc=document.createElement('div');desc.className='desc';desc.textContent=a.description;labelWrap.appendChild(desc)}wrapper.appendChild(labelWrap);const controlWrap=document.createElement('div');controlWrap.className='control-wrap';let control=null,value=settingStore.getValue(a.label);switch(a.type){case'switch':control=u(a,value);break;case'select':control=v(a,value);break;case'input':control=w(a,value);break;case'color':control=x(a,value);break;case'range':control=y(a,value);break;case'button':control=z(a,value);break;case'text':main.className="cdmodal-text-display";break;default:const textSpan=document.createElement('span');textSpan.textContent=a.default||'';textSpan.style.color='var(--cdmodal-content-color)';control=textSpan}if(control){controlWrap.appendChild(control);wrapper.appendChild(controlWrap)}if(a.default!==undefined&&a.type!=='group'&&!(a.label in settingsState)){settingsState[a.label]=a.default}return wrapper}function u(a,c){const label=document.createElement('label');label.className='cdmodal-switch';const input=document.createElement('input');input.type='checkbox';input.checked=c||false;const slider=document.createElement('span');slider.className='slider';const dot=document.createElement('span');dot.className='dot';slider.appendChild(dot);input.onchange=()=>{settingStore.setValue(a.label,input.checked);if(a.onChange)a.onChange(input.checked)};label.appendChild(input);label.appendChild(slider);return label}function v(a,c){const container=document.createElement('div');container.className='cdmodal-custom-select';const display=document.createElement('div');display.className='select-display';const textSpan=document.createElement('span');textSpan.className='select-text';const currentOption=(a.options||[]).find(opt=>{const val=opt.value!==undefined?opt.value:opt;return String(val)===String(c)});textSpan.textContent=currentOption?(currentOption.label||currentOption):'未选择';display.appendChild(textSpan);const arrow=document.createElement('span');arrow.className='arrow';arrow.textContent='▼';display.appendChild(arrow);container.appendChild(display);const dropdown=document.createElement('div');dropdown.className='select-dropdown';(a.options||[]).forEach(opt=>{const optionValue=opt.value!==undefined?opt.value:opt;const optionLabel=opt.label||opt;const optionEl=document.createElement('div');optionEl.className='select-option';if(String(optionValue)===String(c)){optionEl.classList.add('selected')}optionEl.textContent=optionLabel;optionEl.dataset.value=optionValue;optionEl.addEventListener('pointerdown',(e)=>{e.stopPropagation();dropdown.querySelectorAll('.select-option').forEach(el=>el.classList.remove('selected'));optionEl.classList.add('selected');textSpan.textContent=optionLabel;h();settingStore.setValue(a.label,optionValue);if(a.onChange)a.onChange(optionValue)});dropdown.appendChild(optionEl)});container.appendChild(dropdown);function j(){dropdown.classList.add('open');arrow.classList.add('open')}function h(){dropdown.classList.remove('open');arrow.classList.remove('open')}display.addEventListener('pointerdown',(e)=>{e.stopPropagation();const isOpen=dropdown.classList.contains('open');document.querySelectorAll('.cdmodal-custom-select .select-dropdown').forEach(d=>{if(d!==dropdown){d.classList.remove('open');d.parentElement.querySelector('.arrow')?.classList.remove('open')}});if(isOpen){h()}else{j()}});document.addEventListener('pointerdown',(e)=>{if(!container.contains(e.target)){h()}});dropdown.addEventListener('pointerdown',(e)=>{e.stopPropagation()});return container}function w(a,c){const input=document.createElement('input');input.className='cdmodal-input-custom';input.type='text';input.placeholder=a.placeholder||'';input.value=c||'';if(a.inputType==='number'){input.inputMode='numeric';input.pattern='[0-9]*'}input.oninput=()=>{let value=input.value;if(a.inputType==='number'){value=value.replace(/[^0-9.]/g,'');input.value=value}settingStore.setValue(a.label,value);if(a.onChange)a.onChange(value)};input.onkeydown=e=>e.key==="Enter"&&input.blur()||1;return input}function x(c,j){const wrap=document.createElement('div');wrap.className='cdmodal-color-wrap';let colorValue=j||c.default||'#6366f1';function h(a){if(!a||typeof a!=='string')return null;try{const div=document.createElement('div');div.style.color=a.trim();document.body.appendChild(div);const computed=getComputedStyle(div).color;document.body.removeChild(div);if(!computed||computed==='rgba(0, 0, 0, 0)')return null;const match=computed.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);if(match){const r=parseInt(match[1]);const g=parseInt(match[2]);const b=parseInt(match[3]);return`#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`}}catch(e){}return null}const validated=h(colorValue);if(validated)colorValue=validated;else colorValue='#6366f1';const picker=document.createElement('input');picker.className='cdmodal-color-picker';picker.type='color';picker.value=colorValue;const text=document.createElement('input');text.className='cdmodal-color-text';text.type='text';text.value=colorValue;text.placeholder='#6366f1';text.spellcheck=false;function f(a){const hex=h(a);if(hex){picker.value=hex;text.value=hex;settingStore.setValue(c.label,hex);if(c.onChange)c.onChange(hex);return true}return false}picker.oninput=()=>{const value=picker.value;text.value=value;settingStore.setValue(c.label,value);if(c.onChange)c.onChange(value)};text.onblur=()=>{const value=text.value.trim();if(!value||!f(value)){const stored=settingStore.getValue(c.label)||c.default||'#6366f1';text.value=stored;picker.value=stored}};text.onkeydown=e=>e.key==='Enter'&&text.blur()||1;wrap.appendChild(picker);wrap.appendChild(text);return wrap}function y(f,A){const container=document.createElement('div');container.className='cdmodal-custom-range';const min=f.min||0;const max=f.max||100;const step=f.step||1;const defaultValue=A||Math.round((f.max-f.min)/2);let initialPercent=((defaultValue-min)/(max-min))*100;initialPercent=Math.max(0,Math.min(100,initialPercent));const track=document.createElement('div');track.className='track';const fill=document.createElement('div');fill.className='fill';fill.style.width=initialPercent+'%';track.appendChild(fill);const thumb=document.createElement('div');thumb.className='thumb';thumb.style.left=initialPercent+'%';track.appendChild(thumb);container.appendChild(track);const valueDisplay=document.createElement('span');valueDisplay.className='value';valueDisplay.textContent=defaultValue;container.appendChild(valueDisplay);settingsState[f.label]=defaultValue;function l(a){const rect=track.getBoundingClientRect();let percent=(a-rect.left)/rect.width;percent=Math.max(0,Math.min(1,percent));const rawValue=min+percent*(max-min);const steppedValue=Math.round(rawValue/step)*step;const clampedValue=Math.max(min,Math.min(max,steppedValue));const newPercent=((clampedValue-min)/(max-min))*100;fill.style.width=newPercent+'%';thumb.style.left=newPercent+'%';valueDisplay.textContent=clampedValue;settingStore.setValue(f.label,clampedValue);if(f.onChange)f.onChange(clampedValue)}function m(c){c.preventDefault();c.stopPropagation();if(c.target===track||c.target===fill){l(c.clientX)}track.setPointerCapture(c.pointerId);function j(a){l(a.clientX)}function h(){track.releasePointerCapture(c.pointerId);track.removeEventListener('pointermove',j);track.removeEventListener('pointerup',h)}track.addEventListener('pointermove',j);track.addEventListener('pointerup',h,{once:true})}track.addEventListener('pointerdown',m);thumb.addEventListener('pointerdown',(e)=>{e.preventDefault();e.stopPropagation();m(e)});return container}function z(a){const btn=document.createElement('button');btn.className='cdmodal-btn-settings';btn.textContent=a.text;btn.onclick=()=>{if(a.onClick)a.onClick(settingsState)};return btn}o()})}class CDModalc{alert(message,title='提示'){return showModal({title:title,content:String(message),confirmText:'确定',showCancel:false})}async confirm(message,title='确认',confirmText='确认',cancelText='取消'){const r=await showModal({title:title,content:String(message),confirmText:confirmText,cancelText:cancelText,showCancel:true});return r===true}async prompt(message,value='',placeholder='',title='输入',confirmText='提交',cancelText='取消',showCancel=true){const r=await showModal({title:title,content:String(message),confirmText:confirmText,cancelText:cancelText,showCancel:showCancel,input:true,inputPlaceholder:String(placeholder),value:String(value)});return r===null?'':String(r)}async choice(title,content,choices,defaultValue=''){let choicesArray=[];try{if(Array.isArray(choices)){choicesArray=choices.map(i=>typeof i==='string'?{label:i,value:i}:i)}else if(typeof choices==='string'){try{const p=JSON.parse(choices);if(Array.isArray(p))choicesArray=p.map(i=>typeof i==='string'?{label:i,value:i}:i)}catch(e){choicesArray=String(choices).split(',').map(s=>({label:s.trim(),value:s.trim()}))}}}catch(e){choicesArray=[{label:'确定',value:'确定'}]}if(!choicesArray.length)choicesArray=[{label:'确定',value:'确定'}];const r=await showModal({title:String(title),content:String(content),choices:choicesArray,closeOnOverlay:false});return r!==null?String(r):String(defaultValue)}custom(title,content,confirmText,cancelText=''){const showCancel=String(cancelText).trim().length>0;const r=showModal({title:String(title),content:String(content),confirmText:String(confirmText),cancelText:showCancel?String(cancelText):'',showCancel:showCancel});return r}snackbar(text,duration=2,position='底部居中',bgColor=null,textColor=null){const r=showSnackbarInternal(String(text),duration,String(position),bgColor,textColor);return r}settings(title='设置'){const result=showSettingsUI({title:String(title)});return result}getValue(label){return settingStore.getValue(label)}getValues(){return settingStore.getValues()}getSettingsJSON(){return settingStore.getSettingsJSON()}importSettings(jsonData){return settingStore.importSettings(jsonData)}}cdmodal=new CDModalc()}
document.documentElement.setAttribute('data-cdmodal-theme', 'dark');
cdmodal.importSettings({"通用":{"label":"通用","items":[]}});
const styles = new CSSStyleSheet();
styles.replaceSync(`:host {
    position: absolute;
    inset: 0;
    background: /* #444 */ #201719;
    color: #fff;
    z-index: 0;
}

* {
    user-select: none;
    -webkit-user-drag: none;
    -webkit-tap-highlight-color: transparent;
    box-sizing: border-box;
    font-family: 'PingFang';
}

*, ::before {
    transition-duration: .3s;
}

button {
    border: none;
    outline: none;
    cursor: pointer;
    background: none;
    color: inherit;
}

button[class] {
    width: 40px;
    height: 40px;
    font-size: 30px;
    border-radius: 25px;
    display: grid;
    place-items: center;
    flex: 0 0 auto;
    margin: 0 auto;
    &:hover {
        background: #ffffff70;
        cursor: pointer;
        &::before {
            scale: .8;
        }
    }
}

#song {
    position: absolute;
    inset: 0;
    display: flex;
    font-weight: 600;
    & > .layer {
        position: absolute;
        inset: 0;
        filter: blur(50px);
        z-index: -1;
        background-repeat: no-repeat;
        background-size: cover;
        background-position: 50%;
        opacity: .5;
    }
    & > div {
        height: 100%;
    }
    & > #song-left {
        width: 40%;
        display: grid;
        align-content: center;
        justify-content: center;
        padding: 0 10%;
        & > img {
            width: 100%;
            border-radius: 5%;
            margin-bottom: 20px;
        }
        & > .song-name {
            display: grid;
            grid-auto-flow: column;
            align-items: center;
            & > .vip {
                animation: show .3s;
                margin-left: auto;
                background: #ffffff50;
                padding: 0 4px;
                font-size: 12px;
                display: grid;
                align-content: center;
                border-radius: 5px;
                color: #ffffffaa;
                height: 18px;
            }
        }
        & > .singers {
            color: #ffffff80;
            margin-bottom: 10px;
            & > span:not(:last-child)::after {
                content: ' / '
            }
        }
        & > .btns {
            display: flex;
            & > #btn-play {
                transform: scale(1.3);
            }
        }
        & > .progress {
            padding: 5px 0;
            cursor: pointer;
            & > .load {
                width: 100%;
                height: 2px;
                background: #ffffff80;
                position: relative;
                & > .play {
                    width: 0;
                    height: 100%;
                    background: #fff;
                    position: relative;
                    transition: none;
                    & > .dot {
                        position: absolute;
                        width: 6px;
                        height: 6px;
                        top: -2px;
                        right: -2px;
                        background: #fff;
                        border-radius: 50%;
                    }
                }
            }
            &:hover > .load {
                height: 3px;
                .dot {
                    scale: 2;
                    top: -1.5px;
                }
            }
        }
        & > .time {
            width: 100%;
            display: flex;
            color: #aaa;
            font-size: 14px;
            margin-bottom: 10px;
            color: #ffffff80;
            & > .load {
                margin-left: auto;
            }
        }
        &.ing {
            &:not(.fail) > .progress {
                overflow-x: hidden;
                pointer-events: none;
                & > .load {
                    width: 20%;
                    animation: song-load 1s infinite;
                }
            }
            & > .progress > .load > .play, & > .time, &.fail > .progress {
                opacity: 0;
                pointer-events: none;
            }
            & > .btns > #btn-play {
                opacity: .5;
                pointer-events: none;
            }
            & + #song-right > span {
                pointer-events: none;
            }
        }
    }
    & > #song-right {
        width: 60%;
        overflow: auto;
        font-size: 15px;
        & > span {
            max-width: 100%;
            word-break: break-all;            
            margin: 7px 10px;
            border-radius: 7px;
            display: block;
            width: fit-content;
            color: #ffffff88;
            padding: 2px 5px;
            cursor: pointer;
            white-space: break-spaces;
            &:hover {
                background: #ffffff30;
            }
            &.current {
                color: #fff;
                text-shadow: 0 0 20px #fff;
                &:hover {
                    background: #ffffff50;
                }
            }
        }
        &::before, &::after {
            content: '';
            display: block;
            height: 50%;
        }
    }
}
.search {
    position: absolute;
    left: 10px;
    right: 10px;
    top: 10px;
    height: 30px;
    color: #ffffff90;
    border: 1px solid transparent;
    transition: all .3s, color .1s;
    z-index: 1;
    & > .row {
        display: flex;
        position: relative;
        border-radius: 10px;
        border: 1px solid transparent;
        & > input {
            position: absolute;
            background: none;
            border: none;
            pointer-events: none;
            opacity: 0;
            outline: none;
            height: 100%;
            inset: 0 35px;
            color: white;
            padding: 0;
            &::placeholder {
                color: #ffffffaa;
            }
        }
        & > button {
            zoom: .7;
            margin: 0;
            .opened > &, &:hover {
                color: #fff;
            }
            &::before {
                transition: all .3s, color .1s;
            }
        }
        & > [enter] {
            opacity: 0;
            position: absolute;
            right: 0;
            pointer-events: none;
        }
    }
    & > .sug {
        opacity: 0;
        pointer-events: none;
        font-size: 14px;
        color: #ffffffcc;
        position: relative;
        z-index: 1;
    }
    &.opened {
        & > .row {
            background: #ffffff33;
            border-color: #ffffff70;
            backdrop-filter: blur(3px);
            color: #fff;
            border: 1px solid #ffffff60;
            & > input {
                pointer-events: auto;
                opacity: 1;
            }
            & > button {
                font-size: 20px;
                border-radius: 10px;
                &::before {
                    scale: 1;
                }
            }
            & > [enter] {
                opacity: 1;
                pointer-events: auto;
            }
        }
        &.full {
            inset: 0;
            padding: 10px;
            height: 100%;
            background: #000;
            & > .result {
                opacity: 1;
            }
        }
        &:not(.full) > .row:has(input:focus) + .sug:has(div), &:hover:not(:has(> .result:hover)) > .sug:has(div) {
            opacity: 1;
            pointer-events: auto;
            padding: 3px 5px;
            border: 1px solid #ffffff70;
            background: #ffffff33;
            backdrop-filter: blur(3px);
            border-top: 0;
            border-radius: 0 0 10px 10px;
            div {
                margin: 5px 0;
                padding: 3px 4px;
                border-radius: 10px;
                cursor: pointer;
                &:hover {
                    background: #ffffff30;
                }
            }
        }
        &:not(.full) > .row:has(input:focus):has(+ .sug > div), &:hover:not(:has(> .result:hover)):has(.sug > div) > .row {
            border-radius: 10px 10px 0 0;
        }
        & ~ button {
            opacity: 0;
            z-index: 0;
        }
    }
    & > .result {
        opacity: 0;
        position: absolute;
        inset: 50px 10px 0;
        overflow-y: auto;
        color: #fff;
        font-size: 14px;
        & > table {
            width: 100%;
            text-align: center;
            & > thead {
                position: sticky;
                top: 0;
                backdrop-filter: blur(3px);
                background: #ffffff66;
                & > tr {
                    & > th:first-child {
                        border-radius: 6px 0 0 6px;
                    }
                    & > th:last-child {
                        border-radius: 0 6px 6px 0;
                    }
                }
            }
            & > tbody {
                & > tr {
                    cursor: pointer;
                    &:hover {
                        background: #ffffff33;
                    }
                    & > td:first-child {
                        border-radius: 6px 0 0 6px;
                    }
                    & > td:last-child {
                        border-radius: 0 6px 6px 0;
                    }
                }
            }
        }
        &.searching {
            & > table {
                opacity: 0;
            }
            &:not(.null)::after {
                content: '正在搜索';
                position: absolute;
                inset: 0;
                display: grid;
                align-content: center;
                justify-content: center;
                font-size: 20px;
            }
        }
    }
}
:host > .loading {
    position: absolute;
    inset: 0;
    background: #000;
    display: grid;
    justify-items: center;
    align-content: center;
    & > img {
        zoom: .7;
    }
    & > div {
        margin-top: 50px;
        position: relative;
        width: 150%;
        & > .bar {
            position: absolute;
            height: 8px;
            background: #999;
            width: 100px;
            border-radius: 5px;
            animation: loading-bar 1.5s infinite linear; 
        }
    }
    & > span {
        margin-top: 40px;
    }
}
@keyframes loading-bar {
    0% {
        right: 100%;
        width: 100px;
    }
    25% {
        right: 75%;
        width: 150px;
    }
    50% {
        right: 50%;
        width: 200px;
    }
    75% {
        right: 25%;
        width: 150px;
    }
    100% {
        right: 0;
        width: 100px;
    }
}
@keyframes song-load {
    from {
        left: -30%;
        transform: translate(-100%);
    } to {
        left: 130%;
    }
}
@keyframes show {
    from {
        opacity: 0;
    } to {
        opacity: 1;
    }
}
::-webkit-scrollbar {
    background: none;
    width: 4px;
}
::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, .3);
    border-radius: 2px;
}
.out {
    opacity: 0;
    pointer-events: none;
}
:host > button {
    font-size: 20px;
    width: 30px;
    height: 30px;
    padding: 0;
    color: #ffffff90;
    position: absolute;
    top: 10px;
    z-index: 1;
    &:hover {
        color: #fff;
    }
    &.fa-gear {
        right: 50px;
    }
    &.fa-list {
        right: 10px;
    }
}`);
shadow.adoptedStyleSheets = [styles];
shadow.appendChild(h('link', {
    rel: 'stylesheet',
    href: '//use.fontawesome.com/releases/v7.3.1/css/all.css'
}));
function fa(name, tn = "i", props, el, type = 'appendChild', className, style, fatype) {
    const e = Object.assign(document.createElement(tn), props);
    e.className = `fa-${fatype ?? 'solid'} fa-${name} ${className ?? ''}`.trimEnd();
    el?.[type]?.(e);
    typeof style === "string" ? e.style.cssText = style : Object.assign(e.style, style);
    return e;
}
window._cdmsc_audio?.pause();
window._cdmsc_ifr?.remove();
let playing = false,
    lrc = [],
    lrcEls,
    lrci,
    ifr = window._cdmsc_ifr = document.head.appendChild(h('iframe')),
    audio = window._cdmsc_audio = ifr.contentWindow.document.body.appendChild(new Audio()),
    sl = {
        btns: {},
        p: {},
        t: {},
    },
    sr = {},
    searchBox = {},
    layer,
    nscroll = 1;
h('div', { id: 'song' }, [
    layer = h('div', { className: 'layer' }),
    sl.e = h('div', {
        id: 'song-left',
        className: 'ing fail'
    }, [
        sl.pic = h('img', {
            alt: '专辑图',
            src: '//m.ccw.site/works-covers/cdmusic-icon-v3.1.svg'
        }),
        sl.songname = h('span', {
            textContent: '未播放',
            className: 'song-name'
        }),
        sl.singers = h('span', { className: 'singers' }, [
            h('span', { textContent: 'CDMusic' }),
        ]),
        sl.p.e = h('div', {
            className: 'progress',
            onpointerdown: function(e) {
                const play = playing;
                playc(0);
                dragProgress(e);
                this.setPointerCapture(e.pointerId);
                this.addEventListener('pointermove', dragProgress);
                this.addEventListener('pointerup', function cleanup() {
                    this.removeEventListener('pointermove', dragProgress);
                    this.removeEventListener('pointerup', cleanup);
                    playc(play);
                });
            }
        }, [
            sl.p.load = h('div', { className: 'load' }, [
                sl.p.play = h('div', { className: 'play' }, [
                    sl.p.dot = h('div', { className: 'dot' }),
                ]),
            ]),
        ]),
        h('div', { className: 'time' }, [
            sl.t.play = h('span', { className: 'play', textContent: '00:00' }),
            sl.t.load = h('span', { className: 'load' })
        ]),
        h('div', { className: 'btns' }, [
            sl.btns.bw = fa('step-backward', 'button', {
                onclick: function(e) {}
            }),
            sl.btns.play = fa('play', 'button', {
                onclick: () => playc(),
                id: 'btn-play'
            }),
            sl.btns.bw = fa('step-forward', 'button', {
                onclick: function(e) {}
            }),
        ]),
    ]),
    sr.e = h('div', { id: 'song-right' }),
], null, shadow);
function searchback() {
    searchBox.e.className = "search";
    searchBox.b.className = "fa-solid fa-search";
    searchBox.f.className = "fa-solid fa-arrow-right";
    requestAnimationFrame(() => searchBox.s.innerHTML = "");
    sbac?.abort();
    clearTimeout(sbptimer);
    searchBox.i.value = '';
}
searchBox.e = shadow.appendChild(h('div', { className: 'search' }, [
    searchBox.r = h('div', { className: 'row' }, [
        searchBox.b = fa('search', 'button', {
            onclick: function(e) {
                if (searchBox.e.className === "search opened full") {
                    searchback();
                } else {
                    if (this.className === "fa-solid fa-close") searchback();
                    else {
                        searchBox.e.className = "search opened";
                        this.className = "fa-solid fa-close";
                    }
                }
            },
        }),
        searchBox.i = h('input', {
            placeholder: '输入歌名',
            onkeydown: e => e.key === "Enter" && searchBox.f.click() || 1,
        }),
        searchBox.f = fa('arrow-right', 'button', {
            onclick: function(e) {
                if (searchBox.e.className === "search opened full") fsea();
                else {
                    searchBox.e.className = "search opened full";
                    searchBox.b.className = "fa-solid fa-arrow-left";
                    this.className = "fa-solid fa-search";
                    searchBox.i.blur();
                    fsea();
                }
            }
        }),
    ]),
    searchBox.s = h('div', { className: 'sug' }),
    searchBox.fr = h('div', { className: 'result searching null' }, [
        searchBox.fta = h('table', null, [
            h('thead', { innerHTML: `<tr><th>歌名</th><th>歌手</th><th>专辑</th><th>时长</th></tr>` }),
            searchBox.rb = h('tbody'),
        ]),
    ])
]));
searchBox.b.setAttribute('search', '');
searchBox.f.setAttribute('enter', '');
layer.style.backgroundImage = `url('${sl.pic.src}')`;
function formatTime(sec = audio.currentTime, updateAll, onlyString) {
    const s = Math.floor(sec),
        mins = Math.floor(s / 60),
        secs = s % 60,
        str = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    if (updateAll) sl.t.load.textContent = formatTime(audio.duration, 0, 1);
    else if (!onlyString) sl.t.play.textContent = str;
    return str;
}
function dragProgress(e) {
    const rect = sl.p.e.getBoundingClientRect();
    let x = e.clientX - rect.left;
    x = Math.max(0, Math.min(rect.width, x));
    const percent = x / rect.width;
    audio.currentTime = percent * audio.duration;
    spaf(percent, 0);
    updatelrc(0, null, 1);
}
let afid;
function spaf(_percent, af = 1, isaf = 0) {
    if (isaf && audio.paused) return;
    const percent = _percent ?? audio.currentTime / audio.duration;
    sl.p.play.style.width = (percent * 100) + '%';
    formatTime(percent * audio.duration);
    updatelrc();
    if (af) afid = requestAnimationFrame(() => spaf(null, 1, 1));
}
function playc(play = !playing, noaudio) {
    const btn = sl.btns.play;
    if (playing = play) {
        btn.className = "fa-solid fa-pause";
        cancelAnimationFrame(afid);
        spaf(null, 1);
    } else {
        btn.className = "fa-solid fa-play";
    }
    !noaudio && audio[play ? 'play' : 'pause']();
}
audio.onplay = e => playc(1, 1);
audio.onpause = e => playc(0, 1);
function createlrc() {
    const el = sr.e;
    el.innerHTML = '';
    lrci = -1;
    el.replaceChildren(...(lrcEls = lrc.map((i, idx) => h('span', {
        textContent: i.text,
        onclick: e => {
            audio.currentTime = lrc[idx].time;
            updatelrc(0, idx, 1);
            spaf(null, 0);
        },
    }))));
    el.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}
function updatelrc(time = audio.currentTime, i = lrci, force) {
    if (force) {
        const t = audio.currentTime;
        lrci = i ?? lrc.findLastIndex(i => t >= i.time);
        lrcEls.forEach(i => i.className = "");
        if (!lrcEls[lrci]) return;
        lrcEls[lrci].className = "current";
        return sr.e.scrollTo({
            top: Math.max(0, lrcEls[lrci].offsetTop - (sr.e.clientHeight / 2)),
            behavior: 'smooth'
        });
    }
    const n = i + 1;
    if (time >= lrc[n]?.time - 0.15) {
        lrci++;
        lrcEls[i] && (lrcEls[i].className = "");
        lrcEls[n].className = "current";
        nscroll && sr.e.scrollTo({
            top: Math.max(0, lrcEls[n].offsetTop - (sr.e.clientHeight / 2) - 25),
            behavior: 'smooth',
        });
    }
}
createlrc();
audio.onended = () => (lrci = -1, audio.addEventListener("play", e => lrcEls.at(-1).className = "", { once: 1 }));
function req(_url, body, opt, _method = 'get', responseType = "json", gm) {
    const method = _method.toUpperCase(), url = (method === "GET" && body) ? `${_url}?${new URLSearchParams(body)}` : _url;
    if (gm) {
        if (typeof GMF === "undefined") return cdmodal.alert("缺少 GM_xmlhttpRequest\n请先安装挂载 GM 函数脚本 (https://us.chen-jin.dpdns.org/gmExposer.user.js)");
        return new Promise((r, onerror) => GMF.GM_xmlhttpRequest({
            url,
            body,
            onload: d => r(d.response),
            onerror,
            anonymous: gm,
            responseType,
            ...opt,
        }));
    } else {
        const r = fetch(url, {
            body: method === "GET" ? undefined : body,
            ...opt,
        });
        return opt?.r ? r : r.then(d => d[responseType]());
    }
}

let sbptimer, sbac, loads;
searchBox.i.oninput = function(e) {
    const kw = this.value.trim();
    sbac?.abort();
    sbac = null;
    clearTimeout(sbptimer);
    if (!kw) return searchBox.s.innerHTML = "";
    sbptimer = setTimeout(() => {
        sbac = new AbortController();
        req("//zm.wwoyun.cn/search/suggest", {
            keywords: kw
        }, { signal: sbac.signal })
            .then(({ result }) => {
                searchBox.s.innerHTML = "";
                if (!result.order) return;
                searchBox.s.replaceChildren(...result.songs.map(s => h('div', {
                    textContent: `${s.name} - ${s.artists.map(a => a.name).join(" / ")}`,
                    onclick: () => toSong('cm', s, 1),
                })));
            });
    }, 700);
}

const getImageColor=imageUrl=>new Promise(callback=>{const img=new Image();img.crossOrigin='anonymous';img.src=imageUrl;img.onload=function(){const canvas=document.createElement('canvas');const ctx=canvas.getContext('2d');const size=100;canvas.width=size;canvas.height=size;ctx.drawImage(img,0,0,size,size);const imageData=ctx.getImageData(0,0,size,size);const data=imageData.data;const pixelArray=[];for(let i=0;i<data.length;i+=4){pixelArray.push([data[i],data[i+1],data[i+2]])}function medianCut(colors,depth){if(colors.length<=8||depth===0){const avg=colors.reduce((acc,c)=>[acc[0]+c[0],acc[1]+c[1],acc[2]+c[2]],[0,0,0]);return avg.map(v=>Math.round(v/colors.length))}let maxRange=-1;let channel=0;for(let c=0;c<3;c++){const min=Math.min(...colors.map(p=>p[c]));const max=Math.max(...colors.map(p=>p[c]));if(max-min>maxRange){maxRange=max-min;channel=c}}colors.sort((a,b)=>a[channel]-b[channel]);const mid=Math.floor(colors.length/2);const left=colors.slice(0,mid);const right=colors.slice(mid);const leftAvg=medianCut(left,depth-1);const rightAvg=medianCut(right,depth-1);return leftAvg.map((v,i)=>Math.round((v+rightAvg[i])/2))}const dominantRgb=medianCut(pixelArray,6);const color=`rgb(${dominantRgb[0]*.5},${dominantRgb[1]*.5},${dominantRgb[2]*.5})`;callback(color)};img.onerror=e=>{throw e}});

let songac;
function toSong(platfrom, song, close) {
    playc(0);
    audio.readyState !== 0 && spaf(0, 0);
    songac?.abort();
    songac = new AbortController();
    const signal = songac.signal;
    audio.addEventListener("loadedmetadata", e => {
        formatTime(audio.currentTime, 1);
        sl.e.className = "";
        playc(1);
    }, { once: 1 });
    audio.addEventListener("error", e => audio.src && (sl.e.className = "ing fail"), { once: 1 });
    if (close) {
        searchBox.b.className === "fa-solid fa-close";
        searchBox.b.click();
        searchBox.e.className === "search";
    }
    if (platfrom === "cm") {
        sl.e.className = "ing";
        req("//zm.wwoyun.cn/song/detail", { ids: song.id }, { signal })
            .then(rst => {
                const d = rst.songs[0], fee = d.fee;
                if (!d.name) console.error(d), cdmodal.alert("响应出错");
                fetch(`${d.al.picUrl}?param=500x500`, { signal })
                    .then(r => r.blob())
                    .then(b => {
                        const bu = URL.createObjectURL(b);
                        sl.pic.src = bu;
                        layer.style.backgroundImage = `url('${bu}')`;
                        getImageColor(bu).then(u => host.style.backgroundColor = u);
                    });
                sl.songname.textContent = d.name;
                sl.singers.replaceChildren(...d.ar.map(i => h('span', { textContent: i.name })));
                (fee == 1 || fee == 4) && sl.songname.appendChild(h('div', {
                    className: 'vip',
                    textContent: fee == 1 ? 'VIP' : '付费'
                }));
                document.title = `${d.name} - ${d.ar.map(i => i.name).join(" / ")} - CDMusic`;
                if (fee == 4) {
                    sl.e.className = "ing fail";
                    throw cdmodal.alert("该歌曲需单独付费，暂不支持播放", "CDMusic");
                }
                audio.src = (fee == 1
                    ? '//api.qijieya.cn/meting/?type=url&id='
                    : '//music.163.com/song/media/outer/url?id='
                ) + d.id;
            }),
        req("//zm.wwoyun.cn/lyric", { id: song.id }, { signal })
            .then(d => {
                if (!d.lrc) console.error(d), cdmodal.alert("处理歌词出错");
                lrc = parselrc(d.lrc.lyric, d.tlyric?.lyric);
                createlrc();
            })
    }
}

function parselrc(lrc, tlylrc) {
    const lyrics = [];
    for (const line of lrc.split('\n')) {
        const m = line.match(/^\[(\d+):(\d+(?:\.\d+)?)\](.+)/);
        if (m) {
            const time = +m[1] * 60 + +m[2];
            const text = m[3].trim();
            if (text) lyrics.push({ time, text });
        }
    }
    lyrics.sort((a, b) => a.time - b.time);
    if (!tlylrc) return lyrics;
    
    const trans = parselrc(tlylrc);
    const transMap = new Map();
    for (const item of trans) {
        const key = Math.round(item.time * 100) / 100;
        transMap.set(key, item.text);
    }
    return lyrics.map(item => {
        const key = Math.round(item.time * 100) / 100;
        const translation = transMap.get(key) || '';
        return {
            time: item.time,
            text: translation ? `${item.text}\n${translation}` : item.text
        };
    });
}

let srst;
sr.e.onwheel = e => {
    clearTimeout(srst);
    nscroll = 0;
    srst = setTimeout(() => updatelrc(0, null, nscroll = 1), 3000);
}

function fsea() {
    const input = searchBox.i;
    searchBox.fr.className = input.value ? 'result searching' : 'result searching null';
    input.value && req("//zm.wwoyun.cn/search", {
        keywords: input.value.trim(),
    })
        .then(r => {
            searchBox.rb.replaceChildren(...r.result.songs.map(s => h('tr', {
                onclick: e => toSong("cm", s, 1)
            }, [
                h('td', { textContent: s.name }),
                h('td', { textContent: s.artists.map(a => a.name).join(" / ") }),
                h('td', { textContent: s.album.name }),
                h('td', { textContent: formatTime(s.duration / 1000, 0, 1) }),
            ])));
            searchBox.fr.className = "result";
        });
}

const sbtn = shadow.appendChild(fa('gear', 'button', { onclick: () => cdmodal.settings("CDMusic 设置") })),
    playlist = shadow.appendChild(fa('list', 'button', { onclick: () => 1 }));

document.body.appendChild(host);

const loading = h('div', { className: 'loading' }, [
    h('img', { src: '//m.ccw.site/works-covers/cdmusic-icon-v3.1.svg' }),
    h('div', null, [
        h('div', { className: 'bar' })
    ]),
    loads = h('span', {
        textContent: '加载字体中',
    }),
]);
shadow.appendChild(loading);
document.title = "CDMusic";
Promise.all([
    document.fonts.load("16px 'PingFang'"),
    document.fonts.load("16px 'Font Awesome 7 Free'"),
]).then(() => {
    loading.classList.add("out");
    setTimeout(() => loading.remove(), 300);
});
document.onvisibilitychange = e => {
    if (document.visibilityState === "hidden") {
        cancelAnimationFrame(afid);
    } else if (sl.e.className !== "ing") {
        nscroll && updatelrc(0, null, 1);
        spaf();
    }
}