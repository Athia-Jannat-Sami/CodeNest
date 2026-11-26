
const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "100kb" }));
app.use(express.static("frontend"));

// Compiler API
app.post("/api/compile", async (req, res) => {

    try {
        const { language, code, input } = req.body;

        // Check code
        if (!code || !code.trim()) {
            return res.status(400).json({
                error: "Please write some code first!"
            });
        }

        // Judge0 language IDs
        const languages = {
            c: 50,
            cpp: 54,
            java: 62
        };

        const languageId = languages[language];

        if (!languageId) {
            return res.status(400).json({
                error: "Unsupported programming language!"
            });
        }

        if (code.length > 20000) {
            return res.status(400).json({
                error: "Code is too long!"
            });
        }

        const judge0Url = (
            process.env.JUDGE0_API_URL || "https://ce.judge0.com"
        ).replace(/\/+$/, "");

        // Submit code to Judge0
        const submission = await axios.post(
            `${judge0Url}/submissions?base64_encoded=true&wait=false`,
            {
                source_code: Buffer.from(code, "utf8").toString("base64"),
                language_id: languageId,
                stdin: Buffer.from(input || "", "utf8").toString("base64")
            },
            {
                timeout: 15000
            }
        );

        const token = submission.data.token;

        if (!token) {
            return res.status(502).json({
                error: "Could not create a compilation submission."
            });
        }

        // Check compilation status
        let result;

        for (let i = 0; i < 20; i++) {

            await new Promise(resolve => setTimeout(resolve, 1000));

            const response = await axios.get(
                `${judge0Url}/submissions/${token}?base64_encoded=true`,
                {
                    timeout: 15000
                }
            );

            result = response.data;

            // Decode Base64 output into readable text
            const decodeBase64 = (value) => {
                return value
                    ? Buffer.from(value, "base64").toString("utf8")
                    : "";
            };

            result.stdout = decodeBase64(result.stdout);
            result.stderr = decodeBase64(result.stderr);
            result.compile_output = decodeBase64(result.compile_output);
            result.message = decodeBase64(result.message);

            // 1 = In Queue, 2 = Processing
            if (result.status && result.status.id > 2) {
                break;
            }
        }

        // Check compilation status
        if (!result || !result.status || result.status.id <= 2) {
            return res.status(504).json({
                error: "Compilation is taking too long. Please try again."
            });
        }

        // Send result to frontend
        res.json({
            status: result.status.description,
            output: result.stdout || "",
            error: result.compile_output || result.stderr || result.message || "",
            time: result.time,
            memory: result.memory
        });

    } catch (error) {

        console.error("Compiler Error:", error.message);

        if (error.response) {
            console.error("Judge0 Error Details:", error.response.data);

            return res.status(502).json({
                error: "Judge0 Error: " +
                    JSON.stringify(error.response.data)
            });
        }

        res.status(502).json({
            error: "Unable to connect to Judge0. Please try again."
        });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`CodeNest server running on port ${PORT}`);
});
