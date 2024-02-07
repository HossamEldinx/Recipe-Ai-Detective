"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FaPlay, FaStop } from "react-icons/fa";

export default function Home() {
  // Keep track of the classification result and the model loading status.
  const [result, setResult] = useState(null);
  const [ready, setReady] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (done) {
      play();
    }
  }, [done]);

  const classify = async (imageUrl) => {
    if (!imageUrl) return;

    setLoading(true);
    // Make a request to the image to text aka /itt route on the server.
    const result = await fetch(
      `/api/itt?image=${encodeURIComponent(imageUrl)}`
    );

    // If this is the first time we've made a request, set the ready flag.
    if (!ready) setReady(true);

    const json = await result.json();
    setResult(json);
    setDone(true);
    setLoading(false);
  };

  const play = () => {
    let audio = document.getElementById("audio");
    audio.play();
  };

  const stop = () => {
    let audio = document.getElementById("audio");
    audio.pause();
  };

  const selected = (imageUrl) => {
    setImageUrl(imageUrl);
    classify(imageUrl);
  };

  const imagesExample = [
    {
      imageUrl:
        "https://www.indianhealthyrecipes.com/wp-content/uploads/2015/10/pizza-recipe-1.jpg",
      alt: "pizza",
    },
    {
      imageUrl:
        "https://www.loveandoliveoil.com/wp-content/uploads/2015/03/soy-sauce-noodles4-1-600x900.jpg",
      alt: "noodels",
    },
    {
      imageUrl: "https://i.ytimg.com/vi/W-NiD3x1mnU/maxresdefault.jpg",
      alt: "humburger",
    },
    {
      imageUrl:
        "https://food.fnr.sndimg.com/content/dam/images/food/fullset/2021/02/05/Baked-Feta-Pasta-4_s4x3.jpg.rend.hgtvcom.616.493.suffix/1615916524567.jpeg",
      alt: "Pasta",
    },
    {
      imageUrl:
        "https://img.onmanorama.com/content/dam/mm/en/food/foodie/images/2019/10/3/goan-fish-fry.jpg.transform/576x300/image.jpg",
      alt: "fish",
    },
  ];

  return (
    <div className="main-area">
      <main className="flex min-h-screen flex-col items-center justify-center detective">
        <div className="epic-logo">
          <Image
            src={
              "https://cdn.blerp.com/thumbnails/e120ca50-2574-11ed-872c-11b972513585"
            }
            alt="ramsy"
            layout="fill"
            objectFit="fill"
          />
        </div>
        <h2 className="text-2xl mb-4 text-center detective-title">
          Reacipe Deteacitve Ai
        </h2>

        <div className="images-examples">
          {imagesExample &&
            imagesExample.map((el, i) => {
              return (
                <div
                  key={i}
                  className="image-ex"
                  title={el.alt}
                  onClick={(e) => selected(el.imageUrl)}
                >
                  <Image
                    src={el.imageUrl}
                    alt={el.alt}
                    layout="fill"
                    objectFit="fill"
                  />
                </div>
              );
            })}
        </div>
        {!result && (
          <input
            type="text"
            className="image-url"
            placeholder="Enter Image Url here"
            value={imageUrl}
            onInput={(e) => {
              setImageUrl(e.target.value);
              classify(e.target.value);
            }}
          />
        )}
        {imageUrl && (
          <div className="main-image  mt-5">
            <Image
              src={imageUrl}
              alt={imageUrl}
              layout="fill"
              objectFit="fill"
            />
          </div>
        )}

        {loading && "Loading..."}
        {!loading && result && (
          <div className="audio-player">
            <button onClick={play}>
              <FaPlay />
            </button>
            <button onClick={stop}>
              <FaStop />
            </button>
          </div>
        )}

        <audio id="audio" autoPlay src="/speech.mp3"></audio>
        {result && !loading && <Markdown content={JSON.parse(result.recipe)} />}
      </main>
    </div>
  );
}

const Markdown = ({ content }) => (
  <ReactMarkdown
    className="prose mt-1 w-full break-words prose-p:leading-relaxed  py-3 px-3 mark-down"
    remarkPlugins={[remarkGfm]}
    components={{
      a: ({ node, ...props }) => (
        <a {...props} style={{ color: "#27afcf", fontWeight: "bold" }} />
      ),
    }}
  >
    {content}
  </ReactMarkdown>
);
