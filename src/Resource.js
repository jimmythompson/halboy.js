const flatten = (arr) =>
  arr.reduce((result, next) =>
    result.concat(Array.isArray(next)
      ? flatten(next)
      : next), [])

const createOrAppend = (left, right) =>
  left ? flatten([left, right]) : right

export default class Resource {
  constructor () {
    this.links = {}
    this.embedded = {}
  }

  getLink (rel) {
    return this.links[rel]
  }

  getHref (rel) {
    return this.getLink(rel).href
  }

  getResource (key) {
    return this.embedded[key]
  }

  addLink (rel, value) {
    this.links = {
      ...this.links,
      [rel]: createOrAppend(this.links[rel], value)
    }

    return this
  }

  addResource (key, value) {
    this.embedded = {
      ...this.embedded,
      [key]: createOrAppend(this.embedded[key], value)
    }

    return this
  }
}
