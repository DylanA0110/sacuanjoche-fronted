import { useState } from 'react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/shared/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui/popover';
import { Button } from '@/shared/components/ui/button';
import { MdCheck, MdExpandMore } from 'react-icons/md';
import { cn } from '@/shared/hooks/lib/utils';

export interface Option {
  value: string;
  label: string;
  subtitle?: string;
}

interface SearchableSelectProps {
  options: Option[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Seleccionar...',
  searchPlaceholder = 'Buscar...',
  emptyText = 'No se encontraron resultados',
  className,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);

  const selectedOption = options.find((option) => option.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-full justify-between bg-input border-border/50 hover:border-primary/50',
            className
          )}
        >
          <span
            className={cn(
              'truncate',
              !selectedOption && 'text-muted-foreground'
            )}
          >
            {selectedOption ? (
              <div className="flex flex-col items-start">
                <span>{selectedOption.label}</span>
                {selectedOption.subtitle && (
                  <span className="text-xs text-muted-foreground">
                    {selectedOption.subtitle}
                  </span>
                )}
              </div>
            ) : (
              placeholder
            )}
          </span>
          <MdExpandMore className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 glass-premium" align="start">
        <Command className="bg-transparent">
          <CommandInput placeholder={searchPlaceholder} className="border-0" />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className="cursor-pointer"
                >
                  <MdCheck
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === option.value
                        ? 'opacity-100 text-primary'
                        : 'opacity-0'
                    )}
                  />
                  <div className="flex flex-col">
                    <span>{option.label}</span>
                    {option.subtitle && (
                      <span className="text-xs text-muted-foreground">
                        {option.subtitle}
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
