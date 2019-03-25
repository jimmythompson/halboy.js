import nock from 'nock'
import Resource from '../../src/Resource'

export const onDiscover = (url, { headers } = {}, links = {}) =>
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
      Location: location
    })

export const onPutToReplace = (url, path, body, { headers } = {}) =>
  nock(url, { reqheaders: headers })
    .put(path, body)
    .reply(200, body)

export const onPutToCreate = (url, path, body, location, { headers } = {}) =>
  nock(url, { reqheaders: headers })
    .put(path, body)
    .reply(201, undefined, {
      Location: location
    })

export const onPatchRedirect = (url, path, body, location, { headers } = {}) =>
  nock(url, { reqheaders: headers })
    .patch(path, body)
    .reply(204, undefined, {
      Location: location
    })

export const onDelete = (url, path, body, { headers } = {}) =>
  nock(url, { reqheaders: headers })
    .delete(path, body)
    .reply(204)
