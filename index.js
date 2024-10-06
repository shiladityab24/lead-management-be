const express = require('express')
const cors = require('cors');
const bodyParser = require('body-parser');
const jsforce = require('jsforce');
const app = express()
const {PORT, BACKEND_URL,APP_URL} = require('./src/config')
const authController = require('./src/controllers/authController')
const leadController = require('./src/controllers/leadController')

app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())



//create a test api to check if server is running
app.get('/test', (req, res)=>{
    res.json({"success":true, "message": "server is running"})
})
// app.get('/connection', (req, res)=>{
//     const conn = new jsforce.Connection({
//         loginUrl : SF_LOGIN_URL
//       });
//       const username = SF_USERNAME
//       const password = SF_PASSWORD //password+securitytoken
//       conn.login(username, password, function(err, userInfo) {
//         if (err) { return console.error(err); }
//         // Now you can get the access token and instance URL information.
//         // Save them to establish connection next time.
//         console.log(conn.accessToken);
//         console.log(conn.instanceUrl);
//         // logged in user property
//         console.log("User ID: " + userInfo.id);
//         console.log("Org ID: " + userInfo.organizationId);
//         // ...
//       });
      
// })

const allowedOrigins = [APP_URL]
app.use(cors({
    origin:allowedOrigins
}))
app.use('/oauth2',authController)
app.use('/leads',leadController)
app.listen(PORT,()=>{
    console.log(`server is running on: ${BACKEND_URL}`)
})