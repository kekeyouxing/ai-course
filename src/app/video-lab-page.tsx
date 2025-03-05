import {ArrowLeftToLine, Edit, Plus, Trash, User, X} from "lucide-react";
import {Button} from "@/components/ui/button";
import AlertDialogDiv from "@/app/alert-dialog.tsx";
import {Card} from "@/components/ui/card.tsx";
import {Label} from "@radix-ui/react-label";
import {useState} from "react";

export default function VideoLabPage() {
    const users = [
        {name: "Adam", status: "Legacy", iconColor: "purple", isSystem: false},
        {name: "Nicole", status: "Legacy", iconColor: "orange", isSystem: false},
        {name: "Bill", status: "", iconColor: "blue", isSystem: false},
        {name: "Jessie", status: "Legacy", iconColor: "cyan", isSystem: false},
        {name: "Arnold", status: "Legacy", iconColor: "green", isSystem: true},
        {name: "Sam", status: "Legacy", iconColor: "red", isSystem: true},
        {name: "Glinda", status: "Legacy", iconColor: "pink", isSystem: true},
        {name: "Arnold", status: "Legacy", iconColor: "green", isSystem: true},
        {name: "Sam", status: "Legacy", iconColor: "red", isSystem: true},
        {name: "Glinda", status: "Legacy", iconColor: "pink", isSystem: true},
    ];
    type User = {
        name: string
        isSystem: boolean
        description?: string
        createTime?: string
        // ...其他字段
    }
    // const navigate = useNavigate()
    // const {setBreadcrumbs} = useBreadcrumb()

    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0 ">
            <Card className="p-6">
                <div className="flex justify-between items-start">
                    {/* 左侧内容区域 */}
                    <div className="space-y-2 flex-1">
                        <h3 className="text-lg font-semibold">分身库</h3>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                              已使用 3/10 个分身
                            </span>
                        </div>
                    </div>
                    {/* 右侧按钮区域 */}
                    <div className="flex flex-col items-end gap-4 ml-4">
                        <Button size="sm" className="pl-2 pr-3"
                                onClick={() => window.location.href = '/videolab/videoupload'}>
                            <Plus className="h-3 w-3"/>
                            添加分身
                        </Button>
                    </div>
                </div>
            </Card>
            <div>
                <div className="space-y-4 overflow-y-auto rounded-lg">{users.map((user, index) => (
                    <div key={index} className="flex items-center justify-between p-1 hover:bg-gray-100 cursor-pointer">
                        {/* 左侧图标和名称 */}
                        <div className="flex items-center space-x-2">
                            <User
                                size="24"
                                className="rounded-full"
                            />
                            <span className="font-semibold">{user.name}</span>
                        </div>

                        <div className="flex space-x-2">
                            <Label
                                className="bg-gray-100 rounded-full px-2 py-1 text-sm text-muted-foreground"
                            >
                                {user.isSystem ? "系统" : "自定义"}
                            </Label>

                            <Button variant="outline" size="sm" className="text-xs font-normal"
                                    onClick={() => setSelectedUser(user)}>
                                <ArrowLeftToLine/>查看
                            </Button>
                        </div>
                    </div>
                ))}
                </div>
                {selectedUser && (
                    <div
                        className="fixed right-0 top-0 h-screen w-[450px] bg-white shadow-lg border-l p-6 overflow-y-auto animate-in slide-in-from-right-8">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold">{selectedUser.name} 的详情</h3>
                            <X
                                className="cursor-pointer hover:bg-gray-100 rounded"
                                onClick={() => setSelectedUser(null)}
                            />
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-muted-foreground">分身信息</label>
                                <p className="mt-1">{selectedUser.description}</p>
                            </div>

                            <div>
                                <label className="text-sm text-muted-foreground">创建时间</label>
                                <p className="mt-1">{selectedUser.createTime}</p>
                            </div>
                        </div>
                        <div className="absolute bottom-4 right-4 flex gap-2">
                            {!selectedUser.isSystem && (
                                <Button variant="outline" size="sm" className="text-xs font-normal p-0.5">
                                    <Edit/>编辑
                                </Button>
                            )}
                            {!selectedUser.isSystem && (
                                <AlertDialogDiv
                                    buttonIcon={<Trash/>}
                                    buttonText="删除"
                                    title="确定删除？"
                                    description="每个分身人物价值10元，删除后将无法恢复，确定要删除吗？"
                                    confirmText="删除"
                                    cancelText="取消"
                                    onConfirm={() => console.log("退出登录")}
                                />
                            )}
                        </div>

                    </div>
                )}
            </div>

        </div>


    );
}
