import express from "express";
// import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';
const port= 5000;
const app= express();
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function testGemini() {
  const response = await ai.models.generateContent({
    model: "gemini-1.5-flash",
    contents: "Hello",
  });

  console.log(response.text);
}

testGemini();
//middleware
app.use(express.json());
//test route 
app.get('/',(req,res) => {
	res.send("server is running")
})
//POST routine
app.post("/ask",(req,res) => {
	try{
		const {question}=  req.body;
		console.log(question);

	const rawdata = fs.readFileSync('documents.json','utf-8');
	const data = JSON.parse(rawdata)
	console.log( typeof rawdata);
	console.log(typeof data);
	console.log(data)
	res.json({
		message: "question recieved",
		question: question,
	})
} catch(err){
	console.error('error reading file',err);
}

})
app.listen(5000,() =>{
	console.log("server is running on port 5000")
})

 