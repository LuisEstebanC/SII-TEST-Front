"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import "./card-styles.css";
import { Brand } from "@/app/types/card";
import imagen1 from "@/assets/img/4.jpg";
import masterCardLogo from "@/assets/svg/mastercard-logo.png";
import Image from "next/image";
import NFCLogo from "@/public/nfc.svg";
import chip from "@/public/chip.png";
import formatCardNumberForDisplay from "@/app/utils/formatCardNumber";

const NewCardPage = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const [formData, setFormData] = useState({
    cardholder_name: "",
    card_number: "",
    cvv: "",
    brand: Brand.MarterCard,
    exp_date: "",
    background_image_url: "1",
  });

  const [formErrors, setFormErrors] = useState({
    cardholder_name: "",
    card_number: "",
    cvv: "",
    exp_date: "",
  });

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

    // Validate cardholder_name (only letters and spaces, max 20 characters)
    if (!formData.cardholder_name) {
      errors.cardholder_name = "Nombre del titular es requerido.";
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/.test(formData.cardholder_name)) {
      errors.cardholder_name =
        "El nombre solo puede contener letras y espacios.";
    } else if (formData.cardholder_name.length > 20) {
      errors.cardholder_name = "El nombre no puede tener más de 20 caracteres.";
    } else {
      errors.cardholder_name = "";
    }

    // Validate card_number (only numbers and max 16 digits)
    if (!formData.card_number) {
      errors.card_number = "Número de tarjeta es requerido.";
    } else if (!/^\d{16}$/.test(formData.card_number.replace(/\s/g, ""))) {
      errors.card_number =
        "El número de tarjeta debe contener solo números y 16 dígitos.";
    } else {
      errors.card_number = "";
    }

    // Validate exp_date (mm/yy format)
    const [exp_month, exp_year] = formData.exp_date.split("/").map(Number);

    if (!formData.exp_date) {
      errors.exp_date = "Fecha de expiración es necesaria.";
    } else if (exp_month > 12 || exp_month < 1) {
      errors.exp_date = "Debe ser un mes válido (01-12).";
    } else if (exp_month <= new Date().getMonth() + 1 && exp_year === 22) {
      errors.exp_date = "Tarjeta vencida.";
    } else if (
      exp_year < 22 ||
      exp_year > (new Date().getFullYear() % 100) + 5
    ) {
      errors.exp_date = `Debe ser un año válido (22-${
        (new Date().getFullYear() % 100) + 5
      }).`;
    } else if (isNaN(exp_month) || isNaN(exp_year)) {
      errors.exp_date = "Fecha de expiración no válida. Usa el formato mm/yy.";
    } else {
      errors.exp_date = "";
    }

    // Validate CVV (3 digits)
    if (!formData.cvv) {
      errors.cvv = "CVV es requerido.";
    } else if (!/^\d{3}$/.test(formData.cvv)) {
      errors.cvv = "El CVV debe tener 3 dígitos.";
    } else {
      errors.cvv = "";
    }

    setFormErrors(errors);

    return !Object.values(errors).some((err) => err);
    //TODO: Refactor this to convert the validation function to a single function and use from utils
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form before showing confirmation
    if (!validateForm()) {
      return;
    }

    // Show confirmation screen
    setShowConfirmation(true);
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const cleanCardNumber = formData.card_number.replace(/\s/g, "");
      const [exp_month, exp_year] = formData.exp_date.split("/").map(Number);
      const { exp_date, ...dataToSend } = formData;

      const response = await fetch(
        "https://sii-test-api.onrender.com/api/card",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...dataToSend,
            card_number: cleanCardNumber,
            exp_month,
            exp_year: 2000 + exp_year,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create card");
      }
      console.log(exp_date);
      // Redirect to home page after successful creation
      router.push("/");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      setIsSubmitting(false);
    }
  };

  // Format card number for display
  const formatCardNumber = (number: string) => {
    if (!number) return "XXXX XXXX XXXX XXXX";

    if (number.includes(" ")) return number.trim();

    return number.replace(/(.{4})/g, "$1 ").trim();
  };

  if (showConfirmation) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <h1 className="text-4xl font-bold mb-4">Confirmar Nueva Tarjeta</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="w-full max-w-lg bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <p className="mb-4 text-lg">
            ¿Estás seguro que deseas agregar la siguiente tarjeta?
          </p>

          <div className="mb-6 p-4 border border-gray-200 rounded">
            <h2 className="text-xl font-semibold">
              {formData.cardholder_name}
            </h2>
            <p>
              Número de tarjeta:{" "}
              {formatCardNumberForDisplay(formData.card_number)}
            </p>
            <p>Marca: {formData.brand}</p>
            <p>Fecha de expiración: {formData.exp_date}</p>
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={handleConfirm}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creando..." : "Confirmar Creación"}
            </button>
            <button
              onClick={() => {
                setShowConfirmation(false);
                setFormData({
                  cardholder_name: "",
                  card_number: "",
                  cvv: "",
                  brand: Brand.MarterCard,
                  exp_date: "",
                  background_image_url: "1",
                });
                setFormErrors({
                  cardholder_name: "",
                  card_number: "",
                  cvv: "",
                  exp_date: "",
                });
              }}
              className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
            >
              Cancelar
            </button>
          </div>
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
                <Image
                  src={imagen1}
                  className="card-item__bg"
                  width={400}
                  height={250}
                  alt="Card background"
                />
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
                          <div className="text-gray-400 text-end content-center pr-1.5  text-xs valid">
                            VALID<br></br> THRU
                          </div>
                          <div className="text-white content-center">
                            {formData.exp_date || "06/24"}
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
                  {isSubmitting ? "Agregando..." : "Agregar Tarjeta"}
                </button>
              </div>
              <div className="col-span-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowConfirmation(false);
                    setFormData({
                      cardholder_name: "",
                      card_number: "",
                      cvv: "",
                      brand: Brand.MarterCard,
                      exp_date: "",
                      background_image_url: "1",
                    });
                    setFormErrors({
                      cardholder_name: "",
                      card_number: "",
                      cvv: "",
                      exp_date: "",
                    });
                  }}
                  className="bg-gray-200 hover:bg-gray-400 text-gray-600 rounded h-6 w-2/3 col-start-1 mt-5 shadow-lg  card-form__button"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewCardPage;
