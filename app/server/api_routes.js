'use strict';

import bodyParser from 'body-parser';
import { healthcheck, tx_build, tx_push } from './api_routes_handler.js'

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

// Public
GET.route('/api/v1/healthcheck', healthcheck);

// Transactions
POST.route('/api/v1/tx/build', tx_build);
POST.route('/api/v1/tx/push', tx_push);
