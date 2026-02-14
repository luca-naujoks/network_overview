import {Card} from "@/components/ui/card";
import {DeviceCardProps} from "@/interfaces";
import {IconSwitcher} from "@/lib/utils";


export function DeviceCard({props}: { props: DeviceCardProps }) {
    return (
        <Card className={"p-4 gap-4"}>
            <div id={"device_head"} className={"flex"}>
                <IconSwitcher iconType={props.type}/>
                <div className={"flex flex-col mx-2"}>
                    <span>
                        {props.name}
                    </span>
                    <span className={"text-xs text-muted-foreground"}>
                        {props.type}
                    </span>
                </div>
                <span className={"w-fit h-fit p-1 ml-auto text-xs rounded-md " + (props.status == "online" ? "bg-green-400/50 text-green-400" : "bg-red-400/50 text-red-400")}>
                    {props.status}
                </span>
            </div>
            <p className={"flex justify-between text-xs"}>
                <span className={"text-muted-foreground"}>IP Address:</span>
                <span>{props.ipAddress}</span>
            </p>
            <p className={"flex justify-between text-xs"}>
                <span className={"text-muted-foreground"}>Service:</span>
                <span>{props.service}</span>
            </p>
            <p className={"flex justify-between text-xs"}>
                <span className={"text-muted-foreground"}>Port:</span>
                <span>{props.port}</span>
            </p>
            <p className={"flex justify-between text-xs"}>
                <span className={"text-muted-foreground"}>Domain:</span>
                <a href={""} className={"text-primary hover:underline"}>{props.domain}</a>
            </p>
            <span className={"mt-4 pt-4 border-t-2 border-sidebar-border text-xs text-muted-foreground"}>
                Last Checked {props.lastChecked}
            </span>
        </Card>
    )
}