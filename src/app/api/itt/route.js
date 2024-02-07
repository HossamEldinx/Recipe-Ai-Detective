import { NextResponse } from "next/server";
import PipelineSingleton from "./pipeline.js";
import OpenAI from "openai";
import fs from "fs";
import path from "path";

import { HfInference } from "@huggingface/inference";
import { HfAgent, LLMFromHub, defaultTools } from "@huggingface/agents";

const openai = new OpenAI({ apiKey: process.env.OPEN_AI_KEY });

const HF_TOKEN = "";
const inference = new HfInference(HF_TOKEN);

const llmOpenAI = async (prompt) => {
  const gptAnswer = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: `you are elite chife who knows every single recipe and can answer it with easy to follow detiald steps`,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });
  console.log(gptAnswer);
  return gptAnswer.choices[0].message.content;
};

const agent = new HfAgent(HF_TOKEN, llmOpenAI);




export async function GET(request) {
  const imageUrl = request.nextUrl.searchParams.get("image");
  if (!imageUrl) {
    return NextResponse.json(
      {
        error: "Missing Image Url parameter",
      },
      { status: 400 }
    );
  }

  try {
    // you can generate the code, inspect it and then run it
    /*     const airesult = await agent.run("give me the recipe for pizza with cheese");


    console.log(JSON.stringify(airesult)); */

    //send the image to Huggingface js
    let imageResult = await inference.imageToText({
      data: await (await fetch(imageUrl)).blob(),
      model: "nlpconnect/vit-gpt2-image-captioning",
    });
    console.log(imageResult);


    

    let detection = await inference.visualQuestionAnswering({
      wait_for_model: true,
      inputs: {
        image: await (await fetch(imageUrl)).blob(),
        question: "what food in this image?",
      },
      model: "dandelin/vilt-b32-finetuned-vqa",
    });
    console.log(detection);

    let recipe = await llmOpenAI(
      `what is the detaild recipe for ${imageResult.generated_text}`
    );

    console.log(recipe);
    //3a46bf2b52b9d56babed3f8c26421eab

    /*     let recipeResult = await inference.conversational({
      model: "facebook/blenderbot-400M-distill",
      inputs:
        "can you give me full detaild step by step recipe for a hamburger with onions and lettuce on it",
    });

    console.log(recipeResult); */

    //make path to the speech file
    const speechFile = path.resolve(process.cwd(), "public/speech.mp3");
    //create voice using text to speech open ai
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "alloy",
      input: JSON.stringify(recipe),
    });
    //strem to file
    await streamToFile(mp3.body, speechFile);

    console.log("done");

    return NextResponse.json({
      message: "done",
      recipe: JSON.stringify(recipe),
    });
  } catch (error) {
    console.log(error);
  }
}

//handle wrting to file
async function streamToFile(stream, path) {
  return new Promise((resolve, reject) => {
    const writeStream = fs
      .createWriteStream(path)
      .on("error", reject)
      .on("finish", resolve);

    stream.pipe(writeStream).on("error", (error) => {
      writeStream.close();
      reject(error);
    });
  });
}
