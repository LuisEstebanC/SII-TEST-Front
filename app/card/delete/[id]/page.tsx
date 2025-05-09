"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/app/types/card";

const DeleteCardPage = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const [card, setCard] = useState<Card | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCardData = async () => {
      try {
        const response = await fetch(
          `https://sii-test-api.onrender.com/api/card/${params.id}`,
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch card data");
        }

        const data = await response.json();
        setCard(data.data);
        setIsLoading(false);
      } catch (error) {
        setError(
          `Failed to load card details. Please try again later: ${error}`
        );
        setIsLoading(false);
      }
    };

    fetchCardData();
  }, [params.id]);

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(
        `https://sii-test-api.onrender.com/api/card/${params.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete card");
      }

      // Redirect to home page after successful deletion
      router.push("/");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <p>Cargando detalles de la tarjeta...</p>
      </div>
    );
  }

  if (error && !isDeleting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <Link href="/" className="text-blue-500 hover:underline">
         Volver a la lista de tarjetas
        </Link>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <p>Tarjeta no encontrada</p>
        <Link href="/" className="text-blue-500 hover:underline">
         Volver a la lista de tarjetas
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold mb-4">Eliminar Tarjeta</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="w-full max-w-lg bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <p className="mb-4 text-lg">
          ¿Estás seguro que deseas eliminar la siguiente tarjeta?
        </p>

        <div className="mb-6 p-4 border border-gray-200 rounded">
          <h2 className="text-xl font-semibold">{card.cardholder_name}</h2>
          <p>Numero de tarjeta: {card.card_number}</p>
          <p>Marca: {card.brand}</p>
          <p>
            Fecha de expiración: {card.exp_month}/{card.exp_year}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={handleDelete}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={isDeleting}
          >
            {isDeleting ? "Eliminando..." : "Confirmar Eliminación"}
          </button>
          <Link
            href={`/card/${params.id}`}
            className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
          >
            Cancelar
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DeleteCardPage;
