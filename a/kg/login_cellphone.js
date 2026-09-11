import { createRequest } from './request.js';
import { cryptoAesEncrypt, cryptoAesDecrypt, cryptoRSAEncrypt } from './crypto.js';
import { signParamsKey } from './helper.js';
import { randomString } from './util.js';

// 概念版加密常量
const liteT2Key = 'fd14b35e3f81af3817a20ae7adae7020';
const liteT2Iv = '17a20ae7adae7020';
const liteT1Key = '5e4ef500e9597fe004bd09a46d8add98';
const liteT1Iv = '04bd09a46d8add98';

export async function login_cellphone(params) {
    const dateTime = Date.now();
    const encrypt = cryptoAesEncrypt({ mobile: params?.mobile || '', code: params?.code || '' });
    const mobile = params?.mobile ? `${params.mobile.toString().substring(0, 2)}*****${params.mobile.toString().substring(10, 11)}` : '';
    const dfid = params?.cookie?.dfid ?? randomString(24);
    
    const t2 = cryptoAesEncrypt(
        `${params.cookie?.KUGOU_API_GUID || '0'}|0f607264fc6318a92b9e13c65db7cd3c|${params.cookie?.KUGOU_API_MAC || '0'}|${params.cookie?.KUGOU_API_DEV || '0'}|${dateTime}`,
        { key: liteT2Key, iv: liteT2Iv }
    );
    const t1 = cryptoAesEncrypt(`|${dateTime}`, { key: liteT1Key, iv: liteT1Iv });

    const dataMap = {
        plat: 1,
        support_multi: 1,
        t1: t1,
        t2: t2,
        clienttime_ms: dateTime,
        mobile: mobile,
        key: signParamsKey(dateTime),
        pk: cryptoRSAEncrypt({ 'clienttime_ms': dateTime, key: encrypt.key }).toUpperCase(),
        params: encrypt.str,
        dfid: dfid,
        dev: params.cookie?.KUGOU_API_DEV || '',
        gitversion: '5f0b7c4'
    };

    if (params?.userid) dataMap['userid'] = params.userid;

    try {
        const result = await createRequest({
            baseURL: 'https://loginserviceretry.kugou.com',
            url: '/v7/login_by_verifycode',
            method: 'POST',
            data: dataMap,
            encryptType: 'android',
            headers: {
                'support-calm': '1',
                'User-Agent': 'Android16-1070-11440-130-0-LOGIN-wifi',
            },
            cookie: {
                dfid: dfid,
                KUGOU_API_MID: params?.cookie?.KUGOU_API_MID || '0',
                KUGOU_API_GUID: params?.cookie?.KUGOU_API_GUID || '',
                ...(params?.cookie || {})
            },
        });

        if (result.body?.status === 1) {
            const data = result.body.data || {};
            
            localStorage.setItem('kugou_userid', data.userid || '');
            localStorage.setItem('kugou_dfid', dfid || '');
            
            if (data.secu_params) {
                try {
                    const decrypted = cryptoAesDecrypt(data.secu_params, encrypt.key);
                    let token = '';
                    if (typeof decrypted === 'object') {
                        token = decrypted.token || decrypted.refresh_token || decrypted;
                        // 如果有其他字段，也一并保存
                        Object.keys(decrypted).forEach(key => {
                            localStorage.setItem(`kugou_${key}`, decrypted[key]);
                        });
                    } else {
                        token = decrypted;
                    }
                    localStorage.setItem('kugou_token', token);
                } catch (e) {
                    console.warn('解密失败:', e.message);
                }
            }
        }

        return result;
    } catch (e) {
        throw e;
    }
}