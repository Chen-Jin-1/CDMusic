// request.js
import { weapi } from './crypto.js';
import { cookieToJson, cookieObjToString } from './util.js';
import { createOption } from './option.js';

const DOMAIN = 'https://music.163.com';

/**
 * 发送网易云 API 请求
 * @param {string} uri - 接口路径，如 '/api/sms/captcha/sent'
 * @param {Object} data - 请求数据
 * @param {Object} options - 请求选项（来自 createOption）
 * @returns {Promise} 请求结果
 */
export function createRequest(uri, data, options = {}) {
    return new Promise((resolve, reject) => {
        // ========== 1. 处理选项 ==========
        const opt = createOption(options, options.crypto || 'weapi');
        const headers = { ...opt.headers };

        // ========== 2. 处理 Cookie ==========
        // 优先从 localStorage 读取，其次从 options.cookie 读取
        let cookieStr = localStorage.getItem('netease_cookie') || '';
        let cookie = opt.cookie || {};

        if (typeof cookie === 'string' && cookie) {
            cookie = cookieToJson(cookie);
        }

        if (typeof cookie === 'object' && Object.keys(cookie).length) {
            // 如果 options 里传了 cookie，优先使用
            cookieStr = cookieObjToString(cookie);
        }

        if (cookieStr) {
            headers['Cookie'] = cookieStr;
        }

        // ========== 3. 处理 IP 透传 ==========
        const ip = opt.realIP || opt.ip || '';
        if (ip) {
            headers['X-Real-IP'] = ip;
            headers['X-Forwarded-For'] = ip;
        }

        // ========== 4. 处理 csrf_token ==========
        // 优先从 localStorage 读取，其次从 cookie 里提取
        let csrfToken = localStorage.getItem('netease_csrf') || '';
        if (!csrfToken && cookieStr) {
            const match = cookieStr.match(/__csrf=([^;]+)/);
            if (match) csrfToken = match[1];
        }
        data.csrf_token = csrfToken;

        // ========== 5. weapi 加密 ==========
        const encrypted = weapi(data);

        // ========== 6. 构建 URL 和请求体 ==========
        // 原代码 uri 以 '/api/' 开头，weapi 接口实际路径是 '/weapi/' + uri.substr(5)
        const url = (opt.domain || DOMAIN) + '/weapi/' + uri.substr(5);
        const body = new URLSearchParams({
            params: encrypted.params,
            encSecKey: encrypted.encSecKey,
        }).toString();

        // ========== 7. 设置请求头 ==========
        headers['Referer'] = opt.domain || DOMAIN;
        headers['User-Agent'] = opt.ua || 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
        headers['Content-Type'] = 'application/x-www-form-urlencoded';

        // ========== 8. 发送请求（GM_xmlhttpRequest） ==========
        const requestOptions = {
            url: url,
            method: 'POST',
            headers: headers,
            data: body,
            onload: function(response) {
                const answer = {
                    status: response.status,
                    body: response.response,
                    cookie: [],
                    headers: response.responseHeaders || {},
                };

                // 解析响应体
                try {
                    if (typeof response.response === 'string') {
                        answer.body = JSON.parse(response.response);
                    }
                } catch (e) {
                    // 保持原始响应
                }

                // 解析 Set-Cookie
                if (response.responseHeaders) {
                    const setCookie = response.responseHeaders['set-cookie'];
                    if (setCookie) {
                        const parts = Array.isArray(setCookie) ? setCookie : [setCookie];
                        answer.cookie = parts.map(part => part.split(';')[0]);
                    }
                }

                // 判断成功/失败
                if (response.status >= 200 && response.status < 300) {
                    resolve(answer);
                } else {
                    reject(answer);
                }
            },
            onerror: function(error) {
                reject({ status: 502, body: { error: 'Network error' }, cookie: [] });
            },
            anonymous: true,
        };

        window.GMF.GM_xmlhttpRequest(requestOptions);
    });
}