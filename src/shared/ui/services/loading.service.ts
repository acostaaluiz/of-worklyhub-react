import { BehaviorSubject } from "rxjs";

class LoadingService {
  private subject = new BehaviorSubject<boolean>(false);

  public readonly observable = this.subject.asObservable();

  public show(): void {
    this.subject.next(true);
  }

  public hide(): void {
    this.subject.next(false);
  }

  public set(visible: boolean): void {
    this.subject.next(visible);
  }

  public getValue(): boolean {
    return this.subject.getValue();
  }
}

export const loadingService = new LoadingService();

export default loadingService;
