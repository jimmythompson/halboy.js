const PARAM_PATTERN = /\{(\??[\w-_]+)\}/

const cleanParamName = (paramName) =>
  paramName.startsWith('?')
    ? paramName.substr(1)
    : paramName

export const expandParams = (templatedUrl, params) =>
  templatedUrl.replace(PARAM_PATTERN, (_, key) =>
    params[cleanParamName(key)] || '')
