import { request, createOption } from './request.js';


// ==================== activate_init_profile ====================
export function activate_init_profile(query) {
  const data = {
    nickname: query.nickname,
  }
  return request(`/api/activate/initProfile`, data, createOption(query))
}


// ==================== ad_get ====================
export async function ad_get(query) {
  const data = {
    type_ids: query.type_ids || '["400002_0"]',
  }

  const option = createOption(query, 'xeapi', 'v3')

  const res = await request(`/api/ad/get`, data, option)
  const raw = res.body

  // 提取广告中的 req_id
  let reqId = ''
  try {
    if (raw?.ads) {
      const ad = Object.values(raw.ads)[0]
      // 逆向 v9.5.61：客户端从 ad.adExtMap["req_id"] 取 reqUid
      if (ad?.adExtMap) {
        if (typeof ad.adExtMap === 'string') {
          try {
            reqId = JSON.parse(ad.adExtMap).req_id || ''
          } catch (_) {}
        } else {
          reqId = ad.adExtMap.req_id || ''
        }
      }
      // 兜底：adLogId.requestId / ad.reqId / extJson.contextInfo.req_id
      if (!reqId && ad?.adLogId?.requestId) reqId = ad.adLogId.requestId
      if (!reqId && ad?.reqId) reqId = ad.reqId
      if (!reqId && ad?.extJson) {
        try {
          const ext = JSON.parse(ad.extJson)
          reqId = ext?.contextInfo?.req_id || ''
        } catch (_) {}
      }
    }
  } catch (_) {}

  return {
    status: 200,
    body: {
      code: 200,
      ads: raw?.ads || null,
      message: raw?.message || null,
      extra: { reqId },
    },
  }
}


// ==================== ad_listening_rights ====================
export function ad_listening_rights(query) {
  const data = {
    entrance: 'FREE_LISTEN_RN',
  }
  return request(
    `/api/ad/homepage/free/tab/extend/v2`,
    data,
    createOption(query, 'xeapi'),
  )
}


// ==================== ad_listening_rights_gain ====================
export async function ad_listening_rights_gain(query) {
  const time = Date.now()

  // 从广告对象自动补齐请求字段。
  // 实测 v9.5.61 真实 API 返回（/ad/get）确认的字段路径：
  //   reqUid        = ad.extJson.contextInfo.req_id（真实响应中唯一存在）
  //   contextInfo   = ad.extJson.contextInfo（完整对象序列化）
  //   generalRightsInfo = ad.generalRightsInfo（字符串 JSON）
  //   creativeType  = ad.creativeType
  //   rightsGainMethod / extraRightsType / rightsGainDuration / rightsGainType /
  //   extraRightsGainMethod / extraRightsGainDuration / nextRightsGainDuration /
  //   rightsExtJson / source / rightsUpperLimit / qualified
  //                 = ad.generalRightsInfo（字符串）解析后取值
  //   （逆向类字段 adExtMap/adLogId/listeningRightHintInfo 真实响应中不存在，仅兜底）
  //   sniffTime     = method==3 或 6 时 currentTimeMillis
  let reqUid = query.reqUid || ''
  let contextInfo = query.contextInfo
  let creativeType = query.creativeType
  let generalRightsInfo = query.generalRightsInfo

  // 广告 hint 配置：仅当调用方未显式传参时用广告下发值兜底
  const hint = {}

  if (!reqUid || contextInfo === undefined || creativeType === undefined) {
    try {
      const adRes = await adGet(
        { ...query, type_ids: query.type_ids || '["400002_0"]' },
        request,
      )
      const ad = Object.values(adRes?.body?.ads || {})[0]
      if (!ad) throw new Error('ads 为空（未登录或广告位无广告）')

      // reqUid：真实 API 返回中 req_id 在 ad.extJson.contextInfo.req_id（实测 v9.5.61）
      //   （逆向类字段 adExtMap/adLogId 在真实响应中不存在，仅作兜底）
      if (!reqUid) {
        const ext =
          typeof ad?.extJson === 'string'
            ? safeParse(ad.extJson, {})
            : ad?.extJson || {}
        const extMap =
          typeof ad?.adExtMap === 'string'
            ? safeParse(ad.adExtMap, {})
            : ad?.adExtMap
        reqUid =
          ext?.contextInfo?.req_id ||
          extMap?.req_id ||
          ad?.adLogId?.requestId ||
          ad?.reqId ||
          adRes?.body?.extra?.reqId ||
          ''
      }
      // contextInfo：真实 API 返回中在 ad.extJson.contextInfo（实测 v9.5.61）
      if (contextInfo === undefined) {
        const ext =
          typeof ad?.extJson === 'string'
            ? safeParse(ad.extJson, {})
            : ad?.extJson || {}
        const ci =
          ext?.contextInfo || ad?.adLogId?.contextInfo || ad?.showContext
        if (ci) {
          contextInfo = typeof ci === 'string' ? ci : JSON.stringify(ci)
        }
      }
      if (creativeType === undefined && ad?.creativeType !== undefined) {
        creativeType = ad.creativeType
      }
      if (generalRightsInfo === undefined && ad?.generalRightsInfo) {
        generalRightsInfo =
          typeof ad.generalRightsInfo === 'string'
            ? ad.generalRightsInfo
            : JSON.stringify(ad.generalRightsInfo)
      }
      // 缓存广告下发的领取配置（后续用于兜底）
      // 实测 v9.5.61：rightsGainMethod/rightsUpperLimit/qualified 等在
      //   ad.generalRightsInfo（字符串）里，ad.listeningRightHintInfo 真实响应中不存在
      const hintCfg =
        typeof ad?.listeningRightHintInfo === 'string'
          ? safeParse(ad.listeningRightHintInfo, {})
          : ad?.listeningRightHintInfo || {}
      const gri =
        typeof ad?.generalRightsInfo === 'string'
          ? safeParse(ad.generalRightsInfo, {})
          : ad?.generalRightsInfo || {}
      Object.assign(hint, hintCfg, gri)
      console.log(`自动获取 reqUid: ${reqUid}`)
    } catch (e) {
      // 获取广告失败，后续请求会因缺少 reqUid 被拒绝
    }
  }

  const rightsGainMethod = query.rightsGainMethod
    ? parseInt(query.rightsGainMethod)
    : hint.rightsGainMethod || 2

  const rightsParam = {
    // 必填: 广告请求 ID，自动从 ad_get 获取
    reqUid,

    // 曝光时间戳
    exposureTime: query.exposureTime ? parseInt(query.exposureTime) : time,

    // 当前登录用户 ID（原版客户端从 Profile.getUserId() 获取）
    userId: query.uid ? parseInt(query.uid) : undefined,

    // 点击时间戳
    clickTime: query.clickTime ? parseInt(query.clickTime) : time,

    // 额外权益类型（拉新分段权益等，决定发放云贝/时长/下载，来自广告配置）
    extraRightsType: query.extraRightsType
      ? parseInt(query.extraRightsType)
      : hint.extraRightsType !== undefined
        ? parseInt(hint.extraRightsType)
        : undefined,

    // 是否连续播放（默认 false）
    playContinuously: query.playContinuously ? true : false,

    // 来源标识（原版从 ad.listeningRightHintInfo.source 读取）
    source: query.source
      ? parseInt(query.source)
      : hint.source !== undefined
        ? parseInt(hint.source)
        : undefined,

    // 广告创意类型（激励视频场景=36，优先取 query / 广告对象）
    creativeType: creativeType !== undefined ? parseInt(creativeType) : 36,

    // 权益领取方式（1~6 枚举，见文件头注释）
    rightsGainMethod,

    // 权益扩展方式与时长
    extraRightsGainMethod: query.extraRightsGainMethod
      ? parseInt(query.extraRightsGainMethod)
      : hint.extraRightsGainMethod !== undefined
        ? parseInt(hint.extraRightsGainMethod)
        : undefined,
    extraRightsGainDuration: query.extraRightsGainDuration
      ? parseInt(query.extraRightsGainDuration)
      : hint.extraRightsGainDuration !== undefined
        ? parseInt(hint.extraRightsGainDuration)
        : undefined,
    nextRightsGainDuration: query.nextRightsGainDuration
      ? parseInt(query.nextRightsGainDuration)
      : hint.nextRightsGainDuration !== undefined
        ? parseInt(hint.nextRightsGainDuration)
        : undefined,

    // 权益类型（含 RIGHTS_GAIN_TYPE_CURRENT_DAY 等取值）
    rightsGainType: query.rightsGainType
      ? parseInt(query.rightsGainType)
      : hint.rightsGainType !== undefined
        ? parseInt(hint.rightsGainType)
        : undefined,

    // 权益时长
    rightsGainDuration: query.rightsGainDuration
      ? parseInt(query.rightsGainDuration)
      : hint.rightsGainDuration !== undefined
        ? parseInt(hint.rightsGainDuration)
        : undefined,

    // 领取步骤（UNGAIN/GAINING/GAIN_FINISHED 对应的值）
    gainMethodStep: query.gainMethodStep
      ? parseInt(query.gainMethodStep)
      : undefined,

    // 通用权益信息（ad.generalRightsInfo 序列化 JSON）
    generalRightsInfo,

    // 权益扩展信息
    rightsExtJson: query.rightsExtJson || hint.rightsExtJson || undefined,

    // 应用信息（下载类广告）
    appInfo: query.appInfo ? JSON.parse(query.appInfo) : undefined,

    // 广告上下文（ad.adLogId.contextInfo，客户端真实来源）
    contextInfo,

    // 应用是否已安装（下载类广告）
    installed: query.installed ? parseInt(query.installed) : undefined,

    // 嗅探时间：逆向确认（classes5.dex AdDSLUtils.requestRightGain）：
    //   rightsGainMethod==3(曝光+下载) 或 6(LAXIN) 时传 currentTimeMillis
    sniffTime:
      rightsGainMethod === 3 || rightsGainMethod === 6
        ? query.sniffTime
          ? parseInt(query.sniffTime)
          : time
        : undefined,
  }

  // 清理 undefined 字段
  Object.keys(rightsParam).forEach((key) => {
    if (rightsParam[key] === undefined) delete rightsParam[key]
  })

  // 将参数序列化为 reqParam 字符串 (与原生源码一致)
  const data = {
    reqParam: JSON.stringify(rightsParam),
  }

  const res = await request(
    `/api/ad/listening/rights/gain`,
    data,
    createOption(query, 'xeapi', 'v3'),
  )

  return {
    status: 200,
    body: {
      code: 200,
      data: res.body,
    },
  }
}


// ==================== aidj_content_rcmd ====================
export function aidj_content_rcmd(query) {
  var extInfo = {}
  if (query.latitude != undefined) {
    extInfo.lbsInfoList = [
      {
        lat: query.latitude,
        lon: query.longitude,
        time: Date.parse(new Date()) / 1000,
      },
    ]
  }
  extInfo.noAidjToAidj = false
  extInfo.lastRequestTimestamp = new Date().getTime()
  extInfo.listenedTs = false
  const data = {
    extInfo: JSON.stringify(extInfo),
  }
  // logger.info(data)
  return request(`/api/aidj/content/rcmd/info`, data, createOption(query))
}


// ==================== album ====================
export function album(query) {
  return request(`/api/v1/album/${query.id}`, {}, createOption(query, 'weapi'))
}


