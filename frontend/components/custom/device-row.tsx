import {DeviceCardProps} from "@/interfaces";
import {Card} from "@/components/ui/card";
import {IconSwitcher} from "@/lib/utils";

export function DeviceRow({props}: { props: DeviceCardProps }) {
    return (
        <Card className={"w-full px-4 py-2"}>
            <div className={"grid grid-cols-5 w-full items-center text-sm"}>
                <div className={"flex"}>
                    <IconSwitcher iconType={props.type}/>
                    <div className={"flex flex-col mx-2"}>
                    <span className={"overflow-hidden text-ellipsis"}>
                        {props.name}
                    </span>
                        <span className={"text-xs text-muted-foreground"}>
                        {props.type}
                    </span>
                    </div>
                </div>
                <span>{props.ipAddress}</span>
                <span>{props.service}</span>
                <span>{props.port}</span>
                <a href={""} className={"text-primary hover:underline"}>{props.domain}</a>
            </div>
        </Card>
    )
}