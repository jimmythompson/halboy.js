import { expect } from 'chai'
import Resource from '../src/Resource'

describe('Resource', () => {
  it('should export to an object', () => {
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
})
