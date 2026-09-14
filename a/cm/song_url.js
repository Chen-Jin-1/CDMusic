// song_url.js
import { createOption } from './option.js';
import { createRequest } from './request.js';

/**
 * 获取歌曲播放链接
 * @param {Object} query
 * @param {string|number} query.id - 歌曲 ID（可多个，用逗号分隔）
 * @param {number} [query.br] - 码率，默认 999000
 * @returns {Promise} 播放链接响应
 */
export async function song_url(query) {
    const ids = String(query.id).split(',');
    const data = {
        ids: JSON.stringify(ids),
        br: parseInt(query.br || 999000),
    };

    const res = await createRequest(
        '/api/song/enhance/player/url',
        data,
        createOption(query)
    );

    // 根据 id 排序
    const result = res.body.data;
    result.sort((a, b) => {
        return ids.indexOf(String(a.id)) - ids.indexOf(String(b.id));
    });

    return {
        status: 200,
        body: {
            code: 200,
            data: result,
        },
    };
}