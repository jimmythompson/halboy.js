import axios from 'axios'

const axiosGet = (url, params) =>
  axios.get(url, { params })
    .then((response) => ({
      status: response.status,
      body: response.data,
      location: response.config.url,
      response
    }))

module.exports = {
  getFn: axiosGet,
  postFn: () => {}
}
