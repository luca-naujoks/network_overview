import {Card} from "@/components/ui/card";

export function StatCard({label, value}: { label: string, value: number | string }) {
    return (
        <Card className={"w-full p-4"}>
            <h1 className={"text-xs text-secondary-foreground"}>{label}</h1>
            <span className={"text-4xl font-bold text-primary"}>{value}</span>
        </Card>
    )
}