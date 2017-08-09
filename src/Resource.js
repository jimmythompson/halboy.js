import { isEmpty, fromPairs, toPairs } from 'ramda'

const flatten = (arr) =>
  arr.reduce((result, next) =>
    result.concat(Array.isArray(next)
      ? flatten(next)
      : next), [])

const createOrAppend = (left, right) =>
  left ? flatten([left, right]) : right

const resourcesToObject = (resources) => {
  if (isEmpty(resources)) {
    return {}
  }

  const transformedResources = fromPairs(toPairs(resources)
    .map(([key, value]) =>
      Array.isArray(value)
        ? [key, value.map(v => v.toObject())]
        : [key, value.toObject()]
    ))

  return {_embedded: transformedResources}
}

const linksToObject = (links) => {
  if (isEmpty(links)) {
    return {}
  }

  return {_links: links}
}

class Resource {
  constructor () {
    this.links = {}
    this.embedded = {}
    this.properties = {}
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

  getProperty (key) {
    return this.properties[key]
  }

  addLink (rel, value) {
    this.links = {
      ...this.links,
      [rel]: createOrAppend(this.links[rel], value)
    }

    return this
  }

  applyToResource (map, fn) {
    return toPairs(map).reduce(fn, this)
  }

  addLinks (map) {
    return this.applyToResource(
      map, (resource, [rel, value]) =>
        resource.addLink(rel, value))
  }

  addResource (key, value) {
    this.embedded = {
      ...this.embedded,
      [key]: createOrAppend(this.embedded[key], value)
    }

    return this
  }

  addProperty (key, value) {
    this.properties = {
      ...this.properties,
      [key]: value
    }

    return this
  }

  addProperties (map) {
    return this.applyToResource(
      map, (resource, [key, value]) =>
        resource.addProperty(key, value))
  }

  toObject () {
    return {
      ...linksToObject(this.links),
      ...resourcesToObject(this.embedded),
      ...this.properties
    }
  }
}

module.exports = Resource
