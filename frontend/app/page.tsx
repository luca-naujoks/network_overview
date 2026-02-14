"use client"
import {useTheme} from "next-themes";
import {ReactNode, useEffect, useState} from "react";
import {Grid, List, RefreshCw} from "lucide-react";
import {Button} from "@/components/ui/button";
import {DeviceCard} from "@/components/custom/device-card";
import {DeviceRow} from "@/components/custom/device-row";
import {DeviceCardProps} from "@/interfaces";
import {ThemeToggle} from "@/components/custom/theme-toggle";
import {AddOverlay} from "@/components/custom/add-overlay";
import {ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger} from "@/components/ui/context-menu";
import {StatCard} from "@/components/custom/stat-card";

export default function Home() {
    const {theme, setTheme} = useTheme()
    const [mounted, setMounted] = useState(false)
    const [devices, setDevices] = useState<DeviceCardProps[]>([])

    const [viewSwitch, setViewSwitch] = useState<string>("grid")
    const [addOverlayVIsible, setAddOverlayVisible] = useState<boolean>(false)

    function themeSwitch() {
        switch (theme) {
            case "light":
                setTheme('dark')
                break
            case "dark":
                setTheme('light')
                break
            default:
                return
        }
    }

    function toggleAddOverlay() {
        setAddOverlayVisible(!addOverlayVIsible)
        fetchDevices().then()
    }

    async function fetchDevices(): Promise<void> {
        const response = await fetch("http://localhost:8080/devices", {
            method: "GET"
        })
        const data: DeviceCardProps[] = await response.json()
        setDevices(data)
    }

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true)
        fetchDevices().then()

    }, [])

    useEffect(() => {
        console.log(devices)
    }, [devices])

    if (!mounted) {
        return null
    }

    return (
        <div className="w-full p-4">
            <AddOverlay visible={addOverlayVIsible} close={toggleAddOverlay}/>
            <div id={"heading"} className={"flex justify-between mt-8"}>
                <h1 className={"text-4xl"}>Network Overview</h1>
                <ThemeToggle theme={theme} themeSwitch={themeSwitch}/>
            </div>
            <span className={"text-primary"}>Monitor and manage your network devices</span>
            <main className="mt-4">
                <div id={"statCards"} className={"flex justify-between gap-4 hidden"}>
                    <StatCard label={"Total Devices"} value={5}/>
                    <StatCard label={"Online Devices"} value={5}/>
                    <StatCard label={"Offline Devices"} value={5}/>
                </div>
                <div id={"controls"} className={"flex justify-between my-4"}>
                    <span className={"flex gap-4"}>
                        <Button variant={viewSwitch == "grid" ? "default" : "outline"}
                                onClick={() => setViewSwitch("grid")} className={"cursor-pointer"}><Grid/></Button>
                        <Button variant={viewSwitch == "list" ? "default" : "outline"}
                                onClick={() => setViewSwitch("list")} className={"cursor-pointer"}><List/></Button>
                    </span>
                    <span className={"flex gap-4"}>
                        <Button variant={"outline"}
                                onClick={() => fetchDevices().then()}
                                className={"cursor-pointer"}><RefreshCw/>Refresh</Button>
                        <Button onClick={() => toggleAddOverlay()} className={"cursor-pointer"}>+ Add Device</Button>
                    </span>
                </div>
                {viewSwitch == "grid" ?
                    <div id={"grid_view"}
                         className={"grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"}>
                        {devices?.map((device: DeviceCardProps) =>
                            <ContextMenuWrapper id={device.id} key={device.id} fetchDevices={fetchDevices}>
                                <DeviceCard props={device}/>
                            </ContextMenuWrapper>
                        )}
                    </div> :
                    <div id={"list_view"} className={"flex flex-col gap-4"}>
                        {devices?.map((device: DeviceCardProps) =>
                            <ContextMenuWrapper id={device.id} key={device.id} fetchDevices={fetchDevices}>
                                <DeviceRow props={device}/>
                            </ContextMenuWrapper>
                        )}
                    </div>
                }
            </main>
        </div>
    );
}

function ContextMenuWrapper({children, id, fetchDevices}: {
    children: ReactNode,
    id: string,
    fetchDevices: () => void
}) {
    function deleteDevice(id: string) {
        fetch(`http://localhost:8080/device?id=${id}`, {method: "DELETE"}).then(() => fetchDevices())
    }

    return (
        <ContextMenu>
            <ContextMenuTrigger>{children}</ContextMenuTrigger>
            <ContextMenuContent>
                <ContextMenuItem variant={"destructive"}
                                 className={"cursor-pointer"}
                                 onClick={() => deleteDevice(id)}
                >
                    Delete
                </ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
    )
}
