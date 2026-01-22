"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAppContext } from "@/contexts/app-provider";
import { useToast } from "@/hooks/use-toast";
import type { Hall } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { PlusCircle, Edit, Trash2, Upload, Image as ImageIcon } from "lucide-react";

const hallSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres."),
  capacity: z.coerce.number().min(1, "La capacidad debe ser de al menos 1."),
  features: z.string().min(1, "Introduce al menos una característica, separada por comas."),
  photoUrl: z.string().min(1, "Se requiere una imagen para el salón."),
});

function HallForm({ hall, onFinished }: { hall?: Hall, onFinished: () => void }) {
  const { dispatch } = useAppContext();
  const { toast } = useToast();
  const [imagePreview, setImagePreview] = useState<string | null>(hall?.photoUrl || null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof hallSchema>>({
    resolver: zodResolver(hallSchema),
    defaultValues: {
      name: hall?.name || "",
      capacity: hall?.capacity || 0,
      features: hall?.features.join(', ') || "",
      photoUrl: hall?.photoUrl || "",
    },
  });

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setImagePreview(dataUrl);
        form.setValue('photoUrl', dataUrl, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    }
  };

  function onSubmit(values: z.infer<typeof hallSchema>) {
    const hallData = {
        ...values,
        features: values.features.split(',').map(f => f.trim()).filter(f => f),
    };

    if (hall) {
      dispatch({ type: 'UPDATE_HALL', payload: { ...hall, ...hallData } });
      toast({ title: "Salón Actualizado", description: `${hall.name} ha sido actualizado exitosamente.` });
    } else {
      dispatch({ type: 'CREATE_HALL', payload: hallData });
      toast({ title: "Salón Creado", description: `${values.name} ha sido añadido.` });
    }
    onFinished();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem><FormLabel>Nombre del Salón</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="capacity" render={({ field }) => (
          <FormItem><FormLabel>Capacidad</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="features" render={({ field }) => (
          <FormItem><FormLabel>Características (separadas por comas)</FormLabel><FormControl><Input placeholder="Proyector, Sistema de sonido" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        
        <FormItem>
            <FormLabel>Imagen del Salón</FormLabel>
            <div className="flex items-center gap-4 mt-2">
                <div className="relative w-24 h-24 shrink-0 border rounded-md flex items-center justify-center bg-muted">
                {imagePreview ? (
                    <Image src={imagePreview} alt="Vista previa" fill className="rounded-md object-cover" />
                ) : (
                    <ImageIcon className="h-10 w-10 text-muted-foreground" />
                )}
                </div>
                <div className="flex flex-col gap-2">
                <FormControl>
                    <Input 
                        type="file" 
                        className="hidden" 
                        ref={fileInputRef} 
                        onChange={handlePhotoChange} 
                        accept="image/png, image/jpeg, image/webp"
                    />
                </FormControl>
                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="mr-2 h-4 w-4" />
                    {imagePreview ? 'Cambiar' : 'Subir'}
                </Button>
                <FormMessage>{form.formState.errors.photoUrl?.message}</FormMessage>
                </div>
            </div>
        </FormItem>

        <DialogFooter>
          <Button type="submit">{hall ? "Guardar Cambios" : "Crear Salón"}</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}


export default function HallManagement() {
  const { state, dispatch } = useAppContext();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingHall, setEditingHall] = useState<Hall | undefined>(undefined);
  const { toast } = useToast();

  const handleEdit = (hall: Hall) => {
    setEditingHall(hall);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setEditingHall(undefined);
    setIsFormOpen(true);
  };
  
  const handleDelete = (hallId: string, hallName: string) => {
    dispatch({ type: 'DELETE_HALL', payload: hallId });
    toast({ title: "Salón Eliminado", description: `${hallName} y sus reservas han sido eliminados.` });
  };

  const closeForm = () => setIsFormOpen(false);

  return (
    <Card className="rounded-2xl shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle className="text-3xl font-headline font-bold">Gestión de Salones</CardTitle>
            <CardDescription>Crea, edita o elimina salones parroquiales.</CardDescription>
        </div>
        <Button onClick={handleCreate}><PlusCircle className="mr-2 h-4 w-4" />Crear Salón</Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Capacidad</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {state.halls.map(hall => (
              <TableRow key={hall.id}>
                <TableCell className="font-medium">{hall.name}</TableCell>
                <TableCell>{hall.capacity}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="icon" onClick={() => handleEdit(hall)}><Edit className="h-4 w-4" /></Button>
                   <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Esto eliminará permanentemente "{hall.name}" y todas sus reservas asociadas. Esta acción no se puede deshacer.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(hall.id, hall.name)}>Eliminar</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-headline text-2xl">{editingHall ? 'Editar Salón' : 'Crear Nuevo Salón'}</DialogTitle>
            </DialogHeader>
            <HallForm hall={editingHall} onFinished={closeForm} />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
