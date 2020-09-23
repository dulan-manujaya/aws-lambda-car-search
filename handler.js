'use strict';
const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });
//const uuid = require('uuid/v4');

const postsTable = process.env.CARS_TABLE;
// Create a response
function response(statusCode, message) {
  return {
    statusCode: statusCode,
    body: JSON.stringify(message)
  };
}
function sortByDate(a, b) {
  if (a.createdAt > b.createdAt) {
    return -1;
  } else return 1;
}

// Create a post
module.exports.createCar = (event, context, callback) => {
  const reqBody = JSON.parse(event.body);

  if (
    !reqBody.name ||
    reqBody.name.trim() === '' ||
    !reqBody.price ||
    reqBody.price.trim() === '' ||
    !reqBody.option ||
    reqBody.option.trim() === ''
  ) {
    return callback(
      null,
      response(400, {
        error: 'Post must have a name, price and option and they must not be empty'
      })
    );
  }

  const post = {
    id: reqBody.id,
    createdAt: new Date().toISOString(),
    name: reqBody.name,
    price: reqBody.price,
    options: reqBody.option
  };


  return db
    .put({
      TableName: postsTable,
      Item: post
    })
    .promise()
    .then(() => {
      callback(null, response(201, post));
    })
    .catch((err) => response(null, response(err.statusCode, err)));
};

// Get all posts
module.exports.getAllPrices = (event, context, callback) => {
  return db
    .scan({
      TableName: postsTable
    })
    .promise()
    .then((res) => {
      callback(null, response(200, res.Items.sort(sortByDate)));
    })
    .catch((err) => callback(null, response(err.statusCode, err)));
};

module.exports.getAllOptions = (event, context, callback) => {

  const params = {
    TableName: postsTable,

  };

  return db
    .scan({
      TableName: postsTable
    })
    .promise()
    .then((res) => {
      callback(null, response(200, res.Items.sort(sortByDate)));
    })
    .catch((err) => callback(null, response(err.statusCode, err)));
};

// Get a single post
module.exports.getCar = (event, context, callback) => {
  const id = event.pathParameters.id;

  const params = {
    Key: {
      id: id
    },
    TableName: postsTable
  };

  return db
    .get(params)
    .promise()
    .then((res) => {
      if (res.Item) callback(null, response(200, res.Item));
      else callback(null, response(404, { error: 'Post not found' }));
    })
    .catch((err) => callback(null, response(err.statusCode, err)));
};
