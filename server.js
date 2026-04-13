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
    model: "gemini-2.0-flash",
    contents: "Hello",
  });

  console.log(response.text);
}

//  testGemini();
//middleware
app.use(express.json());
//test route 
app.get('/',(req,res) => {
	res.send("server is running")
})
//POST routine
app.post("/ask",async(req,res) => {
	try{
		const {question}=  req.body;
		if(!question){
			return res.status(400).json({success: false,
				err:"QUESTION IS REQUIRED"});
		}
		const rawdata= fs.readFileSync("documents.json",'utf-8');
		const documents= rawdata
		const prompt=`answer this clearly for a college student.
		If answer not found, say "Not available".
		DATA:
		${rawdata} 
		QUESTION:
		${question}`;
		const response= await fetch(
			`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
	{
		method:"POST",
		headers: {
			"Content-Type" : "application/json",
	}, body: JSON.stringify({
		contents: [
			{
			parts: [{text:`answer this clearly in simple words for a college student:\n${prompt}`}],
			},
		],
	})
})
	const data = await response.json();

	if(!data.candidates || data.candidates.length ===0){
		return res.status(500).json({success: false,
			err:"SOMETHING WENT WRONG"});
	}
	const answer= data.candidates[0].content.parts[0].text;
	res.json({ "success": true,
		"answer":answer})
} catch(err){
	console.log(err)
	res.status(500).json({success:false,
		err:"SOMETHING WENT WRONG"});
}
});
app.listen(5000,() =>{
	console.log("server is running on port 5000")
})

 
