const version = 'v1.1.6 Alpha 2';
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
    shadow = host.attachShadow({ mode: 'open' });
document.head.appendChild(h('link', {
    rel: 'stylesheet',
    href: '//cdmsc.chen-jin.dpdns.org/top.css'
}));
let cdmodal;{let globalSettings={theme:'light',overlayBlur:8,modalBorderRadius:28,primaryColor:'#6366f1',titleColor:null,contentColor:null,overlayBgColor:'rgba(0, 0, 0, 0.4)',modalBgColor:null,confirmBtnColor:null,cancelBtnColor:null,snackbarBgColor:null,snackbarTextColor:null,closeOnOverlay:true,closeOnEsc:true,enterok:true,};function showModal(a){return new Promise((resolve)=>{const closeOnOverlay=a.closeOnOverlay!==undefined?a.closeOnOverlay:globalSettings.closeOnOverlay;const closeOnEsc=a.closeOnEsc!==undefined?a.closeOnEsc:globalSettings.closeOnEsc;const overlay=document.createElement('div');overlay.className='cdmodal-overlay';const container=document.createElement('div');container.className='cdmodal-container';overlay.appendChild(container);document.body.appendChild(overlay);let isResolved=false;let escHandler=null;const cleanup=()=>{if(isResolved)return;isResolved=true;if(escHandler)document.removeEventListener('keydown',escHandler);overlay.style.animation='cdmodal-fade-out 0.2s ease forwards';container.style.animation='cdmodal-container-out 0.2s ease forwards';setTimeout(()=>overlay.remove(),200)};const finalize=(value)=>{if(isResolved)return;cleanup();resolve(value)};if(a.title){const titleEl=document.createElement('h3');titleEl.textContent=a.title;titleEl.className='cdmodal-title';if(a.titleColor)titleEl.style.color=a.titleColor;container.appendChild(titleEl)}const contentEl=document.createElement('div');contentEl.textContent=a.content||'';contentEl.className='cdmodal-content';if(a.contentColor)contentEl.style.color=a.contentColor;container.appendChild(contentEl);let inputEl=null;if(a.input){inputEl=document.createElement('input');inputEl.type='text';inputEl.placeholder=a.inputPlaceholder||'';inputEl.value=a.value??'';inputEl.className='cdmodal-input';container.appendChild(inputEl);setTimeout(()=>inputEl.focus(),50)}const buttonsDiv=document.createElement('div');buttonsDiv.className='cdmodal-buttons';if(a.choices&&Array.isArray(a.choices)&&a.choices.length>0){a.choices.forEach((choice)=>{const btn=document.createElement('button');btn.textContent=choice.label||choice;btn.className='cdmodal-btn-primary';btn.addEventListener('click',()=>finalize(choice.value!==undefined?choice.value:choice));buttonsDiv.appendChild(btn)})}else{const confirmBtn=document.createElement('button');confirmBtn.textContent=a.confirmText||'确定';confirmBtn.className='cdmodal-btn-primary';let cancelBtn=null;if(a.showCancel){cancelBtn=document.createElement('button');cancelBtn.textContent=a.cancelText||'取消';cancelBtn.className='cdmodal-btn-secondary';cancelBtn.addEventListener('click',()=>finalize(a.input?null:false))}confirmBtn.addEventListener('click',()=>{finalize(a.input?(inputEl?.value||''):true)});buttonsDiv.appendChild(confirmBtn);if(cancelBtn)buttonsDiv.appendChild(cancelBtn);if(inputEl&&(a.enterok??globalSettings.enterok))inputEl.onkeydown=e=>e.key==="Enter"&&confirmBtn.click()||1}container.appendChild(buttonsDiv);if(closeOnOverlay){overlay.addEventListener('click',(e)=>{if(e.target===overlay){finalize(a.input?null:(a.choices?null:false))}})}if(closeOnEsc){escHandler=(e)=>{if(e.key==='Escape'){finalize(a.input?null:(a.choices?null:false))}};document.addEventListener('keydown',escHandler)}})}const snackbarContainers={};function getSnackbarContainer(a){if(!snackbarContainers[a]){const container=document.createElement('div');container.className='cdmodal-snackbar-container';const posMap={'左上角':{top:'1rem',left:'1rem',alignItems:'flex-start'},'顶部居中':{top:'1rem',left:'50%',transform:'translateX(-50%)',alignItems:'center'},'右上角':{top:'1rem',right:'1rem',alignItems:'flex-end'},'左下角':{bottom:'1rem',left:'1rem',alignItems:'flex-start',flexDirection:'column-reverse'},'底部居中':{bottom:'1rem',left:'50%',transform:'translateX(-50%)',alignItems:'center',flexDirection:'column-reverse'},'右下角':{bottom:'1rem',right:'1rem',alignItems:'flex-end',flexDirection:'column-reverse'}};const config=posMap[a]||posMap['底部居中'];Object.assign(container.style,config);document.body.appendChild(container);snackbarContainers[a]=container}return snackbarContainers[a]}function removeSnackbar(a){if(!a.parentNode)return;a.style.animation='cdmodal-snackbar-out 0.3s ease forwards';setTimeout(()=>a.remove(),300)}function showSnackbarInternal(a,c,j,h,f){return new Promise((resolve)=>{const container=getSnackbarContainer(j);let timer=null;let isRemoved=false;const removeAndResolve=()=>{if(isRemoved)return;isRemoved=true;if(timer)clearTimeout(timer);removeSnackbar(snackbar);resolve()};const snackbar=document.createElement('div');snackbar.className='cdmodal-snackbar';if(h){snackbar.style.background=h}else if(globalSettings.snackbarBgColor){snackbar.style.background=globalSettings.snackbarBgColor}if(f){snackbar.style.color=f}else if(globalSettings.snackbarTextColor){snackbar.style.color=globalSettings.snackbarTextColor}const textSpan=document.createElement('span');textSpan.textContent=a;textSpan.style.flex='1';snackbar.appendChild(textSpan);const closeBtn=document.createElement('button');closeBtn.textContent='✕';closeBtn.className='cdmodal-snackbar-close';closeBtn.onclick=()=>removeAndResolve();snackbar.appendChild(closeBtn);container.appendChild(snackbar);if(c>0){timer=setTimeout(()=>removeAndResolve(),c*1000)}})}const settingStore={groups:{},selectedIndex:-1,addGroup(label,items=[]){if(this.groups[label]){console.warn(`分组"${label}"已存在，跳过添加`);return false}this.groups[label]={type:'group',label:label,items:items,description:''};return true},getGroup(label){return this.groups[label]||null},hasGroup(label){return!!this.groups[label]},getAllGroups(){return Object.values(this.groups)},getGroupNames(){return Object.keys(this.groups)},hasSetting(label){for(const group of Object.values(this.groups)){if(group.items){const found=group.items.find(sub=>sub.label===label);if(found)return true}}return false},getSetting(label){for(const group of Object.values(this.groups)){if(group.items){const found=group.items.find(sub=>sub.label===label);if(found)return found}}return null},getValue(label){const item=this.getSetting(label);if(item&&item.type!=='group'){return item.default}return null},setValue(label,value){const item=this.getSetting(label);if(item&&item.type!=='group'){item.default=value;return true}return false},getValues(){const result={};for(const group of Object.values(this.groups)){if(group.items){group.items.forEach(subItem=>{if(subItem.type!=='group'){result[subItem.label]=subItem.default}})}}return result},getSettingsJSON(){return this.groups},importSettings(jsonData){if(!jsonData||typeof jsonData!=='object')return false;this.groups=jsonData;return true},clear(){this.groups={};this.selectedIndex=-1},removeGroup(label){if(!this.groups[label]){console.warn(`分组"${label}"不存在，删除失败`);return false}delete this.groups[label];this.selectedIndex=-1;return true},removeSetting(label){for(const group of Object.values(this.groups)){if(group.items){const index=group.items.findIndex(sub=>sub.label===label);if(index!==-1){group.items.splice(index,1);return true}}}console.warn(`设置项"${label}"不存在，删除失败`);return false},addTextLabel(groupName,label,description=''){const group=this.getGroup(groupName);if(!group){console.warn(`分组"${groupName}"不存在，添加标签失败`);return false}if(this.hasSetting(label)){console.warn(`设置项"${label}"已存在，跳过添加`);return false}group.items.push({type:'text',label:label,description:description||undefined});return true},};function showSettingsUI(n={}){return new Promise((resolve)=>{const{title='设置',onSave=null,onCancel=null,showCancel=true,saveText='保存设置',cancelText='取消'}=n;const overlay=document.createElement('div');overlay.className='cdmodal-overlay';overlay.style.display='flex';overlay.style.justifyContent='center';overlay.style.alignItems='center';overlay.style.padding='1rem';const container=document.createElement('div');container.className='cdmodal-settings';overlay.appendChild(container);document.body.appendChild(overlay);let isResolved=false;const settingsState={};const cleanup=()=>{if(isResolved)return;isResolved=true;overlay.style.animation='cdmodal-fade-out 0.2s ease forwards';container.style.animation='cdmodal-container-out 0.2s ease forwards';setTimeout(()=>overlay.remove(),200)};const finalize=(value)=>{if(isResolved)return;cleanup();resolve(value)};const header=document.createElement('div');header.className='cdmodal-settings-header';const titleEl=document.createElement('span');titleEl.className='cdmodal-settings-title';titleEl.textContent=title;header.appendChild(titleEl);const closeBtn=document.createElement('button');closeBtn.className='cdmodal-settings-close';closeBtn.textContent='✕';closeBtn.onclick=()=>{if(onCancel)onCancel();finalize(null)};header.appendChild(closeBtn);container.appendChild(header);const body=document.createElement('div');body.className='cdmodal-settings-body';const leftPanel=document.createElement('div');leftPanel.className='cdmodal-settings-left';const rightPanel=document.createElement('div');rightPanel.className='cdmodal-settings-right';body.appendChild(leftPanel);body.appendChild(rightPanel);container.appendChild(body);const footer=document.createElement('div');footer.className='cdmodal-settings-footer';const closeBtnFooter=document.createElement('button');closeBtnFooter.className='btn-close';closeBtnFooter.textContent='关闭';closeBtnFooter.onclick=()=>{onSave&&onSave(settingStore.getValues());finalize(settingStore.getValues())};footer.appendChild(closeBtnFooter);container.appendChild(footer);let selectedIndex=settingStore.selectedIndex>=0?settingStore.selectedIndex:0;let currentGroup=null;function o(){leftPanel.innerHTML='';const groups=settingStore.getAllGroups();groups.forEach((group,idx)=>{const menuItem=q(group,idx);leftPanel.appendChild(menuItem)});const children=leftPanel.children;if(selectedIndex>=0&&selectedIndex<children.length){const target=children[selectedIndex];if(target){target.classList.add('active');const group=settingStore.getAllGroups()[selectedIndex];if(group){currentGroup=group;k(selectedIndex)}}}else if(children.length>0){children[0].classList.add('active');const group=settingStore.getAllGroups()[0];if(group){currentGroup=group;k(0)}}}function q(a,c){const div=document.createElement('div');div.className='cdmodal-settings-menu-item';const labelSpan=document.createElement('span');labelSpan.className='label';labelSpan.textContent=a.label;div.appendChild(labelSpan);if(a.type==='group'){const arrow=document.createElement('img');arrow.className='arrow';arrow.src='//m.ccw.site/works-covers/cdm-dropdown.svg';div.appendChild(arrow)}div.onclick=()=>{const children=leftPanel.children;for(let i=0;i<children.length;i++){children[i].classList.remove('active')}div.classList.add('active');selectedIndex=c;settingStore.selectedIndex=c;const groups=settingStore.getAllGroups();const targetGroup=groups[c];if(targetGroup){currentGroup=targetGroup;k(c)}};return div}function k(a){rightPanel.innerHTML='';const groups=settingStore.getAllGroups();const targetGroup=groups[a];if(!targetGroup){const empty=document.createElement('div');empty.className='cdmodal-settings-empty';empty.textContent='请选择一个设置项';rightPanel.appendChild(empty);return}const groupHeader=document.createElement('div');groupHeader.className='cdmodal-settings-group-header';const groupTitle=document.createElement('div');groupTitle.className='cdmodal-settings-group-title';groupTitle.textContent=targetGroup.label;groupHeader.appendChild(groupTitle);if(targetGroup.description){const desc=document.createElement('div');desc.className='cdmodal-settings-group-desc';desc.textContent=targetGroup.description;groupHeader.appendChild(desc)}rightPanel.appendChild(groupHeader);const subItems=targetGroup.items||[];subItems.forEach((item)=>{const wrapper=t(item);rightPanel.appendChild(wrapper)});if(subItems.length===0){const empty=document.createElement('div');empty.className='cdmodal-settings-empty';empty.textContent='此分组暂无设置项';rightPanel.appendChild(empty)}}function t(a){const wrapper=document.createElement('div');wrapper.className='cdmodal-setting-row';const labelWrap=document.createElement('div');labelWrap.className='label-wrap';const main=document.createElement('div');main.className='main';main.textContent=a.label;labelWrap.appendChild(main);if(a.description){const desc=document.createElement('div');desc.className='desc';desc.textContent=a.description;labelWrap.appendChild(desc)}wrapper.appendChild(labelWrap);const controlWrap=document.createElement('div');controlWrap.className='control-wrap';let control=null,value=settingStore.getValue(a.label);switch(a.type){case'switch':control=u(a,value);break;case'select':control=v(a,value);break;case'input':control=w(a,value);break;case'color':control=x(a,value);break;case'range':control=y(a,value);break;case'button':control=z(a,value);break;case'text':main.className="cdmodal-text-display";break;default:const textSpan=document.createElement('span');textSpan.textContent=a.default||'';textSpan.style.color='var(--cdmodal-content-color)';control=textSpan}if(control){controlWrap.appendChild(control);wrapper.appendChild(controlWrap)}if(a.default!==undefined&&a.type!=='group'&&!(a.label in settingsState)){settingsState[a.label]=a.default}return wrapper}function u(a,c){const label=document.createElement('label');label.className='cdmodal-switch';const input=document.createElement('input');input.type='checkbox';input.checked=c||false;const slider=document.createElement('span');slider.className='slider';const dot=document.createElement('span');dot.className='dot';slider.appendChild(dot);input.onchange=()=>{settingStore.setValue(a.label,input.checked);if(a.onChange)a.onChange(input.checked)};label.appendChild(input);label.appendChild(slider);return label}function v(a,c){const container=document.createElement('div');container.className='cdmodal-custom-select';const display=document.createElement('div');display.className='select-display';const textSpan=document.createElement('span');textSpan.className='select-text';const currentOption=(a.options||[]).find(opt=>{const val=opt.value!==undefined?opt.value:opt;return String(val)===String(c)});textSpan.textContent=currentOption?(currentOption.label||currentOption):'未选择';display.appendChild(textSpan);const arrow=document.createElement('span');arrow.className='arrow';arrow.textContent='▼';display.appendChild(arrow);container.appendChild(display);const dropdown=document.createElement('div');dropdown.className='select-dropdown';(a.options||[]).forEach(opt=>{const optionValue=opt.value!==undefined?opt.value:opt;const optionLabel=opt.label||opt;const optionEl=document.createElement('div');optionEl.className='select-option';if(String(optionValue)===String(c)){optionEl.classList.add('selected')}optionEl.textContent=optionLabel;optionEl.dataset.value=optionValue;optionEl.addEventListener('pointerdown',(e)=>{e.stopPropagation();dropdown.querySelectorAll('.select-option').forEach(el=>el.classList.remove('selected'));optionEl.classList.add('selected');textSpan.textContent=optionLabel;h();settingStore.setValue(a.label,optionValue);if(a.onChange)a.onChange(optionValue)});dropdown.appendChild(optionEl)});container.appendChild(dropdown);function j(){dropdown.classList.add('open');arrow.classList.add('open')}function h(){dropdown.classList.remove('open');arrow.classList.remove('open')}display.addEventListener('pointerdown',(e)=>{e.stopPropagation();const isOpen=dropdown.classList.contains('open');document.querySelectorAll('.cdmodal-custom-select .select-dropdown').forEach(d=>{if(d!==dropdown){d.classList.remove('open');d.parentElement.querySelector('.arrow')?.classList.remove('open')}});if(isOpen){h()}else{j()}});document.addEventListener('pointerdown',(e)=>{if(!container.contains(e.target)){h()}});dropdown.addEventListener('pointerdown',(e)=>{e.stopPropagation()});return container}function w(a,c){const input=document.createElement('input');input.className='cdmodal-input-custom';input.type='text';input.placeholder=a.placeholder||'';input.value=c||'';if(a.inputType==='number'){input.inputMode='numeric';input.pattern='[0-9]*'}input.oninput=()=>{let value=input.value;if(a.inputType==='number'){value=value.replace(/[^0-9.]/g,'');input.value=value}settingStore.setValue(a.label,value);if(a.onChange)a.onChange(value)};input.onkeydown=e=>e.key==="Enter"&&input.blur()||1;return input}function x(c,j){const wrap=document.createElement('div');wrap.className='cdmodal-color-wrap';let colorValue=j||c.default||'#6366f1';function h(a){if(!a||typeof a!=='string')return null;try{const div=document.createElement('div');div.style.color=a.trim();document.body.appendChild(div);const computed=getComputedStyle(div).color;document.body.removeChild(div);if(!computed||computed==='rgba(0, 0, 0, 0)')return null;const match=computed.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);if(match){const r=parseInt(match[1]);const g=parseInt(match[2]);const b=parseInt(match[3]);return`#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`}}catch(e){}return null}const validated=h(colorValue);if(validated)colorValue=validated;else colorValue='#6366f1';const picker=document.createElement('input');picker.className='cdmodal-color-picker';picker.type='color';picker.value=colorValue;const text=document.createElement('input');text.className='cdmodal-color-text';text.type='text';text.value=colorValue;text.placeholder='#6366f1';text.spellcheck=false;function f(a){const hex=h(a);if(hex){picker.value=hex;text.value=hex;settingStore.setValue(c.label,hex);if(c.onChange)c.onChange(hex);return true}return false}picker.oninput=()=>{const value=picker.value;text.value=value;settingStore.setValue(c.label,value);if(c.onChange)c.onChange(value)};text.onblur=()=>{const value=text.value.trim();if(!value||!f(value)){const stored=settingStore.getValue(c.label)||c.default||'#6366f1';text.value=stored;picker.value=stored}};text.onkeydown=e=>e.key==='Enter'&&text.blur()||1;wrap.appendChild(picker);wrap.appendChild(text);return wrap}function y(f,A){const container=document.createElement('div');container.className='cdmodal-custom-range';const min=f.min||0;const max=f.max||100;const step=f.step||1;const defaultValue=A||Math.round((f.max-f.min)/2);let initialPercent=((defaultValue-min)/(max-min))*100;initialPercent=Math.max(0,Math.min(100,initialPercent));const track=document.createElement('div');track.className='track';const fill=document.createElement('div');fill.className='fill';fill.style.width=initialPercent+'%';track.appendChild(fill);const thumb=document.createElement('div');thumb.className='thumb';thumb.style.left=initialPercent+'%';track.appendChild(thumb);container.appendChild(track);const valueDisplay=document.createElement('span');valueDisplay.className='value';valueDisplay.textContent=defaultValue;container.appendChild(valueDisplay);settingsState[f.label]=defaultValue;function l(a){const rect=track.getBoundingClientRect();let percent=(a-rect.left)/rect.width;percent=Math.max(0,Math.min(1,percent));const rawValue=min+percent*(max-min);const steppedValue=Math.round(rawValue/step)*step;const clampedValue=Math.max(min,Math.min(max,steppedValue));const newPercent=((clampedValue-min)/(max-min))*100;fill.style.width=newPercent+'%';thumb.style.left=newPercent+'%';valueDisplay.textContent=clampedValue;settingStore.setValue(f.label,clampedValue);if(f.onChange)f.onChange(clampedValue)}function m(c){c.preventDefault();c.stopPropagation();if(c.target===track||c.target===fill){l(c.clientX)}track.setPointerCapture(c.pointerId);function j(a){l(a.clientX)}function h(){track.releasePointerCapture(c.pointerId);track.removeEventListener('pointermove',j);track.removeEventListener('pointerup',h)}track.addEventListener('pointermove',j);track.addEventListener('pointerup',h,{once:true})}track.addEventListener('pointerdown',m);thumb.addEventListener('pointerdown',(e)=>{e.preventDefault();e.stopPropagation();m(e)});return container}function z(a){const btn=document.createElement('button');btn.className='cdmodal-btn-settings';btn.textContent=a.text;btn.onclick=()=>{if(a.onClick)a.onClick(settingsState)};return btn}o()})}class CDModalc{alert(message,title='提示'){return showModal({title:title,content:String(message),confirmText:'确定',showCancel:false})}async confirm(message,title='确认',confirmText='确认',cancelText='取消'){const r=await showModal({title:title,content:String(message),confirmText:confirmText,cancelText:cancelText,showCancel:true});return r===true}async prompt(message,value='',placeholder='',title='输入',confirmText='提交',cancelText='取消',showCancel=true){const r=await showModal({title:title,content:String(message),confirmText:confirmText,cancelText:cancelText,showCancel:showCancel,input:true,inputPlaceholder:String(placeholder),value:String(value)});return r===null?'':String(r)}async choice(title,content,choices,defaultValue=''){let choicesArray=[];try{if(Array.isArray(choices)){choicesArray=choices.map(i=>typeof i==='string'?{label:i,value:i}:i)}else if(typeof choices==='string'){try{const p=JSON.parse(choices);if(Array.isArray(p))choicesArray=p.map(i=>typeof i==='string'?{label:i,value:i}:i)}catch(e){choicesArray=String(choices).split(',').map(s=>({label:s.trim(),value:s.trim()}))}}}catch(e){choicesArray=[{label:'确定',value:'确定'}]}if(!choicesArray.length)choicesArray=[{label:'确定',value:'确定'}];const r=await showModal({title:String(title),content:String(content),choices:choicesArray,closeOnOverlay:false});return r!==null?String(r):String(defaultValue)}custom(title,content,confirmText,cancelText=''){const showCancel=String(cancelText).trim().length>0;const r=showModal({title:String(title),content:String(content),confirmText:String(confirmText),cancelText:showCancel?String(cancelText):'',showCancel:showCancel});return r}snackbar(text,duration=2,position='底部居中',bgColor=null,textColor=null){const r=showSnackbarInternal(String(text),duration,String(position),bgColor,textColor);return r}settings(title='设置'){const result=showSettingsUI({title:String(title)});return result}getValue(label){return settingStore.getValue(label)}getValues(){return settingStore.getValues()}getSettingsJSON(){return settingStore.getSettingsJSON()}importSettings(jsonData){return settingStore.importSettings(jsonData)}}cdmodal=new CDModalc()}
document.documentElement.setAttribute('data-cdmodal-theme', 'dark');
cdmodal.importSettings({
    "通用": {
        "type": "group",
        "label": "通用",
        "items": [],
        "description": ""
    },
    "网易云音乐": {
        "type": "group",
        "label": "网易云音乐",
        "items": [
            {
                "type": "select",
                "label": "API",
                "default": "zm.wwoyun.cn",
                "options": [
                    "zm.wwoyun.cn"
                ]
            }
        ],
        "description": ""
    },
    "关于": {
        "type": "group",
        "label": "关于",
        "items": [
            {
                "type": "text",
                "label": `CDMusic ${version} ${location.host === "www.ccw.site" ? 'For CCW' : ''}`,
                "description": "by Chen-Jin"
            },
            {
                "type": "text",
                "label": "\u200b"
            },
            {
                "type": "text",
                "label": "版本日志"
            },
            {
                "type": "text",
                "label": "v1.1.6",
                "description": ""
            },
            {
                "type": "text",
                "label": "v1.1.5",
                "description": "优化网页版\nCSS 采用外联样式表\n打字时不显示搜索建议\n修复 CCW 版 Alert 不显示问题"
            },
            {
                "type": "text",
                "label": "v1.1.4",
                "description": "CCW 版从 CDMusic 官网获取代码"
            },
            {
                "type": "text",
                "label": "v1.1.3",
                "description": "制作网页版\n更换 CDMusic 网易云 API"
            },
            {
                "type": "text",
                "label": "v1.1.2",
                "description": "修复部分歌词问题\n完善全屏搜索（显示搜索状态）\n更新 CDModal（但 CDMusic 设置还没做）"
            },
            {
                "type": "text",
                "label": "v1.1.1",
                "description": "修复重新播放时最后一句仍亮\n纯音乐无法播放\n完善全屏搜索（但分页还没做）\n切歌标题修改\n滚动后 3 秒内不自动滚动"
            },
            {
                "type": "text",
                "label": "v1.1.0",
                "description": "修复切换页面歌词和时间异常\n图标修改\n采用新音频获取方式，节省流量与节约时间\nVIP / 付费标识（付费歌曲提示）\n免费和试听音乐优先使用网易云官方 API\n歌曲加载处理\n双语歌词支持"
            },
            {
                "type": "text",
                "label": "v1.0.3",
                "description": "原先播放，切歌后暂停\n背景采色（避免边缘泛灰）\n加载界面\n请求歌曲 API 而非硬编码\n修改标题和图标"
            },
            {
                "type": "text",
                "label": "v1.0.2",
                "description": "修复关闭搜索不彻底（输入内容仍保留，显示透明搜索建议）、歌词未归零（重播与切歌时）\n请求歌曲优先 fetch 替换 m? 为 m9"
            },
            {
                "type": "text",
                "label": "v1.0.1",
                "description": "完成基础功能"
            },
            {
                "type": "text",
                "label": "v1.0.0",
                "description": "发布 CDMusic"
            }
        ],
        "description": ""
    }
});
shadow.appendChild(h('link', {
    rel: 'stylesheet',
    href: '//use.fontawesome.com/releases/v7.3.1/css/all.css'
}));
const cdmcss = shadow.appendChild(h('style', { textContent: `
*:not(.loading *) { display: none; }
:host > .loading {
    display: block;
    position: absolute;
    inset: 0;
    background: #000;
    display: grid;
    justify-items: center;
    align-content: center;
    overflow: hidden;
    color: #fff;
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
}` }))
const shadowcssp = fetch("//cdmsc.chen-jin.dpdns.org/shadow.css")
    .then(r => r.text())
    .then(t => cdmcss.textContent = t);
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
    nscroll = 1,
    sfold;
