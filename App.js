// jshint version:es6
// this line is necessary for us to be able to omit any kind of errors that we might get because of es6 version
const express = require('express')
const app = express()
const bp = require('body-parser')
const hbs = require('express-hbs')
const mysql = require('mysql')
const md5 = require('md5')


// You need to install Oracle Mysql
// Make a user with username = root and password = root
// And make a database 'db_ssa'
const con = mysql.createConnection({
    host:       'localhost',
    user:       'root',
    password:   'root',
    database:   'db_ssa'
})

// HBS setup
app.engine('hbs', hbs.express4({
    partialsDir:__dirname+'/views/partials'
}))
app.set('view engine', 'hbs')
app.set('views', __dirname+'/views')

app.use(bp.json())
app.use(bp.urlencoded({ extended: true }))
// do you know how we can show the password to the 
// I dont want to implement it, because if someone
// uses internet explorer, then the option is inbuilt and it may clash

// POST REQUESTS
app.post('/loginRequest', (req,res)=>{
    let credentials = [req.body.un, req.body.pwd] // [Email, Password]
    credentials[0] = credentials[0].replace(/'/g, '&apos;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/, '&gt;')
    credentials[1] = credentials[0].replace(/'/g, '&apos;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/, '&gt;')
    credentials[1] = md5(credentials[1])

    con.query(`SELECT * FROM tbl_users WHERE clm_email = '${credentials[0]}' AND clm_pwd = '${credentials[1]}'`, (e,r)=>{
        if(e){
            res.send({
                status:false,
                error:e.message
            })
        } else {
            res.send({
                status:true,
                userCredentials:r[0]
            })
        }
    })
})
app.post('/signupRequest', (req,res)=>{
    let credentials = [req.body.un, req.body.email, req.body.pwd]
    // Check if user already exists (check through email because username and password can be same)
    // We'll have to make the table `tbl_users`. clm_un, clm_email and clm_pwd are custom column names
    /*
        TABLE STRUCTURE:tbl_users
            |   id          <unique number for each user>
            |   clm_un      <string>
            |   clm_email   <string>
            |   clm_pwd     <encrypted string>
            |   reg_date    <Timestamp, date registered>
    */
    // We'll also have to make sure that user is not doing SQL injection (hacking)
    // SQL injection can be identified if string has '' or "" in it. This crashes the database.
    // And we'll also format greater than, less than signs to NOT get confused in html tags
    // Let's implement it
    // why are we making credentials like this? all with index [0]? 
    // We are replacing certain characters (if found) in every element
    // There are 4 characters of concern:   '', "", <, >
    // To prevent SQL injection
    // We'll replace all of them with their HTML entities
    // there are loads of errors in this file
    // I cant see any
    // If you want i can put all of these queries in single line. If you want

    // Username
    credentials[0] = credentials[0].replace(/'/g, '&apos;')
    credentials[0] = credentials[1].replace(/"/g, '&quot;')
    credentials[0] = credentials[2].replace(/</g, '&lt;')
    credentials[0] = credentials[3].replace(/>/g, '&gt;')
    // Email
    credentials[1] = credentials[0].replace(/'/g, '&apos;')
    credentials[1] = credentials[1].replace(/"/g, '&quot;')
    credentials[1] = credentials[2].replace(/</g, '&lt;')
    credentials[1] = credentials[3].replace(/>/g, '&gt;')
    // Password
    credentials[2] = credentials[0].replace(/'/g, '&apos;')
    credentials[2] = credentials[1].replace(/"/g, '&quot;')
    credentials[2] = credentials[2].replace(/</g, '&lt;')
    credentials[2] = credentials[3].replace(/>/g, '&gt;')

    // Make password encrypted, use md5
    credentials[2] = md5(credentials[2])

    con.query(`SELECT * FROM tbl_users WHERE clm_email='${credentials[0]}'`, (err, ren)=>{
        if(err){
            // Some error occurred
            res.send({
                status:false,   // This is the same status object we have used in client files (Signup.hbs)
                error:`Encountered error: ${err.message}`
            })
        } else {
            if(ren.length >= 1){
                // If we received data, that means account exists
                res.send({
                    status:false,
                    error:'Account already exists. Consider logging in'
                })
            } else {
                // Account is new, add it
                con.query(`INSERT INTO tbl_users (clm_un, clm_email, clm_pwd) VALUES ('${credentials[0]}','${credentials[1]}','${credentials[2]}')`, (e,r)=>{
                    if(e){
                        // Encountered error
                        res.send({
                            status:false,
                            error:e.message
                        })
                    } else {
                        // Account made
                        res.send({
                            status:true
                        })
                    }
                })
            }
        }
    })
})

// GET REQUESTS
app.get("/", function(req, res){
    app.render('Index/Index', {none:null})
})
app.get('/login', (req,res)=>{
    app.render('Login/Login', {none:null})
})
app.get('/signup', (req,res)=>{
    app.render('Signup/Signup', {none:null})
})

app.listen(3000, ()=>{
    console.log("> App is running on http://localhost:5000")
})

