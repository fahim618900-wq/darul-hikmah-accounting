import type { SupabaseClient } from "@supabase/supabase-js";

export type FinancialTransaction = {
  id: number;
  source: "direct-income" | "fee-collection" | "expense";
  type: "income" | "expense";
  date: string;
  category: string | null;
  amount: number;
  ref_no: string | null;
  description: string | null;
  payment_method?: string | null;
  student_id?: number | null;
  student_name?: string | null;
};

export type FinancialTotals = {
  directIncome: number;
  feeIncome: number;
  totalIncome: number;
  totalExpense: number;
  balance: number;
};

type QueryResult<T> = { data: T[] | null; error: { message: string } | null };
type PagedQuery<T> = { range(from: number, to: number): PromiseLike<QueryResult<T>> };

/** Fetch every page instead of silently truncating financial records at 500/1000 rows. */
async function fetchAllRows<T>(makeQuery: (from: number, to: number) => PagedQuery<T>): Promise<T[]> {
  const all: T[] = [];
  const pageSize = 1000;
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await makeQuery(from, from + pageSize - 1);
    if (error) throw new Error(`Financial data query failed: ${error.message}`);
    const page = data ?? [];
    all.push(...page);
    if (page.length < pageSize) return all;
  }
}

function relationOne(value: any): any {
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

/** One canonical source for all non-deleted financial records. */
export async function getFinancialData(supabase: SupabaseClient) {
  const [incomeRows, expenseRows, feeRows] = await Promise.all([
    fetchAllRows<any>((from, to) =>
      (supabase as any).from("incomes")
        .select("id, amount, entry_date, category_id, student_id, payment_method, receipt_no, description, is_deleted, income_categories(name)")
        .or("is_deleted.eq.false,is_deleted.is.null")
        .is("deleted_at", null)
        .order("entry_date", { ascending: false })
        .range(from, to)
    ),
    fetchAllRows<any>((from, to) =>
      (supabase as any).from("expenses")
        .select("id, amount, entry_date, category_id, payment_method, voucher_no, description, is_deleted, expense_categories(name)")
        .or("is_deleted.eq.false,is_deleted.is.null")
        .is("deleted_at", null)
        .order("entry_date", { ascending: false })
        .range(from, to)
    ),
    fetchAllRows<any>((from, to) =>
      (supabase as any).from("fee_payments")
        .select("id, student_id, month, year, amount, payment_date, payment_method, receipt_no, note, is_deleted, students(name, class_name, roll)")
        .or("is_deleted.eq.false,is_deleted.is.null")
        .is("deleted_at", null)
        .order("payment_date", { ascending: false })
        .range(from, to)
    ),
  ]);

  const incomes = incomeRows.map((row: any) => ({
    ...row,
    income_categories: relationOne(row.income_categories),
  }));
  const expenses = expenseRows.map((row: any) => ({
    ...row,
    expense_categories: relationOne(row.expense_categories),
  }));
  const feePayments = feeRows.map((row: any) => ({
    ...row,
    students: relationOne(row.students),
  }));

  const transactions: FinancialTransaction[] = [
    ...incomes.map((row: any) => ({
      id: Number(row.id),
      source: "direct-income" as const,
      type: "income" as const,
      date: toDateKey(row.entry_date),
      category: row.income_categories?.name ?? "অন্যান্য",
      amount: Number(row.amount) || 0,
      ref_no: row.receipt_no ?? null,
      description: row.description ?? null,
      payment_method: row.payment_method ?? null,
      student_id: row.student_id ?? null,
    })),
    ...feePayments.map((row: any) => ({
      id: Number(row.id),
      source: "fee-collection" as const,
      type: "income" as const,
      date: toDateKey(row.payment_date),
      category: "শিক্ষার্থীদের বেতন/ফি",
      amount: Number(row.amount) || 0,
      ref_no: row.receipt_no ?? null,
      description: row.note || (row.students?.name ? `শিক্ষার্থী: ${row.students.name}` : "শিক্ষার্থীর ফি আদায়"),
      payment_method: row.payment_method ?? null,
      student_id: row.student_id ?? null,
      student_name: row.students?.name ?? null,
    })),
    ...expenses.map((row: any) => ({
      id: Number(row.id),
      source: "expense" as const,
      type: "expense" as const,
      date: toDateKey(row.entry_date),
      category: row.expense_categories?.name ?? "অন্যান্য",
      amount: Number(row.amount) || 0,
      ref_no: row.voucher_no ?? null,
      description: row.description ?? null,
      payment_method: row.payment_method ?? null,
    })),
  ].sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);

  return { incomes, expenses, feePayments, transactions };
}

