import type { ServiceModel } from "@modules/clients/interfaces/service.model";

export type CompanyProfileModel = {
  id: string;
  name: string;
  description?: string;
  address?: string;
  imageUrl?: string;
  wallpaperUrl?: string;
  phone?: string;
  rating?: number;
  reviewsCount?: number;
  services?: ServiceModel[];
};

export default CompanyProfileModel;
