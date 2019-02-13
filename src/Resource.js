import { isEmpty, toPairs, prop, map, reject, isNil, pipe, defaultTo } from 'ramda'

const flatten = (arr) =>
  arr.reduce((result, next) =>
    result.concat(Array.isArray(next)
      ? flatten(next)
      : next), [])

const createOrAppend = (left, right) =>
  left ? flatten([left, right]) : right

const resourcesToObject = (resources) => {
  if (!resources || isEmpty(resources)) {
    return {}
  }

  const transformedResources = map((value) => {
    return Array.isArray(value)
      ? value.map(v => v.toObject())
      : value.toObject()
  }, resources)

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
  if (!_embedded || isEmpty(_embedded)) {
    return {}
  }

  return map((value) => {
    return Array.isArray(value)
      ? value.map(v => Resource.fromObject(v))
      : Resource.fromObject(value)
  }, _embedded)
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
    return prop(rel, this.links)
  }

  getHref (rel) {
    return prop('href', this.getLink(rel) || {})
  }

  getLinks () {
    return this.links
  }

  getHrefs () {
    return pipe(
      map(pipe(
        defaultTo({}),
        prop('href'))
      ),
      reject(isNil)
    )(this.links)
  }

  getResource (key) {
    return this.embedded[key]
  }

  getResources () {
    return this.embedded
  }

  getProperty (key) {
    return this.properties[key]
  }

  getProperties () {
    return this.properties
  }

  addLink (rel, value) {
    if (!value) {
      return this
    }

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
