// src/lib/mock-data.ts

// Interfaces adaptadas para a Barbearia
export interface Service {
  id: number;
  name: string;
  duration: number; // em minutos
  color: string;
  price: number; // Adicionei preço para ficar completo
}

export interface Professional {
  id: number;
  name: string;
  specialty: string; // Ex: "Corte & Barba", "Visagismo"
  color: string;
  avatar_url?: string; // Preparando para futuro
}

export interface Appointment {
  id: string;
  created_at: string;
  service_code: number;
  professional_code: number;
  customer_name: string;
  customer_phone: string;
  start_time: string;
  end_time: string;
  status: "scheduled" | "confirmed" | "in_progress" | "completed" | "cancelled";
}

// --- DADOS DA BARBEARIA (Alinhado com o N8N) ---

export const services: Service[] = [
  { id: 1, name: "Corte Social", duration: 30, color: "bg-zinc-800", price: 45.00 },
  { id: 2, name: "Barba Completa", duration: 25, color: "bg-amber-700", price: 35.00 },
  { id: 3, name: "Combo (Corte + Barba)", duration: 50, color: "bg-blue-900", price: 70.00 },
  { id: 4, name: "Pezinho / Acabamento", duration: 15, color: "bg-gray-500", price: 20.00 },
  { id: 5, name: "Platinado / Química", duration: 90, color: "bg-purple-700", price: 120.00 },
];

export const professionals: Professional[] = [
  {
    id: 1,
    name: "Carlos Barba",
    specialty: "Clássico & Tesoura",
    color: "bg-amber-600",
  },
  {
    id: 2,
    name: "Felipe Tesoura",
    specialty: "Degradê & Moderno",
    color: "bg-zinc-700",
  },
  {
    id: 3,
    name: "André Navalha",
    specialty: "Visagismo & Barboterapia",
    color: "bg-blue-700",
  },
];

// Gerador de Agendamentos Fictícios (Mock)
export function generateMockAppointments(): Appointment[] {
  const appointments: Appointment[] = [];
  const today = new Date();

  // Gera dados para os próximos 7 dias
  for (let day = 0; day < 7; day++) {
    const currentDate = new Date(today);
    currentDate.setDate(today.getDate() + day);

    // Ignora Domingo (dia 0) se a barbearia fecha
    if (currentDate.getDay() === 0) continue;

    // 6 a 10 agendamentos por dia
    const appointmentsPerDay = Math.floor(Math.random() * 5) + 6;

    for (let i = 0; i < appointmentsPerDay; i++) {
      // Horário comercial: 09h às 19h
      const hour = 9 + Math.floor(Math.random() * 10);
      const minute = Math.random() > 0.5 ? 0 : 30;

      const startTime = new Date(currentDate);
      startTime.setHours(hour, minute, 0, 0);

      const service = services[Math.floor(Math.random() * services.length)];
      const endTime = new Date(startTime);
      endTime.setMinutes(startTime.getMinutes() + service.duration);

      const statuses: Appointment["status"][] = [
        "scheduled",
        "confirmed",
        "completed", // Removi "in_progress" pois é raro usar manualmente
      ];

      // Peso maior para "confirmed"
      const status = Math.random() > 0.3 ? "confirmed" : statuses[Math.floor(Math.random() * statuses.length)];

      appointments.push({
        id: `apt-${day}-${i}`,
        created_at: new Date().toISOString(),
        service_code: service.id,
        professional_code: professionals[Math.floor(Math.random() * professionals.length)].id,
        customer_name: getRandomName(),
        customer_phone: getRandomPhone(),
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        status,
      });
    }
  }

  return appointments.sort(
    (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  );
}

const firstNames = ["Marcos", "Guilherme", "Rafael", "Lucas", "Matheus", "Gabriel", "Pedro", "Thiago", "Felipe", "João"];
const lastNames = ["Silva", "Oliveira", "Santos", "Pereira", "Costa", "Almeida", "Nascimento", "Rodrigues"];

function getRandomName(): string {
  return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
}

function getRandomPhone(): string {
  const ddd = 85; // DDD Fortaleza/Ceará (exemplo)
  const part1 = 90000 + Math.floor(Math.random() * 9999);
  const part2 = 1000 + Math.floor(Math.random() * 8999);
  return `(${ddd}) ${part1}-${part2}`;
}