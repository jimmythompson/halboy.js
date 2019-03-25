import axios from 'axios'

const axiosGet = (url, params, config) =>
  axios.get(url, { ...config, params, validateStatus: () => true })
    .then((response) => ({
      status: response.status,
      body: response.data,
      location: response.config.url,
      response
    }))

const axiosPost = (url, body, config) =>
  axios.post(url, body, { ...config, validateStatus: () => true })
    .then((response) => ({
      status: response.status,
      body: response.data,
      location: response.config.url,
      response
    }))

const axiosPut = (url, body, config) =>
  axios.put(url, body, { ...config, validateStatus: () => true })
    .then((response) => ({
      status: response.status,
      body: response.data,
      location: response.config.url,
      response
    }))

const axiosPatch = (url, body, config) =>
  axios.patch(url, body, { ...config, validateStatus: () => true })
    .then((response) => ({
      status: response.status,
      body: response.data,
      location: response.config.url,
      response
    }))

const axiosDelete = (url, body, config) =>
  axios.delete(url,
    { ...config, data: body, validateStatus: () => true })
    .then((response) => ({
      status: response.status,
      body: response.data,
      location: response.config.url,
      response
    }))

module.exports = {
  get: axiosGet,
  post: axiosPost,
  put: axiosPut,
  patch: axiosPatch,
  delete: axiosDelete
}
