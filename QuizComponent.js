async function submitAnswer(userId, questionId, answer) {
    await fetch('/api/submitAnswer', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, questionId, answer }),
    });
}

async function fetchQuestion(id) {
    const response = await fetch(`/api/question/${id}`);
    const question = await response.json();
    return question;
}
