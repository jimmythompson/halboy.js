import url from 'url'
import Resource from './Resource'
import { resolveLink } from './params'
import axiosOptions from './axiosOptions'

class Navigator {
  static defaultOptions = axiosOptions

  static discover (url, options = {}) {
    return new Navigator(options)
      .getUrl(url)
  }

  constructor (options) {
    this.options = {
      ...Navigator.defaultOptions,
      ...options
    }
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
    const relativeHref = this._resource.getHref(rel)
    const { href, params: queryParams } = resolveLink(relativeHref, params)

    return {
      href: url.resolve(this._location, href),
      queryParams
    }
  }

  async get (rel, params = {}) {
    const { href, queryParams } = this.resolveLink(rel, params)
    return this.getUrl(href, queryParams)
  }

  async post (rel, body, params = {}) {
    const { href } = this.resolveLink(rel, params)
    return this.postUrl(href, body)
  }

  async getUrl (url, params) {
    const {
      status,
      location,
      body,
      response
    } = await this.options.get(url, params)

    this._status = status
    this._location = location
    this._response = response
    this._resource = Resource.fromObject(body)

    return this
  }

  async postUrl (url, body) {
    const {
      status,
      location,
      body: responseBody,
      response
    } = await this.options.post(url, body)

    this._status = status
    this._location = location
    this._response = response
    this._resource = Resource.fromObject(responseBody)

    if (status === 201) {
      return this.followRedirect()
    }

    return this
  }

  async followRedirect () {
    return this.getUrl(this.getHeader('location'), {})
  }
}

module.exports = Navigator
