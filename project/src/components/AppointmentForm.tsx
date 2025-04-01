import React from 'react';
import { useForm } from 'react-hook-form';
import type { AppointmentFormData } from '../types';
import { Clock, MapPin, Car, User, Users } from 'lucide-react';

interface AppointmentFormProps {
  onSubmit: (data: AppointmentFormData) => void;
  onCancel: () => void;
  initialData?: Partial<AppointmentFormData>;
}

export function AppointmentForm({ onSubmit, onCancel, initialData }: AppointmentFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<AppointmentFormData>({
    defaultValues: initialData
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-bold text-gray-900">
          {initialData ? 'Editar Agendamento' : 'Novo Agendamento'}
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="startTime" className="flex items-center text-sm font-medium text-gray-700">
              <Clock className="mr-2 h-4 w-4" />
              Horário de Saída
            </label>
            <input
              type="time"
              id="startTime"
              {...register('startTime', { required: true })}
              className="input-field mt-1"
            />
            {errors.startTime && (
              <p className="mt-1 text-sm text-red-600">Horário de saída é obrigatório</p>
            )}
          </div>

          <div>
            <label htmlFor="endTime" className="flex items-center text-sm font-medium text-gray-700">
              <Clock className="mr-2 h-4 w-4" />
              Horário de Retorno
            </label>
            <input
              type="time"
              id="endTime"
              {...register('endTime', { required: true })}
              className="input-field mt-1"
            />
            {errors.endTime && (
              <p className="mt-1 text-sm text-red-600">Horário de retorno é obrigatório</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="startAddress" className="flex items-center text-sm font-medium text-gray-700">
              <MapPin className="mr-2 h-4 w-4" />
              Endereço de Saída
            </label>
            <input
              type="text"
              id="startAddress"
              {...register('startAddress', { required: true })}
              className="input-field mt-1"
              placeholder="Digite o endereço de saída"
            />
            {errors.startAddress && (
              <p className="mt-1 text-sm text-red-600">Endereço de saída é obrigatório</p>
            )}
          </div>

          <div>
            <label htmlFor="endAddress" className="flex items-center text-sm font-medium text-gray-700">
              <MapPin className="mr-2 h-4 w-4" />
              Endereço de Retorno
            </label>
            <input
              type="text"
              id="endAddress"
              {...register('endAddress', { required: true })}
              className="input-field mt-1"
              placeholder="Digite o endereço de retorno"
            />
            {errors.endAddress && (
              <p className="mt-1 text-sm text-red-600">Endereço de retorno é obrigatório</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label htmlFor="vehicle" className="flex items-center text-sm font-medium text-gray-700">
            <Car className="mr-2 h-4 w-4" />
            Veículo
          </label>
          <input
            type="text"
            id="vehicle"
            {...register('vehicle', { required: true })}
            className="input-field mt-1"
            placeholder="Digite o veículo"
          />
          {errors.vehicle && (
            <p className="mt-1 text-sm text-red-600">Veículo é obrigatório</p>
          )}
        </div>

        <div>
          <label htmlFor="driver" className="flex items-center text-sm font-medium text-gray-700">
            <User className="mr-2 h-4 w-4" />
            Motorista
          </label>
          <input
            type="text"
            id="driver"
            {...register('driver', { required: true })}
            className="input-field mt-1"
            placeholder="Digite o nome do motorista"
          />
          {errors.driver && (
            <p className="mt-1 text-sm text-red-600">Motorista é obrigatório</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="passengers" className="flex items-center text-sm font-medium text-gray-700">
          <Users className="mr-2 h-4 w-4" />
          Passageiros
        </label>
        <textarea
          id="passengers"
          {...register('passengers', { required: true })}
          className="input-field mt-1"
          rows={3}
          placeholder="Digite o nome dos passageiros (um por linha)"
        />
        {errors.passengers && (
          <p className="mt-1 text-sm text-red-600">Lista de passageiros é obrigatória</p>
        )}
      </div>

      <div className="flex justify-end space-x-3 border-t border-gray-200 pt-6">
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="btn-primary"
        >
          Salvar
        </button>
      </div>
    </form>
  );
}