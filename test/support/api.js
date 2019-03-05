import nock from 'nock'
import Resource from '../../src/Resource'

export const onDiscover = (url, links, { headers } = {}) =>
  nock(url, { reqheaders: headers }).get('/')
    .reply(200,
      new Resource()
        .addLinks(links)
        .toObject())

export const onGet = (url, path, resource, { headers } = {}) =>
  nock(url, { reqheaders: headers })
    .get(path)
    .reply(200, resource.toObject())

export const onPostRedirect = (url, path, body, location, { headers } = {}) =>
  nock(url, { reqheaders: headers })
    .post(path, body)
    .reply(201, undefined, {
      Location: `${url}${location}`
    })
