"use client";
import Image from "next/image";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const emojis = [
  {
    text: "Not so fast!",
    image: "/cards/emojis/emoji1.webp",
  },
  {
    text: "Oh wow!",
    image: "/cards/emojis/emoji2.webp",
  },
  {
    text: "Oof, that's rough",
    image: "/cards/emojis/emoji3.webp",
  },
  {
    text: "Pretty please?",
    image: "/cards/emojis/emoji4.webp",
  },
  {
    text: "You're joking...",
    image: "/cards/emojis/emoji5.webp",
  },
  {
    text: "Interesting move!",
    image: "/cards/emojis/emoji6.webp",
  },
  {
    text: "Huh? What happened?",
    image: "/cards/emojis/emoji7.webp",
  },
  {
    text: "Jackpot! Ka-ching!",
    image: "/cards/emojis/emoji8.webp",
  },
  {
    text: "I'm on fire!",
    image: "/cards/emojis/emoji9.webp",
  },
  {
    text: "I'm f-freezing!",
    image: "/cards/emojis/emoji10.webp",
  },
  {
    text: "Phew, that was close!",
    image: "/cards/emojis/emoji11.webp",
  },
  {
    text: "Oh please, have mercy!",
    image: "/cards/emojis/emoji12.webp",
  },
  {
    text: "Holy Shit!",
    image: "/cards/emojis/emoji13.webp",
  },
  {
    text: "Seriously?",
    image: "/cards/emojis/emoji14.webp",
  },
  {
    text: "Nice one!",
    image: "/cards/emojis/emoji15.webp",
  },
  {
    text: "Aw, come on!",
    image: "/cards/emojis/emoji16.webp",
  },
  {
    text: "Pretty please?",
    image: "/cards/emojis/emoji17.webp",
  },
  {
    text: "Mmm, Nice move!",
    image: "/cards/emojis/emoji18.webp",
  },
  {
    text: "Oops, my bad!",
    image: "/cards/emojis/emoji19.webp",
  },
  {
    text: "Zzz... Wake me when it's my turn.",
    image: "/cards/emojis/emoji20.webp",
  },
  {
    text: "Not a chance!",
    image: "/cards/emojis/emoji21.webp",
  },
  {
    text: "Oh no, I'm doomed!",
    image: "/cards/emojis/emoji22.webp",
  },
  {
    text: "Ha ha, too funny!",
    image: "/cards/emojis/emoji23.webp",
  },
  {
    text: "Shh, I've got a secret...",
    image: "/cards/emojis/emoji24.webp",
  },
  {
    text: "Hey, listen up!",
    image: "/cards/emojis/emoji25.webp",
  },
  {
    text: "Whatever...",
    image: "/cards/emojis/emoji26.webp",
  },
  {
    text: "Grrr... I'm fuming!",
    image: "/cards/emojis/emoji27.webp",
  },
  {
    text: "Not cool!",
    image: "/cards/emojis/emoji28.webp",
  },
];

const EmojisModal = ({ openEmojisModal, handleCloseEmojisModal, react }) => {
  return (
    <>
      <Dialog open={openEmojisModal} onOpenChange={handleCloseEmojisModal}>
        <DialogContent className="w-11/12 md:max-w-[425px] bg-customPrimary rounded-lg">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center text-light">
              React
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh] w-full pr-4">
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
              {emojis.map((emoji, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="flex flex-col items-center p-2 h-auto hover:bg-gray-700"
                  onClick={() => {
                    react(emoji.image, emoji.text);
                    handleCloseEmojisModal();
                  }}
                >
                  <div className="relative w-12 h-12 mb-2">
                    <Image
                      src={emoji.image}
                      alt={emoji.text}
                      fill
                      sizes="(max-width: 48px) 100vw, 48px"
                      className="rounded-lg object-contain"
                    />
                  </div>
                  <div className="h-auto overflow-hidden">
                    <span className="text-xs text-center text-light whitespace-normal">
                      {emoji.text}
                    </span>
                  </div>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EmojisModal;
