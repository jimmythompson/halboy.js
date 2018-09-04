# halboy.js

[![CircleCI](https://circleci.com/gh/jimmythompson/halboy.js/tree/master.svg?style=shield)](https://circleci.com/gh/jimmythompson/halboy.js/tree/master) [![npm version](https://badge.fury.io/js/halboy.svg)](https://badge.fury.io/js/halboy)

A library for all things hypermedia.

* Create hypermedia resources
* Marshal to and from plain JS objects
* Navigate JSON+HAL APIs

## API

### Resources

With Halboy you can create resources, and pull information from them.

```js
import { Resource } from 'halboy'

const discountResource =
  new Resource()
    .addLink('self', '/discounts/1256')
    .addProperty('discountPercentage', 10)

const itemResources = [
  new Resource()
    .addLink('self', '/items/534')
    .addProperty('price', 25.48)
]

const resource =
    new Resource()
      .addLink('self', '/orders/123')
      .addLink('creator', '/users/rob')
      .addResource('discount', discountResource)
      .addResource('items', itemResources)
      .addProperty('state', 'dispatching')

resource.getLink('self')
// { href: '/orders/123' }

resource.getHref('self')
// '/orders/123'

resource.getProperty('state')
// 'dispatching'

resource
  .getResource('creator')
  .getProperty('discountPercentage')
// 10

resource
  .getResource('items')[0]
  .getProperty('price')
// 25.48
```

### Marshalling

You can create HAL resources from plain JS objects, and vice versa.

```js
import { Resource } from 'halboy'

const itemResources = [
  new Resource()
    .addLink('self', '/items/534')
    .addProperty('price', 25.48)
]

const resource =
    new Resource()
      .addLink('self', '/orders/123')
      .addLink('creator', '/users/rob')
      .addResource('items', itemResources)
      .addProperty('state', 'dispatching')

resource.toObject()
// {
//   _links: {
//     self: { href: '/orders/123' },
//     creator: { href: '/users/rob' }
//   },
//   _embedded: {
//     items: [{
//       _links: {
//         self: { href: '/items/534' }
//       },
//       price: 25.48
//     }]
//   },
//   state: 'dispatching'
// }

Resource.fromObject(resource.toObject())
  .getHref('self')
// '/orders/123'
```

### Navigation

Provided you're calling a HAL+JSON API, you can discover the API and navigate
through its links. When you've found what you want, you call
`navigator.resource()` and you get a plain old HAL resource, which you can inspect
using any of the methods above.

```js
import { Navigator } from 'halboy'

//  GET / - 200 OK
//  {
//   "_links": {
//     "self": {
//       "href": "/"
//     },
//     "users": {
//       "href": "/users"
//     },
//     "user": {
//       "href": "/users/{id}",
//       "templated": true
//     }
//   }
// }

const discoveryResult = await Navigator.discover('https://api.example.com/')
const usersResult = await discoveryResult.get('users')

usersResult.status()
// 200

usersResult.location()
// 'https://api.example.com/users'

const robResult = await discoveryResult.get('user', {id :'rob'})

robResult.location()
// 'https://api.example.com/users/rob'

const sueResult = await discoveryResult.post('user', {
  id: 'sue',
  name: 'Sue',
  title: 'Dev'
})

sueResult.location()
// 'https://api.example.com/users/sue'

sueResult
  .resource()
  .getProperty('title')
// 'Dev'
```
