import { createRequest } from './util/request.js';
export function search(params) {
  const dataMap = {
    // token: '',
    albumhide: 0,
    iscorrection: 1,
    keyword: params?.keywords || '',
    nocollect: 0,
    page: params?.page || 1,
    pagesize: params?.pagesize || 30,
    platform: 'AndroidFilter',
  };


  const type = ['special', 'lyric', 'song', 'album', 'author', 'mv'].includes(params.type) ? params.type : 'song';

  return createRequest({
    url: `/${type === 'song' ? 'v3' : 'v1'}/search/${type}`,
    method: 'GET',
    params: dataMap,
    encryptType: 'android',
    headers: { 'x-router': 'complexsearch.kugou.com' },
    cookie: params?.cookie || {},
  });
};
