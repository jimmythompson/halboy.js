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

    nock(baseUrl)
      .post('/users', {
        name: 'Thomas'
      })
      .reply(201, undefined, {
        Location: `${baseUrl}/users/thomas`
      })

    nock(baseUrl)
      .get('/users/thomas')
      .reply(200,
        new Resource()
          .addProperty('name', 'Thomas')
          .toObject())

    const discoveryResult = await Navigator.discover(baseUrl)
    const result = await discoveryResult.post('users', {
      name: 'Thomas'
    })

    expect(result.status()).to.equal(200)

    expect(result.resource().getProperty('name'))
      .to.deep.equal('Thomas')
  })
})
