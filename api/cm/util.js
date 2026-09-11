// util.js

export function cookieToJson(cookie) {
    if (!cookie) return {};
    const arr = cookie.split(';');
    const obj = {};
    for (const item of arr) {
        const [key, value] = item.split('=');
        if (key && value !== undefined) {
            obj[key.trim()] = value.trim();
        }
    }
    return obj;
}

export function cookieObjToString(cookie) {
    return Object.keys(cookie)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(cookie[key])}`)
        .join('; ');
}

export function toBoolean(val) {
    if (typeof val === 'boolean') return val;
    if (val === '') return val;
    return val === 'true' || val == '1';
}