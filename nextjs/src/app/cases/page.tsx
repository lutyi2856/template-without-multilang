import { redirect } from "next/navigation";

/**
 * /cases — редирект на архив работ /our-works
 */
export default function CasesPage() {
  redirect("/our-works");
}
