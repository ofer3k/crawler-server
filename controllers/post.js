const Post=require('../models/post')
const slugify=require('slugify')
const pupeteer=require('puppeteer')

exports.create=(req,res)=>{
//    console.log(req.body)
const{title,content,user}=req.body //req.params

const slug=slugify(title)
// validate
switch(true){
    case !title:
        return res.status(400).json({
            error:'Title is required'
        })
        break;
    case !content:
        return res.status(400).json({
            error:'Content is required'
        })
        break;
}
// create
Post.create({title,content,user,slug},(err,post)=>{
    if(err){
        console.log(err)
        res.status(400).json({error:'Duplicate post. try another title'})
    }
    res.json(post)
})
} 
exports.list=(req,res)=>{
    Post.find({}).exec((err,posts)=>{
        if(err)console.log(err)
        res.json(posts)
    })

}
exports.read=(req,res)=>{
    const {slug}=req.params
    Post.findOne({slug}).exec((err,post)=>{
        if(err)console.log(err)
        res.json(post)
    })
}

exports.update=(req,res)=>{
    const {slug}=req.params
    const {title,content,user}=req.body
    Post.findOneAndUpdate({slug},{title,content,user},{new:true}).exec((err,post)=>{
        if(err) console.log(err)
        res.json(post)
    })
}
exports.remove=(req,res)=>{
    const {slug}=req.params
    Post.findOneAndRemove({slug}).exec((err,post)=>{
        if(err)console.log(err)
        res.json({
            message:'Post deleted'
        })
    })
}
exports.crawl=async (req,res)=>{
    const {title,content,user}=req.body
    // launching browser
    const browser=await pupeteer.launch({
        headless:false,
        defaultViewport:{width:1100,height:1080}
    });
    // creating new page
    const page=await browser.newPage()
    await page.goto('https://www.linkedin.com/uas/login')
    // insert auth of user
    await page.type('#username','ofer3klein@gmail.com')
    await page.type('#password','ofer3k1998')
    await page.click('.btn__primary--large.from__button--floating')
    sleep(3000)
    await page.goto('https://www.linkedin.com/in/stefanhyltoft')

    console.log(title,content,user)
    res.json({
        status:'200'
    })
}
const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
  }