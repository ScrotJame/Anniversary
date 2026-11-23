"use client";

import { useState } from "react";
import { AnimatePresence } from "motion/react";
import type { Content, GiftId, ScreenId } from "@/lib/types";
import { MusicProvider } from "./music/MusicProvider";
import MusicPlayer from "./music/MusicPlayer";
import EnvelopeScreen from "./screens/EnvelopeScreen";
import GiftsScreen from "./screens/GiftsScreen";
import PolaroidScreen from "./screens/PolaroidScreen";
import CollageScreen from "./screens/CollageScreen";
import MemoriesScreen from "./screens/MemoriesScreen";
import FlowerLetterScreen from "./screens/FlowerLetterScreen";
import FinaleScreen from "./screens/FinaleScreen";

const GIFT_TARGET: Record<GiftId, ScreenId> = {
  letter: "memories",
  bear: "polaroid",
  flowers: "flowers",
};

export default function Experience({ content }: { content: Content }) {
  const [screen, setScreen] = useState<ScreenId>("envelope");
  const [opened, setOpened] = useState<ReadonlySet<GiftId>>(new Set());

  const go = (next: ScreenId) => {
    setScreen(next);
    window.scrollTo({ top: 0 });
  };
  const backToGifts = () => go("gifts");

  const openGift = (gift: GiftId) => {
    setOpened((prev) => new Set(prev).add(gift));
    go(GIFT_TARGET[gift]);
  };

  const restart = () => {
    setOpened(new Set());
    go("envelope");
  };

  const { photos, letters, settings } = content;

  return (
    <MusicProvider songs={content.songs}>
      <AnimatePresence mode="wait">
        {screen === "envelope" && (
          <EnvelopeScreen
            key="envelope"
            title={settings.envelopeTitle}
            cardText={settings.cardText}
            onOpened={() => go("gifts")}
          />
        )}
        {screen === "gifts" && (
          <GiftsScreen key="gifts" opened={opened} onOpenGift={openGift} onFinale={() => go("finale")} />
        )}
        {screen === "polaroid" && (
          <PolaroidScreen
            key="polaroid"
            photos={photos.polaroid}
            letter={letters.polaroid}
            onNext={() => go("collage")}
            onBack={backToGifts}
          />
        )}
        {screen === "collage" && <CollageScreen key="collage" photos={photos.collage} onNext={backToGifts} />}
        {screen === "memories" && (
          <MemoriesScreen key="memories" photos={photos.memories} letter={letters.memories} onNext={backToGifts} />
        )}
        {screen === "flowers" && (
          <FlowerLetterScreen key="flowers" letter={letters.flowers} onNext={backToGifts} />
        )}
        {screen === "finale" && (
          <FinaleScreen key="finale" photo={photos.finale[0]} settings={settings} onRestart={restart} />
        )}
      </AnimatePresence>
      <MusicPlayer />
    </MusicProvider>
  );
}
