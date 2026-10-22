import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';

import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';
import { embeddingModel } from '../src/config/ollama.config.js'; 
import { supabase } from '../src/config/supabase.config.js';

// Steg 1. Hämta alla pdf-filer
const documentsPath = path.resolve('documents');
const files = await fs.readdir(documentsPath);

const pdfFiles = files.filter(file => file.endsWith('.pdf'));

const documents = [];

for(const file of pdfFiles) {
    const loader = new PDFLoader(
        path.join(documentsPath, file)
    )

    const pages = await loader.load();

    for(const page of pages) {
        page.metadata.source = file;
    }

    documents.push(...pages);
}


// Steg 2. Dela upp texten i chunks
const splitter = new RecursiveCharacterTextSplitter({
    chunkSize : 1000,
    chunkOverlap : 200
});

const chunks = await splitter.splitDocuments(documents);

// Steg 3. Skapa embeddings och skicka upp i supabase
await SupabaseVectorStore.fromDocuments(
    chunks,
    embeddingModel, 
    {
        client : supabase,
        tableName : 'documents',
        queryName : 'match_documents'
    }
);

console.log('Alla dokument inlästa och uppladdade!')