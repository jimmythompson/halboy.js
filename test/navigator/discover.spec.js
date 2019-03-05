import faker from 'faker'
import nock from 'nock'
import chai, { expect } from 'chai'
import Navigator from '../../src/Navigator'
import * as api from '../support/api'
import chaiAsPromised from 'chai-as-promised'

chai.use(chaiAsPromised)

const baseUrl = faker.internet.url()

describe('Navigator', () => {
  beforeEach(() => {
    nock.cleanAll()
  })

  it('passes config on discover', async () => {
    const headers = {
      authorization: 'some-token'
    }

    const href = '/users{?admin}'

    api.onDiscover(baseUrl, {headers}, {
      users: {href}
    })

    const discoveryResult = await Navigator.discover(baseUrl, {
      http: {headers}
    })

    expect(discoveryResult.status()).to.equal(200)

    const usersLink = discoveryResult
      .resource()
      .getHref('users')

    expect(usersLink).to.equal(href)
  })
})
