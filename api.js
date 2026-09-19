const cmm = window.GMF && await import('./a/cm/module.js');
export const config = {
    cmd: 'zm.wwoyun.cn',
}

export function cm(m, a, signal) {
    return cmm
        ? cmm[m](a).then(o => o.body)
        : fetch(`https://${config.cmd}/${m.replaceAll("_", "/")}?${new URLSearchParams(a)}`, { signal })
            .then(r => r.json())
}