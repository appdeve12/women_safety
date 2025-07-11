const express=require("express");
const router=express.Router();
const womencontroller=require("../controllers/women.controller")
router.get('/getall',womencontroller.getwomendata);
router.get('/getwomennear',womencontroller.getWomenWithNearestPolice);
router.post('/womendata',womencontroller.womendatapost);

module.exports=router;