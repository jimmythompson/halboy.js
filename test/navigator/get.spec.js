import faker from 'faker'
import nock from 'nock'
import chai, { expect } from 'chai'
import Resource from '../../src/Resource'
import Navigator from '../../src/Navigator'
import * as api from '../support/api'
import chaiAsPromised from 'chai-as-promised'

chai.use(chaiAsPromised)

const baseUrl = faker.internet.url()

const createUser = ({id, name}) =>
  new Resource()
    .addLink('self', `/users/${id}`)
    .addProperty('name', name)

describe('Navigator', () => {
  beforeEach(() => {
    nock.cleanAll()
  })

  it('navigates through links in an API', async () => {
    api.onDiscover(baseUrl, {
      users: {href: '/users{?admin}', templated: true}
    })

    api.onGet(baseUrl, '/users',
      new Resource()
        .addResource('users', [
          createUser({id: 'fred', name: 'Fred'}),
          createUser({id: 'sue', name: 'Sue'}),
          createUser({id: 'mary', name: 'Mary'})
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

  it('navigates through links with query params', async () => {
    api.onDiscover(baseUrl, {
      users: {href: '/users{?admin}', templated: true}
    })

    nock(baseUrl)
      .get('/users')
      .query({admin: 'true'})
      .reply(200,
        new Resource()
          .addResource('users', [
            createUser({id: 'fred', name: 'Fred'}),
            createUser({id: 'sue', name: 'Sue'}),
            createUser({id: 'mary', name: 'Mary'})
          ])
          .toObject())

    const discoveryResult = await Navigator.discover(baseUrl)
    const result = await discoveryResult.get('users', {admin: 'true'})

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

  it('navigates with a mixture of template and query params', async () => {
    api.onDiscover(baseUrl, {
      friends: {href: '/users/{id}/friends{?mutual}', templated: true}
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

  it('navigates with multiple templated query parameters', async () => {
    api.onDiscover(baseUrl, {
      users: {href: '/users{?admin,sort}', templated: true}
    })

    nock(baseUrl)
      .get('/users')
      .query({admin: 'true', sort: 'id'})
      .reply(200,
        new Resource()
          .addResource('users', [
            createUser({id: 'fred', name: 'Fred'}),
            createUser({id: 'sue', name: 'Sue'}),
            createUser({id: 'mary', name: 'Mary'})
          ])
          .toObject())

    const discoveryResult = await Navigator.discover(baseUrl)
    const result = await discoveryResult
      .get('users', {admin: 'true', sort: 'id'})

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

  it('navigates with templated list query parameters', async () => {
    api.onDiscover(baseUrl, {
      users: {href: '/users{?ids*}', templated: true}
    })

    nock(baseUrl)
      .get('/users')
      .query({ids: ['123', '456']})
      .reply(200,
        new Resource()
          .addResource('users', [
            createUser({id: 'fred', name: 'Fred'}),
            createUser({id: 'sue', name: 'Sue'}),
            createUser({id: 'mary', name: 'Mary'})
          ])
          .toObject())

    const discoveryResult = await Navigator.discover(baseUrl)
    const result = await discoveryResult
      .get('users', {ids: [123, 456]})

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

  it('retains superfluous parameters after templating as query parameters',
    async () => {
      api.onDiscover(baseUrl, {
        friends: {href: '/users/{id}/friends{?mutual}', templated: true}
      })

      nock(baseUrl)
        .get('/users/thomas/friends')
        .query({mutual: 'true', mostRecentlyContactedFirst: 'true'})
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
        mutual: 'true',
        mostRecentlyContactedFirst: 'true'
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

  it('adds header options for navigation', async () => {
    api.onDiscover(baseUrl, {
      users: {href: '/users{?admin}', templated: true}
    })

    const headers = {
      authorization: 'some-token'
    }

    api.onGet(baseUrl, '/users',
      new Resource()
        .addResource('users', [
          createUser({id: 'fred', name: 'Fred'}),
          createUser({id: 'sue', name: 'Sue'}),
          createUser({id: 'mary', name: 'Mary'})
        ]), {headers})

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

  it('resumes navigation using a stored Resource', async () => {
    api.onGet(baseUrl, '/users',
      new Resource()
        .addResource('users', [
          createUser({id: 'fred', name: 'Fred'}),
          createUser({id: 'sue', name: 'Sue'}),
          createUser({id: 'mary', name: 'Mary'})
        ]))

    const discoveryResource = new Resource()
      .addLinks({
        self: {href: '/'},
        users: {href: '/users{?admin}', templated: true}
      })

    const result = await Navigator.resume(baseUrl, discoveryResource).get('users')

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

  it('throws an exception when trying to get a link that does not exist', async () => {
    api.onDiscover(baseUrl, {})

    return expect(
      Navigator.discover(baseUrl)
        .then(result => result.get('users'))
      ).to.eventually.be.rejectedWith(
        Error,
        'Attempting to follow the link \'users\', which does not exist'
      )
  })
})
