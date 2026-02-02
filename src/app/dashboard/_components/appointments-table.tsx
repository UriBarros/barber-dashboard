"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Loader2, RefreshCw } from "lucide-react";
import type { AppointmentWithRelations } from "@/types/database.types";
import { formatTimeBR } from "@/lib/date-utils";
import { AppointmentDetailsModal } from "@/components/appointment-details-modal";
import { useProfessionals } from "@/services/professionals/use-professionals";

interface AppointmentsTableProps {
  appointments: AppointmentWithRelations[];
  isLoading?: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

// Função auxiliar para traduzir status (opcional, se vier do banco em inglês)
const getStatusLabel = (status: string) => {
  switch (status) {
    case 'confirmed': return 'Confirmado';
    case 'completed': return 'Concluído';
    case 'cancelled': return 'Cancelado';
    case 'scheduled': return 'Agendado';
    default: return status;
  }
};

// Função auxiliar para cor do status
const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case 'confirmed': return 'default'; // Preto/Padrão
    case 'completed': return 'secondary'; // Cinza/Verde dependendo do tema
    case 'cancelled': return 'destructive'; // Vermelho
    default: return 'outline';
  }
};

export function AppointmentsTable({
  appointments,
  isLoading = false,
  onRefresh,
  isRefreshing = false,
}: AppointmentsTableProps) {
  const [selectedAppointment, setSelectedAppointment] =
    useState<AppointmentWithRelations | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProfessionalId, setSelectedProfessionalId] =
    useState<string>("all");

  const { data: professionals = [], isLoading: isLoadingProfessionals } =
    useProfessionals();

  const filteredAppointments = useMemo(() => {
    let filtered = appointments;

    // Filtro por Profissional
    if (selectedProfessionalId !== "all") {
      filtered = filtered.filter(
        (appointment) =>
          appointment.professional_code.toString() === selectedProfessionalId
      );
    }

    // Filtro por Nome do Cliente
    if (searchQuery.trim()) {
      filtered = filtered.filter((appointment) =>
        appointment.customer_name
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [appointments, searchQuery, selectedProfessionalId]);

  if (isLoading) {
    return (
      <Card className="p-12">
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Carregando agendamentos...</p>
        </div>
      </Card>
    );
  }

  if (appointments.length === 0) {
    return (
      <Card className="p-12">
        <div className="text-center">
          <p className="text-muted-foreground">
            Nenhum agendamento encontrado para esta data
          </p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <div className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-semibold">Agendamentos do Dia</h2>
              <p className="text-sm text-muted-foreground">
                Visualize e gerencie os atendimentos agendados
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome do cliente..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={selectedProfessionalId}
                onValueChange={setSelectedProfessionalId}
                disabled={isLoadingProfessionals}
              >
                <SelectTrigger className="w-full sm:w-[250px]">
                  <SelectValue placeholder="Todos os profissionais" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os profissionais</SelectItem>
                  {professionals.map((professional) => (
                    <SelectItem
                      key={professional.id}
                      value={professional.id.toString()}
                    >
                      {professional.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={onRefresh}
                disabled={isRefreshing || !onRefresh}
                title="Atualizar agendamentos"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-y bg-muted/30">
                <th className="text-left p-4 font-medium text-sm text-muted-foreground">Horário</th>
                <th className="text-left p-4 font-medium text-sm text-muted-foreground">Cliente</th>
                <th className="text-left p-4 font-medium text-sm text-muted-foreground">Serviço</th>
                <th className="text-left p-4 font-medium text-sm text-muted-foreground">Profissional</th>
                <th className="text-left p-4 font-medium text-sm text-muted-foreground">Status</th>
                <th className="text-left p-4 font-medium text-sm text-muted-foreground">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="p-12 text-center text-muted-foreground"
                  >
                    Nenhum agendamento encontrado com os filtros atuais
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((appointment) => {
                  // Fallback seguro caso o join falhe ou esteja carregando
                  const professionalName = appointment.professional?.name || "N/A";
                  const serviceName = appointment.service?.code || "Serviço não ident."; 
                  // Nota: no seu type service.code é string (nome) ou code mesmo? 
                  // Se service.code for o NOME no mock, use isso. Se tiver um campo 'name', troque para service.name.
                  
                  return (
                    <tr
                      key={appointment.id}
                      className="border-b hover:bg-muted/20 transition-colors"
                    >
                      {/* 1. Coluna Horário (Início - Fim) */}
                      <td className="p-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">
                            {formatTimeBR(appointment.start_time)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            até {formatTimeBR(appointment.end_time)}
                          </span>
                        </div>
                      </td>

                      {/* 2. Coluna Cliente */}
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="font-medium">{appointment.customer_name}</span>
                          <span className="text-xs text-muted-foreground">{appointment.customer_phone}</span>
                        </div>
                      </td>

                      {/* 3. Coluna Serviço (NOVA) */}
                      <td className="p-4">
                         {/* Ajuste aqui se seu objeto service tiver 'name' ou 'code' como nome */}
                        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                           {/* Como no seu mock data 'services' tem 'name', o ideal é que a relation traga 'name' */}
                           {/* Assumindo que o join traz o objeto completo do mock: */}
                           {(appointment as any).service?.name || (appointment as any).service?.code || "Corte"}
                        </span>
                      </td>

                      {/* 4. Coluna Profissional (NOVA) */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">
                            {professionalName}
                          </span>
                        </div>
                      </td>

                       {/* 5. Coluna Status (NOVA) */}
                       <td className="p-4">
                          <Badge variant={getStatusVariant((appointment as any).status || 'scheduled')}>
                            {getStatusLabel((appointment as any).status || 'scheduled')}
                          </Badge>
                       </td>

                      {/* 6. Ações */}
                      <td className="p-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedAppointment(appointment)}
                        >
                          Ver Detalhes
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <AppointmentDetailsModal
        appointment={selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
        onUpdate={() => {
          setSelectedAppointment(null);
          // O ideal seria chamar o refresh aqui também se necessário
          if (onRefresh) onRefresh();
        }}
      />
    </>
  );
}