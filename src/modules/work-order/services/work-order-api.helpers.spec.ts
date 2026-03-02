describe('WorkOrderApi helpers via instance', () => {
  beforeEach(() => jest.resetModules());

  test('toPositiveInt and normalizePagination behavior via instance', () => {
    const { WorkOrderApi } = require('./work-order-api');
    const http = { request: jest.fn() } as any;
    const api = new WorkOrderApi(http);
    const anyApi = api as any;

    expect(anyApi.toPositiveInt(undefined, 0)).toBe(0);
    expect(anyApi.toPositiveInt(null, 0)).toBe(0);
    expect(anyApi.toPositiveInt(5, 0)).toBe(5);
    expect(anyApi.toPositiveInt('3', 0)).toBe(3);

    const pag = anyApi.normalizePagination([], { limit: undefined, offset: undefined } as any, { limit: 2, offset: 0, total: 0 });
    expect(pag).toHaveProperty('limit');
    expect(pag).toHaveProperty('offset');
    expect(typeof pag.total === 'number').toBe(true);
  });
});
