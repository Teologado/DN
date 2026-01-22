"use client";

import { useUser } from "@/hooks/use-user";
import { useAppContext } from "@/contexts/app-provider";
import { useToast } from "@/hooks/use-toast";
import type { User, UserRole } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "../ui/button";
import { Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export default function UserManagement() {
  const { user, isLoading: isUserLoading } = useUser();
  const { state, dispatch } = useAppContext();
  const { toast } = useToast();

  const handleRoleChange = (userId: string, role: UserRole) => {
    if (user?.uid === userId) {
        toast({
            variant: "destructive",
            title: "Acción no permitida",
            description: "No puedes cambiar tu propio rol."
        });
        return;
    }
    
    try {
      dispatch({ type: 'ADMIN_UPDATE_USER_ROLE', payload: { userId, role } });
      toast({
        title: "Rol de Usuario Actualizado",
        description: `El rol del usuario ha sido cambiado a ${role === 'ADMIN' ? 'Administrador' : 'Usuario'}.`
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar el rol del usuario: " + error.message,
      });
    }
  };

  const handleDeleteUser = (userToDelete: User) => {
    if (user?.uid === userToDelete.id) {
        toast({
            variant: "destructive",
            title: "Acción no permitida",
            description: "No puedes eliminar tu propia cuenta."
        });
        return;
    }
    try {
      dispatch({ type: 'ADMIN_DELETE_USER', payload: { userId: userToDelete.id } });
      toast({ title: "Usuario Eliminado", description: `El usuario ${userToDelete.name} ha sido eliminado.` });
    } catch(error: any) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo eliminar el usuario: " + error.message });
    }
  }

  return (
    <Card className="rounded-2xl shadow-lg">
      <CardHeader>
        <CardTitle className="text-3xl font-headline font-bold">Gestión de Usuarios</CardTitle>
        <CardDescription>Asigna roles a los usuarios del sistema o elimínalos.</CardDescription>
      </CardHeader>
      <CardContent>
        {isUserLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Correo Electrónico</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {state.users?.map((u: User) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Select
                          value={u.role}
                          onValueChange={(value: UserRole) => handleRoleChange(u.id, value)}
                          disabled={u.id === user?.uid}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Seleccionar rol" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="USER">Usuario</SelectItem>
                            <SelectItem value="ADMIN">Administrador</SelectItem>
                        </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="icon" disabled={u.id === user?.uid}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer. Esto eliminará permanentemente al usuario y todos sus datos asociados.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteUser(u)}>
                            Sí, eliminar usuario
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
