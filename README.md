# new-restful-sequelize
new-restful-sequelize is a module that exports restful APIs for your Sequelize models quickly, inspired by sequelize-reftful-extended but not a fork of that. It fully supports Sequelize's complex nested querys and handles pagination in a more standard way, ie, by Range header in HTTP request and Content-Range header in HTTP response. This is very useful wen you are doing pagination in browser using angular-paginate-anything module. It returns negative responses by sending '403 Forbidden', '500 Internal Server Error' and other standard HTTP response codes instead of sending '200 OK' with extra information saying that some errors have happened. This allows us to return instance or array of instances directly without tedious extra information. This is extremely important in angular ngResource.  

# Install
```console
npm install new-sequelize-restful
```

# Usage
