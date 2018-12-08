# koa-mongoose-paginate

![version](https://img.shields.io/badge/version-0.0.3-blue.svg?style=shield)

Query parameter based pagination for REST APIs built using koa and mongoose

Right now the only form of pagination supported is page number based pagination through the `PageNumberPaginator` class. Cursor-based pagionation may come in the future.

> ⚠️ This library is in an early stage of development so the API is subject to change.

## Installation

    npm i koa-mongoose-paginate

## Example Usage

You can use a paginator with koa [`context`](https://koajs.com/#context) and a [mongoose model](https://mongoosejs.com/docs/models.html). 

Here's an example of a controller for a route using the `PageNumberPaginator`:

```javascript
const { PageNumberPaginator } = require('koa-mongoose-paginate');
const User = require('./models/user');

async function userList(ctx) {
  const { page, pageSize } = ctx.query;

  try {
    const paginator = new PageNumberPaginator(User, ctx, pageSize, 'dateCreated', 'asc');
    return paginator.get(page);
  } catch (error) {
    return raiseError(error);
  }
}
```

You can modify your response as necessary if you'd like by leveraging a [response middleware](https://www.npmjs.com/package/koa-respond).

### Example Response
```json
{   
  "results": [
    {
      "_id": "1bf4da7643543a0e90831ae2",
      "firstName": "John",
      "lastName": "Snow",
      "email": "john.snow@example.com"
    },
    {
      "_id": "2ae4da7643543a0e90831ae1",
      "firstName": "Arya",
      "lastName": "Stark",
      "email": "arya.stark@example.com"
    },
    {
      "_id": "5bf4da7643543a0e90831ae5",
      "firstName": "Daenerys",
      "lastName": "Targaryen",
      "email": "daenerys.targaryen@example.com"
    },
    ...
  ],
  "pagination": {
    "totalPages": 5,
    "count": 100,
    "previous": null,
    "next": "http://localhost:3000/users/?page=2"
  }
}
```

## Client Usage

A frontend client/app can pass the following query parameters to use pagination:

* `page` to access different pages of the response results

* `pageSize` to indicate a different number of results per page. By default this is `20` with a max limit of `100` per page. You can change this using [environment variables](#environment-variables) (see below).

* **Example Url:** `http://localhost:3000/users/?page=2&pageSize=100` 


## Environment Variables

`koa-mongoose-paginate` comes with some default settings, you can choose to override them if you'd like. Here are the list of variables you can modify:

Name                        | Default    | Type     | Required
----------------------------|------------|----------|---------
`DEFAULT_PAGE_SIZE`         | `20`       | `Number` | no
`MAX_PAGE_SIZE`             | `100`      | `Number` | no   
`PAGE_QUERY_PARAMETER`      | `"page"`   | `String` | no   
`PAGE_SIZE_QUERY_PARAMETER` | `pageSize` | `String` | no

## Author's Note

Inspiration for this library came from [Django REST Framework](https://github.com/encode/django-rest-framework)
