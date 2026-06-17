# Interview Cheatsheet — Pain Assessment App

โน้ตเตรียมตัวสำหรับคุยกับ interviewer · อ่านให้จบก่อนสัมภาษณ์

---

## 🎯 ภาพรวม (พูดได้ใน 30 วินาที)

> "ระบบประเมินความปวดสำหรับโรงพยาบาล มี 2 บทบาทคือผู้ป่วยและพยาบาล ผู้ป่วยประเมินความปวดผ่านแท็บเล็ตข้างเตียง พยาบาลรับการแจ้งเตือนแบบ realtime และดูสถิติย้อนหลังได้ ใช้ Next.js 16 + TypeScript + PostgreSQL"

---

## 🏗️ Architecture

```
┌────────────────┐    Server Action     ┌──────────────┐
│  หน้าผู้ป่วย    │ ───────────────────→ │  PostgreSQL  │
│  /patient      │   บันทึก pain_record  │  (Prisma 7)  │
└────────────────┘                      └──────────────┘
       │                                       ▲
       └──→ EventBus.emit ──┐                  │
                            ↓                  │ Server Components
                       ┌─────────┐             │ ดึงข้อมูลเริ่มต้น
                       │   SSE   │             │
                       │ /api/   │ ←───────────┤
                       │ alerts/ │             │
                       │ stream  │             │
                       └─────────┘             │
                            ↓                  │
                  ┌────────────────┐           │
                  │ หน้าพยาบาล      │ ──────────┘
                  │ /nurse          │
                  │ /nurse/stats    │
                  └────────────────┘
```

3 หน้า: `/patient` (ประเมิน) · `/nurse` (alerts realtime) · `/nurse/stats` (สถิติ)

---

## 🛠️ Stack ที่ใช้

| Layer | Tech | ทำไม |
|---|---|---|
| Framework | **Next.js 16** App Router | Server Components ลด JS bundle, Server Actions ไม่ต้องเขียน REST API แยก |
| Language | **TypeScript strict** | type-safe end-to-end (Prisma → Server → Client) |
| Database | **PostgreSQL 16** | rdbms มาตรฐาน, รองรับ native array column (`String[]`) |
| ORM | **Prisma 7** (driver adapter) | type-safe queries, migration management, schema-as-code |
| Styling | **Tailwind CSS 4** | utility-first, JIT, ไม่ต้องเขียน CSS เยอะ |
| Realtime | **Server-Sent Events** | ทางเดียว server→client (พอสำหรับ notification), native browser API, ง่ายกว่า WebSocket |
| Charts | **Recharts** | React-native, รองรับ composed chart (bar+line) |
| Auth | **bcryptjs + httpOnly cookie** | ไม่ใช้ library ใหญ่ — เพื่อแสดงให้เห็นว่าเข้าใจ session/cookie |

---

## 💡 5 ตัดสินใจสำคัญที่เล่าได้

### 1. ทำไม SSE ไม่ใช่ WebSocket?
**SSE เหมาะกับ pattern "server บอก client ฝ่ายเดียว"** (notification, feed, realtime update) — แอปเราพยาบาลแค่รับ alert จาก server ไม่ต้องส่งอะไรกลับ
- ✅ Native browser API (`EventSource`) — ไม่ต้องลง library
- ✅ Auto-reconnect by default
- ✅ ผ่าน HTTP/2 ปกติ ไม่มีปัญหา proxy/firewall
- ❌ ทางเดียว — ถ้าต้องการ chat ต้องใช้ WebSocket

### 2. ทำไม Server Components + Server Actions แทน REST API?
- ลด boilerplate — ไม่ต้องเขียน `/api/submit-pain` แล้ว fetch มาเอง
- Type-safe จาก server ถึง client ในไฟล์เดียว
- Progressive enhancement — form ทำงานได้แม้ JS ไม่โหลด
- Server Component query DB ได้ตรง ๆ ไม่ต้องผ่าน network roundtrip

