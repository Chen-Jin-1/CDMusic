import { createRequest } from './request.js';

export function song_url(params = {}) {
    const qualityMap = ['piano', 'acappella', 'subwoofer', 'ancient', 'dj', 'surnay'];
    const quality = qualityMap.includes(params.quality)
        ? `magic_${params.quality}`
        : params.quality || 128;

    const isLite = true;
    const page_id = isLite ? 967177915 : 151369488;
    const ppage_id = isLite
        ? (params.ppage_id || '356753938,823673182,967485191')
        : '463467626,350369493,788954147';

    const dataMap = {
        album_id: Number(params.album_id ?? 0),
        area_code: 1,
        hash: (params?.hash || '').toLowerCase(),
        ssa_flag: 'is_fromtrack',
        version: 11430,
        page_id: page_id,
        quality: quality,
        album_audio_id: Number(params.album_audio_id ?? 0),
        behavior: 'play',
        pid: isLite ? 411 : 2,
        cmd: 26,
        pidversion: 3001,
        IsFreePart: params?.free_part ? 1 : 0,
        ppage_id: ppage_id,
        cdnBackup: 1,
        module: '',
        clientver: 11430,
    };

    return createRequest({
        baseURL: 'https://trackercdn.kugou.com',
        url: '/v5/url',
        method: 'GET',
        params: dataMap,
        encryptType: 'android',
        encryptKey: true,
        notSign: true,
        headers: {
            'x-router': 'trackercdn.kugou.com',
        },
        cookie: params?.cookie || {},
        clearDefaultParams: false,
    });
}