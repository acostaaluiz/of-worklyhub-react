import type { CompanyProfileModel } from "@modules/company/interfaces/company.model";
import type { ServiceModel } from "@modules/clients/interfaces/service.model";

const MOCK_SERVICES: ServiceModel[] = [
  {
    id: "s1",
    title: "Corte simples",
    description: "Corte rápido e prático",
    providerId: "prov-02",
    providerName: "Barbearia JJ",
    priceCents: 5000,
    priceFormatted: "R$ 50,00",
  },
  {
    id: "s2",
    title: "Corte degradê",
    description: "Acabamento degradê profissional",
    providerId: "prov-02",
    providerName: "Barbearia JJ",
    priceCents: 6000,
    priceFormatted: "R$ 60,00",
  },
  {
    id: "s3",
    title: "Corte + barba",
    description: "Pacote corte e barba",
    providerId: "prov-02",
    providerName: "Barbearia JJ",
    priceCents: 7500,
    priceFormatted: "R$ 75,00",
  },
];

export async function getCompanyProfile(companyId: string): Promise<CompanyProfileModel> {
  await new Promise((r) => setTimeout(r, 80));

  return {
    id: companyId,
    name: "Barbearia JJ",
    description: "Espaço exclusivo para homens com serviços de corte e barba.",
    address: "Avenida Perimetral Sul, 606, Vila Rica",
    imageUrl: "https://picsum.photos/seed/companyjj/1200/600",
    phone: "(66) 98425-7218",
    rating: 4.94,
    reviewsCount: 197,
    services: MOCK_SERVICES,
  };
}

export default { getCompanyProfile };
