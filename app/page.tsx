"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/app/types/card";
import formatCardNumber from "./utils/formatCardNumber";

const Home = () => {
  const [cards, setCards] = useState<Card[]>([]);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const response = await fetch("https://sii-test-api.onrender.com/api/");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setCards(data.data);
      } catch (error) {
        console.error("Error fetching cards:", error);
      }
    };

    fetchCards();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold mb-4">Card List</h1>
      <div className="mb-4">
        <Link
          href="/card/new"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Agregar Tarjet
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.length == 0 ? (
          <p>No hay tarjetas para mostrar</p>
        ) : (
          cards.map((card) => (
            <div key={card.id} className="bg-white shadow-md rounded-lg p-4">
              <h2 className="text-xl font-semibold">{card.cardholder_name}</h2>
              <p>Tarjeta: {formatCardNumber(card.card_number)}</p>
              <p>
                fecha vencimiento: {`${card.exp_month}/${card.exp_year % 2000}`}
              </p>

              <Link
                href={`/card/${card.id}`}
                className="text-blue-500 hover:underline"
              >
                Ver detalles
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Home;
