import { createRequest } from './request.js';
import { cryptoRSAEncrypt } from './crypto.js';

/**
 * 获取用户详情信息
 * @param {Object} params
 * @param {string} params.token - 用户 token（从登录获取）
 * @param {string|number} params.userid - 用户 ID
 * @param {Object} params.cookie - 可选的凭证覆盖
 * @returns {Promise} 用户信息响应
 */
export function user_detail(params = {}) {
    const token = params?.token || params?.cookie?.token || localStorage.getItem('kugou_token') || '';
    const userid = Number(params?.userid || params?.cookie?.userid || localStorage.getItem('kugou_userid') || '0');
    const clienttime_ms = Math.floor(Date.now() / 1000);
    
    // RSA 加密 token 和 clienttime
    const pk = cryptoRSAEncrypt({ token, clienttime: clienttime_ms }).toUpperCase();

    const dataMap = {
        visit_time: clienttime_ms,
        usertype: 1,
        p: pk,
        userid: userid,
    };

    return createRequest({
        baseURL: 'https://usercenter.kugou.com',  // 原代码用 x-router 头，实际 baseURL 也是 usercenter
        url: '/v3/get_my_info',
        method: 'POST',
        data: dataMap,
        params: { plat: 1 },
        encryptType: 'android',
        headers: {
            'x-router': 'usercenter.kugou.com',
        },
        cookie: {
            token: token,
            userid: userid,
            dfid: params?.cookie?.dfid || localStorage.getItem('kugou_dfid') || '',
            KUGOU_API_MID: params?.cookie?.KUGOU_API_MID || localStorage.getItem('kugou_mid') || '0',
            ...(params?.cookie || {})
        },
        clearDefaultParams: false,
    });
}