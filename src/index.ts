import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express, { Request, Response } from "express";
import { spotifyMcpServer } from "./server.js";
import axios from "axios";
import { AuthService } from "./auth/authservice.js";

import { config as envConfig } from "dotenv";

const app = express();
app.use(express.json());
envConfig();

const authService = AuthService.getInstance();

app.get("/callback", async (req: Request, res: Response) => {
    const code = req.query.code as string;
    const state = req.query.state as string;
    if (!code || !state) {
        res.status(400).send("Missing code or state in callback");
        return;
    } else {
        try {
            const success = await authService.receiveToken(code, state);
            if (!success) {
                res.status(500).send("Failed to retrieve access token");
            }
            res.send("Authentication successful! You can close this window.");
        } catch (error) {
            console.error("Error during token retrieval:", error);
            res.status(500).send("Internal Server Error");
            return;
        }
    }
});

app.post("/mcp", async (req: Request, res: Response) => {
    const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
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
}).on("error", (error: unknown) => {
    console.error("Server error:", error);
    process.exit(1);
});
