import axios from 'axios'

const axiosGet = (url, params, config) =>
  axios.get(url, { params, ...config, validateStatus: () => true })
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

module.exports = {
  get: axiosGet,
  post: axiosPost
}
