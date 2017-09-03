import url from 'url'
import Resource from './Resource'
import { resolveLink } from './params'
import axiosOptions from './axiosOptions'

class Navigator {
  static defaultOptions = axiosOptions

  static discover (url, options = {}) {
    return new Navigator(options)
      ._fetchUrl(url)
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

  async get (rel, params = {}) {
    const relativeHref = this._resource.getHref(rel)
    const {
      href: expandedHref,
      params: queryParams
    } = resolveLink(relativeHref, params)
    const absoluteHref = url.resolve(this._location, expandedHref)
    return this._fetchUrl(absoluteHref, queryParams)
  }

  async _fetchUrl (url, params) {
    const {
      status,
      location,
      body,
      response
    } = await this.options.getFn(url, params)

    this._status = status
    this._location = location
    this._response = response
    this._resource = Resource.fromObject(body)

    return this
  }
}

module.exports = Navigator
