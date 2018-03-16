import faker from 'faker'
import nock from 'nock'
import { expect } from 'chai'
import Resource from '../../src/Resource'
import Navigator from '../../src/Navigator'
import * as api from '../support/api'

const baseUrl = faker.internet.url()

const createUser = ({ id, name }) =>
  new Resource()
    .addLink('self', `/users/${id}`)
    .addProperty('name', name)

describe('Navigator', () => {
  beforeEach(() => {
    nock.cleanAll()
  })

  it('should be able to navigate through links in an API', async () => {
    api.onDiscover(baseUrl, {
      users: { href: '/users{?admin}', templated: true }
    })

    api.onGet(baseUrl, '/users',
      new Resource()
        .addResource('users', [
          createUser({ id: 'fred', name: 'Fred' }),
          createUser({ id: 'sue', name: 'Sue' }),
          createUser({ id: 'mary', name: 'Mary' })
        ]))

    const discoveryResult = await Navigator.discover(baseUrl)
    const result = await discoveryResult.get('users')

    expect(result.status()).to.equal(200)

    const users = result
      .resource()
      .getResource('users')

    const names = users.map((user) =>
      user.getProperty('name'))

    expect(names).to.deep.equal([
      'Fred',
      'Sue',
      'Mary'
    ])
  })

  it('should be able to navigate through links with query params', async () => {
    api.onDiscover(baseUrl, {
      users: { href: '/users{?admin}', templated: true }
    })

    nock(baseUrl)
      .get('/users')
      .query({ admin: 'true' })
      .reply(200,
        new Resource()
          .addResource('users', [
            createUser({ id: 'fred', name: 'Fred' }),
            createUser({ id: 'sue', name: 'Sue' }),
            createUser({ id: 'mary', name: 'Mary' })
          ])
          .toObject())

    const discoveryResult = await Navigator.discover(baseUrl)
    const result = await discoveryResult.get('users', { admin: 'true' })

    expect(result.status()).to.equal(200)

    const users = result
      .resource()
      .getResource('users')

    const names = users.map((user) =>
      user.getProperty('name'))

    expect(names).to.deep.equal([
      'Fred',
      'Sue',
      'Mary'
    ])
  })

  it('should be able to navigate with a mixture of template and query params', async () => {
    api.onDiscover(baseUrl, {
      friends: { href: '/users/{id}/friends{?mutual}', templated: true }
    })

    nock(baseUrl)
      .get('/users/thomas/friends')
      .query({mutual: 'true'})
      .reply(200,
        new Resource()
          .addResource('users', [
            createUser({id: 'fred', name: 'Fred'}),
            createUser({id: 'sue', name: 'Sue'}),
            createUser({id: 'mary', name: 'Mary'})
          ])
          .toObject())

    const discoveryResult = await Navigator.discover(baseUrl)
    const result = await discoveryResult.get('friends', {
      id: 'thomas',
      mutual: 'true'
    })

    expect(result.status()).to.equal(200)

    const users = result
      .resource()
      .getResource('users')

    const names = users.map((user) =>
      user.getProperty('name'))

    expect(names).to.deep.equal([
      'Fred',
      'Sue',
      'Mary'
    ])
  })

  it('should be able to add header options for navigation', async () => {
    api.onDiscover(baseUrl, {
      users: { href: '/users{?admin}', templated: true }
    })

    const headers = {
      authorization: 'some-token'
    }

    api.onGet(baseUrl, '/users',
      new Resource()
        .addResource('users', [
          createUser({ id: 'fred', name: 'Fred' }),
          createUser({ id: 'sue', name: 'Sue' }),
          createUser({ id: 'mary', name: 'Mary' })
        ]), headers)

    const discoveryResult = await Navigator.discover(baseUrl)
    const result = await discoveryResult.get('users', {}, {headers})

    expect(result.status()).to.equal(200)

    const users = result
      .resource()
      .getResource('users')

    const names = users.map((user) =>
      user.getProperty('name'))

    expect(names).to.deep.equal([
      'Fred',
      'Sue',
      'Mary'
    ])
  })
})
