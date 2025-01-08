import { Command, Code2, ScrollText, Wallet, Network } from "lucide-react";

export const guideCategories = [
  {
    name: "Getting Started",
    icon: Command,
    description: "Set up your development environment and understand Morph basics",
    slug: "getting-started"
  },
  {
    name: "Smart Contracts",
    icon: Code2,
    description: "Deploy and verify smart contracts on Morph L2",
    slug: "smart-contracts"
  },
  {
    name: "Contract Verification",
    icon: ScrollText,
    description: "Verify your contracts on Morph Explorer",
    slug: "verification"
  },
  {
    name: "Bridging Assets",
    icon: Wallet,
    description: "Bridge your assets to and from Morph L2",
    slug: "bridging"
  },
  {
    name: "Network & RPC",
    icon: Network,
    description: "Configure network settings and RPC endpoints",
    slug: "network"
  }
];

export function getGuideCategory(slug: string) {
  return guideCategories.find(category => category.slug === slug);
}