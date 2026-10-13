# দারুল হিকমাহ মডেল মাদ্রাসা — হিসাব ব্যবস্থাপনা সিস্টেম

একটি সম্পূর্ণ ওয়েব-ভিত্তিক সিস্টেম, যা মাদ্রাসার শিক্ষার্থী, বেতন, আয়-ব্যয় ও রিপোর্ট পরিচালনা করে।

---

## সূচিপত্র

1. সিস্টেম কী
2. প্রযুক্তি
3. আর্কিটেকচার
4. ফোল্ডার স্ট্রাকচার
5. ডেটাবেজ
6. প্রমাণীকরণ
7. ব্যবহারকারীর ভূমিকা
8. মূল ফিচার
9. ডেটা প্রবাহ
10. সেটআপ ও ডিপ্লয়
11. রক্ষণাবেক্ষণ
12. সমস্যা সমাধান

---

## ১. সিস্টেম কী

এই সিস্টেম একটি মাদ্রাসার জন্য তৈরি একটি পূর্ণাঙ্গ হিসাব ব্যবস্থাপনা ওয়েব অ্যাপ। এতে আছে:

- শিক্ষার্থী ব্যবস্থাপনা
- মাসিক বেতন আদায় ও রসিদ
- আয়-ব্যয় এন্ট্রি
- ড্যাশবোর্ড ও রিপোর্ট
- শিক্ষার্থী পোর্টাল
- Admin সেটিংস, অডিট লগ, নোটিফিকেশন

**মূল বৈশিষ্ট্য:** সম্পূর্ণ ফ্রি, বাংলা ইন্টারফেস, মোবাইল-ফ্রেন্ডলি, নিরাপদ।

---

## ২. প্রযুক্তি

| প্রযুক্তি | কেন ব্যবহার |
|-----------|-------------|
| **Next.js 14** | ওয়েব ফ্রেমওয়ার্ক (App Router) |
| **React 18** | UI |
| **TypeScript** | টাইপ-নিরাপদ কোড |
| **Tailwind CSS** | ডিজাইন |
| **Supabase** | ডেটাবেজ (PostgreSQL) + Authentication |
| **Vercel** | হোস্টিং |
| **GitHub** | কোড সংরক্ষণ |
| **Gmail SMTP** | যাচাই ইমেইল পাঠানো |
| **GitHub Actions** | Keep-alive ও ব্যাকআপ |

---

## ৩. আর্কিটেকচার

```
ব্রাউজার (ব্যবহারকারী)
        ↓
Next.js App (Vercel-এ হোস্টেড)
        ↓
Supabase (ডেটাবেজ + Authentication + API)
        ↓
PostgreSQL (ডেটাবেজ ইঞ্জিন)
```

**সহজভাবে:** ব্যবহারকারী ব্রাউজারে একটি পেজ খোলে। পেজটি Vercel-এ চলে। Vercel-এর সার্ভার Supabase-এর সাথে কথা বলে। Supabase PostgreSQL-এ ডেটা রাখে/পড়ে।

---

## ৪. ফোল্ডার স্ট্রাকচার

```
darul-hikmah-accounting/
├── app/                       # সব পেজ ও লেআউট
│   ├── layout.tsx             # মূল HTML কাঠামো
│   ├── globals.css            # সাধারণ স্টাইল
│   ├── page.tsx               # হোম পেজ (লগইনে পাঠায়)
│   ├── login/page.tsx         # লগইন পেজ
│   ├── register/page.tsx      # নিবন্ধন পেজ
│   ├── auth/callback/route.ts # ইমেইল যাচাইয়ের পর
│   ├── dashboard/             # মূল সিস্টেম
│   │   ├── layout.tsx         # হেডার ও মেনু (সব পেজে)
│   │   ├── page.tsx           # ড্যাশবোর্ড
│   │   ├── notification-bell.tsx
│   │   ├── theme-toggle.tsx
│   │   ├── mobile-menu.tsx
│   │   ├── students/          # শিক্ষার্থী ব্যবস্থাপনা
│   │   │   ├── page.tsx
│   │   │   ├── student-list.tsx
│   │   │   ├── student-form.tsx
│   │   │   └── [id]/          # প্রোফাইল পেজ
│   │   ├── fees/              # বেতন আদায়
│   │   │   ├── page.tsx
│   │   │   ├── fees-client.tsx
│   │   │   └── receipt/       # PDF রসিদ
│   │   ├── fees-status/       # Paid/Unpaid তালিকা
│   │   ├── income/            # আয়
│   │   ├── expenses/          # ব্যয়
│   │   └── reports/           # রিপোর্ট (৪ ট্যাব)
│   ├── admin/                 # Admin-এর জন্য
│   │   ├── users/             # কর্মচারী ব্যবস্থাপনা
│   │   ├── audit-logs/        # অডিট লগ
│   │   ├── closed-months/     # মাস বন্ধ
│   │   ├── clear-data/        # ডেটা মুছুন
│   │   └── settings/          # সেটিংস
│   └── student/               # শিক্ষার্থী পোর্টাল
│       ├── page.tsx           # নাম সিলেক্ট
│       └── view/              # প্রোফাইল ও বেতনের ইতিহাস
├── lib/
│   ├── supabase/              # Supabase সংযোগ
│   │   ├── client.ts          # ব্রাউজারের জন্য
│   │   ├── server.ts          # সার্ভারের জন্য
│   │   └── middleware.ts      # সেশন যাচাই
│   └── number-to-bangla-words.ts # সংখ্যা থেকে কথায়
├── middleware.ts              # মূল middleware
├── tailwind.config.js
├── postcss.config.js
├── package.json
├── tsconfig.json
└── .env.local.example
```

