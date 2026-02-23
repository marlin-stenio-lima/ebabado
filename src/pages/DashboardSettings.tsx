import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Save } from "lucide-react";
import { configService } from "@/lib/services/config-service";

export default function DashboardSettings() {
    const [config, setConfig] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => { loadConfig(); }, []);

    async function loadConfig() {
        try { const data = await configService.getConfig(); if (data) setConfig(data); }
        catch (error) { console.error("Erro ao carregar configurações:", error); }
        finally { setLoading(false); }
    }

    async function handleSaveConfig(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        try {
            if (config?.id) {
                await configService.updateConfig(config.id, { location: config.location, attractions: config.attractions, rules: config.rules, whatsapp_link: config.whatsapp_link, hero_title: config.hero_title, hero_description: config.hero_description, event_date: config.event_date });
                alert('Configurações salvas com sucesso!');
            }
        } catch (error) { console.error('Erro ao salvar:', error); alert('Erro ao salvar configurações.'); }
        finally { setSaving(false); }
    }

    if (loading) return <div className="flex h-full items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2"><h2 className="text-3xl font-bold tracking-tight">Configurações</h2></div>
            <form onSubmit={handleSaveConfig} className="space-y-4">
                <Tabs defaultValue="general" className="space-y-4">
                    <TabsList><TabsTrigger value="general">Geral</TabsTrigger><TabsTrigger value="content">Conteúdo</TabsTrigger><TabsTrigger value="contact">Contato e Local</TabsTrigger></TabsList>

                    <TabsContent value="general" className="space-y-4">
                        <Card>
                            <CardHeader><CardTitle>Informações Principais</CardTitle><CardDescription>Configure os textos principais da página inicial.</CardDescription></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-1"><Label htmlFor="hero_title">Título Principal (Hero)</Label><Input id="hero_title" placeholder="Ex: Vem pro Bloquinho" value={config?.hero_title || ''} onChange={(e) => setConfig({ ...config, hero_title: e.target.value })} /></div>
                                <div className="space-y-1"><Label htmlFor="hero_description">Descrição Principal</Label><Textarea id="hero_description" placeholder="Ex: Prepare sua fantasia..." value={config?.hero_description || ''} onChange={(e) => setConfig({ ...config, hero_description: e.target.value })} /></div>
                                <div className="space-y-1"><Label htmlFor="event_date">Data do Evento</Label><Input id="event_date" type="datetime-local" value={config?.event_date ? new Date(config.event_date).toISOString().slice(0, 16) : ''} onChange={(e) => setConfig({ ...config, event_date: e.target.value })} /></div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="content" className="space-y-4">
                        <Card>
                            <CardHeader><CardTitle>Atrações e Regras</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-1"><Label htmlFor="attractions">Atrações</Label><Textarea id="attractions" rows={4} value={config?.attractions || ''} onChange={(e) => setConfig({ ...config, attractions: e.target.value })} /></div>
                                <div className="space-y-1"><Label htmlFor="rules">Regras e Informações</Label><Textarea id="rules" rows={4} value={config?.rules || ''} onChange={(e) => setConfig({ ...config, rules: e.target.value })} /></div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="contact" className="space-y-4">
                        <Card>
                            <CardHeader><CardTitle>Contato e Localização</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-1"><Label htmlFor="whatsapp_link">Link do WhatsApp</Label><Input id="whatsapp_link" placeholder="https://wa.me/..." value={config?.whatsapp_link || ''} onChange={(e) => setConfig({ ...config, whatsapp_link: e.target.value })} /></div>
                                <div className="space-y-1"><Label htmlFor="location">Local do Evento</Label><Input id="location" value={config?.location || ''} onChange={(e) => setConfig({ ...config, location: e.target.value })} /></div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                <div className="flex justify-end">
                    <Button type="submit" disabled={saving} className="w-full md:w-auto">
                        {saving ? <Loader2 className="mr-2 w-4 h-4 animate-spin" /> : <Save className="mr-2 w-4 h-4" />}
                        {saving ? 'Salvando...' : 'Salvar Alterações'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
