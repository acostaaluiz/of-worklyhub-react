import React from 'react';
import { render, screen } from '@testing-library/react';
import MockStoreProvider from '@core/storage/mock-store.provider';
import { ScheduleEventModal } from './schedule-event-modal.component';

describe('ScheduleEventModal', () => {
  test('renders minimal modal', () => {
    render(
      <MockStoreProvider>
        <ScheduleEventModal
          open={false}
          onClose={() => {}}
          categories={[]}
          initialDate={new Date().toISOString().split('T')[0]}
          onConfirm={async () => {}}
        />
      </MockStoreProvider>
    );
    // no crash
    expect(true).toBe(true);
  });
});
