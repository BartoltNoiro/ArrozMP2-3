const express = require("express")
const bodyparser = require("body-parser")
const session = require("express-session")
const cookieparser = require("cookie-parser")
const path = require("path")
const app = express()
const mongoose = require("mongoose")

const User = require("./models/users.js").User //.Student   but since 1 model lang

const urlencoder = bodyparser.urlencoded({
    extended:false 
})

mongoose.connect("mongodb://localhost/student-db", {
    useNewUrlParser: true
})

app.use(express.static(__dirname + '/public'));

app.use(session({
    secret: "very secret",
    resave: false, 
    saveUninitialized: true, 
    cookie:{
        maxAge: 1000 * 60 * 60
    }  
}))
app.get("/", function(req,res){
    if(req.session.username){
        //if user is signed in 
        // go to home.html
        res.render("homepage.hbs", {
            username: req.session.username 
        })
    }else{  
        //if user is not signed in
        res.render("login.hbs", {})
        }
})
/* 
- greet the user with their username 
- 3 errors 
    - [reg] enter a username and password 
    - [reg] username already taken 
    - [login] username and password does not match 
- remember existing/registered users 
*/ 

app.post("/register", urlencoder, function(req,res){
    let username = req.body.un
    let password = req.body.pw 
    if(username == "" || password == ""){
        // send error 
        res.render("login.hbs", {
            regerror: "Enter a username and password"
        })
    }else if (User.exists({username: req.body.un}).then((doc)=>{
            console.log("exists doc:  "+doc);
            if(doc == true){
                res.render("login.hbs", {
                    regerror: "Username already taken"
                })
            }else{ //if everything is correct
                // if req.session.username is defined, the user is signed in 
                req.session.username = req.body.un 
                let users = new User ({
                    username: username,
                    password: password
                })
                users.save().then((doc)=>{
                    console.log("Successfully added: " + doc)
                }, (err)=>{
                    console.log("Error in adding: " + doc)
                })


                res.redirect("/")
            }
        })
    ){
        console.log("this shud work")
    }
})

app.post("/login", urlencoder, function(req,res){
    
    User.findOne({username:req.body.un, password: req.body.pw}).then((doc)=>{
        console.log(JSON.stringify(doc))
        if(doc==null){
            User.findOne({username:req.body.un}).then((docs)=>{
                if(docs==null){
                    res.render("login.hbs", {
                        loginerror: "User does not exist"
                    })
                }else{
                    res.render("login.hbs", {
                        loginerror: "Username and Password does not match"
                    })
                }
            })
        }else{
            req.session.username = req.body.un
            res.redirect("/")
        }
    })
})


// going to logout
app.get("/logout", (req, res)=>{
    req.session.destroy()
    res.redirect("/")
})
// going to Submission
app.get("/submission", (req, res)=>{
    res.render("submission.hbs", {})
    
})
// going to homepage
app.get("/home",(req, res)=>{
    res.redirect("/")
})
app.get("/login", (req, res)=>{
    res.render("login.hbs", {})
    
})
//SUBMISSION FORM GETTING DATA (Don't know where to put this if this should be inside the .get in submission)
app.post("/addsubmission", (req, res)=>{
    res.redirect("/")
    /* Set each variable to mongodb
    these are the variables 
    >title
    >author
    >email
    >dlink (download link)
    >shortdescription *** no input type yet inside the .hbs file yet (need to fix)
    >tag1
    >tag2
    >tag3
    >tag4
    >tag5

    then just do the add like in users
    
    */
})

//going to userprofile
app.get("/userprofile",(req, res)=>{
    res.render("userprofile.hbs",{
        username: req.session.username
        //Viewing of the submitted houses should be here depending on the DB sorry i dont know the syntax
    })
})

app.get("/viewpost",(req, res)=>{
    res.render("viewpost.hbs")
})

app.listen(3000, function(){
    console.log("Now listening to port 3000")
})