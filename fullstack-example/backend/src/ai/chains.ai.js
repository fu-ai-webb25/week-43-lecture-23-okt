import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence, RunnablePassthrough } from "@langchain/core/runnables";
import { standaloneQuestionPrompt, answerPrompt } from "./prompts.ai.js";
import { llm } from '../config/ollama.config.js'
import { retrieveDocuments } from './retriever.ai.js';
import { combineDocuments } from '../utils/combineDocuments.js';
import { routingPrompt } from "./prompts.ai.js";
import { routingSchema } from "./schemas.ai.js";

export const llmRoutingChain = RunnableSequence.from([
    routingPrompt,
    llm.withStructuredOutput(routingSchema)
]);

// Steg 1. Omvandla frågan till en standalone question
const standaloneQuestionChain = RunnableSequence.from([
    standaloneQuestionPrompt,
    llm,
    new StringOutputParser()
]);

// Steg 2. Hämta relevant information/kontext från databasen
const retrieverChain = RunnableSequence.from([
    (data) => data.standaloneQuestion,
    retrieveDocuments,
    combineDocuments
]);

// Steg 3. Generera ett svar med hjälp av kontexten
const answerChain = RunnableSequence.from([
    answerPrompt,
    llm,
    new StringOutputParser()
]);

export const chain = RunnableSequence.from([
    {
        standaloneQuestion : standaloneQuestionChain,
        originalQuestion : new RunnablePassthrough()
    },
    {
        context : retrieverChain,
        question : ({ originalQuestion }) => originalQuestion.question,
        history : ({ originalQuestion }) => originalQuestion.history,
    },
    answerChain 
]);

// export const chain = RunnableSequence.from([
//     async (data) => {
//         const standaloneQuestion = await standaloneQuestionChain.invoke(data);
//         return { standaloneQuestion, question : data.question, history : data.history }
//     },
//     async (data) => {
//         const documents = await retrieverChain.invoke(data);
//         return {
//             context : documents,
//             question : data.question,
//             history : data.history
//         }
//     },
//     async (data) => {
//         const answer = await answerChain.invoke(data);
//         return answer;
//     }
// ]);