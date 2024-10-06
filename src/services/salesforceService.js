const jsforce = require('jsforce')
const LocalStorage = require('node-localstorage').LocalStorage
const lcStorage = new LocalStorage('./info')
const {SF_LOGIN_URL, SF_CLIENT_ID, SF_CLIENT_SECRET, SF_CALLBACK_URL,APP_URL} = require('../config')
//Initialize OAuth2 Config
const oauth2 = new jsforce.OAuth2({
    loginUrl:SF_LOGIN_URL,
    clientId : SF_CLIENT_ID,
    clientSecret : SF_CLIENT_SECRET,
    redirectUri : SF_CALLBACK_URL
})

//Function to perform Salesforce login
const login = (req, res)=>{
    res.redirect(oauth2.getAuthorizationUrl({ scope : 'full' }));
}

//Callback function to get Salesforce Auth token
const callback = (req, res)=>{
    const {code} = req.query
    if(!code){
        console.error("Failed to get authorization code from server callback")
        return res.status(500).send("Failed to get authorization code from server callback")
    }
    // console.log("code", code)
    // res.status(200).send({"success": true,"code":code})
    const conn = new jsforce.Connection({oauth2:oauth2})
    conn.authorize(code, function(err){
        if(err){
            console.error(err);
            return res.status(500).send(err)
        }
        // console.log("Access token", conn.accessToken)
        // console.log("refresh token", conn.refreshToken)
        // console.log("Instance url", conn.instanceUrl)
        lcStorage.setItem('accessToken',conn.accessToken || '')
        lcStorage.setItem('instanceUrl',conn.instanceUrl || '')
        res.redirect(APP_URL)
        // res.status(200).send({"success": true,"message":"Authorization code fetched successfully","code":code,"Access token":conn.accessToken,"refresh token": conn.refreshToken,"Instance url": conn.instanceUrl})
    })
}

// Function to Create Connection
const createConnection = () =>{
    let instanceUrl = lcStorage.getItem('instanceUrl')
    let accessToken = lcStorage.getItem('accessToken')
    if(!accessToken){
        return res.status(200).send({})
    }
    return new jsforce.Connection({
        accessToken,
        instanceUrl
    })
}
// Function to get logged-in user details
const whoAmI =(req,res)=>{
    const conn = createConnection(res)
    conn.identity((error,data)=>{
        if(error){
            // do error handling
            handleSalesforceError(error,res)
            return 
        }
        res.json(data)
    })
}

// Function to perform salesforce logout and clear localstorage
const logout = (req,res)=>{
    lcStorage.clear()
    res.redirect(`${APP_URL}/login`)
}

// Centralized error handler function

const handleSalesforceError = (error,res)=>{
    if(error.errorCode === 'INVALID_SESSION_ID'){
        lcStorage.clear()
        res.status(200).send({})
    }else {
        console.error("Error",error)
        res.status(500).send(error)
    }
}


// Function to get Leads from Salesforce
const getLeads = (req,res)=>{
    const conn = createConnection(res)
    conn.query("SELECT Id, FirstName, LastName, Pan_Number__c, MobilePhone, Company, LeadSource, Amount__c, Date__c, Description, CreatedDate FROM Lead ORDER BY Date__c DESC",function(error,result){
        if(error){
            handleSalesforceError(error,res)
            return
        }
        console.log("result",result)
        res.json(result)
    })
}

// Function to create an Lead record from Salesforce
const createLeads = (req,res)=>{
    const conn = createConnection(res)
    const {FirstName,LastName,Pan_Number__c,MobilePhone,Company,LeadSource,Amount__c,Date__c,Description} = req.body
    conn.sobject("Lead").create({FirstName,LastName,Pan_Number__c,MobilePhone,Company,LeadSource,Amount__c,Date__c,Description},function(error,result){
        if(error){
            handleSalesforceError(error,res)
            return
        }
        console.log("result",result)
        res.json(result)
    })
}


// Function to update an Expense record inSalesforce
const updateLeads = (req,res)=>{
    const conn = createConnection(res)
    const {id} = req.params
    const {FirstName,LastName,Pan_Number__c,MobilePhone,Company,LeadSource,Amount__c,Date__c,Description} = req.body
    conn.sobject("Lead").update({Id:id,FirstName,LastName,Pan_Number__c,MobilePhone,Company,LeadSource,Amount__c,Date__c,Description},function(error,result){
        if(error){
            handleSalesforceError(error,res)
            return
        }
        console.log("result",result)
        res.json(result)
    })
}

// Function to delete an Expense record inSalesforce
const deleteLeads = (req,res)=>{
    const conn = createConnection(res)
    const {id} = req.params
    conn.sobject("Lead").destroy(id,function(error,result){
        if(error){
            handleSalesforceError(error,res)
            return
        }
        console.log("result",result)
        res.json(result)
    })
}




module.exports={
    login, 
    callback,
    whoAmI,
    logout,
    getLeads,
    createLeads,
    updateLeads,
    deleteLeads
}