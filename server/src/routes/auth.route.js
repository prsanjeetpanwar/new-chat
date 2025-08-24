import express from "express"
import { SignUp,Login,Logout, onboard } from "../controllers/auth.controller.js"
import { protectRoute } from "../middleware/auth.middleware.js"


const router=express.Router()

router.post('/signup',SignUp)

router.post('/login',Login)
 
router.post('/logout',Logout)


router.post('/onboarding', protectRoute,onboard)

router.get('/me',protectRoute, (req,res)=>{
    res.status(200).json({success:true, user: req.user})
})


export default router

