const express = require("express");
const axios = require("axios");
const FormData = require("form-data");

const router = express.Router();




router.post("/ask", async (req, res) => {
    try {
        const { question } = req.body;

        if (!question) {
            return res.status(400).json({
                message: "Question is required"
            });
        }

        console.log("QUESTION:", question);

        const response = await axios.post(
            "http://127.0.0.1:8000/ask",
            {
                question: question
            }
        );

        console.log("FASTAPI RESPONSE:", response.data);

        res.json({
            question: question,
            answer: response.data.answer
        });

    } catch (error) {

 
        res.status(500).json({
            message: "AI service failed",
            error: error.message,
            code: error.code
        });
    }
});



router.post("/upload", async (req, res) => {

    try {

        console.log("\n========== UPLOAD ==========");

        if (!req.files || !req.files.pdf) {

            console.log("NO PDF RECEIVED");

            return res.status(400).json({
                message: "PDF file is required"
            });
        }

        const pdf = req.files.pdf;

        console.log("PDF RECEIVED:", pdf.name);
        console.log("PDF SIZE:", pdf.size);

        const form = new FormData();

        form.append("file", pdf.data, {
            filename: pdf.name,
            contentType: "application/pdf"
        });

        console.log("Sending PDF to FastAPI...");

        const response = await axios.post(
            "http://127.0.0.1:8000/upload",
            form,
            {
                headers: {
                    ...form.getHeaders()
                },

                maxContentLength: Infinity,
                maxBodyLength: Infinity
            }
        );

        console.log(
            "FASTAPI UPLOAD RESPONSE:",
            response.data
        );

        res.json(response.data);

    } catch (error) {

       

        res.status(500).json({
            message: "PDF upload failed",
            error: error.message,
            code: error.code
        });
    }
});


module.exports = router;