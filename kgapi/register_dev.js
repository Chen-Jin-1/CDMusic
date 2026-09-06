import { createRequest } from 'https://cdmsc.chen-jin.dpdns.org/kgapi/request.js';
import { playlistAesEncrypt, playlistAesDecrypt, rsaEncrypt2 } from 'https://cdmsc.chen-jin.dpdns.org/kgapi/crypto.js';
import { getGuid } from 'https://cdmsc.chen-jin.dpdns.org/kgapi/util.js';

/**
 * 注册设备，获取合法的 dfid
 * @param {Object} params
 * @param {string} params.userid - 用户 ID（可选）
 * @param {string} params.token - 用户 token（可选）
 * @param {Object} params.cookie - 已有的 cookie 信息
 * @returns {Promise} 注册结果
 */
export async function register_dev(params = {}) {
    const userid = params?.userid || params?.cookie?.userid || 0;
    const token = params?.token || params?.cookie?.token || '';
    const guid = params?.cookie?.KUGOU_API_GUID || getGuid();

    // 构造设备信息（大部分用默认值，这些值来自原代码）
    const dataMap = {
        availableRamSize: params?.availableRamSize || 4983533568,
        availableRomSize: params?.availableRomSize || 48114719,
        availableSDSize: params?.availableSDSize || 48114717,
        basebandVer: params?.basebandVer || '',
        batteryLevel: params?.batteryLevel || 100,
        batteryStatus: params?.batteryStatus || 3,
        brand: params?.brand || 'Redmi',
        buildSerial: params?.buildSerial || 'unknown',
        device: params?.device || 'marble',
        imei: params?.imei || guid,
        imsi: params?.imsi || '',
        manufacturer: params?.manufacturer || 'Xiaomi',
        uuid: params?.uuid || guid,
        // 传感器默认全关闭
        accelerometer: false,
        accelerometerValue: '',
        gravity: false,
        gravityValue: '',
        gyroscope: false,
        gyroscopeValue: '',
        light: false,
        lightValue: '',
        magnetic: false,
        magneticValue: '',
        orientation: false,
        orientationValue: '',
        pressure: false,
        pressureValue: '',
        step_counter: false,
        step_counterValue: '',
        temperature: false,
        temperatureValue: '',
    };

    // 用 AES 加密设备信息
    const aesEncrypt = playlistAesEncrypt(dataMap);
    // 用 RSA 加密 AES 密钥
    const p = rsaEncrypt2({ aes: aesEncrypt.key, uid: userid, token });

    return createRequest({
        baseURL: 'https://userservice.kugou.com',
        url: '/risk/v2/r_register_dev',
        method: 'POST',
        data: aesEncrypt.str,
        params: { part: 1, platid: 1, p },
        encryptType: 'android',
        cookie: params?.cookie || {},
        responseType: 'arraybuffer',
    });
}