"use client"
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardFooter, CardHeader} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Select} from "@/components/ui/select";
import {X} from "lucide-react";
import {useState} from "react";
import {iconType} from "@/interfaces";

interface DeviceFormData {
    name: string;
    ipAddress: string;
    type: iconType;
    service: string;
    port: string;
    domain: string;
}

export function AddOverlay({visible, close}: { visible: boolean, close: () => void }) {
    const [formData, setFormData] = useState<DeviceFormData>({
        name: '',
        ipAddress: '',
        type: 'Device',
        service: '',
        port: '',
        domain: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const {name, value} = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const suggestIP = () => {
        // Simple IP suggestion - can be customized based on your network
        setFormData(prev => ({
            ...prev,
            ipAddress: '192.168.1.'
        }));
    };

    const handleSubmit = async () => {
        // Validate required fields
        if (!formData.name || !formData.ipAddress || !formData.type) {
            setError('Please fill in all required fields');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch('http://localhost:8080/devices', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    ipAddress: formData.ipAddress,
                    type: formData.type,
                    service: formData.service || 'Unknown',
                    port: formData.port ? parseInt(formData.port) : 0,
                    domain: formData.domain || undefined,
                    status: 'offline', // Default to offline, backend can check actual status
                    lastChecked: new Date().toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                    })
                }),
            });

            if (!response.ok) {
                console.log(new Error('Failed to add device'))
            }

            const result = await response.json();
            console.log('Device added successfully:', result);

            // Reset form and close overlay
            setFormData({
                name: '',
                ipAddress: '',
                type: 'Device',
                service: '',
                port: '',
                domain: ''
            });
            close();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add device');
            console.error('Error adding device:', err);
        } finally {
            setIsSubmitting(false);
        }
        close()
    };

    const handleCancel = () => {
        // Reset form and close
        setFormData({
            name: '',
            ipAddress: '',
            type: 'Device',
            service: '',
            port: '',
            domain: ''
        });
        setError(null);
        close();
    };

    return (
        <div
            className={visible ? "flex fixed inset-0 items-center justify-center w-full h-full bg-black/50 z-50" : "hidden"}>
            <Card className={"w-full max-w-lg h-fit p-2"}>
                <CardHeader className={"flex flex-row items-center justify-between border-b-2 pb-2"}>
                    <h3>Add New Device</h3>
                    <X onClick={handleCancel} className={"cursor-pointer hover:text-destructive"}/>
                </CardHeader>
                <CardContent className={"py-6"}>
                    <div className={"flex flex-col gap-4"}>
                        {error && (
                            <div className="text-destructive text-sm bg-destructive/10 p-3 rounded-md">
                                {error}
                            </div>
                        )}

                        <div className={"flex flex-col gap-2"}>
                            <Label htmlFor="name">Name *</Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder="e.g., ubuntu-server"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className={"flex flex-col gap-2"}>
                            <div className="flex justify-between items-center">
                                <Label htmlFor="ipAddress">IP Address *</Label>
                                <button
                                    type="button"
                                    onClick={suggestIP}
                                    className="text-xs text-primary hover:underline"
                                >
                                    Suggest
                                </button>
                            </div>
                            <Input
                                id="ipAddress"
                                name="ipAddress"
                                placeholder="192.168.1.10"
                                value={formData.ipAddress}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className={"flex flex-col gap-2"}>
                            <Label htmlFor="type">Type *</Label>
                            <Select
                                id="type"
                                name="type"
                                value={formData.type}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="VM">VM</option>
                                <option value="LXC">LXC</option>
                                <option value="Device">Device</option>
                                <option value="Network">Network</option>
                            </Select>
                        </div>

                        <div className="border-t pt-4">
                            <h4 className="text-sm font-medium mb-4">Service Details (Optional)</h4>

                            <div className={"flex flex-col gap-4"}>
                                <div className={"flex flex-col gap-2"}>
                                    <Label htmlFor="service">Running Service</Label>
                                    <Input
                                        id="service"
                                        name="service"
                                        placeholder="e.g., Plex, Docker, Nginx"
                                        value={formData.service}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className={"flex flex-col gap-2"}>
                                    <Label htmlFor="port">Service Port</Label>
                                    <Input
                                        id="port"
                                        name="port"
                                        type="number"
                                        placeholder="e.g., 8080, 443"
                                        value={formData.port}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className={"flex flex-col gap-2"}>
                                    <Label htmlFor="domain">Service Domain</Label>
                                    <Input
                                        id="domain"
                                        name="domain"
                                        placeholder="e.g., homelab.local"
                                        value={formData.domain}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter id={"buttons"} className={"gap-4 border-t pt-6"}>
                    <Button
                        className={"w-1/2"}
                        variant="outline"
                        onClick={handleCancel}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        className={"w-1/2"}
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Adding...' : 'Add Device'}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}