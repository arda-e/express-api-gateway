import { Router } from 'express'
import app from "../../app";

const router = Router()

router.get('/', (req, res) => {
    res.send('Hello World!');
})

export default router