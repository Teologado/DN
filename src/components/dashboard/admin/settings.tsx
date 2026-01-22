"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAppContext } from "@/contexts/app-provider";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import * as LucideIcons from "lucide-react";

const settingsSchema = z.object({
  appName: z.string().min(3, "El nombre de la aplicación debe tener al menos 3 caracteres."),
  appLogo: z.string().min(1, "Por favor, selecciona un logo."),
  maxBookingDuration: z.coerce.number().min(1, "La duración debe ser de al menos 1 hora.").max(12, "La duración no puede exceder las 12 horas."),
  bookingNoticeDays: z.coerce.number().min(0, "Los días de antelación no pueden ser negativos."),
  bookingWindowDays: z.coerce.number().min(1, "La ventana de reserva debe ser de al menos 1 día.").max(365, "La ventana no puede exceder 365 días."),
  maxPendingBookings: z.coerce.number().min(1, "El límite debe ser de al menos 1.").max(10, "El límite no puede ser mayor a 10."),
});

const availableIcons = ["Church", "Home", "Building", "Landmark", "School", "Briefcase", "Heart", "Users", "BookOpen", "Star", "Feather", "Anchor"];

export default function AppSettings() {
  const { state, dispatch } = useAppContext();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: state.settings,
  });

  function onSubmit(values: z.infer<typeof settingsSchema>) {
    dispatch({ type: 'UPDATE_SETTINGS', payload: values });
    toast({ title: "Configuración Actualizada", description: "Tus cambios han sido guardados." });
  }
  
  const renderIcon = (name: string) => {
    const IconComponent = (LucideIcons as any)[name];
    return IconComponent ? <IconComponent className="mr-2 h-4 w-4" /> : null;
  }

  return (
    <Card className="max-w-2xl mx-auto rounded-2xl shadow-lg">
      <CardHeader>
        <CardTitle className="text-3xl font-headline font-bold">Configuración de la Aplicación</CardTitle>
        <CardDescription>Personaliza el nombre, el logo y las reglas de reserva de la aplicación.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="appName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de la Aplicación</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="appLogo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logo de la Aplicación</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <div className="flex items-center">
                            {renderIcon(field.value || state.settings.appLogo)}
                            <SelectValue placeholder="Selecciona un logo" />
                        </div>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableIcons.map(iconName => (
                        <SelectItem key={iconName} value={iconName}>
                           <div className="flex items-center">
                                {renderIcon(iconName)}
                                <span>{iconName}</span>
                           </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="maxPendingBookings"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Máximo de Reservas Pendientes por Usuario</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un límite" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Array.from({ length: 10 }, (_, i) => i + 1).map(h => (
                        <SelectItem key={h} value={String(h)}>{h} reserva{h > 1 ? 's' : ''}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>El número máximo de reservas con estado "Pendiente" que un usuario puede tener a la vez.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="maxBookingDuration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duración Máxima de Reserva (horas)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una duración máxima" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(h => (
                        <SelectItem key={h} value={String(h)}>{h} hora{h > 1 ? 's' : ''}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>La duración máxima que un usuario puede reservar un salón.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bookingNoticeDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Antelación Mínima para Reservar (días)</FormLabel>
                  <FormControl><Input type="number" min="0" {...field} /></FormControl>
                  <FormDescription>Días de antelación requeridos para hacer una reserva (0 para el mismo día).</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bookingWindowDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ventana de Reserva (días)</FormLabel>
                  <FormControl><Input type="number" min="1" max="365" {...field} /></FormControl>
                  <FormDescription>Número máximo de días en el futuro que un usuario puede reservar (ej. 90 días).</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Guardar Cambios</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
