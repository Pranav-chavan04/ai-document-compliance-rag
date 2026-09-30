const express = require("express");
const cors = require("cors");
const fileUpload = require("express-fileupload");

const aiRoutes = require("./routes/aiRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(fileUpload());

console.log("AI ROUTES LOADED:", aiRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "Node AI backend is running"
    });
});


app.post("/test", (req, res) => {
    res.json({
        message: "POST route works"
    });
});

app.use("/api/ai", aiRoutes);

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Node server running on port ${PORT}`);
});