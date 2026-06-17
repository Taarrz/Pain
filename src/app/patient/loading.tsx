import { Spinner } from "@/components/Spinner";

export default function Loading() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-50">
      <Spinner label="กำลังโหลดแบบประเมิน..." />
    </main>
  );
}
