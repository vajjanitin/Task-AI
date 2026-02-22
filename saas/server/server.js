import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import { clerkMiddleware, requireAuth } from '@clerk/express'
import aiRouter from './routes/aiRoutes.js';
import connectCloudinary from './configs/cloudinary.js';
import userRouter from './routes/userRoutes.js';

const app = express();
await connectCloudinary()

const allowedOrigins = (process.env.CORS_ORIGIN || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(
    cors({
        origin: allowedOrigins.length ? allowedOrigins : true,
        credentials: true,
    })
)
app.use(express.json())
app.use(clerkMiddleware())

app.get('/', (req, res) => {
    res.send('server is live')
})

app.use('/api/ai', aiRouter)
app.use('/api/user',userRouter)

const PORT = process.env.PORT || 3000

// For Vercel serverless
export default app;

// For local development
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server is listening on port ${PORT}`)
    })
}