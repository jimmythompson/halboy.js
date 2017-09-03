import nock from 'nock'
import Resource from '../../src/Resource'

export const onDiscover = (url, links) =>
  nock(url).get('/')
    .reply(200,
      new Resource()
        .addLinks(links)
        .toObject())

export const onGet = (url, path, resource) =>
  nock(url)
    .get(path)
    .reply(200, resource.toObject())

export const onPostRedirect = (url, path, body, location) =>
  nock(url)
    .post(path, body)
    .reply(201, undefined, {
      Location: `${url}${location}`
    })
