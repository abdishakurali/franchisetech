import { DesignHardware } from "@/components/marketing/ClaudeMarketing";
import { ClaudeMarketingShellAuth } from "@/components/marketing/ClaudeMarketingShellAuth";

export const metadata = { title: "Echipamente — FranchiseTech", description: "Conectează echipamentele locale prin FiscalNet și lucrează din browser." };

export default function HardwarePage() {
  return <ClaudeMarketingShellAuth><DesignHardware /></ClaudeMarketingShellAuth>;
}
