"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/contexts/app-provider';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const loginSchema = z.object({
  email: z.string().email({ message: "Dirección de correo electrónico no válida." }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
});

const registerSchema = z.object({
  name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres." }),
  email: z.string().email({ message: "Dirección de correo electrónico no válida." }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
});

function LoginForm() {
  const { state, dispatch } = useAppContext();
  const { toast } = useToast();
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    const user = state.users.find(u => u.email === values.email);

    if (!user || user.password !== values.password) {
      toast({
        variant: "destructive",
        title: "Error al Iniciar Sesión",
        description: "Correo electrónico o contraseña no válidos.",
      });
    } else {
      dispatch({ type: 'LOGIN', payload: user });
      toast({ title: "Inicio de Sesión Exitoso", description: "¡Bienvenido de nuevo!" });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Correo Electrónico</FormLabel>
              <FormControl><Input placeholder="miembro@parroquia.com" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contraseña</FormLabel>
              <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Iniciando Sesión...' : 'Iniciar Sesión'}
        </Button>
      </form>
    </Form>
  );
}

function RegisterForm({ onRegisterSuccess }: { onRegisterSuccess: () => void }) {
  const { dispatch } = useAppContext();
  const { toast } = useToast();
  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  async function onSubmit(values: z.infer<typeof registerSchema>) {
    try {
      dispatch({ type: 'REGISTER_USER', payload: values });
      toast({ title: "Registro Exitoso", description: "Ahora puedes iniciar sesión con tu nueva cuenta." });
      onRegisterSuccess();
      form.reset();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error en el Registro", description: error.message });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre Completo</FormLabel>
              <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
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
              <FormControl><Input placeholder="miembro@parroquia.com" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contraseña</FormLabel>
              <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Creando cuenta...' : 'Crear Cuenta'}
        </Button>
      </form>
    </Form>
  );
}

export default function Auth() {
  const [activeTab, setActiveTab] = useState("login");
  return (
    <div className="flex items-center justify-center py-12">
      <Card className="w-full max-w-md rounded-2xl shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline">Bienvenido</CardTitle>
          <CardDescription>Inicia sesión o crea una cuenta para continuar</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
              <TabsTrigger value="register">Registrarse</TabsTrigger>
            </TabsList>
            <TabsContent value="login" className="pt-6">
                <LoginForm />
            </TabsContent>
            <TabsContent value="register" className="pt-6">
                <RegisterForm onRegisterSuccess={() => setActiveTab("login")} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
