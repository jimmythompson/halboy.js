import R from 'ramda'

const TEMPLATE_PARAM_PATTERN = /\{([\w-_]+)\}/g
const PARAM_PATTERN = /\{(\??[\w-_]+)\}/g

const filterKeys = (obj, keys) => R.pipe(
  R.toPairs,
  R.filter(([k, _]) => keys.indexOf(k) !== -1),
  R.fromPairs
)(obj)

const rejectKeys = (obj, keys) => R.pipe(
  R.toPairs,
  R.filter(([k, _]) => keys.indexOf(k) === -1),
  R.fromPairs
)(obj)

const isQueryParam = (paramName) =>
  paramName.startsWith('?')

const cleanParamName = (paramName) =>
  isQueryParam(paramName)
    ? paramName.substr(1)
    : paramName

const getTemplateParamNames = (url) =>
  TEMPLATE_PARAM_PATTERN.exec(url) || []

const resolveParam = (key, params) =>
  params[key] || ''

const resolveParams = (url, params) =>
  url.replace(PARAM_PATTERN, (_, key) =>
    resolveParam(cleanParamName(key), params))

export const resolveLink = (url, params) => {
  const templateParamNames = getTemplateParamNames(url)
  const templateParams = filterKeys(params, templateParamNames)
  const queryParams = rejectKeys(params, templateParamNames)

  return {
    href: resolveParams(url, templateParams),
    params: queryParams
  }
}
