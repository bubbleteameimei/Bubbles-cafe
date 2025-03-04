import { Coffee } from 'lucide-react';

export const BuyMeCoffeeButton = () => {
  return (
    <a
      href="https://www.buymeacoffee.com/yourusername" // Replace with your actual Buy Me a Coffee username
      target="_blank"
      rel="noopener noreferrer"
      className="buy-coffee-btn"
    >
      <Coffee className="w-5 h-5" />
      <span>Buy me a coffee</span>
    </a>
  );
};
