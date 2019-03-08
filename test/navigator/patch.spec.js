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

  it('updates resources in an API', async () => {
    api.onDiscover(baseUrl, {}, {
      users: {href: '/users'}
    })

    api.onPatchRedirect(baseUrl, '/users', {
      name: 'Thomas'
    }, `${baseUrl}/users/thomas`)

    api.onGet(baseUrl, '/users/thomas',
      new Resource()
        .addProperty('name', 'Thomas'))

    const discoveryResult = await Navigator.discover(baseUrl)
    const result = await discoveryResult.patch('users', {
      name: 'Thomas'
    })

    expect(result.status()).to.equal(200)

    expect(result.resource().getProperty('name'))
      .to.deep.equal('Thomas')
  })

  it('uses template params when updating resources', async () => {
    api.onDiscover(baseUrl, {}, {
      useritems: {href: '/users/{id}/items', templated: true}
    })

    api.onPatchRedirect(baseUrl, '/users/thomas/items', {
      name: 'Sponge'
    }, `${baseUrl}/users/thomas/items/1`)

    api.onGet(baseUrl, '/users/thomas/items/1',
      new Resource()
        .addProperty('name', 'Sponge'))

    const discoveryResult = await Navigator.discover(baseUrl)
    const result = await discoveryResult.patch('useritems', {
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
      users: {href: '/users'}
    })

    api.onPatchRedirect(baseUrl, '/users', {
      name: 'Thomas'
    }, `/users/thomas`)

    api.onGet(baseUrl, '/users/thomas',
      new Resource()
        .addProperty('name', 'Thomas'))

    const discoveryResult = await Navigator.discover(baseUrl)
    const result = await discoveryResult.patch('users', {
      name: 'Thomas'
    })

    expect(result.status()).to.equal(200)

    expect(result.resource().getProperty('name'))
      .to.deep.equal('Thomas')
  })

  it('uses same configuration as provided on patch when following redirect',
    async () => {
      api.onDiscover(baseUrl, {}, {
        users: {href: '/users'}
      })

      api.onPatchRedirect(baseUrl, '/users', {
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
      const result = await discoveryResult.patch('users', {
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

  it('does not follow location headers when the status is not 204', async () => {
    api.onDiscover(baseUrl, {}, {
      users: {href: '/users{?admin}', templated: true}
    })

    nock(baseUrl)
      .patch('/users', {name: 'Thomas'})
      .reply(400)

    const discoveryResult = await Navigator.discover(baseUrl)
    const result = await discoveryResult.patch('users', {
      name: 'Thomas'
    })

    expect(result.status()).to.equal(400)
  })

  it('does not follow location headers when the options say not to', async () => {
    api.onDiscover(baseUrl, {}, {
      users: {href: '/users'}
    })

    api.onPatchRedirect(baseUrl, '/users', {
      name: 'Thomas'
    }, `${baseUrl}/users/thomas`)

    const discoveryResult = await Navigator.discover(baseUrl, {followRedirects: false})
    const result = await discoveryResult.patch('users', {
      name: 'Thomas'
    })

    expect(result.status()).to.equal(204)

    expect(result.getHeader('location'))
      .to.deep.equal(`${baseUrl}/users/thomas`)
  })

  it('continues the conversation even if we do not follow redirects', async () => {
    api.onDiscover(baseUrl, {}, {
      users: {href: '/users'}
    })

    api.onPatchRedirect(baseUrl, '/users', {
      name: 'Thomas'
    }, `${baseUrl}/users/thomas`)

    api.onGet(baseUrl, '/users/thomas',
      new Resource()
        .addProperty('name', 'Thomas'))

    const discoveryResult = await Navigator.discover(baseUrl, {followRedirects: false})
    const patchResult = await discoveryResult.patch('users', {
      name: 'Thomas'
    })
    const result = await patchResult.followRedirect()

    expect(result.status()).to.equal(200)

    expect(result.resource().getProperty('name'))
      .to.deep.equal('Thomas')
  })

  it('adds header options for navigation', async () => {
    api.onDiscover(baseUrl, {}, {
      users: {href: '/users'}
    })

    const headers = {
      authorization: 'some-token'
    }

    api.onPatchRedirect(baseUrl, '/users',
      {name: 'Thomas'},
      `${baseUrl}/users/thomas`,
      {headers})

    api.onGet(baseUrl, '/users/thomas',
      new Resource()
        .addProperty('name', 'Thomas'))

    const discoveryResult = await Navigator.discover(baseUrl)
    const result = await discoveryResult.patch('users', {
      name: 'Thomas'
    }, {}, {headers})

    expect(result.status()).to.equal(200)

    expect(result.resource().getProperty('name'))
      .to.deep.equal('Thomas')
  })
})
