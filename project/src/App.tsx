import React, { useState, useEffect, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import { format } from 'date-fns';
import { Modal } from './components/Modal'; // Certifique-se que o caminho está correto
import { AppointmentForm } from './components/AppointmentForm'; // Certifique-se que o caminho está correto
import type { Appointment, AppointmentFormData } from './types'; // Certifique-se que o caminho está correto
import {
  Calendar,
  Plus,
  Trash2,
  MapPin,
  Clock,
  CalendarDays,
  CalendarClock,
  Car,
  HelpCircle,
  Sun, // Ícone para modo claro
  Moon, // Ícone para modo escuro
} from 'lucide-react';

const API_URL = "https://back-end-univesp-pi-1-86ml.vercel.app/";

function mapApiToAppointment(apiItem: any): Appointment {
  // Converte o item da API para o formato usado no frontend
  return {
    id: apiItem._id,
    date: apiItem.DataHoraSaida.slice(0, 10), // yyyy-MM-dd
    startTime: apiItem.DataHoraSaida.slice(11, 16), // HH:mm
    endTime: apiItem.DataHoraChegada.slice(11, 16), // HH:mm
    startAddress: apiItem.EnderecoSaida,
    endAddress: apiItem.EnderecoChegada,
    vehicle: apiItem.PlacaVeiculo,
    driver: apiItem.NomeMotorista,
    passengers: apiItem.NomePassageiros ? apiItem.NomePassageiros.split(',').map((p: string) => p.trim()) : [],
  };
}

function mapAppointmentToApi(app: Appointment): any {
  // Converte o agendamento do frontend para o formato da API
  return {
    DataHoraSaida: `${app.date}T${app.startTime}:00`,
    DataHoraChegada: `${app.date}T${app.endTime}:00`,
    EnderecoSaida: app.startAddress,
    EnderecoChegada: app.endAddress,
    NomeMotorista: app.driver,
    PlacaVeiculo: app.vehicle,
    NomePassageiros: app.passengers.join(', '),
    excluido: false,
  };
}

function App() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [activeView, setActiveView] = useState<'month' | 'week'>('month');

  // --- INÍCIO: Lógica do Modo Escuro ---
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || savedTheme === 'light') {
      return savedTheme;
    }
    // Opcional: Verificar preferência do sistema se não houver nada salvo
    // if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    //   return 'dark';
    // }
    return 'light'; // Padrão é modo claro
  });

  // Aplica a classe 'dark' ao <html> e salva no localStorage
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Função para alternar o tema
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };
  // --- FIM: Lógica do Modo Escuro ---

  const handleDateClick = useCallback((arg: { dateStr: string }) => {
    setSelectedDate(arg.dateStr);
    setIsModalOpen(true);
    setIsFormOpen(false); // Resetar form ao abrir modal por clique na data
  }, []);

  const handleAddAppointment = useCallback(() => {
    setIsFormOpen(true);
    // Não precisa abrir o modal aqui, pois ele já deve estar aberto
  }, []);

  // Carregar agendamentos da API ao iniciar
  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(data => setAppointments(data.filter((item: any) => !item.excluido).map(mapApiToAppointment)))
      .catch(() => alert("Erro ao carregar agendamentos do servidor!"));
  }, []);

  // Adicionar agendamento na API
  const handleFormSubmit = useCallback(async (data: AppointmentFormData) => {
    if (!selectedDate) return;

    const newAppointment: Appointment = {
      id: '', // será preenchido após o POST
      date: selectedDate,
      startTime: data.startTime,
      endTime: data.endTime,
      startAddress: data.startAddress,
      endAddress: data.endAddress,
      vehicle: data.vehicle,
      driver: data.driver,
      passengers: data.passengers.split('\n').filter(Boolean),
    };

    const apiData = mapAppointmentToApi(newAppointment);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiData),
      });
      if (!res.ok) throw new Error();
      const saved = await res.json();
      setAppointments(prev => [...prev, mapApiToAppointment(saved)]);
      setIsFormOpen(false);
    } catch {
      alert("Erro ao salvar agendamento!");
    }
  }, [selectedDate]);

  // Excluir agendamento na API
  const handleDeleteAppointment = useCallback(async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este agendamento?')) return;
    try {
      const res = await fetch(`${API_URL}${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setAppointments(prev => prev.filter(app => app.id !== id));
    } catch {
      alert("Erro ao excluir agendamento!");
    }
  }, []);

  const selectedDateAppointments = selectedDate
    ? appointments.filter(app => app.date === selectedDate)
    : [];

  const handleViewChange = (view: 'month' | 'week') => {
    setActiveView(view);
  };

  const handleNewAppointment = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    setSelectedDate(today);
    setIsModalOpen(true);
    setIsFormOpen(true); // Abrir o formulário diretamente
  };

  const handleHelp = () => {
    alert(
      'Ajuda do Sistema:\n\n' +
      '1. Clique em uma data para ver/adicionar agendamentos.\n' +
      '2. Use os botões Mensal/Semanal para mudar a visualização.\n' +
      '3. Use o botão "Novo" (Carro) para adicionar um agendamento para hoje.\n' +
      '4. Use o botão Sol/Lua para alternar entre modo claro e escuro.\n' +
      '5. Clique no ícone de lixeira para excluir um agendamento.'
    );
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsFormOpen(false); // Garante que o form feche ao fechar o modal
  }

  return (
    // Aplica classes base e dark mode ao container principal
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black text-gray-900 dark:text-gray-100 transition-colors duration-300">
      {/* Header permanece com a cor original ou pode ser adaptado para dark mode se preferir */}
      <header className="sticky top-0 z-10 bg-[#2E7D32] p-4 shadow-lg">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            {/* Logo e Título */}
            <div className="flex items-center space-x-2">
              <div className="rounded-full bg-white/10 p-2">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">SISVEI</h1>
                <p className="text-sm font-medium text-white/90">
                  Sistema de Agendamento de Veículos Integrado
                </p>
              </div>
            </div>

            {/* Navegação e Botões */}
            <div className="flex items-center space-x-4">
              <nav className="flex items-center space-x-1 sm:space-x-2"> {/* Ajuste de espaçamento */}
                {/* Botão Visualização Mensal */}
                <button
                  onClick={() => handleViewChange('month')}
                  className={`flex items-center space-x-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    activeView === 'month'
                      ? 'bg-white/20 text-white'
                      : 'text-white/80 hover:bg-white/10'
                  }`}
                  title="Visualização Mensal"
                >
                  <CalendarDays className="h-5 w-5" />
                  <span className="hidden sm:inline">Mensal</span> {/* Oculta texto em telas pequenas */}
                </button>
                {/* Botão Visualização Semanal */}
                <button
                  onClick={() => handleViewChange('week')}
                  className={`flex items-center space-x-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    activeView === 'week'
                      ? 'bg-white/20 text-white'
                      : 'text-white/80 hover:bg-white/10'
                  }`}
                  title="Visualização Semanal"
                >
                  <CalendarClock className="h-5 w-5" />
                  <span className="hidden sm:inline">Semanal</span> {/* Oculta texto em telas pequenas */}
                </button>
                {/* Botão Novo Agendamento */}
                <button
                  onClick={handleNewAppointment}
                  className="flex items-center space-x-1 rounded-lg px-3 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/10"
                  title="Novo Agendamento (Hoje)"
                >
                  <Car className="h-5 w-5" />
                   <span className="hidden sm:inline">Novo</span> {/* Oculta texto em telas pequenas */}
                </button>
                {/* Botão Ajuda */}
                <button
                  onClick={handleHelp}
                  className="flex items-center space-x-1 rounded-lg px-3 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/10"
                  title="Ajuda"
                >
                  <HelpCircle className="h-5 w-5" />
                   <span className="hidden sm:inline">Ajuda</span> {/* Oculta texto em telas pequenas */}
                </button>

                {/* --- BOTÃO MODO ESCURO --- */}
                <button
                  onClick={toggleTheme}
                  className="flex items-center space-x-1 rounded-lg p-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/10" // Padding ajustado para ícone sozinho
                  title={theme === 'light' ? 'Ativar Modo Escuro' : 'Ativar Modo Claro'}
                >
                  {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                  {/* <span className="hidden sm:inline">{theme === 'light' ? 'Escuro' : 'Claro'}</span> */} {/* Texto opcional */}
                </button>
                {/* --- FIM BOTÃO MODO ESCURO --- */}
              </nav>
              {/* Texto Prefeitura */}
              <p className="hidden text-sm font-medium text-white/80 md:block"> {/* Oculta em telas menores */}
                Prefeitura Municipal de Piracicaba
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4">
        {/* Card do Calendário com estilos dark mode */}
        <div className="calendar-card overflow-hidden rounded-xl bg-white p-4 shadow-lg dark:bg-gray-800 md:p-6">
           {/* 
             IMPORTANTE: A estilização interna do FullCalendar (cores de dias, eventos, header)
             pode precisar de CSS adicional para ficar perfeita no modo escuro.
             Você pode precisar adicionar regras CSS globais como:
             .dark .fc { --fc-border-color: theme('colors.gray.700'); ... }
             .dark .fc-daygrid-day-number { color: theme('colors.gray.300'); }
             .dark .fc-col-header-cell-cushion { color: theme('colors.gray.300'); }
             .dark .fc-button { background-color: theme('colors.gray.700'); border-color: theme('colors.gray.600'); color: theme('colors.gray.200'); }
             .dark .fc-button:hover { background-color: theme('colors.gray.600'); }
             .dark .fc-day-today { background-color: theme('colors.gray.700 / 50%') !important; }
             Adicione essas regras ao seu arquivo CSS principal (ex: src/index.css)
           */}
          <FullCalendar
            key={activeView + theme} // Força re-renderização ao mudar tema/view
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView={activeView === 'month' ? 'dayGridMonth' : 'dayGridWeek'}
            locale={ptBrLocale}
            dateClick={handleDateClick}
            events={appointments.map(app => ({
              id: app.id, // Adicionar id para referência
              title: `${app.startTime} ${app.vehicle}`, // Talvez mostrar só o horário/veículo
              date: app.date,
              // Pode adicionar mais propriedades aqui (backgroundColor, textColor) se necessário
            }))}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: '', // Botões de view movidos para o header customizado
            }}
            buttonText={{ // Textos dos botões internos do calendário
                today: 'Hoje',
                month: 'Mês',
                week: 'Semana',
                day: 'Dia',
                list: 'Lista'
            }}
            // Aumentar altura para melhor visualização
            height="auto" // Ou um valor fixo como "650px"
            contentHeight="auto"
          />
        </div>

        {/* Modal com estilos dark mode (O componente Modal interno também precisa ter classes dark:) */}
        <Modal isOpen={isModalOpen} onClose={closeModal}>
          {isFormOpen ? (
            // O componente AppointmentForm precisa ter seus próprios estilos dark mode internos
            <AppointmentForm
              onSubmit={handleFormSubmit}
              onCancel={() => setIsFormOpen(false)} // Botão cancelar dentro do form pode só fechar o form
              initialDate={selectedDate} // Passar a data selecionada se necessário
            />
          ) : (
            // Conteúdo de visualização dos agendamentos
            <div className="p-1"> {/* Padding interno mínimo */}
              <div className="mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 md:text-2xl">
                  Agendamentos
                  <span className="ml-2 text-lg font-normal text-gray-500 dark:text-gray-400">
                    {/* Adicionado T00:00:00 para evitar problemas de timezone na formatação */}
                    {selectedDate && format(new Date(selectedDate + 'T00:00:00'), 'dd/MM/yyyy')}
                  </span>
                </h2>
                <button onClick={handleAddAppointment} className="btn-primary inline-flex items-center px-3 py-1.5 text-sm md:px-4 md:py-2"> {/* Botão menor */}
                  <Plus className="mr-1.5 h-4 w-4" />
                  Adicionar
                </button>
              </div>

              {selectedDateAppointments.length === 0 ? (
                // Mensagem de nenhum agendamento com estilos dark mode
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 py-10 text-center dark:border-gray-700">
                  <Calendar className="mb-3 h-10 w-10 text-gray-400 dark:text-gray-500" />
                  <p className="text-gray-500 dark:text-gray-400">
                    Nenhum agendamento para esta data.
                  </p>
                  <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
                     Clique em "Adicionar" para criar um novo.
                  </p>
                </div>
              ) : (
                // Lista de agendamentos com estilos dark mode
                <div className="space-y-3">
                  {selectedDateAppointments.map(appointment => (
                    <div
                      key={appointment.id}
                      // Card de agendamento com estilos dark mode
                      className="appointment-card flex items-start justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700 dark:bg-gray-800 md:p-4"
                    >
                      <div className="flex-grow space-y-1.5 pr-2"> {/* Espaço para o botão de lixo */}
                        {/* Horário */}
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500" />
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {appointment.startTime} - {appointment.endTime}
                          </p>
                        </div>
                        {/* Veículo e Motorista */}
                         <div className="flex items-center space-x-2">
                          <Car className="h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500" />
                           <div className="text-sm">
                              <span className="font-medium text-gray-900 dark:text-gray-100">{appointment.vehicle}</span>
                              <span className="text-gray-600 dark:text-gray-300"> (Motorista: {appointment.driver})</span>
                           </div>
                        </div>
                        {/* Endereço Origem */}
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-500" />
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            <span className='font-medium'>Saída:</span> {appointment.startAddress}
                          </p>
                        </div>
                        {/* Endereço Destino */}
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 flex-shrink-0 text-red-600 dark:text-red-500" />
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            <span className='font-medium'>Destino:</span> {appointment.endAddress}
                          </p>
                        </div>
                         {/* Passageiros (se houver) */}
                        {appointment.passengers && appointment.passengers.length > 0 && (
                           <div className="pt-1 text-sm text-gray-600 dark:text-gray-400">
                             <p className="font-medium">Passageiros:</p>
                             <ul className="list-disc pl-5">
                               {appointment.passengers.map((p, index) => <li key={index}>{p}</li>)}
                             </ul>
                           </div>
                         )}
                      </div>
                      {/* Botão Excluir com estilos dark mode */}
                      <button
                        onClick={() => handleDeleteAppointment(appointment.id)}
                        className="ml-2 flex-shrink-0 rounded-full p-1.5 text-gray-400 transition-colors hover:bg-red-100 hover:text-red-600 dark:text-gray-500 dark:hover:bg-red-900/50 dark:hover:text-red-400"
                        aria-label="Excluir agendamento"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </Modal>
      </main>
    </div>
  );
}

export default App;