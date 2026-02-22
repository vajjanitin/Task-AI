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

// Start server (works for both Render and local)
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`)
})

// For Vercel serverless deployment
export default app;