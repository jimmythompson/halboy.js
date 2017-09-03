import faker from 'faker'
import nock from 'nock'
import { expect } from 'chai'
import Resource from '../src/Resource'
import Navigator from '../src/Navigator'

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
    nock(baseUrl).get('/')
      .reply(200,
        new Resource()
          .addLink('users', { href: '/users{?admin}', templated: true })
          .toObject())

    nock(baseUrl).get('/users')
      .reply(200,
        new Resource()
          .addResource('users', [
            createUser({ id: 'fred', name: 'Fred' }),
            createUser({ id: 'sue', name: 'Sue' }),
            createUser({ id: 'mary', name: 'Mary' })
          ])
          .toObject())

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
})