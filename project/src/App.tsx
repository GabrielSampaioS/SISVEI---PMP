import React, { useState, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import { format } from 'date-fns';
import { Modal } from './components/Modal';
import { AppointmentForm } from './components/AppointmentForm';
import type { Appointment, AppointmentFormData } from './types';
import { Calendar, Plus, Trash2, MapPin, Clock, CalendarDays, CalendarClock, Car, HelpCircle } from 'lucide-react';

function App() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [activeView, setActiveView] = useState<'month' | 'week'>('month');

  const handleDateClick = useCallback((arg: { dateStr: string }) => {
    setSelectedDate(arg.dateStr);
    setIsModalOpen(true);
  }, []);

  const handleAddAppointment = useCallback(() => {
    setIsFormOpen(true);
  }, []);

  const handleFormSubmit = useCallback((data: AppointmentFormData) => {
    if (!selectedDate) return;

    const newAppointment: Appointment = {
      id: crypto.randomUUID(),
      date: selectedDate,
      startTime: data.startTime,
      endTime: data.endTime,
      startAddress: data.startAddress,
      endAddress: data.endAddress,
      vehicle: data.vehicle,
      driver: data.driver,
      passengers: data.passengers.split('\n').filter(Boolean),
    };

    setAppointments(prev => [...prev, newAppointment]);
    setIsFormOpen(false);
  }, [selectedDate]);

  const handleDeleteAppointment = useCallback((id: string) => {
    if (confirm('Tem certeza que deseja excluir este agendamento?')) {
      setAppointments(prev => prev.filter(app => app.id !== id));
    }
  }, []);

  const selectedDateAppointments = selectedDate
    ? appointments.filter(app => app.date === selectedDate)
    : [];

  const handleViewChange = (view: 'month' | 'week') => {
    setActiveView(view);
  };

  const handleNewAppointment = () => {
    setSelectedDate(format(new Date(), 'yyyy-MM-dd'));
    setIsModalOpen(true);
    setIsFormOpen(true);
  };

  const handleHelp = () => {
    alert('Ajuda do Sistema:\n\n1. Clique em uma data para ver os agendamentos\n2. Use o botão "+" para adicionar um novo agendamento\n3. Alterne entre visualização mensal e semanal usando os ícones na barra superior');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <header className="sticky top-0 z-10 bg-[#2E7D32] p-4 shadow-lg">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
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
            <div className="flex items-center space-x-4">
              <nav className="flex items-center space-x-2">
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
                  <span>Mensal</span>
                </button>
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
                  <span>Semanal</span>
                </button>
                <button
                  onClick={handleNewAppointment}
                  className="flex items-center space-x-1 rounded-lg px-3 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/10"
                  title="Novo Agendamento"
                >
                  <Car className="h-5 w-5" />
                  <span>Novo</span>
                </button>
                <button
                  onClick={handleHelp}
                  className="flex items-center space-x-1 rounded-lg px-3 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/10"
                  title="Ajuda"
                >
                  <HelpCircle className="h-5 w-5" />
                  <span>Ajuda</span>
                </button>
              </nav>
              <p className="text-sm font-medium text-white/80">
                Prefeitura Municipal de Piracicaba
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4">
        <div className="calendar-card overflow-hidden rounded-xl bg-white p-6 shadow-lg">
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView={activeView === 'month' ? 'dayGridMonth' : 'dayGridWeek'}
            locale={ptBrLocale}
            dateClick={handleDateClick}
            events={appointments.map(app => ({
              title: `${app.startTime} - ${app.vehicle}`,
              date: app.date,
            }))}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: '',
            }}
          />
        </div>

        <Modal isOpen={isModalOpen} onClose={() => {
          setIsModalOpen(false);
          setIsFormOpen(false);
        }}>
          {isFormOpen ? (
            <AppointmentForm
              onSubmit={handleFormSubmit}
              onCancel={() => setIsFormOpen(false)}
            />
          ) : (
            <div>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  Agendamentos
                  <span className="ml-2 text-lg font-normal text-gray-500">
                    {selectedDate && format(new Date(selectedDate), 'dd/MM/yyyy')}
                  </span>
                </h2>
                <button onClick={handleAddAppointment} className="btn-primary">
                  <Plus className="mr-2" size={16} />
                  Adicionar Agendamento
                </button>
              </div>

              {selectedDateAppointments.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 py-12">
                  <Calendar className="mb-3 h-12 w-12 text-gray-400" />
                  <p className="text-center text-gray-500">
                    Nenhum agendamento para esta data.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedDateAppointments.map(appointment => (
                    <div
                      key={appointment.id}
                      className="appointment-card flex items-start justify-between rounded-lg border border-gray-200 p-4"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <p className="font-medium text-gray-900">
                            {appointment.startTime} - {appointment.endTime}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <p className="text-sm text-gray-600">
                            {appointment.startAddress}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-900">
                            {appointment.vehicle}
                          </p>
                          <p className="text-sm text-gray-600">
                            Motorista: {appointment.driver}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteAppointment(appointment.id)}
                        className="rounded-full p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                        aria-label="Excluir agendamento"
                      >
                        <Trash2 size={18} />
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