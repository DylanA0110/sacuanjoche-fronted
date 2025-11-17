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
import type { MetodoPago, CreateMetodoPagoDto, UpdateMetodoPagoDto } from '../types/metodo-pago.interface';
import { MdSave } from 'react-icons/md';

interface MetodoPagoFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  metodoPago?: MetodoPago | null;
  onSubmit: (data: CreateMetodoPagoDto | UpdateMetodoPagoDto) => void;
  isLoading?: boolean;
}

export function MetodoPagoForm({
  open,
  onOpenChange,
  metodoPago,
  onSubmit,
  isLoading = false,
}: MetodoPagoFormProps) {
  const [formData, setFormData] = useState<CreateMetodoPagoDto>({
    descripcion: '',
    tipo: '',
    canalesDisponibles: [],
  });
  const [canalInput, setCanalInput] = useState('');

  useEffect(() => {
    if (metodoPago) {
      setFormData({
        descripcion: metodoPago.descripcion,
        tipo: metodoPago.tipo,
        canalesDisponibles: metodoPago.canalesDisponibles || [],
      });
    } else {
      setFormData({
        descripcion: '',
        tipo: '',
        canalesDisponibles: [],
      });
    }
    setCanalInput('');
  }, [metodoPago, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.descripcion.trim() || !formData.tipo.trim() || formData.canalesDisponibles.length === 0) {
      return;
    }

    const dataToSubmit = metodoPago
      ? formData
      : { ...formData, estado: 'activo' };

    onSubmit(dataToSubmit);
  };

  const handleAddCanal = () => {
    if (canalInput.trim() && !formData.canalesDisponibles.includes(canalInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        canalesDisponibles: [...prev.canalesDisponibles, canalInput.trim()],
      }));
      setCanalInput('');
    }
  };

  const handleRemoveCanal = (canal: string) => {
    setFormData((prev) => ({
      ...prev,
      canalesDisponibles: prev.canalesDisponibles.filter((c) => c !== canal),
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-gray-200 shadow-2xl max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            {metodoPago ? 'Editar Método de Pago' : 'Nuevo Método de Pago'}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {metodoPago
              ? 'Modifica la información del método de pago'
              : 'Completa los datos para crear un nuevo método de pago'}
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
              onChange={(e) => setFormData((prev) => ({ ...prev, descripcion: e.target.value }))}
              placeholder="PayPal"
              className="bg-white border-gray-300 text-gray-900"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipo" className="text-sm font-semibold text-gray-700">
              Tipo *
            </Label>
            <Select
              value={formData.tipo}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, tipo: value }))}
            >
              <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                <SelectValue placeholder="Selecciona un tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="presencial">Presencial</SelectItem>
                <SelectItem value="mixto">Mixto</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">
              Canales Disponibles *
            </Label>
            <div className="flex gap-2">
              <Input
                value={canalInput}
                onChange={(e) => setCanalInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCanal();
                  }
                }}
                placeholder="web, interno, etc."
                className="bg-white border-gray-300 text-gray-900"
              />
              <Button
                type="button"
                onClick={handleAddCanal}
                className="bg-[#50C878] hover:bg-[#50C878]/90 text-white"
              >
                Agregar
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.canalesDisponibles.map((canal) => (
                <span
                  key={canal}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-800 rounded-md text-sm"
                >
                  {canal}
                  <button
                    type="button"
                    onClick={() => handleRemoveCanal(canal)}
                    className="text-red-600 hover:text-red-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
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
                ? metodoPago
                  ? 'Guardando...'
                  : 'Creando...'
                : metodoPago
                ? 'Guardar Cambios'
                : 'Crear Método'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

