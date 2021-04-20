const express=require('express')
const router = require('express').Router(); 

// import controllers methods
const {create,list,read,update,remove,crawl, removeAll}=require('../controllers/post');

router.get('/crawl',crawl)
router.post('/post',create)
router.get('/posts',list)
router.get('/posts/:slug',read)
router.put('/post/:slug',update)
router.delete('/posts/:slug',remove)
router.delete('/postsall',removeAll)

module.exports=router