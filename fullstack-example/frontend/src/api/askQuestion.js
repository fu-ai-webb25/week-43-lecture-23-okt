export const askQuestion = async ({ question, history }) => {
    try {
        const response = await fetch('http://localhost:8080/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                question,
                history
            })
        });

        if (!response.ok) {
            throw new Error('Något gick fel vid API-anropet');
        }

        const data = await response.json();

        return data.answer;

    } catch (error) {
        throw new Error(error.message);
    }
}; 