/** Fee-payment queries shared by fee pages; exclude soft-deleted rows and fetch every page. */
export async function getFeePaymentsForMonth(supabase: SupabaseClient, month: number, year: number) {
  return fetchAllRows<any>((from, to) =>
    (supabase as any).from("fee_payments")
      .select("*")
      .eq("month", month)
      .eq("year", year)
      .or("is_deleted.eq.false,is_deleted.is.null")
      .is("deleted_at", null)
      .order("payment_date", { ascending: false })
      .range(from, to)
  );
}

export async function getFeePaymentsForDateRange(
  supabase: SupabaseClient,
  fromDate: string,
  toDate: string
) {
  return fetchAllRows<any>((from, to) =>
    (supabase as any).from("fee_payments")
      .select("*")
      .gte("payment_date", fromDate)
      .lte("payment_date", toDate)
      .or("is_deleted.eq.false,is_deleted.is.null")
      .is("deleted_at", null)
      .order("payment_date", { ascending: false })
      .range(from, to)
  );
}

/** Fetch payments allocated to fee-months inside an inclusive month/year period. */
export async function getFeePaymentsForFeeMonthRange(
  supabase: SupabaseClient,
  firstMonth: number,
  firstYear: number,
  lastMonth: number,
  lastYear: number
) {
  const firstPeriod = firstYear * 12 + firstMonth;
  const lastPeriod = lastYear * 12 + lastMonth;
  if (firstPeriod > lastPeriod) return [];
  const rows = await fetchAllRows<any>((from, to) =>
    (supabase as any).from("fee_payments")
      .select("*")
      .gte("year", firstYear)
      .lte("year", lastYear)
      .or("is_deleted.eq.false,is_deleted.is.null")
      .is("deleted_at", null)
      .order("year", { ascending: true })
      .order("month", { ascending: true })
      .order("payment_date", { ascending: false })
      .range(from, to)
  );
  return rows.filter((row) => {
    const period = Number(row.year) * 12 + Number(row.month);
    return period >= firstPeriod && period <= lastPeriod;
  });
}

/** Build local calendar dates without UTC conversion. */
export function todayDateKey(): string {
  return toDateKey(new Date());
}

export function lastDayOfMonth(year: number, month: number): string {
  const last = new Date(year, month, 0);
  return `${last.getFullYear()}-${String(last.getMonth() + 1).padStart(2, "0")}-${String(last.getDate()).padStart(2, "0")}`;
}

/** Date-only comparison: never parse YYYY-MM-DD as UTC and shift it to another local day. */
export function toDateKey(value: string | Date | null | undefined): string {
  if (!value) return "";
  if (value instanceof Date) {
    const y = value.getFullYear();
    const m = String(value.getMonth() + 1).padStart(2, "0");
    const d = String(value.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  const text = String(value);
  if (/^\d{4}-\d{2}-\d{2}/.test(text)) return text.slice(0, 10);
  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) return text;
  return toDateKey(parsed);
}

export function isDateInRange(value: string | Date | null | undefined, fromDate: string, toDate: string): boolean {
  const key = toDateKey(value);
  return Boolean(key && (!fromDate || key >= toDateKey(fromDate)) && (!toDate || key <= toDateKey(toDate)));
}

export function isDateInMonth(value: string | Date | null | undefined, month: number, year: number): boolean {
  const key = toDateKey(value);
  return key.length >= 10 && Number(key.slice(5, 7)) === month && Number(key.slice(0, 4)) === year;
}

export function sumAmounts<T extends { amount: number | string | null | undefined }>(rows: T[]): number {
  return rows.reduce((sum, row) => sum + (Number(row.amount) || 0), 0);
}

/** Single financial rule used by dashboards and reports: direct income + paid fee collections. */
export function calculateFinancialTotals(
  transactions: FinancialTransaction[],
  fromDate = "",
  toDate = ""
): FinancialTotals {
  const rows = transactions.filter((row) => isDateInRange(row.date, fromDate, toDate));
  const directIncome = sumAmounts(rows.filter((row) => row.source === "direct-income"));
  const feeIncome = sumAmounts(rows.filter((row) => row.source === "fee-collection"));
  const totalIncome = directIncome + feeIncome;
  const totalExpense = sumAmounts(rows.filter((row) => row.type === "expense"));
  return { directIncome, feeIncome, totalIncome, totalExpense, balance: totalIncome - totalExpense };
}
