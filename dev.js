const version = 'v1.2.1 Alpha 2';
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
    shadow = location.host && location.host !== "cdmsc.chen-jin.dpdns.org"
        ? host.attachShadow({ mode: 'open' })
        : host;
document.head.appendChild(h('link', {
    rel: 'stylesheet',
    href: '//cdmsc.chen-jin.dpdns.org/top.css'
}));
document.documentElement.setAttribute('data-cdmodal-theme', 'dark');
import { cdmodal, settingStore } from "https://d.chen-jin.dpdns.org/cdmodal-v2.min.js";
settingStore.importSettings({
    "通用": [],
    "网易云音乐": [
        {
            "type": "select",
            "label": "API",
            "default": "zm.wwoyun.cn",
            "options": [
                "zm.wwoyun.cn",
            ]
        }
    ],
    "关于": [
        {
            "type": "text",
            "label": `CDMusic ${version} ${location.host === "www.ccw.site"
                ? 'For CCW'
                : location.host === "40code.com"
                    ? 'For 40code'
                    : location.host === "zerocat.dev"
                        ? 'For ZeroCat'
                        : ''
            }`,
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
            type: 'text',
            label: 'v1.2.1 Alpha 1 (2026/9/6)',
            description: "允许设置播放顺序类型"
        },
        {
            type: 'text',
            label: 'v1.2.0 (2026/8/31)',
            description: "完善歌曲列表\n本地存储数据"
        },
        {
            "type": "text",
            "label": "v1.1.6 (2026/8/30)",
            "description": "小歌曲界面\n性能优化\n修复重新播放时未重新开始等 Bug"
        },
        {
            "type": "text",
            "label": "v1.1.5 (2026/8/29)",
            "description": "优化网页版\nCSS 采用外联样式表\n打字时不显示搜索建议\n修复 CCW 版 Alert 不显示问题"
        },
        {
            "type": "text",
            "label": "v1.1.4 (2026/8/28)",
            "description": "CCW 版从 CDMusic 官网获取代码"
        },
        {
            "type": "text",
            "label": "v1.1.3 (2026/8/27)",
            "description": "制作网页版\n更换 CDMusic 网易云 API"
        },
        {
            "type": "text",
            "label": "v1.1.2 (2026/8/24)",
            "description": "修复部分歌词问题\n完善全屏搜索（显示搜索状态）\n更新 CDModal（但 CDMusic 设置还没做）"
        },
        {
            "type": "text",
            "label": "v1.1.1 (2026/8/23)",
            "description": "修复重新播放时最后一句仍亮\n纯音乐无法播放\n完善全屏搜索（但分页还没做）\n切歌标题修改\n滚动后 3 秒内不自动滚动"
        },
        {
            "type": "text",
            "label": "v1.1.0 (2026/8/21)",
            "description": "修复切换页面歌词和时间异常\n图标修改\n采用新音频获取方式，节省流量与节约时间\nVIP / 付费标识（付费歌曲提示）\n免费和试听音乐优先使用网易云官方 API\n歌曲加载处理\n双语歌词支持"
        },
        {
            "type": "text",
            "label": "v1.0.3 (2026/8/19)",
            "description": "原先播放，切歌后暂停\n背景采色（避免边缘泛灰）\n加载界面\n请求歌曲 API 而非硬编码\n修改标题和图标"
        },
        {
            "type": "text",
            "label": "v1.0.2 (2026/8/7)",
            "description": "修复关闭搜索不彻底（输入内容仍保留，显示透明搜索建议）、歌词未归零（重播与切歌时）\n请求歌曲优先 fetch 替换 m? 为 m9"
        },
        {
            "type": "text",
            "label": "v1.0.1 (2026/8/7)",
            "description": "完成基础功能"
        },
        {
            "type": "text",
            "label": "v1.0.0 (2026/8/5)",
            "description": "发布 CDMusic"
        }
    ],
});
shadow.appendChild(h('link', {
    rel: 'stylesheet',
    href: '//use.fontawesome.com/releases/v7.3.1/css/all.css'
}));
const cdmcss = shadow.appendChild(h('style', { textContent: `
body {
    margin: 0;
    color: #fff;
}
*:not(.loading *, #cdm-host, body, :root) {
    display: none;
}
.loading {
    position: absolute;
    inset: 0;
    background: #000;
    display: grid !important;
    justify-items: center;
    align-content: center;
    overflow: hidden;
    color: #fff;
    z-index: 10;
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
}` }));
const shadowcssp = fetch("//cdmsc.chen-jin.dpdns.org/shadow.css")
    .then(r => r.text())
    .then(t => {
        cdmcss.textContent = t;
        if (getComputedStyle(sbtn).display !== "grid") import('/util/fcss.js').then(m => cdmcss.textContent = m.flattenCSS(t));
    });
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
    lrcEls = [],
    lrci = -1,
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
    sbptimer,
    sbac,
    loads,
    nscroll = 1,
    songac,
    srst,
    blobMap = {},
    playlist = [],
    playi = -1,
    plel = {},
    ende,
    songMap = {},
    csid,
    playt = 'r',
    plte;
