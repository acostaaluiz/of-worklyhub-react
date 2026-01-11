import { BehaviorSubject } from "rxjs";
import { ApplicationApi, type ApplicationServiceItem, type ApplicationCategoryItem, type ApplicationIndustryItem } from "./application-api";
import type { ApplicationPlanItem } from "./application-api";
import { httpClient } from "@core/http/client.instance";
import { localStorageProvider } from "@core/storage/local-storage.provider";

export type AppServices = ApplicationServiceItem[] | null;

export type AppCategories = ApplicationCategoryItem[] | null;

export type AppIndustries = ApplicationIndustryItem[] | null;

export type AppPlans = ApplicationPlanItem[] | null;

const APP_SERVICES_KEY = "application.services";
const APP_CATEGORIES_KEY = "application.categories";
const APP_INDUSTRIES_KEY = "application.industries";
const APP_PLANS_KEY = "application.plans";
const APP_EVENT_CATEGORIES_KEY = "application.eventCategories";

export class ApplicationService {
  private subject = new BehaviorSubject<AppServices>(this.loadFromStorage());
  private subjectCategories = new BehaviorSubject<AppCategories>(this.loadCategoriesFromStorage());
  private subjectIndustries = new BehaviorSubject<AppIndustries>(this.loadIndustriesFromStorage());
  private subjectPlans = new BehaviorSubject<AppPlans>(this.loadPlansFromStorage());
  private subjectEventCategories = new BehaviorSubject<EventCategories | null>(this.loadEventCategoriesFromStorage());
  private pendingFetchPlans: Promise<AppPlans> | null = null;
  private api = new ApplicationApi(httpClient);
  private pendingFetchServices: Promise<AppServices> | null = null;
  private pendingFetchEventCategories: Promise<EventCategories> | null = null;

  private loadFromStorage(): AppServices {
    try {
      const raw = localStorageProvider.get(APP_SERVICES_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as AppServices;
    } catch {
      return null;
    }
  }

  private loadCategoriesFromStorage(): AppCategories {
    try {
      const raw = localStorageProvider.get(APP_CATEGORIES_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as AppCategories;
    } catch {
      return null;
    }
  }

  private loadIndustriesFromStorage(): AppIndustries {
    try {
      const raw = localStorageProvider.get(APP_INDUSTRIES_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as AppIndustries;
    } catch {
      return null;
    }
  }

  private loadPlansFromStorage(): AppPlans {
    try {
      const raw = localStorageProvider.get(APP_PLANS_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as AppPlans;
    } catch {
      return null;
    }
  }

  private loadEventCategoriesFromStorage(): EventCategories | null {
    try {
      const raw = localStorageProvider.get(APP_EVENT_CATEGORIES_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as EventCategories;
    } catch {
      return null;
    }
  }

  getServices$() {
    return this.subject.asObservable();
  }

  getServicesValue(): AppServices {
    return this.subject.getValue();
  }

  getCategories$() {
    return this.subjectCategories.asObservable();
  }

  getCategoriesValue(): AppCategories {
    return this.subjectCategories.getValue();
  }

  getIndustries$() {
    return this.subjectIndustries.asObservable();
  }

  getIndustriesValue(): AppIndustries {
    return this.subjectIndustries.getValue();
  }

  getPlans$() {
    return this.subjectPlans.asObservable();
  }

  getPlansValue(): AppPlans {
    return this.subjectPlans.getValue();
  }

  getEventCategories$() {
    return this.subjectEventCategories.asObservable();
  }

  getEventCategoriesValue(): EventCategories | null {
    return this.subjectEventCategories.getValue();
  }

  async fetchServices(): Promise<AppServices> {
    // If we already have cached services, return them immediately
    const existing = this.getServicesValue();
    if (existing != null) return existing;

    // If a fetch is already in progress, reuse its promise to avoid duplicate network calls
    if (this.pendingFetchServices) return this.pendingFetchServices;

    this.pendingFetchServices = (async () => {
      const res = await this.api.getServices();
      const services = res?.services ?? [];
      try {
        localStorageProvider.set(APP_SERVICES_KEY, JSON.stringify(services));
      } catch {
        // ignore
      }
      this.subject.next(services);
      return services;
    })();

    try {
      return await this.pendingFetchServices;
    } finally {
      this.pendingFetchServices = null;
    }
  }

  async fetchCategories(): Promise<AppCategories> {
    const res = await this.api.getCategories();
    const categories = res?.categories ?? [];
    try {
      localStorageProvider.set(APP_CATEGORIES_KEY, JSON.stringify(categories));
    } catch {
      // ignore
    }
    this.subjectCategories.next(categories);
    return categories;
  }

  async fetchIndustries(): Promise<AppIndustries> {
    const res = await this.api.getIndustries();
    const industries = res?.industries ?? [];
    try {
      localStorageProvider.set(APP_INDUSTRIES_KEY, JSON.stringify(industries));
    } catch {
      // ignore
    }
    this.subjectIndustries.next(industries);
    return industries;
  }

  async fetchPlans(): Promise<AppPlans> {
    // avoid duplicate concurrent requests
    const existing = this.getPlansValue();
    if (existing != null) return existing;

    if (this.pendingFetchPlans) return this.pendingFetchPlans;

    this.pendingFetchPlans = (async () => {
      const res = await this.api.getPlans();
      const plans = res?.plans ?? [];
      try {
        localStorageProvider.set(APP_PLANS_KEY, JSON.stringify(plans));
      } catch {
        // ignore
      }
      this.subjectPlans.next(plans);
      return plans;
    })();

    try {
      return await this.pendingFetchPlans;
    } finally {
      this.pendingFetchPlans = null;
    }
  }

  async fetchEventCategories(): Promise<EventCategories | null> {
    const existing = this.getEventCategoriesValue();
    if (existing != null) return existing;

    if (this.pendingFetchEventCategories) return this.pendingFetchEventCategories;

    this.pendingFetchEventCategories = (async () => {
      const res = await this.api.getEventCategories();
      const cats = res?.categories ?? [];
      try {
        localStorageProvider.set(APP_EVENT_CATEGORIES_KEY, JSON.stringify(cats));
      } catch {
        // ignore
      }
      this.subjectEventCategories.next(cats);
      return cats;
    })();

    try {
      return await this.pendingFetchEventCategories;
    } finally {
      this.pendingFetchEventCategories = null;
    }
  }

  clear(): void {
    localStorageProvider.remove(APP_SERVICES_KEY);
    localStorageProvider.remove(APP_CATEGORIES_KEY);
    localStorageProvider.remove(APP_INDUSTRIES_KEY);
    localStorageProvider.remove(APP_PLANS_KEY);
    localStorageProvider.remove(APP_EVENT_CATEGORIES_KEY);
    this.subject.next(null);
    this.subjectCategories.next(null);
    this.subjectIndustries.next(null);
    this.subjectPlans.next(null);
    this.subjectEventCategories.next(null);
  }
}

export type EventCategoryItem = { id: string; code: string; label: string };
export type EventCategories = EventCategoryItem[] | null;

export const applicationService = new ApplicationService();

export default applicationService;
