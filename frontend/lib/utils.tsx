import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import {BadgeQuestionMark, HardDrive, MonitorSmartphone, Network, Server} from "lucide-react";
import {iconType} from "@/interfaces";
import React from "react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function IconSwitcher({iconType}: {iconType: iconType}): React.JSX.Element {
  switch (iconType) {
    case "Device":
      return  <span className={"p-2 bg-primary/25 w-10 h-10 rounded-md"}><MonitorSmartphone className={"text-primary"}/></span>
    case "Network":
      return  <span className={"p-2 bg-primary/25 w-10 h-10 rounded-md"}><Network className={"text-primary"}/></span>
    case "LXC":
      return  <span className={"p-2 bg-primary/25 w-10 h-10 rounded-md"}><HardDrive className={"text-primary"}/></span>
    case "VM":
      return  <span className={"p-2 bg-primary/25 w-10 h-10 rounded-md"}><Server className={"text-primary"}/></span>
    default:
      return <span className={"p-2 bg-primary/25 w-10 h-10 rounded-md"}><BadgeQuestionMark  className={"text-primary"}/></span>
  }
}
