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

  it('should be able to create resources in an API', async () => {
    api.onDiscover(baseUrl, {
      users: { href: '/users' }
    })

    api.onPostRedirect(baseUrl, '/users', {
      name: 'Thomas'
    }, '/users/thomas')

    api.onGet(baseUrl, '/users/thomas',
      new Resource()
        .addProperty('name', 'Thomas'))

    const discoveryResult = await Navigator.discover(baseUrl)
    const result = await discoveryResult.post('users', {
      name: 'Thomas'
    })

    expect(result.status()).to.equal(200)

    expect(result.resource().getProperty('name'))
      .to.deep.equal('Thomas')
  })

  it('should be able to use template params when creating resources', async () => {
    api.onDiscover(baseUrl, {
      useritems: { href: '/users/{id}/items', templated: true }
    })

    api.onPostRedirect(baseUrl, '/users/thomas/items', {
      name: 'Sponge'
    }, '/users/thomas/items/1')

    api.onGet(baseUrl, '/users/thomas/items/1',
      new Resource()
        .addProperty('name', 'Sponge'))

    const discoveryResult = await Navigator.discover(baseUrl)
    const result = await discoveryResult.post('useritems', {
      name: 'Sponge'
    }, {
      id: 'thomas'
    })

    expect(result.status()).to.equal(200)

    expect(result.resource().getProperty('name'))
      .to.deep.equal('Sponge')
  })

  it('should not follow location headers when the status is not 201', async () => {
    api.onDiscover(baseUrl, {
      users: { href: '/users{?admin}', templated: true }
    })

    nock(baseUrl)
      .post('/users', { name: 'Thomas' })
      .reply(400)

    const discoveryResult = await Navigator.discover(baseUrl)
    const result = await discoveryResult.post('users', {
      name: 'Thomas'
    })

    expect(result.status()).to.equal(400)
  })

  it('should not follow location headers when the options say not to', async () => {
    api.onDiscover(baseUrl, {
      users: { href: '/users' }
    })

    api.onPostRedirect(baseUrl, '/users', {
      name: 'Thomas'
    }, '/users/thomas')

    const discoveryResult = await Navigator.discover(baseUrl, { followRedirects: false })
    const result = await discoveryResult.post('users', {
      name: 'Thomas'
    })

    expect(result.status()).to.equal(201)

    expect(result.getHeader('location'))
      .to.deep.equal(`${baseUrl}/users/thomas`)
  })

  it('should be able to continue the conversation even if we do not follow redirects', async () => {
    api.onDiscover(baseUrl, {
      users: { href: '/users' }
    })

    api.onPostRedirect(baseUrl, '/users', {
      name: 'Thomas'
    }, '/users/thomas')

    api.onGet(baseUrl, '/users/thomas',
      new Resource()
        .addProperty('name', 'Thomas'))

    const discoveryResult = await Navigator.discover(baseUrl, { followRedirects: false })
    const postResult = await discoveryResult.post('users', {
      name: 'Thomas'
    })
    const result = await postResult.followRedirect()

    expect(result.status()).to.equal(200)

    expect(result.resource().getProperty('name'))
      .to.deep.equal('Thomas')
  })

  it('should be able to add header options for navigation', async () => {
    api.onDiscover(baseUrl, {
      users: { href: '/users' }
    })

    const headers = {
      authorization: 'some-token'
    }

    api.onPostRedirect(baseUrl, '/users',
      { name: 'Thomas' },
      '/users/thomas',
      headers)

    api.onGet(baseUrl, '/users/thomas',
      new Resource()
        .addProperty('name', 'Thomas'))

    const discoveryResult = await Navigator.discover(baseUrl)
    const result = await discoveryResult.post('users', {
      name: 'Thomas'
    }, {}, {headers})

    expect(result.status()).to.equal(200)

    expect(result.resource().getProperty('name'))
      .to.deep.equal('Thomas')
  })
})
