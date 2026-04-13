import http from 'http';
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';

const form = new FormData();
form.append('file', fs.createReadStream('src/index.css'));

const request = http.request({
  method: 'post',
  host: 'localhost',
  port: 8088,
  path: '/api/uploads',
  headers: form.getHeaders(),
});

request.on('response', (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => console.log('STATUS:', res.statusCode, 'BODY:', body));
});

form.pipe(request);
