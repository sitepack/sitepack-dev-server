var path = require('path');
var url = require('url');
var express = require('express');
var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var proxy = require('proxy-middleware');

var config = require(path.join(process.cwd(), 'webpack', 'config.dev.js'));
var renderHtml = require(path.join(process.cwd(), 'base', 'html.js'));

var assets = 'assets';
var port = 8080;
var app = express();

config.entry.main.unshift('webpack-dev-server/client?http://localhost:8081');
config.output.publicPath = 'http://localhost:8081/assets/';
app.use(`/${assets}`, proxy(url.parse('http://localhost:8081/assets')));

app.use(express.static(path.join(process.cwd(), 'public')));

app.get('/*', function response(req, res, next) {
  if (req.accepts('html') && req.originalUrl !== '/favicon.ico') {
    var title;

    var content = '';
    var cssHrefs = [];
    var scriptSrcs = [
      `/${assets}/layout.js`,
      `/${assets}/main.js`
    ];

    var html = renderHtml(
      req.originalUrl,
      content,
      cssHrefs,
      scriptSrcs
    );

    res.send(html);
  } else {
    next();
  }
});

var webpackDevServer = new WebpackDevServer(webpack(config), {
    hot: false,
    quiet: false,
    noInfo: false,
    publicPath: `/${assets}`,
    stats: { colors: true }
});

webpackDevServer.listen(8081, "localhost", function() {});
app.listen(port);
