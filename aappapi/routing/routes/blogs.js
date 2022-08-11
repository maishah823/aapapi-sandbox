var express = require('express');
var router = express.Router();
var adminGuard = require('../../guards/admin.guard');
var memberGuard = require('../../guards/member.guard');
var confGuard = require('../../guards/conf.guard');
var Blog = require('../../models/blog');
var ApiError = require('../../classes/ApiError');
var Validators = require('../../validators');
var Redis = require('../../services/redisSvc');
var multer = require('multer');
var multerS3 = require('multer-s3');

var AWS = require('aws-sdk');
AWS.config.update({ accessKeyId: process.env.AWS_ID, secretAccessKey: process.env.AWS_SECRET, region: 'us-east-2' });
var s3 = new AWS.S3();

router.get('/', adminGuard, (req, res) => {
    var page = parseInt(req.query.page || 1);
    var limit = parseInt(req.query.limit || 10);
    var query = { archived: { $ne: true } };
    Blog.paginate(query, {
        page: page,
        limit: limit,
        select: 'title summary coverImg media pinned type',
        sort: [['pinned', 1], ['created_at', -1]]

    })
        .then(function (blogs) {
            return res.json(blogs);
        })
        .catch(function (err) {
            console.error(err);
            return res.status(500).send(new ApiError('Posts', 'Could not retrieve posts.'));
        });
});

router.post('/', adminGuard, (req, res) => {
    if (!req.body.post || !req.body.post.body || !req.body.post.title || !req.body.post.coverImg || !req.body.post.summary) {
        return res.status(500).send(new ApiError('Posts', 'Could not add post. Insufficient Information.'));
    }
    req.body.post.body = req.body.post.body.trim();
    if (req.body.post._id && Validators.isValidObjectId(req.body.post._id)) {
        return Blog.findById(req.body.post._id)
            .then(function (blog) {
                var titleMessage;
                if (blog.title == req.body.post.title) {
                    titleMessage = blog.title;
                } else {
                    titleMessage = `${blog.title} to ${req.body.post.title}`;
                }
                blog.body = req.body.post.body;
                blog.title = req.body.post.title;
                blog.coverImg = req.body.post.coverImg;
                blog.summary = req.body.post.summary;
                return blog.save()
                    .then(function (saved) {
                        res.json({ complete: true });
                        Redis.writeToLog('Blogs', `${req.decoded.name} edited post: ${titleMessage}`);
                    })

            }).catch(function (err) {
                return res.status(500).send(new ApiError('Posts', 'Error editing post. Contact support.'));
            });

    } else {
        const newBlog = new Blog(req.body.post);
        newBlog.created_by = req.decoded._id;
        return newBlog.save()
            .then(function (post) {
                res.json({ complete: true });
                Redis.writeToLog('Blogs', `${req.decoded.name} added post: ${post.title}`);
            })
            .catch(function (err) {
                console.error(err);
                return res.status(500).send(new ApiError('Posts', 'Error adding post. Contact support.'));
            });
    }
});

router.get('/single/:id', (req, res) => {
    return Blog.findById(req.params.id).populate({ path: 'created_by', select: 'firstName lastName' })
        .then(function (post) {
            if (post.type != "public") {
                if (!req.decoded) {
                    return res.status(400).send(new ApiError('Posts', 'This post is not visible to you.'));
                }
                if (post.type == 'conf' && (req.decoded.isAttendee || req.decoded.isInstructor || req.decoded.isAdmin)) {
                    return res.json(post);
                }
                if (post.type == 'member' && (req.decoded.isMember || req.decoded.isAdmin)) {
                    return res.json(post);

                }
                return res.status(400).send(new ApiError('Posts', 'This post is not visible to you.'));
            }
            return res.json(post);
        })
        .catch(function (err) {
            console.error(err);
            return res.status(400).send(new ApiError('Posts', 'Could not find post.'));
        });

});

router.get('/announcements', (req, res) => {
    var page = parseInt(req.query.page || 1);
    var limit = parseInt(req.query.limit || 10);
    var query = { archived: { $ne: true }, type: 'public' };
    Blog.paginate(query, {
        page: page,
        limit: limit,
        select: 'title summary coverImg media pinned', sort: [['pinned', 1], ['created_at', -1]]

    })
        .then(function (blogs) {
            return res.json(blogs);
        })
        .catch(function (err) {
            console.error(err);
            return res.status(500).send(new ApiError('Posts', 'Could not retrieve posts.'));
        });
});

router.get('/member-news', memberGuard, (req, res) => {
    var page = parseInt(req.query.page || 1);
    var limit = parseInt(req.query.limit || 10);
    var query = { archived: { $ne: true }, type: 'member' };
    Blog.paginate(query, {
        page: page,
        limit: limit,
        select: 'title summary coverImg media pinned', sort: [['pinned', 1], ['created_at', -1]]

    })
        .then(function (blogs) {
            return res.json(blogs);
        })
        .catch(function (err) {
            console.error(err);
            return res.status(500).send(new ApiError('Posts', 'Could not retrieve posts.'));
        });
});

router.get('/conference-news', confGuard, (req, res) => {
    var page = parseInt(req.query.page || 1);
    var limit = parseInt(req.query.limit || 10);
    var query = { archived: { $ne: true }, type: 'conf' };
    Blog.paginate(query, {
        page: page,
        limit: limit,
        select: 'title summary coverImg media pinned', sort: [['pinned', 1], ['created_at', -1]]

    })
        .then(function (blogs) {
            return res.json(blogs);
        })
        .catch(function (err) {
            console.error(err);
            return res.status(500).send(new ApiError('Posts', 'Could not retrieve posts.'));
        });
});

router.post('/upload-sign', (req, res) => {
    if (!req.body.filename || !req.body.contenttype) {
        return res.status(400).send(new ApiError('File Upload', 'No file info received.'));
    }

    var filename = req.body.filename;
    var contenttype = req.body.contenttype;

    var params = {
        Bucket: process.env.BLOG_BUCKET,
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

var upload = multer({
    storage: multerS3({
      s3: s3,
      bucket: process.env.BLOG_BUCKET,
      acl: 'public-read',
      key: function (req, file, cb) {
        const split = file.originalname.split('.');
        const ext = split[split.length - 1];
        cb(null, "AAPP"+Date.now().toString() + "." + ext);
      }
    })
})

router.put('/upload-from-froala', upload.single('file'), (req, res) => {
    
    res.json({link:req.file.location});

});


module.exports = router;