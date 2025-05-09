import { Card } from "@/app/types/card"; // Import the Card type
import formatCardNumber from "@/app/utils/formatCardNumber";
import Link from "next/link";

// Fetches the card data based on the provided ID
const fetchCardData = async (id: number): Promise<Card> => {
  try {
    const response = await fetch(
      `https://sii-test-api.onrender.com/api/card/${id}`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch card data");
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching card data:", error);
    throw new Error("Failed to load card details. Please try again later.");
  }
};

interface CardDetailsProps {
  card: Card | null;
  error: string | null;
}

// Component to display card details or error messages
const CardDetails = ({ card, error }: CardDetailsProps) => {
  if (error) {
    return <div className="error-message">{error}</div>; // Display error if available
  }

  if (!card) {
    return <div>Tarjeta no encontrada</div>; // Display if card data is not found
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold mb-4">Detalles de la tarjeta</h1>
      <div className="bg-white shadow-md rounded-lg p-4">
        <h2 className="text-xl font-semibold">{card.cardholder_name}</h2>
        <p>Numero de tarjeta: {formatCardNumber(card.card_number)}</p>
        <p>CVV: {card.cvv}</p>
        <p>
          Fecha de expiración: {card.exp_month}/{card.exp_year}
        </p>
        <Link
          href={`/card/edit/${card.id}`}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded"
        >
          Editar
        </Link>
        <Link
          href={`/card/delete/${card.id}`}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded ml-2"
        >
          Eliminar
        </Link>
      </div>
      <Link href="/" className="text-blue-500 hover:underline">
        Volver a la lista de tarjetas
      </Link>
    </div>
  );
};

// Main page component to fetch card data based on the dynamic ID parameter
const Page = async (props: { params: Promise<{ id: string }> }) => {
  const params = await props.params;
  try {
    const cardData = await fetchCardData(Number(params.id));
    return <CardDetails card={cardData} error={null} />;
  } catch (error) {
    console.error("Error loading card details:", error);
    return (
      <CardDetails
        card={null}
        error="Failed to load card details. Please try again later."
      />
    );
  }
};

export default Page;
