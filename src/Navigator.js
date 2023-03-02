import URI from 'urijs'
import Resource from './Resource'
import { resolveLink } from './params'
import axiosOptions from './axiosOptions'

const makeAbsolute = (baseUri, relativeUri) =>
  URI(relativeUri).absoluteTo(baseUri).toString()

class Navigator {
  static defaultOptions = {
    ...axiosOptions,
    followRedirects: true
  }

  static discover (url, options = {}) {
    return new Navigator(options)
      .getUrl(url, {}, options.http)
  }

  static resume (location, resource, options = {}) {
    return new Navigator(options, { resource, location })
  }

  constructor (options, { status, location, response, resource } = {}) {
    this.options = {
      ...Navigator.defaultOptions,
      ...options
    }

    this._status = status
    this._response = response
    this._resource = resource
    this._location = location
  }

  _setResource (resource) {
    this._resource = resource
    return this
  }

  _setLocation (location) {
    this._location = location
    return this
  }

  location () {
    return this._location
  }

  status () {
    return this._status
  }

  resource () {
    return this._resource
  }

  getHeader (key) {
    return this._response.headers[key]
  }

  resolveLink (rel, params) {
    const relativeHref = this.resource().getHref(rel)

    if (!relativeHref) {
      throw new Error(`Attempting to follow the link '${rel}', which does not exist`)
    }

    const { href, params: queryParams } = resolveLink(relativeHref, params)

    return {
      href: makeAbsolute(this.location(), href),
      queryParams
    }
  }

  async get (rel, params = {}, config = {}) {
    const { href, queryParams } = this.resolveLink(rel, params)
    return this.getUrl(href, queryParams, config)
  }

  async post (rel, body, params = {}, config = {}) {
    const { href } = this.resolveLink(rel, params)
    return this.postUrl(href, body, config)
  }

  async put (rel, body, params = {}, config = {}) {
    const { href } = this.resolveLink(rel, params)
    return this.putUrl(href, body, config)
  }

  async patch (rel, body, params = {}, config = {}) {
    const { href } = this.resolveLink(rel, params)
    return this.patchUrl(href, body, config)
  }

  async delete (rel, body, params = {}, config = {}) {
    const { href } = this.resolveLink(rel, params)
    return this.deleteUrl(href, body, config)
  }

  async getUrl (url, params, config) {
    const {
      status,
      location,
      body,
      response
    } = await this.options.get(url, params, config)

    return new Navigator(this.options, { status, location, response, resource: Resource.fromObject(body) })
  }

  async postUrl (url, body, config) {
    const {
      status,
      location,
      body: responseBody,
      response
    } = await this.options.post(url, body, config)

    if (this.options.followRedirects && status === 201) {
      return new Navigator(this.options, {
        status,
        location,
        response,
        resource: Resource.fromObject(responseBody)
      }).followRedirect(config)
    }

    return new Navigator(this.options, { status, location, response, resource: Resource.fromObject(responseBody) })
  }

  async putUrl (url, body, config) {
    const {
      status,
      location,
      body: responseBody,
      response
    } = await this.options.put(url, body, config)

    if (this.options.followRedirects && status === 201) {
      return new Navigator(this.options, {
        status,
        location,
        response,
        resource: Resource.fromObject(responseBody)
      }).followRedirect(config)
    }

    return new Navigator(this.options, { status, location, response, resource: Resource.fromObject(responseBody) })
  }

  async patchUrl (url, body, config) {
    const {
      status,
      location,
      body: responseBody,
      response
    } = await this.options.patch(url, body, config)

    if (this.options.followRedirects && status === 204) {
      return new Navigator(this.options, {
        status,
        location,
        response,
        resource: Resource.fromObject(responseBody)
      }).followRedirect(config)
    }

    return new Navigator(this.options, { status, location, response, resource: Resource.fromObject(responseBody) })
  }

  async deleteUrl (url, body, config) {
    const {
      status,
      location,
      body: responseBody,
      response
    } = await this.options.delete(url, body, config)

    return new Navigator(this.options, { status, location, response, resource: Resource.fromObject(responseBody) })
  }

  async followRedirect (config) {
    return this.getUrl(makeAbsolute(this.location(), this.getHeader('location')), {}, config)
  }
}

module.exports = Navigator