const songEl = h('div', {
        id: 'song',
        // className: 'little',
    }, [
    layer = h('div', { className: 'layer' }),
    // sfold = fa("angle-down"),
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
        }, [
            sl.singers = h('span', { className: 'singers' }, [
                h('span', { textContent: 'CDMusic' }),
            ]),
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
    requestAnimationFrame(() => el.scrollTo({
        top: 0,
        behavior: 'smooth'
    }));
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
function sug(kw = searchBox.i.value.trim()) {
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
searchBox.i.oninput = function(e) {
    sbac?.abort();
    sbac = null;
    clearTimeout(sbptimer);
    if (e.isComposing) return "";
    sug();
}
searchBox.i.addEventListener("compositionend", e => sug());

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
                        getImageColor(bu).then(u => songEl.style.backgroundColor = u);
                    });
                sl.songname.textContent = d.name;
                sl.singers.replaceChildren(...d.ar.map(i => h('span', { textContent: i.name })))
                sl.songname.appendChild(sl.singers);
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

;(typeof rt === "undefined" || location.href.startsWith("https://www.ccw.site/player")
    ? document.body
    : location.host === "www.ccw.site" && rt.isPlayerOnly
        ? document.querySelector('.workTabs-1dkUq')
        : rt.renderer.canvas.parentNode
).appendChild(host);

const loading = h('div', { className: 'loading' }, [
    h('img', { src: '//m.ccw.site/works-covers/cdmusic-icon-v3.1.svg' }),
    h('div', null, [
        h('div', { className: 'bar' })
    ]),
    loads = h('span', {
        textContent: '加载样式中',
    }),
]);
shadow.appendChild(loading);
await shadowcssp;
loads.textContent = "加载字体中";
document.title = "CDMusic";
document.querySelector('[rel*="icon"]')?.remove();
document.head.appendChild(h("link", {
    rel: 'icon',
    href: '//m.ccw.site/works-covers/cdmusic-icon-v3.1.svg'
}));
await Promise.all([
    document.fonts.load("16px 'PingFang'"),
    document.fonts.load("16px 'Font Awesome 7 Free'"),
]);
loading.classList.add("out");
setTimeout(() => loading.remove(), 300);
document.onvisibilitychange = e => {
    if (document.visibilityState === "hidden") {
        cancelAnimationFrame(afid);
    } else if (sl.e.className !== "ing") {
        nscroll && updatelrc(0, null, 1);
        spaf();
    }
}