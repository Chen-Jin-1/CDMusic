// login_cellphone.js
await import('../lib/crypto-js.js');  // 或全局 CryptoJS
import { createOption } from './option.js';
import { createRequest } from './request.js';

/**
 * 手机验证码/密码登录
 * @param {Object} query - 查询参数
 * @param {string} query.phone - 手机号
 * @param {string} [query.countrycode] - 国家代码，默认 '86'
 * @param {string} [query.captcha] - 验证码（与 password 二选一）
 * @param {string} [query.password] - 密码（与 captcha 二选一）
 * @param {string} [query.md5_password] - 已 MD5 加密的密码
 * @param {string} [query.sca] - 安全验证码
 * @returns {Promise} 登录结果
 */
export async function login_cellphone(query) {
    const data = {
        type: '1',
        https: 'true',
        phone: query.phone,
        countrycode: query.countrycode || '86',
        captcha: query.captcha,
        remember: 'true',
        secureCaptcha: query.sca || '',
    };

    // 验证码或密码二选一
    if (query.captcha) {
        data.captcha = query.captcha;
    } else {
        data.password = query.md5_password || CryptoJS.MD5(query.password).toString();
    }

    let result = await createRequest(
        '/api/w/login/cellphone',
        data,
        createOption(query, 'weapi')
    );

    // 处理返回结果
    if (result.body.code === 200) {
        // 1. 把所有 Cookie 拼成字符串存起来
        const result = {};
        if (typeof headers === 'string') {
            headers.split('\r\n').forEach(line => {
                const idx = line.indexOf(':');
                if (idx > 0) {
                    const key = line.substring(0, idx).trim().toLowerCase();
                    const value = line.substring(idx + 1).trim();
                    // 多个同名头（如 set-cookie）用数组存
                    if (CookieStr[key]) {
                        if (Array.isArray(CookieStr[key])) {
                            CookieStr[key].push(value);
                        } else {
                            CookieStr[key] = [CookieStr[key], value];
                        }
                    } else {
                        CookieStr[key] = value;
                    }
                }
            });
        }
    
        
        // 2. 单独提取 __csrf 存起来
        const csrfMatch = cookieStr.match(/__csrf=([^;]+)/);
        if (csrfMatch) {
            localStorage.setItem('netease_csrf', csrfMatch[1]);
        }
        
        // 3. 存用户信息
        localStorage.setItem('netease_token', result.body.token || '');
        
        console.log('   __csrf:', csrfMatch ? csrfMatch[1] : '未找到');
    }
    return result;
}