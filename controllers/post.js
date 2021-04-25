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
    await page.setDefaultNavigationTimeout(0);
    await page.click('.btn__primary--large.from__button--floating')
    
    do {
        const currentUrl=urls.shift()
        const filter = { title: currentUrl };
        const update = { user: 'true' };

        await Post.findOneAndUpdate(filter, update, {
            new:true,
        returnOriginal: false
        });
        await sleep(1200)
        await page.goto('https://www.linkedin.com'+currentUrl)
        await sleep(13000)
        const html =await page.content()
        const $=cheerio.load(html)
        // let pageTitle = $('title').text();

        const newLinkToVisit=$('.pv-browsemap-section__member').map((index,element)=>$(element).attr('href')).get()
        console.log(newLinkToVisit)
        newLinkToVisit.forEach(async(el)=>{
            let title,content,user ;//req.params
            // the  end of the url to keep the crawling
            title=el
            // the full url to present in the front
            content='pageTitle'
            // isBeen visited already? to change after the visit
            user='false'
            // just a slug
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
    }
    else{
        console.log('Create!')
        console.log('url:',post.title)
    }
})
        })

      await  sleep(10000)
      console.log(newLinkToVisit)
        await Post.find({user:'false'},(err,posts)=>{
            // console.log('Find!')
            if(err)console.log(err)
            
            urls=posts.sort(function(a,b){return a.createdAt - b.createdAt}).map((el)=>el.title) 
           
            console.log('url!!!',urls)
       
        })
        // 
        await sleep(1000)
        
    } while (urls.length>0);
  
    
    
    // console.log(title,content,user)
    res.json({
        status:'200'
    })
}
const sleep = (milliseconds) => {
    return new Promise(resolve => {
        console.log('sleeping for -',milliseconds/1000, ' secondes')
        setTimeout(resolve, milliseconds)
    })
  }
  