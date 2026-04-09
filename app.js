const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const multer = require('multer');
require('dotenv').config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

const CHUNK_DELIMITER = "---KIRA_CHUNK_END---";

// 🔥 VARIACIONES (NO TOCAR)
const variaciones = [
    { type: "action-heavy", outfit: "full white protective suit with respirator mask and gloves", scene: "actively spraying a bed with visible mist spreading in the air", environment: "residential bedroom, slightly dramatic lighting", mood: "intense, high action", ratio: "4:5" },
    { type: "precision-work", outfit: "light professional uniform with gloves", scene: "carefully applying treatment to mattress seams using a small sprayer", environment: "close-up bedroom scene", mood: "detailed, precise, technical", ratio: "4:5" },
    { type: "inspection", outfit: "uniform polo shirt with cap and flashlight", scene: "inspecting a mattress closely with a flashlight", environment: "dim bedroom, focused lighting", mood: "investigation, expert diagnosis", ratio: "4:5" },
    { type: "trust-home", outfit: "clean red and black uniform", scene: "standing next to a clean bed, smiling slightly, holding equipment", environment: "bright modern bedroom", mood: "safe, calm, trustworthy", ratio: "4:5" },
    { type: "family-safe", outfit: "friendly professional uniform", scene: "technician explaining service to a family near a bedroom", environment: "clean home interior", mood: "friendly, safe for family", ratio: "4:5" },
    { type: "equipment-focus", outfit: "industrial uniform", scene: "holding and preparing professional fumigation equipment", environment: "garage or home entrance", mood: "professional tools", ratio: "1:1" },
    { type: "corporate-branding", outfit: "dark gray uniform with cap", scene: "standing next to a service vehicle outside a house", environment: "residential exterior", mood: "business, premium", ratio: "16:9" },
    { type: "before-after", outfit: "protective uniform", scene: "half untreated bed and half clean treated bed", environment: "split bedroom", mood: "transformation", ratio: "1:1" },
    { type: "hygiene-clean", outfit: "clean white uniform", scene: "spraying lightly in a spotless bedroom with sunlight", environment: "bright minimal room", mood: "clean, fresh", ratio: "4:5" },
    { type: "entry-service", outfit: "uniform with backpack sprayer", scene: "entering a house through the front door", environment: "house entrance", mood: "service arrival", ratio: "16:9" }
];

// 🔥 RANDOM SIMPLE
function getRandomVariations(arr, n = 3) {
    return [...arr].sort(() => 0.5 - Math.random()).slice(0, n);
}

// 🔥 DELAY
const delay = ms => new Promise(r => setTimeout(r, ms));

// 🔥 RETRY (ANTI 503)
async function generateWithRetry(model, content, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            return await model.generateContent(content);
        } catch (err) {
            if (err.status === 503 && i < retries - 1) {
                console.log("Retry...");
                await delay(2000);
            } else {
                throw err;
            }
        }
    }
}

function buildPrompt(prompt, v, colors) {
    return `
    You are a professional advertising creative director.

    Client request: "${prompt}"

    Create a photorealistic pest control advertisement.

    Main subject: Hispanic male technician.

    Outfit: ${v.outfit}
    Scene: ${v.scene}
    Environment: ${v.environment}
    Mood: ${v.mood}

    Design:
    - Clean layout
    - Space for text
    - Colors: ${colors || "red and white"}
    - Aspect ratio: ${v.ratio}

    Style:
    - Ultra realistic
    - Natural lighting

    Avoid:
    - Cartoon
    - 3D render
    `;
}

app.post('/generar', upload.single('logo'), async (req, res) => {

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.flushHeaders(); // 🔥 CLAVE

    const { prompt, colors, aspectRatio } = req.body;

    const model = genAI.getGenerativeModel({
        model: "gemini-3.1-flash-image-preview"
    });

    const seleccion = getRandomVariations(variaciones, 3);

    for (let i = 0; i < seleccion.length; i++) {
        const v = seleccion[i];

        try {
            if (aspectRatio) v.ratio = aspectRatio;

            const finalPrompt = buildPrompt(prompt, v, colors);

            let content = [finalPrompt];

            if (req.file) {
                content.push({
                    inlineData: {
                        data: req.file.buffer.toString("base64"),
                        mimeType: req.file.mimetype
                    }
                });
            }

            const result = await generateWithRetry(model, content);

            const candidate = result.response.candidates[0];
            const imagePart = candidate.content.parts.find(p => p.inlineData);

            if (imagePart) {
                res.write(JSON.stringify({
                    index: i,
                    image: `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`
                }) + CHUNK_DELIMITER);
            }

        } catch (err) {
            console.error(err.message);

            res.write(JSON.stringify({
                error: `Error en propuesta ${i + 1}`
            }) + CHUNK_DELIMITER);
        }

        await delay(1200);
    }

    res.end();
});

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.get('/', (req, res) => {
    res.render('index');
});

// 🔥 SERVER
app.listen(3000, () => {
    console.log("http://localhost:3000");
});