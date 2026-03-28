import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Form, Select } from "antd";

export type SelectOption = { value: string; label: string };
export type FetchResult = { options: SelectOption[]; hasNext: boolean };
export type FetchOptionsFn = (params: { q?: string; page: number; pageSize: number }) => Promise<FetchResult>;

const SEARCH_DEBOUNCE_MS = 300;
const PAGE_SIZE = 25;
const BOTTOM_OFFSET_PX = 24;

function mergeUnique(options: SelectOption[]): SelectOption[] {
  const seen = new Set<string>();
  const result: SelectOption[] = [];
  for (const option of options) {
    if (seen.has(option.value)) continue;
    seen.add(option.value);
    result.push(option);
  }
  return result;
}

type AsyncCatalogSelectProps = {
  fieldName: string;
  placeholder: string;
  dataCy: string;
  fetchOptions: FetchOptionsFn;
  initialOptions: SelectOption[];
  suffixIcon?: ReactNode;
};

export function AsyncCatalogSelect({
  fieldName,
  placeholder,
  dataCy,
  fetchOptions,
  initialOptions,
  suffixIcon,
}: AsyncCatalogSelectProps): ReactNode {
  const form = Form.useFormInstance();
  const selectedValue = Form.useWatch(fieldName, form) as string | undefined;
  const [options, setOptions] = useState<SelectOption[]>(mergeUnique(initialOptions));
  const [loading, setLoading] = useState(false);
  const [hasNext, setHasNext] = useState(true);
  const [page, setPage] = useState(1);
  const searchRef = useRef("");
  const requestIdRef = useRef(0);
  const debounceRef = useRef<number | undefined>(undefined);

  const loadOptions = useCallback(
    async (params: {
      page: number;
      q?: string;
      replace?: boolean;
    }) => {
      const requestId = ++requestIdRef.current;
      setLoading(true);
      try {
        const response = await fetchOptions({
          q: params.q,
          page: params.page,
          pageSize: PAGE_SIZE,
        });
        if (requestId !== requestIdRef.current) return;
        setHasNext(Boolean(response.hasNext));
        setPage(params.page);
        setOptions((previous) => {
          if (params.replace) return mergeUnique(response.options);
          return mergeUnique([...previous, ...response.options]);
        });
      } catch {
        if (requestId !== requestIdRef.current) return;
        setHasNext(false);
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    },
    [fetchOptions]
  );

  useEffect(() => {
    setOptions((previous) => mergeUnique([...previous, ...initialOptions]));
  }, [initialOptions]);

  useEffect(() => {
    loadOptions({ page: 1, q: undefined, replace: true }).catch(() => {});
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [loadOptions]);

  const mergedOptions = useMemo(() => {
    const base = mergeUnique(options);
    if (!selectedValue || base.some((option) => option.value === selectedValue)) return base;
    return [{ value: selectedValue, label: selectedValue }, ...base];
  }, [options, selectedValue]);

  return (
    <Select
      size="large"
      showSearch
      filterOption={false}
      placeholder={placeholder}
      options={mergedOptions}
      loading={loading}
      suffixIcon={suffixIcon}
      onSearch={(value) => {
        const nextSearch = value.trim();
        searchRef.current = nextSearch;
        if (debounceRef.current) window.clearTimeout(debounceRef.current);
        debounceRef.current = window.setTimeout(() => {
          loadOptions({ page: 1, q: nextSearch || undefined, replace: true }).catch(() => {});
        }, SEARCH_DEBOUNCE_MS);
      }}
      onPopupScroll={(event) => {
        const target = event.target as HTMLDivElement;
        const distanceToBottom = target.scrollHeight - (target.scrollTop + target.clientHeight);
        if (distanceToBottom > BOTTOM_OFFSET_PX) return;
        if (loading || !hasNext) return;
        loadOptions({ page: page + 1, q: searchRef.current || undefined, replace: false }).catch(() => {});
      }}
      data-cy={dataCy}
    />
  );
}

export default AsyncCatalogSelect;
