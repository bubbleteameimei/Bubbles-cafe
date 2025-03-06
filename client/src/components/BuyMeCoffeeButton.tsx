import { Coffee } from 'lucide-react';

export const BuyMeCoffeeButton = () => {
  const handleTip = () => {
    window.open('https://paystack.com/pay/z7fmj9rge1', '_blank');
  };

  return (
    <button
      onClick={handleTip}
      className="buy-coffee-btn"
    >
      <Coffee className="w-5 h-5" />
      <span>Buy me a coffee</span>
    </button>
  );
};