import { expect } from 'chai'
import Resource from '../src/Resource'

describe('Resource', () => {
  it('parses links', () => {
    const resource = Resource.fromObject({
      _links: {
        self: {href: '/orders'}
      }
    })

    expect(resource).to.deep.equal(
      new Resource()
        .addLink('self', {href: '/orders'}))
  })

  it('includes all information about a link', () => {
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

  it('parses arrays of links', () => {
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

  it('parses embedded resources', () => {
    const resource = Resource.fromObject({
      _embedded: {
        'ea:order': {
          _links: {
            self: {
              href: '/orders/123'
            }
          }
        }
      }
    })

    expect(resource).to.deep.equal(
      new Resource()
        .addResource('ea:order',
          new Resource()
            .addLink('self', { href: '/orders/123' })))
  })

  it('parses doubly embedded resources', () => {
    const resource = Resource.fromObject({
      _embedded: {
        'ea:order': {
          _links: {
            self: {
              href: '/orders/123'
            }
          },
          _embedded: {
            customer: {
              _links: {
                self: {
                  href: '/customers/1'
                }
              }
            }
          }
        }
      }
    })

    const customerResource = new Resource()
      .addLink('self', { href: '/customers/1' })

    const orderResource = new Resource()
      .addLink('self', { href: '/orders/123' })
      .addResource('customer', customerResource)

    expect(resource).to.deep.equal(
      new Resource()
        .addResource('ea:order', orderResource))
  })

  it('parses arrays of embedded resources', () => {
    const resource = Resource.fromObject({
      _embedded: {
        'ea:order': [{
          _links: {
            self: {
              href: '/orders/123'
            }
          }
        }, {
          _links: {
            self: {
              href: '/orders/124'
            }
          }
        }]
      }
    })

    const firstResource = new Resource()
      .addLink('self', { href: '/orders/123' })

    const secondResource = new Resource()
      .addLink('self', { href: '/orders/124' })

    expect(resource).to.deep.equal(
      new Resource()
        .addResource('ea:order', [
          firstResource,
          secondResource
        ]))
  })

  it('parses properties', () => {
    const resource = Resource.fromObject({
      total: 20.0
    })

    expect(resource).to.deep.equal(
      new Resource()
        .addProperty('total', 20.0))
  })
})
