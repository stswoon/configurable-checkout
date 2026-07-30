import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";

export type AsyncSelectOption = {
  value: string;
  label?: string;
};

export type AsyncSelectProps = {
  id?: string;
  value: string;
  onValueChange: (value: string) => void;
  options?: readonly (string | AsyncSelectOption)[];
  isLoading?: boolean;
  placeholder?: string;
  loadingMessage?: string;
  emptyMessage?: string;
  disabled?: boolean;
};

function normalizeOptions(
  options: readonly (string | AsyncSelectOption)[],
): AsyncSelectOption[] {
  return options.map((option) =>
    typeof option === "string" ? { value: option, label: option } : option,
  );
}

export function AsyncSelect({
  id,
  value,
  onValueChange,
  options = [],
  isLoading = false,
  placeholder = "Select…",
  loadingMessage = "Loading…",
  emptyMessage = "No options available",
  disabled = false,
}: AsyncSelectProps) {
  const normalizedOptions = normalizeOptions(options);
  const isEmpty = !isLoading && normalizedOptions.length === 0;

  const resolvedPlaceholder = isLoading
    ? loadingMessage
    : isEmpty
      ? emptyMessage
      : placeholder;

  return (
    <Select
      value={value || undefined}
      onValueChange={onValueChange}
      disabled={disabled || isLoading || isEmpty}
    >
      <SelectTrigger id={id}>
        <SelectValue placeholder={resolvedPlaceholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {normalizedOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label ?? option.value}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
