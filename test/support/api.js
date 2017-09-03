import nock from 'nock'
import Resource from '../../src/Resource'

export const onDiscover = (url, links) =>
  nock(url).get('/')
    .reply(200,
      new Resource()
        .addLinks(links)
        .toObject())