### 3. ทำไม `String[]` ใน Postgres ไม่ใช่ join table?
- ลักษณะปวด/ตำแหน่ง/ปัจจัย เป็น **value list ที่ user เลือกเข้ามา** ไม่ใช่ entity ที่มี relation
- Postgres รองรับ array native — query ได้ปกติ
- Join table ในเคสนี้คือ over-engineering — เพิ่ม complexity ไม่เพิ่มประโยชน์
- ถ้าวันหลังต้องการ analytics (เช่น "ผู้ป่วยกี่คนปวดแบบไหน") — ก็ query `WHERE 'ปวดแสบร้อน' = ANY(characteristics)` ได้

### 4. ทำไม EventEmitter singleton (in-memory) แทน Postgres LISTEN/NOTIFY?
- **dev/single-instance: ง่ายและทำงานทันที** — ไม่ต้องตั้ง infra
- production multi-instance: ใช้ไม่ได้ — ต้องเปลี่ยนเป็น Postgres LISTEN/NOTIFY หรือ Redis pub/sub
- *นี่คือคำตอบที่ดูเป็น "เข้าใจ trade-off" — ระบุข้อจำกัดของตัวเอง + รู้วิธีแก้เมื่อ scale*

### 5. Mock auth → real bcrypt — ทำไมไม่ใช้ NextAuth/Clerk?
- ระบบโรงพยาบาลอยู่บนเครือข่ายภายใน — ไม่ต้องการ OAuth ภายนอก
- ทำเองเพื่อ **แสดงให้เห็นว่าเข้าใจ** session/cookie/bcrypt ไม่ใช่แค่เรียก library
- bcrypt มี automatic salt + slow hash → resistant ต่อ rainbow table

---

## ❓ คำถามที่ interviewer ชอบถาม + คำตอบสั้น ๆ

| Q | A สั้น ๆ ที่ใช้ตอบได้เลย |
|---|---|
| Server vs Client Component ต่างยังไง? | Server รันบน server, query DB ได้, ไม่มี state · Client รัน browser, มี `useState` + event handlers · Server เป็น default, ใส่ `"use client"` เพื่อข้าม boundary |
| ทำไม `cookies()` ต้อง await ใน Next 16? | Next 16 ทำ async APIs (`cookies`, `headers`, `params`) เพื่อให้ Next ตัดสินใจ stream ส่วนที่ static ก่อนได้ — ไม่ต้องรอ request-time data |
| httpOnly cookie กันอะไร? | กัน XSS — JavaScript ใน browser อ่าน cookie ไม่ได้ → script ฉีดเข้าไปขโมย session token ไม่ได้ |
| Prisma ดียังไง? | Schema เป็น single source of truth, generate TypeScript types อัตโนมัติ, migrate ผ่าน CLI ตาม versioning, query builder type-safe ทุก field |
| ทำไม `severityFor()` คำนวณตอน insert ไม่คำนวณตอน query? | คำนวณครั้งเดียว ไม่ซ้ำทุก query, query ใช้ index ตรง column ได้ (`WHERE severity = 'RED'`) — denormalize เพื่อ read performance |
| Race condition ตอน "รับเรื่อง" สองคนกดพร้อมกัน? | ใช้ `updateMany({ where: { id, status: 'PENDING' }})` → atomic update with condition · ถ้า status เป็น ACKNOWLEDGED แล้ว `count: 0` → กันได้ |
| SSE ถ้า server restart ละ? | EventSource auto-reconnect by default · ฝั่ง app ทำ `router.refresh()` ตอน reconnect เพื่อ resync state ที่อาจหายไประหว่างขาด |
| ถ้าใช้ Postgres ลำบาก scale ตรงไหน? | EventEmitter in-memory ใช้ได้แค่ instance เดียว → ถ้าหลาย instance ต้อง Postgres LISTEN/NOTIFY หรือ Redis pub/sub |
| ทำไมใช้ `useActionState` แทน `useTransition`? | `useActionState` คือ pattern ใหม่ React 19 สำหรับ form — return `[state, action, pending]` มี state จาก server ตอบกลับ (เช่น validation error) ในตัว · `useTransition` กว้างกว่า แต่ต้องจัดการ state เอง |
| ทำไมเลือก color severity GREEN/YELLOW/RED 3 ระดับ ทั้ง ๆ ที่ pain score มี 5 ระดับ? | 5 ระดับ (zone) สำหรับให้ผู้ป่วยมองเห็นง่าย, 3 ระดับ (severity) สำหรับ triage ของพยาบาล — workflow คลินิกใช้ traffic light 3 สีเป็นมาตรฐาน |

