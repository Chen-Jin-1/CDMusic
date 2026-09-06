import {
    signKey,
    signatureAndroidParams,
    signatureRegisterParams,
    signatureWebParams
} from 'https://cdmsc.chen-jin.dpdns.org/kgapi/helper.js';
import { parseCookieString } from 'https://cdmsc.chen-jin.dpdns.org/kgapi/util.js';

// ----- 配置 -----
const config = {
    appid: 1005,
    clientver: 20489,
    liteAppid: 3116,
    liteClientver: 11440,
};

// ----- 平台常量 -----
const isLite = true;
const liteAppid = config.liteAppid;
const liteClientver = config.liteClientver;
const appid = config.appid;
const clientver = config.clientver;

// ----- 核心请求函数（保留原结构）-----
export function createRequest(options) {
    return new Promise((resolve, reject) => {
        // ========== 原版逻辑：提取设备标识 ==========
        const dfid = options?.cookie?.dfid || localStorage.getItem('kugou_dfid') || '-';
        const mid = options?.cookie?.KUGOU_API_MID || localStorage.getItem('kugou_mid') || '0';
        const token = options?.cookie?.token || localStorage.getItem('kugou_token') || '';
        const userid = options?.cookie?.userid || localStorage.getItem('kugou_userid') || 0;
        const uuid = '-';
        const clienttime = Math.floor(Date.now() / 1000);
        const ip = options?.realIP || options?.ip || '';

        const headers = {
            dfid,
            clienttime,
            mid,
            'kg-rc': '1',
            'kg-thash': '5d816a0',
            'kg-rec': 1,
            'kg-rf': 'B9EDA08A64250DEFFBCADDEE00F8F25F'
        };

        if (ip) {
            headers['X-Real-IP'] = ip;
            headers['X-Forwarded-For'] = ip;
        }

        const defaultParams = {
            dfid,
            mid,
            uuid,
            appid: isLite ? liteAppid : appid,
            clientver: isLite ? liteClientver : clientver,
            clienttime,
        };

        if (token) defaultParams['token'] = token;
        if (userid && userid !== 0) defaultParams['userid'] = userid;

        // 合并参数
        const params = options?.clearDefaultParams
            ? { ...(options?.params || {}) }
            : { ...defaultParams, ...(options?.params || {}) };

        headers['clienttime'] = params.clienttime;

        // ========== 原版逻辑：生成 signKey ==========
        if (options?.encryptKey) {
            params['key'] = signKey(params['hash'], params['mid'], params['userid'], params['appid']);
        }

        // ========== 原版逻辑：序列化请求体 ==========
        let data = '';
        if (options.data) {
            data = typeof options.data === 'object'
                ? JSON.stringify(options.data)
                : options.data;
        }

        // ========== 原版逻辑：生成签名 ==========
        if (!params['signature'] && !options.notSignature) {
            switch (options?.encryptType) {
                case 'register':
                    params['signature'] = signatureRegisterParams(params);
                    break;
                case 'web':
                    params['signature'] = signatureWebParams(params);
                    break;
                case 'android':
                default:
                    params['signature'] = signatureAndroidParams(params, data);
                    break;
            }
        }

        // ========== 原版逻辑：合并请求头 ==========
        const finalHeaders = Object.assign(
            {},
            {
                'User-Agent': 'Android15-1070-11083-46-0-DiscoveryDRADProtocol-wifi',
                'Content-Type': 'application/json',
            },
            options?.headers || {},
            headers
        );

        const baseURL = options.baseURL || 'https://gateway.kugou.com';
        let url = `${baseURL}${options.url}`;
        const queryString = Object.keys(params)
            .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
            .join('&');
        if (queryString) {
            url += '?' + queryString;
        }

        const requestOptions = {
            url,
            method: options.method || 'GET',
            headers: finalHeaders,
            data: options.method === 'POST' ? data : undefined,
            onload: function(response) {
                console.log('load', response);

                const cookies = [];
                if (response.responseHeaders) {
                    const setCookieHeader = response.responseHeaders['set-cookie'];
                    if (setCookieHeader) {
                        const parts = Array.isArray(setCookieHeader)
                            ? setCookieHeader
                            : [setCookieHeader];
                        parts.forEach(part => {
                            cookies.push(parseCookieString(part));
                        });
                    }
                }

                const answer = {
                    status: response.status,
                    body: response.response,
                    cookie: cookies,
                    headers: response.responseHeaders || {}
                };

                try {
                    if (typeof response.response === 'string') {
                        answer.body = JSON.parse(response.response);
                    }
                } catch (e) {}

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

        if (options.responseType) requestOptions.responseType = options.responseType;
        console.log('send', requestOptions);
        window.GMF.GM_xmlhttpRequest(requestOptions);
    });
}