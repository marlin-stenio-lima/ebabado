
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lock, Mail, Loader2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
    const router = useRouter();
    const supabase = createClient();

    const [email, setEmail] = useState("ebabado@sistema.com"); // Pre-fill or force this
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Force the email to be the one requested
        const targetEmail = "ebabado@sistema.com";
        if (email !== targetEmail) {
            setError("Acesso restrito. Use o email correto.");
            setLoading(false);
            return;
        }

        try {
            // 1. Tentar Login
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: targetEmail,
                password,
            });

            if (!signInError) {
                router.push("/dashboard");
                router.refresh();
                return;
            }

            // 2. Se falhar, tentar Criar a Conta (Auto-register na primeira vez)
            // Isso garante que a conta exista com a senha fornecida pelo usuário
            console.log("Login falhou, tentando criar conta...", signInError.message);

            const { error: signUpError } = await supabase.auth.signUp({
                email: targetEmail,
                password,
            });

            if (signUpError) {
                // Se der erro ao criar (ex: senha fraca, ou user já existe mas senha errada no login), lança erro
                throw signInError; // Joga o erro original de login (Provavelmente "Invalid login credentials")
            }

            // Se criou com sucesso (ou se o Supabase não exigiu confirmação)
            // Tenta logar de novo ou verifica sessão
            const { data: sessionData } = await supabase.auth.getSession();
            if (sessionData.session) {
                router.push("/dashboard");
                router.refresh();
            } else {
                setError("Conta criada. Verifique se o login funciona agora.");
            }

        } catch (err: any) {
            // Mensagem amigável
            if (err.message.includes("Invalid login credentials")) {
                setError("Senha incorreta.");
            } else {
                setError(err.message || "Erro ao fazer login.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Bloquinho ebabado</CardTitle>
                    <CardDescription className="text-center">
                        Sistema de Gestão de Eventos e PDV
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {error && (
                        <div className="mb-4 p-3 rounded-md bg-destructive/15 text-destructive text-sm flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    className="pl-10"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    readOnly // Opcional: Impedir editar se for fixo
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Senha</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type="password"
                                    className="pl-10"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Acessar Sistema"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