// ==================== album_detail ====================
export function album_detail(query) {
  const data = {
    id: query.id,
  }
  return request(
    `/api/vipmall/albumproduct/detail`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== album_detail_dynamic ====================
export function album_detail_dynamic(query) {
  const data = {
    id: query.id,
  }
  return request(
    `/api/album/detail/dynamic`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== album_list ====================
export function album_list(query) {
  const data = {
    limit: query.limit || 30,
    offset: query.offset || 0,
    total: true,
    area: query.area || 'ALL', //ALL:全部,ZH:华语,EA:欧美,KR:韩国,JP:日本
    type: query.type,
  }
  return request(
    `/api/vipmall/albumproduct/list`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== album_list_style ====================
export function album_list_style(query) {
  const data = {
    limit: query.limit || 10,
    offset: query.offset || 0,
    total: true,
    area: query.area || 'Z_H', //Z_H:华语,E_A:欧美,KR:韩国,JP:日本
  }
  return request(
    `/api/vipmall/appalbum/album/style`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== album_new ====================
export function album_new(query) {
  const data = {
    limit: query.limit || 30,
    offset: query.offset || 0,
    total: true,
    area: query.area || 'ALL', //ALL:全部,ZH:华语,EA:欧美,KR:韩国,JP:日本
  }
  return request(`/api/album/new`, data, createOption(query, 'weapi'))
}


// ==================== album_newest ====================
export function album_newest(query) {
  return request(`/api/discovery/newAlbum`, {}, createOption(query, 'weapi'))
}


// ==================== album_privilege ====================
export function album_privilege(query) {
  const data = {
    id: query.id,
  }
  return request(`/api/album/privilege`, data, createOption(query))
}


// ==================== album_songsaleboard ====================
export function album_songsaleboard(query) {
  let data = {
    albumType: query.albumType || 0, //0为数字专辑,1为数字单曲
  }
  const type = query.type || 'daily' // daily,week,year,total
  if (type === 'year') {
    data = {
      ...data,
      year: query.year,
    }
  }
  return request(
    `/api/feealbum/songsaleboard/${type}/type`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== album_sub ====================
export function album_sub(query) {
  query.t = query.t == 1 ? 'sub' : 'unsub'
  const data = {
    id: query.id,
  }
  return request(`/api/album/${query.t}`, data, createOption(query, 'weapi'))
}


// ==================== album_sublist ====================
export function album_sublist(query) {
  const data = {
    limit: query.limit || 25,
    offset: query.offset || 0,
    total: true,
  }
  return request(`/api/album/sublist`, data, createOption(query, 'weapi'))
}


// ==================== api ====================
export function api(query) {
  const uri = query.uri
  let data = {}
  try {
    data =
      typeof query.data === 'string' ? JSON.parse(query.data) : query.data || {}
    if (typeof data.cookie === 'string') {
      data.cookie = cookieToJson(data.cookie)
      query.cookie = data.cookie
    }
  } catch (e) {
    data = {}
  }

  const crypto = query.crypto || ''

  const res = request(uri, data, createOption(query, crypto))
  return res
}


// ==================== artist_album ====================
export function artist_album(query) {
  const data = {
    limit: query.limit || 30,
    offset: query.offset || 0,
    total: true,
  }
  return request(
    `/api/artist/albums/${query.id}`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== artist_desc ====================
export function artist_desc(query) {
  const data = {
    id: query.id,
  }
  return request(`/api/artist/introduction`, data, createOption(query, 'weapi'))
}


// ==================== artist_detail ====================
export function artist_detail(query) {
  return request(
    `/api/artist/head/info/get`,
    {
      id: query.id,
    },
    createOption(query),
  )
}


// ==================== artist_detail_dynamic ====================
export function artist_detail_dynamic(query) {
  const data = {
    id: query.id,
  }
  return request(`/api/artist/detail/dynamic`, data, createOption(query))
}


// ==================== artist_fans ====================
export function artist_fans(query) {
  const data = {
    id: query.id,
    limit: query.limit || 20,
    offset: query.offset || 0,
  }
  return request(`/api/artist/fans/get`, data, createOption(query, 'weapi'))
}


// ==================== artist_follow_count ====================
export function artist_follow_count(query) {
  const data = {
    id: query.id,
  }
  return request(
    `/api/artist/follow/count/get`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== artist_list ====================
export function artist_list(query) {
  const data = {
    initial: isNaN(query.initial)
      ? (query.initial || '').toUpperCase().charCodeAt() || undefined
      : query.initial,
    offset: query.offset || 0,
    limit: query.limit || 30,
    total: true,
    type: query.type || '1',
    area: query.area,
  }
  return request(`/api/v1/artist/list`, data, createOption(query, 'weapi'))
}


// ==================== artist_mv ====================
export function artist_mv(query) {
  const data = {
    artistId: query.id,
    limit: query.limit,
    offset: query.offset,
    total: true,
  }
  return request(`/api/artist/mvs`, data, createOption(query, 'weapi'))
}


// ==================== artist_new_mv ====================
export function artist_new_mv(query) {
  const data = {
    limit: query.limit || 20,
    startTimestamp: query.before || Date.now(),
  }
  return request(
    `/api/sub/artist/new/works/mv/list`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== artist_new_song ====================
export function artist_new_song(query) {
  const data = {
    limit: query.limit || 20,
    startTimestamp: query.before || Date.now(),
  }
  return request(
    `/api/sub/artist/new/works/song/list`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== artist_new_song_mv_list_v2 ====================
export function artist_new_song_mv_list_v2(query) {
  const data = {
    startTimestamp: query.startTimestamp || query.before || Date.now(),
    sourceType: query.sourceType || 1,
    limit: query.limit || 10,
    firstRequest: query.firstRequest ?? true,
  }
  return request(
    `/api/sub/artist/new/works/song-mv/list/v2`,
    data,
    createOption(query, 'eapi'),
  )
}


// ==================== artist_new_song_playall ====================
export function artist_new_song_playall(query) {
  return request(
    `/api/sub/artist/new/works/song/playall`,
    {},
    createOption(query, 'eapi'),
  )
}


// ==================== artist_songs ====================
export function artist_songs(query) {
  const data = {
    id: query.id,
    private_cloud: 'true',
    work_type: 1,
    order: query.order || 'hot', //hot,time
    offset: query.offset || 0,
    limit: query.limit || 100,
  }
  return request(`/api/v1/artist/songs`, data, createOption(query))
}


// ==================== artist_sub ====================
export function artist_sub(query) {
  query.t = query.t == 1 ? 'sub' : 'unsub'
  const data = {
    artistId: query.id,
    artistIds: '[' + query.id + ']',
  }
  return request(`/api/artist/${query.t}`, data, createOption(query, 'weapi'))
}


// ==================== artist_sublist ====================
export function artist_sublist(query) {
  const data = {
    limit: query.limit || 25,
    offset: query.offset || 0,
    total: true,
  }
  return request(`/api/artist/sublist`, data, createOption(query, 'weapi'))
}


// ==================== artist_top_song ====================
export function artist_top_song(query) {
  const data = {
    id: query.id,
  }
  return request(`/api/artist/top/song`, data, createOption(query, 'weapi'))
}


// ==================== artist_video ====================
export function artist_video(query) {
  const data = {
    artistId: query.id,
    page: JSON.stringify({
      size: query.size || 10,
      cursor: query.cursor || 0,
    }),
    tab: 0,
    order: query.order || 0,
  }
  return request(`/api/mlog/artist/video`, data, createOption(query, 'weapi'))
}


// ==================== artists ====================
export function artists(query) {
  return request(`/api/v1/artist/${query.id}`, {}, createOption(query, 'weapi'))
}


// ==================== audio_match ====================
export async function audio_match(query) {
  const res = await axios({
    method: 'get',
    url: `https://interface.music.163.com/api/music/audio/match?sessionId=0123456789abcdef&algorithmCode=shazam_v2&duration=${
      query.duration
    }&rawdata=${encodeURIComponent(query.audioFP)}&times=1&decrypt=1`,
    data: null,
  })
  return {
    status: 200,
    body: {
      code: 200,
      data: res.data.data,
    },
  }
}


// ==================== avatar_upload ====================
export async function avatar_upload(query) {
  const uploadInfo = await uploadPlugin(query, request)
  const res = await request(
    `/api/user/avatar/upload/v1`,
    {
      imgid: uploadInfo.imgId,
    },
    createOption(query),
  )
  return {
    status: 200,
    body: {
      code: 200,
      data: {
        ...uploadInfo,
        ...res.body,
      },
    },
  }
}


// ==================== banner ====================
export function banner(query) {
  const type =
    {
      0: 'pc',
      1: 'android',
      2: 'iphone',
      3: 'ipad',
    }[query.type || 0] || 'pc'
  return request(
    `/api/v2/banner/get`,
    { clientType: type },
    createOption(query),
  )
}


// ==================== batch ====================
export function batch(query) {
  const data = {}
  Object.keys(query).forEach((i) => {
    if (/^\/api\//.test(i)) {
      data[i] = query[i]
    }
  })
  return request(`/api/batch`, data, createOption(query))
}


// ==================== broadcast_category_region_get ====================
export function broadcast_category_region_get(query) {
  const data = {}
  return request(
    `/api/voice/broadcast/category/region/get`,
    data,
    createOption(query),
  )
}


// ==================== broadcast_channel_collect_list ====================
export function broadcast_channel_collect_list(query) {
  const data = {
    contentType: 'BROADCAST',
    limit: query.limit || '99999',
    timeReverseOrder: 'true',
    startDate: '4762584922000',
  }
  return request(`/api/content/channel/collect/list`, data, createOption(query))
}


// ==================== broadcast_channel_currentinfo ====================
export function broadcast_channel_currentinfo(query) {
  const data = {
    channelId: query.id,
  }
  return request(
    `/api/voice/broadcast/channel/currentinfo`,
    data,
    createOption(query),
  )
}


// ==================== broadcast_channel_list ====================
export function broadcast_channel_list(query) {
  const data = {
    categoryId: query.categoryId || '0',
    regionId: query.regionId || '0',
    limit: query.limit || '20',
    lastId: query.lastId || '0',
    score: query.score || '-1',
  }
  return request(`/api/voice/broadcast/channel/list`, data, createOption(query))
}


// ==================== broadcast_sub ====================
export function broadcast_sub(query) {
  query.t = query.t == 1 ? 'false' : 'true'
  const data = {
    contentType: 'BROADCAST',
    contentId: query.id,
    cancelCollect: query.t,
  }
  return request(`/api/content/interact/collect`, data, createOption(query))
}


// ==================== calendar ====================
export function calendar(query) {
  const data = {
    startTime: query.startTime || Date.now(),
    endTime: query.endTime || Date.now(),
  }
  return request(`/api/mcalendar/detail`, data, createOption(query, 'weapi'))
}


// ==================== captcha_safe_sent ====================
export function captcha_safe_sent(query) {
  const data = {
    ctcode: query.ctcode || '86',
  }
  return request(
    `/api/sms/captcha/safe/sent`,
    data,
    createOption(query, 'eapi'),
  )
}


// ==================== captcha_sent ====================
export function captcha_sent(query) {
  const data = {
    ctcode: query.ctcode || '86',
    secrete: 'music_middleuser_pclogin',
    cellphone: query.phone,
  }
  return request(`/api/sms/captcha/sent`, data, createOption(query, 'weapi'))
}


// ==================== captcha_sent_v1 ====================
export function captcha_sent_v1(query) {
  const data = {
    ctcode: query.ctcode || '86',
    secrete: 'music_middleuser_pclogin',
    cellphone: query.phone,
    scene: '0',
  }
  return request(
    `/api/middle/captcha/sent/v1`,
    data,
    createOption(query, 'eapi'),
  )
}


// ==================== captcha_verify ====================
export function captcha_verify(query) {
  const data = {
    ctcode: query.ctcode || '86',
    cellphone: query.phone,
    captcha: query.captcha,
  }
  return request(`/api/sms/captcha/verify`, data, createOption(query, 'weapi'))
}


// ==================== cellphone_existence_check ====================
export function cellphone_existence_check(query) {
  const data = {
    cellphone: query.phone,
    countrycode: query.countrycode,
  }
  return request(
    `/api/cellphone/existence/check`,
    data,
    createOption(query, 'eapi'),
  )
}


// ==================== chart_detail ====================
export function chart_detail(query) {
  const data = {
    chartCode: query.chartCode,
    targetId: query.targetId,
    targetType: query.targetType,
  }
  return request(`/api/chart/detail`, data, createOption(query))
}


// ==================== chart_song_detail ====================
export function chart_song_detail(query) {
  const data = {
    chartCode: query.chartCode,
    targetId: query.targetId,
    targetType: query.targetType,
  }
  return request(`/api/chart/song/detail`, data, createOption(query))
}


// ==================== check_music ====================
export function check_music(query) {
  const data = {
    ids: '[' + parseInt(query.id) + ']',
    br: parseInt(query.br || 999000),
  }
  return request(
    `/api/song/enhance/player/url`,
    data,
    createOption(query, 'weapi'),
  ).then((response) => {
    let playable = false
    if (response.body.code == 200) {
      if (response.body.data[0].code == 200) {
        playable = true
      }
    }
    if (playable) {
      response.body = { code: 200, success: true, message: 'ok' }
      return response
    } else {
      // response.status = 404
      response.body = { code: 200, success: false, message: '亲爱的,暂无版权' }
      return response
      // return Promise.reject(response)
    }
  })
}


// ==================== cloud ====================
export async function cloud(query) {
  mm = require('music-metadata')

  query.songFile.name = Buffer.from(query.songFile.name, 'latin1').toString(
    'utf-8',
  )
  const ext = getFileExtension(query.songFile.name)
  const filename = sanitizeFilename(query.songFile.name)
  const bitrate = 999000

  if (!query.songFile) {
    return Promise.reject({
      status: 500,
      body: {
        msg: '请上传音乐文件',
        code: 500,
      },
    })
  }

  const useTemp = isTempFile(query.songFile)
  let fileSize = await getFileSize(query.songFile)
  let fileMd5 = await getFileMd5(query.songFile)

  query.songFile.md5 = fileMd5
  query.songFile.size = fileSize

  try {
    const res = await request(
      `/api/cloud/upload/check`,
      {
        bitrate: String(bitrate),
        ext: '',
        length: fileSize,
        md5: fileMd5,
        songId: '0',
        version: 1,
      },
      createOption(query),
    )

    let artist = ''
    let album = ''
    let songName = ''

    try {
      let metadata
      if (useTemp) {
        metadata = await mm.parseFile(query.songFile.tempFilePath)
      } else {
        metadata = await mm.parseBuffer(
          query.songFile.data,
          query.songFile.mimetype,
        )
      }
      const info = metadata.common
      if (info.title) songName = info.title
      if (info.album) album = info.album
      if (info.artist) artist = info.artist
    } catch (error) {
      logger.info('元数据解析错误:', error.message)
    }

    const tokenRes = await request(
      `/api/nos/token/alloc`,
      {
        bucket: '',
        ext: ext,
        filename: filename,
        local: false,
        nos_product: 3,
        type: 'audio',
        md5: fileMd5,
      },
      createOption(query),
    )

    if (!tokenRes.body.result || !tokenRes.body.result.resourceId) {
      logger.error('Token分配失败:', tokenRes.body)
      return Promise.reject({
        status: 500,
        body: {
          code: 500,
          msg: '获取上传token失败',
          detail: tokenRes.body,
        },
      })
    }

    if (res.body.needUpload) {
      logger.info('需要上传，开始上传流程...')
      try {
        const uploadInfo = await uploadPlugin(query, request)
        logger.info('上传完成:', uploadInfo?.body?.result?.resourceId)
      } catch (uploadError) {
        logger.error('上传失败:', uploadError)
        return Promise.reject(uploadError)
      }
    } else {
      logger.info('文件已存在，跳过上传')
    }

    const res2 = await request(
      `/api/upload/cloud/info/v2`,
      {
        md5: fileMd5,
        songid: res.body.songId,
        filename: query.songFile.name,
        song: songName || filename,
        album: album || '未知专辑',
        artist: artist || '未知艺术家',
        bitrate: String(bitrate),
        resourceId: tokenRes.body.result.resourceId,
      },
      createOption(query),
    )

    if (res2.body.code !== 200) {
      logger.error('云盘信息上传失败:', res2.body)
      return Promise.reject({
        status: res2.status || 500,
        body: {
          code: res2.body.code || 500,
          msg: res2.body.msg || '上传云盘信息失败',
          detail: res2.body,
        },
      })
    }

    const res3 = await request(
      `/api/cloud/pub/v2`,
      {
        songid: res2.body.songId,
      },
      createOption(query),
    )

    return {
      status: 200,
      body: {
        ...res.body,
        ...res3.body,
      },
      cookie: res.cookie,
    }
  } finally {
    if (useTemp) {
      await cleanupTempFile(query.songFile.tempFilePath)
    }
  }
}


// ==================== cloud_import ====================
export async function cloud_import(query) {
  query.id = query.id || -2
  query.artist = query.artist || '未知'
  query.album = query.album || '未知'
  const checkData = {
    uploadType: 0,
    songs: JSON.stringify([
      {
        md5: query.md5,
        songId: query.id,
        bitrate: query.bitrate,
        fileSize: query.fileSize,
      },
    ]),
  }
  const res = await request(
    `/api/cloud/upload/check/v2`,
    checkData,
    createOption(query),
  )
  //res.body.data[0].upload 0:文件可导入,1:文件已在云盘,2:不能导入
  //只能用song决定云盘文件名，且上传后的文件名后缀固定为mp3
  const importData = {
    uploadType: 0,
    songs: JSON.stringify([
      {
        songId: res.body.data[0].songId,
        bitrate: query.bitrate,
        song: query.song,
        artist: query.artist,
        album: query.album,
        fileName: query.song + '.' + query.fileType,
      },
    ]),
  }
  return request(`/api/cloud/user/song/import`, importData, createOption(query))
}


// ==================== cloud_lyric_get ====================
export function cloud_lyric_get(query) {
  const data = {
    userId: query.uid,
    songId: query.sid,
    lv: -1,
    kv: -1,
  }
  return request(`/api/cloud/lyric/get`, data, createOption(query, 'eapi'))
}


// ==================== cloud_match ====================
export function cloud_match(query) {
  const data = {
    userId: query.uid,
    songId: query.sid,
    adjustSongId: query.asid,
  }
  return request(
    `/api/cloud/user/song/match`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== cloud_upload_complete ====================
export async function cloud_upload_complete(query) {
  const {
    songId,
    resourceId,
    md5,
    filename,
    song,
    artist,
    album,
    bitrate = 999000,
  } = query

  if (!songId || !resourceId || !md5 || !filename) {
    return Promise.reject({
      status: 400,
      body: {
        code: 400,
        msg: '缺少必要参数: songId, resourceId, md5, filename',
      },
    })
  }

  const songName = song || filename.replace(/\.[^.]+$/, '')

  const res2 = await request(
    `/api/upload/cloud/info/v2`,
    {
      md5: md5,
      songid: songId,
      filename: filename,
      song: songName,
      album: album || '未知专辑',
      artist: artist || '未知艺术家',
      bitrate: String(bitrate),
      resourceId: resourceId,
    },
    createOption(query),
  )

  if (res2.body.code !== 200) {
    return Promise.reject({
      status: res2.status || 500,
      body: {
        code: res2.body.code || 500,
        msg: res2.body.msg || '上传云盘信息失败',
        detail: res2.body,
      },
    })
  }

  const res3 = await request(
    `/api/cloud/pub/v2`,
    {
      songid: res2.body.songId,
    },
    createOption(query),
  )

  return {
    status: 200,
    body: {
      code: 200,
      data: {
        songId: res2.body.songId,
        ...res3.body,
      },
    },
    cookie: res2.cookie,
  }
}


// ==================== cloud_upload_token ====================
export async function cloud_upload_token(query) {
  const { md5, fileSize, filename, bitrate = 999000 } = query

  if (!md5 || !fileSize || !filename) {
    return Promise.reject({
      status: 400,
      body: {
        code: 400,
        msg: '缺少必要参数: md5, fileSize, filename',
      },
    })
  }

  const ext = filename.includes('.') ? filename.split('.').pop() : 'mp3'

  const checkRes = await request(
    `/api/cloud/upload/check`,
    {
      bitrate: String(bitrate),
      ext: '',
      length: fileSize,
      md5: md5,
      songId: '0',
      version: 1,
    },
    createOption(query),
  )

  const bucket = 'jd-musicrep-privatecloud-audio-public'
  const tokenRes = await request(
    `/api/nos/token/alloc`,
    {
      bucket: bucket,
      ext: ext,
      filename: filename
        .replace(/\.[^.]+$/, '')
        .replace(/\s/g, '')
        .replace(/\./g, '_'),
      local: false,
      nos_product: 3,
      type: 'audio',
      md5: md5,
    },
    createOption(query, 'weapi'),
  )

  if (!tokenRes.body.result || !tokenRes.body.result.objectKey) {
    return Promise.reject({
      status: 500,
      body: {
        code: 500,
        msg: '获取上传token失败',
        detail: tokenRes.body,
      },
    })
  }

  let lbs
  try {
    lbs = (
      await axios({
        method: 'get',
        url: `https://wanproxy.127.net/lbs?version=1.0&bucketname=${bucket}`,
        timeout: 10000,
      })
    ).data
  } catch (error) {
    return Promise.reject({
      status: 500,
      body: {
        code: 500,
        msg: '获取上传服务器地址失败',
        detail: error.message,
      },
    })
  }

  if (!lbs || !lbs.upload || !lbs.upload[0]) {
    return Promise.reject({
      status: 500,
      body: {
        code: 500,
        msg: '获取上传服务器地址无效',
        detail: lbs,
      },
    })
  }

  return {
    status: 200,
    body: {
      code: 200,
      data: {
        needUpload: checkRes.body.needUpload,
        songId: checkRes.body.songId,
        uploadToken: tokenRes.body.result.token,
        objectKey: tokenRes.body.result.objectKey,
        resourceId: tokenRes.body.result.resourceId,
        uploadUrl: `${lbs.upload[0]}/${bucket}/${tokenRes.body.result.objectKey.replace(/\//g, '%2F')}?offset=0&complete=true&version=1.0`,
        bucket: bucket,
        md5: md5,
        fileSize: fileSize,
        filename: filename,
      },
    },
    cookie: checkRes.cookie,
  }
}


// ==================== cloudsearch ====================
export function cloudsearch(query) {
  const data = {
    s: query.keywords,
    type: query.type || 1, // 1: 单曲, 10: 专辑, 100: 歌手, 1000: 歌单, 1002: 用户, 1004: MV, 1006: 歌词, 1009: 电台, 1014: 视频
    limit: query.limit || 30,
    offset: query.offset || 0,
    total: true,
  }
  return request(`/api/cloudsearch/pc`, data, createOption(query))
}


// ==================== comment ====================
export function comment(query) {
  query.t = {
    1: 'add',
    0: 'delete',
    2: 'reply',
  }[query.t]
  query.type = resourceTypeMap[query.type]
  const data = {
    threadId: query.type + query.id,
  }

  if (query.type == 'A_EV_2_') {
    data.threadId = query.threadId
  }
  if (query.t == 'add') data.content = query.content
  else if (query.t == 'delete') data.commentId = query.commentId
  else if (query.t == 'reply') {
    data.commentId = query.commentId
    data.content = query.content
  }
  return request(
    `/api/resource/comments/${query.t}`,
    data,
    createOption(query, 'eapi', 'v2'),
  )
}


// ==================== comment_add ====================
export function comment_add(query) {
  const data = {
    threadId: resourceTypeMap[query.type] + query.id,
    content: query.content,
    resourceType: '0',
    expressionPicId: '-1',
    bubbleId: '-1',
  }
  return request(
    `/api/resource/comments/add`,
    data,
    createOption(query, 'xeapi', 'v3'),
  )
}


// ==================== comment_album ====================
export function comment_album(query) {
  const data = {
    rid: query.id,
    limit: query.limit || 20,
    offset: query.offset || 0,
    beforeTime: query.before || 0,
  }
  return request(
    `/api/v1/resource/comments/R_AL_3_${query.id}`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== comment_delete ====================
export function comment_delete(query) {
  const data = {
    commentId: query.cid,
    threadId: resourceTypeMap[query.type] + query.id,
  }
  return request(
    `/api/resource/comments/delete`,
    data,
    createOption(query, 'xeapi'),
  )
}


// ==================== comment_dj ====================
export function comment_dj(query) {
  const data = {
    rid: query.id,
    limit: query.limit || 20,
    offset: query.offset || 0,
    beforeTime: query.before || 0,
  }
  return request(
    `/api/v1/resource/comments/A_DJ_1_${query.id}`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== comment_event ====================
export function comment_event(query) {
  const data = {
    limit: query.limit || 20,
    offset: query.offset || 0,
    beforeTime: query.before || 0,
  }
  return request(
    `/api/v1/resource/comments/${query.threadId}`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== comment_floor ====================
export function comment_floor(query) {
  query.type = resourceTypeMap[query.type]
  const data = {
    parentCommentId: query.parentCommentId,
    threadId: query.type + query.id,
    time: query.time || -1,
    limit: query.limit || 20,
  }
  return request(
    `/api/resource/comment/floor/get`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== comment_hot ====================
export function comment_hot(query) {
  query.type = resourceTypeMap[query.type]
  const data = {
    rid: query.id,
    limit: query.limit || 20,
    offset: query.offset || 0,
    beforeTime: query.before || 0,
  }
  return request(
    `/api/v1/resource/hotcomments/${query.type}${query.id}`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== comment_hug_list ====================
export function comment_hug_list(query) {
  query.type = resourceTypeMap[query.type || 0]
  const threadId = query.type + query.sid
  const data = {
    targetUserId: query.uid,
    commentId: query.cid,
    cursor: query.cursor || '-1',
    threadId: threadId,
    pageNo: query.page || 1,
    idCursor: query.idCursor || -1,
    pageSize: query.pageSize || 100,
  }
  return request(
    `/api/v2/resource/comments/hug/list`,
    data,
    createOption(query),
  )
}


// ==================== comment_info_list ====================
export function comment_info_list(query) {
  const ids = String(query.ids || query.id || '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean)

  return request(
    `/api/resource/commentInfo/list`,
    {
      resourceType: resourceTypeIdMap[String(query.type || 0)],
      resourceIds: JSON.stringify(ids),
    },
    createOption(query, 'weapi'),
  )
}


// ==================== comment_like ====================
export function comment_like(query) {
  query.t = query.t == 1 ? 'like' : 'unlike'
  query.type = resourceTypeMap[query.type]
  const data = {
    threadId: query.type + query.id,
    commentId: query.cid,
  }
  if (query.type == 'A_EV_2_') {
    data.threadId = query.threadId
  }
  return request(
    `/api/v1/comment/${query.t}`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== comment_music ====================
export function comment_music(query) {
  const data = {
    rid: query.id,
    limit: query.limit || 20,
    offset: query.offset || 0,
    beforeTime: query.before || 0,
  }
  return request(
    `/api/v1/resource/comments/R_SO_4_${query.id}`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== comment_mv ====================
export function comment_mv(query) {
  const data = {
    rid: query.id,
    limit: query.limit || 20,
    offset: query.offset || 0,
    beforeTime: query.before || 0,
  }
  return request(
    `/api/v1/resource/comments/R_MV_5_${query.id}`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== comment_new ====================
export function comment_new(query) {
  query.type = resourceTypeMap[query.type]
  const threadId = query.type + query.id
  const pageSize = query.pageSize || 20
  const pageNo = query.pageNo || 1
  let sortType = Number(query.sortType) || 99
  if (sortType === 1) {
    sortType = 99
  }
  let cursor = ''
  switch (sortType) {
    case 99:
      cursor = (pageNo - 1) * pageSize
      break
    case 2:
      cursor = 'normalHot#' + (pageNo - 1) * pageSize
      break
    case 3:
      cursor = query.cursor || '0'
      break
    default:
      break
  }
  const data = {
    threadId: threadId,
    pageNo,
    showInner: query.showInner || true,
    pageSize,
    cursor: cursor,
    sortType: sortType, //99:按推荐排序,2:按热度排序,3:按时间排序
  }
  return request(`/api/v2/resource/comments`, data, createOption(query))
}


// ==================== comment_playlist ====================
export function comment_playlist(query) {
  const data = {
    rid: query.id,
    limit: query.limit || 20,
    offset: query.offset || 0,
    beforeTime: query.before || 0,
  }
  return request(
    `/api/v1/resource/comments/A_PL_0_${query.id}`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== comment_reply ====================
export function comment_reply(query) {
  const data = {
    threadId: resourceTypeMap[query.type] + query.id,
    commentId: query.cid,
    content: query.content,
    resourceType: '0',
  }
  return request(
    `/api/v1/resource/comments/reply`,
    data,
    createOption(query, 'xeapi', 'v3'),
  )
}


// ==================== comment_report ====================
export function comment_report(query) {
  const data = {
    threadId: 'R_SO_4_' + query.id,
    commentId: query.cid,
    reason: query.reason,
  }
  return request(`/api/report/reportcomment`, data, createOption(query))
}


// ==================== comment_video ====================
export function comment_video(query) {
  const data = {
    rid: query.id,
    limit: query.limit || 20,
    offset: query.offset || 0,
    beforeTime: query.before || 0,
  }
  return request(
    `/api/v1/resource/comments/R_VI_62_${query.id}`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== countries_code_list ====================
export function countries_code_list(query) {
  const data = {}
  return request(`/api/lbs/countries/v1`, data, createOption(query))
}


// ==================== creator_authinfo_get ====================
export function creator_authinfo_get(query) {
  const data = {}
  return request(`/api/user/creator/authinfo/get`, data, createOption(query))
}


// ==================== daily_signin ====================
export function daily_signin(query) {
  const data = {
    type: query.type || 0,
  }
  return request(`/api/point/dailyTask`, data, createOption(query))
}


// ==================== decrypt ====================
export async function decrypt(query) {
  const crypto = query.crypto || 'eapi'
  const data = query.data || query.hexString || ''
  const isReq = query.isReq !== 'false'

  if (!data) {
    return {
      status: 400,
      body: { code: 400, message: 'data is required' },
    }
  }

  try {
    let result
    switch (crypto) {
      case 'eapi': {
        const pureHex = data.replace(/\s/g, '')
        result = isReq ? eapiReqDecrypt(pureHex) : eapiResDecrypt(pureHex)
        break
      }

      case 'weapi': {
        if (isReq) {
          return {
            status: 400,
            body: {
              code: 400,
              message:
                'weapi 请求解密需要 RSA 私钥，暂不支持；仅支持 weapi 返回数据解密（e_r=true 时与 eapi 相同）',
            },
          }
        }
        const pureHex = data.replace(/\s/g, '')
        result = eapiResDecrypt(pureHex)
        break
      }

      case 'linuxapi': {
        if (isReq) {
          const pureHex = data.replace(/\s/g, '')
          const decrypted = aesDecrypt(pureHex, 'ecb', linuxapiKey, '', 'hex')
          result = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8))
        } else {
          result = typeof data === 'string' ? JSON.parse(data) : data
        }
        break
      }

      case 'xeapi': {
        if (isReq) {
          return {
            status: 400,
            body: {
              code: 400,
              message:
                'xeapi 请求解密涉及 X25519 ECDH 密钥交换，流程复杂，暂不支持；仅支持 xeapi 返回数据解密',
            },
          }
        }
        const buf = Buffer.from(data, 'base64')
        result = xeapiResDecrypt(buf)
        break
      }

      case 'api': {
        result = typeof data === 'string' ? JSON.parse(data) : data
        break
      }

      default:
        return {
          status: 400,
          body: { code: 400, message: `未知加密方式: ${crypto}` },
        }
    }

    return {
      status: 200,
      body: { code: 200, data: result },
    }
  } catch (error) {
    return {
      status: 400,
      body: { code: 400, message: `解密失败: ${error.message}` },
    }
  }
}


// ==================== device_kickoff ====================
export function device_kickoff(query) {
  const data = {
    key: query.deviceKey,
    captcha: query.captcha || '',
  }
  return request(
    `/api/middle/user/security/device/kickoff`,
    data,
    createOption(query, 'eapi'),
  )
}


// ==================== device_list ====================
export function device_list(query) {
  const data = {
    excStatus: '9',
  }
  return request(
    `/api/middle/user/device/list`,
    data,
    createOption(query, 'eapi'),
  )
}


// ==================== digitalAlbum_detail ====================
export function digitalAlbum_detail(query) {
  const data = {
    id: query.id,
  }
  return request(
    `/api/vipmall/albumproduct/detail`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== digitalAlbum_ordering ====================
export function digitalAlbum_ordering(query) {
  const data = {
    business: 'Album',
    paymentMethod: query.payment,
    digitalResources: JSON.stringify([
      {
        business: 'Album',
        resourceID: query.id,
        quantity: query.quantity,
      },
    ]),
    from: 'web',
  }
  return request(
    `/api/ordering/web/digital`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== digitalAlbum_purchased ====================
export function digitalAlbum_purchased(query) {
  const data = {
    limit: query.limit || 30,
    offset: query.offset || 0,
    total: true,
  }
  return request(
    `/api/digitalAlbum/purchased`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== digitalAlbum_sales ====================
export function digitalAlbum_sales(query) {
  const data = {
    albumIds: query.ids,
  }
  return request(
    `/api/vipmall/albumproduct/album/query/sales`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== djRadio_top ====================
export function djRadio_top(query) {
  const data = {
    djRadioId: query.djRadioId || null, // 电台id
    sortIndex: query.sortIndex || 1, // 排序 1:播放数 2:点赞数 3：评论数 4：分享数 5：收藏数
    dataGapDays: query.dataGapDays || 7, // 天数 7:一周 30:一个月 90:三个月
    dataType: query.dataType || 3, // 未知
  }
  return request(
    '/api/expert/worksdata/works/top/get',
    data,
    createOption(query),
  )
}


// ==================== dj_banner ====================
export function dj_banner(query) {
  return request(`/api/djradio/banner/get`, {}, createOption(query, 'weapi'))
}


// ==================== dj_category_excludehot ====================
export function dj_category_excludehot(query) {
  return request(
    `/api/djradio/category/excludehot`,
    {},
    createOption(query, 'weapi'),
  )
}


// ==================== dj_category_recommend ====================
export function dj_category_recommend(query) {
  return request(
    `/api/djradio/home/category/recommend`,
    {},
    createOption(query, 'weapi'),
  )
}


// ==================== dj_catelist ====================
export function dj_catelist(query) {
  return request(`/api/djradio/category/get`, {}, createOption(query, 'weapi'))
}


// ==================== dj_detail ====================
export function dj_detail(query) {
  const data = {
    id: query.rid,
  }
  return request(`/api/djradio/v2/get`, data, createOption(query, 'weapi'))
}


// ==================== dj_difm_all_style_channel ====================
export function dj_difm_all_style_channel(query) {
  const data = {
    sources: query.sources || '[0]',
  }
  return request(`/api/dj/difm/all/style/channel/v2`, data, createOption(query))
}


// ==================== dj_difm_channel_subscribe ====================
export function dj_difm_channel_subscribe(query) {
  const data = {
    id: query.id,
  }
  return request(`/api/dj/difm/channel/subscribe`, data, createOption(query))
}


// ==================== dj_difm_channel_unsubscribe ====================
export function dj_difm_channel_unsubscribe(query) {
  const data = {
    id: query.id,
  }
  return request(`/api/dj/difm/channel/unsubscribe`, data, createOption(query))
}


// ==================== dj_difm_playing_tracks_list ====================
export function dj_difm_playing_tracks_list(query) {
  const data = {
    limit: query.limit || 5,
    source: query.source || 0,
    channelId: query.channelId,
  }
  return request(`/api/dj/difm/playing/tracks/list`, data, createOption(query))
}


// ==================== dj_difm_subscribe_channels_get ====================
export function dj_difm_subscribe_channels_get(query) {
  const data = {
    sources: query.sources || '[0]',
  }
  return request(
    `/api/dj/difm/subscribe/channels/get/v2`,
    data,
    createOption(query),
  )
}


// ==================== dj_hot ====================
export function dj_hot(query) {
  const data = {
    limit: query.limit || 30,
    offset: query.offset || 0,
  }
  return request(`/api/djradio/hot/v1`, data, createOption(query, 'weapi'))
}


// ==================== dj_paygift ====================
export function dj_paygift(query) {
  const data = {
    limit: query.limit || 30,
    offset: query.offset || 0,
    _nmclfl: 1,
  }
  return request(
    `/api/djradio/home/paygift/list`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== dj_personalize_recommend ====================
export function dj_personalize_recommend(query) {
  return request(
    `/api/djradio/personalize/rcmd`,
    {
      limit: query.limit || 6,
    },
    createOption(query, 'weapi'),
  )
}


// ==================== dj_program ====================
export function dj_program(query) {
  const data = {
    radioId: query.rid,
    limit: query.limit || 30,
    offset: query.offset || 0,
    asc: toBoolean(query.asc),
  }
  return request(`/api/dj/program/byradio`, data, createOption(query, 'weapi'))
}


// ==================== dj_program_detail ====================
export function dj_program_detail(query) {
  const data = {
    id: query.id,
  }
  return request(`/api/dj/program/detail`, data, createOption(query, 'weapi'))
}


// ==================== dj_program_toplist ====================
export function dj_program_toplist(query) {
  const data = {
    limit: query.limit || 100,
    offset: query.offset || 0,
  }
  return request(`/api/program/toplist/v1`, data, createOption(query, 'weapi'))
}


// ==================== dj_program_toplist_hours ====================
export function dj_program_toplist_hours(query) {
  const data = {
    limit: query.limit || 100,
    // 不支持 offset
  }
  return request(
    `/api/djprogram/toplist/hours`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== dj_radio_hot ====================
export function dj_radio_hot(query) {
  const data = {
    cateId: query.cateId,
    limit: query.limit || 30,
    offset: query.offset || 0,
  }
  return request(`/api/djradio/hot`, data, createOption(query, 'weapi'))
}


// ==================== dj_recommend ====================
export function dj_recommend(query) {
  return request(`/api/djradio/recommend/v1`, {}, createOption(query, 'weapi'))
}


// ==================== dj_recommend_type ====================
export function dj_recommend_type(query) {
  const data = {
    cateId: query.type,
  }
  return request(`/api/djradio/recommend`, data, createOption(query, 'weapi'))
}


// ==================== dj_sub ====================
export function dj_sub(query) {
  query.t = query.t == 1 ? 'sub' : 'unsub'
  const data = {
    id: query.rid,
  }
  return request(`/api/djradio/${query.t}`, data, createOption(query, 'weapi'))
}


// ==================== dj_sublist ====================
export function dj_sublist(query) {
  const data = {
    limit: query.limit || 30,
    offset: query.offset || 0,
    total: true,
  }
  return request(`/api/djradio/get/subed`, data, createOption(query, 'weapi'))
}


// ==================== dj_subscriber ====================
export function dj_subscriber(query) {
  const data = {
    time: query.time || '-1',
    id: query.id,
    limit: query.limit || '20',
    total: 'true',
  }
  return request(`/api/djradio/subscriber`, data, createOption(query, 'weapi'))
}


// ==================== dj_today_perfered ====================
export function dj_today_perfered(query) {
  const data = {
    page: query.page || 0,
  }
  return request(
    `/api/djradio/home/today/perfered`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== dj_toplist ====================
export function dj_toplist(query) {
  const data = {
    limit: query.limit || 100,
    offset: query.offset || 0,
    type: typeMap[query.type || 'new'] || '0', //0为新晋,1为热门
  }
  return request(`/api/djradio/toplist`, data, createOption(query, 'weapi'))
}


// ==================== dj_toplist_hours ====================
export function dj_toplist_hours(query) {
  const data = {
    limit: query.limit || 100,
    // 不支持 offset
  }
  return request(`/api/dj/toplist/hours`, data, createOption(query, 'weapi'))
}


// ==================== dj_toplist_newcomer ====================
export function dj_toplist_newcomer(query) {
  const data = {
    limit: query.limit || 100,
    offset: query.offset || 0,
  }
  return request(`/api/dj/toplist/newcomer`, data, createOption(query, 'weapi'))
}


// ==================== dj_toplist_pay ====================
export function dj_toplist_pay(query) {
  const data = {
    limit: query.limit || 100,
    // 不支持 offset
  }
  return request(`/api/djradio/toplist/pay`, data, createOption(query, 'weapi'))
}


// ==================== dj_toplist_popular ====================
export function dj_toplist_popular(query) {
  const data = {
    limit: query.limit || 100,
    // 不支持 offset
  }
  return request(`/api/dj/toplist/popular`, data, createOption(query, 'weapi'))
}


// ==================== eapi_decrypt ====================
export async function eapi_decrypt(query) {
  const hexString = query.hexString
  const isReq = query.isReq != 'false'
  if (!hexString) {
    return {
      status: 400,
      body: {
        code: 400,
        message: 'hex string is required',
      },
    }
  }
  // 去除空格
  let pureHexString = hexString.replace(/\s/g, '')
  return {
    status: 200,
    body: {
      code: 200,
      data: isReq
        ? eapiReqDecrypt(pureHexString)
        : eapiResDecrypt(pureHexString),
    },
  }
}


// ==================== event ====================
export function event(query) {
  const data = {
    pagesize: query.pagesize || 20,
    lasttime: query.lasttime || -1,
  }
  return request(`/api/v1/event/get`, data, createOption(query, 'weapi'))
}


// ==================== event_del ====================
export function event_del(query) {
  const data = {
    id: query.evId,
  }
  return request(`/api/event/delete`, data, createOption(query, 'weapi'))
}


// ==================== event_forward ====================
export function event_forward(query) {
  const data = {
    forwards: query.forwards,
    id: query.evId,
    eventUserId: query.uid,
  }
  return request(`/api/event/forward`, data, createOption(query))
}


// ==================== event_privacy ====================
export function event_privacy(query) {
  const eventId = String(query.evId ?? '').trim()
  const rawPrivacy = String(query.privacy ?? '').trim()
  const privacy = Number(rawPrivacy)

  if (
    !eventId ||
    !rawPrivacy ||
    !Number.isInteger(privacy) ||
    !PRIVACY_VALUES.has(privacy)
  ) {
    return Promise.resolve({
      status: 400,
      body: {
        code: 400,
        message: 'evId is required and privacy must be one of 0, 1, 2, 6',
      },
      cookie: [],
    })
  }

  const data = {
    eventId,
    privacy,
  }

  return request(`/api/event/privacy/op`, data, createOption(query))
}


// ==================== fanscenter_basicinfo_age_get ====================
export function fanscenter_basicinfo_age_get(query) {
  const data = {}
  return request(`/api/fanscenter/basicinfo/age/get`, data, createOption(query))
}


// ==================== fanscenter_basicinfo_gender_get ====================
export function fanscenter_basicinfo_gender_get(query) {
  const data = {}
  return request(
    `/api/fanscenter/basicinfo/gender/get`,
    data,
    createOption(query),
  )
}


// ==================== fanscenter_basicinfo_province_get ====================
export function fanscenter_basicinfo_province_get(query) {
  const data = {}
  return request(
    `/api/fanscenter/basicinfo/province/get`,
    data,
    createOption(query),
  )
}


// ==================== fanscenter_overview_get ====================
export function fanscenter_overview_get(query) {
  const data = {}
  return request(`/api/fanscenter/overview/get`, data, createOption(query))
}


// ==================== fanscenter_trend_list ====================
export function fanscenter_trend_list(query) {
  const data = {
    startTime: query.startTime || Date.now() - 7 * 24 * 3600 * 1000,
    endTime: query.endTime || Date.now(),
    type: query.type || 0, //新增关注:0 新增取关:1
  }
  return request(`/api/fanscenter/trend/list`, data, createOption(query))
}


// ==================== fm_trash ====================
export function fm_trash(query) {
  const data = {
    songId: query.id,
    alg: 'RT',
    time: query.time || 25,
  }
  return request(`/api/radio/trash/add`, data, createOption(query, 'weapi'))
}


// ==================== follow ====================
export function follow(query) {
  query.t = query.t == 1 ? 'follow' : 'delfollow'
  return request(
    `/api/user/${query.t}/${query.id}`,
    {},
    createOption(query, 'weapi'),
  )
}


// ==================== get_userids ====================
export function get_userids(query) {
  const data = {
    nicknames: query.nicknames,
  }
  return request(`/api/user/getUserIds`, data, createOption(query, 'weapi'))
}


// ==================== history_recommend_songs ====================
export function history_recommend_songs(query) {
  const data = {}
  return request(
    `/api/discovery/recommend/songs/history/recent`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== history_recommend_songs_detail ====================
export function history_recommend_songs_detail(query) {
  const data = {
    date: query.date || '',
  }
  return request(
    `/api/discovery/recommend/songs/history/detail`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== homepage_block_page ====================
export function homepage_block_page(query) {
  const data = { refresh: query.refresh || false, cursor: query.cursor }
  return request(`/api/homepage/block/page`, data, createOption(query, 'weapi'))
}


// ==================== homepage_dragon_ball ====================
export function homepage_dragon_ball(query) {
  const data = {}

  return request(`/api/homepage/dragon/ball/static`, data, createOption(query))
}


// ==================== hot_topic ====================
export function hot_topic(query) {
  const data = {
    limit: query.limit || 20,
    offset: query.offset || 0,
  }
  return request(`/api/act/hot`, data, createOption(query, 'weapi'))
}


// ==================== hug_comment ====================
export function hug_comment(query) {
  query.type = resourceTypeMap[query.type || 0]
  const threadId = query.type + query.sid
  const data = {
    targetUserId: query.uid,
    commentId: query.cid,
    threadId: threadId,
  }
  return request(
    `/api/v2/resource/comments/hug/listener`,
    data,
    createOption(query),
  )
}


// ==================== inner_version ====================
export function inner_version(query) {
  return new Promise((resolve) => {
    return resolve({
      code: 200,
      status: 200,
      body: {
        code: 200,
        data: {
          version: pkg.version,
        },
      },
    })
  })
}


// ==================== lbs_city_code ====================
export function lbs_city_code(query) {
  const data = {
    bizCode: query.bizCode || '',
  }
  return request(`/api/lbs/city/code`, data, createOption(query))
}


// ==================== like ====================
export function like(query) {
  query.like = query.like == 'false' ? false : true
  const data = {
    alg: 'itembased',
    trackId: query.id,
    like: query.like,
    time: '3',
  }
  return request(`/api/radio/like`, data, createOption(query, 'weapi'))
}


// ==================== like_v1 ====================
export function like_v1(query) {
  query.like = query.like == 'false' ? false : true
  const data = {
    alg: 'itembased',
    trackId: query.id,
    like: query.like,
    time: '3',
  }
  return request(`/api/v1/radio/like`, data, createOption(query, 'xeapi', 'v3'))
}


// ==================== likelist ====================
export function likelist(query) {
  const data = {
    uid: query.uid,
  }
  return request(`/api/song/like/get`, data, createOption(query))
}


// ==================== listen_data_realtime_report ====================
export function listen_data_realtime_report(query) {
  return request(
    `/api/content/activity/listen/data/realtime/report`,
    {
      type: query.type || 'week', //周 week 月 month
    },
    createOption(query),
  )
}


// ==================== listen_data_report ====================
export function listen_data_report(query) {
  return request(
    `/api/content/activity/listen/data/report`,
    {
      type: query.type || 'week', //周 week 月 month 年 year
      endTime: query.endTime, // 不填就是本周/月的
    },
    createOption(query),
  )
}


// ==================== listen_data_song_play_rank ====================
export function listen_data_song_play_rank(query) {
  return request(
    `/api/content/activity/listen/data/song/play/rank`,
    {
      type: query.type || 'month', //周 week 月 month
      endTime: query.endTime, // 不填就是本周/月的
    },
    createOption(query),
  )
}


// ==================== listen_data_today_song ====================
export function listen_data_today_song(query) {
  return request(
    `/api/content/activity/listen/data/today/song/play/rank`,
    {},
    createOption(query),
  )
}


// ==================== listen_data_total ====================
export function listen_data_total(query) {
  return request(
    `/api/content/activity/listen/data/total`,
    {},
    createOption(query),
  )
}


// ==================== listen_data_year_report ====================
export function listen_data_year_report(query) {
  return request(
    `/api/content/activity/listen/data/year/report`,
    {},
    createOption(query),
  )
}


// ==================== listentogether_accept ====================
export function listentogether_accept(query) {
  const data = {
    refer: 'inbox_invite',
    roomId: query.roomId,
    inviterId: query.inviterId,
  }
  return request(
    `/api/listen/together/play/invitation/accept`,
    data,
    createOption(query),
  )
}


// ==================== listentogether_end ====================
export function listentogether_end(query) {
  const data = {
    roomId: query.roomId,
  }
  return request(`/api/listen/together/end/v2`, data, createOption(query))
}


// ==================== listentogether_heatbeat ====================
export function listentogether_heatbeat(query) {
  const data = {
    roomId: query.roomId,
    songId: query.songId,
    playStatus: query.playStatus,
    progress: query.progress,
  }
  return request(`/api/listen/together/heartbeat`, data, createOption(query))
}


// ==================== listentogether_play_command ====================
export function listentogether_play_command(query) {
  const data = {
    roomId: query.roomId,
    commandInfo: JSON.stringify({
      commandType: query.commandType,
      progress: query.progress || 0,
      playStatus: query.playStatus,
      formerSongId: query.formerSongId,
      targetSongId: query.targetSongId,
      clientSeq: query.clientSeq,
    }),
  }
  return request(
    `/api/listen/together/play/command/report`,
    data,
    createOption(query),
  )
}


// ==================== listentogether_room_check ====================
export function listentogether_room_check(query) {
  const data = {
    roomId: query.roomId,
  }
  return request(`/api/listen/together/room/check`, data, createOption(query))
}


// ==================== listentogether_room_create ====================
export function listentogether_room_create(query) {
  const data = {
    refer: 'songplay_more',
  }
  return request(`/api/listen/together/room/create`, data, createOption(query))
}


// ==================== listentogether_status ====================
export function listentogether_status(query) {
  return request(
    `/api/listen/together/status/get`,
    {},
    createOption(query, 'weapi'),
  )
}


// ==================== listentogether_sync_list_command ====================
export function listentogether_sync_list_command(query) {
  const data = {
    roomId: query.roomId,
    playlistParam: JSON.stringify({
      commandType: query.commandType,
      version: [
        {
          userId: query.userId,
          version: query.version,
        },
      ],
      anchorSongId: '',
      anchorPosition: -1,
      randomList: query.randomList.split(','),
      displayList: query.displayList.split(','),
    }),
  }
  return request(
    `/api/listen/together/sync/list/command/report`,
    data,
    createOption(query),
  )
}


// ==================== listentogether_sync_playlist_get ====================
export function listentogether_sync_playlist_get(query) {
  const data = {
    roomId: query.roomId,
  }
  return request(
    `/api/listen/together/sync/playlist/get`,
    data,
    createOption(query),
  )
}


// ==================== login ====================
export async function login(query) {
  const data = {
    type: '0',
    https: 'true',
    username: query.email,
    password: query.md5_password || CryptoJS.MD5(query.password).toString(),
    rememberLogin: 'true',
  }
  let result = await request(`/api/w/login`, data, createOption(query))
  if (result.body.code === 502) {
    return {
      status: 200,
      body: {
        msg: '账号或密码错误',
        code: 502,
        message: '账号或密码错误',
      },
    }
  }
  if (result.body.code === 200) {
    result = {
      status: 200,
      body: {
        ...JSON.parse(
          JSON.stringify(result.body).replace(
            /avatarImgId_str/g,
            'avatarImgIdStr',
          ),
        ),
        cookie: result.cookie.join(';'),
      },
      cookie: result.cookie,
    }
  }
  return result
}


// ==================== login_cellphone ====================
export async function login_cellphone(query) {
  const data = {
    type: '1',
    https: 'true',
    phone: query.phone,
    countrycode: query.countrycode || '86',
    captcha: query.captcha,
    [query.captcha ? 'captcha' : 'password']: query.captcha
      ? query.captcha
      : query.md5_password || CryptoJS.MD5(query.password).toString(),
    remember: 'true',
    secureCaptcha: query.sca || '',
  }
  let result = await request(
    `/api/w/login/cellphone`,
    data,
    createOption(query, 'weapi'),
  )

  if (result.body.code === 200) {
    result = {
      status: 200,
      body: {
        ...JSON.parse(
          JSON.stringify(result.body).replace(
            /avatarImgId_str/g,
            'avatarImgIdStr',
          ),
        ),
        cookie: result.cookie.join(';'),
      },
      cookie: result.cookie,
    }
  }
  return result
}


// ==================== login_qr_check ====================
export async function login_qr_check(query) {
  const data = {
    key: query.key,
    type: 3,
  }
  try {
    let result = await request(
      `/api/login/qrcode/client/login`,
      data,
      createOption(query),
    )
    result = {
      status: 200,
      body: {
        ...result.body,
        cookie: result.cookie.join(';'),
      },
      cookie: result.cookie,
    }
    return result
  } catch (error) {
    return {
      status: 200,
      body: {},
      cookie: result.cookie,
    }
  }
}


// ==================== login_qr_create ====================
export function login_qr_create(query) {
  return new Promise(async (resolve) => {
    const platform = query.platform || 'pc'
    const cookie = query.cookie || ''

    // 构建基础URL
    let url = `https://music.163.com/login?codekey=${query.key}`

    // 如果是web平台，则添加chainId参数

    if (platform === 'web') {
      const chainId = generateChainId(cookie)
      url += `&chainId=${chainId}`
    }
    return resolve({
      code: 200,
      status: 200,
      body: {
        code: 200,
        data: {
          qrurl: url,
          qrimg: query.qrimg ? await QRCode.toDataURL(url) : '',
        },
      },
    })
  })
}


// ==================== login_qr_key ====================
export async function login_qr_key(query) {
  const data = {
    type: 3,
  }
  const result = await request(
    `/api/login/qrcode/unikey`,
    data,
    createOption(query),
  )
  return {
    status: 200,
    body: {
      data: result.body,
      code: 200,
    },
    cookie: result.cookie,
  }
}


// ==================== login_refresh ====================
export async function login_refresh(query) {
  let result = await request(
    `/api/login/token/refresh`,
    {},
    createOption(query),
  )
  if (result.body.code === 200) {
    result = {
      status: 200,
      body: {
        ...result.body,
        cookie: result.cookie.join(';'),
      },
      cookie: result.cookie,
    }
  }
  return result
}


// ==================== login_status ====================
export async function login_status(query) {
  const data = {}
  let result = await request(
    `/api/w/nuser/account/get`,
    data,
    createOption(query, 'weapi'),
  )
  if (result.body.code === 200) {
    result = {
      status: 200,
      body: {
        data: {
          ...result.body,
        },
      },
      cookie: result.cookie,
    }
  }
  return result
}


// ==================== logout ====================
export function logout(query) {
  return request(`/api/logout`, {}, createOption(query))
}


// ==================== lyric ====================
export function lyric(query) {
  const data = {
    id: query.id,
    tv: -1,
    lv: -1,
    rv: -1,
    kv: -1,
    _nmclfl: 1,
  }
  return request(`/api/song/lyric`, data, createOption(query))
}


// ==================== lyric_new ====================
export function lyric_new(query) {
  const data = {
    id: query.id,
    cp: false,
    tv: 0,
    lv: 0,
    rv: 0,
    kv: 0,
    yv: 0,
    ytv: 0,
    yrv: 0,
  }
  return request(`/api/song/lyric/v1`, data, createOption(query))
}


// ==================== middle_play_do_lottery ====================
export function middle_play_do_lottery(query) {
  const data = {
    activityId: query.activityId || '6501202',
    drawCount: query.drawCount || '1',
  }
  return request(
    `/api/middle/play/do/lottery`,
    data,
    createOption(query, 'eapi', 'v2'),
  )
}


// ==================== middle_play_lottery_remain_chance ====================
export function middle_play_lottery_remain_chance(query) {
  const data = {
    activityId: query.activityId || '6501202',
  }
  return request(
    `/api/middle/play/lottery/remain/chance`,
    data,
    createOption(query, 'eapi'),
  )
}


// ==================== mlog_music_rcmd ====================
export function mlog_music_rcmd(query) {
  const data = {
    id: query.mvid || 0,
    type: 2,
    rcmdType: 20,
    limit: query.limit || 10,
    extInfo: JSON.stringify({ songId: query.songid }),
  }
  return request(`/api/mlog/rcmd/feed/list`, data, createOption(query))
}


// ==================== mlog_to_video ====================
export function mlog_to_video(query) {
  const data = {
    mlogId: query.id,
  }
  return request(
    `/api/mlog/video/convert/id`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== mlog_url ====================
export function mlog_url(query) {
  const data = {
    id: query.id,
    resolution: query.res || 1080,
    type: 1,
  }
  return request(`/api/mlog/detail/v1`, data, createOption(query, 'weapi'))
}


// ==================== msg_comments ====================
export function msg_comments(query) {
  const data = {
    beforeTime: query.before || '-1',
    limit: query.limit || 30,
    total: 'true',
    uid: query.uid,
  }

  return request(
    `/api/v1/user/comments/${query.uid}`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== msg_forwards ====================
export function msg_forwards(query) {
  const data = {
    offset: query.offset || 0,
    limit: query.limit || 30,
    total: 'true',
  }
  return request(`/api/forwards/get`, data, createOption(query, 'weapi'))
}


// ==================== msg_notices ====================
export function msg_notices(query) {
  const data = {
    limit: query.limit || 30,
    time: query.lasttime || -1,
  }
  return request(`/api/msg/notices`, data, createOption(query, 'weapi'))
}


// ==================== msg_private ====================
export function msg_private(query) {
  const data = {
    offset: query.offset || 0,
    limit: query.limit || 30,
    total: 'true',
  }
  return request(`/api/msg/private/users`, data, createOption(query, 'weapi'))
}


// ==================== msg_private_history ====================
export function msg_private_history(query) {
  const data = {
    userId: query.uid,
    limit: query.limit || 30,
    time: query.before || 0,
    total: 'true',
  }
  return request(`/api/msg/private/history`, data, createOption(query, 'weapi'))
}


// ==================== msg_recentcontact ====================
export function msg_recentcontact(query) {
  const data = {}
  return request(
    `/api/msg/recentcontact/get`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== music_first_listen_info ====================
export function music_first_listen_info(query) {
  const data = {
    songId: query.id,
  }
  return request(
    `/api/content/activity/music/first/listen/info`,
    data,
    createOption(query),
  )
}


// ==================== musician_cloudbean ====================
export function musician_cloudbean(query) {
  const data = {}
  return request(`/api/cloudbean/get`, data, createOption(query, 'weapi'))
}


// ==================== musician_cloudbean_obtain ====================
export function musician_cloudbean_obtain(query) {
  const data = {
    userMissionId: query.id,
    period: query.period,
  }
  return request(
    `/api/nmusician/workbench/mission/reward/obtain/new`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== musician_data_overview ====================
export function musician_data_overview(query) {
  const data = {}
  return request(
    `/api/creator/musician/statistic/data/overview/get`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== musician_play_trend ====================
export function musician_play_trend(query) {
  const data = {
    startTime: query.startTime,
    endTime: query.endTime,
  }
  return request(
    `/api/creator/musician/play/count/statistic/data/trend/get`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== musician_sign ====================
export function musician_sign(query) {
  const data = {}
  return request(`/api/creator/user/access`, data, createOption(query, 'weapi'))
}


// ==================== musician_tasks ====================
export function musician_tasks(query) {
  const data = {}
  return request(
    `/api/nmusician/workbench/mission/cycle/list`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== musician_tasks_new ====================
export function musician_tasks_new(query) {
  const data = {}
  return request(
    `/api/nmusician/workbench/mission/stage/list `,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== musician_vip_tasks ====================
export function musician_vip_tasks(query) {
  const data = {}
  return request(
    `/api/nmusician/workbench/special/right/vip/info`,
    data,
    createOption(query, 'eapi'),
  )
}


// ==================== mv_all ====================
export function mv_all(query) {
  const data = {
    tags: JSON.stringify({
      地区: query.area || '全部',
      类型: query.type || '全部',
      排序: query.order || '上升最快',
    }),
    offset: query.offset || 0,
    total: 'true',
    limit: query.limit || 30,
  }
  return request(`/api/mv/all`, data, createOption(query))
}


// ==================== mv_detail ====================
export function mv_detail(query) {
  const data = {
    id: query.mvid,
  }
  return request(`/api/v1/mv/detail`, data, createOption(query, 'weapi'))
}


// ==================== mv_detail_info ====================
export function mv_detail_info(query) {
  const data = {
    threadid: `R_MV_5_${query.mvid}`,
    composeliked: true,
  }
  return request(
    `/api/comment/commentthread/info`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== mv_exclusive_rcmd ====================
export function mv_exclusive_rcmd(query) {
  const data = {
    offset: query.offset || 0,
    limit: query.limit || 30,
  }
  return request(`/api/mv/exclusive/rcmd`, data, createOption(query))
}


// ==================== mv_first ====================
export function mv_first(query) {
  const data = {
    // 'offset': query.offset || 0,
    area: query.area || '',
    limit: query.limit || 30,
    total: true,
  }
  return request(`/api/mv/first`, data, createOption(query))
}


// ==================== mv_sub ====================
export function mv_sub(query) {
  query.t = query.t == 1 ? 'sub' : 'unsub'
  const data = {
    mvId: query.mvid,
    mvIds: '["' + query.mvid + '"]',
  }
  return request(`/api/mv/${query.t}`, data, createOption(query, 'weapi'))
}


// ==================== mv_sublist ====================
export function mv_sublist(query) {
  const data = {
    limit: query.limit || 25,
    offset: query.offset || 0,
    total: true,
  }
  return request(
    `/api/cloudvideo/allvideo/sublist`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== mv_url ====================
export function mv_url(query) {
  const data = {
    id: query.id,
    r: query.r || 1080,
  }
  return request(
    `/api/song/enhance/play/mv/url`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== nickname_check ====================
export function nickname_check(query) {
  const data = {
    nickname: query.nickname,
  }
  return request(`/api/nickname/duplicated`, data, createOption(query, 'weapi'))
}


// ==================== personal_fm ====================
export function personal_fm(query) {
  return request(`/api/v1/radio/get`, {}, createOption(query, 'weapi'))
}


// ==================== personal_fm_mode ====================
export function personal_fm_mode(query) {
  const data = {
    mode: query.mode,
    subMode: query.submode,
    limit: query.limit || 3,
  }
  return request(`/api/v1/radio/get`, data, createOption(query))
}


// ==================== personalized ====================
export function personalized(query) {
  const data = {
    limit: query.limit || 30,
    // offset: query.offset || 0,
    total: true,
    n: 1000,
  }
  return request(
    `/api/personalized/playlist`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== personalized_djprogram ====================
export function personalized_djprogram(query) {
  return request(
    `/api/personalized/djprogram`,
    {},
    createOption(query, 'weapi'),
  )
}


// ==================== personalized_mv ====================
export function personalized_mv(query) {
  return request(`/api/personalized/mv`, {}, createOption(query, 'weapi'))
}


// ==================== personalized_newsong ====================
export function personalized_newsong(query) {
  const data = {
    type: 'recommend',
    limit: query.limit || 10,
    areaId: query.areaId || 0,
  }
  return request(
    `/api/personalized/newsong`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== personalized_privatecontent ====================
export function personalized_privatecontent(query) {
  return request(
    `/api/personalized/privatecontent`,
    {},
    createOption(query, 'weapi'),
  )
}


// ==================== personalized_privatecontent_list ====================
export function personalized_privatecontent_list(query) {
  const data = {
    offset: query.offset || 0,
    total: 'true',
    limit: query.limit || 60,
  }
  return request(
    `/api/v2/privatecontent/list`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== pl_count ====================
export function pl_count(query) {
  const data = {}
  return request(`/api/pl/count`, data, createOption(query, 'weapi'))
}


// ==================== playlist_category_list ====================
export function playlist_category_list(query) {
  const data = {
    cat: query.cat || '全部',
    limit: query.limit || 24,
    newStyle: true,
  }
  return request(`/api/playlist/category/list`, data, createOption(query))
}


// ==================== playlist_catlist ====================
export function playlist_catlist(query) {
  return request(`/api/playlist/catalogue`, {}, createOption(query, 'eapi'))
}


// ==================== playlist_cover_update ====================
export async function playlist_cover_update(query) {
  if (!query.imgFile) {
    return {
      status: 400,
      body: {
        code: 400,
        msg: 'imgFile is required',
      },
    }
  }
  const uploadInfo = await uploadPlugin(query, request)
  const res = await request(
    `/api/playlist/cover/update`,
    {
      id: query.id,
      coverImgId: uploadInfo.imgId,
    },
    createOption(query, 'weapi'),
  )
  return {
    status: 200,
    body: {
      code: 200,
      data: {
        ...uploadInfo,
        ...res.body,
      },
    },
  }
}


// ==================== playlist_create ====================
export function playlist_create(query) {
  const data = {
    name: query.name,
    privacy: query.privacy || '0', // 0 普通歌单, 10 隐私歌单
    type: query.type || 'NORMAL', // 默认 NORMAL, VIDEO 视频歌单, SHARED 共享歌单
  }
  return request(`/api/playlist/create`, data, createOption(query, 'weapi'))
}


// ==================== playlist_delete ====================
export function playlist_delete(query) {
  const data = {
    ids: '[' + query.id + ']',
  }
  return request(`/api/playlist/remove`, data, createOption(query, 'weapi'))
}


// ==================== playlist_desc_update ====================
export function playlist_desc_update(query) {
  const data = {
    id: query.id,
    desc: query.desc,
  }
  return request(`/api/playlist/desc/update`, data, createOption(query))
}


// ==================== playlist_detail ====================
export function playlist_detail(query) {
  const data = {
    id: query.id,
    n: 100000,
    s: query.s || 8,
  }
  return request(`/api/v6/playlist/detail`, data, createOption(query))
}


// ==================== playlist_detail_dynamic ====================
export function playlist_detail_dynamic(query) {
  const data = {
    id: query.id,
    n: 100000,
    s: query.s || 8,
  }
  return request(`/api/playlist/detail/dynamic`, data, createOption(query))
}


// ==================== playlist_detail_rcmd_get ====================
export function playlist_detail_rcmd_get(query) {
  const data = {
    scene: 'playlist_head',
    playlistId: query.id,
    newStyle: 'true',
  }
  return request(`/api/playlist/detail/rcmd/get`, data, createOption(query))
}


// ==================== playlist_highquality_tags ====================
export function playlist_highquality_tags(query) {
  const data = {}
  return request(
    `/api/playlist/highquality/tags`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== playlist_hot ====================
export function playlist_hot(query) {
  return request(`/api/playlist/hottags`, {}, createOption(query, 'weapi'))
}


// ==================== playlist_import_name_task_create ====================
export function playlist_import_name_task_create(query) {
  let data = {
    importStarPlaylist: query.importStarPlaylist || false, // 导入我喜欢的音乐
  }

  if (query.local) {
    // 元数据导入
    let local = JSON.parse(query.local)
    let multiSongs = JSON.stringify(
      local.map(function (e) {
        return {
          songName: e.name,
          artistName: e.artist,
          albumName: e.album,
        }
      }),
    )
    data = {
      ...data,
      multiSongs: multiSongs,
    }
  } else {
    let playlistName = // 歌单名称
      query.playlistName || '导入音乐 '.concat(new Date().toLocaleString())
    let songs = ''
    if (query.text) {
      // 文字导入
      songs = JSON.stringify([
        {
          name: playlistName,
          type: '',
          url: encodeURI('rpc://playlist/import?text='.concat(query.text)),
        },
      ])
    }

    if (query.link) {
      // 链接导入
      let link = JSON.parse(query.link)
      songs = JSON.stringify(
        link.map(function (e) {
          return { name: playlistName, type: '', url: encodeURI(e) }
        }),
      )
    }
    data = {
      ...data,
      playlistName: playlistName,
      createBusinessCode: undefined,
      extParam: undefined,
      taskIdForLog: '',
      songs: songs,
    }
  }
  return request(
    `/api/playlist/import/name/task/create`,
    data,
    createOption(query),
  )
}


// ==================== playlist_import_task_status ====================
export function playlist_import_task_status(query) {
  return request(
    `/api/playlist/import/task/status/v2`,
    {
      taskIds: JSON.stringify([query.id]),
    },
    createOption(query),
  )
}


// ==================== playlist_mylike ====================
export function playlist_mylike(query) {
  const data = {
    time: query.time || '-1',
    limit: query.limit || '12',
  }
  return request(
    `/api/mlog/playlist/mylike/bytime/get`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== playlist_name_update ====================
export function playlist_name_update(query) {
  const data = {
    id: query.id,
    name: query.name,
  }
  return request(`/api/playlist/update/name`, data, createOption(query))
}


// ==================== playlist_order_update ====================
export function playlist_order_update(query) {
  const data = {
    ids: query.ids,
  }
  return request(
    `/api/playlist/order/update`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== playlist_privacy ====================
export function playlist_privacy(query) {
  const data = {
    id: query.id,
    privacy: 0,
  }
  return request(`/api/playlist/update/privacy`, data, createOption(query))
}


// ==================== playlist_subscribe ====================
export function playlist_subscribe(query) {
  const path = query.t == 1 ? 'subscribe' : 'unsubscribe'
  const data = {
    id: query.id,
    ...(query.t === 1
      ? { checkToken: query.checkToken || APP_CONF.checkToken }
      : {}),
  }
  query.checkToken = 'v2' // 强制开启checkToken
  return request(`/api/playlist/${path}`, data, createOption(query, 'eapi'))
}


// ==================== playlist_subscribers ====================
export function playlist_subscribers(query) {
  const data = {
    id: query.id,
    limit: query.limit || 20,
    offset: query.offset || 0,
  }
  return request(`/api/playlist/subscribers`, data, createOption(query))
}


// ==================== playlist_tags_update ====================
export function playlist_tags_update(query) {
  const data = {
    id: query.id,
    tags: query.tags,
  }
  return request(`/api/playlist/tags/update`, data, createOption(query))
}


// ==================== playlist_track_add ====================
export async function playlist_track_add(query) {
  query.ids = query.ids || ''
  const data = {
    id: query.pid,
    tracks: JSON.stringify(
      query.ids.split(',').map((item) => {
        return { type: 3, id: item }
      }),
    ),
  }
  logger.info(data)

  return request(`/api/playlist/track/add`, data, createOption(query, 'weapi'))
}


// ==================== playlist_track_all ====================
export function playlist_track_all(query) {
  const data = {
    id: query.id,
    n: 100000,
    s: query.s || 8,
  }
  //不放在data里面避免请求带上无用的数据
  let limit = parseInt(query.limit) || 1000
  let offset = parseInt(query.offset) || 0

  return request(`/api/v6/playlist/detail`, data, createOption(query)).then(
    (res) => {
      let trackIds = res.body.playlist.trackIds
      let idsData = {
        c:
          '[' +
          trackIds
            .slice(offset, offset + limit)
            .map((item) => '{"id":' + item.id + '}')
            .join(',') +
          ']',
      }

      return request(`/api/v3/song/detail`, idsData, createOption(query))
    },
  )
}


// ==================== playlist_track_delete ====================
export async function playlist_track_delete(query) {
  query.ids = query.ids || ''
  const data = {
    id: query.id,
    tracks: JSON.stringify(
      query.ids.split(',').map((item) => {
        return { type: 3, id: item }
      }),
    ),
  }

  return request(
    `/api/playlist/track/delete`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== playlist_tracks ====================
export async function playlist_tracks(query) {
  //
  const tracks = query.tracks.split(',')
  const data = {
    op: query.op, // del,add
    pid: query.pid, // 歌单id
    trackIds: JSON.stringify(tracks), // 歌曲id
    imme: 'true',
  }

  try {
    const res = await request(
      `/api/playlist/manipulate/tracks`,
      data,
      createOption(query),
    )
    return {
      status: 200,
      body: {
        ...res,
      },
    }
  } catch (error) {
    if (error.body.code === 512) {
      return request(
        `/api/playlist/manipulate/tracks`,
        {
          op: query.op, // del,add
          pid: query.pid, // 歌单id
          trackIds: JSON.stringify([...tracks, ...tracks]),
          imme: 'true',
        },
        createOption(query),
      )
    } else {
      return {
        status: 200,
        body: error.body,
      }
    }
  }
}


// ==================== playlist_update ====================
export function playlist_update(query) {
  query.desc = query.desc || ''
  query.tags = query.tags || ''
  const data = {
    '/api/playlist/desc/update': `{"id":${query.id},"desc":"${query.desc}"}`,
    '/api/playlist/tags/update': `{"id":${query.id},"tags":"${query.tags}"}`,
    '/api/playlist/update/name': `{"id":${query.id},"name":"${query.name}"}`,
  }
  return request(`/api/batch`, data, createOption(query))
}


// ==================== playlist_update_playcount ====================
export function playlist_update_playcount(query) {
  const data = {
    id: query.id,
  }
  return request(`/api/playlist/update/playcount`, data, createOption(query))
}


// ==================== playlist_video_recent ====================
export function playlist_video_recent(query) {
  const data = {}
  return request(
    `/api/playlist/video/recent`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== playmode_intelligence_list ====================
export function playmode_intelligence_list(query) {
  const data = {
    songId: query.id,
    type: 'fromPlayOne',
    playlistId: query.pid,
    startMusicId: query.sid || query.id,
    count: query.count || 1,
  }
  return request(`/api/playmode/intelligence/list`, data, createOption(query))
}


// ==================== playmode_song_vector ====================
export function playmode_song_vector(query) {
  const data = {
    ids: query.ids,
  }
  return request(`/api/playmode/song/vector/get`, data, createOption(query))
}


// ==================== program_recommend ====================
export function program_recommend(query) {
  const data = {
    cateId: query.type,
    limit: query.limit || 10,
    offset: query.offset || 0,
  }
  return request(
    `/api/program/recommend/v1`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== radio_sport_get ====================
export function radio_sport_get(query) {
  const data = {
    bpm: query.bpm || 50,
  }
  return request(`/api/radio/sport/get`, data, createOption(query))
}


// ==================== rebind ====================
export function rebind(query) {
  const data = {
    captcha: query.captcha,
    phone: query.phone,
    oldcaptcha: query.oldcaptcha,
    ctcode: query.ctcode || '86',
  }
  return request(
    `/api/user/replaceCellphone`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== recent_listen_list ====================
export function recent_listen_list(query) {
  const data = {}
  return request(`/api/pc/recent/listen/list`, data, createOption(query))
}


// ==================== recommend_resource ====================
export function recommend_resource(query) {
  return request(
    `/api/v1/discovery/recommend/resource`,
    {},
    createOption(query, 'weapi'),
  )
}


// ==================== recommend_songs ====================
export function recommend_songs(query) {
  const data = {
    afresh: query.afresh,
  }
  return request(
    `/api/v3/discovery/recommend/songs`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== recommend_songs_dislike ====================
export function recommend_songs_dislike(query) {
  const data = {
    resId: query.id, // 日推歌曲id
    resType: 4,
    sceneType: 1,
  }
  return request(
    `/api/v2/discovery/recommend/dislike`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== record_recent_album ====================
export function record_recent_album(query) {
  const data = {
    limit: query.limit || 100,
  }
  return request(
    `/api/play-record/album/list`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== record_recent_dj ====================
export function record_recent_dj(query) {
  const data = {
    limit: query.limit || 100,
  }
  return request(
    `/api/play-record/djradio/list`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== record_recent_playlist ====================
export function record_recent_playlist(query) {
  const data = {
    limit: query.limit || 100,
  }
  return request(
    `/api/play-record/playlist/list`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== record_recent_song ====================
export function record_recent_song(query) {
  const data = {
    limit: query.limit || 100,
  }
  return request(
    `/api/play-record/song/list`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== record_recent_video ====================
export function record_recent_video(query) {
  const data = {
    limit: query.limit || 100,
  }
  return request(
    `/api/play-record/newvideo/list`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== record_recent_voice ====================
export function record_recent_voice(query) {
  const data = {
    limit: query.limit || 100,
  }
  return request(
    `/api/play-record/voice/list`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== register_anonimous ====================
export async function register_anonimous(query) {
  const deviceId = generateDeviceId()
  logger.info(`Successfully registered anonimous token, deviceId: ${deviceId}`)
  global.deviceId = deviceId
  const encodedId = CryptoJS.enc.Base64.stringify(
    CryptoJS.enc.Utf8.parse(
      `${deviceId} ${cloudmusic_dll_encode_id(deviceId)}`,
    ),
  )
  const data = {
    username: encodedId,
  }
  let result = await request(
    `/api/register/anonimous`,
    data,
    createOption(query, 'xeapi'),
  )
  if (result.body.code === 200) {
    result = {
      status: 200,
      body: {
        ...result.body,
        cookie: result.cookie.join(';'),
      },
      cookie: result.cookie,
    }
  }
  return result
}


// ==================== register_cellphone ====================
export function register_cellphone(query) {
  const data = {
    captcha: query.captcha,
    phone: query.phone,
    password: CryptoJS.MD5(query.password).toString(),
    nickname: query.nickname,
    countrycode: query.countrycode || '86',
    force: 'false',
  }
  return request(`/api/w/register/cellphone`, data, createOption(query))
}


// ==================== register_checktoken_v2 ====================
export async function register_checktoken_v2() {
  let token = ''
  try {
    token = await fetchToken()
  } catch (e) {
    logger.warn('[checkToken v2]', e.message)
  }
  return {
    status: 200,
    body: { code: 200, token, registered: !!token },
  }
}

// 给 request.js 读取用：每次调用实时获取新 token，不缓存


// ==================== register_checktoken_v3 ====================
export async function register_checktoken_v3() {
  let token = ''
  try {
    token = await fetch()
  } catch (e) {
    // token 获取失败时返回空，由调用方决定是否重试
  }
  return {
    status: 200,
    body: { code: 200, token, registered: !!token },
  }
}

// 给 request.js 读取用：每次调用实时获取新 token，不缓存


// ==================== register_xeapikey ====================
export async function register_xeapikey(query) {
  const nonce = generateNonce()
  const timestamp = String(Date.now())
  const deviceId = query.deviceId || global.deviceId || ''
  const currentKeyVersion = query.currentKeyVersion || ''

  const data = {
    appVersion: '9.5.61',
    currentKeyVersion,
    deviceId,
    nonce,
    os: 'android',
    requestType: 'active',
    signature: encrypt.xeapiSign(timestamp, nonce),
    t1: '',
    t2: '',
    timestamp,
    uid: '',
  }

  const res = await axios({
    method: 'POST',
    url: APP_CONF.apiDomain + '/api/gorilla/anti/crawler/security/key/get',
    headers: {
      'User-Agent':
        'NeteaseMusic/9.5.61.260802021928(9005061);Dalvik/2.1.0 (Linux; U; Android 12; HBN-AL00 Build/cd737a2.0)',
      Cookie: deviceId ? `deviceId=${encodeURIComponent(deviceId)}` : '',
    },
    data: new URLSearchParams(data).toString(),
    proxy: false,
  })

  if (
    !res.data ||
    res.data.code !== 200 ||
    !res.data.data ||
    !res.data.data.encryptedData
  ) {
    throw new Error('xeapi public key request failed')
  }
  if (
    !res.data.data.signature ||
    encrypt.xeapiSign(res.data.data.timestamp, nonce) !==
      res.data.data.signature
  ) {
    throw new Error('xeapi public key response signature mismatch')
  }

  const publicKey = encrypt.xeapiDecryptPublicKey(res.data.data.encryptedData)
  if (!publicKey.sk) {
    throw new Error('xeapi public key response missing sk')
  }

  return {
    status: 200,
    body: {
      ...publicKey,
      deviceId,
    },
    cookie: [],
  }
}


// ==================== related_allvideo ====================
export function related_allvideo(query) {
  const data = {
    id: query.id,
    type: /^\d+$/.test(query.id) ? 0 : 1,
  }
  return request(
    `/api/cloudvideo/v1/allvideo/rcmd`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== related_playlist ====================
export async function related_playlist(query) {
  const res = await axios({
    method: 'GET',
    url: `https://music.163.com/playlist?id=${query.id}`,
  })
  try {
    const pattern =
      /<div class="cver u-cover u-cover-3">[\s\S]*?<img src="([^"]+)">[\s\S]*?<a class="sname f-fs1 s-fc0" href="([^"]+)"[^>]*>([^<]+?)<\/a>[\s\S]*?<a class="nm nm f-thide s-fc3" href="([^"]+)"[^>]*>([^<]+?)<\/a>/g
    let result,
      playlists = []
    while ((result = pattern.exec(res.data)) != null) {
      playlists.push({
        creator: {
          userId: result[4].slice('/user/home?id='.length),
          nickname: result[5],
        },
        coverImgUrl: result[1].slice(0, -'?param=50y50'.length),
        name: result[3],
        id: result[2].slice('/playlist?id='.length),
      })
    }
    res.body = { code: 200, playlists: playlists }
    return res
  } catch (err) {
    res.status = 500
    res.body = { code: 500, msg: err.stack }
    return Promise.reject(res)
  }
}


// ==================== relay_play_state_submit ====================
export function relay_play_state_submit(query) {
  const {
    id,
    sessionId,
    progress = 0,
    playMode = 'list_loop',
    type = 'song',
  } = query

  if (!id) {
    return Promise.reject({
      status: 400,
      body: {
        code: 400,
        msg: '缺少必要参数：id',
      },
    })
  }

  const playStateSubmitReq = JSON.stringify({
    resource: {
      id: String(id),
      type: type,
    },
    progress: Number(progress) || 0,
    sessionId: sessionId || generateSessionId(),
    playMode: playMode,
  })

  const data = {
    playStateSubmitReq: playStateSubmitReq,
  }

  return request(
    '/api/relay/play/state/submit',
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== rep_ugc_activity_collect ====================
export function rep_ugc_activity_collect(query) {
  const data = {
    activityId: query.activityId || '5001',
  }
  return request(
    `/api/rep/ugc/activity/collect`,
    data,
    createOption(query, 'eapi'),
  )
}


// ==================== rep_ugc_activity_get ====================
export function rep_ugc_activity_get(query) {
  return request(`/api/rep/ugc/activity/get`, {}, createOption(query, 'eapi'))
}


// ==================== rep_ugc_exam_info_get ====================
export function rep_ugc_exam_info_get(query) {
  if (!query.examType)
    return Promise.reject({
      status: 400,
      body: {
        code: 400,
        message: '参数不足',
      },
    })
  const data = {
    examType: query.examType,
  }
  return request(
    '/api/rep/ugc/exam/info/get',
    data,
    createOption(query, 'eapi'),
  )
}


// ==================== rep_ugc_exam_question_single_get ====================
export function rep_ugc_exam_question_single_get(query) {
  if (!query.examType || !query.taskId)
    return Promise.reject({
      status: 400,
      body: {
        code: 400,
        message: '参数不足',
      },
    })
  const data = {
    examType: query.examType,
    taskId: query.taskId,
  }
  return request(
    '/api/rep/ugc/exam/question/single/get',
    data,
    createOption(query, 'eapi'),
  )
}


// ==================== rep_ugc_exam_result_get ====================
export function rep_ugc_exam_result_get(query) {
  if (!query.examType || !query.taskId)
    return Promise.reject({
      status: 400,
      body: {
        code: 400,
        message: '参数不足',
      },
    })
  const data = {
    examType: query.examType,
    taskId: query.taskId,
  }
  return request(
    '/api/rep/ugc/exam/result/get',
    data,
    createOption(query, 'eapi'),
  )
}


// ==================== rep_ugc_exam_start ====================
export function rep_ugc_exam_start(query) {
  if (!query.examType)
    return Promise.reject({
      status: 400,
      body: {
        code: 400,
        message: '参数不足',
      },
    })
  const data = {
    examType: query.examType,
  }
  return request('/api/rep/ugc/exam/start', data, createOption(query, 'eapi'))
}


// ==================== rep_ugc_exam_submit ====================
export function rep_ugc_exam_submit(query) {
  if (!query.examType || !query.taskId || !query.questionId || !query.answer)
    return Promise.reject({
      status: 400,
      body: {
        code: 400,
        message: '参数不足',
      },
    })
  const data = {
    examType: query.examType,
    taskId: query.taskId,
    questionId: query.questionId,
    answer: query.answer,
  }
  return request('/api/rep/ugc/exam/submit', data, createOption(query, 'eapi'))
}


// ==================== rep_ugc_user_collect_vip ====================
export function rep_ugc_user_collect_vip(query) {
  const data = {
    activityId: query.activityId || '5001',
  }
  return request(
    `/api/rep/ugc/user/collect-vip`,
    data,
    createOption(query, 'eapi'),
  )
}


// ==================== rep_ugc_user_get ====================
export function rep_ugc_user_get(query) {
  return request(`/api/rep/ugc/user/get`, {}, createOption(query, 'eapi'))
}


// ==================== rep_ugc_user_sign ====================
export function rep_ugc_user_sign(query) {
  return request(`/api/rep/ugc/user/sign`, {}, createOption(query, 'eapi'))
}


// ==================== rep_ugc_user_vip ====================
export function rep_ugc_user_vip(query) {
  return request(`/api/rep/ugc/user/vip`, {}, createOption(query, 'eapi'))
}


// ==================== resource_like ====================
export function resource_like(query) {
  query.t = query.t == 1 ? 'like' : 'unlike'
  query.type = resourceTypeMap[query.type]
  const data = {
    threadId: query.type + query.id,
  }
  if (query.type === 'A_EV_2_') {
    data.threadId = query.threadId
  }
  return request(`/api/resource/${query.t}`, data, createOption(query, 'weapi'))
}


// ==================== sati_resource_list ====================
export function sati_resource_list(query) {
  const data = {
    tag: query.tag,
    firstQuery: false,
  }

  return request(`/api/voice/sati/resource/list`, data, createOption(query))
}


// ==================== sati_resource_list_more ====================
export function sati_resource_list_more(query) {
  const data = {
    id: query.id,
  }
  return request(
    `/api/voice/sati/resource/list/more/v1`,
    data,
    createOption(query),
  )
}


// ==================== sati_resource_sub ====================
export function sati_resource_sub(query) {
  const data = {
    id: query.id,
    cancel: query.cancel || false,
  }
  return request(`/api/voice/sati/resource/sub`, data, createOption(query))
}


// ==================== sati_resource_sub_list ====================
export function sati_resource_sub_list(query) {
  const data = {}
  return request(`/api/voice/sati/resource/sub/list`, data, createOption(query))
}


// ==================== sati_tag_list ====================
export function sati_tag_list(query) {
  const data = {}
  return request(`/api/voice/sati/tag/list`, data, createOption(query))
}


// ==================== sati_timescene_resources_get ====================
export function sati_timescene_resources_get(query) {
  const data = {
    firstQuery: false,
  }
  return request(
    `/api/voice/sati/timescene/resources/get`,
    data,
    createOption(query),
  )
}


// ==================== scrobble ====================
export async function scrobble(query) {
  // 注入 os=osx 的 cookie
  let cookie = query.cookie || ''
  if (typeof cookie === 'object') {
    cookie = Object.assign({ os: 'osx' }, cookie)
  } else if (typeof cookie === 'string') {
    if (cookie.indexOf('os=') > -1) {
      cookie = cookie.replace(/os=[^;]+/g, 'os=osx')
    } else {
      cookie = cookie + '; os=osx'
    }
  } else {
    cookie = 'os=osx'
  }
  query.cookie = cookie

  // 1) startplay → 进「最近播放」
  const startplayData = {
    logs: JSON.stringify([
      {
        action: 'startplay',
        json: {
          id: query.id,
          type: 'song',
          mainsite: '1',
          mainsiteWeb: '1',
          content: `id=${query.sourceid}`,
        },
      },
    ]),
  }

  // 2) play → 涨「听歌排行」计数
  const playData = {
    logs: JSON.stringify([
      {
        action: 'play',
        json: {
          download: 0,
          end: 'playend',
          id: query.id,
          sourceId: query.sourceid,
          time: query.time,
          type: 'song',
          wifi: 0,
          source: 'list',
          mainsite: '1',
          mainsiteWeb: '1',
          content: `id=${query.sourceid}`,
        },
      },
    ]),
  }

  const option = createOption(query, 'eapi')
  option.domain = DOMAIN

  // 发送两次请求
  const res1 = await request(`/api/feedback/weblog`, startplayData, option)
  const res2 = await request(`/api/feedback/weblog`, playData, option)

  return {
    status: 200,
    body: {
      code: 200,
      data: 'success',
      details: {
        startplay: res1.body,
        play: res2.body,
      },
    },
  }
}


// ==================== scrobble_v1 ====================
export async function scrobble_v1(query) {
  // --- 参数校验 ---
  const songId = Number(query.id)
  if (!songId || isNaN(songId)) {
    return { status: 400, body: { code: 400, msg: '缺少有效的 id (歌曲ID)' } }
  }
  const playTime = Number(query.time)
  if (isNaN(playTime) || playTime <= 0) {
    return {
      status: 400,
      body: { code: 400, msg: '缺少有效的 time (播放时长)' },
    }
  }
  const totalTime = Number(query.total) || playTime
  const sourceId = String(query.sourceid || query.sourceId || '')
  const sourceName = query.source || 'list'

  // --- 解析认证上下文 ---
  const rawCookie = query.cookie || ''
  const cookieObj = parseCookie(rawCookie)
  cookieObj.os = 'pc'
  const ctx = extractContext(cookieObj)

  // 兜底取 token
  if (!ctx.auth.token && rawCookie) {
    const parsed =
      typeof rawCookie === 'string' ? parseCookie(rawCookie) : rawCookie
    ctx.auth.token = parsed.MUSIC_U || ''
  }

  if (!ctx.auth.token) {
    return { status: 401, body: { code: 401, msg: '缺少 MUSIC_U 鉴权令牌' } }
  }

  // --- 构建歌曲和来源 ---
  const song = {
    id: songId,
    name: query.name || '',
    artist: query.artist || '',
    bitrate: Number(query.bitrate) || 320,
    level: query.level || 'exhigh',
    vip: query.vip === 'true' || query.vip === true,
    time: totalTime,
  }
  const source = {
    id: sourceId || String(songId),
    type: 'track',
    name: sourceName,
  }

  const metaJson = buildMetaJson(ctx)
  const cookieStr = buildCookieStr(ctx)

  const ts = Math.floor(Date.now() / 1000)
  const played = Math.min(playTime, totalTime)

  const plvBody = buildRecords([
    { time: ts, action: '_plv', data: buildPlv(ctx, song, source) },
  ])
  const pldBody = buildRecords([
    { time: ts, action: '_pld', data: buildPld(ctx, song, source, played) },
  ])

  try {
    // 1) 上传 PLV
    const plv = await doUpload(ctx, metaJson, plvBody, cookieStr, 'PLV')
    if (!plv.success) {
      const rateMsg =
        plv.respBody?.data?.rate != null
          ? ` (rate=${plv.respBody.data.rate})`
          : ''
      return {
        status: 200,
        body: {
          code: plv.respBody?.code || -1,
          msg: `PLV 上报失败${rateMsg}`,
          details: plv.respBody,
        },
      }
    }

    // 2) 上传 PLD
    const pld = await doUpload(ctx, metaJson, pldBody, cookieStr, 'PLD')
    if (!pld.success) {
      return {
        status: 200,
        body: {
          code: pld.respBody?.code || -1,
          msg: 'PLV 成功但 PLD 失败',
          details: { plv: plv.respBody, pld: pld.respBody },
        },
      }
    }

    return {
      status: 200,
      body: {
        code: 200,
        data: 'scrobble_v1 上报成功',
        details: {
          plv: { fileName: plv.fileName, payloadSize: plv.payload.length },
          pld: { fileName: pld.fileName, payloadSize: pld.payload.length },
        },
      },
    }
  } catch (err) {
    return {
      status: 502,
      body: { code: 502, msg: `请求异常: ${err.message || err}` },
    }
  }
}


// ==================== search ====================
export function search(query) {
  if (query.type && query.type == '2000') {
    const data = {
      keyword: query.keywords,
      scene: 'normal',
      limit: query.limit || 30,
      offset: query.offset || 0,
    }
    return request(`/api/search/voice/get`, data, createOption(query))
  }
  const data = {
    s: query.keywords,
    type: query.type || 1, // 1: 单曲, 10: 专辑, 100: 歌手, 1000: 歌单, 1002: 用户, 1004: MV, 1006: 歌词, 1009: 电台, 1014: 视频
    limit: query.limit || 30,
    offset: query.offset || 0,
  }
  return request(`/api/search/get`, data, createOption(query))
}


// ==================== search_default ====================
export function search_default(query) {
  return request(`/api/search/defaultkeyword/get`, {}, createOption(query))
}


// ==================== search_hot ====================
export function search_hot(query) {
  const data = {
    type: 1111,
  }
  return request(`/api/search/hot`, data, createOption(query))
}


// ==================== search_hot_detail ====================
export function search_hot_detail(query) {
  const data = {}
  return request(`/api/hotsearchlist/get`, data, createOption(query, 'weapi'))
}


// ==================== search_match ====================
export function search_match(query) {
  let songs = [
    {
      title: query.title || '',
      album: query.album || '',
      artist: query.artist || '',
      duration: query.duration || 0,
      persistId: query.md5,
    },
  ]
  const data = {
    songs: JSON.stringify(songs),
  }
  return request(`/api/search/match/new`, data, createOption(query))
}


// ==================== search_multimatch ====================
export function search_multimatch(query) {
  const data = {
    type: query.type || 1,
    s: query.keywords || '',
  }
  return request(
    `/api/search/suggest/multimatch`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== search_suggest ====================
export function search_suggest(query) {
  const data = {
    s: query.keywords || '',
  }
  let type = query.type == 'mobile' ? 'keyword' : 'web'
  return request(
    `/api/search/suggest/` + type,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== search_suggest_pc ====================
export function search_suggest_pc(query) {
  const data = {
    keyword: query.keyword || '',
  }
  return request(
    `/api/search/pc/suggest/keyword/get`,
    data,
    createOption(query),
  )
}


// ==================== send_album ====================
export function send_album(query) {
  const data = {
    id: query.id,
    msg: query.msg || '',
    type: 'album',
    userIds: '[' + query.user_ids + ']',
  }
  return request(`/api/msg/private/send`, data, createOption(query))
}


// ==================== send_playlist ====================
export function send_playlist(query) {
  const data = {
    id: query.playlist,
    type: 'playlist',
    msg: query.msg,
    userIds: '[' + query.user_ids + ']',
  }
  return request(`/api/msg/private/send`, data, createOption(query))
}


// ==================== send_song ====================
export function send_song(query) {
  const data = {
    id: query.id,
    msg: query.msg || '',
    type: 'song',
    userIds: '[' + query.user_ids + ']',
  }
  return request(`/api/msg/private/send`, data, createOption(query))
}


// ==================== send_text ====================
export function send_text(query) {
  const data = {
    type: 'text',
    msg: query.msg,
    userIds: '[' + query.user_ids + ']',
  }
  return request(`/api/msg/private/send`, data, createOption(query))
}


// ==================== setting ====================
export function setting(query) {
  const data = {}
  return request(`/api/user/setting`, data, createOption(query, 'weapi'))
}


// ==================== share_resource ====================
export function share_resource(query) {
  const data = {
    type: query.type || 'song', // song,playlist,mv,djprogram,djradio,noresource
    msg: query.msg || '',
    id: query.id || '',
  }
  return request(
    `/api/share/friends/resource`,
    data,
    createOption(query, 'xeapi', 'v3'),
  )
}


// ==================== sheet_list ====================
export function sheet_list(query) {
  const data = {
    id: query.id,
    abTest: query.ab || 'b',
  }
  return request(`/api/music/sheet/list/v1`, data, createOption(query))
}


// ==================== sheet_preview ====================
export function sheet_preview(query) {
  const data = {
    id: query.id,
  }
  return request(`/api/music/sheet/preview/info`, data, createOption(query))
}


// ==================== sign_happy_info ====================
export function sign_happy_info(query) {
  const data = {}
  return request(`/api/sign/happy/info`, data, createOption(query, 'weapi'))
}


// ==================== signin_progress ====================
export function signin_progress(query) {
  const data = {
    moduleId: query.moduleId || '1207signin-1207signin',
  }
  return request(
    `/api/act/modules/signin/v2/progress`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== simi_artist ====================
export function simi_artist(query) {
  const data = {
    artistid: query.id,
  }
  return request(
    `/api/discovery/simiArtist`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== simi_mv ====================
export function simi_mv(query) {
  const data = {
    mvid: query.mvid,
  }
  return request(`/api/discovery/simiMV`, data, createOption(query, 'weapi'))
}


// ==================== simi_playlist ====================
export function simi_playlist(query) {
  const data = {
    songid: query.id,
    limit: query.limit || 50,
    offset: query.offset || 0,
  }
  return request(
    `/api/discovery/simiPlaylist`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== simi_song ====================
export function simi_song(query) {
  const data = {
    songid: query.id,
    limit: query.limit || 50,
    offset: query.offset || 0,
  }
  return request(
    `/api/v1/discovery/simiSong`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== simi_user ====================
export function simi_user(query) {
  const data = {
    songid: query.id,
    limit: query.limit || 50,
    offset: query.offset || 0,
  }
  return request(`/api/discovery/simiUser`, data, createOption(query, 'weapi'))
}


// ==================== song_chorus ====================
export function song_chorus(query) {
  return request(
    `/api/song/chorus`,
    {
      ids: JSON.stringify([query.id]),
    },
    createOption(query),
  )
}


// ==================== song_cloud_download ====================
export function song_cloud_download(query) {
  const data = {
    songId: query.id,
  }
  return request(`/api/cloud/dowonload`, data, createOption(query, 'eapi'))
}


// ==================== song_copyright_rcmd ====================
export function song_copyright_rcmd(query) {
  const data = {
    songid: query.songid || query.id,
  }
  return request(`/api/song/copyright/rcmd`, data, createOption(query, 'eapi'))
}


// ==================== song_creators ====================
export function song_creators(query) {
  const data = {
    songId: query.id,
  }
  return request(`/api/song/creators`, data, createOption(query))
}


// ==================== song_detail ====================
export function song_detail(query) {
  // 歌曲数量不要超过1000
  query.ids = String(query.ids).split(/\s*,\s*/)
  const data = {
    c: '[' + query.ids.map((id) => '{"id":' + id + '}').join(',') + ']',
  }
  return request(`/api/v3/song/detail`, data, createOption(query, 'weapi'))
}


// ==================== song_downlist ====================
export function song_downlist(query) {
  const data = {
    limit: query.limit || '20',
    offset: query.offset || '0',
    total: 'true',
  }
  return request(`/api/member/song/downlist`, data, createOption(query))
}


// ==================== song_download_url ====================
export function song_download_url(query) {
  const data = {
    id: query.id,
    br: parseInt(query.br || 999000),
  }
  return request(`/api/song/enhance/download/url`, data, createOption(query))
}


// ==================== song_download_url_v1 ====================
export function song_download_url_v1(query) {
  const data = {
    id: query.id,
    immerseType: 'c51',
    level: query.level,
  }
  const options = createOption(query)
  if (query.level === 'vivid') {
    const cookie = options.cookie
    options.cookie = {
      ...(typeof cookie === 'string' ? cookieToJson(cookie) : cookie),
      os: 'android',
      appver: '9.5.61',
    }
  }
  return request(`/api/song/enhance/download/url/v1`, data, options)
}


// ==================== song_dynamic_cover ====================
export function song_dynamic_cover(query) {
  const data = {
    songId: query.id,
  }
  return request(`/api/songplay/dynamic-cover`, data, createOption(query))
}


// ==================== song_like ====================
export function song_like(query) {
  const like = query.like !== 'false'
  const data = {
    trackId: query.id,
    userid: query.uid,
    like: like,
  }
  return request(`/api/song/like`, data, createOption(query))
}


// ==================== song_like_check ====================
export function song_like_check(query) {
  const data = {
    trackIds: query.ids,
  }
  return request(`/api/song/like/check`, data, createOption(query))
}


// ==================== song_lyrics_mark ====================
export function song_lyrics_mark(query) {
  const data = {
    songId: query.id,
  }
  return request(`/api/song/play/lyrics/mark/song`, data, createOption(query))
}


// ==================== song_lyrics_mark_add ====================
export function song_lyrics_mark_add(query) {
  const data = {
    songId: query.id,
    markId: query.markId || '',
    data: query.data || '[]',
    // "[{\"translateType\":1,\"startTimeStamp\":800,\"translateLyricsText\":\"让我逃走吧、声音已经枯萎\",\"originalLyricsText\":\"逃がしてくれって声を枯らした\"},{\"translateType\":1,\"startTimeStamp\":4040,\"translateLyricsText\":\"我的愿望究竟会实现吗\",\"originalLyricsText\":\"あたしの願いなど叶うでしょうか\"}]"
  }
  return request(`/api/song/play/lyrics/mark/add`, data, createOption(query))
}


// ==================== song_lyrics_mark_del ====================
export function song_lyrics_mark_del(query) {
  const data = {
    markIds: query.id,
  }
  return request(`/api/song/play/lyrics/mark/del`, data, createOption(query))
}


// ==================== song_lyrics_mark_user_page ====================
export function song_lyrics_mark_user_page(query) {
  const data = {
    limit: query.limit || 10,
    offset: query.offset || 0,
  }
  return request(
    `/api/song/play/lyrics/mark/user/page`,
    data,
    createOption(query),
  )
}


// ==================== song_monthdownlist ====================
export function song_monthdownlist(query) {
  const data = {
    limit: query.limit || '20',
    offset: query.offset || '0',
    total: 'true',
  }
  return request(`/api/member/song/monthdownlist`, data, createOption(query))
}


// ==================== song_music_detail ====================
export function song_music_detail(query) {
  const data = {
    songId: query.id,
  }
  return request(`/api/song/music/detail/get`, data, createOption(query))
}


// ==================== song_order_update ====================
export function song_order_update(query) {
  const data = {
    pid: query.pid,
    trackIds: query.ids,
    op: 'update',
  }

  return request(`/api/playlist/manipulate/tracks`, data, createOption(query))
}


// ==================== song_purchased ====================
export function song_purchased(query) {
  const data = {
    limit: query.limit || 20,
    offset: query.offset || 0,
  }
  return request(
    `/api/single/mybought/song/list`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== song_red_count ====================
export function song_red_count(query) {
  const data = {
    songId: query.id,
  }
  return request(`/api/song/red/count`, data, createOption(query))
}


// ==================== song_simi_get ====================
export function song_simi_get(query) {
  const data = {
    positionCode: 'toolBarRcmdSong',
    resourceId: query.id,
    resourceType: 'song',
  }
  return request(
    `/api/link/position/show/resource`,
    data,
    createOption(query, 'eapi'),
  )
}


// ==================== song_singledownlist ====================
export function song_singledownlist(query) {
  const data = {
    limit: query.limit || '20',
    offset: query.offset || '0',
    total: 'true',
  }
  return request(`/api/member/song/singledownlist`, data, createOption(query))
}


// ==================== song_url ====================
export async function song_url(query) {
  const ids = String(query.id).split(',')
  const data = {
    ids: JSON.stringify(ids),
    br: parseInt(query.br || 999000),
  }
  const res = await request(
    `/api/song/enhance/player/url`,
    data,
    createOption(query),
  )
  // 根据id排序
  const result = res.body.data
  result.sort((a, b) => {
    return ids.indexOf(String(a.id)) - ids.indexOf(String(b.id))
  })
  return {
    status: 200,
    body: {
      code: 200,
      data: result,
    },
  }
}


// ==================== song_url_match ====================
export async function song_url_match(query) {
  try {
    const {
      matchID,
    } = require('@neteasecloudmusicapienhanced/unblockmusic-utils')
    const result = await matchID(query.id, query.source)
    const proxy = process.env.PROXY_URL
    logger.info('开始解灰', query.id, result)
    const useProxy = process.env.ENABLE_PROXY || 'false'
    if (result.data.url && result.data.url.includes('kuwo')) {
      result.proxyUrl =
        useProxy === 'true' ? proxy + result.data.url : result.data.url
    }
    return {
      status: 200,
      body: {
        code: 200,
        data: result.data.url,
        proxyUrl: result.proxyUrl || '',
      },
    }
  } catch (e) {
    return {
      status: 500,
      body: {
        code: 500,
        msg: e.message || 'unblock error',
        data: [],
      },
    }
  }
}


// ==================== song_url_ncmget ====================
export async function song_url_ncmget(query) {
  return { status: 200, body: { code: 200, data: [] } }
}


// ==================== song_url_v1 ====================
export async function song_url_v1(query) {
  const {
    matchID,
  } = require('@neteasecloudmusicapienhanced/unblockmusic-utils')
  require('dotenv').config()
  const data = {
    ids: '[' + query.id + ']',
    level: query.level,
    encodeType: 'flac',
  }
  const options = createOption(query, 'xeapi')
  if (query.unblock === 'true') {
    try {
      const result = await matchID(query.id, query.source)
      logger.info('Starting unblock(uses modules unblock):', query.id, result)
      const useProxy = process.env.ENABLE_PROXY || 'false'
      let proxyUrl = ''
      if (result.data.url && result.data.url.includes('kuwo')) {
        proxyUrl =
          useProxy === 'true' && process.env.PROXY_URL
            ? process.env.PROXY_URL + result.data.url
            : result.data.url
      }
      return {
        status: 200,
        body: {
          code: 200,
          msg: 'Warning: Customizing unblock sources is not supported on this endpoint. Please use `/song/url/match` instead.',
          data: [
            {
              id: Number(query.id),
              url: result.data.url,
              type: 'flac',
              level: query.level,
              freeTrialInfo: 'null',
              fee: 0,
              proxyUrl: proxyUrl || '',
            },
          ],
        },
        cookie: [],
      }
    } catch (e) {
      console.error('Error in unblocking music:', e)
    }
  }
  if (data.level == 'sky') {
    data.immerseType = query.immerseType || 'c51'
  }
  if (data.level == 'vivid') {
    data.encodeType = 'mp3'
    const cookie = options.cookie
    options.cookie = {
      ...(typeof cookie === 'string' ? cookieToJson(cookie) : cookie),
      os: 'android',
      appver: '9.5.61',
    }
  }
  return request(`/api/song/enhance/player/url/v1`, data, options)
}


// ==================== song_url_v1_302 ====================
export async function song_url_v1_302(query) {
  const data = {
    id: query.id,
    immerseType: 'c51',
    level: query.level,
  }
  const options = createOption(query)
  if (query.level === 'vivid') {
    const cookie = options.cookie
    options.cookie = {
      ...(typeof cookie === 'string' ? cookieToJson(cookie) : cookie),
      os: 'android',
      appver: '9.5.61',
    }
  }
  const response = await request(
    `/api/song/enhance/download/url/v1`,
    data,
    options,
  )
  let url = response?.body?.data?.url || response?.body?.data?.[0]?.url

  if (!url) {
    const fallbackData = {
      ids: `[${query.id}]`,
      level: query.level,
      encodeType: 'flac',
    }
    if (query.level === 'sky') {
      fallbackData.immerseType = 'c51'
    }
    if (query.level === 'vivid') {
      fallbackData.encodeType = 'mp3'
    }
    const fallback = await request(
      `/api/song/enhance/player/url/v1`,
      fallbackData,
      options,
    )
    url = fallback?.body?.data?.[0]?.url

    if (!url) {
      return fallback
    }

    return {
      status: 302,
      body: '',
      cookie: fallback.cookie || [],
      redirectUrl: url,
    }
  }

  return {
    status: 302,
    body: '',
    cookie: response.cookie || [],
    redirectUrl: url,
  }
}


// ==================== song_wiki_info ====================
export function song_wiki_info(query) {
  const extJson = {
    states: {
      playingResource: {
        current: query.id,
        scene: 'songWiki',
      },
    },
  }
  const data = {
    extJson: JSON.stringify(extJson),
    positionCode: 'songWikiMainPosition',
  }
  return request(
    `/api/link/page/parent/relation/construct/info`,
    data,
    createOption(query, 'eapi'),
  )
}


// ==================== song_wiki_summary ====================
export function song_wiki_summary(query) {
  const data = {
    songId: query.id,
  }
  return request(`/api/song/play/about/block/page`, data, createOption(query))
}


// ==================== starpick_comments_summary ====================
export function starpick_comments_summary(query) {
  const data = {
    cursor: JSON.stringify({
      offset: 0,
      blockCodeOrderList: ['HOMEPAGE_BLOCK_NEW_HOT_COMMENT'],
      refresh: true,
    }),
  }
  return request(`/api/homepage/block/page`, data, createOption(query))
}


// ==================== style_album ====================
export function style_album(query) {
  const data = {
    cursor: query.cursor || 0,
    size: query.size || 20,
    tagId: query.tagId,
    sort: query.sort || 0,
  }
  return request(
    `/api/style-tag/home/album`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== style_artist ====================
export function style_artist(query) {
  const data = {
    cursor: query.cursor || 0,
    size: query.size || 20,
    tagId: query.tagId,
    sort: 0,
  }
  return request(
    `/api/style-tag/home/artist`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== style_detail ====================
export function style_detail(query) {
  const data = {
    tagId: query.tagId,
  }
  return request(`/api/style-tag/home/head`, data, createOption(query, 'weapi'))
}


// ==================== style_list ====================
export function style_list(query) {
  const data = {}
  return request(`/api/tag/list/get`, data, createOption(query, 'weapi'))
}


// ==================== style_playlist ====================
export function style_playlist(query) {
  const data = {
    cursor: query.cursor || 0,
    size: query.size || 20,
    tagId: query.tagId,
    sort: 0,
  }
  return request(
    `/api/style-tag/home/playlist`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== style_preference ====================
export function style_preference(query) {
  const data = {}
  return request(
    `/api/tag/my/preference/get`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== style_song ====================
export function style_song(query) {
  const data = {
    cursor: query.cursor || 0,
    size: query.size || 20,
    tagId: query.tagId,
    sort: query.sort || 0,
  }
  return request(`/api/style-tag/home/song`, data, createOption(query, 'weapi'))
}


// ==================== summary_annual ====================
export function summary_annual(query) {
  const data = {}
  const key =
    ['2017', '2018', '2019'].indexOf(query.year) > -1 ? 'userdata' : 'data'
  return request(
    `/api/activity/summary/annual/${query.year}/${key}`,
    data,
    createOption(query),
  )
}


// ==================== thinktank_audit_resource_detail ====================
export function thinktank_audit_resource_detail(query) {
  const data = {
    type: query.type || '4',
  }
  return request(
    `/api/thinktank/audit/resource/detail`,
    data,
    createOption(query, 'eapi'),
  )
}


// ==================== thinktank_audit_resource_update ====================
export function thinktank_audit_resource_update(query) {
  if (!query.taskId || !query.judgement)
    return Promise.reject({
      status: 400,
      body: {
        code: 400,
        message: '参数不足',
      },
    })
  const data = {
    type: query.type || '4',
    taskId: query.taskId,
    judgement: query.judgement,
  }
  return request(
    `/api/thinktank/audit/resource/update`,
    data,
    createOption(query, 'eapi'),
  )
}


// ==================== threshold_detail_get ====================
export function threshold_detail_get(query) {
  const data = {}
  return request(
    `/api/influencer/web/apply/threshold/detail/get`,
    data,
    createOption(query),
  )
}


// ==================== top_album ====================
export function top_album(query) {
  const date = new Date()

  const data = {
    area: query.area || 'ALL', // //ALL:全部,ZH:华语,EA:欧美,KR:韩国,JP:日本
    limit: query.limit || 50,
    offset: query.offset || 0,
    type: query.type || 'new',
    year: query.year || date.getFullYear(),
    month: query.month || date.getMonth() + 1,
    total: false,
    rcmd: true,
  }
  return request(
    `/api/discovery/new/albums/area`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== top_artists ====================
export function top_artists(query) {
  const data = {
    limit: query.limit || 50,
    offset: query.offset || 0,
    total: true,
  }
  return request(`/api/artist/top`, data, createOption(query, 'weapi'))
}


// ==================== top_list ====================
export function top_list(query) {
  if (query.idx) {
    return Promise.resolve({
      status: 500,
      body: {
        code: 500,
        msg: '不支持此方式调用,只支持id调用',
      },
    })
  }

  const data = {
    id: query.id,
    n: '500',
    s: '0',
  }
  return request(`/api/playlist/v4/detail`, data, createOption(query))
}


// ==================== top_mv ====================
export function top_mv(query) {
  const data = {
    area: query.area || '',
    limit: query.limit || 30,
    offset: query.offset || 0,
    total: true,
  }
  return request(`/api/mv/toplist`, data, createOption(query, 'weapi'))
}


// ==================== top_playlist ====================
export async function top_playlist(query) {
  const data = {
    cat: query.cat || '全部', // 全部,华语,欧美,日语,韩语,粤语,小语种,流行,摇滚,民谣,电子,舞曲,说唱,轻音乐,爵士,乡村,R&B/Soul,古典,民族,英伦,金属,朋克,蓝调,雷鬼,世界音乐,拉丁,另类/独立,New Age,古风,后摇,Bossa Nova,清晨,夜晚,学习,工作,午休,下午茶,地铁,驾车,运动,旅行,散步,酒吧,怀旧,清新,浪漫,性感,伤感,治愈,放松,孤独,感动,兴奋,快乐,安静,思念,影视原声,ACG,儿童,校园,游戏,70后,80后,90后,网络歌曲,KTV,经典,翻唱,吉他,钢琴,器乐,榜单,00后
    order: query.order || 'hot', // hot,new
    limit: query.limit || 50,
    offset: query.offset || 0,
    total: true,
  }
  const res = await request(
    `/api/playlist/list`,
    data,
    createOption(query, 'weapi'),
  )
  const result = JSON.stringify(res).replace(
    /avatarImgId_str/g,
    'avatarImgIdStr',
  )
  return JSON.parse(result)
}


// ==================== top_playlist_highquality ====================
export function top_playlist_highquality(query) {
  const data = {
    cat: query.cat || '全部', // 全部,华语,欧美,韩语,日语,粤语,小语种,运动,ACG,影视原声,流行,摇滚,后摇,古风,民谣,轻音乐,电子,器乐,说唱,古典,爵士
    limit: query.limit || 50,
    lasttime: query.before || 0, // 歌单updateTime
    total: true,
  }
  return request(
    `/api/playlist/highquality/list`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== top_song ====================
export function top_song(query) {
  const data = {
    areaId: query.type || 0, // 全部:0 华语:7 欧美:96 日本:8 韩国:16
    // limit: query.limit || 100,
    // offset: query.offset || 0,
    total: true,
  }
  return request(
    `/api/v1/discovery/new/songs`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== topic_detail ====================
export function topic_detail(query) {
  const data = {
    actid: query.actid,
  }
  return request(`/api/act/detail`, data, createOption(query, 'weapi'))
}


// ==================== topic_detail_event_hot ====================
export function topic_detail_event_hot(query) {
  const data = {
    actid: query.actid,
  }
  return request(`/api/act/event/hot`, data, createOption(query, 'weapi'))
}


// ==================== topic_sublist ====================
export function topic_sublist(query) {
  const data = {
    limit: query.limit || 50,
    offset: query.offset || 0,
    total: true,
  }
  return request(`/api/topic/sublist`, data, createOption(query, 'weapi'))
}


// ==================== toplist ====================
export function toplist(query) {
  return request(`/api/toplist`, {}, createOption(query))
}


// ==================== toplist_artist ====================
export function toplist_artist(query) {
  const data = {
    type: query.type || 1,
    limit: 100,
    offset: 0,
    total: true,
  }
  return request(`/api/toplist/artist`, data, createOption(query, 'weapi'))
}


// ==================== toplist_detail ====================
export function toplist_detail(query) {
  return request(`/api/toplist/detail`, {}, createOption(query, 'weapi'))
}


// ==================== toplist_detail_v2 ====================
export function toplist_detail_v2(query) {
  return request(`/api/toplist/detail/v2`, {}, createOption(query, 'weapi'))
}


// ==================== ugc_album_get ====================
export function ugc_album_get(query) {
  const data = {
    albumId: query.id,
  }
  return request(`/api/rep/ugc/album/get`, data, createOption(query))
}


// ==================== ugc_artist_get ====================
export function ugc_artist_get(query) {
  const data = {
    artistId: query.id,
  }
  return request(`/api/rep/ugc/artist/get`, data, createOption(query))
}


// ==================== ugc_artist_search ====================
export function ugc_artist_search(query) {
  const data = {
    keyword: query.keyword,
    limit: query.limit || 40,
  }
  return request(`/api/rep/ugc/artist/search`, data, createOption(query))
}


// ==================== ugc_detail ====================
export function ugc_detail(query) {
  const data = {
    auditStatus: query.auditStatus || '',
    //待审核:0 未采纳:-5 审核中:1 部分审核通过:4 审核通过:5
    //WAIT:0 REJECT:-5 AUDITING:1 PARTLY_APPROVED:4 PASS:5
    limit: query.limit || 10,
    offset: query.offset || 0,
    order: query.order || 'desc', //asc
    sortBy: query.sortBy || 'createTime',
    type: query.type || 1,
    //曲库纠错 ARTIST:1 ALBUM:2 SONG:3 MV:4 LYRIC:5 TLYRIC:6
    //曲库补充 ALBUM:101 MV:103
  }
  return request(`/api/rep/ugc/detail`, data, createOption(query, 'weapi'))
}


// ==================== ugc_mv_get ====================
export function ugc_mv_get(query) {
  const data = {
    mvId: query.id,
  }
  return request(`/api/rep/ugc/mv/get`, data, createOption(query))
}


// ==================== ugc_song_get ====================
export function ugc_song_get(query) {
  const data = {
    songId: query.id,
  }
  return request(`/api/rep/ugc/song/get`, data, createOption(query))
}


// ==================== ugc_user_devote ====================
export function ugc_user_devote(query) {
  const data = {}
  return request(`/api/rep/ugc/user/devote`, data, createOption(query))
}


// ==================== user_account ====================
export function user_account(query) {
  const data = {}
  return request(`/api/nuser/account/get`, data, createOption(query, 'weapi'))
}


// ==================== user_audio ====================
export function user_audio(query) {
  const data = {
    userId: query.uid,
  }
  return request(`/api/djradio/get/byuser`, data, createOption(query, 'weapi'))
}


// ==================== user_binding ====================
export function user_binding(query) {
  const data = {}
  return request(
    `/api/v1/user/bindings/${query.uid}`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== user_bindingcellphone ====================
export function user_bindingcellphone(query) {
  const data = {
    phone: query.phone,
    countrycode: query.countrycode || '86',
    captcha: query.captcha,
    password: query.password ? CryptoJS.MD5(query.password).toString() : '',
  }
  return request(
    `/api/user/bindingCellphone`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== user_cloud ====================
export function user_cloud(query) {
  const data = {
    limit: query.limit || 30,
    offset: query.offset || 0,
  }
  return request(`/api/v1/cloud/get`, data, createOption(query, 'weapi'))
}


// ==================== user_cloud_del ====================
export function user_cloud_del(query) {
  const data = {
    songIds: [query.id],
  }
  return request(`/api/cloud/del`, data, createOption(query, 'weapi'))
}


// ==================== user_cloud_detail ====================
export function user_cloud_detail(query) {
  const id = query.id.replace(/\s/g, '').split(',')
  const data = {
    songIds: id,
  }
  return request(`/api/v1/cloud/get/byids`, data, createOption(query, 'weapi'))
}


// ==================== user_comment_history ====================
export function user_comment_history(query) {
  const data = {
    compose_reminder: 'true',
    compose_hot_comment: 'true',
    limit: query.limit || 10,
    user_id: query.uid,
    time: query.time || 0,
  }
  return request(
    `/api/comment/user/comment/history`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== user_detail ====================
export async function user_detail(query) {
  const res = await request(
    `/api/v1/user/detail/${query.uid}`,
    {},
    createOption(query, 'weapi'),
  )
  const result = JSON.stringify(res).replace(
    /avatarImgId_str/g,
    'avatarImgIdStr',
  )
  return JSON.parse(result)
}


// ==================== user_detail_new ====================
export async function user_detail_new(query) {
  const data = {
    all: 'true',
    userId: query.uid,
  }
  const res = await request(
    `/api/w/v1/user/detail/${query.uid}`,
    data,
    createOption(query, 'eapi'),
  )
  // const result = JSON.stringify(res).replace(
  //   /avatarImgId_str/g,
  //   "avatarImgIdStr"
  // );
  // return JSON.parse(result);
  return res
}


// ==================== user_dj ====================
export function user_dj(query) {
  const data = {
    limit: query.limit || 30,
    offset: query.offset || 0,
  }
  return request(
    `/api/dj/program/${query.uid}`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== user_event ====================
export function user_event(query) {
  const data = {
    getcounts: true,
    time: query.lasttime ?? -1,
    limit: query.limit ?? 30,
    total: false,
    fromRN: 'true',
  }
  return request(`/api/event/get/${query.uid}`, data, createOption(query))
}


// ==================== user_event_all ====================
export async function user_event_all(query) {
  const accountResult = await userAccount(query, request)
  const uid =
    accountResult.body?.account?.id || accountResult.body?.profile?.userId

  if (!uid) {
    if (
      accountResult.status !== 200 ||
      (accountResult.body?.code && accountResult.body.code !== 200)
    ) {
      return accountResult
    }

    return {
      status: 401,
      body: {
        code: 401,
        message: 'A valid login cookie is required',
      },
      cookie: accountResult.cookie || [],
    }
  }

  const cookies = [...(accountResult.cookie || [])]
  const events = []
  const eventIds = new Set()
  const cursors = new Set()
  let lasttime = -1
  let more = true
  let pageCount = 0
  let size = null

  while (more) {
    pageCount += 1

    const pageResult = await userEvent(
      {
        ...query,
        uid,
        lasttime,
        limit: PAGE_SIZE,
      },
      request,
    )

    cookies.push(...(pageResult.cookie || []))

    if (pageResult.status !== 200 || pageResult.body?.code !== 200) {
      return {
        ...pageResult,
        cookie: cookies,
      }
    }

    if (pageCount === 1) {
      const reportedSize = pageResult.body.size
      const numericSize = Number(reportedSize)
      size =
        reportedSize != null && Number.isFinite(numericSize)
          ? numericSize
          : null
    }

    for (const event of pageResult.body.events || []) {
      if (event?.id == null) {
        events.push(event)
        continue
      }

      const eventId = String(event.id)
      if (!eventIds.has(eventId)) {
        eventIds.add(eventId)
        events.push(event)
      }
    }

    more = Boolean(pageResult.body.more)
    lasttime = pageResult.body.lasttime

    if (more) {
      const cursor = String(lasttime ?? '')
      if (!cursor || cursors.has(cursor)) {
        return errorResponse(
          'Upstream event pagination cursor stalled',
          cookies,
        )
      }
      cursors.add(cursor)
    }

    if (more && pageCount >= MAX_PAGES) {
      return errorResponse(
        `Upstream event pagination exceeded ${MAX_PAGES} pages`,
        cookies,
      )
    }
  }

  const retrievedCount = events.length
  const unavailableCount =
    size == null ? null : Math.max(size - retrievedCount, 0)

  return {
    status: 200,
    body: {
      code: 200,
      events,
      size,
      retrievedCount,
      unavailableCount,
      sizeMismatch: size == null ? null : size !== retrievedCount,
      pageCount,
      more: false,
      lasttime: lasttime ?? null,
    },
    cookie: cookies,
  }
}


// ==================== user_follow_mixed ====================
export function user_follow_mixed(query) {
  const size = query.size || 30
  const cursor = query.cursor || 0
  const scene = query.scene || 0 // 0: 所有关注 1: 关注的歌手 2: 关注的用户
  const data = {
    authority: 'false',
    page: JSON.stringify({
      size: size,
      cursor: cursor,
    }),
    scene: scene,
    size: size,
    sortType: '0',
  }
  return request(
    `/api/user/follow/users/mixed/get/v2`,
    data,
    createOption(query),
  )
}


// ==================== user_followeds ====================
export function user_followeds(query) {
  const data = {
    userId: query.uid,
    time: '0',
    limit: query.limit || 20,
    offset: query.offset || 0,
    getcounts: 'true',
  }
  return request(
    `/api/user/getfolloweds/${query.uid}`,
    data,
    createOption(query),
  )
}


// ==================== user_follows ====================
export function user_follows(query) {
  const data = {
    offset: query.offset || 0,
    limit: query.limit || 30,
    order: true,
  }
  return request(
    `/api/user/getfollows/${query.uid}`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== user_level ====================
export function user_level(query) {
  const data = {}
  return request(`/api/user/level`, data, createOption(query, 'weapi'))
}


// ==================== user_medal ====================
export function user_medal(query) {
  return request(
    `/api/medal/user/page`,
    {
      uid: query.uid,
    },
    createOption(query),
  )
}


// ==================== user_mutualfollow_get ====================
export function user_mutualfollow_get(query) {
  const data = {
    friendid: query.uid,
  }
  return request(`/api/user/mutualfollow/get`, data, createOption(query))
}


// ==================== user_playlist ====================
export function user_playlist(query) {
  const data = {
    uid: query.uid,
    limit: query.limit || 30,
    offset: query.offset || 0,
    includeVideo: true,
  }
  return request(`/api/user/playlist`, data, createOption(query, 'weapi'))
}


// ==================== user_playlist_collect ====================
export function user_playlist_collect(query) {
  const data = {
    limit: query.limit || '100',
    offset: query.offset || '0',
    userId: query.uid,
    isWebview: 'true',
    includeRedHeart: 'true',
    includeTop: 'true',
  }
  return request(`/api/user/playlist/collect`, data, createOption(query))
}


// ==================== user_playlist_create ====================
export function user_playlist_create(query) {
  const data = {
    limit: query.limit || '100',
    offset: query.offset || '0',
    userId: query.uid,
    isWebview: 'true',
    includeRedHeart: 'true',
    includeTop: 'true',
  }
  return request(`/api/user/playlist/create`, data, createOption(query))
}


// ==================== user_record ====================
export function user_record(query) {
  const data = {
    uid: query.uid,
    type: query.type || 0, // 1: 最近一周, 0: 所有时间
  }
  return request(`/api/v1/play/record`, data, createOption(query, 'weapi'))
}


// ==================== user_replacephone ====================
export function user_replacephone(query) {
  const data = {
    phone: query.phone,
    captcha: query.captcha,
    oldcaptcha: query.oldcaptcha,
    countrycode: query.countrycode || '86',
  }
  return request(
    `/api/user/replaceCellphone`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== user_social_status ====================
export function user_social_status(query) {
  return request(
    `/api/social/user/status`,
    {
      visitorId: query.uid,
    },
    createOption(query),
  )
}


// ==================== user_social_status_edit ====================
export function user_social_status_edit(query) {
  return request(
    `/api/social/user/status/edit`,
    {
      content: JSON.stringify({
        type: query.type,
        iconUrl: query.iconUrl,
        content: query.content,
        actionUrl: query.actionUrl,
      }),
    },
    createOption(query),
  )
}


// ==================== user_social_status_rcmd ====================
export function user_social_status_rcmd(query) {
  return request(`/api/social/user/status/rcmd`, {}, createOption(query))
}


// ==================== user_social_status_support ====================
export function user_social_status_support(query) {
  return request(`/api/social/user/status/support`, {}, createOption(query))
}


// ==================== user_subcount ====================
export function user_subcount(query) {
  return request(`/api/subcount`, {}, createOption(query, 'weapi'))
}


// ==================== user_update ====================
export function user_update(query) {
  const data = {
    // avatarImgId: '0',
    birthday: query.birthday,
    city: query.city,
    gender: query.gender,
    nickname: query.nickname,
    province: query.province,
    signature: query.signature,
  }
  return request(`/api/user/profile/update`, data, createOption(query))
}


// ==================== verify_getQr ====================
export async function verify_getQr(query) {
  const data = {
    verifyConfigId: query.vid,
    verifyType: query.type,
    token: query.token,
    params: JSON.stringify({
      event_id: query.evid,
      sign: query.sign,
    }),
    size: 150,
  }

  const res = await request(
    `/api/frontrisk/verify/getqrcode`,
    data,
    createOption(query, 'weapi'),
  )
  const result = `https://st.music.163.com/encrypt-pages?qrCode=${
    res.body.data.qrCode
  }&verifyToken=${query.token}&verifyId=${query.vid}&verifyType=${
    query.type
  }&params=${JSON.stringify({
    event_id: query.evid,
    sign: query.sign,
  })}`
  return {
    status: 200,
    body: {
      code: 200,
      data: {
        qrCode: res.body.data.qrCode,
        qrurl: result,
        qrimg: await QRCode.toDataURL(result),
      },
    },
  }
}


// ==================== verify_qrcodestatus ====================
export async function verify_qrcodestatus(query) {
  const data = {
    qrCode: query.qr,
  }
  const res = await request(
    `/api/frontrisk/verify/qrcodestatus`,
    data,
    createOption(query, 'weapi'),
  )
  return res
}


// ==================== video_category_list ====================
export function video_category_list(query) {
  const data = {
    offset: query.offset || 0,
    total: 'true',
    limit: query.limit || 99,
  }
  return request(
    `/api/cloudvideo/category/list`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== video_detail ====================
export function video_detail(query) {
  const data = {
    id: query.id,
  }
  return request(
    `/api/cloudvideo/v1/video/detail`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== video_detail_info ====================
export function video_detail_info(query) {
  const data = {
    threadid: `R_VI_62_${query.vid}`,
    composeliked: true,
  }
  return request(
    `/api/comment/commentthread/info`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== video_group ====================
export function video_group(query) {
  const data = {
    groupId: query.id,
    offset: query.offset || 0,
    need_preview_url: 'true',
    total: true,
  }
  return request(
    `/api/videotimeline/videogroup/otherclient/get`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== video_group_list ====================
export function video_group_list(query) {
  const data = {}
  return request(
    `/api/cloudvideo/group/list`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== video_sub ====================
export function video_sub(query) {
  query.t = query.t == 1 ? 'sub' : 'unsub'
  const data = {
    id: query.id,
  }
  return request(
    `/api/cloudvideo/video/${query.t}`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== video_timeline_all ====================
export function video_timeline_all(query) {
  const data = {
    groupId: 0,
    offset: query.offset || 0,
    need_preview_url: 'true',
    total: true,
  }
  //   /api/videotimeline/otherclient/get
  return request(
    `/api/videotimeline/otherclient/get`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== video_timeline_recommend ====================
export function video_timeline_recommend(query) {
  const data = {
    offset: query.offset || 0,
    filterLives: '[]',
    withProgramInfo: 'true',
    needUrl: '1',
    resolution: '480',
  }
  return request(`/api/videotimeline/get`, data, createOption(query, 'weapi'))
}


// ==================== video_url ====================
export function video_url(query) {
  const data = {
    ids: '["' + query.id + '"]',
    resolution: query.res || 1080,
  }
  return request(`/api/cloudvideo/playurl`, data, createOption(query, 'weapi'))
}


// ==================== vip_growthpoint ====================
export function vip_growthpoint(query) {
  const data = {}
  return request(
    `/api/vipnewcenter/app/level/growhpoint/basic`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== vip_growthpoint_details ====================
export function vip_growthpoint_details(query) {
  const data = {
    limit: query.limit || 20,
    offset: query.offset || 0,
  }
  return request(
    `/api/vipnewcenter/app/level/growth/details`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== vip_growthpoint_get ====================
export function vip_growthpoint_get(query) {
  const data = {
    taskIds: query.ids,
  }
  return request(
    `/api/vipnewcenter/app/level/task/reward/get`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== vip_growthpoint_getall ====================
export function vip_growthpoint_getall(query) {
  const data = {}
  return request(
    `/api/vipnewcenter/app/level/task/reward/getall`,
    data,
    createOption(query, 'xeapi'),
  )
}


// ==================== vip_info ====================
export function vip_info(query) {
  return request(
    `/api/music-vip-membership/front/vip/info`,
    {
      userId: query.uid || '',
    },
    createOption(query, 'weapi'),
  )
}


// ==================== vip_info_v2 ====================
export function vip_info_v2(query) {
  return request(
    `/api/music-vip-membership/client/vip/info`,
    {
      userId: query.uid || '',
    },
    createOption(query, 'weapi'),
  )
}


// ==================== vip_sign ====================
export async function vip_sign(query) {
  const results = {}

  const taskSign = await request(
    '/api/vip-center-bff/task/sign',
    {},
    createOption(query, 'weapi'),
  )
  results.taskSign = taskSign.body

  const checkinDetail = await request(
    '/api/vipnewcenter/app/level/user/checkin/history/detail',
    {
      signDayTime: Date.now(),
      type: 1,
    },
    createOption(query, 'eapi'),
  )
  results.checkinDetail = checkinDetail.body

  // 两个接口都返回 code=200 即视为打卡成功
  const signed =
    Number(results.taskSign?.code) === 200 &&
    Number(results.checkinDetail?.code) === 200

  return {
    body: {
      code: 200,
      ...results,
      signed,
      message: signed ? '黑胶乐签打卡成功' : '黑胶乐签打卡失败',
    },
    cookie: taskSign.cookie,
    status: 200,
  }
}


// ==================== vip_sign_detail ====================
export function vip_sign_detail(query) {
  const data = {
    signDayTime: query.timestamp,
    type: '1',
  }
  return request(
    `/api/vipnewcenter/app/level/user/checkin/history/detail`,
    data,
    createOption(query, 'eapi'),
  )
}


// ==================== vip_sign_history ====================
export function vip_sign_history(query) {
  const data = {
    type: query.type || '0',
  }
  return request(
    `/api/vipnewcenter/app/minidesk/music/sign/pc`,
    data,
    createOption(query, 'eapi'),
  )
}


// ==================== vip_sign_info ====================
export function vip_sign_info(query) {
  const data = {}
  return request(
    `/api/vipnewcenter/app/user/sign/info`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== vip_tasks ====================
export function vip_tasks(query) {
  const data = {}
  return request(
    `/api/vipnewcenter/app/level/task/list`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== vip_tasks_v1 ====================
export function vip_tasks_v1(query) {
  const data = {
    taskType: 'app_vip_task_center',
    userId: query.id,
  }
  return request(
    `/api/middle/vip/mission/user/progress/list`,
    data,
    createOption(query, 'xeapi'),
  )
}


// ==================== vip_timemachine ====================
export function vip_timemachine(query) {
  const data = {}
  if (query.startTime && query.endTime) {
    data.startTime = query.startTime
    data.endTime = query.endTime
    data.type = 1
    data.limit = query.limit || 60
  }
  return request(
    `/api/vipmusic/newrecord/weekflow`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== voice_delete ====================
export function voice_delete(query) {
  const data = {
    ids: query.ids,
  }
  return request('/api/content/voice/delete', data, createOption(query))
}


// ==================== voice_detail ====================
export function voice_detail(query) {
  const data = {
    id: query.id,
  }
  return request(`/api/voice/workbench/voice/detail`, data, createOption(query))
}


// ==================== voice_lyric ====================
export function voice_lyric(query) {
  const data = {
    programId: query.id,
  }
  return request(`/api/voice/lyric/get`, data, createOption(query))
}


// ==================== voice_upload ====================
export async function voice_upload(query, dependencies = {}) {
  if (!query.songFile) {
    return Promise.reject({
      status: 500,
      body: {
        msg: '请上传音频文件',
        code: 500,
      },
    })
  }

  const axiosRequest = dependencies.axios || axios
  const uploadImage = dependencies.uploadPlugin || uploadPlugin
  const ext = getFileExtension(query.songFile.name)
  const filename =
    query.songName ||
    query.songFile.name
      .replace('.' + ext, '')
      .replace(/\s/g, '')
      .replace(/\./g, '_')
  const coverImgId = query.imgFile
    ? (await uploadImage(query, request)).imgId
    : query.coverImgId

  const tokenRes = await request(
    `/api/nos/token/alloc`,
    {
      bucket: 'ymusic',
      ext: ext,
      filename: filename,
      local: false,
      nos_product: 0,
      type: 'other',
    },
    createOption(query, 'weapi'),
  )

  const objectKey = tokenRes.body.result.objectKey.replace(/\//g, '%2F')
  const docId = tokenRes.body.result.docId
  const res = await axiosRequest({
    method: 'post',
    url: `https://ymusic.nos-hz.163yun.com/${objectKey}?uploads`,
    headers: {
      'x-nos-token': tokenRes.body.result.token,
      'X-Nos-Meta-Content-Type': query.songFile.mimetype || 'audio/mpeg',
    },
    data: null,
  })

  const res2 = await parser.parseStringPromise(res.data)

  const useTempFile = !!query.songFile.tempFilePath
  let fileSize = query.songFile.size

  if (useTempFile) {
    const stats = await fs.promises.stat(query.songFile.tempFilePath)
    fileSize = stats.size
  }

  const blockSize = 10 * 1024 * 1024
  let offset = 0
  let blockIndex = 1

  let etags = []

  while (offset < fileSize) {
    let chunk
    if (useTempFile) {
      chunk = await readFileChunk(
        query.songFile.tempFilePath,
        offset,
        Math.min(blockSize, fileSize - offset),
      )
    } else {
      chunk = query.songFile.data.slice(
        offset,
        Math.min(offset + blockSize, fileSize),
      )
    }

    const res3 = await axiosRequest({
      method: 'put',
      url: `https://ymusic.nos-hz.163yun.com/${objectKey}?partNumber=${blockIndex}&uploadId=${res2.InitiateMultipartUploadResult.UploadId[0]}`,
      headers: {
        'x-nos-token': tokenRes.body.result.token,
        'Content-Type': query.songFile.mimetype || 'audio/mpeg',
      },
      data: chunk,
    })
    const etag = res3.headers.etag
    etags.push(etag)
    offset += blockSize
    blockIndex++
  }

  let completeStr = '<CompleteMultipartUpload>'
  for (let i = 0; i < etags.length; i++) {
    completeStr += `<Part><PartNumber>${i + 1}</PartNumber><ETag>${
      etags[i]
    }</ETag></Part>`
  }
  completeStr += '</CompleteMultipartUpload>'

  await axiosRequest({
    method: 'post',
    url: `https://ymusic.nos-hz.163yun.com/${objectKey}?uploadId=${res2.InitiateMultipartUploadResult.UploadId[0]}`,
    headers: {
      'Content-Type': 'text/plain;charset=UTF-8',
      'X-Nos-Meta-Content-Type': query.songFile.mimetype || 'audio/mpeg',
      'x-nos-token': tokenRes.body.result.token,
    },
    data: completeStr,
  })

  const voiceData = JSON.stringify([
    {
      name: filename,
      autoPublish: query.autoPublish == 1 ? true : false,
      autoPublishText: query.autoPublishText || '',
      description: query.description,
      voiceListId: query.voiceListId,
      coverImgId,
      dfsId: docId,
      categoryId: query.categoryId,
      secondCategoryId: query.secondCategoryId,
      composedSongs: query.composedSongs ? query.composedSongs.split(',') : [],
      privacy: query.privacy == 1 ? true : false,
      publishTime: query.publishTime || 0,
      orderNo: query.orderNo || 1,
    },
  ])

  await request(
    `/api/voice/workbench/voice/batch/upload/preCheck`,
    {
      dupkey: createDupkey(),
      voiceData,
    },
    {
      ...createOption(query),
      headers: {
        'x-nos-token': tokenRes.body.result.token,
      },
    },
  )
  const result = await request(
    `/api/voice/workbench/voice/batch/upload/v2`,
    {
      dupkey: createDupkey(),
      voiceData,
    },
    {
      ...createOption(query),
      headers: {
        'x-nos-token': tokenRes.body.result.token,
      },
    },
  )
  return {
    status: 200,
    body: {
      code: 200,
      data: result.body.data,
    },
  }
}


// ==================== voicelist_detail ====================
export function voicelist_detail(query) {
  const data = {
    id: query.id,
  }
  return request(
    `/api/voice/workbench/voicelist/detail`,
    data,
    createOption(query),
  )
}


// ==================== voicelist_list ====================
export function voicelist_list(query) {
  const data = {
    limit: query.limit || '200',
    offset: query.offset || '0',
    voiceListId: query.voiceListId,
  }
  return request(
    `/api/voice/workbench/voices/by/voicelist`,
    data,
    createOption(query),
  )
}


// ==================== voicelist_list_search ====================
export function voicelist_list_search(query) {
  const data = {
    limit: query.limit || '200',
    offset: query.offset || '0',
    name: query.name || null,
    displayStatus: query.displayStatus || null,
    type: query.type || null,
    voiceFeeType: query.voiceFeeType || null,
    radioId: query.voiceListId,
  }
  return request('/api/voice/workbench/voice/list', data, createOption(query))
}


// ==================== voicelist_my_created ====================
export function voicelist_my_created(query) {
  const data = {
    limit: query.limit || 20,
  }
  return request(
    `/api/social/my/created/voicelist/v1`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== voicelist_search ====================
export function voicelist_search(query) {
  const data = {
    keyword: query.keyword || '',
    scene: 'normal',
    limit: query.limit || '10',
    offset: query.offset || '30',
    e_r: true,
  }
  return request(`/api/search/voicelist/get`, data, createOption(query))
}


// ==================== voicelist_trans ====================
export function voicelist_trans(query) {
  const data = {
    limit: query.limit || '200', // 每页数量
    offset: query.offset || '0', // 偏移量
    radioId: query.radioId || null, // 电台id
    programId: query.programId || '0', // 节目id
    position: query.position || '1', // 排序编号
  }
  return request(
    `/api/voice/workbench/radio/program/trans`,
    data,
    createOption(query),
  )
}


// ==================== weblog ====================
export function weblog(query) {
  return request(
    `/api/feedback/weblog`,
    query.data || {},
    createOption(query, 'weapi'),
  )
}


// ==================== yunbei ====================
export function yunbei(query) {
  const data = {}
  // /api/point/today/get
  return request(`/api/point/signed/get`, data, createOption(query, 'weapi'))
}


// ==================== yunbei_expense ====================
export function yunbei_expense(query) {
  const data = {
    limit: query.limit || 10,
    offset: query.offset || 0,
  }
  return request(`/api/point/expense`, data, createOption(query))
}


// ==================== yunbei_info ====================
export function yunbei_info(query) {
  const data = {}
  return request(`/api/v1/user/info`, data, createOption(query, 'weapi'))
}


// ==================== yunbei_rcmd_song ====================
export function yunbei_rcmd_song(query) {
  const data = {
    songId: query.id,
    reason: query.reason || '好歌献给你',
    scene: '',
    fromUserId: -1,
    yunbeiNum: query.yunbeiNum || 10,
  }
  return request(
    `/api/yunbei/rcmd/song/submit`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== yunbei_rcmd_song_history ====================
export function yunbei_rcmd_song_history(query) {
  const data = {
    page: JSON.stringify({
      size: query.size || 20,
      cursor: query.cursor || '',
    }),
  }
  return request(
    `/api/yunbei/rcmd/song/history/list`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== yunbei_receipt ====================
export function yunbei_receipt(query) {
  const data = {
    limit: query.limit || 10,
    offset: query.offset || 0,
  }
  return request(`/api/point/receipt`, data, createOption(query))
}


// ==================== yunbei_sign ====================
export function yunbei_sign(query) {
  const data = {}
  return request(
    `/api/pointmall/user/sign`,
    data,
    createOption(query, 'xeapi', 'v3'),
  )
}


// ==================== yunbei_task_finish ====================
export function yunbei_task_finish(query) {
  const data = {
    userTaskId: query.userTaskId,
    depositCode: query.depositCode || '0',
  }
  return request(
    `/api/usertool/task/point/receive`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== yunbei_task_finish_v1 ====================
export function yunbei_task_finish_v1(query) {
  const data = {
    yunbeiAmount: query.yunbeiAmount || 150,
  }
  return request(
    `/api/ad/power/yunbei/distribution/create`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== yunbei_task_list_v1 ====================
export function yunbei_task_list_v1(query) {
  const data = {}
  return request(
    `/api/ad/power/yunbei/distribution/list`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== yunbei_task_recommend_song ====================
export function yunbei_task_recommend_song(query) {
  const data = {
    offset: query.offset || 0,
    limit: query.limit || 10,
  }
  return request(
    `/api/ad/power/yunbei/distribution/recommend/song`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== yunbei_tasks ====================
export function yunbei_tasks(query) {
  const data = {}
  return request(
    `/api/usertool/task/list/all`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== yunbei_tasks_todo ====================
export function yunbei_tasks_todo(query) {
  const data = {}
  return request(
    `/api/usertool/task/todo/query`,
    data,
    createOption(query, 'weapi'),
  )
}


// ==================== yunbei_today ====================
export function yunbei_today(query) {
  const data = {}
  return request(`/api/point/today/get`, data, createOption(query, 'weapi'))
}

