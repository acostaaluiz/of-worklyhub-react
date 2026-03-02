import { render } from '@testing-library/react';
import MockStoreProvider from '@core/storage/mock-store.provider';
import { WorkOrderForm } from './work-order-form.component';

describe('WorkOrderForm', () => {
  test('renders form without crashing', () => {
    render(
      <MockStoreProvider>
        <WorkOrderForm statuses={[]} onSubmit={async () => {}} />
      </MockStoreProvider>
    );
    expect(true).toBe(true);
  });
});
