'use strict';

import bodyParser from 'body-parser';
import {
  healthcheck,
  tx_build, tx_push,
  user_get, user_balance
} from './api_routes_handler.js';

Picker.middleware( bodyParser.json() );
Picker.middleware( bodyParser.urlencoded( { extended: false } ) );

const POST = Picker.filter(function(request, response) {
  return request.method === "POST";
});

const GET = Picker.filter(function(request, response) {
  return request.method === "GET";
});

const PUT = Picker.filter(function(request, response) {
  return request.method === "PUT";
});

const DELETE = Picker.filter(function(request, response) {
  return request.method === "DELETE";
});

const BASE = '/api/v1'

// Public
GET.route(BASE + '/healthcheck', healthcheck);

// Transactions
POST.route(BASE + '/tx/build', tx_build);
POST.route(BASE + '/tx/push', tx_push);

//User
GET.route(BASE + '/user/:address', user_get);
GET.route(BASE + '/user/:address/balance', user_balance);
