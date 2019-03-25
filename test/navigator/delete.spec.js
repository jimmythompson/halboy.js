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

  it('deletes resources in an API', async () => {
    api.onDiscover(baseUrl, {}, {
      user: {href: '/users/thomas'}
    })

    api.onDelete(baseUrl, '/users/thomas', {
      permanent: true
    })

    const discoveryResult = await Navigator.discover(baseUrl)
    const result = await discoveryResult.delete('user', {
      permanent: true
    })

    expect(result.status()).to.equal(204)
  })

  it('uses template params when creating resources', async () => {
    api.onDiscover(baseUrl, {}, {
      user: {href: '/users/{id}', templated: true}
    })

    api.onDelete(baseUrl, '/users/thomas', {
      permanent: true
    })

    const discoveryResult = await Navigator.discover(baseUrl)
    const result = await discoveryResult.delete('user', {
      permanent: true
    }, {
      id: 'thomas'
    })

    expect(result.status()).to.equal(204)
  })

  it('adds header options for navigation', async () => {
    api.onDiscover(baseUrl, {}, {
      user: {href: '/users/thomas'}
    })

    const headers = {
      authorization: 'some-token'
    }

    api.onDelete(baseUrl, '/users/thomas',
      {permanent: true},
      {headers})

    api.onGet(baseUrl, '/users/thomas',
      new Resource()
        .addProperty('name', 'Thomas'))

    const discoveryResult = await Navigator.discover(baseUrl)
    const result = await discoveryResult.delete('user', {
      permanent: true
    }, {}, {headers})

    expect(result.status()).to.equal(204)
  })
})