---

## ৫. ডেটাবেজ

### টেবিলসমূহ

| টেবিল | কী রাখে |
|--------|---------|
| `profiles` | ব্যবহারকারীর নাম, role, Hold অবস্থা |
| `students` | শিক্ষার্থীর সব তথ্য |
| `fee_payments` | বেতন আদায়ের রেকর্ড |
| `monthly_fees` | মাসিক প্রাপ্য বেতনের রেকর্ড |
| `income_categories` | আয়ের খাত |
| `expense_categories` | ব্যয়ের খাত |
| `incomes` | আয়ের এন্ট্রি |
| `expenses` | ব্যয়ের এন্ট্রি |
| `audit_logs` | কে কী পরিবর্তন করল |
| `closed_months` | কোন মাস বন্ধ করা হয়েছে |
| `notification_reads` | নোটিফিকেশন পড়া হয়েছে কি না |
| `keep_alive` | GitHub Actions থেকে daily ping |
| `app_settings` | সিস্টেম সেটিংস |

### View (দেখার সুবিধার্থে)

| View | কেন |
|------|------|
| `student_public` | শিক্ষার্থী পোর্টালে নাম দেখানোর জন্য |
| `fee_payments_public` | বেতনের তথ্য দেখানোর জন্য |
| `fee_payments_detail` | বিস্তারিত বেতন তথ্য |
| `transactions_all` | আয় ও ব্যয় একসাথে |

### গুরুত্বপূর্ণ ফাংশন

| ফাংশন | কাজ |
|--------|------|
| `handle_new_user()` | নতুন ব্যবহারকারী সাইনআপ করলে `profiles`-এ রেকর্ড তৈরি |
| `get_my_role()` | বর্তমান ব্যবহারকারীর role ফেরত দেয় (RLS recursion এড়াতে) |
| `is_month_closed()` | মাস বন্ধ কি না চেক করে |
| `prevent_closed_month_*()` | বন্ধ মাসে পরিবর্তন ব্লক করে |
| `log_audit()` | অডিট লগ লেখে |

### মাস বন্ধ সিস্টেম

`closed_months` টেবিলে কোন মাস বন্ধ করা হয়েছে তা রাখা হয়। তিনটি trigger (`fee_payments`, `incomes`, `expenses`) বন্ধ মাসে কোনো পরিবর্তন ব্লক করে।

---

## ৬. প্রমাণীকরণ

### দুই ধরনের ব্যবহারকারী

**১. কর্মচারী (Admin, Accountant, Viewer)**
- ইমেইল + পাসওয়ার্ড দিয়ে লগইন
- Supabase Auth ব্যবহৃত
- ইমেইল যাচাই বাধ্যতামূলক
- Admin অনুমোদনের পর Role নির্ধারণ

**২. শিক্ষার্থী (পোর্টাল)**
- লগইন নেই
- শ্রেণি → নাম সিলেক্ট → অভিভাবকের ফোনের শেষ ৪ ডিজিট যাচাই
- ব্রাউজারের `localStorage`-এ সেভ হয়
- পরেরবার সরাসরি প্রোফাইল দেখায়

### সেশন ব্যবস্থাপনা

- **কর্মচারী:** কুকি-ভিত্তিক (Supabase Auth)
- **শিক্ষার্থী:** `localStorage` (`student_portal_ids`)

### ইমেইল যাচাই

