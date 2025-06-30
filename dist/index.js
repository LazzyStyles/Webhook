"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var cors_1 = __importDefault(require("cors"));
var crypto_1 = __importDefault(require("crypto")); // ✅ Correct way to import `crypto`
var app = (0, express_1.default)();
var PORT = parseInt(process.env.PORT || "3000", 10);
// Middleware
app.use((0, cors_1.default)()); // Enable CORS
app.use(express_1.default.json()); // Parse JSON requests
// GET endpoint for easy testing
app.get("/receive-data", function (_req, res) {
    res.status(200).json({ message: "GET request received successfully" });
});
var CLIENT_SECRET = ""; // Replace with actual secret
var PayoutWebhookEvent = /** @class */ (function () {
    function PayoutWebhookEvent(type, rawBody, data) {
        this.type = type;
        this.rawBody = rawBody;
        this.data = data;
    }
    return PayoutWebhookEvent;
}());
function generateHmacSHA256Signature(data, secret) {
    return crypto_1.default.createHmac("sha256", secret).update(data).digest("base64");
}
function payoutVerifyWebhookSignature(signature, rawBody, timestamp) {
    try {
        var signatureString = timestamp + rawBody;
        var generatedSignature = generateHmacSHA256Signature(signatureString, CLIENT_SECRET);
        if (generatedSignature === signature) {
            var parsedData = void 0;
            console.log("SuccessFul");
            try {
                parsedData = JSON.parse(rawBody);
            }
            catch (error) {
                if (error instanceof Error) {
                    console.error("Error processing webhook:", error.message);
                }
                else {
                    console.error("Unknown error occurred:", error);
                }
            }
            console.log("Verified Webhook Event:", parsedData);
        }
        else {
            console.error("Generated signature and received signature did not match");
        }
    }
    catch (error) {
        if (error instanceof Error) {
            console.error("Error verifying signature:", error.message);
        }
        else {
            console.error("Unknown error occurred:", error);
        }
    }
}
// POST API to receive data
app.post("/receive-data", function (req, res) {
    try {
        var requestData = req.body;
        var signature = req.headers["x-webhook-signature"];
        var timestamp = req.headers["x-webhook-timestamp"];
        var rawBody = JSON.stringify(req.body);
        console.log(signature);
        console.log(timestamp);
        console.log("Headers:", JSON.stringify(req.headers, null, 2));
        console.log("Body:", rawBody);
        payoutVerifyWebhookSignature(signature, rawBody, timestamp);
        // Respond with success message
        res.status(200).json({ message: "Data received successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});
app.post("/receive", function (req, res) {
    var requestData = req.body;
    console.log("Received Data:", requestData);
    // Respond with success message
    res.status(200).json({ message: "Data received successfully", data: requestData });
});
// Start server
app.listen(PORT, "0.0.0.0", function () {
    console.log("Server is running at http://0.0.0.0:".concat(PORT));
});
