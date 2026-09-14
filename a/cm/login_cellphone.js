// login_cellphone.js
import { createOption } from './option.js';
import { createRequest } from './request.js';

/**
 * 手机验证码/密码登录
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

    // ========== 登录成功后，保存凭证 ==========
    if (result.body.code === 200) {
        // 1. 把所有 Cookie 拼成字符串存起来
        const cookieStr = (result.cookie || []).join('; ');
        localStorage.setItem('netease_cookie', cookieStr);

        // 2. 单独提取 __csrf 存起来
        const csrfMatch = cookieStr.match(/__csrf=([^;]+)/);
        if (csrfMatch) {
            localStorage.setItem('netease_csrf', csrfMatch[1]);
        }

        // 3. 存用户信息
        localStorage.setItem('netease_token', result.body.token || '');
        localStorage.setItem('netease_userid', result.body.account?.id || '');
        localStorage.setItem('netease_nickname', result.body.profile?.nickname || '');
        localStorage.setItem('netease_avatar', result.body.profile?.avatarUrl || '');

        console.log('✅ 登录成功，凭证已保存');
        console.log('   __csrf:', csrfMatch ? csrfMatch[1] : '未找到');
    }

    return result;
}