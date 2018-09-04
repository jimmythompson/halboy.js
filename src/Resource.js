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

const objectToLinks = (_links) => {
  return _links || {}
}

const objectToResources = (_embedded) => {
  if (isEmpty(_embedded)) {
    return {}
  }

  return fromPairs(toPairs(_embedded)
    .map(([key, value]) =>
      Array.isArray(value)
        ? [key, value.map(v => Resource.fromObject(v))]
        : [key, Resource.fromObject(value)]
    ))
}

const coerceResource = (resource) =>
  resource instanceof Resource
  ? resource
  : Resource.fromObject(resource)

class Resource {
  static fromObject ({ _links, _embedded, ...properties }) {
    return new Resource()
      .addLinks(objectToLinks(_links))
      .addResources(objectToResources(_embedded))
      .addProperties(properties)
  }

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

  getProperties () {
    return this.properties
  }

  addLink (rel, value) {
    if (typeof value === 'string') {
      return this.addLink(rel, { href: value })
    }

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
    const coerced =
      Array.isArray(value)
        ? value.map(resource => coerceResource(resource))
        : coerceResource(value)

    this.embedded = {
      ...this.embedded,
      [key]: createOrAppend(this.embedded[key], coerced)
    }

    return this
  }

  addResources (map) {
    return this.applyToResource(
      map, (resource, [key, value]) =>
        resource.addResource(key, value))
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
