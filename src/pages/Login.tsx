import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Lock, Mail, Loader2, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase/client";

export default function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("ebabado@sistema.com");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        const targetEmail = "ebabado@sistema.com";
        if (email !== targetEmail) { setError("Acesso restrito. Use o email correto."); setLoading(false); return; }

        try {
            const { error: signInError } = await supabase.auth.signInWithPassword({ email: targetEmail, password });
            if (!signInError) { navigate("/dashboard"); return; }

            const { error: signUpError } = await supabase.auth.signUp({ email: targetEmail, password });
            if (signUpError) throw signInError;

            const { data: sessionData } = await supabase.auth.getSession();
            if (sessionData.session) { navigate("/dashboard"); }
            else { setError("Conta criada. Verifique se o login funciona agora."); }
        } catch (err: any) {
            setError(err.message?.includes("Invalid login credentials") ? "Senha incorreta." : err.message || "Erro ao fazer login.");
        } finally { setLoading(false); }
    };

    return (
        <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Bloquinho é babado</CardTitle>
                    <CardDescription className="text-center">Sistema de Gestão de Eventos e PDV</CardDescription>
                </CardHeader>
                <CardContent>
                    {error && (
                        <div className="mb-4 p-3 rounded-md bg-destructive/15 text-destructive text-sm flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />{error}
                        </div>
                    )}
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input id="email" type="email" className="pl-10" value={email} onChange={(e) => setEmail(e.target.value)} required readOnly />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Senha</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input id="password" type="password" className="pl-10" value={password} onChange={(e) => setPassword(e.target.value)} required />
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
