"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Briefcase, Clock } from "lucide-react";
import type { ServiceRow } from "@/types/database.types";
import { formatDateTimeBR } from "@/lib/date-utils";
import { toast } from "sonner";
import {
  useCreateService,
  useUpdateService,
} from "@/services/services/use-services";

interface ServiceDetailsModalProps {
  service: ServiceRow | null;
  isCreating?: boolean;
  onClose: () => void;
}

export function ServiceDetailsModal({
  service,
  isCreating = false,
  onClose,
}: ServiceDetailsModalProps) {
  const [code, setCode] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");

  const createMutation = useCreateService();
  const updateMutation = useUpdateService();

  useEffect(() => {
    if (service) {
      setCode(service.code);
      setDurationMinutes(service.duration_minutes.toString());
    } else if (isCreating) {
      setCode("");
      setDurationMinutes("");
    }
  }, [service, isCreating]);

  const isOpen = !!service || isCreating;

  const handleSave = async () => {
    if (!code.trim()) {
      toast.error("Por favor, preencha o nome do serviço");
      return;
    }

    const duration = parseInt(durationMinutes);
    if (!durationMinutes.trim() || isNaN(duration) || duration <= 0) {
      toast.error("Por favor, preencha uma duração válida (maior que 0)");
      return;
    }

    try {
      if (isCreating) {
        await createMutation.mutateAsync({
          code: code.trim(),
          duration_minutes: duration,
        });
        toast.success("Serviço criado com sucesso!");
      } else if (service) {
        await updateMutation.mutateAsync({
          id: service.id,
          code: code.trim(),
          duration_minutes: duration,
        });
        toast.success("Serviço atualizado com sucesso!");
      }
      onClose();
    } catch (error) {
      toast.error(
        isCreating ? "Erro ao criar serviço" : "Erro ao atualizar serviço"
      );
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[70vh] p-0">
        <DialogHeader className="px-4 pt-6 pb-4">
          <DialogTitle className="text-xl sm:text-2xl">
            {isCreating ? "Novo Serviço" : "Editar Serviço"}
          </DialogTitle>
          <DialogDescription>
            {isCreating
              ? "Preencha as informações do novo serviço"
              : "Atualize as informações do serviço"}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[calc(70vh-240px)] px-6">
          <div className="space-y-6 pb-6 pr-4">
            {service && !isCreating && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    ID: {service.id}
                  </span>
                </div>
                <Separator />
              </>
            )}

            <div className="space-y-4">
              <h3 className="font-semibold text-base sm:text-lg flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                Informações do Serviço
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Nome do Serviço *</Label>
                  <Input
                    id="code"
                    placeholder="Ex: Consulta Geral"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    disabled={isPending}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Nome que identifica o serviço
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Duração em Minutos *
                  </Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    placeholder="Ex: 30"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(e.target.value)}
                    disabled={isPending}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Tempo estimado de duração do serviço
                  </p>
                </div>
              </div>
            </div>

            {service && !isCreating && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h3 className="font-semibold text-base sm:text-lg">
                    Informações Adicionais
                  </h3>
                  <div className="pl-0 sm:pl-7">
                    <p className="text-sm text-muted-foreground">
                      Cadastrado em
                    </p>
                    <p className="font-medium">
                      {formatDateTimeBR(service.created_at)}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="px-6 pb-6 pt-4 border-t">
          <div className="flex gap-2 w-full sm:justify-end">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isPending}
              className="flex-1 sm:flex-none"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={isPending || !code.trim() || !durationMinutes.trim()}
              className="flex-1 sm:flex-none"
            >
              {isPending ? "Salvando..." : isCreating ? "Criar" : "Salvar"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
