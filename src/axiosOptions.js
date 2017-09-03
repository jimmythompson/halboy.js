import axios from 'axios'

const axiosGet = (url, params) =>
  axios.get(url, { params, validateStatus: () => true })
    .then((response) => ({
      status: response.status,
      body: response.data,
      location: response.config.url,
      response
    }))

const axiosPost = (url, body) =>
  axios.post(url, body, { validateStatus: () => true })
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
