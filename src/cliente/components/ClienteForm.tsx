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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import type { Cliente, CreateClienteDto, UpdateClienteDto } from '../types/cliente.interface';
import { MdSave } from 'react-icons/md';

interface ClienteFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cliente?: Cliente | null;
  onSubmit: (data: CreateClienteDto | UpdateClienteDto) => void;
  isLoading?: boolean;
}

export function ClienteForm({
  open,
  onOpenChange,
  cliente,
  onSubmit,
  isLoading = false,
}: ClienteFormProps) {
  const [formData, setFormData] = useState<CreateClienteDto>({
    primerNombre: '',
    primerApellido: '',
    telefono: '',
  });

  useEffect(() => {
    if (cliente) {
      setFormData({
        primerNombre: cliente.primerNombre,
        primerApellido: cliente.primerApellido,
        telefono: cliente.telefono,
      });
    } else {
      setFormData({
        primerNombre: '',
        primerApellido: '',
        telefono: '',
      });
    }
  }, [cliente, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.primerNombre.trim() || !formData.primerApellido.trim() || !formData.telefono.trim()) {
      return;
    }

    // Al crear un nuevo cliente, siempre se envía estado: 'activo' por defecto
    const dataToSubmit = cliente
      ? formData // Al editar, no se envía estado (solo se cambia al desactivar)
      : { ...formData, estado: 'activo' }; // Al crear, siempre activo

    onSubmit(dataToSubmit);
  };

  const handleChange = (
    field: keyof CreateClienteDto,
    value: string | 'activo' | 'inactivo'
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-gray-200 shadow-2xl max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            {cliente ? 'Editar Cliente' : 'Nuevo Cliente'}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {cliente
              ? 'Modifica la información del cliente'
              : 'Completa los datos para crear un nuevo cliente'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="primerNombre" className="text-sm font-semibold text-gray-700">
              Primer Nombre *
            </Label>
            <Input
              id="primerNombre"
              value={formData.primerNombre}
              onChange={(e) => handleChange('primerNombre', e.target.value)}
              placeholder="Juan"
              className="bg-white border-gray-300 text-gray-900"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="primerApellido" className="text-sm font-semibold text-gray-700">
              Primer Apellido *
            </Label>
            <Input
              id="primerApellido"
              value={formData.primerApellido}
              onChange={(e) => handleChange('primerApellido', e.target.value)}
              placeholder="Pérez"
              className="bg-white border-gray-300 text-gray-900"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefono" className="text-sm font-semibold text-gray-700">
              Teléfono *
            </Label>
            <Input
              id="telefono"
              value={formData.telefono}
              onChange={(e) => handleChange('telefono', e.target.value)}
              placeholder="+1234567890"
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
                ? cliente
                  ? 'Guardando...'
                  : 'Creando...'
                : cliente
                ? 'Guardar Cambios'
                : 'Crear Cliente'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

