const Post=require('../models/post')
const slugify=require('slugify')
const pupeteer=require('puppeteer')
const cheerio=require('cheerio')

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

exports.removeAll=async(req,res)=>{
    // const {slug}=req.params
    try {
        await Post.deleteMany();
        console.log('All Data successfully deleted');
      } catch (err) {
        console.log(err);
      }
      res.send('all was deleted')
}


exports.crawl=async (req,res)=>{
    const {title,content,user}=req.body
    let urls=['/in/ajrobbins/']
    urls.push('/in/daymondjohn/')
    
    // let linksToVisit
    let visitedLinks=[]
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
    await sleep(3200)
    while(urls.length>0){
        // fetch all url from db
        // await Post.find({}).exec((err,posts)=>{
        //     if(err)console.log(err)
        //     // sort and map the urls
        //     urls=posts.sort(function(a,b){return a.createdAt - b.createdAt}).map((el)=>el.title) 
        // })
        // 
        const currentUrl=urls.shift()
        if(visitedLinks.includes(currentUrl))continue
        await page.goto('https://www.linkedin.com'+currentUrl)
        await sleep(5000)
        const html =await page.content()
        const $=cheerio.load(html)
        // document.querySelectorAll('.pv-top-card__photo')
        const img=$('.pv-top-card__photo')[0]
        // console.log('img Node:',img.Node)
        // console.log('img title:',img.title)
        const newLinkToVisit=$('.pv-browsemap-section__member').map((index,element)=>$(element).attr('href')).get()
        // console.log(linksToVisit)
        newLinkToVisit.forEach(async(el)=>{
            let title,content,user ;//req.params
            title=el
            content='121'
            user='false'
            const slug=slugify(title)
// validate
switch(true){
    case !title:
        console.log('title is required!')
        break;
    case !content:
        console.log('content is required!')
        break;
}
// create
await Post.create({title,content,user,slug},(err,post)=>{
    if(err){
        console.log(err)
        // res.status(400).json({error:'Duplicate post. try another title'})
    }
    else{
        console.log('Create!')
        console.log('url:',post.title)
    }
    // res.json(post)
})
        })
        // linksToVisit=[...linksToVisit,...newLinkToVisit]
        // visitedLinks.push(currentUrl)
        // here
        const filter = { title: currentUrl };
        const update = { user: 'true' };

// `doc` is the document _after_ `update` was applied because of
// `returnOriginal: false`
        let doc = await Post.findOneAndUpdate(filter, update, {
            new:true,
        returnOriginal: false
        });
        console.log(doc)

        await Post.find({user:'false'},(err,posts)=>{
            // console.log('Find!')
            if(err)console.log(err)
            // console.log('before',urls)
            // sort and map the urls
            // sleep(10000)
            urls=posts.sort(function(a,b){return a.createdAt - b.createdAt}).map((el)=>el.title) 
            // console.log('url end:',urls)
            // adding a url beaceuse the find function is running before the create function
            // if(!urls.includes('/in/thejlo/')){
            //     urls.push('/in/thejlo/')
            // }
            console.log('url!!!',urls)
            // posts.sort(function(a,b){return a.createdAt - b.createdAt}).map((el)=>console.log(el.title))
        })
        // 
        await sleep(2000)
    }
    
    // console.log(title,content,user)
    res.json({
        status:'200'
    })
}
const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
  }
  