---

## 🔮 "ถ้ามีเวลาอีก จะทำอะไรเพิ่ม?"

คำตอบที่ดี — แสดงว่าคิดต่อยอด แต่รู้ว่าอะไรอยู่นอกสโคป:

1. **Test coverage** — Vitest สำหรับ unit (color zone logic, severity calc), Playwright สำหรับ E2E (submit → alert appears)
2. **Production realtime** — เปลี่ยน EventEmitter เป็น Postgres LISTEN/NOTIFY เพื่อ scale หลาย instance
3. **Audit log** — ใครเปิด/แก้ข้อมูลของใครเมื่อไหร่ (เพราะข้อมูลสุขภาพมี requirement ตาม PDPA)
4. **Pagination** ใน stats — ตอนนี้โหลด record ทุกตัวของผู้ป่วย ถ้านอนนาน 6 เดือนจะช้า
5. **Rate limit** ที่ login + submit assessment — กัน brute force / spam
6. **i18n** — ภาษาอังกฤษ/จีน สำหรับผู้ป่วยต่างชาติ
7. **Push notification** ผ่าน Web Push API → พยาบาลเดินอยู่ไกล terminal ก็เห็น

---

## 📁 โครงสร้างโปรเจกต์ (จำคร่าว ๆ)

```
src/
├── app/
│   ├── layout.tsx           # Root layout (font, metadata)
│   ├── page.tsx             # Home → redirect ตาม role
│   ├── globals.css          # Design tokens
│   ├── error.tsx            # Global error boundary
│   ├── loading.tsx          # Global loading
│   ├── login/               # /login page + form
│   ├── logout/route.ts      # Clear cookie + redirect
│   ├── patient/             # หน้าผู้ป่วย + components
│   ├── nurse/               # หน้าพยาบาล + stats + components
│   └── api/alerts/stream/   # SSE endpoint
├── lib/
│   ├── prisma.ts            # Prisma client singleton
│   ├── session.ts           # Cookie helpers
│   ├── dal.ts               # requireUser/Patient/Nurse (Data Access Layer)
│   ├── alert-bus.ts         # EventEmitter for SSE
│   ├── alert-serialize.ts   # DB → JSON-safe shape
│   ├── pain.ts              # Zones, severity, body locations
│   └── time.ts              # timeAgo()
├── components/
│   ├── TopBar.tsx           # Shared top navigation
│   └── Spinner.tsx          # Loading indicator
└── proxy.ts                 # Auth middleware (กัน unauth routes)

prisma/
├── schema.prisma            # 4 models + 3 enums
├── migrations/              # Versioned migrations
└── seed.ts                  # Demo data

docker-compose.yml           # Postgres ใน Docker (port 5433)
prisma.config.ts             # Prisma 7 config (URL + seed)
```

---

## 🎤 ตอนเปิดสัมภาษณ์ — สาธิตยังไง

**Demo flow ที่ดู smooth (เตรียมเปิดหน้าต่างทั้ง 2 ก่อน):**

1. **เปิด 2 browser windows** ข้าง ๆ กัน — ซ้าย incognito, ขวาปกติ
2. **ซ้าย:** login เป็น `patient2` → /patient
3. **ขวา:** login เป็น `nurse1` → /nurse (ชี้ว่ามี 2 alert ค้างจาก seed)
4. **ซ้าย:** เลือกคะแนน 8 (สีส้ม), เลือกลักษณะ "ปวดแปลบ", เลือก body map ที่เข่า, กดส่ง
5. **ขวา:** card ใหม่เด้งทันที — เน้นว่า "ไม่มี refresh, ไม่มี polling"
6. **ขวา:** กดรับเรื่อง → card หาย
7. **ขวา:** ไป /nurse/stats → เลือกผู้ป่วยที่เพิ่งส่ง → เห็นกราฟ + log

ระหว่าง demo พูด talking points เหล่านี้:
- "นี่คือ Server-Sent Events — server push ฝ่ายเดียว"
- "ใช้ Server Action ไม่ต้องเขียน REST API"
- "Prisma generate types ให้ครบจาก schema"
- "พยาบาลถ้ามีหลายคนเปิดพร้อมกัน ก็เห็นข้อมูลตรงกันหมด"
