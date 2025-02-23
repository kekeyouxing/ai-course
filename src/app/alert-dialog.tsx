import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {Button} from "@/components/ui/button";
import {AlertTriangle} from "lucide-react";
import React from "react";

interface AlertDialogDivProps {
    buttonText: string;
    buttonIcon?: React.ReactNode; // Add icon prop
    title: string;
    description: string;
    cancelText?: string;
    confirmText?: string;
    onConfirm?: () => void;

}

export default function AlertDialogDiv({
                                           buttonIcon: icon = <AlertTriangle/>, // 🆕 默认图标
                                           buttonText = "Open Dialog",      // 🆕 默认按钮文字
                                           title = "Are you sure?",         // 🆕 默认标题
                                           description = "This action cannot be undone.", // 🆕 默认描述
                                           cancelText = "Cancel",           // 默认取消按钮
                                           confirmText = "Continue",        // 默认确认按钮
                                           onConfirm,
                                       }: AlertDialogDivProps) {
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button size="sm" className="text-xs font-normal p-0.5" variant="outline">{icon} {buttonText}</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>{cancelText}</AlertDialogCancel>
                    <AlertDialogAction onClick={onConfirm}>
                        {confirmText}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}