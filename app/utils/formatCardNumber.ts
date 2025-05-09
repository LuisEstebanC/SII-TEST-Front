const formatCardNumber = (cardNumber: string) => {
  const cleaned = cardNumber.replace(/\s/g, "");
  const firstPart = cleaned.slice(0, 2);
  const lastPart = cleaned.slice(-4);
  const stars = "*".repeat(10);

  return `${firstPart}${stars}${lastPart}`;
};
export default formatCardNumber;
