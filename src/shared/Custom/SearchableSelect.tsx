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
            'w-full justify-between bg-white border-gray-300 text-gray-900 hover:bg-gray-50 hover:border-[#50C878] focus:border-[#50C878] focus:ring-2 focus:ring-[#50C878]/20',
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
      <PopoverContent className="w-full p-0 bg-white border-gray-200 shadow-xl" align="start">
        <Command className="bg-white">
          <CommandInput 
            placeholder={searchPlaceholder} 
            className="border-0 bg-white text-gray-900 placeholder:text-gray-500 focus:ring-0" 
          />
          <CommandList className="bg-white">
            <CommandEmpty className="text-gray-500 py-4">{emptyText}</CommandEmpty>
            <CommandGroup className="bg-white">
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className="cursor-pointer hover:bg-[#50C878]/10 text-gray-900 data-[selected]:bg-[#50C878]/20 data-[selected]:text-[#50C878]"
                >
                  <MdCheck
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === option.value
                        ? 'opacity-100 text-[#50C878]'
                        : 'opacity-0'
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">{option.label}</span>
                    {option.subtitle && (
                      <span className="text-xs text-gray-500">
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
