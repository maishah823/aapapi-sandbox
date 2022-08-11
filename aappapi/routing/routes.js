module.exports = function (app) {

  app.use(function (req, res, next) {
    if ((req.headers['x-forwarded-proto'] != 'https') && (process.env.HEROKU_SSL_DISABLED != 'true'))
      res.status(403).send("No SSL");
    else
      next() /* Continue to other routes if we're not redirecting */
  });

  //Enable CORS
  app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "POST,GET,OPTIONS,PUT,DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, If-None-Match, X-Requested-With, x-access-token, Content-Type, Accept, Content-Length, refresh-token");
    res.header("Access-Control-Expose-Headers", "refreshed-token");

    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
      res.status(200).send('Accepted');
    }
    else {
      next();
    }

  });

  //main path
  app.use('/', require('./routes/index'));
  app.use('/public', require('./routes/public'));
  app.use('/join', require('./routes/join'));
  app.use('/attend', require('./routes/attend'));
  app.use('/dropdowns', require('./routes/dropdowns'));
  app.use('/schools', require('./routes/schools'));
  app.use('/payment', require('./routes/payment'));
  app.use('/conference', require('./routes/conference'));
  app.use('/public-blogs', require('./routes/public-blogs'));



  //REQUIRE AUTHENTICATION FOR ALL OF THE ROUTES FOLLOWING
  app.use('*', require('./routes/tokenauth'));

  app.use('/chat', require('./routes/chat'));
  app.use('/school-admin', require('./routes/school-admin'));
  app.use('/logs', require('./routes/logs'));
  app.use('/applications', require('./routes/applications'));
  app.use('/users', require('./routes/users'));
  app.use('/conf-admin', require('./routes/conf-admin'));
  app.use('/email', require('./routes/email'));
  app.use('/financial', require('./routes/financial'));
  app.use('/members', require('./routes/members'));
  app.use('/blogs', require('./routes/blogs'));
  app.use('/checkout', require('./routes/checkout'));
  app.use('/system', require('./routes/system'));
  app.use('/reports', require('./routes/reports'));
  app.use('/sms', require('./routes/sms'));
  app.use('/custom-schedules', require('./routes/custom-schedules'));
  app.use('/instructor-tools', require('./routes/instructor-tools'));


  //Errors
  // Handle 404
  app.use(function (req, res) {
    res.status(404).send('404: Page not Found');
  });

  // Handle 500
  app.use(function (error, req, res, next) {
    console.error(error);
    res.status(500).send('500: Request Failed.');
  });

}