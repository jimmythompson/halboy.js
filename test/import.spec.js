import { expect } from 'chai'
import Resource from '../src/Resource'

describe('Resource', () => {
  it('should parse links', () => {
    const resource = Resource.fromObject({
      _links: {
        self: {href: '/orders'}
      }
    })

    expect(resource).to.deep.equal(
      new Resource()
        .addLink('self', {href: '/orders'}))
  })

  it('should include all information about a link', () => {
    const resource = Resource.fromObject({
      _links: {
        'ea:find': {
          href: '/orders{?id}',
          templated: true
        }
      }
    })

    expect(resource).to.deep.equal(
      new Resource()
        .addLink('ea:find', {
          href: '/orders{?id}',
          templated: true
        }))
  })

  it('should parse arrays of links', () => {
    const resource = Resource.fromObject({
      _links: {
        'ea:admin': [
          {href: '/admins/2'},
          {href: '/admins/5'}
        ]
      }
    })

    expect(resource).to.deep.equal(
      new Resource()
        .addLink('ea:admin', [
            {href: '/admins/2'},
            {href: '/admins/5'}
          ]))
  })
})