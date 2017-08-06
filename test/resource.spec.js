import { expect } from 'chai'
import Resource from '../src/Resource'

describe('Resource', () => {
  it('should add and fetch links', () => {
    const resource =
      new Resource()
        .addLink('self', {href: '/orders'})

    expect(resource.getLink('self'))
      .to.deep.equal({href: '/orders'})
  })

  it('should stack links with the same key', () => {
    const resource =
      new Resource()
        .addLink('ea:admin', {href: '/admins/2', title: 'Fred'})
        .addLink('ea:admin', {href: '/admins/5', title: 'Kate'})

    expect(resource.getLink('ea:admin'))
      .to.deep.equal([
        {href: '/admins/2', title: 'Fred'},
        {href: '/admins/5', title: 'Kate'}
      ])
  })

  it('should add multiple links at once', () => {
    const resource =
      new Resource()
      .addLinks({
        self: { href: '/orders/123' },
        'ea:basket': { href: '/baskets/98712' },
        'ea:customer': { href: '/customers/7809' }
      })

    expect(resource.getHref('ea:basket'))
      .to.equal('/baskets/98712')
  })

  it('should fetch hrefs', () => {
    const resource =
      new Resource()
        .addLink('self', {href: '/orders'})

    expect(resource.getHref('self'))
      .to.deep.equal('/orders')
  })

  it('should add and fetch embedded resources', () => {
    const embeddedResource =
      new Resource()
        .addLinks({
          self: { href: '/orders/123' },
          'ea:basket': { href: '/baskets/98712' },
          'ea:customer': { href: '/customers/7809' }
        })

    const resource =
      new Resource()
        .addResource('ea:order', embeddedResource)

    expect(resource.getResource('ea:order'))
      .to.deep.equal(embeddedResource)
  })

  it('should add a list of a resources', () => {
    const firstEmbeddedResource =
      new Resource()
        .addLinks({
          self: { href: '/orders/123' },
          'ea:basket': { href: '/baskets/98712' },
          'ea:customer': { href: '/customers/7809' }
        })

    const secondEmbeddedResource =
      new Resource()
        .addLinks({
          self: { href: '/orders/124' },
          'ea:basket': { href: '/baskets/98713' },
          'ea:customer': { href: '/customers/12369' }
        })

    const resource =
      new Resource()
        .addResource('ea:order', [
          firstEmbeddedResource,
          secondEmbeddedResource
        ])

    expect(resource.getResource('ea:order'))
      .to.deep.equal([
        firstEmbeddedResource,
        secondEmbeddedResource
      ])
  })

  it('should stack resources with under the same key', () => {
    const firstEmbeddedResource =
      new Resource()
        .addLinks({
          self: { href: '/orders/123' },
          'ea:basket': { href: '/baskets/98712' },
          'ea:customer': { href: '/customers/7809' }
        })

    const secondEmbeddedResource =
      new Resource()
        .addLinks({
          self: { href: '/orders/124' },
          'ea:basket': { href: '/baskets/98713' },
          'ea:customer': { href: '/customers/12369' }
        })

    const thirdEmbeddedResource =
      new Resource()
        .addLinks({
          self: { href: '/orders/125' },
          'ea:basket': { href: '/baskets/98716' },
          'ea:customer': { href: '/customers/2416' }
        })

    const resource =
      new Resource()
        .addResource('ea:order', [
          firstEmbeddedResource,
          secondEmbeddedResource
        ])
        .addResource('ea:order', thirdEmbeddedResource)

    expect(resource.getResource('ea:order'))
      .to.deep.equal([
        firstEmbeddedResource,
        secondEmbeddedResource,
        thirdEmbeddedResource
      ])
  })
})
