"use client";

import { ChevronDown } from "lucide-react";
import type * as React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type DropdownSelectOption<TValue extends string> = {
  label: string;
  value: TValue;
};

type DropdownSelectProps<TValue extends string> = {
  className?: string;
  contentClassName?: string;
  disabled?: boolean;
  id?: string;
  name?: string;
  onValueChange?: (value: TValue) => void;
  options: ReadonlyArray<DropdownSelectOption<TValue>>;
  placeholder?: string;
  value: TValue;
} & Pick<React.ButtonHTMLAttributes<HTMLButtonElement>, "aria-describedby" | "aria-invalid">;

function DropdownSelect<TValue extends string>({
  className,
  contentClassName,
  disabled,
  id,
  name,
  onValueChange,
  options,
  placeholder,
  value,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
}: DropdownSelectProps<TValue>) {
  const selectedOption = options.find((option) => option.value === value);

  return (
    <>
      {name ? <input name={name} type="hidden" value={value} /> : null}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            aria-describedby={ariaDescribedBy}
            aria-invalid={ariaInvalid}
            className={cn("w-full justify-between font-normal", className)}
            disabled={disabled}
            id={id}
            type="button"
            variant="outline"
          >
            <span className="truncate">{selectedOption?.label ?? placeholder}</span>
            <ChevronDown aria-hidden="true" className="size-4 opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className={cn("w-[--radix-dropdown-menu-trigger-width]", contentClassName)}
        >
          <DropdownMenuRadioGroup
            onValueChange={(nextValue) => onValueChange?.(nextValue as TValue)}
            value={value}
          >
            {options.map((option) => (
              <DropdownMenuRadioItem key={option.value} value={option.value}>
                {option.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

export { DropdownSelect, type DropdownSelectOption };
