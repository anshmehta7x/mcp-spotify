import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express, { Request, Response } from "express";
import axios from "axios";
import { AuthService } from "./auth/authservice.js";
import { spotifyMcpServer } from "./index.js";

import { config as envConfig } from "dotenv";

const app = express();
app.use(express.json());
envConfig();

const authService = AuthService.getInstance();

app.get("/ping", async (req: Request, res: Response) => {
    res.send("pong");
})

app.get("/callback", async (req: Request, res: Response) => {
    const code = req.query.code as string;
    const state = req.query.state as string;
    if (!code || !state) {
        res.status(400).send("Missing code or state in callback");
        return;
    } else {
        try {
            const result = await authService.receiveToken(code, state);
            if (!result.success) {
                res.status(400).send(`Authentication failed: ${result.error}`);
                return;
            }
            
            res.send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Spotify Auth Success</title>
                    <style>
                        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                               text-align: center; padding: 50px; background: #1DB954; color: white; }
                        .container { background: rgba(0,0,0,0.3); padding: 40px; border-radius: 10px; max-width: 500px; margin: 0 auto; }
                        h1 { margin-bottom: 20px; }
                        p { margin-bottom: 20px; }
                        .button { background: white; color: #1DB954; padding: 15px 30px; 
                                 text-decoration: none; border-radius: 30px; font-weight: bold; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>✅ Authentication Successful!</h1>
                        <p>Your Spotify account has been connected to mcp-spotify.</p>
                        <p>You can now close this window and return to your MCP client.</p>
                        <p><small>Session ID: ${result.sessionId}</small></p>
                    </div>
                    <script>
                        // Auto-close after 3 seconds
                        setTimeout(() => {
                            window.close();
                        }, 3000);
                    </script>
                </body>
                </html>
            `);
        } catch (error) {
            console.error("Error during token retrieval:", error);
            res.status(500).send("Internal Server Error");
            return;
        }
    }
});

// Health check endpoint
app.get("/health", async (req: Request, res: Response) => {
    const authenticatedUsers = authService.getAuthenticatedUserCount();
    res.json({
        status: "healthy",
        authenticatedUsers,
        timestamp: new Date().toISOString(),
    });
});

app.post("/mcp", async (req: Request, res: Response) => {
    // Generate unique session ID for each MCP connection
    const sessionId = `mcp_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    
    const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => sessionId,
        enableJsonResponse: true,
    });

    res.on("close", () => {
        transport.close();
    });

    await spotifyMcpServer.connect(transport);
    await transport.handleRequest(req, res, req.body);
});

const port = parseInt(process.env.PORT || "3000");
app.listen(port, () => {
    console.log(`Spotify MCP Server running on http://localhost:${port}/mcp`);
    console.log(`Health check: http://localhost:${port}/health`);
    console.log(`Auth callback: http://localhost:${port}/callback`);
}).on("error", (error: unknown) => {
    console.error("Server error:", error);
    process.exit(1);
});
