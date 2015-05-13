# new-restful-sequelize
new-restful-sequelize is a module that exports restful APIs for your Sequelize models quickly, inspired by sequelize-reftful-extended but not a fork of that. 

It fully supports Sequelize's complex nested querys and handles pagination in a more standard way, i.e. by Range header in HTTP request and Content-Range header in HTTP response. This is very useful wen you are doing pagination in browser using angular-paginate-anything module. 

It returns negative responses by sending '403 Forbidden', '500 Internal Server Error' and other standard HTTP response codes instead of sending '200 OK' with extra information saying that some errors have happened. This allows us to return positive responses by seding instance or array of instances directly without tedious extra information. This is extremely important in angular ngResource.

# Install
```console
npm install new-sequelize-restful
```

# Usage

## Configure express

1. Import new-sequelize-restful module
2. Route your path, e.g. '/api/staff', to new Restful(sequelize)).route()
3. By default, the route should has this format: 
  * abc








Code example: 
```js
var express = require('express');
var Sequelize = require('sequelize');
var Restful = require('new-sequelize-restful');

var app = express();
var sequelize = new Sequelize('postgres://user:pass@example.com:5432/dbname');

app.use(require('body-parser').json({
	type: 'application/*',
}));
app.all(/\/api\//, (new Restful(sequelize)).route());
app.listen(80);
```

## The APIs
