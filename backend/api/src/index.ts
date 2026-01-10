import express from "express";
import cors from "cors";
import { loadChallenges } from "./utils/challengeLoader";

const app = express();
const port = 22;

app.use(cors());
app.use(express.json());

app.get("/idelab/challenges", async (req, res) => {
    try {
        const challenges = await loadChallenges();
        res.json(challenges);
    } catch (error) {
        res.status(500).json({ message: "Failed to load challenges" });
    }
});

app.get("/idelab/challenges/:id", async (req, res) => {
    try {
        const challenges = await loadChallenges();
        const challenge = challenges.find((c) => c.id === req.params.id);
        if (challenge) {
            res.json(challenge);
        } else {
            res.status(404).json({ message: "Challenge not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "Failed to load challenge" });
    }
});

app.listen(port, () => {
    console.log(`IDE-Lab API running at http://localhost:${port}`);
});
