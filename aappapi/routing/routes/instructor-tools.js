var express = require('express');
var router = express.Router();
var ClassroomEvent = require('../../models/classroomEvent');
var ApiError = require('../../classes/ApiError');
var Material = require('../../models/material');

var AWS = require('aws-sdk');
AWS.config.update({ accessKeyId: process.env.AWS_ID, secretAccessKey: process.env.AWS_SECRET, region: 'us-east-2' });
var s3 = new AWS.S3();

router.post('/get-signed-upload', async (req, res) => {
    if (!req.body.id || !req.body.contenttype || !req.body.filename) {
        console.error("Not enough info to add material.");
        return res.status(400).send(new ApiError('Upload', 'Missing information.'));
    }
    if (!req.decoded.isInstructor) {
        return res.status(400).send(new ApiError('Upload', 'Not authorized.'));
    }
    var event;
    try {
        event = await ClassroomEvent.findById(req.body.id);
        if (!event) {
            throw new Error("Event empty.")
        }
    } catch (e) {
        console.error(e);
        return res.status(400).send(new ApiError('Upload', 'Could not retrieve event.'));
    }
    //Check event and make sure the instructor has permission.
    console.log(req.decoded, event);
    if (event.instructors.indexOf(req.decoded._id) < 0) {
        console.error("INSTRUCTOR TRYING TO UPLOAD TO SOMEONE ELSE'S CLASS");
        return res.status(400).send(new ApiError('Upload', 'You are trying to upload material to a class you are not instructing.'));
    }
    var filename = req.body.filename;
    var contenttype = req.body.contenttype;

    var params = {
        Bucket: process.env.CLASS_MATERIALS_BUCKET,
        Key: filename,
        Expires: 60,
        ContentType: contenttype,
        ACL: 'public-read'
    };
    s3.getSignedUrl('putObject', params, function (err, url) {
        if (err) {
            console.error(err);
            return res.status(400).send(new ApiError('File Upload', 'Error signing request.'));
        } else {
            res.json({ url: url });

        }
    });


});

router.post('/add-material', (req, res) => {
    if (!req.body.filename || !req.body.eventId || !req.body.title) {
        return res.status(400).send(new ApiError('Material', 'Missing Info.'));
    }
    if (!req.decoded.isInstructor) {
        return res.status(400).send(new ApiError('Upload', 'Not authorized.'));
    }

    var material = new Material({
        instructor: req.decoded._id,
        event: req.body.eventId,
        title: req.body.title,
        filename: req.body.filename,
    });

    return material.save()
    .then(function(){
        return res.json({});
    })
    .catch(function(err){
        console.error(err);
        return res.status(400).send(new ApiError('Upload', 'Could not save file.'));
    });



});

router.post('/delete-material', async (req, res) => {
    if (!req.body.id) {
        console.error("Not enough info to delete material.");
        return res.status(400).send(new ApiError('Material', 'Missing information.'));
    }
    if (!req.decoded.isInstructor) {
        return res.status(400).send(new ApiError('Material', 'Not authorized.'));
    }
    var material;
    try {
        material = await Material.findById(req.body.id);
        if (!material) {
            throw new Error("Material Empty")
        }
    } catch (e) {
        console.error(e);
        return res.status(400).send(new ApiError('Material', 'Could not delete material.'));
    }
    //Check event and make sure the instructor has permission.
    
    if (material.instructor != req.decoded._id) {
        console.error("INSTRUCTOR TRYING TO DELETE MATERIAL FROM SOMEONE ELSE'S CLASS");
        return res.status(400).send(new ApiError('Material', 'You are trying to delete material from a class you are not instructing.'));
    }
    Material.findByIdAndRemove(req.body.id)
    .then(function(){
        return res.json({});
    })
    .catch(function(err){
        console.error(err);
        return res.status(400).send(new ApiError('Material', 'Could not delete.'));
    });
});



module.exports = router;