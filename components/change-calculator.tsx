
"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RefreshCcw, DollarSign, ArrowLeft, CheckCircle2 } from "lucide-react";

interface ChangeCalculatorProps {
    fixedTotal?: number;
    onFinish?: () => void;
    onBack?: () => void;
}

export function ChangeCalculator({ fixedTotal, onFinish, onBack }: ChangeCalculatorProps) {
    const [total, setTotal] = useState<number>(fixedTotal || 0);
    const [received, setReceived] = useState<number>(0);
    const [change, setChange] = useState<number | null>(null);

    useEffect(() => {
        if (fixedTotal) {
            setTotal(fixedTotal);
        }
    }, [fixedTotal]);

    useEffect(() => {
        if (received >= total && total > 0) {
            setChange(received - total);
        } else {
            setChange(null);
        }
    }, [total, received]);

    const handleTotalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTotal(Number(e.target.value));
    };

    const handleReceivedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setReceived(Number(e.target.value));
    };

    const reset = () => {
        setTotal(0);
        setReceived(0);
        setChange(null);
    };

    return (
        <Card className="w-full max-w-sm mx-auto shadow-none border-0">
            <CardHeader className="flex flex-row items-center justify-between px-0 pt-0">
                <CardTitle className="flex items-center gap-2 text-xl font-bold">
                    <DollarSign className="w-5 h-5" /> Dinheiro / Troco
                </CardTitle>
                {onBack && (
                    <Button variant="ghost" size="sm" onClick={onBack}>
                        <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
                    </Button>
                )}
            </CardHeader>
            <CardContent className="space-y-4 px-0">
                <div className="space-y-2">
                    <Label htmlFor="total">Valor Total (R$)</Label>
                    <Input
                        id="total"
                        type="number"
                        placeholder="0.00"
                        value={total || ""}
                        onChange={handleTotalChange}
                        className="text-lg font-mono bg-muted/50"
                        step="0.01"
                        readOnly={!!fixedTotal}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="received">Valor Recebido (R$)</Label>
                    <Input
                        id="received"
                        type="number"
                        placeholder="0.00"
                        value={received || ""}
                        onChange={handleReceivedChange}
                        className="text-lg font-mono border-primary/50 focus:border-primary"
                        step="0.01"
                        autoFocus
                    />
                </div>

                <div className={`p-4 rounded-lg text-center transition-colors ${change !== null ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-muted/50 text-muted-foreground"
                    }`}>
                    <div className="text-sm font-medium uppercase tracking-wider mb-1">Troco</div>
                    <div className="text-3xl font-bold font-mono">
                        {change !== null ? `R$ ${change.toFixed(2)}` : "---"}
                    </div>
                </div>

                {onFinish ? (
                    <Button onClick={onFinish} className="w-full gap-2 mt-4 h-12 text-lg" disabled={change === null}>
                        <CheckCircle2 className="w-5 h-5" /> Confirmar Pagamento
                    </Button>
                ) : (
                    <Button onClick={reset} variant="outline" className="w-full gap-2">
                        <RefreshCcw className="w-4 h-4" /> Nova Simulação
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}
