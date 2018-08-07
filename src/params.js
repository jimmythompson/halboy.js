import URI from 'urijs'
import URITemplate from 'urijs/src/URITemplate'

export const resolveLink = (templatedUrl, params) => {
  const url = URITemplate(templatedUrl).expand(params)
  const queryObject = URI(url).query(true)
  const urlWithoutQueryString = URI(url).query('').toString()

  return {
    href: urlWithoutQueryString,
    params: queryObject
  }
}