const songEl = h('div', { id: 'song' }, [
    layer = h('div', { className: 'layer' }),
    sl.e = h('div', {
        id: 'song-left',
        className: 'ing fail'
    }, [
        sl.pic = h('img', {
            alt: 'CDMusic 图标',
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
            sl.btns.bk = fa('step-backward', 'button', {
                onclick: e => {},
            }),
            sl.btns.play = fa('play', 'button', {
                onclick: e => playc(),
                id: 'btn-play'
            }),
            sl.btns.fd = fa('step-forward', 'button', {
                onclick: function(e) {}
            }),
        ]),
    ]),
    sr.e = h('div', { id: 'song-right' }),
    plel = h('div', { id: 'playlist' }, [
        plte = fa("repeat", "button"),
    ]),
], null, shadow);
sl.btns.bk.setAttribute('dis', '');
sl.btns.fd.setAttribute('dis', '');
function searchback() {
    searchBox.e.className = "search";
    searchBox.b.className = "fa-solid fa-search";
    searchBox.f.className = "fa-solid fa-arrow-right";
    setTimeout(() => {
        searchBox.s.innerHTML = "";
        searchBox.fr.innerHTML = "";
    }, 300);
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
                        searchBox.i.focus();
                    }
                }
            },
        }),
        searchBox.i = h('input', {
            placeholder: '输入歌名',
            onkeydown: e => e.key === "Enter"
                ? searchBox.f.click()
                : e.key === "Escape" && searchBox.e.className !== "search" && searchBox.b.click()
            || 1,
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
    searchBox.fr = h('div', { className: 'result searching null' })
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
    else if (!onlyString && sl.t.play.textContent != str) sl.t.play.textContent = str;
    return str;
}
function dragProgress(e) {
    const rect = sl.p.e.getBoundingClientRect();
    let x = e.clientX - rect.left;
    x = Math.max(0, Math.min(rect.width, x));
    const percent = x / rect.width;
    audio.currentTime = percent * audio.duration;
    updatelrc(0, null, 1);
}
function updateUI() {
    const currentTime = audio.currentTime;
    const percent = currentTime / audio.duration;
    sl.p.play.style.width = (percent * 100) + '%';
    formatTime(currentTime);
    updatelrc();
}
audio.ontimeupdate = e => updateUI();
function playc(play = !playing, noaudio) {
    const btn = sl.btns.play;
    btn.className = `fa-solid fa-${(playing = play) ? 'pause' : 'play'}`;
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
        audio.removeEventListener('play', ende);
        return sr.e.scrollTo({
            top: Math.max(0, lrcEls[lrci].offsetTop - (sr.e.clientHeight / 2) + 25),
            behavior: 'smooth'
        });
    }
    const n = i + 1;
    if (time >= lrc[n]?.time - 0.15) {
        ++lrci;
        lrcEls[i] && (lrcEls[i].className = "");
        lrcEls[n].className = "current";
        nscroll && sr.e.scrollTo({
            top: Math.max(0, lrcEls[n].offsetTop - (sr.e.clientHeight / 2) + 25),
            behavior: 'smooth',
        });
    }
}
audio.onended = () => {
    lrci = -1;
    audio.addEventListener("play", ende = e => {
        lrcEls.forEach(i => i.className = "");
        nscroll = 1;
        sr.e.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    }, { once: 1 });
    if (playt === '1' || playlist.length === 1) {
        sl.btns.play.click();
    } else if (playt === "r") {
        const s = playlist[(playi + 1) % playlist.length];
        toSong(s.plan, s);
    } else if (playt === "s") {
        let s = playlist[playi];
        while (s === playlist[playi]) s = playlist[Math.floor(Math.random() * playlist.length)]
        toSong(s.plan, s);
    }
};
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
function sug(kw = searchBox.i.value.trim()) {
    if (!kw) return searchBox.s.innerHTML = "";
    sbptimer = setTimeout(() => {
        sbac = new AbortController();
        cm('search_suggest', { keywords: kw }, { signal: sbac.signal })
            .then(({ result }) => {
                searchBox.s.innerHTML = "";
                if (!result.order) return;
                searchBox.s.replaceChildren(...result.songs.map(s => h('div', {
                    textContent: `${s.name} - ${s.artists.map(a => a.name).join(" / ")}`,
                    onclick: () => toSong('cm', s, 1, 1),
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
const getImageColor=imageUrl=>new Promise(callback=>{const img=new Image();img.crossOrigin='anonymous';img.src=imageUrl;img.onload=function(){const canvas=document.createElement('canvas');const ctx=canvas.getContext('2d');const size=100;canvas.width=size;canvas.height=size;ctx.drawImage(img,0,0,size,size);const imageData=ctx.getImageData(0,0,size,size);const data=imageData.data;const pixelArray=[];for(let i=0;i<data.length;i+=4){pixelArray.push([data[i],data[i+1],data[i+2]])}function medianCut(colors,depth){if(colors.length<=8||depth===0){const avg=colors.reduce((acc,c)=>[acc[0]+c[0],acc[1]+c[1],acc[2]+c[2]],[0,0,0]);return avg.map(v=>Math.round(v/colors.length))}let maxRange=-1;let channel=0;for(let c=0;c<3;c++){const min=Math.min(...colors.map(p=>p[c]));const max=Math.max(...colors.map(p=>p[c]));if(max-min>maxRange){maxRange=max-min;channel=c}}colors.sort((a,b)=>a[channel]-b[channel]);const mid=Math.floor(colors.length/2);const left=colors.slice(0,mid);const right=colors.slice(mid);const leftAvg=medianCut(left,depth-1);const rightAvg=medianCut(right,depth-1);return leftAvg.map((v,i)=>Math.round((v+rightAvg[i])/2))}const dominantRgb=medianCut(pixelArray,6);const color=dominantRgb;callback(color)};img.onerror=e=>{throw e}});
function toSong(platfrom, song, nplay = 1, close) {
    playc(0);
    songac?.abort();
    songac = new AbortController();
    const signal = songac.signal;
    audio.addEventListener("loadedmetadata", e => {
        formatTime(audio.currentTime, 1);
        sl.e.className = "";
        nplay && playc(1);
    }, { once: 1 });
    audio.addEventListener("error", e => audio.src && (sl.e.className = "ing fail"), { once: 1 });
    sl.p.play.style.width = "0";
    sl.e.className = "ing";
    if (close) {
        searchBox.b.className === "fa-solid fa-close";
        searchBox.b.click();
        searchBox.e.className === "search";
    }
    if (platfrom === "cm") {
        const { id } = song, sid = 'cm_' + id;
        songMap[sid] || (songMap[sid] = {});
        function det(d) {
            const fee = d.fee,
                _u = d.al.picUrl,
                upth = `p${new URL(_u).pathname}`,
                singers = d.ar.map(i => i.name).join(" / ");
            function setPicUrl(u) {
                sl.pic.src = u;
                sl.pic.alt = d.al.name;
                layer.style.backgroundImage = `url('${u}')`;
                getImageColor(u).then(c => {
                    const darkc = c.map(i => i * .5);
                    songEl.style.backgroundColor = `rgb(${darkc})`;
                    sl.pic.style.boxShadow = `0 0 50px rgb(${c})`;
                    host.style.setProperty('--dark-bg', `rgba(${darkc},.2)`);
                });
            }
            if (blobMap[upth]) blobMap[upth] !== sl.pic.src && setPicUrl(blobMap[upth]);
            else fetch(`${_u}?param=500x500`, signal)
                .then(r => r.blob())
                .then(b => {
                    const bu = URL.createObjectURL(b);
                    blobMap[upth] = bu;
                    setPicUrl(bu);
                });
            sl.songname.textContent = d.name;
            sl.singers.replaceChildren(...d.ar.map(i => h('span', { textContent: i.name })))
            sl.songname.appendChild(sl.singers);
            (fee == 1 || fee == 4) && sl.songname.appendChild(h('div', {
                className: 'vip',
                textContent: fee == 1 ? 'VIP' : '付费'
            }));
            document.title = `${d.name} - ${singers} - CDMusic`;
            if (fee == 4) {
                sl.e.className = "ing fail";
                throw cdmodal.alert("该歌曲需单独付费，暂不支持播放", "CDMusic");
            }
            audio.src = (fee == 1
                ? '//api.qijieya.cn/meting/?type=url&id='
                : '//music.163.com/song/media/outer/url?id='
            ) + d.id;
            csid = sid;
            renderpl({
                pic: `${_u}?param=120x120`,
                name: d.name,
                al: d.al.name,
                singers,
                sid,
                plan: platfrom,
                id,
            });
            navigator.mediaSession.metadata = new MediaMetadata({
                title: d.name,
                artist: singers,
                artwork: [
                    {
                        src: `${_u}?param=96x96`,
                        sizes: '96x96',
                        type: 'image/jpeg'
                    },
                    {
                        src: `${_u}?param=192x192`,
                        sizes: '192x192',
                        type: 'image/jpeg'
                    },
                    {
                        src: `${_u}?param=512x512`,
                        sizes: '512x512',
                        type: 'image/jpeg'
                    },
                ]
            });
        }
        songMap[sid].d
            ? det(songMap[sid].d)
            : cm("song_detail", { ids: song.id }, signal)
                .then(rst => {
                    const d = rst.songs[0];
                    if (!d.name) console.error(d), cdmodal.alert("响应出错");
                    det(songMap[sid].d = d);
                });
        function lcb(d) {
            lrc = parselrc(d.lrc.lyric, d.tlyric?.lyric);
            createlrc();
        }
        songMap[sid].l
            ? lcb(songMap[sid].l)
            : cm("lyric", { id: song.id }, signal)
                .then(d => {
                    if (!d.lrc) console.error(d), cdmodal.alert("处理歌词出错");
                    lcb(songMap[sid].l = d);
                });
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

sr.e.ontouchend = sr.e.onwheel = e => {
    clearTimeout(srst);
    nscroll = 0;
    srst = setTimeout(() => updatelrc(0, null, nscroll = 1), 3000);
}

function fsea() {
    const input = searchBox.i;
    searchBox.fr.className = input.value ? 'result searching' : 'result searching null';
    input.value && cm("search", {
        keywords: input.value.trim(),
    })
        .then(r => {
            searchBox.fr.replaceChildren(...r.result.songs.map(s => h('div', {
                onclick: e => toSong("cm", s, 1, 1)
            }, [
                s.name,
                h('span', {
                    textContent: s.artists.map(a => a.name).join(" / "),
                }),
                h('span', {
                    textContent: `《${s.album.name}》`,
                }),
                h('span', {
                    textContent: formatTime(s.duration / 1000, 0, 1),
                }),
            ])));
            searchBox.fr.className = "result";
        });
}
const sbtn = shadow.appendChild(fa('gear', 'button', { onclick: () => cdmodal.showSettings("CDMusic 设置") })),
    plbtn = shadow.appendChild(fa('list', 'button', { 
        onclick: () => plel.className = plel.className === "opened" ? '' : 'opened',
    })),
    sfold = shadow.appendChild(fa("angle-up", "button", { onclick: () => {
        let scl;
        songEl.className = "little";
        sl.t.play.after(sl.p.e);
        songEl.style.cursor = 'pointer';
        function rsn() {
            songEl.className = "";
            sl.songname.after(sl.p.e);
            songEl.style.cursor = '';
            setTimeout(() => updatelrc(0, null, 1), 300);
            songEl.removeEventListener('click', scl);
        }
        songEl.addEventListener('click', scl = e => [songEl, sl.e, sl.pic].includes(e.target) && rsn());
        sl.songname.addEventListener('click', rsn, { once: 1 });
    }}));

;(typeof rt === "undefined" || location.href.startsWith("https://www.ccw.site/player")
    ? document.body
    : location.host === "www.ccw.site" && rt.isPlayerOnly
        ? document.querySelector('.workTabs-1dkUq')
        : rt.renderer.canvas.parentNode
).appendChild(host);

function renderpl(adds, i, save) {
    function cpd(d, i) {
        let b, e;
        const c = [
            h('img', {
                alt: d.al,
                src: d.pic,
            }),
            h('div', { textContent: d.name }, [
                h('span', { textContent: d.singers })
            ]),
            b = fa('trash', 'button', {
                onclick: () => {
                    playlist.splice(i, 1);
                    playi > i && --playi;
                    savels();
                    e.style.height = `${getComputedStyle(e).height}px`;
                    requestAnimationFrame(() => e.className = 'remove');
                    setTimeout(() => e.remove(), 300);
                }
            }),
        ];
        i === playi && c.unshift(h('div', { className: 'current fa-solid fa-play' }));
        return e = h("div", { onclick: e => e.target !== b && toSong(d.plan, d) }, c);
    }
    function rmc(c = plel.querySelector('.current')) {
        if (c) {
            c.classList.add('remove');
            setTimeout(() => c.remove(), 300);
        }
    }
    if (i != null) playi = i;
    else if (csid) {
        playi = playlist.findIndex(i => i.sid === csid);
        playi === -1 && (playi = playlist.length, rmc());
    }
    else playi = 0;
    if (adds) {
        rmc();
        if (playi < playlist.length) {
            localStorage.playi = playi;
            return plel.children[playi + 1].prepend(h('div', { className: 'current fa-solid fa-play' }));
        }
        playlist.push(adds);
        savels();
        sl.btns.bk.removeAttribute('dis');
        sl.btns.fd.removeAttribute('dis');
        return plel.appendChild(cpd(adds, playlist.length - 1));
    }
    else plel.replaceChildren(plte, ...playlist.map(cpd));
}
const savels = () => Object.assign(localStorage, {
    playi,
    playlist: JSON.stringify(playlist),
    playt
});




//////////// 楚河汉界
const loading = h('div', { className: 'loading' }, [
    h('img', { src: '//m.ccw.site/works-covers/cdmusic-icon-v3.1.svg' }),
    h('div', null, [
        h('div', { className: 'bar' })
    ]),
    loads = h('span', {
        textContent: '加载样式',
    }),
]);
shadow.appendChild(loading);
await shadowcssp;
loads.textContent = "加载字体";
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
loads.textContent = "加载脚本";
import { cm } from '/api.js';
loading.classList.add("out");
setTimeout(() => loading.remove(), 300);



document.onvisibilitychange = e => {
    if (document.visibilityState === "visible" && sl.e.className !== "ing") {
        nscroll && updatelrc(0, null, 1);
    }
}
onresize = e => nscroll && updatelrc(0, null, 1);
const pltecc = (t = playt) => plte.className =
    t === "r"
        ? "fa-solid fa-repeat"
        : t === "s"
            ? "fa-solid fa-shuffle"
            : t === "1"
                ? "fa-solid fa-repeat custom-1"
                : ""
if (localStorage.playi) {
    playi = +localStorage.playi;
    playlist = JSON.parse(localStorage.playlist);
    csid = localStorage.csid;
    playt = localStorage.playt ?? 'r';
    const s = playlist[playi];
    renderpl();
    s && toSong(s.plan, s, 0);
    if (playlist.length) sl.btns.bk.removeAttribute('dis'), sl.btns.fd.removeAttribute('dis');
    pltecc();
}
sl.btns.bk.onclick = sl.btns.fd.onclick = function(e) {
    const i = (this === sl.btns.fd ? playi + 1 : playi - 1) % playlist.length;
    i < 0 && (i = playlist.length + i);
    const s = playlist[i];
    toSong(s.plan, s);
}
plte.onclick = function(e) {
    if (playt === "r") {
        playt = '1';
    } else if (playt === '1') {
        playt = 's';
    } else if (playt === 's') {
        playt = 'r';
    }
    pltecc();
    localStorage.playt = playt;
}