- Supabase Auth + Gmail SMTP
- নতুন ব্যবহারকারী নিবন্ধন করলে ইমেইলে যাচাই লিংক যায়
- লিংকে ক্লিক করলে ইমেইল যাচাই হয়

---

## ৭. ব্যবহারকারীর ভূমিকা

| Role | কী করতে পারে |
|------|--------------|
| **Admin** | সব — শিক্ষার্থী, বেতন, আয়-ব্যয়, সেটিংস, ব্যবহারকারী, রিপোর্ট |
| **Accountant** | শিক্ষার্থী, বেতন, আয়-ব্যয়, রিপোর্ট (সেটিংস/ব্যবহারকারী ছাড়া) |
| **Viewer** | শুধু দেখা — ড্যাশবোর্ড, Paid/Unpaid, রিপোর্ট |
| **Pending** | কিছুই না — Admin অনুমোদনের অপেক্ষায় |
| **Student** | শুধু নিজের প্রোফাইল ও বেতনের ইতিহাস |

### Role-ভিত্তিক অ্যাক্সেস

- `middleware.ts` — লগইন যাচাই
- `layout.tsx` — Role অনুযায়ী মেনু দেখায়
- RLS policy — ডেটাবেজ লেভেলে সুরক্ষা

---

## ৮. মূল ফিচার

### শিক্ষার্থী ব্যবস্থাপনা
- নতুন যোগ, সম্পাদনা, ডিলিট
- শ্রেণিভিত্তিক ফিল্টার, সার্চ
- প্রোফাইল পেজে বেতনের পূর্ণ ইতিহাস
- PDF/Print (কলাম নির্বাচনসহ)

### বেতন আদায়
- মাসভিত্তিক এন্ট্রি
- আংশিক পেমেন্ট সাপোর্ট
- স্বয়ংক্রিয় রসিদ নম্বর (যেমন `R-202610-123456`)
- রসিদ PDF (কথায় টাকার পরিমাণ)

### Paid/Unpaid তালিকা
- Paid, Unpaid, Partial আলাদা
- মাস, বছর, শ্রেণি, স্ট্যাটাস ফিল্টার
- বিস্তারিত পপ-আপ
- Print/PDF

### আয়-ব্যয়
- খাতভিত্তিক এন্ট্রি
- পেমেন্ট পদ্ধতি: নগদ, বিকাশ, নগদ (Nagad), ব্যাংক

### রিপোর্ট
- চারটি ট্যাব: বেতন, আয়-ব্যয়, লেনদেন, শিক্ষার্থী
- রসিদ নম্বর সার্চ
- Date range ফিল্টার
- Print/PDF

### Admin সিস্টেম
- সাইনআপ চালু/বন্ধ
- পোর্টাল চালু/বন্ধ
- কর্মচারী Role পরিবর্তন, Hold, ডিলিট
- অডিট লগ
- মাস বন্ধ (লক)
- সব ডেটা মুছুন

### নোটিফিকেশন
- বেল আইকনে unread সংখ্যা
- ৫ ধরনের: বকেয়া, নতুন ভর্তি, আজকের আদায়, Hold কর্মচারী, ছাড়
- "পড়া হয়েছে" চিহ্নিত

### শিক্ষার্থী পোর্টাল
- শ্রেণি → নাম → ফোন যাচাই
- প্রোফাইল ও বেতনের ইতিহাস
- বকেয়া নোটিফিকেশন
- Print/PDF

---

## ৯. ডেটা প্রবাহ

### শিক্ষার্থী যোগ করার সময়

```
Admin ফর্ম পূরণ করে Submit
        ↓
Supabase-এ insert
        ↓
Trigger: profile তৈরি হয় (pending)
        ↓
Dashboard-এ ফিরে আসে
        ↓
Audit log লেখা হয়
```

### বেতন আদায়ের সময়

```
Admin শিক্ষার্থী সিলেক্ট করে টাকা লেখে
        ↓
Supabase-এ fee_payments insert
        ↓
Trigger: মাস বন্ধ কি না চেক
        ↓
রসিদ নম্বর generate হয়
        ↓
Audit log লেখা হয়
        ↓
Paid/Unpaid তালিকায় আপডেট
```

### শিক্ষার্থী পোর্টালে

```
শিক্ষার্থী /student-এ যায়
        ↓
localStorage-এ সেভ করা ID আছে কি?
    ├── হ্যাঁ → সরাসরি /student/view
    └── না → শ্রেণি → নাম → ফোন যাচাই
                ↓
          localStorage-এ সেভ
                ↓
          /student/view-এ যাও
```

