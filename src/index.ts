import express, { Request, Response } from "express";
import cors from "cors";
import crypto from "crypto"; // ✅ Correct way to import `crypto`


const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);

// Middleware
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON requests

// GET endpoint for easy testing
app.get("/receive-data", (_req: Request, res: Response) => {
    res.status(200).json({ message: "GET request received successfully" });
});
  
const CLIENT_SECRET = "cfsk_ma_test_9286b08884bdd23d55799583bf5e0a9a_3efda642"; // Replace with actual secret

class PayoutWebhookEvent {
  type: string;
  rawBody: string;
  data: any;

  constructor(type: string, rawBody: string, data: any) {
    this.type = type;
    this.rawBody = rawBody;
    this.data = data;
  }
}

function generateHmacSHA256Signature(data: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(data).digest("base64");
}

function payoutVerifyWebhookSignature(
  signature: string,
  rawBody: string,
  timestamp: string
): void {
  try {
    const signatureString = timestamp + rawBody;
    const generatedSignature = generateHmacSHA256Signature(signatureString, CLIENT_SECRET);

    if (generatedSignature === signature) {
      let parsedData: any;
      console.log("SuccessFul");

      try {
        parsedData = JSON.parse(rawBody);
      } catch (error) {
        if (error instanceof Error) {
            console.error("Error processing webhook:", error.message);
          } else {
            console.error("Unknown error occurred:", error);
          }
      }

      console.log("Verified Webhook Event:", parsedData);
    } else {
      console.error("Generated signature and received signature did not match");
    }
  } catch (error) {
    if (error instanceof Error) {
        console.error("Error verifying signature:", error.message);
      } else {
        console.error("Unknown error occurred:", error);
      }
  }
}

// POST API to receive data
app.post("/receive-data", (req: Request, res: Response) => {
    try {
        const requestData = req.body;
        const signature = req.headers["x-webhook-signature"] as string;
        const timestamp = req.headers["x-webhook-timestamp"] as string;
        const rawBody = JSON.stringify(req.body);
        console.log(signature);
        console.log(timestamp);
        console.log("Headers:", JSON.stringify(req.headers, null, 2));
        console.log("Body:", rawBody);
        payoutVerifyWebhookSignature(signature,rawBody,timestamp);
        // Respond with success message
        res.status(200).json({ message: "Data received successfully"});
    } catch (error: any) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

app.post("/receive", (req: Request, res: Response) => {
        const requestData = req.body;
        console.log("Received Data:", requestData);

        // Respond with success message
        res.status(200).json({ message: "Data received successfully", data: requestData });
    
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://0.0.0.0:${PORT}`);
});
