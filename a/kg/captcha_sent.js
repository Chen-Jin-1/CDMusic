import { createRequest } from './request.js';
import { calculateMid, getGuid } from './util.js';

export async function captcha_sent(params) {
    const guid = params?.cookie?.KUGOU_API_GUID || getGuid();
    const mid = params?.cookie?.KUGOU_API_MID || calculateMid(guid);
    
    const dataMap = {
        businessid: 5,
        mobile: `${params?.mobile || ''}`,
        plat: 3,
    };

    return createRequest({
        baseURL: 'http://login.user.kugou.com',
        url: '/v7/send_mobile_code',
        method: 'POST',
        data: dataMap,
        encryptType: 'android',
        cookie: {
            KUGOU_API_MID: mid,
            KUGOU_API_GUID: guid,
            ...(params?.cookie || {})
        },
    });
}