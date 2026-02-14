export type iconType = "VM" | "LXC" | "Device" | "Network"

export interface DeviceCardProps {
    id: string
    name: string;
    type: iconType;
    status: 'online' | 'offline';
    ipAddress: string;
    service: string;
    port: number;
    domain?: string;
    lastChecked: string;
}