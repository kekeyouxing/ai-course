""

import {BadgeCheck, ChevronsUpDown, CreditCard, LogOut, Clock, Text, User, FileText} from "lucide-react"

import {Avatar, AvatarFallback, AvatarImage,} from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,} from "@/components/ui/sidebar"
import { useAuth } from "@/hooks/use-auth"
import { useUserInfo } from "@/hooks/use-user-info"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

export function NavUser() {
    const {isMobile} = useSidebar()
    const {user, logout} = useAuth()
    const { 
        fetchUserInfo, 
        isMember, 
        getMembershipInfo, 
        getResourceInfo 
    } = useUserInfo()
    const navigate = useNavigate()

    useEffect(() => {
            fetchUserInfo()
    }, [fetchUserInfo])

    const membershipInfo = getMembershipInfo()
    const resourceInfo = getResourceInfo()

    // 将秒数转为时:分:秒格式显示
    const formatSeconds = (seconds: number) => {
        const hours = Math.floor(seconds / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)
        const remainingSeconds = seconds % 60
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
    }
    
    // 格式化字符数
    const formatChars = (chars: number) => {
        if (chars >= 10000) {
            return `${(chars / 10000).toFixed(1)}万`
        }
        return chars.toString()
    }

    // 将会员等级转换为中文显示
    const getTierName = (tier: string): string => {
        switch (tier) {
            case "Free":
                return "免费用户";
            case "Basic":
                return "基础会员";
            case "Advanced":
                return "高级会员";
            case "Super":
                return "超级会员";
            default:
                return tier;
        }
    }
    
    // 格式化日期显示
    const formatDate = (dateStr: string): string => {
        try {
            const date = new Date(dateStr);
            return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        } catch (e) {
            return dateStr;
        }
    }

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <Avatar className="h-8 w-8 rounded-lg">
                                <AvatarImage src={user?.avatar} alt={user?.name}/>
                                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold">{user?.name}</span>
                            </div>
                            <ChevronsUpDown className="ml-auto size-4"/>
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                        side={isMobile ? "bottom" : "right"}
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                <Avatar className="h-8 w-8 rounded-lg">
                                    <AvatarImage src={user?.avatar} alt={user?.name}/>
                                    <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">{user?.name}</span>
                                    {isMember() && (
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                            <BadgeCheck className="h-3 w-3 text-blue-500" />
                                            {getTierName(membershipInfo.tier)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator/>
                        
                        {/* 用户权益信息 */}
                        <DropdownMenuGroup>
                            <DropdownMenuItem className="flex flex-col items-start py-2">
                                <div className="font-medium text-sm mb-1 w-full flex items-center">
                                    <User className="h-4 w-4 mr-2 text-blue-500" />
                                    会员状态
                                </div>
                                <div className="text-xs px-2 w-full">
                                    {isMember() ? (
                                        <div className="bg-blue-50 p-2 rounded-md w-full">
                                            <p className="mb-1 flex justify-between items-center">
                                                <span className="text-gray-500">当前等级:</span>
                                                <span className="text-blue-600 font-medium flex items-center">
                                                    <BadgeCheck className="h-3 w-3 text-blue-500 mr-1" />
                                                    {getTierName(membershipInfo.tier)}
                                                </span>
                                            </p>
                                            <p className="flex justify-between items-center">
                                                <span className="text-gray-500">到期时间:</span>
                                                <span className="text-gray-700 font-medium">{formatDate(membershipInfo.endDate)}</span>
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="bg-blue-50 p-2 rounded-md w-full">
                                            <p className="flex justify-between items-center">
                                                <span className="text-gray-500">当前等级:</span>
                                                <span className="text-blue-600 font-medium flex items-center">
                                                    <BadgeCheck className="h-3 w-3 text-blue-500 mr-1" />
                                                    {getTierName("Free")}
                                                </span>
                                            </p>
                                            <p className="flex justify-between items-center">
                                                <span className="text-gray-500">到期时间:</span>
                                                <span className="text-gray-700 font-medium">{formatDate(membershipInfo.endDate || "")}</span>
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem className="flex flex-col items-start py-2">
                                <div className="font-medium text-sm mb-1 w-full flex items-center">
                                    <Clock className="h-4 w-4 mr-2 text-amber-500" />
                                    视频额度
                                </div>
                                <div className="text-xs px-2 w-full">
                                    <div className="bg-amber-50 p-2 rounded-md w-full">
                                        <div className="flex justify-between mb-1">
                                            <span className="text-gray-500">会员额度:</span>
                                            <span className="text-amber-700 font-medium">{formatSeconds(resourceInfo.memberVideoSeconds)}</span>
                                        </div>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-gray-500">套餐额度:</span>
                                            <span className="text-amber-700 font-medium">{formatSeconds(resourceInfo.packageVideoSeconds)}</span>
                                        </div>
                                        <div className="flex justify-between pt-1 border-t border-amber-200">
                                            <span className="text-gray-500 font-medium">总计:</span>
                                            <span className="text-amber-800 font-medium">{formatSeconds(resourceInfo.totalVideoSeconds)}</span>
                                        </div>
                                    </div>
                                </div>
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem className="flex flex-col items-start py-2">
                                <div className="font-medium text-sm mb-1 w-full flex items-center">
                                    <Text className="h-4 w-4 mr-2 text-green-500" />
                                    脚本额度
                                </div>
                                <div className="text-xs px-2 w-full">
                                    <div className="bg-green-50 p-2 rounded-md w-full">
                                        <div className="flex justify-between mb-1">
                                            <span className="text-gray-500">会员额度:</span>
                                            <span className="text-green-700 font-medium">{formatChars(resourceInfo.memberTextChars)} 字</span>
                                        </div>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-gray-500">套餐额度:</span>
                                            <span className="text-green-700 font-medium">{formatChars(resourceInfo.packageTextChars)} 字</span>
                                        </div>
                                        <div className="flex justify-between pt-1 border-t border-green-200">
                                            <span className="text-gray-500 font-medium">总计:</span>
                                            <span className="text-green-800 font-medium">{formatChars(resourceInfo.totalTextChars)} 字</span>
                                        </div>
                                    </div>
                                </div>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        
                        <DropdownMenuSeparator/>
                        <DropdownMenuGroup>
                            <DropdownMenuItem onClick={() => navigate('/orders')}>
                                <CreditCard className="h-4 w-4 mr-2"/>
                                账单
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate('/resource-logs')}>
                                <FileText className="h-4 w-4 mr-2"/>
                                使用记录
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator/>
                        <DropdownMenuItem onClick={logout}>
                            <LogOut className="h-4 w-4 mr-2"/>
                            退出登录
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
