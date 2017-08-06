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
        .addLink('self', {href: '/orders/123'})
        .addLink('ea:basket', {href: '/baskets/98712'})
        .addLink('ea:customer', {href: '/customers/7809'})

    const resource =
      new Resource()
        .addResource('ea:order', embeddedResource)

    expect(resource.getResource('ea:order'))
      .to.deep.equal(embeddedResource)
  })
})
