var express = require('express');
var router = express.Router();
var adminGuard = require('../../guards/admin.guard');
var memberGuard = require('../../guards/member.guard');
var confGuard = require('../../guards/conf.guard');
var Blog = require('../../models/blog');
var ApiError = require('../../classes/ApiError');



router.get('/single/:id', (req, res) => {
    return Blog.findById(req.params.id).populate({ path: 'created_by', select: 'firstName lastName' })
        .then(function (post) {
            if (post.type != "public") {
                
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



module.exports = router;