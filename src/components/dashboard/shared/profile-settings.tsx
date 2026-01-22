"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useUser } from "@/hooks/use-user";
import { useAppContext } from "@/contexts/app-provider";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

const profileSchema = z.object({
  name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres." }),
  email: z.string().email(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Por favor, introduce tu contraseña actual."),
  newPassword: z.string().min(6, "La nueva contraseña debe tener al menos 6 caracteres."),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Las contraseñas no coinciden.",
  path: ["confirmPassword"],
});

function UpdateProfileForm() {
    const { user, profile, isLoading } = useUser();
    const { dispatch } = useAppContext();
    const { toast } = useToast();

    const form = useForm<z.infer<typeof profileSchema>>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: "",
            email: "",
        },
    });

    useEffect(() => {
        if (profile && user) {
            form.reset({
                name: profile.name || "",
                email: user.email || "",
            });
        }
    }, [profile, user, form]);

    async function onSubmit(values: z.infer<typeof profileSchema>) {
        if (!user) return;
        try {
            dispatch({ type: 'UPDATE_PROFILE', payload: { userId: user.uid, name: values.name } });
            toast({ title: "Perfil Actualizado", description: "Tu información ha sido actualizada." });
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error", description: error.message });
        }
    }

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-64 mt-2" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <Skeleton className="h-10 w-32" />
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Información del Perfil</CardTitle>
                <CardDescription>Actualiza tu nombre.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre Completo</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Correo Electrónico</FormLabel>
                                    <FormControl><Input {...field} disabled /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={form.formState.isSubmitting}>Guardar Cambios</Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}

function ChangePasswordForm() {
    const { user } = useUser();
    const { dispatch } = useAppContext();
    const { toast } = useToast();
    const form = useForm<z.infer<typeof passwordSchema>>({
        resolver: zodResolver(passwordSchema),
        defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
    });

    async function onSubmit(values: z.infer<typeof passwordSchema>) {
        if (!user) {
            toast({ variant: "destructive", title: "Error", description: "Usuario no encontrado." });
            return;
        }

        try {
            dispatch({
                type: 'CHANGE_PASSWORD',
                payload: {
                    userId: user.uid,
                    currentPassword: values.currentPassword,
                    newPassword: values.newPassword,
                }
            });
            toast({ title: "Contraseña Actualizada", description: "Tu contraseña ha sido cambiada exitosamente." });
            form.reset();
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error", description: error.message });
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Cambiar Contraseña</CardTitle>
                <CardDescription>Elige una contraseña nueva y segura.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="currentPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Contraseña Actual</FormLabel>
                                    <FormControl><Input type="password" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="newPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nueva Contraseña</FormLabel>
                                    <FormControl><Input type="password" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirmar Nueva Contraseña</FormLabel>
                                    <FormControl><Input type="password" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={form.formState.isSubmitting}>Cambiar Contraseña</Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}

export default function ProfileSettings() {
    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <UpdateProfileForm />
            <ChangePasswordForm />
        </div>
    );
}
