import { redirect } from "next/navigation";
import { getUserFromCookie, getUserCredits } from "@/lib/auth";
import GenerateClient from "./GenerateClient";

export default async function GeneratePage() {
  const email = await getUserFromCookie();
  if (!email) {
    redirect("/login");
  }

  const credits = await getUserCredits(email);

  return <GenerateClient email={email} initialCredits={credits} />;
}