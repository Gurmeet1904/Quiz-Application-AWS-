const express = require('express');
const { storeUserAnswer, getQuestionById } = require('./dynamoDBService');
const router = express.Router();

router.post('/submitAnswer', async (req, res) => {
    const { userId, questionId, answer } = req.body;
    try {
        await storeUserAnswer(userId, questionId, answer);
        res.status(200).send('Answer stored successfully!');
    } catch (error) {
        res.status(500).send('Error storing answer.');
    }
});

router.get('/question/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const question = await getQuestionById(id);
        res.status(200).json(question);
    } catch (error) {
        res.status(500).send('Error fetching question.');
    }
});

module.exports = router;
