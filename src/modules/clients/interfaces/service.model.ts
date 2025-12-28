export type ServiceModel = {
  id: string;
  title: string;
  description?: string;
  providerId: string;
  providerName: string;
  address?: string;
  imageUrl?: string;
  rating?: number;
  reviewsCount?: number;
  featured?: boolean;
  priceCents?: number;
  priceFormatted?: string;
  tags?: string[];
};

export default ServiceModel;