---

## ১০. সেটআপ ও ডিপ্লয়

### প্রয়োজন

- GitHub অ্যাকাউন্ট
- Vercel অ্যাকাউন্ট (Hobby — ফ্রি)
- Supabase অ্যাকাউন্ট (Free — ফ্রি)
- Gmail অ্যাকাউন্ট (App Password সহ)

### সেটআপ ধাপ

**১. Supabase:**
- নতুন প্রজেক্ট তৈরি (`darul-hikmah-accounting`)
- Region: South Asia (Mumbai) বা Southeast Asia (Singapore)
- SQL Editor-এ সব টেবিল তৈরি
- Gmail SMTP কনফিগার (Authentication → Emails → SMTP Settings)
- Email Verification চালু (Authentication → Sign In / Providers → Email → Confirm email)

**২. GitHub:**
- রিপোজিটরি তৈরি (`darul-hikmah-accounting`)
- কোড আপলোড
- Secrets যোগ:
  - `SUPABASE_URL` — Supabase Project URL
  - `SUPABASE_ANON_KEY` — anon key
  - `SUPABASE_DB_URL` — PostgreSQL connection string (Session Pooler)

**৩. Vercel:**
- GitHub রিপোজিটরি import
- Environment Variables:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Deploy

**৪. GitHub Actions:**
- `.github/workflows/keep-alive.yml` — daily ping
- `.github/workflows/backup.yml` — daily backup

### Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

---

## ১১. রক্ষণাবেক্ষণ

### প্রজেক্ট সচল রাখা

GitHub Actions প্রতিদিন Supabase-এ ping পাঠায় → ৭ দিন নিষ্ক্রিয় থাকার কারণে পজ হবে না।

### ব্যাকআপ

GitHub Actions প্রতিদিন `data.sql`, `schema.sql`, `roles.sql` তৈরি করে এবং GitHub-এ সংরক্ষণ করে।

### অডিট

সব পরিবর্তন `audit_logs` টেবিলে রেকর্ড হয়। Admin `/admin/audit-logs`-এ দেখতে পারে।

### মাস বন্ধ

মাস শেষে Admin `/admin/closed-months`-এ গিয়ে মাস বন্ধ করে → সেই মাসের হিসাব লক হয়।

### রিপোর্ট ও ডেটা যাচাই

মাসে একবার Supabase Dashboard → Table Editor → প্রতিটি টেবিল → Export CSV → নিজের কম্পিউটারে সংরক্ষণ।

---

## ১২. সমস্যা সমাধান

### ইমেইল যাচাই লিংক কাজ করে না

- Supabase → Authentication → URL Configuration
- Site URL: `https://darul-hikmah-accounting.vercel.app`
- Redirect URLs: `https://darul-hikmah-accounting.vercel.app/auth/callback`

### "Email rate limit exceeded"

- Gmail SMTP কনফিগার করলে সমাধান হবে
- Supabase Free-এ ডিফল্ট ইমেইল সীমা ঘন্টায় ২-৩টি

### পেজ লোড হয় না / সাদা পেজ

- Vercel → Deployments → Build Logs দেখো
- লাল লেখা খুঁজে বের করো

### Supabase প্রজেক্ট পজ হয়ে গেছে

- Supabase Dashboard → Restart Project
- ভবিষ্যতে এড়াতে GitHub Actions keep-alive চালু রাখো

### "infinite recursion detected in policy"

- `get_my_role()` ফাংশন ব্যবহার করে RLS policy ঠিক করো
- সরাসরি `profiles` টেবিল চেক করলে recursion হয়

### মাস বন্ধ করার পরও পরিবর্তন হয়

- তিনটি trigger আছে কি না চেক করো:
```sql
select tgname, tgrelid::regclass from pg_trigger where tgname like 'prevent_closed_month%';
```

---

## ডকুমেন্টেশন লেখক

**আবদুল্লাহ ফাহিম** — ডিজাইন ও ডেভেলপমেন্ট

---

## লাইসেন্স

এই সিস্টেম দারুল হিকমাহ মডেল মাদ্রাসার জন্য তৈরি। সকল অধিকার সংরক্ষিত।

---

## যোগাযোগ

- **ইমেইল:** darulhikmahphulpur2025@gmail.com
- **ফোন:** ০১৯৭০-৫১৭৫৬৬
- **ঠিকানা:** ইসলামী ব্যাংকের বিপরীত পার্শ্বে, ফুলপুর, ময়মনসিংহ
