import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { CreateFacturaDto, UpdateFacturaDto, Factura } from '../types/factura.interface';

interface FacturaFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  factura?: Factura | null;
  onSubmit: (data: CreateFacturaDto | UpdateFacturaDto) => Promise<void>;
  isLoading?: boolean;
}

const estados = ['Emitida', 'Pagada', 'Pendiente', 'Anulada'];

export function FacturaForm({
  open,
  onOpenChange,
  factura,
  onSubmit,
  isLoading = false,
}: FacturaFormProps) {
  const [formData, setFormData] = useState<CreateFacturaDto>({
    idPedido: 0,
    idEmpleado: 0,
    numFactura: '',
    estado: 'Emitida',
    montoTotal: 0,
  });

  useEffect(() => {
    if (factura) {
      setFormData({
        idPedido: factura.idPedido,
        idEmpleado: factura.idEmpleado,
        numFactura: factura.numFactura,
        estado: factura.estado,
        montoTotal: parseFloat(factura.montoTotal),
      });
    } else {
      setFormData({
        idPedido: 0,
        idEmpleado: 0,
        numFactura: '',
        estado: 'Emitida',
        montoTotal: 0,
      });
    }
  }, [factura, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación adicional
    if (formData.idPedido <= 0 || formData.idEmpleado <= 0) {
      return;
    }
    
    if (!formData.numFactura.trim()) {
      return;
    }
    
    if (formData.montoTotal <= 0) {
      return;
    }
    
    await onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {factura ? 'Editar Factura' : 'Nueva Factura'}
          </DialogTitle>
          <DialogDescription>
            {factura
              ? 'Modifica los datos de la factura'
              : 'Completa los datos para crear una nueva factura'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="numFactura">Número de Factura</Label>
              <Input
                id="numFactura"
                value={formData.numFactura}
                onChange={(e) =>
                  setFormData({ ...formData, numFactura: e.target.value })
                }
                placeholder="FAC-2024-001"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="idPedido">ID Pedido</Label>
              <Input
                id="idPedido"
                type="number"
                value={formData.idPedido || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    idPedido: parseInt(e.target.value) || 0,
                  })
                }
                placeholder="1"
                required
                min="1"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="idEmpleado">ID Empleado</Label>
              <Input
                id="idEmpleado"
                type="number"
                value={formData.idEmpleado || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    idEmpleado: parseInt(e.target.value) || 0,
                  })
                }
                placeholder="1"
                required
                min="1"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="estado">Estado</Label>
              <Select
                value={formData.estado}
                onValueChange={(value) =>
                  setFormData({ ...formData, estado: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  {estados.map((estado) => (
                    <SelectItem key={estado} value={estado}>
                      {estado}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="montoTotal">Monto Total</Label>
              <Input
                id="montoTotal"
                type="number"
                step="0.01"
                value={formData.montoTotal || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    montoTotal: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="150.00"
                required
                min="0"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? 'Guardando...'
                : factura
                ? 'Actualizar'
                : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

