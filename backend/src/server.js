import express from 'express';
import path from 'path';
import { ENV } from './config/env.js';
import { connectDB } from './config/db.js';
import { clerkMiddleware } from '@clerk/express'

import { functions, inngest } from './config/inngest.js';
import { serve } from "inngest/express";

const app = express();
const __dirname = path.resolve();


app.use(express.json());
app.use(clerkMiddleware({    // adds auth Object under the req => re.auth
    secretKey: ENV.CLERK_SECRET_KEY,
    publishableKey: ENV.CLERK_PUBLISHABLE_KEY,
}));
app.use("/api/inngest", serve({client: inngest, functions}));

// make your app ready for deployment
if (ENV.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../admin/dist')));
  app.get('/{*any}', (req, res) => {
    res.sendFile(path.join(__dirname, '../admin', 'dist', 'index.html'));
  });
}

app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok" });
});


const startServer = async () => {
    try {
        await connectDB();
        app.listen(ENV.PORT, () => {
            console.log(`Server is running on port ${ENV.PORT}`);
        } );
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }   
};

startServer();