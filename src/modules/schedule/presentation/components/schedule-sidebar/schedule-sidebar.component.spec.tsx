import React from 'react';
import { render, screen } from '@testing-library/react';
import MockStoreProvider from '@core/storage/mock-store.provider';

jest.mock('../schedule-event-modal/schedule-event-modal.component', () => ({
  ScheduleEventModal: () => null,
}));

import { ScheduleSidebar } from './schedule-sidebar.component';

describe('ScheduleSidebar', () => {
  test('renders without crashing', () => {
    render(
      <MockStoreProvider>
        <ScheduleSidebar categories={[]} statuses={[]} />
      </MockStoreProvider>
    );
    expect(screen.getByText(/my calendar/i)).toBeTruthy();
  });
});
