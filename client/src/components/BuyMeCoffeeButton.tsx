import React from "react";
import { Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";

export const BuyMeCoffeeButton = () => {
  const href = "https://paystack.com/pay/z7fmj9rge1";


    <Button
      asChild
      size="lg"
      className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white rounded-full shadow-lg transition-colors"
      aria-label="Buy me a coffee"
    >
      <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2">
        <Coffee className="w-5 h-5" />
        <span>Buy me a coffee</span>
      </a>
    </Button>
  );
};