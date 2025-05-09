export interface TopLevel {
  status: string;
  message: string;
  data: Card[];
}

export interface Card {
  id: number;
  cardholder_name: string;
  card_number: string;
  cvv: string;
  brand: Brand;
  exp_month: number;
  exp_year: number;
  background_image_url: BackgroundImageURL;
  created_at: Date;
}

export enum BackgroundImageURL {
  BackgroundImageURL = " ",
  Empty = "",
}

export enum Brand {
  MarterCard = "marterCard",
  Visa = "visa",
}
