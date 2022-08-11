var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var User = require('../../models/user');



router.use(function (req, res, next) {

  var token = req.body.token || req.headers['x-access-token'];
  var refreshToken = req.body.refreshToken || req.headers['refresh-token'];


  if (token) {

    jwt.verify(token, process.env.TOKEN_SECRET, function (err, decoded) {
      if (err) {
        //Access token not good, check for a refresh token
        return jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, function (err, decodedRefresh) {
          if (err) {
            return res.status(403).send("Failed to Authenticate");
          } else {
            //Issue a new token and pass to other routes.
            return User.findById(decodedRefresh._id)
              .then(function (user) {
                if(!user){
                  return res.status(403).send("Failed to Authenticate");
                }else if(!user.active || user.suspended){
                  return res.status(403).send("Failed to Authenticate");
                }
                var newTokenData = {
                  _id: user._id,
                  email: user.email,
                  name: user.fullname,
                  groups: user.groups,
                  adminForSchool:user.adminForSchool,
                  school:user.school,
                  checkedOut:user.checkedOut

                }
                if(user.isAdmin){
                  newTokenData.isAdmin = true;
                }
                if(user.isMember){
                  newTokenData.isMember = true;
                }
                if(user.isAttendee){
                  newTokenData.isAttendee = true;
                }
                if(user.isDeveloper){
                  newTokenData.isDeveloper = true;
                }
                if(user.isEducator){
                  newTokenData.isEducator = true;
                }
                if(user.isInstructor){
                  newTokenData.isInstructor = true;
                }

                var newToken = jwt.sign(newTokenData, process.env.TOKEN_SECRET, { expiresIn: '5m' });

                res.set('refreshed-token', newToken);
                req.decoded = newTokenData;
                return next();
              })
              .catch(function (err) {
                return res.status(403).send("Failed to Authenticate");
              });

          }
        });
      } else {
        req.decoded = decoded;
        next();
      }


    });

  } else {

    return res.status(403).send("Not Authorized.");

  }
});

module.exports = router;