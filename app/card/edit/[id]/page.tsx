"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "./card-styles.css";
import { Brand } from "@/app/types/card";
import imagen1 from "@/assets/img/4.jpg";
import masterCardLogo from "@/assets/svg/mastercard-logo.png";
import Image from "next/image";
import NFCLogo from "@/public/nfc.svg";
import chip from "@/public/chip.png";

const EditCardPage = ({ params }: { params: { id: string } }) => {
  const cardId = params.id;

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    cardholder_name: "",
    card_number: "",
    cvv: "",
    brand: Brand.Visa,
    exp_date: "",
    background_image_url: "",
  });

  const [formErrors, setFormErrors] = useState({
    cardholder_name: "",
    card_number: "",
    cvv: "",
    exp_date: "",
  });

  useEffect(() => {
    const fetchCardData = async () => {
      try {
        const response = await fetch(
          `https://sii-test-api.onrender.com/api/card/${cardId}`,
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch card data");
        }

        const data = await response.json();
        const cardData = data.data;

        // Format the expiration date as MM/YY
        const month = cardData.exp_month.toString().padStart(2, "0");
        const year = cardData.exp_year.toString().slice(-2);
        const formattedExpDate = `${month}/${year}`;

        setFormData({
          cardholder_name: cardData.cardholder_name,
          card_number: cardData.card_number,
          cvv: cardData.cvv,
          brand: cardData.brand,
          exp_date: formattedExpDate,
          background_image_url: cardData.background_image_url || "",
        });

        setIsLoading(false);
      } catch (error) {
        setError(
          `Failed to load card details. Please try again later: ${error}`
        );
        setIsLoading(false);
      }
    };

    fetchCardData();
  }, [cardId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "card_number") {
      const formattedValue = value
        .replace(/\s/g, "")
        .replace(/[^0-9]/g, "")
        .replace(/(.{4})/g, "$1 ")
        .trim()
        .slice(0, 19);

      setFormData({
        ...formData,
        [name]: formattedValue,
      });
    } else if (name === "exp_date") {
      const formattedValue = value
        .replace(/[^0-9/]/g, "")
        .replace(/(\d{2})(\d{1,2})/, "$1/$2")
        .slice(0, 5);
      setFormData({
        ...formData,
        [name]: formattedValue,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const validateForm = () => {
    const errors = { ...formErrors };
    let isValid = true;

    // Validate cardholder_name (letters and max 20 characters)
    if (!formData.cardholder_name) {
      errors.cardholder_name = "Nombre del titular es requerido.";
      isValid = false;
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/.test(formData.cardholder_name)) {
      errors.cardholder_name =
        "El nombre solo puede contener letras y espacios.";
      isValid = false;
    } else if (formData.cardholder_name.length > 20) {
      errors.cardholder_name = "El nombre no puede tener más de 20 caracteres.";
      isValid = false;
    } else {
      errors.cardholder_name = "";
    }

    // Validate card_number (only numbers and max 16 digits)
    if (!formData.card_number) {
      errors.card_number = "Número de tarjeta es requerido.";
      isValid = false;
    } else if (!/^\d{16}$/.test(formData.card_number.replace(/\s/g, ""))) {
      errors.card_number =
        "El número de tarjeta debe contener solo números y 16 dígitos.";
      isValid = false;
    } else {
      errors.card_number = "";
    }

    // Validate exp_date (mm/yy format)
    const [exp_month, exp_year] = formData.exp_date.split("/").map(Number);

    if (!formData.exp_date) {
      errors.exp_date = "Fecha de expiración es necesaria.";
      isValid = false;
    } else if (exp_month > 12 || exp_month < 1) {
      errors.exp_date = "Debe ser un mes válido (01-12).";
      isValid = false;
    } else if (exp_month <= new Date().getMonth() + 1 && exp_year === 22) {
      errors.exp_date = "Tarjeta vencida.";
      isValid = false;
    } else if (
      exp_year < 22 ||
      exp_year > (new Date().getFullYear() % 100) + 5
    ) {
      errors.exp_date = `Debe ser un año válido (22-${
        (new Date().getFullYear() % 100) + 5
      }).`;
      isValid = false;
    } else if (isNaN(exp_month) || isNaN(exp_year)) {
      errors.exp_date = "Fecha de expiración no válida. Usa el formato mm/yy.";
      isValid = false;
    } else {
      errors.exp_date = "";
    }

    // Validate CVV (3 digits)
    if (!formData.cvv) {
      errors.cvv = "CVV es requerido.";
      isValid = false;
    } else if (!/^\d{3}$/.test(formData.cvv)) {
      errors.cvv = "El CVV debe tener 3 dígitos.";
      isValid = false;
    } else {
      errors.cvv = "";
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form before submitting
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Extract month and year from exp_date
      const cleanCardNumber = formData.card_number.replace(/\s/g, "");
      const [exp_month, exp_year] = formData.exp_date.split("/").map(Number);
      const { exp_date, ...dataToSend } = formData;
      //TODO:Same for this line, check how to remove ESLint error

      const response = await fetch(
        `https://sii-test-api.onrender.com/api/card/${cardId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...dataToSend,
            card_number: cleanCardNumber,
            exp_month,
            exp_year: 2000 + exp_year, // Convert two-digit year to four-digit year
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update card");
      }

      // Redirect to card details page after successful update
      router.push(`/card/${cardId}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCardNumber = (number: string) => {
    if (!number) return "XXXX XXXX XXXX XXXX";

    if (number.includes(" ")) return number.trim();

    return number.replace(/(.{4})/g, "$1 ").trim();
  };

  // Format expiration date for display
  const formatExpirationDate = () => {
    return formData.exp_date || "MM/YY";
  };

  if (isLoading) {
    return (
      <div className="card-page">
        <div className="card-form__loading">Loading card details...</div>
      </div>
    );
  }

  if (error && !isSubmitting) {
    return (
      <div className="card-page">
        <div className="card-form">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
          <Link href="/" className="card-form__link">
            Go Back to Card List
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="card-page">
      <div className="card-form">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Card Preview */}
        <div className="card-list">
          <div className="card-item">
            <div className="card-item__side">
              <div className="card-item__cover">
                {formData.background_image_url ? (
                  <Image
                    src={imagen1}
                    className="card-item__bg"
                    width={400}
                    height={250}
                    alt="Card background"
                  />
                ) : (
                  <Image
                    src={imagen1}
                    className="card-item__bg"
                    width={400}
                    height={250}
                    alt="Card background"
                  />
                )}
              </div>
              <div className="card-item__wrapper flex flex-col justify-between h-full">
                <div className="flex justify-between items-center mb-4">
                  <div className="text-white text-xl font-semibold">
                    <span>monobank</span>
                    <span className="text-gray-400 ml-2 font-extralight">
                      |
                    </span>
                    <span className="text-gray-400 ml-2 text-sm">
                      Universal Bank
                    </span>
                  </div>
                  <div>
                    <Image
                      src={NFCLogo}
                      alt="NFC logo"
                      height={42}
                      width={42}
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <Image
                      src={chip}
                      className="card-item__chip"
                      alt="Credit card chip"
                    />
                  </div>
                  <div className="text-gray-400 self-end world">world</div>
                </div>

                <div className="text-white text-xl font-mono tracking-wider mt-1.5 ml-5">
                  {formatCardNumber(formData.card_number)}
                </div>

                <div className="flex ">
                  <div className="grid grid-rows-2">
                    <div className="grid grid-cols-2 items-end">
                      <div className="col-end-3">
                        <div className="grid grid-cols-2 justify-items-end">
                          <div className="text-gray-400 text-end content-center pr-1.5 text-xs valid">
                            VALID<br></br> THRU
                          </div>
                          <div className="text-white content-center">
                            {formatExpirationDate()}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="row-span-1 text-white uppercase text-lg tracking-wide">
                      {formData.cardholder_name || "DONALD FLINCH CORTEZ"}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 ml-4">
                    <div>
                      <Image
                        src={masterCardLogo}
                        width={70}
                        height={50}
                        alt="Mastercard logo"
                        className="h-20"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="card-form__inner">
          <h2 className="card-form__title">Editar Tarjeta</h2>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-y-3 gap-x-9.5 mb-4">
              <div className="card-input">
                <label className="font-bold text-base" htmlFor="card_number">
                  Número de Tarjeta
                </label>
                <input
                  className="card-input__input mt-1.5"
                  id="card_number"
                  name="card_number"
                  type="text"
                  value={formData.card_number}
                  onChange={handleChange}
                  required
                  placeholder="0000 0000 0000 0000"
                />
                {formErrors.card_number && (
                  <p className="text-red-500 text-sm">
                    {formErrors.card_number}
                  </p>
                )}
              </div>

              <div className="card-form__row">
                <div className="card-form__col">
                  <div className="card-input">
                    <label className="font-bold text-base" htmlFor="exp_date">
                      Fecha Vencimiento
                    </label>
                    <input
                      className="card-input__input mt-1.5"
                      id="exp_date"
                      name="exp_date"
                      type="text"
                      value={formData.exp_date}
                      onChange={handleChange}
                      placeholder="MM/YY"
                    />
                    {formErrors.exp_date && (
                      <p className="text-red-500 text-sm">
                        {formErrors.exp_date}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="card-input">
                <label
                  className="font-bold text-base"
                  htmlFor="cardholder_name"
                >
                  Nombre Titular
                </label>
                <input
                  className="card-input__input mt-1.5"
                  id="cardholder_name"
                  name="cardholder_name"
                  type="text"
                  value={formData.cardholder_name}
                  onChange={handleChange}
                  required
                  placeholder="NOMBRE COMO APARECE EN LA TARJETA"
                  maxLength={20}
                />
                {formErrors.cardholder_name && (
                  <p className="text-red-500 text-sm">
                    {formErrors.cardholder_name}
                  </p>
                )}
              </div>

              <div className="card-input">
                <label className="font-bold text-base" htmlFor="cvv">
                  CVV
                </label>
                <input
                  className="card-input__input mt-1.5"
                  id="cvv"
                  name="cvv"
                  type="text"
                  value={formData.cvv}
                  onChange={handleChange}
                  required
                  maxLength={3}
                  pattern="\d{3}"
                  placeholder="123"
                />
                {formErrors.cvv && (
                  <p className="text-red-500 text-sm">{formErrors.cvv}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-8 gap-4">
              <div className="col-span-2">
                <button
                  className="bg-blue-700 hover:bg-blue-900 text-white rounded h-6 w-full mt-5 shadow-lg card-form__button"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Guardando..." : "Actualizar Tarjeta"}
                </button>
              </div>
              <div className="col-span-2">
                <Link
                  href={`/card/${cardId}`}
                  className="bg-gray-200 hover:bg-gray-400 text-gray-600 rounded h-6 w-2/3 col-start-1 mt-5 shadow-lg card-form__button flex items-center justify-center"
                >
                  Cancelar
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditCardPage;
