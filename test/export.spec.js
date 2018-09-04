import { expect } from 'chai'
import Resource from '../src/Resource'

describe('Resource', () => {
  it('exports to an object', () => {
    const firstEmbeddedResource =
      new Resource()
        .addLinks({
          self: { href: '/orders/123' },
          'ea:basket': { href: '/baskets/98712' },
          'ea:customer': { href: '/customers/7809' }
        })
        .addProperties({
          total: 30.0,
          currency: 'USD',
          status: 'shipped'
        })

    const secondEmbeddedResource =
      new Resource()
        .addLinks({
          self: { href: '/orders/124' },
          'ea:basket': { href: '/baskets/97213' },
          'ea:customer': { href: '/customers/12369' }
        })
        .addProperties({
          total: 20.0,
          currency: 'USD',
          status: 'processing'
        })

    const resource =
      new Resource()
        .addLinks({
          self: { href: '/orders' },
          curies: {
            name: 'ea',
            href: 'http://example.com/docs/rels/{rel}',
            templated: true
          },
          next: { href: '/orders?page=2' },
          'ea:find': {
            href: '/orders{?id}',
            templated: true
          },
          'ea:admin': [
            { href: '/admins/2', title: 'Fred' },
            { href: '/admins/5', title: 'Kate' }
          ]
        })
        .addResource('ea:order', [
          firstEmbeddedResource,
          secondEmbeddedResource
        ])
        .addProperties({
          currentlyProcessing: 14,
          shippedToday: 20
        })

    expect(resource.toObject()).to.deep.equal({
      _links: {
        self: {
          href: '/orders'
        },
        curies: {
          name: 'ea',
          href: 'http://example.com/docs/rels/{rel}',
          templated: true
        },
        next: {
          href: '/orders?page=2'
        },
        'ea:find': {
          href: '/orders{?id}',
          templated: true
        },
        'ea:admin': [
          {
            href: '/admins/2',
            title: 'Fred'
          },
          {
            href: '/admins/5',
            'title': 'Kate'
          }
        ]
      },
      _embedded: {
        'ea:order': [
          {
            _links: {
              self: {
                href: '/orders/123'
              },
              'ea:basket': {
                href: '/baskets/98712'
              },
              'ea:customer': {
                href: '/customers/7809'
              }
            },
            total: 30.0,
            currency: 'USD',
            status: 'shipped'
          },
          {
            '_links': {
              self: {
                href: '/orders/124'
              },
              'ea:basket': {
                href: '/baskets/97213'
              },
              'ea:customer': {
                href: '/customers/12369'
              }
            },
            total: 20.0,
            currency: 'USD',
            status: 'processing'
          }
        ]
      },
      currentlyProcessing: 14,
      shippedToday: 20
    })
  })

  it('renders doubly embedded resources', () => {
    const purchaserResource =
      new Resource()
        .addLink('self', { href: '/customers/1' })

    const orderResource =
      new Resource()
        .addResource('customer', purchaserResource)
        .addLink('self', { href: '/orders/123' })

    const resource =
      new Resource()
        .addResource('ea:order', orderResource)

    expect(resource.toObject()).to.deep.equal({
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
  })

  it('preserves objects that are not Resources', () => {
    const purchaserResource = {
      name: 'Sue'
    }

    const orderResource =
      new Resource()
        .addResource('customer', purchaserResource)
        .addLink('self', { href: '/orders/123' })

    const resource =
      new Resource()
        .addResource('ea:order', orderResource)

    expect(resource.toObject()).to.deep.equal({
      _embedded: {
        'ea:order': {
          _links: {
            self: {
              href: '/orders/123'
            }
          },
          _embedded: {
            customer: {
              name: 'Sue'
            }
          }
        }
      }
    })
  })
})
