export interface Budget {
  id: string;
  userId: string;
  name: string;
  amount: number;
  currency: string;
  period: "MONTHLY" | "YEARLY";
  services?: string; // JSON字符串
  startDate: Date;
  endDate?: Date;
  alertAt50: boolean;
  alertAt80: boolean;
  alertAt100: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBudgetRequest {
  name: string;
  amount: number;
  currency?: string;
  period: "MONTHLY" | "YEARLY";
  services?: string;
  startDate: string;
  endDate?: string;
  alertAt50?: boolean;
  alertAt80?: boolean;
  alertAt100?: boolean;
}

export interface UpdateBudgetRequest {
  name?: string;
  amount?: number;
  currency?: string;
  period?: "MONTHLY" | "YEARLY";
  services?: string;
  startDate?: string;
  endDate?: string;
  alertAt50?: boolean;
  alertAt80?: boolean;
  alertAt100?: boolean;
  isActive?: boolean;
}

export interface BudgetStatistics {
  totalBudgets: number;
  activeBudgets: number;
  totalAmount: number;
  monthlyAmount: number;
  yearlyAmount: number;
  averageAmount: number;
}
