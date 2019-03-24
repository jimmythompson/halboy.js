import faker from 'faker'
import nock from 'nock'
import { expect } from 'chai'
import Resource from '../../src/Resource'
import Navigator from '../../src/Navigator'
import * as api from '../support/api'

const baseUrl = faker.internet.url()

describe('Navigator', () => {
  beforeEach(() => {
    nock.cleanAll()
  })

  it('replaces resources in an API', async () => {
    api.onDiscover(baseUrl, {}, {
      user: {href: '/users/thomas'}
    })

    api.onPutToReplace(baseUrl, '/users/thomas', {
      name: 'Thomas'
    })

    const discoveryResult = await Navigator.discover(baseUrl)
    const result = await discoveryResult.put('user', {
      name: 'Thomas'
    })

    expect(result.status()).to.equal(200)

    expect(result.resource().getProperty('name'))
      .to.deep.equal('Thomas')
  })

  it('uses template params when creating resources', async () => {
    api.onDiscover(baseUrl, {}, {
      user: {href: '/users/{id}', templated: true}
    })

    api.onPutToReplace(baseUrl, '/users/thomas', {
      name: 'Sponge'
    })

    const discoveryResult = await Navigator.discover(baseUrl)
    const result = await discoveryResult.put('user', {
      name: 'Sponge'
    }, {
      id: 'thomas'
    })

    expect(result.status()).to.equal(200)

    expect(result.resource().getProperty('name'))
      .to.deep.equal('Sponge')
  })

  it('uses absolute url when location is relative', async () => {
    api.onDiscover(baseUrl, {}, {
      user: {href: '/users/thomas'}
    })

    api.onPutToReplace(baseUrl, '/users/thomas', {
      name: 'Thomas'
    })

    const discoveryResult = await Navigator.discover(baseUrl)
    const result = await discoveryResult.put('user', {
      name: 'Thomas'
    })

    expect(result.status()).to.equal(200)

    expect(result.resource().getProperty('name'))
      .to.deep.equal('Thomas')
  })

  it('uses same configuration as provided on put when following redirect',
    async () => {
      api.onDiscover(baseUrl, {}, {
        user: {href: '/users/thomas'}
      })

      api.onPutToCreate(baseUrl, '/users/thomas', {
        name: 'Thomas'
      },
      `${baseUrl}/users/thomas`, {
        headers: { authorization: 'Bearer 1a2b3c4d' }
      })

      api.onGet(baseUrl, '/users/thomas',
        new Resource().addProperty('name', 'Thomas'), {
          headers: { authorization: 'Bearer 1a2b3c4d' }
        })

      const discoveryResult = await Navigator.discover(baseUrl)
      const result = await discoveryResult.put('user', {
        name: 'Thomas'
      }, {}, {
        headers: {
          authorization: 'Bearer 1a2b3c4d'
        }
      })

      expect(result.status()).to.equal(200)

      expect(result.resource().getProperty('name'))
        .to.deep.equal('Thomas')
    })

  it('does not follow location headers when the status is not 201', async () => {
    api.onDiscover(baseUrl, {}, {
      user: {href: '/users/thomas', templated: true}
    })

    nock(baseUrl)
      .put('/users/thomas', {name: 'Thomas'})
      .reply(400)

    const discoveryResult = await Navigator.discover(baseUrl)
    const result = await discoveryResult.put('user', {
      name: 'Thomas'
    })

    expect(result.status()).to.equal(400)
  })

  it('does not follow location headers when the options say not to', async () => {
    api.onDiscover(baseUrl, {}, {
      user: {href: '/users/thomas'}
    })

    api.onPutToCreate(baseUrl, '/users/thomas', {
      name: 'Thomas'
    }, `${baseUrl}/users/thomas`)

    const discoveryResult =
      await Navigator.discover(baseUrl, {followRedirects: false})
    const result = await discoveryResult.put('user', {
      name: 'Thomas'
    })

    expect(result.status()).to.equal(201)

    expect(result.getHeader('location'))
      .to.deep.equal(`${baseUrl}/users/thomas`)
  })

  it('continues the conversation even if we do not follow redirects', async () => {
    api.onDiscover(baseUrl, {}, {
      user: {href: '/users/thomas'}
    })

    api.onPutToCreate(baseUrl, '/users/thomas', {
      name: 'Thomas'
    }, `${baseUrl}/users/thomas`)

    api.onGet(baseUrl, '/users/thomas',
      new Resource()
        .addProperty('name', 'Thomas'))

    const discoveryResult =
      await Navigator.discover(baseUrl, {followRedirects: false})
    const putResult = await discoveryResult.put('user', {
      name: 'Thomas'
    })
    const result = await putResult.followRedirect()

    expect(result.status()).to.equal(200)

    expect(result.resource().getProperty('name'))
      .to.deep.equal('Thomas')
  })

  it('adds header options for navigation', async () => {
    api.onDiscover(baseUrl, {}, {
      user: {href: '/users/thomas'}
    })

    const headers = {
      authorization: 'some-token'
    }

    api.onPutToCreate(baseUrl, '/users/thomas',
      {name: 'Thomas'},
      `${baseUrl}/users/thomas`,
      {headers})

    api.onGet(baseUrl, '/users/thomas',
      new Resource()
        .addProperty('name', 'Thomas'))

    const discoveryResult = await Navigator.discover(baseUrl)
    const result = await discoveryResult.put('user', {
      name: 'Thomas'
    }, {}, {headers})

    expect(result.status()).to.equal(200)

    expect(result.resource().getProperty('name'))
      .to.deep.equal('Thomas')
  })
})
