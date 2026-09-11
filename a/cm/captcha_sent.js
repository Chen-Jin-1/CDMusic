// captcha_sent.js
import { createOption } from './option.js';
import { createRequest } from './request.js';

/**
 * 发送手机验证码
 * @param {Object} query - 查询参数
 * @param {string} query.phone - 手机号
 * @param {string} [query.ctcode] - 国家代码，默认 '86'
 * @returns {Promise} 请求结果
 */
export function captcha_sent(query) {
    const data = {
        ctcode: query.ctcode || '86',
        secrete: 'music_middleuser_pclogin',
        cellphone: query.phone,
    };
    return createRequest('/api/sms/captcha/sent', data, createOption(query, 'weapi'));
}