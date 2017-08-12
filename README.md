# halboy.js

[![CircleCI](https://circleci.com/gh/jimmythompson/halboy.js/tree/master.svg?style=shield)](https://circleci.com/gh/jimmythompson/halboy.js/tree/master) [![npm version](https://badge.fury.io/js/halboy.svg)](https://badge.fury.io/js/halboy)

A library for all things hypermedia.

* Create hypermedia resources
* Marshal to and from plain JS objects
* _Navigate JSON+HAL APIs (coming soon!)_

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