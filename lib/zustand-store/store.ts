import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { getCookie } from "@repo/auth";

// Define types for your data
interface UserData {
  id: number;
  email: string;
  name: string;
  phoneNumber: string;
  roleId: number;
  roleName: string;
  companyId: number;
  companyName: string;
  employeeId: number
}

interface UserDetailData {
  firstName: string;
  lastName: string;
  roleId: number;
  roleName: string;
  email: string;
  employeeId: number
  permissions: {
    name: string;
    id: number;
    submodule: {
      name: string;
      id: number;
      elements: {
        name: string;
        id: number;
        permissions: {
          name: string;
          id: number;
        }[];
      }[];
    }[];
  }[];
  companyDetails: {
    companyId: number;
    companyName: string;
    address: string;
    phoneNumber: string;
  };
}

interface AuthState {
  token: string | null;
  userData: UserData | null;
  userDetailsData: UserDetailData | null;
  basicEmployeeInfo: BasicEmployeeInfoProps | null
  setAuth: ({ token, userData }: { token: string; userData: UserData }) => void;
  setUserDetails: ({ userDetailsData }: { userDetailsData: UserDetailData }) => void;
  setBasicEmployeeInfo: ({ basicEmployeeInfo }: { basicEmployeeInfo: BasicEmployeeInfoProps }) => void;
  updateUserData: (updates: Partial<UserData>) => void;
  clearAuth: () => void;
}

// Create the Zustand store with persistence
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      userData: null,
      userDetailsData: null,
      basicEmployeeInfo: null,
      setAuth: ({ token, userData }: { token: string; userData: UserData }) =>
        set({ token, userData }),
      setUserDetails: ({ userDetailsData }: { userDetailsData: UserDetailData }) =>
        set({ userDetailsData }),
      setBasicEmployeeInfo: ({ basicEmployeeInfo }: { basicEmployeeInfo: BasicEmployeeInfoProps }) =>
        set({ basicEmployeeInfo }),
      updateUserData: (updates: Partial<UserData>) =>
        set((state) => ({
          userData: state.userData ? { ...state.userData, ...updates } : null,
        })),
      clearAuth: () => set({ token: null, userData: null, userDetailsData: null, basicEmployeeInfo: null }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ token: state.token, userData: state.userData }), // Persist only these fields
      onRehydrateStorage: () => (state) => {
        // Sync with cookie on rehydration
        const cookieData = getCookie({ name: String(process.env.NEXT_PUBLIC_USER_COOKIE) });
        
        if (cookieData) {
          console.log("cookie data debug:", cookieData.userData)
          state?.setAuth({
            token: cookieData.userData.token, userData:
            {
              companyId: cookieData.userData.companyId,
              companyName: cookieData.userData.companyName,
              email: "", employeeId: cookieData.userData.employeeId,
              id: 0, name: cookieData.userData.employeeName,
              phoneNumber: "", roleId: cookieData.userData.roleId, roleName: cookieData.userData.roleName
            }
          });
        }
      }
    }
  )
);