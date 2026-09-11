// option.js

export function createOption(query = {}, crypto = '', checkToken = false) {
    return {
        crypto: query.crypto || crypto || 'weapi',
        cookie: query.cookie || '',
        ua: query.ua || '',
        realIP: query.realIP || '',
        domain: query.domain || 'https://music.163.com',
        headers: query.headers || {},
        timeout: query.timeout || 0,
    };
}