import {Moon, Sun} from "lucide-react";

export function ThemeToggle({theme, themeSwitch}: { theme: string | undefined, themeSwitch: () => void }) {
    return (
        <button onClick={() => themeSwitch()}
                className={"flex items-center justify-center w-10 h-10 bg-card border border-sidebar-border rounded-md"}>{theme == "light" ?
            <Moon className={"text-chart-5"}/> : <Sun className={"text-yellow-500"}/>}
        </button>
    )
}