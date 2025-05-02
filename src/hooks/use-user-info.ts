import { create } from 'zustand'
import { getUserInfo, UserInfoDTO } from '@/api/user'

interface UserInfoState {
  userInfo: UserInfoDTO | null;
  loading: boolean;
  
  // 操作方法
  fetchUserInfo: () => Promise<void>;
  
  // 便捷获取方法
  isLoggedIn: () => boolean;
  isMember: () => boolean;
  getMembershipInfo: () => {
    tier: string;
    endDate: string;
    active: boolean;
  };
  getResourceInfo: () => {
    memberVideoSeconds: number;
    memberTextChars: number;
    packageVideoSeconds: number;
    packageTextChars: number;
    totalVideoSeconds: number; // 会员 + 视频包总额度
    totalTextChars: number;    // 会员 + 视频包总额度
  };
}

export const useUserInfo = create<UserInfoState>((set, get) => ({
  userInfo: null,
  loading: false,
  
  // 获取用户信息
  fetchUserInfo: async () => {
    try {
      set({ loading: true });
      const userInfo = await getUserInfo();
      set({ userInfo, loading: false });
    } catch (error) {
      set({ loading: false });
    }
  },
  
  // 检查是否已登录
  isLoggedIn: () => {
    const { userInfo } = get();
    return !!userInfo && !!userInfo.userID;
  },
  
  // 检查是否是付费会员
  isMember: () => {
    const { userInfo } = get();
    return !!userInfo && userInfo.membershipActive;
  },
  
  // 获取会员信息
  getMembershipInfo: () => {
    const { userInfo } = get();
    return {
      tier: userInfo?.membershipTier || 'Free',
      endDate: userInfo?.membershipEnd || '',
      active: userInfo?.membershipActive || false
    };
  },
  
  // 获取资源信息
  getResourceInfo: () => {
    const { userInfo } = get();
    const memberVideoSeconds = userInfo?.memberVideoSeconds || 0;
    const memberTextChars = userInfo?.memberTextChars || 0;
    const packageVideoSeconds = userInfo?.packageVideoSeconds || 0;
    const packageTextChars = userInfo?.packageTextChars || 0;
    
    return {
      memberVideoSeconds,
      memberTextChars,
      packageVideoSeconds,
      packageTextChars,
      totalVideoSeconds: memberVideoSeconds + packageVideoSeconds,
      totalTextChars: memberTextChars + packageTextChars
    };
  },
})); 