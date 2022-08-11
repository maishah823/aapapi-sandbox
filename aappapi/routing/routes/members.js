var express = require('express');
var router = express.Router();
var memberGuard = require('../../guards/member.guard');
var User = require('../../models/user');
var ApiError = require('../../classes/ApiError');
var GalleryItem = require('../../models/galleryItem');

var AWS = require('aws-sdk');
AWS.config.update({ accessKeyId: process.env.AWS_ID, secretAccessKey: process.env.AWS_SECRET, region: 'us-east-2'});
var s3 = new AWS.S3();

router.use(memberGuard);

router.get('/listing', (req, res) => {
    var page = parseInt(req.query.page || 1);
    var limit = parseInt(req.query.limit || 10);
    var query = {};
    var searchQuery;
    if (req.query.search) {
        searchQuery = [
            { "lastName": { $regex: new RegExp(req.query.search), $options: 'i' } },
            { "firstName": { $regex: new RegExp(req.query.search), $options: 'i' } },
            { "email": { $regex: new RegExp(req.query.search), $options: 'i' } },
            { "address.city": { $regex: new RegExp(req.query.search), $options: 'i' } },
            { "address.state": { $regex: new RegExp(req.query.search), $options: 'i' } }
        ];
    }


    if (searchQuery) {
        query = {
            $or: searchQuery
        }
    }

    query.isMember = true;
    query.active = true;
    query.isDeveloper = {$ne:true};

    return User.paginate(query, { page: page, limit: limit, sort:{lastName: 1},select: 'firstName lastName address email', options: { sort: [['lastName', 1], ['firstName', 1]] } })
        .then(function (members) {
            return res.json(members);
        })
        .catch(function (err) {
            console.error(err);
            return res.status(500).send(new ApiError('Member Listing', 'Could not retrieve member information.'));
        });
});

router.post('/upload-sign', function (req, res) {
    if (!req.body.filename || !req.body.contenttype) {
        return res.status(400).send(new ApiError('File Upload', 'No file info received.'));
    }

    var filename = req.body.filename;
    var contenttype = req.body.contenttype;

    var params = {
        Bucket: process.env.MEMBER_GALLERY_BUCKET,
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

router.post('/save-gallery-image', (req, res) => {
    if (!req.body.filename) {
        return res.status(400).send(new ApiError('File Upload', 'No file found.'));
    }
    if (!req.body.caption) {
        return res.status(400).send(new ApiError('File Upload', 'No caption found.'));
    }

    var album = req.body.album || 'Uncategorized';

    var galleryItem = new GalleryItem({
        type: 'member',
        caption: req.body.caption,
        album: album,
        filename: req.body.filename,
        created_by: req.decoded._id,

    });

    galleryItem.save()
        .then(function (item) {
            res.json({ complete: true });
        })
        .catch(function (err) {
            console.error(err);
            return res.status(500).send(new ApiError('Gallery', 'Could not save uploaded image.'));
        });
});

router.get('/gallery', (req, res) => {
    var page = parseInt(req.query.page || 1);
    var limit = parseInt(req.query.limit || 10);
    var query = {};

    if(req.query.album){
        query.album = req.query.album;
    }
    

    return GalleryItem.paginate(query, { page: page, limit: limit, populate:[{path:'created_by',select:'firstName lastName'}], sort: [['created_at','-1']]})
        .then(function (items) {
            return res.json(items);
        })
        .catch(function (err) {
            console.error(err);
            return res.status(500).send(new ApiError('Gallery', 'Could not retrieve gallery images.'));
        });
});


module.exports = router;