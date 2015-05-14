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
3. By default, the route should has this format: <br>"/whatever-string/model-name" <br>or <br>"/whatever-string/model-name/id". <br>Examples:
"/api/staff", "/api/staff/1"


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

## The Restful APIs
We take 'staff' model for example. <br>
Remember that:


1. It returns '200 OK' with instance or instances(depending on the request of a singel object or a collection) as content for positive(successfull) responses.
2. It returns '403 Forbidden', '500 Internal Server Error' and other standard HTTP response codes with error message as content for negative(some errors has happened) responses;


### GET /api/staff
Return an array of all instances
```console
# curl http://127.0.0.1:8090/api/staff
```
```js
[{
	"id":1,
	"account":"account1",
	"password":"123456",
	"name":"tom",
	"role":1,
	"createAt":"2015-05-06T13:57:37.000Z",
	"lastLogin":"2015-05-06T13:57:37.000Z",
	"loginCnt":1
},{
	"id":2,
	"account":"account2",
	"password":"12wfde",
	"name":"marry",
	"role":1,
	"createAt":"2015-05-06T13:58:15.000Z",
	"lastLogin":"2015-05-06T13:58:15.000Z",
	"loginCnt":1
}]
```
You can add parameters to the requests. Complex Sequelize's nested query is supported.<br>


1. All leading underlines '\_'in keys are stripped, e.g. "http://127.0.0.1:8090/api/staff?\_name=tom" is equal to "http://127.0.0.1:8090/api/staff?name=tom". Because some client side codes do not allow JSON keys with leading '$' such as '$or' and '$and' while Sequelize actually has $or and $and. In this case, you can wrap these keys with leading '\_', e.g. '\_$or' and '\_$and'.


2. All values will be parseJSONed if they are of type string and can be parseJSONed safely without error.<br>
For example:<br>
```console
curl 'http://127.0.0.1:8090/api/staff?_name=abc2&account=\{"$like":"%ab%"\}'
```
will result the where object in the Sequelize: 
```js
{ 
	account: { 
		'$like': '%ab%' 
	}, 
	name: 'abc2' 
}
```


You can also add pagination information to the query.
The Pagination information is stored in Range header when request and Content-Range header when response. Go to ['angular-paginate-anything'](https://github.com/begriffs/angular-paginate-anything) for more information.
```console
# curl -v --header "Range: 0-10" 'http://127.0.0.1:8090/api/staff?_name=abc2&account=\{"$like":"%ab%"\}'
```
Response:
```console
HTTP/1.1 200 OK
X-Powered-By: Express
Accept-Ranges: items
Range-Unit: items
Content-Range: 0-0/1
Content-Type: application/json; charset=utf-8
Content-Length: 153
ETag: W/"99-28f12ee1"
set-cookie: connect.sid=s%3AA-SdrqRTV-avX_1O_KepGhoKlQFBVsEU.VDvv64%2BZuHN63Dnz8qTjYt9WDhWhD04z1VzpQcxwbW8; Path=/; HttpOnly
Date: Thu, 14 May 2015 05:09:11 GMT
Connection: keep-alive
```
```js
[{
	"id":16,
	"account":"abc2",
	"password":"123",
	"name":"abc2",
	"role":0,
	"createAt":"2015-05-10T03:52:37.000Z",
	"lastLogin":"0000-00-00 00:00:00",
	"loginCnt":0
}]
```


### POST /api/staff
Create a new instance.
```console
$ curl --header 'Content-Type: application/json' -d '{"account":"acct","password":"123","name":"jon","role":1}' -X POST http://www.scaleoa.com:8090/api/staff
```
```js
{
	"id":20,
	"account":"acct",
	"password":"123",
	"name":"jon",
	"role":1
}
```
