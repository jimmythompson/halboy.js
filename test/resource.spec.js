import { expect } from 'chai'

class HalResource {
  constructor () {
    this.links = {}
  }

  addLink (rel, value) {
    this.links = {
      ...this.links,
      [rel]: value
    }

    return this
  }

  getLink (rel) {
    return this.links[rel]
  }
}

describe('HalResource', () => {
  it('should be able to add and fetch links', () => {
    const resource =
      new HalResource()
        .addLink('self', { href: '/orders' })

    expect(resource.getLink('self'))
      .to.deep.equal({ href: '/orders' })
  })
})
