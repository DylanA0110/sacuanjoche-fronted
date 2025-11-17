import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import type { FormaArreglo, CreateFormaArregloDto, UpdateFormaArregloDto } from '../types/forma-arreglo.interface';
import { MdSave } from 'react-icons/md';

interface FormaArregloFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formaArreglo?: FormaArreglo | null;
  onSubmit: (data: CreateFormaArregloDto | UpdateFormaArregloDto) => void;
  isLoading?: boolean;
}

export function FormaArregloForm({
  open,
  onOpenChange,
  formaArreglo,
  onSubmit,
  isLoading = false,
}: FormaArregloFormProps) {
  const [formData, setFormData] = useState<CreateFormaArregloDto>({
    descripcion: '',
  });

  useEffect(() => {
    if (formaArreglo) {
      setFormData({
        descripcion: formaArreglo.descripcion,
      });
    } else {
      setFormData({
        descripcion: '',
      });
    }
  }, [formaArreglo, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.descripcion.trim()) {
      return;
    }

    onSubmit(formData);
  };

  const handleChange = (value: string) => {
    setFormData({
      descripcion: value,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-gray-200 shadow-2xl max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            {formaArreglo ? 'Editar Forma de Arreglo' : 'Nueva Forma de Arreglo'}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {formaArreglo
              ? 'Modifica la descripción de la forma de arreglo'
              : 'Completa los datos para crear una nueva forma de arreglo'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="descripcion" className="text-sm font-semibold text-gray-700">
              Descripción *
            </Label>
            <Input
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => handleChange(e.target.value)}
              placeholder="Ramo"
              className="bg-white border-gray-300 text-gray-900"
              required
            />
          </div>

          <DialogFooter className="gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-[#50C878] hover:bg-[#50C878]/90 text-white shadow-md shadow-[#50C878]/20 gap-2"
            >
              <MdSave className="h-4 w-4" />
              {isLoading
                ? formaArreglo
                  ? 'Guardando...'
                  : 'Creando...'
                : formaArreglo
                ? 'Guardar Cambios'
                : 'Crear Forma'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

