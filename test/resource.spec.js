import { expect } from 'chai'
import Resource from '../src/Resource'

describe('Resource', () => {
  it('adds and fetches links when an object is used', () => {
    const resource =
      new Resource()
        .addLink('self', {href: '/orders'})

    expect(resource.getLink('self'))
      .to.deep.equal({href: '/orders'})
  })

  it('adds and fetches links when a string is used', () => {
    const resource =
      new Resource()
        .addLink('self', '/orders')

    expect(resource.getLink('self'))
      .to.deep.equal({href: '/orders'})
  })

  it('stacks links with the same key', () => {
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

  it('adds multiple links at once', () => {
    const resource =
      new Resource()
        .addLinks({
          self: {href: '/orders/123'},
          'ea:basket': {href: '/baskets/98712'},
          'ea:customer': {href: '/customers/7809'}
        })

    expect(resource.getHref('ea:basket'))
      .to.equal('/baskets/98712')
  })

  it('does not add a falsy link', () => {
    const resource =
      new Resource()
        .addLink('ea:basket', null)

    expect(resource.toObject())
      .to.deep.equal({})
  })

  it('does not add falsy links when multiple are added', () => {
    const resource =
      new Resource()
        .addLinks({
          self: {href: '/orders/123'},
          'ea:basket': null,
          'ea:customer': undefined
        })

    expect(resource.toObject())
      .to.deep.equal({
        _links: {
          self: {href: '/orders/123'}
        }
      })
  })

  it('fetches hrefs', () => {
    const resource =
      new Resource()
        .addLink('self', {href: '/orders'})

    expect(resource.getHref('self'))
      .to.deep.equal('/orders')
  })

  it('fetches multiple hrefs', () => {
    const resource =
      new Resource()
        .addLinks({
          self: {href: '/orders/123'},
          'ea:basket': {href: '/baskets/98712'},
          'ea:customer': {href: '/customers/7809'}
        })

    expect(resource.getHrefs())
      .to.deep.equal({
        self: '/orders/123',
        'ea:basket': '/baskets/98712',
        'ea:customer': '/customers/7809'
      })
  })

  it('fetches multiple links', () => {
    const resource =
      new Resource()
        .addLinks({
          self: {href: '/orders/123'},
          'ea:basket': {href: '/baskets/98712'},
          'ea:customer': {href: '/customers/7809'}
        })

    expect(resource.getLinks())
      .to.deep.equal({
        self: {href: '/orders/123'},
        'ea:basket': {href: '/baskets/98712'},
        'ea:customer': {href: '/customers/7809'}
      })
  })

  it('adds and fetches embedded resources', () => {
    const embeddedResource =
      new Resource()
        .addLinks({
          self: {href: '/orders/123'},
          'ea:basket': {href: '/baskets/98712'},
          'ea:customer': {href: '/customers/7809'}
        })

    const resource =
      new Resource()
        .addResource('ea:order', embeddedResource)

    expect(resource.getResource('ea:order'))
      .to.deep.equal(embeddedResource)
  })

  it('gets all resources', () => {
    const embeddedResource1 =
      new Resource()
        .addLinks({
          self: {href: '/orders/123'},
          'ea:basket': {href: '/baskets/98712'},
          'ea:customer': {href: '/customers/7809'}
        })
    const embeddedResource2 =
      new Resource()
        .addLinks({
          self: {href: '/address/321'}
        })

    const resource =
      new Resource()
        .addResource('ea:order', embeddedResource1)
        .addResource('ea:address', embeddedResource2)

    expect(resource.getResources())
      .to.deep.equal({
        'ea:order': embeddedResource1,
        'ea:address': embeddedResource2
      })
  })

  it('adds a list of a resources', () => {
    const firstEmbeddedResource =
      new Resource()
        .addLinks({
          self: {href: '/orders/123'},
          'ea:basket': {href: '/baskets/98712'},
          'ea:customer': {href: '/customers/7809'}
        })

    const secondEmbeddedResource =
      new Resource()
        .addLinks({
          self: {href: '/orders/124'},
          'ea:basket': {href: '/baskets/98713'},
          'ea:customer': {href: '/customers/12369'}
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

  it('stacks resources under the same key', () => {
    const firstEmbeddedResource =
      new Resource()
        .addLinks({
          self: {href: '/orders/123'},
          'ea:basket': {href: '/baskets/98712'},
          'ea:customer': {href: '/customers/7809'}
        })

    const secondEmbeddedResource =
      new Resource()
        .addLinks({
          self: {href: '/orders/124'},
          'ea:basket': {href: '/baskets/98713'},
          'ea:customer': {href: '/customers/12369'}
        })

    const thirdEmbeddedResource =
      new Resource()
        .addLinks({
          self: {href: '/orders/125'},
          'ea:basket': {href: '/baskets/98716'},
          'ea:customer': {href: '/customers/2416'}
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

  it('adds and retrieves properties', () => {
    const resource =
      new Resource()
        .addProperty('currentlyProcessing', 14)

    expect(resource.getProperty('currentlyProcessing'))
      .to.equal(14)
  })

  it('adds multiple properties', () => {
    const resource =
      new Resource()
        .addProperties({
          currentlyProcessing: 14,
          shippedToday: 20
        })

    expect(resource.getProperties()).to.deep.equal({
      currentlyProcessing: 14,
      shippedToday: 20
    })
  })
})
