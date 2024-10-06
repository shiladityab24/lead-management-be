const express = require('express')
const router = express.Router()
const cors = require('cors')
const salesforceService = require('../services/salesforceService')

// leads routes
router.get('/',salesforceService.getLeads)
router.post('/',salesforceService.createLeads)
router.put('/:id',salesforceService.updateLeads)
router.delete('/:id',salesforceService.deleteLeads)
module.exports = router
