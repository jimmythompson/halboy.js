import URI from 'urijs'
import URITemplate from 'urijs/src/URITemplate'
import { omit, merge, concat } from 'ramda'

export const resolveLink = (templatedUrl, params) => {
  const template = URITemplate(templatedUrl).parse()
  const variables = template.parts.reduce((accumulator, part) => {
    if (part.variables) {
      return concat(part.variables.map(variable => variable.name), accumulator)
    }
    return accumulator
  }, [])
  const url = template.expand(params)
  const queryObject = URI(url).query(true)
  const fullParams = merge(omit(variables, params), queryObject)
  const urlWithoutQueryString = URI(url).query('').toString()

  return {
    href: urlWithoutQueryString,
    params: fullParams
  }
}
