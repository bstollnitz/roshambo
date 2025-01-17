import Head from "next/head";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Video, VideoRef } from "~/components/Video";
import DeviceSelector from "~/components/DeviceSelector";
import Theme from "~/components/layout/theme";

interface Scores {
  none: number;
  paper: number;
  rock: number;
  scissors: number;
}

interface Prediction {
  time: number;
  prediction: string;
  scores: Scores;
  timestamp: string;
  model_update: string;
  message: string;
}

export default function Home() {
  const [videoId, setVideoId] = useState<string>("");
  const [settings, setSettings] = useState<MediaTrackSettings>({});
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [imageSrc, setImageSrc] = useState<string>("")
  const videoRef = useRef <VideoRef>(null);

  const setFrame = (frame: string) => {
    (async () => {
      const options: RequestInit = {
        method: "POST",
        body: JSON.stringify({ image: frame }),
        headers: {
          "Content-Type": "application/json",
        },
      };

      setImageSrc(frame)
      const response = await fetch("/api/analyze", options);
      const pred: Prediction = await response.json();
      console.log('API returned', pred)
      setPrediction(pred);
    })();
  };

  const handleSubmit = () => {
    if (videoRef.current) {
      const frame = videoRef.current?.getFrame();
      if (frame) {
        setFrame(frame);
      }
    }
  };

  return (
    <Theme title="roshambo.ai">
      <div className="px-6 text-gray-600 bg-white py6 lg:px-8">
        <div className="grid max-w-screen-xl gap-6 mx-auto md:grid-cols-2 lg:gap-x-8">
          Welcome to roshambo.ai
        </div>
      </div>
      <div className="px-6 py-6 text-gray-600 bg-white lg:px-8">
        <div className="grid max-w-screen-xl gap-6 mx-auto md:grid-cols-2 lg:gap-x-8">
          <div className="px-6 pt-6 pb-6 bg-gray-200 rounded">
            <div>
              <DeviceSelector onSelect={setVideoId} />
            </div>
            <div>
              <Video
                className="mt-3"
                width={320}
                height={240}
                device={videoId}
                onVideoSet={setSettings}
                ref={videoRef}
              />
            </div>
            <button
              className="my-2 px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700"
              onClick={handleSubmit}
            >
              Submit
            </button>
          </div>
          <div className="px-6 pt-6 pb-6 bg-gray-200 rounded">
            {imageSrc &&
              <>
                <img
                  src={imageSrc}
                  alt="current"
                  className="mt-3 border border-gray-500 border-solid"
                />
                <div className="text-red-600 text-5xl font-bold">
                  {prediction?.prediction}
                </div>
                <ul className="text-lg">
                  <li>
                    none: {((prediction?.scores?.none ?? 0) * 100).toFixed(2)}%
                  </li>
                  <li>
                    paper: {((prediction?.scores?.paper ?? 0) * 100).toFixed(2)}%
                  </li>
                  <li>
                    rock: {((prediction?.scores?.rock ?? 0) * 100).toFixed(2)}%
                  </li>
                  <li>
                    scissors:{" "}
                    {((prediction?.scores?.scissors ?? 0) * 100).toFixed(2)}%
                  </li>
                </ul>
              </>
            }
          </div>
        </div>
      </div>
      <div>
        <button
          className="hidden px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700"
          onClick={handleSubmit}
        >
          Test
        </button>
      </div>
    </Theme>
  );
}
